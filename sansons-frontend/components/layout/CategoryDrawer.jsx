"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronDown, Folder, ShoppingBag, Sparkles, Flame, Shield, ArrowRight } from "lucide-react";
import api from "@/lib/api";

export default function CategoryDrawer({ open, onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCatId, setExpandedCatId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get("products/categories/")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setCategories(list);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [open]);

  // Main Categories (parent is null) vs Subcategories
  const mainCategories = categories.filter((c) => !c.parent && !c.parent_id);

  const toggleExpand = (id) => {
    setExpandedCatId((prev) => (prev === id ? null : id));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-md bg-paper border-r border-line shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-forest/10 text-forest">
                  <Folder size={20} />
                </div>
                <div>
                  <h2 className="font-display text-xl text-ink font-semibold">Store Categories</h2>
                  <p className="text-xs text-ink2">Browse main &amp; sub-categories</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-paper text-ink2 hover:text-ink transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Links Banner */}
            <div className="p-4 bg-paper border-b border-line grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/shop?sort=newest"
                onClick={onClose}
                className="flex items-center gap-2 p-2.5 rounded border border-line bg-canvas hover:border-forest hover:text-forest transition-colors font-medium"
              >
                <Sparkles size={14} className="text-brass" /> New Arrivals
              </Link>
              <Link
                href="/shop?sort=best-selling"
                onClick={onClose}
                className="flex items-center gap-2 p-2.5 rounded border border-line bg-canvas hover:border-forest hover:text-forest transition-colors font-medium"
              >
                <Flame size={14} className="text-wine" /> Best Sellers
              </Link>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-ink2 font-semibold mb-2">
                <span>Main Categories</span>
                <span>Sub-Categories</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-ink2">Loading categories...</div>
              ) : mainCategories.length === 0 ? (
                <div className="py-8 text-center text-sm text-ink2">
                  <p className="mb-3">No categories found.</p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-forest font-medium text-xs hover:underline"
                  >
                    <ShoppingBag size={14} /> Browse All Products
                  </Link>
                </div>
              ) : (
                mainCategories.map((mainCat) => {
                  const subs = mainCat.subcategories || categories.filter((c) => (c.parent === mainCat.id || c.parent_id === mainCat.id));
                  const isExpanded = expandedCatId === mainCat.id;

                  return (
                    <div key={mainCat.id} className="border border-line rounded-lg bg-canvas overflow-hidden transition-all">
                      {/* Main Category Row */}
                      <div className="flex items-center justify-between p-3.5 hover:bg-paper transition-colors">
                        <Link
                          href={`/shop?category=${mainCat.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 text-sm font-semibold text-ink hover:text-forest flex-1"
                        >
                          {mainCat.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={mainCat.image} alt={mainCat.name} className="w-8 h-8 rounded object-cover border border-line shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-forest/10 text-forest flex items-center justify-center font-bold text-xs shrink-0">
                              {mainCat.name.substring(0, 1)}
                            </div>
                          )}
                          <span>{mainCat.name}</span>
                          {mainCat.count > 0 && (
                            <span className="text-[10px] bg-paper border border-line px-2 py-0.5 rounded-full text-ink2">
                              {mainCat.count} items
                            </span>
                          )}
                        </Link>

                        {subs.length > 0 && (
                          <button
                            onClick={() => toggleExpand(mainCat.id)}
                            className="p-1.5 rounded hover:bg-canvas text-ink2 hover:text-ink shrink-0 ml-2"
                            title="Toggle Sub-Categories"
                          >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        )}
                      </div>

                      {/* Sub-Categories Accordion */}
                      <AnimatePresence>
                        {isExpanded && subs.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-paper border-t border-line px-4 py-3 space-y-2"
                          >
                            {subs.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/shop?category=${sub.slug}`}
                                onClick={onClose}
                                className="flex items-center justify-between text-xs py-1.5 px-3 rounded hover:bg-canvas text-ink2 hover:text-forest transition-colors font-medium"
                              >
                                <span className="flex items-center gap-2">
                                  <ArrowRight size={12} className="text-forest/60" /> {sub.name}
                                </span>
                                {sub.count !== undefined && (
                                  <span className="text-[10px] text-ink2 font-mono">{sub.count}</span>
                                )}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-line bg-canvas space-y-3">
              <Link
                href="/shop"
                onClick={onClose}
                className="w-full py-3 bg-forest text-canvas rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-forest/90 transition-colors shadow-soft"
              >
                <ShoppingBag size={16} /> View All Shop Catalog
              </Link>
              <div className="flex justify-between items-center text-xs text-ink2 pt-1">
                <Link href="/admin" onClick={onClose} className="hover:text-forest flex items-center gap-1 font-medium">
                  <Shield size={13} /> Admin Portal
                </Link>
                <Link href="/pages/contact" onClick={onClose} className="hover:text-forest">
                  Contact Support
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
