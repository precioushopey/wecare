import type { ReactNode } from "react";

import { AssessmentProvider } from "@/features/assessment/AssessmentContext";
import { AuthProvider } from "@/features/auth/AuthContext";
import { CartProvider } from "@/features/cart/CartContext";

/** App-wide client state. Mounted inside the router tree by RootLayout. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AssessmentProvider>
        <CartProvider>{children}</CartProvider>
      </AssessmentProvider>
    </AuthProvider>
  );
}
