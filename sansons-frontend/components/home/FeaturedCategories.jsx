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
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">Shop by Category</p>
          <h2 className="font-display text-3xl sm:text-4xl">Featured Categories</h2>
        </div>
        <Link href="/shop" className="text-sm underline hover:text-forest hidden sm:inline">
          View all
        </Link>
      </div>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {items.map((cat) => (
          <motion.div key={cat.id || cat.slug} variants={fadeUp}>
            <Link href={`/shop?category=${cat.slug}`} className="group block">
              <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-canvas2">
                <Image
                  src={cat.image || "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80"}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-premium group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-canvas font-display text-lg">{cat.name}</p>
                  <p className="text-canvas/70 text-xs">{cat.productCount} pieces</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
