"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export default function BestSellers({ products }) {
  if (!products?.length) return null;
  return (
    <section className="bg-canvas2 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">Customer Favorites</p>
            <h2 className="font-display text-3xl sm:text-4xl">Best Sellers</h2>
          </div>
          <Link href="/shop?sort=best-selling" className="text-sm underline hover:text-forest hidden sm:inline">
            View all
          </Link>
        </div>
        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"
        >
          {products.slice(0, 4).map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
