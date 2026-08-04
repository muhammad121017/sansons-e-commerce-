"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, X, ShoppingBag } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import { formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumb items={[{ label: "Wishlist" }]} />
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart icon on any product to save it here."
          ctaLabel="Discover Products"
          ctaHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Wishlist" }]} />
      <h1 className="font-display text-4xl mt-3 mb-10">Your Wishlist ({items.length})</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <button
              onClick={() => removeFromWishlist(item.id)}
              aria-label={`Remove ${item.name} from wishlist`}
              className="absolute top-3 right-3 z-10 p-2 bg-paper rounded-full shadow-soft hover:bg-wine hover:text-canvas"
            >
              <X size={14} />
            </button>
            <Link href={`/product/${item.slug}`} className="block">
              <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-canvas2">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <p className="text-sm font-medium mt-3 line-clamp-1">{item.name}</p>
              <p className="text-xs text-ink2">{item.brand}</p>
              <p className="font-mono text-sm mt-1">{formatCurrency(item.price)}</p>
            </Link>
            <Button
              variant="subtle"
              size="sm"
              className="w-full mt-3"
              onClick={() => {
                addItem(item, { quantity: 1 });
                showToast(`${item.name} added to bag`, "success");
              }}
            >
              <ShoppingBag size={14} /> Add to Bag
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
