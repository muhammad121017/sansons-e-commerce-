"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ArrowRight, Eye } from "lucide-react";
import { fetchBestSellers } from "@/lib/services/productService";
import { formatCurrency } from "@/lib/utils";

// Fallback Featured Products
const DEFAULT_HERO_PRODUCTS = [
  {
    id: "prod-1",
    slug: "luxury-automatic-chronograph-watch",
    title: "Luxury Automatic Chronograph Watch",
    price: 450,
    compareAtPrice: 650,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
    link: "/product/luxury-automatic-chronograph-watch",
    category: "Horology",
    rating: 4.9
  },
  {
    id: "prod-2",
    slug: "iphone-17-pro",
    title: "iPhone 17 Pro Max Titanium",
    price: 1200,
    compareAtPrice: 1400,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
    link: "/product/iphone-17-pro",
    category: "Tech & Mobile",
    rating: 5.0
  },
  {
    id: "prod-3",
    slug: "handcrafted-leather-weekend-bag",
    title: "Artisan Full-Grain Leather Duffle",
    price: 280,
    compareAtPrice: 350,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop",
    link: "/product/handcrafted-leather-weekend-bag",
    category: "Leathercraft",
    rating: 4.9
  },
  {
    id: "prod-4",
    slug: "wireless-noise-canceling-headphones",
    title: "Acoustic Noise-Canceling Headphones",
    price: 349,
    compareAtPrice: 420,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    link: "/product/wireless-noise-canceling-headphones",
    category: "Audio",
    rating: 4.8
  },
  {
    id: "prod-5",
    slug: "ergonomic-performance-running-shoes",
    title: "Ergonomic Performance Running Shoes",
    price: 110,
    compareAtPrice: 150,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop",
    link: "/product/ergonomic-performance-running-shoes",
    category: "Footwear",
    rating: 4.7
  },
  {
    id: "prod-6",
    slug: "smart-led-ambient-floor-lamp",
    title: "Smart LED Ambient Floor Lamp",
    price: 89.99,
    compareAtPrice: 120,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop",
    link: "/product/smart-led-ambient-floor-lamp",
    category: "Home & Living",
    rating: 4.8
  }
];

export default function Hero() {
  const [products, setProducts] = useState(DEFAULT_HERO_PRODUCTS);

  useEffect(() => {
    let cmsConfig = null;
    try {
      const raw = localStorage.getItem("sansons_cms_config");
      if (raw) cmsConfig = JSON.parse(raw);
    } catch (e) {}

    fetchBestSellers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          let selected = data;
          if (cmsConfig && Array.isArray(cmsConfig.hero_featured_products) && cmsConfig.hero_featured_products.length > 0) {
            const featuredIds = new Set(cmsConfig.hero_featured_products);
            const filtered = data.filter((p) => featuredIds.has(p.id));
            if (filtered.length > 0) selected = filtered;
          }

          const mapped = selected.map((p, idx) => ({
            id: p.id || `prod-${idx}`,
            slug: p.slug || p.id,
            title: p.name || p.title || "Luxury Item",
            price: p.price || 199,
            compareAtPrice: p.compareAtPrice || null,
            image: p.images?.[0] || DEFAULT_HERO_PRODUCTS[idx % DEFAULT_HERO_PRODUCTS.length].image,
            link: `/product/${p.slug || p.id}`,
            category: p.category || "Featured",
            rating: p.rating || 4.9
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Spotlight = first product, Grid = next 6
  const spotlight = products[0];
  const gridProducts = products.slice(1, 7);

  // Fill grid to exactly 6 if needed
  while (gridProducts.length < 6) {
    gridProducts.push(DEFAULT_HERO_PRODUCTS[gridProducts.length % DEFAULT_HERO_PRODUCTS.length]);
  }

  return (
    <section className="relative bg-gradient-to-b from-[#F4F0EA] via-[#EDE7DE] to-[#F4F0EA] text-ink border-b border-line/60 overflow-hidden py-6 lg:py-10">
      {/* Background Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-forest/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-brass/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Main Layout: Spotlight + Grid */}
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-6">

          {/* LEFT: Spotlight Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <Link href={spotlight.link} className="group block">
              <div className="relative bg-paper rounded-2xl border border-line/80 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Product Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-canvas2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={spotlight.image}
                    alt={spotlight.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-paper/95 backdrop-blur-sm border border-line px-3 py-1 rounded-full text-[10px] uppercase font-bold text-forest tracking-wider shadow-sm">
                    {spotlight.category}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-paper/95 backdrop-blur-sm border border-line px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Star size={11} className="fill-brass text-brass" />
                    <span className="text-[11px] font-bold text-ink">{spotlight.rating}</span>
                  </div>

                  {/* Hover Quick-View Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <span className="inline-flex items-center gap-2 bg-paper text-forest font-semibold text-xs px-5 py-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye size={14} />
                      View Product
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 space-y-2.5">
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-ink leading-tight group-hover:text-forest transition-colors line-clamp-2">
                    {spotlight.title}
                  </h2>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-xl font-bold text-forest">
                      {formatCurrency(spotlight.price)}
                    </span>
                    {spotlight.compareAtPrice && (
                      <span className="font-mono text-sm text-ink2/60 line-through">
                        {formatCurrency(spotlight.compareAtPrice)}
                      </span>
                    )}
                    {spotlight.compareAtPrice && (
                      <span className="text-[10px] font-bold text-white bg-wine px-2 py-0.5 rounded-full">
                        {Math.round((1 - spotlight.price / spotlight.compareAtPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* RIGHT: Product Grid (2 rows x 3 cols) */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {gridProducts.map((item, idx) => (
                <motion.div
                  key={`grid-${item.id}-${idx}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * idx }}
                >
                  <GridProductCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

// Compact Grid Product Card
function GridProductCard({ item }) {
  return (
    <Link href={item.link || `/product/${item.slug || item.id}`} className="group block">
      <div className="relative bg-paper rounded-xl border border-line/80 overflow-hidden shadow-sm hover:shadow-md hover:border-forest/40 transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-canvas2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.title}
            loading="eager"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          />

          {/* Category */}
          <div className="absolute top-2 left-2 bg-paper/90 backdrop-blur-sm border border-line px-2 py-0.5 rounded text-[8px] uppercase font-bold text-ink tracking-wider">
            {item.category}
          </div>

          {/* Rating */}
          <div className="absolute top-2 right-2 bg-paper/90 backdrop-blur-sm border border-line px-1.5 py-0.5 rounded flex items-center gap-1">
            <Star size={9} className="fill-brass text-brass" />
            <span className="text-[9px] font-bold text-ink">{item.rating}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-1.5">
          <h3 className="text-[11px] sm:text-xs font-semibold text-ink group-hover:text-forest transition-colors line-clamp-1 leading-snug">
            {item.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xs sm:text-sm font-bold text-forest">
                {formatCurrency(item.price)}
              </span>
              {item.compareAtPrice && (
                <span className="font-mono text-[9px] text-ink2/60 line-through">
                  {formatCurrency(item.compareAtPrice)}
                </span>
              )}
            </div>
            <ArrowRight size={12} className="text-ink2 group-hover:text-forest group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}
