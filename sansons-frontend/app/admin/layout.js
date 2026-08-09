"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import AdminSidebar from "@/components/admin/Sidebar";
import Button from "@/components/ui/Button";

const ROUTE_MODULE_MAP = {
  "/admin": "dashboard",
  "/admin/products": "products",
  "/admin/categories": "categories",
  "/admin/orders": "orders",
  "/admin/customers": "users",
  "/admin/visitor-logs": "audit",
  "/admin/coupons": "coupons",
  "/admin/cms": "cms",
  "/admin/audit-logs": "audit",
  "/admin/settings": "settings",
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
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
  const isSuperAdmin = user?.role === "admin" || user?.is_superuser;
  const isAuthorized =
    isSuperAdmin ||
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

  // ── 4. Module Route Permission Check for Sellers ─────────────────────────
  if (!isSuperAdmin) {
    const requiredModule = ROUTE_MODULE_MAP[pathname] || "dashboard";
    let rawMods = user?.allowed_modules || [];
    if (typeof rawMods === "string") {
      try { rawMods = JSON.parse(rawMods); } catch (e) { rawMods = [rawMods]; }
    }
    if (!Array.isArray(rawMods)) rawMods = [];
    const normalizedMods = rawMods.map((m) => String(m).toLowerCase().trim());
    
    // Default fallback for sellers if allowed_modules is empty
    if (normalizedMods.length === 0 && user?.role === "seller") {
      normalizedMods.push("dashboard", "products", "orders", "categories");
    }

    if (!normalizedMods.includes(requiredModule)) {
      return (
        <div className="flex bg-canvas min-h-screen">
          <AdminSidebar />
          <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-8 max-w-md shadow-sm">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-rose-900 mb-2">Module Access Restricted</h2>
              <p className="text-xs text-rose-700 mb-6 leading-relaxed">
                Your store account (<span className="font-semibold">{user?.email}</span>) does not have permission to access the <span className="font-bold uppercase">{requiredModule}</span> module.
              </p>
              <Button as={Link} href="/admin" variant="primary" size="sm">
                Return to Authorized Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // ── 5. Authenticated admin/seller — render the portal ────────────────────
  return (
    <div className="flex bg-canvas min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
