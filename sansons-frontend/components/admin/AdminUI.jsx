"use client";

import { Bell, Search, User } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export function AdminTopbar({ title, actions }) {
  const { user } = useAuth();
  
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email || "Admin User";
    
  const roleLabel = user?.role ? user.role.toUpperCase() : "ADMIN";

  return (
    <div className="flex items-center justify-between px-8 py-5 border-b border-line bg-paper sticky top-0 z-10">
      <div>
        <h1 className="font-display text-2xl">{title}</h1>
        <p className="text-xs text-ink2 mt-0.5 flex items-center gap-1.5">
          <User size={13} className="text-forest" />
          <span>Welcome, <span className="font-semibold text-ink">{displayName}</span></span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-forest/10 text-forest border border-forest/20">
            {roleLabel}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button aria-label="Notifications" className="p-2 hover:bg-canvas2 rounded-sm text-ink2">
          <Bell size={18} />
        </button>
        {actions}
      </div>
    </div>
  );
}

const TONE_CLASSES = {
  forest: "bg-forest/10 text-forest",
  wine: "bg-wine/10 text-wine",
  brass: "bg-brass/10 text-brass",
};

export function StatCard({ icon: Icon, label, value, trend, tone = "forest" }) {
  return (
    <div className="border border-line rounded-md p-5 bg-paper">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-sm ${TONE_CLASSES[tone] || TONE_CLASSES.forest}`}>
          <Icon size={18} />
        </div>
        {trend && <span className="text-xs text-forest">{trend}</span>}
      </div>
      <p className="font-display text-3xl">{value}</p>
      <p className="text-sm text-ink2 mt-1">{label}</p>
    </div>
  );
}
