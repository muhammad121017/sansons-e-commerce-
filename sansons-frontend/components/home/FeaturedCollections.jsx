"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export default function FeaturedCollections({ collections }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">Curated</p>
        <h2 className="font-display text-3xl sm:text-4xl">Featured Collections</h2>
      </div>
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid sm:grid-cols-3 gap-5"
      >
        {collections.map((col) => (
          <motion.div variants={fadeUp} key={col.id}>
            <Link href={`/shop?collection=${col.slug}`} className="group block">
              <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-canvas2">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-ink/30 group-hover:bg-ink/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <h3 className="font-display text-2xl text-canvas mb-2">{col.name}</h3>
                  <p className="text-canvas/80 text-sm mb-4">{col.description}</p>
                  <span className="text-canvas text-xs uppercase tracking-wider border-b border-canvas pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
