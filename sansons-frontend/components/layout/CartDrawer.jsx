"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { drawerSlide, fadeIn } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="absolute inset-0 bg-ink/50"
            onClick={closeDrawer}
          />
          <motion.aside
            variants={drawerSlide}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute right-0 top-0 h-full w-full max-w-md bg-paper shadow-lift flex flex-col"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <h2 className="font-display text-xl">Your Bag ({itemCount})</h2>
              <button onClick={closeDrawer} aria-label="Close cart" className="p-1 text-ink2 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your bag is empty"
                  description="Items you add will show up here."
                  ctaLabel="Continue Shopping"
                  ctaHref="/shop"
                />
              ) : (
                <ul className="divide-y divide-line">
                  {items.map((item) => (
                    <li key={`${item.id}-${item.color}-${item.size}`} className="py-5 flex gap-4">
                      <div className="relative w-20 h-24 shrink-0 rounded-sm overflow-hidden bg-canvas2">
                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between gap-2">
                          <p className="text-sm font-medium">{item.name}</p>
                          <button
                            onClick={() => removeItem(item.id, item.color, item.size)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="text-ink2 hover:text-wine"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-ink2">
                          {[item.color, item.size].filter(Boolean).join(" / ")}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="inline-flex items-center border border-line rounded-sm">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                              className="p-2 hover:bg-canvas2"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                              className="p-2 hover:bg-canvas2"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-mono">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink2">Subtotal</span>
                  <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs text-ink2">Shipping and taxes calculated at checkout.</p>
                <Button as={Link} href="/cart" variant="outline" className="w-full" onClick={closeDrawer}>
                  View Bag
                </Button>
                <Button as={Link} href="/checkout" variant="primary" className="w-full" onClick={closeDrawer}>
                  Checkout
                </Button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
