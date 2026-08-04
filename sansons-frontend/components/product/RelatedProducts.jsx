"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import ProductCard from "./ProductCard";

export function RelatedProducts({ title, products }) {
  if (!products?.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 border-t border-line">
      <h2 className="font-display text-2xl mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export function RecentlyViewedRail({ items }) {
  if (!items?.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 border-t border-line">
      <h2 className="font-display text-2xl mb-6">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {items.map((p) => (
          <Link key={p.id} href={`/product/${p.slug}`} className="shrink-0 w-40 group">
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-canvas2">
              <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <p className="text-sm mt-2 line-clamp-1">{p.name}</p>
            <p className="text-xs font-mono text-ink2">{formatCurrency(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
