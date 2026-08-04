"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function AnnouncementBar({ content }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!content?.messages?.length) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % content.messages.length);
    }, 4000);
    return () => clearInterval(id);
  }, [content]);

  if (!content?.enabled) return null;

  return (
    <div className="bg-ink text-canvas text-xs">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-center gap-2 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="tracking-wide text-center"
          >
            {content.messages[index]}
            {content.linkLabel && (
              <Link href={content.linkHref} className="ml-2 underline underline-offset-2 hover:text-brassLight">
                {content.linkLabel}
              </Link>
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
