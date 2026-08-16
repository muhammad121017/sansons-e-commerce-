"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Award, Star } from "lucide-react";
import Button from "@/components/ui/Button";
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

const MARQUEE_ITEMS = [
  { icon: Truck, text: "Express Shipping Nationwide" },
  { icon: ShieldCheck, text: "100% Verified Boutique Sellers" },
  { icon: RotateCcw, text: "7-Day Hassle-Free Returns" },
  { icon: Award, text: "Guaranteed Authenticity On All Items" },
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

  // Duplicate for seamless 100% loop
  const loopProducts = [...products, ...products];

  return (
    <section className="relative bg-gradient-to-b from-[#F4F0EA] via-[#EDE7DE] to-[#F4F0EA] text-ink border-b border-line/60 overflow-hidden py-8 lg:py-12">
      {/* Background Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-forest/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-brass/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Grid */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* LEFT COLUMN: Editorial Copy & CTAs */}
        <div className="lg:col-span-5 space-y-5 text-left">
          
          {/* Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper/90 border border-line text-forest text-[11px] font-semibold uppercase tracking-widest backdrop-blur-md shadow-sm"
          >
            <Sparkles size={13} className="text-brass animate-pulse" />
            <span>Curated Multi-Vendor Marketplace</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-2.5"
          >
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-ink leading-[1.1]">
              Elevated Luxury. <br />
              <span className="bg-gradient-to-r from-forest via-[#164434] to-brass bg-clip-text text-transparent">
                Curated For Perfection.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-ink2 leading-relaxed max-w-md font-normal">
              Discover verified boutique sellers, rare luxury timepieces, artisan leathercraft, and high-end electronics with instant nationwide delivery.
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center gap-3.5 pt-1"
          >
            <Button
              as={Link}
              href="/shop"
              variant="primary"
              size="md"
              className="!bg-forest hover:!bg-forestDark !text-canvas font-semibold border-0 shadow-md transition-transform hover:scale-[1.02] flex items-center gap-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight size={14} />
            </Button>
            <Button
              as={Link}
              href="/admin/categories"
              variant="outline"
              size="md"
              className="!border-line !text-ink hover:!border-forest hover:!text-forest bg-paper"
            >
              Browse Categories
            </Button>
          </motion.div>

          {/* Trust Guarantees */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="pt-4 border-t border-line/70 grid grid-cols-2 gap-3 text-xs text-ink2"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-paper border border-line text-forest shadow-xs">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="font-semibold text-ink text-[12px]">100% Authenticity</p>
                <p className="text-[10px] text-ink2">Verified Sellers Only</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-paper border border-line text-forest shadow-xs">
                <Truck size={16} />
              </div>
              <div>
                <p className="font-semibold text-ink text-[12px]">Express Shipping</p>
                <p className="text-[10px] text-ink2">Nationwide Delivery</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: SILKY 60FPS HARDWARE-ACCELERATED GPU SLIDING MARQUEE */}
        <div className="lg:col-span-7 relative py-2 overflow-hidden group/hero">
          
          {/* Edge Blur Fades */}
          <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#F4F0EA] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#F4F0EA] to-transparent z-20 pointer-events-none" />

          {/* GPU Hardware Accelerated Smooth Marquee Track */}
          <div className="flex overflow-hidden py-2">
            <div className="flex gap-4 shrink-0 animate-marquee-fast group-hover/hero:[animation-play-state:paused] transform-gpu will-change-transform">
              {loopProducts.map((item, idx) => (
                <SlidingHeroCard key={`hero-card-${item.id}-${idx}`} item={item} />
              ))}
            </div>
          </div>

          {/* Pause Indicator */}
          <div className="text-center pt-2">
            <span className="inline-block text-[10px] font-mono text-ink2/80 uppercase tracking-widest bg-paper/90 px-3 py-0.5 rounded-full border border-line shadow-xs transition-opacity opacity-75 group-hover/hero:opacity-100">
              ✦ Hover Cards To Pause • Click To View Item
            </span>
          </div>

        </div>

      </div>

      {/* BOTTOM MARQUEE TICKER BAR */}
      <div className="mt-4 bg-paper/90 border-t border-line/60 py-2.5 overflow-hidden">
        <div className="flex overflow-hidden">
          <div className="flex gap-8 shrink-0 whitespace-nowrap animate-marquee-slow transform-gpu will-change-transform">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="flex items-center gap-2 text-xs font-mono tracking-wider text-ink2">
                  <IconComponent size={13} className="text-forest shrink-0" />
                  <span className="font-medium text-ink/90">{item.text}</span>
                  <span className="text-line/80 ml-4">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom CSS Keyframe Animations for Hardware 60FPS Compositing */}
      <style jsx global>{`
        @keyframes marqueeSmooth {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee-fast {
          animation: marqueeSmooth 24s linear infinite;
        }
        .animate-marquee-slow {
          animation: marqueeSmooth 35s linear infinite;
        }
      `}</style>

    </section>
  );
}

// Optimized 60FPS Card (No backdrop-blur filter on moving container for zero GPU jitter)
function SlidingHeroCard({ item }) {
  return (
    <div className="relative w-52 sm:w-60 shrink-0 rounded-xl bg-paper border border-line/80 p-3 shadow-sm transition-all duration-300 hover:border-forest hover:shadow-md hover:scale-[1.03] group/card">
      <Link href={item.link || `/product/${item.slug || item.id}`} className="block space-y-2.5">
        
        {/* Product Image Container */}
        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-canvas2 border border-line/50">
          <img
            src={item.image}
            alt={item.title}
            loading="eager"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-108"
          />

          {/* Category Tag */}
          <div className="absolute top-2 left-2 bg-paper/95 border border-line px-2 py-0.5 rounded text-[9px] uppercase font-bold text-ink tracking-wider shadow-xs">
            {item.category}
          </div>

          {/* Rating Tag */}
          <div className="absolute top-2 right-2 bg-paper/95 border border-line px-2 py-0.5 rounded text-[9px] font-semibold text-brassDark flex items-center gap-1 shadow-xs">
            <Star size={10} className="fill-brass text-brass" />
            <span>{item.rating}</span>
          </div>
        </div>

        {/* Details & Pricing */}
        <div className="space-y-1 text-left px-1">
          <h3 className="text-xs sm:text-sm font-semibold text-ink group-hover/card:text-forest transition-colors line-clamp-1">
            {item.title}
          </h3>
          
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xs sm:text-sm font-bold text-forest">
                {formatCurrency(item.price)}
              </span>
              {item.compareAtPrice && (
                <span className="font-mono text-[10px] text-ink2/70 line-through">
                  {formatCurrency(item.compareAtPrice)}
                </span>
              )}
            </div>

            <span className="text-[10px] font-semibold text-forest group-hover/card:text-forestDark flex items-center gap-1 transition-colors">
              <span>View</span>
              <ArrowRight size={11} className="transform group-hover/card:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

      </Link>
    </div>
  );
}
