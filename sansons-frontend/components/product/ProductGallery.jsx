"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex gap-3">
      <div className="hidden sm:flex flex-col gap-3 w-20 shrink-0">
        {images.map((img, i) => (
          <button
            key={img}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={active === i}
            className={cn(
              "relative aspect-[3/4] rounded-sm overflow-hidden border-2",
              active === i ? "border-forest" : "border-transparent"
            )}
          >
            <Image src={img} alt="" fill className="object-cover" />
          </button>
        ))}
      </div>

      <div
        className="relative flex-1 aspect-[3/4] rounded-md overflow-hidden bg-canvas2 cursor-zoom-in"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0"
        >
          <Image src={images[active]} alt={name} fill priority className="object-cover" />
        </motion.div>
        {zooming && (
          <div
            className="hidden lg:block absolute inset-0 bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: `url(${images[active]})`,
              backgroundSize: "220%",
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
