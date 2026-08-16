"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Truck, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { fetchBestSellers } from "@/lib/services/productService";
import { formatCurrency } from "@/lib/utils";

// Mock Fallback Featured Products
const DEFAULT_FEATURED_PRODUCTS = [
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
    slug: "ergonomic-performance-running-shoes",
    title: "Ergonomic Performance Running Shoes",
    price: 110,
    compareAtPrice: 150,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop",
    link: "/product/ergonomic-performance-running-shoes",
    category: "Footwear",
    rating: 4.8
  },
  {
    id: "prod-4",
    slug: "smart-led-ambient-floor-lamp",
    title: "Smart LED Ambient Floor Lamp",
    price: 89.99,
    compareAtPrice: 120,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop",
    link: "/product/smart-led-ambient-floor-lamp",
    category: "Home & Living",
    rating: 4.7
  },
  {
    id: "prod-5",
    slug: "wireless-noise-canceling-headphones",
    title: "Over-Ear Acoustic ANC Headphones",
    price: 349,
    compareAtPrice: 420,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    link: "/product/wireless-noise-canceling-headphones",
    category: "Audio",
    rating: 4.9
  },
  {
    id: "prod-6",
    slug: "handcrafted-leather-weekend-bag",
    title: "Handcrafted Artisan Leather Duffle",
    price: 280,
    compareAtPrice: 350,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop",
    link: "/product/handcrafted-leather-weekend-bag",
    category: "Leather Goods",
    rating: 5.0
  }
];

export default function Hero({ slides }) {
  const [products, setProducts] = useState(DEFAULT_FEATURED_PRODUCTS);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch dynamic featured products from backend API
  useEffect(() => {
    fetchBestSellers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p, idx) => ({
            id: p.id || `fetched-${idx}`,
            slug: p.slug || p.id,
            title: p.name || p.title || "Luxury Item",
            price: p.price || 199,
            compareAtPrice: p.compareAtPrice || null,
            image: p.images?.[0] || DEFAULT_FEATURED_PRODUCTS[idx % DEFAULT_FEATURED_PRODUCTS.length].image,
            link: `/product/${p.slug || p.id}`,
            category: p.category || "Featured",
            rating: p.rating || 4.9
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {
        // Fallback to default mock items
      });
  }, []);

  // Triple list array for seamless infinite looping marquee
  const marqueeListTrack1 = [...products, ...products, ...products];
  const marqueeListTrack2 = [...products].reverse().concat([...products].reverse(), [...products].reverse());

  return (
    <section className="relative min-h-[540px] lg:min-h-[580px] py-6 lg:py-10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white overflow-hidden flex items-center">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-6 right-1/4 w-[450px] h-[450px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        
        {/* LEFT COLUMN: Editorial & Headline */}
        <div className="lg:col-span-5 space-y-5 text-left">
          
          {/* Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <Sparkles size={13} className="text-amber-400 animate-pulse" />
            <span>Curated Multi-Vendor Luxury Marketplace</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-3"
          >
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-100 leading-[1.1]">
              Elevated Luxury. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                Curated For Perfection.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg font-light">
              Discover verified boutique sellers, rare luxury watches, artisan leathercraft, and cutting-edge electronics with instant nationwide shipping.
            </p>
          </motion.div>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Button
              as={Link}
              href="/shop"
              variant="primary"
              size="lg"
              className="!bg-emerald-600 hover:!bg-emerald-500 !text-white border-0 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all transform hover:scale-[1.02]"
            >
              <span>Explore Marketplace</span>
              <ArrowRight size={16} />
            </Button>
            <Button
              as={Link}
              href="/admin/categories"
              variant="outline"
              size="lg"
              className="!border-zinc-700 !text-zinc-300 hover:!bg-zinc-800 hover:!text-white"
            >
              Browse Categories
            </Button>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-6 border-t border-zinc-800/80 grid grid-cols-2 gap-4 text-xs text-zinc-400"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-emerald-950/50 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="font-semibold text-zinc-200">100% Verified Sellers</p>
                <p className="text-[11px] text-zinc-400">Guaranteed Authenticity</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-amber-950/50 border border-amber-500/20 text-amber-400">
                <Truck size={16} />
              </div>
              <div>
                <p className="font-semibold text-zinc-200">Express Delivery</p>
                <p className="text-[11px] text-zinc-400">Tracked Shipping Nationwide</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Infinite Marquee Parallax Grid */}
        <div 
          className="lg:col-span-7 relative space-y-6 overflow-hidden py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left/Right Fading Vignette Mask */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-zinc-950 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent z-20 pointer-events-none" />

          {/* Marquee Track 1 (Sliding Left) */}
          <div className="flex overflow-hidden group">
            <motion.div
              className="flex gap-5 shrink-0"
              animate={isPaused ? { x: undefined } : { x: ["0%", "-33.333%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 25,
                  ease: "linear",
                },
              }}
            >
              {marqueeListTrack1.map((item, idx) => (
                <MarqueeProductCard key={`track1-${item.id}-${idx}`} item={item} />
              ))}
            </motion.div>
          </div>

          {/* Marquee Track 2 (Sliding Right) */}
          <div className="flex overflow-hidden group">
            <motion.div
              className="flex gap-5 shrink-0"
              animate={isPaused ? { x: undefined } : { x: ["-33.333%", "0%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 28,
                  ease: "linear",
                },
              }}
            >
              {marqueeListTrack2.map((item, idx) => (
                <MarqueeProductCard key={`track2-${item.id}-${idx}`} item={item} />
              ))}
            </motion.div>
          </div>

          {/* Micro-interaction Pause Tip */}
          <div className="text-center pt-2">
            <span className="inline-block text-[11px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800">
              {isPaused ? "⏸ Marquee Paused • Click Any Card to View Details" : "✦ Hover Over Product Card To Pause & Inspect"}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}

// Individual Interactive Marquee Product Card
function MarqueeProductCard({ item }) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 20 }
      }}
      className="relative w-56 sm:w-64 shrink-0 group rounded-xl bg-zinc-900/90 border border-zinc-800/90 p-2.5 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:bg-zinc-900 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]"
    >
      <Link href={item.link || `/product/${item.slug || item.id}`} className="block space-y-2.5">
        {/* Image Container with Badges */}
        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800/80">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 240px, 300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

          {/* Category Tag */}
          <div className="absolute top-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-md border border-zinc-700/60 px-2 py-0.5 rounded text-[10px] uppercase font-semibold text-zinc-300 tracking-wider">
            {item.category}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2.5 right-2.5 bg-emerald-950/90 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-medium text-emerald-300 flex items-center gap-1">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>{item.rating}</span>
          </div>
        </div>

        {/* Details & Pricing */}
        <div className="space-y-1.5 text-left px-1">
          <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-bold text-emerald-400">
                {formatCurrency(item.price)}
              </span>
              {item.compareAtPrice && (
                <span className="font-mono text-xs text-zinc-500 line-through">
                  {formatCurrency(item.compareAtPrice)}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-emerald-300 flex items-center gap-1 transition-colors">
              <span>View</span>
              <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
