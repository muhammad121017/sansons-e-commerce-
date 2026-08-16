"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { getCategories } from "@/lib/services/cmsService";

export default function FeaturedCategories({ categories: initialCategories }) {
  const [items, setItems] = useState(initialCategories || []);

  useEffect(() => {
    getCategories().then((data) => {
      if (data && data.length > 0) {
        setItems(data);
      }
    });
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 sm:py-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brass mb-1 font-semibold">Shop by Category</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">Featured Categories</h2>
        </div>
        <Link href="/shop" className="text-xs uppercase tracking-wider font-semibold underline hover:text-forest hidden sm:inline">
          View all
        </Link>
      </div>
      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4"
      >
        {items.map((cat) => (
          <motion.div
            key={cat.id || cat.slug}
            variants={fadeUp}
            whileHover={{ scale: 1.04, y: -4 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
          >
            <Link href={`/shop?category=${cat.slug}`} className="group block">
              <div className="relative aspect-[1/1] rounded-lg overflow-hidden bg-canvas2 shadow-sm border border-line/40">
                <Image
                  src={cat.image || "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80"}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-112"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-canvas font-display text-sm font-semibold line-clamp-1">{cat.name}</p>
                  <p className="text-canvas/70 text-[10px] uppercase font-mono tracking-wider">{cat.productCount || 0} items</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
