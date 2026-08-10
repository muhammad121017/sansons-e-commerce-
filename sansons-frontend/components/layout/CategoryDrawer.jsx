"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronRight, Folder, ShoppingBag, Sparkles, Flame, Grid, ArrowRight, Package } from "lucide-react";
import api from "@/lib/api";

export default function CategoryDrawer({ open, onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMainId, setSelectedMainId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get("products/categories/")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setCategories(list);
        
        // Default selected main category
        const mains = list.filter((c) => !c.parent && !c.parent_id);
        if (mains.length > 0) {
          setSelectedMainId(mains[0].id);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [open]);

  // Separate Main Categories & Sub-Categories
  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parent && !c.parent_id);
  }, [categories]);

  // Filtered Main Categories based on search query
  const filteredMains = useMemo(() => {
    if (!searchQuery.trim()) return mainCategories;
    const q = searchQuery.toLowerCase();
    return mainCategories.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.subcategories && m.subcategories.some((s) => s.name.toLowerCase().includes(q)))
    );
  }, [mainCategories, searchQuery]);

  // Get active selected Main Category object
  const activeMain = useMemo(() => {
    return mainCategories.find((c) => c.id === selectedMainId) || filteredMains[0] || mainCategories[0] || null;
  }, [mainCategories, selectedMainId, filteredMains]);

  // Sub-categories for active main category
  const activeSubcategories = useMemo(() => {
    if (!activeMain) return [];
    if (activeMain.subcategories && activeMain.subcategories.length > 0) {
      return activeMain.subcategories;
    }
    return categories.filter((c) => c.parent === activeMain.id || c.parent_id === activeMain.id);
  }, [activeMain, categories]);

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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Luxury Drawer Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed top-0 left-0 h-screen z-50 w-full max-w-2xl bg-paper text-ink border-r border-line shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-canvas shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-forest/10 text-forest border border-forest/20 shrink-0">
                  <Grid size={20} />
                </div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl text-ink font-bold tracking-tight">Product Categories</h2>
                  <p className="text-[11px] sm:text-xs text-ink2">Browse main &amp; sub-categories</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-paper text-ink2 hover:text-ink transition-colors border border-line shrink-0"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="p-3.5 border-b border-line bg-paper shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink2" />
                <input
                  type="text"
                  placeholder="Search main or sub-categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-canvas border border-line rounded-lg pl-9 pr-4 py-2 text-xs text-ink placeholder:text-ink2 outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink2 hover:text-ink font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="px-4 py-2.5 bg-canvas border-b border-line flex items-center gap-2 overflow-x-auto text-xs shrink-0 scrollbar-none">
              <span className="text-[10px] font-bold text-ink2 uppercase tracking-wider shrink-0">Quick Filter:</span>
              <Link
                href="/shop?sort=newest"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-line bg-paper hover:border-forest hover:text-forest transition-colors font-medium shrink-0 text-[11px]"
              >
                <Sparkles size={12} className="text-brass" /> New Arrivals
              </Link>
              <Link
                href="/shop?sort=best-selling"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-line bg-paper hover:border-forest hover:text-forest transition-colors font-medium shrink-0 text-[11px]"
              >
                <Flame size={12} className="text-wine" /> Best Sellers
              </Link>
              <Link
                href="/shop"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-line bg-paper hover:border-forest hover:text-forest transition-colors font-medium shrink-0 text-[11px]"
              >
                <ShoppingBag size={12} /> All Shop
              </Link>
            </div>

            {/* 2-Column Body Content */}
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden bg-paper">
              {/* Left Column: Main Categories List */}
              <div className="w-full sm:w-5/12 border-b sm:border-b-0 sm:border-r border-line overflow-y-auto bg-canvas p-3 space-y-1.5 shrink-0 max-h-[40vh] sm:max-h-none">
                <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-ink2 font-bold flex justify-between items-center">
                  <span>Main Categories</span>
                  <span>{filteredMains.length}</span>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs text-ink2">Loading categories...</div>
                ) : filteredMains.length === 0 ? (
                  <div className="py-8 text-center text-xs text-ink2">No matching main categories.</div>
                ) : (
                  filteredMains.map((mainCat) => {
                    const isSelected = activeMain?.id === mainCat.id;
                    const subCount = mainCat.subcategories?.length || categories.filter((c) => c.parent === mainCat.id || c.parent_id === mainCat.id).length;

                    return (
                      <button
                        key={mainCat.id}
                        onClick={() => setSelectedMainId(mainCat.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-paper border-forest text-forest shadow-sm ring-1 ring-forest/30"
                            : "bg-canvas border-line hover:bg-paper/80 text-ink hover:border-line"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {mainCat.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mainCat.image}
                              alt={mainCat.name}
                              className="w-9 h-9 rounded-lg object-cover border border-line shrink-0"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? "bg-forest text-canvas" : "bg-forest/10 text-forest"
                            }`}>
                              {mainCat.name.substring(0, 1)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-xs truncate leading-snug">{mainCat.name}</h3>
                            <p className="text-[10px] text-ink2 font-mono mt-0.5">
                              {subCount > 0 ? `${subCount} sub-categories` : `${mainCat.count || 0} items`}
                            </p>
                          </div>
                        </div>

                        <ChevronRight size={16} className={`shrink-0 transition-transform ${isSelected ? "text-forest translate-x-0.5" : "text-ink2"}`} />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Active Category Sub-Categories & Quick Shop Details */}
              <div className="w-1/2 overflow-y-auto bg-paper p-5 flex flex-col justify-between">
                {activeMain ? (
                  <div className="space-y-4">
                    {/* Active Category Header Card */}
                    <div className="p-4 rounded-xl bg-canvas border border-line space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-forest/10 px-2.5 py-1 rounded-full border border-forest/20">
                          Selected Category
                        </span>
                        <Link
                          href={`/shop?category=${activeMain.slug}`}
                          onClick={onClose}
                          className="text-xs text-forest hover:underline font-semibold flex items-center gap-1"
                        >
                          Explore Main <ArrowRight size={12} />
                        </Link>
                      </div>
                      <h3 className="font-display text-lg font-bold text-ink">{activeMain.name}</h3>
                      {activeMain.description && (
                        <p className="text-xs text-ink2 line-clamp-2 leading-relaxed">{activeMain.description}</p>
                      )}
                    </div>

                    {/* Sub-Categories Header */}
                    <div className="flex items-center justify-between pt-2 border-t border-line">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                        Sub-Categories ({activeSubcategories.length})
                      </h4>
                    </div>

                    {/* Sub-Categories Grid */}
                    {activeSubcategories.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-line text-center space-y-2 bg-canvas/50">
                        <Package size={24} className="mx-auto text-ink2" />
                        <p className="text-xs text-ink2 font-medium">No sub-categories defined yet for {activeMain.name}.</p>
                        <Link
                          href={`/shop?category=${activeMain.slug}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 text-xs text-forest font-semibold hover:underline pt-1"
                        >
                          Browse All {activeMain.name} Products <ArrowRight size={12} />
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {activeSubcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/shop?category=${sub.slug}`}
                            onClick={onClose}
                            className="group p-3 rounded-lg border border-line bg-canvas hover:border-forest hover:bg-forest/5 transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full bg-forest/40 group-hover:bg-forest transition-colors" />
                              <span className="text-xs font-semibold text-ink group-hover:text-forest transition-colors">
                                {sub.name}
                              </span>
                            </div>
                            {sub.count !== undefined && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-paper border border-line text-ink2 group-hover:border-forest/30">
                                {sub.count} items
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center text-xs text-ink2">Select a main category to view sub-categories.</div>
                )}

                {/* Direct Shop Button */}
                {activeMain && (
                  <div className="pt-4 border-t border-line mt-6">
                    <Link
                      href={`/shop?category=${activeMain.slug}`}
                      onClick={onClose}
                      className="w-full py-3 bg-forest text-canvas rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-forest/90 transition-all shadow-md"
                    >
                      <ShoppingBag size={15} /> Shop All {activeMain.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
