"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import Button from "@/components/ui/Button";

export default function BrandStory({ story }) {
  return (
    <section id="brand-story" className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid md:grid-cols-2 gap-12 items-center"
      >
        <motion.div variants={fadeUp} className="relative aspect-[4/5] rounded-md overflow-hidden bg-canvas2 order-2 md:order-1">
          <Image src={story.image} alt="" fill className="object-cover" />
        </motion.div>
        <motion.div variants={fadeUp} className="order-1 md:order-2">
          <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">{story.eyebrow}</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-5">{story.title}</h2>
          <p className="text-ink2 leading-relaxed mb-7">{story.body}</p>
          <Button as={Link} href={story.ctaHref} variant="outline">
            {story.ctaLabel}
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
