"use client";

import { useAuth } from "@/lib/context/AuthContext";
import AdminSidebar from "@/components/admin/Sidebar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/lib/context/ToastContext";

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, login, logout, hydrated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(form);
    setLoading(false);
    if (res.success) {
      showToast("Access Granted. Welcome to the Admin Portal.", "success");
    } else {
      showToast(res.message || "Invalid email or password.", "error");
    }
  };

  // ── 1. Waiting for localStorage to hydrate ────────────────────────────────
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-ink2 tracking-widest uppercase">Loading Portal…</p>
        </div>
      </div>
    );
  }

  // ── 2. Not logged in ──────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-canvas px-6">
        <div className="w-full max-w-md bg-paper border border-line p-8 rounded-md shadow-soft">
          <div className="text-center mb-8">
            <h2 className="font-display text-4xl tracking-tight text-forest mb-1.5">Sansons</h2>
            <p className="text-xs uppercase tracking-widest text-ink2">Admin Portal</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Admin Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
                placeholder="admin@sansons.com"
              />
            </label>

            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Password</span>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
                placeholder="••••••••"
              />
            </label>

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
              {loading ? "Authenticating…" : "Sign In to Admin"}
            </Button>
          </form>
        </div>
        <Link href="/" className="text-xs text-ink2 underline mt-6 hover:text-forest transition-colors">
          Back to Storefront
        </Link>
      </div>
    );
  }

  // ── 3. Role Authorization Check ───────────────────────────────────────────
  const isAuthorized =
    user?.role === "admin" ||
    user?.role === "seller" ||
    (user?.role && user?.role !== "purchaser") ||
    (Array.isArray(user?.allowed_modules) && user?.allowed_modules.length > 0);

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-canvas text-center px-6">
        <h1 className="font-display text-4xl mb-3">Admin Access Required</h1>
        <p className="text-ink2 mb-4 max-w-md">
          This account does not have staff or module access privileges.
        </p>
        <p className="text-xs text-wine mb-6 bg-wine/10 px-3 py-1.5 rounded-sm">
          Logged in as: <span className="font-mono font-semibold">{user?.email}</span>
          {" "}(Role: <span className="font-mono font-bold">{user?.role}</span>)
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={logout} variant="primary">Log Out &amp; Sign In as Staff</Button>
          <Button as={Link} href="/" variant="outline">Back to Store</Button>
        </div>
      </div>
    );
  }


  // ── 4. Authenticated admin/seller — render the portal ────────────────────
  return (
    <div className="flex bg-canvas min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
