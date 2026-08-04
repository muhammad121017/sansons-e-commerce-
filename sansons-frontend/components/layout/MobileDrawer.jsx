"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X, ChevronRight, User, Heart, ShoppingBag } from "lucide-react";
import { drawerSlideLeft, fadeIn } from "@/lib/motion";

export default function MobileDrawer({ open, onClose, navigation }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="absolute inset-0 bg-ink/50"
            onClick={onClose}
          />
          <motion.aside
            variants={drawerSlideLeft}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute left-0 top-0 h-full w-full max-w-xs bg-paper shadow-lift flex flex-col"
            role="dialog"
            aria-label="Site navigation"
          >
            <div className="flex items-center justify-between px-5 py-5 border-b border-line">
              <span className="font-display text-lg">Menu</span>
              <button onClick={onClose} aria-label="Close menu" className="p-1 text-ink2 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {navigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-3.5 border-b border-line text-sm"
                >
                  {item.label}
                  <ChevronRight size={16} className="text-ink2" />
                </Link>
              ))}
            </nav>
            <div className="border-t border-line px-5 py-4 flex justify-between text-ink2">
              <Link href="/account" onClick={onClose} className="flex flex-col items-center gap-1 text-xs">
                <User size={18} /> Account
              </Link>
              <Link href="/wishlist" onClick={onClose} className="flex flex-col items-center gap-1 text-xs">
                <Heart size={18} /> Wishlist
              </Link>
              <Link href="/cart" onClick={onClose} className="flex flex-col items-center gap-1 text-xs">
                <ShoppingBag size={18} /> Bag
              </Link>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
