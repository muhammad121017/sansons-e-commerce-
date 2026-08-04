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
} from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";

const NAV = [
  { href: "/admin", module: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", module: "products", label: "Products", icon: Package },
  { href: "/admin/categories", module: "categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", module: "orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", module: "users", label: "Users & Access", icon: Users },
  { href: "/admin/coupons", module: "coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/cms", module: "cms", label: "Content (CMS)", icon: FileText },
  { href: "/admin/audit-logs", module: "audit", label: "Actions Audit Log", icon: ShieldAlert },
  { href: "/admin/settings", module: "settings", label: "Settings", icon: Settings },
];


export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [allowedModules, setAllowedModules] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    try {
      const authStr = localStorage.getItem("sansons_auth");
      if (authStr) {
        const auth = JSON.parse(authStr);
        setRole(auth.user?.role || auth.role);
        setAllowedModules(auth.user?.allowed_modules || auth.allowed_modules || []);
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("sansons_auth");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      if (showToast) showToast("Logged out of Admin Portal", "info");
    } catch (e) {}
    router.push("/login");
  };

  const filteredNav = NAV.filter((item) => {
    if (!role || role === "admin") return true;
    if (!allowedModules || allowedModules.length === 0) return true;
    return allowedModules.includes(item.module);
  });

  return (
    <aside className="w-64 shrink-0 bg-ink text-canvas min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-canvas/10">
        <p className="font-display text-xl">Sansons</p>
        <p className="text-xs text-canvas/50 mt-0.5 uppercase tracking-wider">
          Admin Portal {role && `(${role})`}
        </p>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {filteredNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                active ? "bg-canvas text-ink font-medium" : "text-canvas/80 hover:bg-canvas/10"
              }`}
            >
              <item.icon size={16} /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-canvas/10 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-canvas/70 hover:bg-canvas/10 transition-colors">
          <ExternalLink size={16} /> View Storefront
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-wine-light hover:bg-wine/20 transition-colors text-left font-medium"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
