"use client";

import { CartProvider } from "@/lib/context/CartContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import VisitorTracker from "@/components/common/VisitorTracker";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ToastProvider>
            <VisitorTracker />
            {children}
          </ToastProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
