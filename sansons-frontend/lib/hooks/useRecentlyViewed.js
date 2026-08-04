"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "luxe_recently_viewed_v1";
const MAX_ITEMS = 8;

export function trackRecentlyViewed(product) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((p) => p.id !== product.id);
    const next = [
      { id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0] },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {}
}

export function useRecentlyViewed(excludeId) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setItems(excludeId ? list.filter((p) => p.id !== excludeId) : list);
    } catch (e) {
      setItems([]);
    }
  }, [excludeId]);

  return items;
}
