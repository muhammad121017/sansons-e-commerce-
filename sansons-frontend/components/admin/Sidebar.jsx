"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  FileText,
  Settings,
  ExternalLink,
  LogOut,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/context/AuthContext";

const NAV = [
  { href: "/admin", module: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", module: "products", label: "Products", icon: Package },
  { href: "/admin/categories", module: "categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", module: "orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", module: "users", label: "Users & Access", icon: Users },
  { href: "/admin/visitor-logs", module: "audit", label: "Visitor & Logins", icon: Activity },
  { href: "/admin/coupons", module: "coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/cms", module: "cms", label: "Content (CMS)", icon: FileText },
  { href: "/admin/audit-logs", module: "audit", label: "Actions Audit Log", icon: ShieldAlert },
  { href: "/admin/settings", module: "settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === "admin" || user?.is_superuser;

  const allowedModsList = (() => {
    if (isSuperAdmin) return null; // Full access for Super Admin
    
    let rawMods = user?.allowed_modules || [];
    if (typeof rawMods === "string") {
      try { rawMods = JSON.parse(rawMods); } catch (e) { rawMods = [rawMods]; }
    }
    
    if (!Array.isArray(rawMods)) rawMods = [];
    const normalized = rawMods.map((m) => String(m).toLowerCase().trim());
    
    // Default fallback for seller if allowed_modules is empty
    if (normalized.length === 0 && user?.role === "seller") {
      return ["dashboard", "products", "orders", "categories"];
    }
    return normalized;
  })();

  const filteredNav = NAV.filter((item) => {
    if (isSuperAdmin) return true;
    if (!allowedModsList) return false;
    return allowedModsList.includes(item.module.toLowerCase());
  });

  const handleLogout = () => {
    logout();
    if (showToast) showToast("Logged out of Admin Portal", "info");
    router.push("/account/login");
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email || "Staff User";

  return (
    <aside className="w-52 shrink-0 bg-ink text-canvas min-h-screen flex flex-col">
      <div className="px-5 py-4 border-b border-canvas/10">
        <p className="font-display text-lg font-bold">Sansons</p>
        <p className="text-[11px] text-emerald-400 mt-0.5 font-medium truncate">
          Logged in as <span className="font-bold">{displayName}</span>
        </p>
        <p className="text-[9px] text-canvas/50 uppercase tracking-widest font-mono">
          {user?.role ? `${user.role.toUpperCase()} PORTAL` : "ADMIN PORTAL"}
        </p>
      </div>
      <nav className="flex-1 py-3 px-2.5 space-y-0.5">
        {filteredNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs transition-colors ${
                active ? "bg-canvas text-ink font-medium" : "text-canvas/80 hover:bg-canvas/10"
              }`}
            >
              <item.icon size={15} /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2.5 border-t border-canvas/10 space-y-0.5">
        <Link href="/" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-xs text-canvas/70 hover:bg-canvas/10 transition-colors">
          <ExternalLink size={15} /> View Storefront
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-xs text-wine-light hover:bg-wine/20 transition-colors text-left font-medium"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}
