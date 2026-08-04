"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Badge from "@/components/ui/Badge";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import { formatCurrency, discountPercent } from "@/lib/utils";

export default function QuickViewModal({ product, open, onClose }) {
  const [color, setColor] = useState(product?.variants?.colors?.[0]?.name || "");
  const [size, setSize] = useState(product?.variants?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();

  if (!product) return null;
  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock === 0;

  const handleAddToCart = () => {
    addItem(product, { color, size, quantity });
    showToast(`${product.name} added to bag`, "success");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="" maxWidth="max-w-3xl">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-canvas2">
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
          {discount > 0 && (
            <div className="absolute top-3 left-3">
              <Badge tone="sale">-{discount}%</Badge>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-wider text-ink2">{product.brand}</p>
          <h2 className="font-display text-2xl mt-1">{product.name}</h2>
          <div className="mt-2">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-lg font-medium">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <span className="font-mono text-sm text-ink2 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          <p className="text-sm text-ink2 mt-4 leading-relaxed line-clamp-2">{product.description}</p>

          {product.variants?.colors?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-ink2 mb-2">Color: {color}</p>
              <div className="flex gap-2">
                {product.variants.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    aria-pressed={color === c.name}
                    className={`w-8 h-8 rounded-full border-2 ${color === c.name ? "border-forest" : "border-line"}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.variants?.sizes?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-ink2 mb-2">Size: {size}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`px-3 py-1.5 text-sm border rounded-sm ${
                      size === s ? "border-forest bg-forest text-canvas" : "border-line hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <Button variant="primary" className="flex-1" disabled={outOfStock} onClick={handleAddToCart}>
              {outOfStock ? "Out of Stock" : "Add to Bag"}
            </Button>
          </div>

          <Link href={`/product/${product.slug}`} onClick={onClose} className="text-sm text-forest underline mt-4">
            View full details
          </Link>
        </div>
      </div>
    </Modal>
  );
}
