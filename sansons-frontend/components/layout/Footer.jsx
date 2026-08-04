"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { getFooterContent } from "@/lib/services/cmsService";

const SOCIAL_ICON = { Instagram, Pinterest: Instagram, TikTok: Twitter, Facebook, Twitter };

export default function Footer() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    getFooterContent().then(setContent);
  }, []);

  if (!content) return null;

  return (
    <footer className="bg-ink text-canvas mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-2">
          <p className="font-display text-2xl mb-3">
            Sansons
          </p>
          <p className="text-canvas/60 text-sm max-w-xs leading-relaxed">
            Considered goods, made by hand. Built for a decade of use, not a season of trend.
          </p>
          <div className="flex gap-3 mt-5">
            {content.social.map((s) => {
              const Icon = SOCIAL_ICON[s.platform] || Instagram;
              return (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="p-2 rounded-full border border-canvas/20 hover:border-brassLight hover:text-brassLight transition-colors"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>

        {content.columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs uppercase tracking-wider text-canvas/50 mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-canvas/80 hover:text-brassLight transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs uppercase tracking-wider text-canvas/50 mb-4">Contact</p>
          <ul className="space-y-2.5 text-sm text-canvas/80">
            <li>{content.contact.email}</li>
            <li>{content.contact.phone}</li>
            <li>{content.contact.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-canvas/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-canvas/50">
          <p>© {new Date().getFullYear()} Sansons. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/pages/privacy" className="hover:text-brassLight">Privacy</Link>
            <Link href="/pages/terms" className="hover:text-brassLight">Terms</Link>
            <Link href="/admin" className="hover:text-brassLight">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
