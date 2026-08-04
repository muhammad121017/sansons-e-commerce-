"use client";

import { Bell, Search } from "lucide-react";

export function AdminTopbar({ title, actions }) {
  return (
    <div className="flex items-center justify-between px-8 py-5 border-b border-line bg-paper sticky top-0 z-10">
      <h1 className="font-display text-2xl">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink2" />
          <input
            placeholder="Search admin…"
            className="pl-9 pr-3 py-2 text-sm border border-line rounded-sm bg-canvas outline-none focus:border-forest w-56"
          />
        </div>
        <button aria-label="Notifications" className="p-2 hover:bg-canvas2 rounded-sm">
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
