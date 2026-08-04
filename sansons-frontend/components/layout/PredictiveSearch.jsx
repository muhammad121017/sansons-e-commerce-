"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fadeIn, dropdownFade } from "@/lib/motion";
import { fetchProducts } from "@/lib/services/productService";
import { getTrendingSearches, getPopularSearches } from "@/lib/services/cmsService";
import { formatCurrency } from "@/lib/utils";

const HISTORY_KEY = "luxe_search_history_v1";

export default function PredictiveSearch({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [history, setHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    getTrendingSearches().then(setTrending);
    getPopularSearches().then(setPopular);
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => {
      fetchProducts({ query }).then((res) => setResults(res.slice(0, 5)));
    }, 200);
    return () => clearTimeout(id);
  }, [query]);

  const runSearch = (term) => {
    if (!term.trim()) return;
    try {
      const next = [term, ...history.filter((h) => h !== term)].slice(0, 6);
      setHistory(next);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch (e) {}
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="absolute inset-0 bg-ink/50"
            onClick={onClose}
          />
          <motion.div
            variants={dropdownFade}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative z-10 bg-paper max-w-3xl mx-auto mt-24 rounded-md shadow-lift overflow-hidden"
            role="search"
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <Search size={20} className="text-ink2" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
                placeholder="Search products, brands, categories…"
                className="flex-1 bg-transparent outline-none text-lg placeholder:text-ink2/60"
                aria-label="Search products"
              />
              <button onClick={onClose} aria-label="Close search" className="p-1 text-ink2 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {query.trim() ? (
                results.length > 0 ? (
                  <ul className="space-y-1">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/product/${p.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 p-2 rounded-sm hover:bg-canvas2"
                        >
                          <div className="relative w-14 h-14 shrink-0 rounded-sm overflow-hidden bg-canvas2">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-ink2">{p.brand}</p>
                          </div>
                          <span className="text-sm font-mono">{formatCurrency(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => runSearch(query)}
                        className="w-full text-left p-2 text-sm text-forest hover:underline"
                      >
                        See all results for “{query}”
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-ink2 mb-2">No matches for “{query}”.</p>
                    <p className="text-sm text-ink2">Try checking your spelling or browse trending searches below.</p>
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  {history.length > 0 && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink2 mb-2">
                        <Clock size={12} /> Recent
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {history.map((h) => (
                          <button
                            key={h}
                            onClick={() => runSearch(h)}
                            className="text-sm px-3 py-1.5 rounded-full bg-canvas2 hover:bg-line"
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink2 mb-2">
                      <TrendingUp size={12} /> Trending Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trending.map((t) => (
                        <button
                          key={t}
                          onClick={() => runSearch(t)}
                          className="text-sm px-3 py-1.5 rounded-full bg-canvas2 hover:bg-line"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink2 mb-2">Popular Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {popular.map((t) => (
                        <button
                          key={t}
                          onClick={() => runSearch(t)}
                          className="text-sm px-3 py-1.5 rounded-full bg-canvas2 hover:bg-line"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
