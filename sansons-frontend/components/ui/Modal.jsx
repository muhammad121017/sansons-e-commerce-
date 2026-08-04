"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { modalPop, fadeIn } from "@/lib/motion";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="absolute inset-0 bg-ink/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={modalPop}
            initial="hidden"
            animate="show"
            exit="exit"
            className={`relative z-10 w-full ${maxWidth} bg-paper rounded-md shadow-lift p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4">
              {title && <h2 className="font-display text-xl">{title}</h2>}
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1 text-ink2 hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
