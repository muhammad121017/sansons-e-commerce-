"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { fetchBestSellers } from "@/lib/services/productService";

export default function BestSellers({ products: initialProducts }) {
  const [items, setItems] = useState(initialProducts || []);

  useEffect(() => {
    fetchBestSellers().then((data) => {
      if (data && data.length > 0) {
        setItems(data);
      }
    });
  }, []);

  if (!items?.length) return null;
  return (
    <section className="bg-canvas2 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brass mb-1 font-semibold">Customer Favorites</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">Best Sellers</h2>
          </div>
          <Link href="/shop?sort=best-selling" className="text-xs uppercase tracking-wider font-semibold underline hover:text-forest hidden sm:inline">
            View all
          </Link>
        </div>
        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {items.slice(0, 4).map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
