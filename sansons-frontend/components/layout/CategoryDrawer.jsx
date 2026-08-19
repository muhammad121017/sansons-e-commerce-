"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, ChevronDown, ChevronRight, Folder } from "lucide-react";
import api from "@/lib/api";

export default function CategoryDrawer({ open, onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const pathname = usePathname();

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

  // Separate Main Categories
  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parent && !c.parent_id);
  }, [categories]);

  // Get sub-categories for a given main category
  const getSubcategories = (mainCat) => {
    if (mainCat.subcategories && mainCat.subcategories.length > 0) {
      return mainCat.subcategories;
    }
    return categories.filter((c) => c.parent === mainCat.id || c.parent_id === mainCat.id);
  };

  // Toggle expand/collapse
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed top-0 left-0 h-screen z-50 w-[300px] sm:w-[320px] bg-paper text-ink border-r border-line shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-line flex items-center justify-between shrink-0">
              <h2 className="font-display text-lg text-ink font-bold tracking-tight">
                Categories
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-canvas text-ink2 hover:text-ink transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Category List */}
            <nav className="flex-1 overflow-y-auto py-2">

              {/* Home Button */}
              <Link
                href="/"
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${
                  pathname === "/" 
                    ? "text-forest bg-forest/5 border-r-2 border-forest" 
                    : "text-ink hover:text-forest hover:bg-canvas"
                }`}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>

              {/* Divider */}
              <div className="mx-4 my-2 border-t border-line/60" />

              {/* Category List */}
              {loading ? (
                <div className="px-5 py-8 text-center text-xs text-ink2">
                  Loading categories...
                </div>
              ) : mainCategories.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-ink2">
                  No categories found.
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {mainCategories.map((cat) => {
                    const subs = getSubcategories(cat);
                    const hasSubs = subs.length > 0;
                    const isExpanded = expandedIds.has(cat.id);

                    return (
                      <li key={cat.id}>
                        {/* Main Category Row */}
                        <div className="flex items-center">
                          {/* Category Name — links to shop */}
                          <Link
                            href={`/shop?category=${cat.slug}`}
                            onClick={onClose}
                            className="flex-1 flex items-center gap-3 px-5 py-3 text-sm font-medium text-ink hover:text-forest hover:bg-canvas transition-colors"
                          >
                            {cat.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-6 h-6 rounded object-cover border border-line shrink-0"
                              />
                            ) : (
                              <Folder size={16} className="text-forest/60 shrink-0" />
                            )}
                            <span>{cat.name}</span>
                          </Link>

                          {/* Expand/Collapse Button */}
                          {hasSubs && (
                            <button
                              onClick={() => toggleExpand(cat.id)}
                              className="p-3 mr-2 text-ink2 hover:text-forest transition-colors"
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                            >
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown size={16} />
                              </motion.div>
                            </button>
                          )}
                        </div>

                        {/* Sub-Categories Dropdown */}
                        <AnimatePresence initial={false}>
                          {hasSubs && isExpanded && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden bg-canvas/50"
                            >
                              {subs.map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    href={`/shop?category=${sub.slug}`}
                                    onClick={onClose}
                                    className="flex items-center gap-2.5 pl-14 pr-5 py-2.5 text-[13px] text-ink2 hover:text-forest hover:bg-forest/5 transition-colors"
                                  >
                                    <ChevronRight size={12} className="text-forest/40 shrink-0" />
                                    <span>{sub.name}</span>
                                    {sub.count !== undefined && (
                                      <span className="ml-auto text-[10px] font-mono text-ink2/60">
                                        {sub.count}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              )}
            </nav>

            {/* Footer — All Products link */}
            <div className="p-4 border-t border-line shrink-0">
              <Link
                href="/shop"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-forest text-canvas rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition-all shadow-sm"
              >
                Browse All Products
                <ChevronRight size={14} />
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
