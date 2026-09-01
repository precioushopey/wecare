import type { ReactNode } from "react";

import { AssessmentProvider } from "@/features/assessment/AssessmentContext";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import { CartProvider } from "@/features/cart/CartContext";

/**
 * Assessment + cart hold user-scoped state mirrored to localStorage. Keying
 * them by the auth session forces a remount (and a fresh `load()`) whenever the
 * account changes, so a sign-out / different sign-in starts from clean state
 * rather than inheriting the previous user's answers or cart.
 */
function SessionScopedProviders({ children }: { children: ReactNode }) {
  const { sessionKey } = useAuth();
  return (
    <AssessmentProvider key={sessionKey}>
      <CartProvider key={sessionKey}>{children}</CartProvider>
    </AssessmentProvider>
  );
}

/** App-wide client state. Mounted inside the router tree by RootLayout. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SessionScopedProviders>{children}</SessionScopedProviders>
    </AuthProvider>
  );
}
