"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { heroSlide, fadeUp, staggerContainer } from "@/lib/motion";
import Button from "@/components/ui/Button";

export default function Hero({ slides }) {
  const [index, setIndex] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 140]); // parallax on background

  useEffect(() => {
    if (!slides?.length) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, [slides]);

  if (!slides?.length) return null;
  const slide = slides[index];

  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-ink">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          variants={heroSlide}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <motion.div style={{ y }} className="absolute inset-0 -top-10">
            <Image src={slide.image} alt="" fill priority className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/40" />
        </motion.div>
      </AnimatePresence>

      <motion.div
        key={slide.id + "-copy"}
        variants={staggerContainer(0.12, 0.2)}
        initial="hidden"
        animate="show"
        className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center text-canvas"
      >
        <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.2em] text-brassLight mb-4">
          {slide.eyebrow}
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] whitespace-pre-line max-w-2xl">
          {slide.title}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 text-base sm:text-lg text-canvas/80 max-w-md">
          {slide.subtitle}
        </motion.p>
        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
          <Button as={Link} href={slide.ctaHref} variant="primary" size="lg">
            {slide.ctaLabel}
          </Button>
          {slide.secondaryCtaLabel && (
            <Button as={Link} href={slide.secondaryCtaHref} variant="outline" size="lg" className="!border-canvas !text-canvas hover:!bg-canvas hover:!text-ink">
              {slide.secondaryCtaLabel}
            </Button>
          )}
        </motion.div>
      </motion.div>

      {/* Slide controls */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-6">
        <button
          onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          aria-label="Previous slide"
          className="text-canvas/70 hover:text-canvas"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1 rounded-full transition-all ${i === index ? "w-8 bg-brassLight" : "w-3 bg-canvas/40"}`}
            />
          ))}
        </div>
        <button
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          aria-label="Next slide"
          className="text-canvas/70 hover:text-canvas"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 right-8 z-10 hidden sm:flex text-canvas/60"
        aria-hidden="true"
      >
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
}
