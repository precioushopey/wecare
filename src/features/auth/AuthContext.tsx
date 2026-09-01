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
 * MOCK auth — no backend. `signIn` accepts any email and stores a local
 * session so the dashboard flow is demonstrable. Replace with a real
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

function clearSessionScopedStores() {
  try {
    for (const key of SESSION_SCOPED_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

export interface AuthUser {
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Changes for every distinct account; used to remount user-scoped state. */
  sessionKey: string;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<AuthUser, "name" | "phone">>) => void;
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
        email: parsed.email,
        name: parsed.name ?? parsed.email,
        phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
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

  const signIn = useCallback((email: string, name?: string) => {
    const trimmed = email.trim();
    setUser((prev) => {
      // A different account signing in on the same browser must not inherit
      // the previous user's assessment / cart / orders / follow-up.
      if (prev && prev.email.toLowerCase() !== trimmed.toLowerCase()) {
        clearSessionScopedStores();
      }
      return { email: trimmed, name: name?.trim() || nameFromEmail(trimmed) };
    });
    track(AnalyticsEvent.login);
  }, []);

  const signOut = useCallback(() => {
    clearSessionScopedStores();
    setUser(null);
    track(AnalyticsEvent.logout);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<AuthUser, "name" | "phone">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        if (typeof next.name === "string") next.name = next.name.trim();
        if (typeof next.phone === "string") {
          const p = next.phone.trim();
          next.phone = p === "" ? undefined : p;
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
      sessionKey: user?.email.toLowerCase() ?? "anon",
      signIn,
      signOut,
      updateProfile,
    }),
    [user, signIn, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
