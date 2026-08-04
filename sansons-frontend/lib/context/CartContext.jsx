"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { validateCoupon } from "@/lib/services/orderService";

const CartContext = createContext(null);
const STORAGE_KEY = "luxe_cart_v1";

function lineKey(item) {
  return [item.id, item.color || "", item.size || ""].join("::");
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || []);
        setCoupon(parsed.coupon || null);
      }
    } catch (e) {
      // Corrupt storage — start fresh rather than crash the app.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, coupon }));
  }, [items, coupon, hydrated]);

  const addItem = (product, options = {}) => {
    const { color, size, quantity = 1 } = options;
    const key = lineKey({ id: product.id, color, size });
    setItems((prev) => {
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.images?.[0],
          color,
          size,
          quantity,
        },
      ];
    });
    setDrawerOpen(true);
  };

  const removeItem = (id, color, size) => {
    const key = lineKey({ id, color, size });
    setItems((prev) => prev.filter((i) => lineKey(i) !== key));
  };

  const updateQuantity = (id, color, size, quantity) => {
    const key = lineKey({ id, color, size });
    setItems((prev) =>
      prev.map((i) => (lineKey(i) === key ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    const res = await validateCoupon(code);
    if (res.valid) setCoupon(res.coupon);
    return res;
  };

  const removeCoupon = () => setCoupon(null);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === "Percentage") return subtotal * (coupon.value / 100);
    return 0;
  }, [coupon, subtotal]);

  const shippingEstimate = useMemo(() => {
    if (items.length === 0) return 0;
    if (coupon?.type === "Free Shipping") return 0;
    return subtotal > 200 ? 0 : 12;
  }, [subtotal, coupon, items.length]);

  const taxEstimate = useMemo(() => (subtotal - discount) * 0.08, [subtotal, discount]);

  const total = useMemo(
    () => Math.max(0, subtotal - discount) + shippingEstimate + taxEstimate,
    [subtotal, discount, shippingEstimate, taxEstimate]
  );

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    shippingEstimate,
    taxEstimate,
    total,
    itemCount,
    isDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
