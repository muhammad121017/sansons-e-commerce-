"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export default function WhyChooseUs({ items }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">Why Choose Us</p>
        <h2 className="font-display text-3xl sm:text-4xl">The Sansons Standard</h2>
      </div>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8"
      >
        {items.map((item) => {
          const Icon = Icons[item.icon] || Icons.Gem;
          return (
            <motion.div variants={fadeUp} key={item.id} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-forest/10 text-forest mb-4">
                <Icon size={24} />
              </div>
              <h3 className="font-medium mb-1.5">{item.title}</h3>
              <p className="text-sm text-ink2 leading-relaxed">{item.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
