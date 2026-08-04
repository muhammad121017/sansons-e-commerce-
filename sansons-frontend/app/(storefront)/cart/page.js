"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag, Tag } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    shippingEstimate,
    taxEstimate,
    total,
  } = useCart();
  const { showToast } = useToast();
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    const res = await applyCoupon(code);
    setApplying(false);
    showToast(res.valid ? `Coupon "${res.coupon.code}" applied` : res.message, res.valid ? "success" : "error");
    if (res.valid) setCode("");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumb items={[{ label: "Shopping Bag" }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Browse the catalog to find something you'll love."
          ctaLabel="Continue Shopping"
          ctaHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Shopping Bag" }]} />
      <h1 className="font-display text-4xl mt-3 mb-10">Your Bag</h1>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={`${item.id}-${item.color}-${item.size}`} className="py-6 flex gap-5">
                <Link href={`/product/${item.slug}`} className="relative w-28 h-32 shrink-0 rounded-sm overflow-hidden bg-canvas2">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link href={`/product/${item.slug}`} className="font-medium hover:text-forest">
                        {item.name}
                      </Link>
                      <p className="text-xs text-ink2 mt-1">{item.brand}</p>
                      <p className="text-xs text-ink2">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.color, item.size)}
                      aria-label={`Remove ${item.name}`}
                      className="text-ink2 hover:text-wine"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center border border-line rounded-sm">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                        className="p-2.5 hover:bg-canvas2"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                        className="p-2.5 hover:bg-canvas2"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="font-mono font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-paper rounded-md p-6 h-fit">
          <h2 className="font-display text-xl mb-5">Order Summary</h2>

          <form onSubmit={handleApply} className="flex gap-2 mb-5">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink2" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Coupon code"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-line rounded-sm bg-canvas outline-none focus:border-forest"
              />
            </div>
            <Button type="submit" variant="subtle" disabled={applying}>
              Apply
            </Button>
          </form>

          {coupon && (
            <div className="flex items-center justify-between text-sm mb-4 bg-forest/10 text-forest px-3 py-2 rounded-sm">
              <span>{coupon.code} applied</span>
              <button onClick={removeCoupon} aria-label="Remove coupon">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatCurrency(subtotal)} />
            {discount > 0 && <Row label="Discount" value={`− ${formatCurrency(discount)}`} accent />}
            <Row label="Estimated Shipping" value={shippingEstimate === 0 ? "Free" : formatCurrency(shippingEstimate)} />
            <Row label="Estimated Tax" value={formatCurrency(taxEstimate)} />
          </div>
          <div className="border-t border-line mt-4 pt-4 flex justify-between font-medium text-base">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>

          <Button as={Link} href="/checkout" variant="primary" className="w-full mt-6">
            Proceed to Checkout
          </Button>
          <p className="text-xs text-ink2 text-center mt-3">Cash on delivery available on eligible items.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink2">{label}</span>
      <span className={`font-mono ${accent ? "text-forest" : ""}`}>{value}</span>
    </div>
  );
}
