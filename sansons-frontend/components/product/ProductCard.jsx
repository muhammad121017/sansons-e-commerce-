"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Eye, GitCompare } from "lucide-react";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import QuickViewModal from "./QuickViewModal";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useToast } from "@/lib/context/ToastContext";
import { cardHover, imageZoom } from "@/lib/motion";
import { cn, formatCurrency, discountPercent } from "@/lib/utils";

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const wished = isWishlisted(product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock === 0;
  const secondaryImage = product.images?.[1] || product.images?.[0];

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    showToast(wished ? "Removed from wishlist" : "Added to wishlist", "success");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -6, scale: 1.02 }}
        className="group relative bg-paper rounded-lg overflow-hidden border border-line/50 shadow-soft transition-all duration-300 hover:shadow-hover hover:border-forest/30"
      >
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-[1/1] overflow-hidden bg-canvas2">
            {!imgLoaded && !imgError && <div className="absolute inset-0 skeleton animate-shimmer" />}
            {!imgError ? (
              <>
                <motion.div variants={imageZoom} initial="rest" whileHover="hover" className="absolute inset-0">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className={cn("object-cover transition-opacity duration-500", imgLoaded ? "opacity-100" : "opacity-0")}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </motion.div>
                {secondaryImage && secondaryImage !== product.images[0] && (
                  <Image
                    src={secondaryImage}
                    alt=""
                    fill
                    className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-ink2 text-xs bg-canvas2">
                Image unavailable
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isNew && <Badge tone="new">New</Badge>}
              {discount > 0 && <Badge tone="sale">-{discount}%</Badge>}
              {product.isBestSeller && <Badge tone="bestseller">Bestseller</Badge>}
              {product.codAvailable && <Badge tone="cod">COD</Badge>}
            </div>
            {outOfStock ? (
              <div className="absolute top-3 right-3">
                <Badge tone="outOfStock">Sold Out</Badge>
              </div>
            ) : product.stock <= 5 ? (
              <div className="absolute top-3 right-3">
                <Badge tone="warning">Low Stock ({product.stock} left)</Badge>
              </div>
            ) : null}


            {/* Hover actions */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleWishlist}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wished}
                className="p-2.5 bg-paper rounded-full shadow-soft hover:bg-forest hover:text-canvas transition-colors"
              >
                <motion.span
                  key={wished ? "on" : "off"}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="block"
                >
                  <Heart size={16} className={wished ? "fill-wine text-wine" : ""} />
                </motion.span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setQuickViewOpen(true);
                }}
                aria-label="Quick view"
                className="p-2.5 bg-paper rounded-full shadow-soft hover:bg-forest hover:text-canvas transition-colors"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  showToast("Compare is coming soon", "info");
                }}
                aria-label="Add to compare (coming soon)"
                className="p-2.5 bg-paper rounded-full shadow-soft hover:bg-forest hover:text-canvas transition-colors"
              >
                <GitCompare size={16} />
              </button>
            </div>
          </div>

          <div className="pt-3 px-1">
            <p className="text-[11px] uppercase tracking-wider text-ink2 mb-1">{product.brand}</p>
            <h3 className="text-sm font-medium text-ink line-clamp-1">{product.name}</h3>
            <div className="mt-1">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size={12} />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-mono text-sm font-medium">{formatCurrency(product.price)}</span>
              {product.compareAtPrice && (
                <span className="font-mono text-xs text-ink2 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>

      <QuickViewModal product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}
