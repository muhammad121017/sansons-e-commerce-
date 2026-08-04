"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export default function TestimonialsSection({ testimonials }) {
  return (
    <section className="bg-canvas2 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">Customer Reviews</p>
          <h2 className="font-display text-3xl sm:text-4xl">What People Are Saying</h2>
        </div>
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid sm:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => {
            const name = t.name || t.author || t.purchaser_name || "Verified Customer";
            const quote = t.quote || t.content || t.comment || "Exceptional quality and incredible service.";
            const avatar = t.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80";
            return (
              <motion.div variants={fadeUp} key={t.id || name} className="bg-paper rounded-md p-6 relative">
                <Quote size={22} className="text-brass mb-3" />
                <p className="text-sm text-ink leading-relaxed mb-4">{quote}</p>
                <StarRating rating={t.rating || 5} showCount={false} />
                <div className="flex items-center gap-3 mt-4">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-canvas2 shrink-0">
                    <Image src={avatar} alt={name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-ink2">{t.role || "Verified Buyer"}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

        </motion.div>
      </div>
    </section>
  );
}
