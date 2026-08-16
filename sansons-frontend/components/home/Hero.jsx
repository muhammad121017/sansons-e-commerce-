"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Truck, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { fetchBestSellers } from "@/lib/services/productService";
import { formatCurrency } from "@/lib/utils";

// Curated Luxury Gallery Products
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
    rating: 4.9,
    floatDuration: 4.2,
    offsetClass: "lg:-translate-y-2"
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
    rating: 5.0,
    floatDuration: 5.1,
    offsetClass: "lg:translate-y-6"
  },
  {
    id: "prod-3",
    slug: "smart-led-ambient-floor-lamp",
    title: "Smart LED Ambient Floor Lamp",
    price: 89.99,
    compareAtPrice: 120,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop",
    link: "/product/smart-led-ambient-floor-lamp",
    category: "Home & Living",
    rating: 4.7,
    floatDuration: 4.6,
    offsetClass: "lg:-translate-y-4"
  }
];

export default function Hero({ slides }) {
  const [products, setProducts] = useState(DEFAULT_FEATURED_PRODUCTS);

  useEffect(() => {
    fetchBestSellers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.slice(0, 3).map((p, idx) => ({
            id: p.id || `fetched-${idx}`,
            slug: p.slug || p.id,
            title: p.name || p.title || "Luxury Item",
            price: p.price || 199,
            compareAtPrice: p.compareAtPrice || null,
            image: p.images?.[0] || DEFAULT_FEATURED_PRODUCTS[idx % DEFAULT_FEATURED_PRODUCTS.length].image,
            link: `/product/${p.slug || p.id}`,
            category: p.category || "Featured",
            rating: p.rating || 4.9,
            floatDuration: 4.2 + idx * 0.5,
            offsetClass: idx === 0 ? "lg:-translate-y-2" : idx === 1 ? "lg:translate-y-6" : "lg:-translate-y-4"
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative bg-zinc-950 text-zinc-100 overflow-hidden py-10 lg:py-14 border-b border-zinc-900">
      {/* Soft Low-Opacity Ambient Blur Background Elements */}
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 right-1/4 w-[400px] h-[400px] bg-amber-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Ultra-subtle Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* LEFT COLUMN: Editorial Copy & Hierarchy */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-300 text-[11px] font-semibold uppercase tracking-widest backdrop-blur-md shadow-md"
          >
            <Sparkles size={13} className="text-amber-300 animate-pulse" />
            <span>Curated Multi-Vendor Digital Gallery</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-3"
          >
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-100 leading-[1.12]">
              Elevated Luxury. <br />
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-amber-200/90 bg-clip-text text-transparent">
                Curated For Perfection.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg font-light">
              Discover verified boutique sellers, rare luxury timepieces, artisan leathercraft, and high-end electronics with instant nationwide delivery.
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-wrap items-center gap-3.5 pt-1"
          >
            <Button
              as={Link}
              href="/shop"
              variant="primary"
              size="md"
              className="!bg-zinc-100 !text-zinc-950 hover:!bg-white font-medium border-0 shadow-lg transition-transform hover:scale-[1.02] flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight size={15} />
            </Button>
            <Button
              as={Link}
              href="/admin/categories"
              variant="outline"
              size="md"
              className="!border-zinc-800 !text-zinc-300 hover:!border-zinc-700 hover:!text-white"
            >
              Browse Categories
            </Button>
          </motion.div>

          {/* Trust Guarantees */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-5 border-t border-zinc-900 grid grid-cols-2 gap-4 text-xs text-zinc-400"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-300">
                <ShieldCheck size={15} />
              </div>
              <div>
                <p className="font-medium text-zinc-200 text-[12px]">Verified Sellers</p>
                <p className="text-[10px] text-zinc-400">Guaranteed Authenticity</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-300">
                <Truck size={15} />
              </div>
              <div>
                <p className="font-medium text-zinc-200 text-[12px]">Express Shipping</p>
                <p className="text-[10px] text-zinc-400">Nationwide Insured Delivery</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Asymmetrical Floating Digital Gallery Layout */}
        <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[420px] flex items-center justify-center">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 w-full items-center">
            {products.map((item, idx) => (
              <FloatingGalleryCard
                key={item.id || idx}
                item={item}
                floatDuration={item.floatDuration || 4.5 + idx * 0.4}
                offsetClass={item.offsetClass}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

// Staggered Asymmetrical Floating Gallery Card
function FloatingGalleryCard({ item, floatDuration = 4.5, offsetClass = "" }) {
  return (
    <motion.div
      animate={{ y: [0, -9, 0] }}
      transition={{
        repeat: Infinity,
        duration: floatDuration,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.03,
        y: -14,
        transition: { type: "spring", stiffness: 350, damping: 15 }
      }}
      className={`relative group rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-3 shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-zinc-900/80 ${offsetClass}`}
    >
      {/* Soft Ambient Blur Glow Element Behind Card */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <Link href={item.link || `/product/${item.slug || item.id}`} className="relative z-10 block space-y-2.5">
        
        {/* Product Image Container */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-white/5">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-108"
            sizes="(max-width: 768px) 100vw, 240px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-50 group-hover:opacity-20 transition-opacity" />

          {/* Category Tag */}
          <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-[9px] uppercase font-semibold text-zinc-300 tracking-wider">
            {item.category}
          </div>

          {/* Rating Tag */}
          <div className="absolute top-2 right-2 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-[9px] font-medium text-amber-300 flex items-center gap-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span>{item.rating}</span>
          </div>
        </div>

        {/* Details & Restrained Pricing Typography */}
        <div className="space-y-1 text-left px-1">
          <h3 className="text-xs sm:text-sm font-medium text-zinc-100 group-hover:text-amber-200 transition-colors line-clamp-1">
            {item.title}
          </h3>
          
          <div className="flex items-center justify-between pt-0.5">
            {/* Restrained Clean Off-White Pricing (NO bright neon green) */}
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-zinc-200">
                {formatCurrency(item.price)}
              </span>
              {item.compareAtPrice && (
                <span className="font-mono text-[11px] text-zinc-500 line-through">
                  {formatCurrency(item.compareAtPrice)}
                </span>
              )}
            </div>

            <span className="text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200 flex items-center gap-1 transition-colors">
              <span>View</span>
              <ArrowRight size={11} className="transform group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

      </Link>
    </motion.div>
  );
}
