"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Settings, LogOut } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useAuth } from "@/lib/context/AuthContext";

const NAV = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountShell({ title, children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Account" }]} />
      <div className="flex flex-col md:flex-row gap-10 mt-3">
        <aside className="w-full md:w-56 shrink-0">
          <p className="text-sm text-ink2 mb-4">Signed in as<br /><span className="text-ink font-medium">{user?.email || "Guest"}</span></p>
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm ${
                  pathname === item.href ? "bg-ink text-canvas" : "hover:bg-canvas2"
                }`}
              >
                <item.icon size={16} /> {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm text-wine hover:bg-wine/10 w-full"
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </aside>
        <div className="flex-1">
          <h1 className="font-display text-3xl mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
