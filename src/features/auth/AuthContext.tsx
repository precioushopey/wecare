import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { AnalyticsEvent, track } from "@/lib/analytics";

/**
 * MOCK auth — no backend. `signIn` (checkout: email + SMS-verified phone) and
 * `signInWithPhone` (the /login order-tracking screen: an SMS code, no
 * password) store a local session so the dashboard flow is demonstrable. There
 * is no account lookup: a phone sign-in starts an empty session, because a real
 * lookup (phone -> account -> orders) needs the backend. Replace with a real
 * auth provider (see spec Section 4 / open question on auth backend).
 */

const STORAGE_KEY = "wecare.auth";

/**
 * User-scoped local stores that must NOT leak between accounts on a shared
 * browser. Cleared on sign-out and when a different email signs in. Language
 * and theme are deliberately excluded — they are device preferences.
 */
const SESSION_SCOPED_KEYS = [
  "wecare.assessment",
  "wecare.cart",
  "wecare.orders",
  "wecare.followup",
  "wecare.review",
] as const;

/** Shipping addresses live in sessionStorage only (never localStorage) — see
 *  src/features/orders/orders.ts. Cleared here too on sign-out / account switch. */
const SESSION_STORAGE_KEYS = ["wecare.order-addresses"] as const;

function clearSessionScopedStores() {
  try {
    for (const key of SESSION_SCOPED_KEYS) {
      window.localStorage.removeItem(key);
    }
    for (const key of SESSION_STORAGE_KEYS) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

/** A saved contact/delivery address on the profile (mock auth — lives only in
 *  this browser's `wecare.auth`). Present only once a street has been entered. */
export interface ProfileAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

/** Editable profile fields — shared by `updateProfile`'s patch type. */
type ProfilePatch = Partial<
  Pick<AuthUser, "name" | "email" | "phone" | "phoneVerified" | "avatarUrl" | "address">
>;

export interface AuthUser {
  /** Stable identity of this account — set at sign-in (the lower-cased email, or
   *  `tel:<phone>` for a phone sign-in) and never changed by profile edits, so
   *  editing the phone or adding an email later does not remount user-scoped
   *  state. Drives `sessionKey` and the account-switch check. */
  accountKey: string;
  /** Empty for an account that signed in by phone and hasn't given an email. */
  name: string;
  email: string;
  phone?: string;
  /** `phone` was confirmed by an SMS code at checkout (changes-matrix,
   *  2026-09-24). Cleared whenever the number is edited, so a changed number is
   *  never presented as verified. Mock for now — see `PHONE_VERIFICATION_LIVE`. */
  phoneVerified?: boolean;
  address?: ProfileAddress;
  /** Data URL of a self-chosen profile photo, resized client-side before it
   *  is stored (mock auth — lives only in this browser's `wecare.auth`). */
  avatarUrl?: string;
}

function parseAddress(value: unknown): ProfileAddress | undefined {
  if (!value || typeof value !== "object") return undefined;
  const a = value as Record<string, unknown>;
  const street = typeof a.street === "string" ? a.street.trim() : "";
  if (!street) return undefined;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  return {
    street,
    postalCode: str(a.postalCode),
    city: str(a.city),
    country: str(a.country),
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Changes for every distinct account; used to remount user-scoped state. */
  sessionKey: string;
  /** `verifiedPhone` is a number the caller has just confirmed by SMS; it is
   *  stored on the profile as verified. */
  signIn: (email: string, name?: string, verifiedPhone?: string) => void;
  /** /login: a number just confirmed by an SMS code. No email, no password. */
  signInWithPhone: (verifiedPhone: string) => void;
  signOut: () => void;
  updateProfile: (patch: ProfilePatch) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function load(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (parsed && typeof parsed.email === "string") {
      return {
        // Older stored sessions predate `accountKey`: they were keyed by email.
        accountKey:
          typeof parsed.accountKey === "string" && parsed.accountKey
            ? parsed.accountKey
            : parsed.email.toLowerCase(),
        email: parsed.email,
        name: parsed.name ?? parsed.email,
        phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
        phoneVerified:
          parsed.phoneVerified === true && typeof parsed.phone === "string"
            ? true
            : undefined,
        address: parseAddress(parsed.address),
        avatarUrl:
          typeof parsed.avatarUrl === "string" && parsed.avatarUrl
            ? parsed.avatarUrl
            : undefined,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[.\-_]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(load);

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [user]);

  const signIn = useCallback((email: string, name?: string, verifiedPhone?: string) => {
    const trimmed = email.trim();
    const accountKey = trimmed.toLowerCase();
    setUser((prev) => {
      // A different account signing in on the same browser must not inherit
      // the previous user's assessment / cart / orders / follow-up.
      if (prev && prev.accountKey !== accountKey) {
        clearSessionScopedStores();
      }
      return {
        accountKey,
        email: trimmed,
        name: name?.trim() || nameFromEmail(trimmed),
        ...(verifiedPhone ? { phone: verifiedPhone, phoneVerified: true } : {}),
      };
    });
    track(AnalyticsEvent.login);
  }, []);

  const signInWithPhone = useCallback((verifiedPhone: string) => {
    const accountKey = `tel:${verifiedPhone}`;
    setUser((prev) => {
      if (prev && prev.accountKey !== accountKey) {
        clearSessionScopedStores();
      }
      // No name or email is known yet: they arrive with the first order.
      return {
        accountKey,
        email: "",
        name: "",
        phone: verifiedPhone,
        phoneVerified: true,
      };
    });
    track(AnalyticsEvent.login);
  }, []);

  const signOut = useCallback(() => {
    clearSessionScopedStores();
    setUser(null);
    track(AnalyticsEvent.logout);
  }, []);

  const updateProfile = useCallback(
    (patch: ProfilePatch) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        if (typeof next.name === "string") next.name = next.name.trim();
        if (typeof next.email === "string") next.email = next.email.trim();
        if (typeof next.phone === "string") {
          const p = next.phone.trim();
          next.phone = p === "" ? undefined : p;
        }
        // A number that changed (or was cleared) without an explicit verified
        // flag is no longer the one that was confirmed by SMS.
        if (
          !next.phone ||
          ("phone" in patch && !("phoneVerified" in patch) && next.phone !== prev.phone)
        ) {
          next.phoneVerified = undefined;
        }
        if ("address" in patch) {
          // Empty street ⇒ no address on file (see parseAddress).
          next.address = parseAddress(patch.address);
        }
        if (typeof next.avatarUrl === "string" && next.avatarUrl === "") {
          next.avatarUrl = undefined;
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      sessionKey: user?.accountKey ?? "anon",
      signIn,
      signInWithPhone,
      signOut,
      updateProfile,
    }),
    [user, signIn, signInWithPhone, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
