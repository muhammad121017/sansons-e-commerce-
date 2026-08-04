"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export default function TrustBadges({ badges }) {
  return (
    <section className="border-y border-line bg-paper">
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8"
      >
        {badges.map((badge) => {
          const Icon = Icons[badge.icon] || Icons.ShieldCheck;
          return (
            <motion.div variants={fadeUp} key={badge.id} className="flex flex-col items-center text-center gap-2">
              <Icon size={26} className="text-forest" />
              <p className="text-sm font-medium">{badge.title}</p>
              <p className="text-xs text-ink2">{badge.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
