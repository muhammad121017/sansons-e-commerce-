"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { dropdownFade } from "@/lib/motion";

export default function MegaMenu({ item, onClose }) {
  return (
    <motion.div
      variants={dropdownFade}
      initial="hidden"
      animate="show"
      exit="exit"
      className="absolute left-0 top-full w-full bg-paper border-t border-line shadow-lift z-50"
      onMouseEnter={() => {}}
      onMouseLeave={onClose}

    >
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-4 gap-10">
        {item.columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs uppercase tracking-wider text-ink2 mb-3">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="text-sm text-ink hover:text-forest transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {item.featuredImage && (
          <Link href={item.featuredHref} onClick={onClose} className="group relative rounded-md overflow-hidden">
            <div className="relative aspect-[4/5]">
              <Image
                src={item.featuredImage}
                alt={item.featuredLabel}
                fill
                className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            </div>
            <p className="absolute bottom-4 left-4 text-canvas font-display text-lg">{item.featuredLabel}</p>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
