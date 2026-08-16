"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";
import Button from "@/components/ui/Button";
import { fetchBestSellers } from "@/lib/services/productService";
import { formatCurrency } from "@/lib/utils";

// Fallback Featured Hero Slides
const DEFAULT_HERO_SLIDES = [
  {
    id: "slide-1",
    slug: "luxury-automatic-chronograph-watch",
    title: "Luxury Automatic Chronograph Watch",
    subtitle: "Precision horology handcrafted with sapphire crystal & Swiss movement.",
    price: 450,
    compareAtPrice: 650,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop",
    link: "/product/luxury-automatic-chronograph-watch",
    category: "Horology Collection",
    badge: "Bestseller"
  },
  {
    id: "slide-2",
    slug: "iphone-17-pro",
    title: "iPhone 17 Pro Max Titanium",
    subtitle: "Next-gen performance, titanium alloy enclosure & pro camera system.",
    price: 1200,
    compareAtPrice: 1400,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop",
    link: "/product/iphone-17-pro",
    category: "Tech & Mobile",
    badge: "Featured Tech"
  },
  {
    id: "slide-3",
    slug: "handcrafted-leather-weekend-bag",
    title: "Artisan Full-Grain Leather Duffle",
    subtitle: "Hand-stitched genuine leather crafted for timeless travel elegance.",
    price: 280,
    compareAtPrice: 350,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop",
    link: "/product/handcrafted-leather-weekend-bag",
    category: "Leathercraft",
    badge: "Artisan Special"
  },
  {
    id: "slide-4",
    slug: "wireless-noise-canceling-headphones",
    title: "Acoustic Noise-Canceling Headphones",
    subtitle: "Immersive spatial audio with high-fidelity acoustic driver tuning.",
    price: 349,
    compareAtPrice: 420,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop",
    link: "/product/wireless-noise-canceling-headphones",
    category: "Audio Engineering",
    badge: "New Release"
  }
];

// Marquee Highlights Data
const MARQUEE_ITEMS = [
  { icon: Truck, text: "Express Shipping Nationwide" },
  { icon: ShieldCheck, text: "100% Verified Boutique Sellers" },
  { icon: RotateCcw, text: "7-Day Hassle-Free Returns" },
  { icon: Award, text: "Guaranteed Authenticity On All Items" },
];

export default function Hero({ slides: cmsSlides }) {
  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch live products (filtered by admin-selected Hero Featured Products)
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

          const mapped = selected.slice(0, 6).map((p, idx) => ({
            id: p.id || `slide-${idx}`,
            slug: p.slug || p.id,
            title: p.name || p.title || "Luxury Item",
            subtitle: p.description?.slice(0, 80) || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].subtitle,
            price: p.price || 199,
            compareAtPrice: p.compareAtPrice || null,
            image: p.images?.[0] || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].image,
            link: `/product/${p.slug || p.id}`,
            category: p.category || "Curated Collection",
            badge: idx === 0 ? "Featured in Hero" : "Selected Item"
          }));
          setHeroSlides(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Auto slide advance every 5.5 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused || !heroSlides.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const activeSlide = heroSlides[currentIndex] || DEFAULT_HERO_SLIDES[0];

  return (
    <section className="relative bg-gradient-to-b from-[#F4F0EA] via-[#EDE7DE] to-[#F4F0EA] text-ink border-b border-line/60 overflow-hidden">
      {/* Subtle Background Lighting Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-forest/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-brass/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12 relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* LEFT COLUMN: Editorial Copy & CTAs */}
        <div className="lg:col-span-5 space-y-5 text-left">
          
          {/* Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper/80 border border-line text-forest text-[11px] font-semibold uppercase tracking-widest backdrop-blur-md shadow-sm"
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

          {/* Trust Highlights */}
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

        {/* RIGHT COLUMN: Compact Warm Showcase + Interactive Thumbnails */}
        <div
          className="lg:col-span-7 relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative rounded-2xl bg-paper border border-line p-4 lg:p-5 shadow-medium backdrop-blur-xl overflow-hidden">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="grid sm:grid-cols-12 gap-5 items-center"
              >
                {/* Slide Image (7 cols) */}
                <div className="sm:col-span-7 relative aspect-[4/3] rounded-xl overflow-hidden bg-canvas2 border border-line/60 group shadow-sm">
                  <Image
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-40" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-3 left-3 bg-paper/90 backdrop-blur-md border border-line px-2.5 py-1 rounded-full text-[9px] uppercase font-bold text-ink tracking-wider shadow-xs">
                    {activeSlide.category}
                  </div>
                  
                  {/* Badge */}
                  {activeSlide.badge && (
                    <div className="absolute top-3 right-3 bg-brass/20 border border-brass/40 text-brassDark px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider backdrop-blur-md">
                      {activeSlide.badge}
                    </div>
                  )}
                </div>

                {/* Slide Details (5 cols) */}
                <div className="sm:col-span-5 space-y-3 text-left p-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-ink2 font-semibold">
                    Featured {currentIndex + 1} of {heroSlides.length}
                  </span>
                  
                  <h3 className="text-base font-semibold text-ink leading-snug line-clamp-2">
                    {activeSlide.title}
                  </h3>
                  
                  <p className="text-xs text-ink2 line-clamp-2 font-normal">
                    {activeSlide.subtitle}
                  </p>

                  <div className="pt-1 flex items-baseline gap-2">
                    <span className="font-mono text-base font-bold text-forest">
                      {formatCurrency(activeSlide.price)}
                    </span>
                    {activeSlide.compareAtPrice && (
                      <span className="font-mono text-xs text-ink2/70 line-through">
                        {formatCurrency(activeSlide.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      as={Link}
                      href={activeSlide.link}
                      variant="primary"
                      size="sm"
                      className="w-full !bg-forest hover:!bg-forestDark !text-canvas font-semibold border-0 shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Shop This Item</span>
                      <ArrowRight size={13} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* INTERACTIVE THUMBNAIL ROW & SLIDER CONTROLS */}
            <div className="mt-4 pt-3.5 border-t border-line/70 flex items-center justify-between gap-4">
              
              {/* Image Preview Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {heroSlides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Preview ${s.title}`}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border transition-all duration-300 shrink-0 ${
                      idx === currentIndex
                        ? "border-forest ring-2 ring-forest/30 shadow-md scale-105"
                        : "border-line/70 opacity-60 hover:opacity-100 hover:border-ink"
                    }`}
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  aria-label="Previous Slide"
                  className="p-2 rounded-lg bg-canvas border border-line text-ink hover:bg-paper hover:border-forest transition-colors shadow-xs"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % heroSlides.length)}
                  aria-label="Next Slide"
                  className="p-2 rounded-lg bg-canvas border border-line text-ink hover:bg-paper hover:border-forest transition-colors shadow-xs"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM MARQUEE TICKER BAR (Warm Cream Theme) */}
      <div className="bg-paper/90 border-t border-line/60 py-2.5 overflow-hidden">
        <motion.div
          className="flex gap-8 shrink-0 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 26, ease: "linear" }}
        >
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
        </motion.div>
      </div>

    </section>
  );
}
