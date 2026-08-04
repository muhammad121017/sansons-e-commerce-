"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Heart, MapPin } from "lucide-react";
import AccountShell from "@/components/layout/AccountShell";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { getOrdersByEmail } from "@/lib/services/orderService";

export default function AccountPage() {
  const { user, isAuthenticated, hydrated } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (user?.email) getOrdersByEmail(user.email).then((o) => setOrderCount(o.length));
  }, [user]);

  if (hydrated && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-3">You're not signed in</h1>
        <p className="text-ink2 mb-6">Sign in to view your orders, addresses, and saved items.</p>
        <div className="flex gap-3 justify-center">
          <Button as={Link} href="/account/login">Sign In</Button>
          <Button as={Link} href="/account/register" variant="outline">Create Account</Button>
        </div>
      </div>
    );
  }

  return (
    <AccountShell title={`Welcome back, ${user?.name || "there"}`}>
      <div className="grid sm:grid-cols-3 gap-5">
        <StatCard icon={Package} label="Orders" value={orderCount} href="/account/orders" />
        <StatCard icon={Heart} label="Wishlist Items" value={wishlistCount} href="/wishlist" />
        <StatCard icon={MapPin} label="Saved Addresses" value={1} href="/account/addresses" />
      </div>
    </AccountShell>
  );
}

function StatCard({ icon: Icon, label, value, href }) {
  return (
    <Link href={href} className="border border-line rounded-md p-6 hover:border-forest transition-colors">
      <Icon size={22} className="text-forest mb-3" />
      <p className="font-display text-3xl">{value}</p>
      <p className="text-sm text-ink2">{label}</p>
    </Link>
  );
}
