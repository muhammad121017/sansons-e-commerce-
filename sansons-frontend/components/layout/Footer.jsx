"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin, MessageSquare, Globe, Youtube, Linkedin } from "lucide-react";
import { getFooterContent } from "@/lib/services/cmsService";

const SOCIAL_ICON = {
  Instagram,
  Facebook,
  Twitter,
  WhatsApp: MessageSquare,
  TikTok: Globe,
  YouTube: Youtube,
  Youtube: Youtube,
  LinkedIn: Linkedin,
  Linkedin: Linkedin,
  Pinterest: Instagram,
};

const DEFAULT_FOOTER = {
  description: "Considered goods, made by hand. Built for a decade of use, not a season of trend.",
  contact: {
    email: "concierge@sansons.com",
    phone: "+92 300 1234567",
    address: "Sansons Main Atelier, Lahore, Pakistan",
  },
  social: [
    { platform: "Instagram", href: "https://instagram.com" },
    { platform: "Facebook", href: "https://facebook.com" },
    { platform: "Twitter", href: "https://twitter.com" },
    { platform: "WhatsApp", href: "https://wa.me/15550192" },
  ],
  columns: [
    {
      title: "Shop",
      links: [
        { label: "New Arrivals", href: "/shop?filter=new" },
        { label: "Best Sellers", href: "/shop?sort=best-selling" },
        { label: "All Products", href: "/shop" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact Us", href: "/pages/contact" },
        { label: "FAQ", href: "/pages/faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/pages/about" },
      ],
    },
  ],
};

export default function Footer() {
  const [content, setContent] = useState(DEFAULT_FOOTER);

  useEffect(() => {
    getFooterContent().then((res) => {
      if (res && typeof res === "object") {
        setContent({
          description: res.description || DEFAULT_FOOTER.description,
          contact: {
            email: res.contact?.email || DEFAULT_FOOTER.contact.email,
            phone: res.contact?.phone || DEFAULT_FOOTER.contact.phone,
            address: res.contact?.address || DEFAULT_FOOTER.contact.address,
          },
          social: Array.isArray(res.social) && res.social.length > 0 ? res.social : DEFAULT_FOOTER.social,
          columns: Array.isArray(res.columns) && res.columns.length > 0 ? res.columns : DEFAULT_FOOTER.columns,
        });
      }
    });
  }, []);

  return (
    <footer className="bg-ink text-canvas mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl mb-3">
            Sansons
          </p>
          <p className="text-canvas/60 text-sm max-w-xs leading-relaxed">
            {content.description}
          </p>
          <div className="flex gap-3 mt-5 flex-wrap">
            {Array.isArray(content.social) && content.social.map((s, idx) => {
              const Icon = SOCIAL_ICON[s.platform] || Globe;
              return (
                <a
                  key={s.platform || idx}
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

        {Array.isArray(content.columns) && content.columns.map((col, idx) => (
          <div key={col.title || idx}>
            <p className="text-xs uppercase tracking-wider text-canvas/50 mb-4 font-semibold">{col.title}</p>
            <ul className="space-y-2.5">
              {Array.isArray(col.links) && col.links.map((link, lIdx) => (
                <li key={link.label || lIdx}>
                  <Link href={link.href} className="text-sm text-canvas/80 hover:text-brassLight transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs uppercase tracking-wider text-canvas/50 mb-4 font-semibold">Contact Us</p>
          <ul className="space-y-3 text-sm text-canvas/80">
            {content.contact?.email && (
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-brassLight shrink-0" />
                <a href={`mailto:${content.contact.email}`} className="hover:text-brassLight transition-colors break-all">
                  {content.contact.email}
                </a>
              </li>
            )}
            {content.contact?.phone && (
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-brassLight shrink-0" />
                <a href={`tel:${content.contact.phone}`} className="hover:text-brassLight transition-colors">
                  {content.contact.phone}
                </a>
              </li>
            )}
            {content.contact?.address && (
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-brassLight shrink-0 mt-0.5" />
                <span>{content.contact.address}</span>
              </li>
            )}
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
