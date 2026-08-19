"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { SortDropdown, ViewToggle, Pagination } from "@/components/shop/ShopControls";
import ProductGrid from "@/components/product/ProductGrid";
import { fetchProducts, getAllBrands, getPriceRange } from "@/lib/services/productService";
import { getCategories } from "@/lib/services/cmsService";
import { fadeUp } from "@/lib/motion";

const PAGE_SIZE = 8;

function ShopPageInner() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || null,
    brand: null,
    minRating: null,
    maxPrice: null,
    inStockOnly: false,
    onSaleOnly: searchParams.get("filter") === "sale",
    newOnly: searchParams.get("filter") === "new",
    sort: searchParams.get("sort") || "featured",
  });

  const brands = useMemo(() => getAllBrands(), []);
  const priceRange = useMemo(() => getPriceRange(), []);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Sync category search parameter to filters when URL updates
  useEffect(() => {
    const category = searchParams.get("category");
    setFilters((prev) => ({
      ...prev,
      category: category || null,
    }));
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    fetchProducts(filters).then((res) => {
      setProducts(res);
      setLoading(false);
      setPage(1);
    });
  }, [filters]);

  const totalPages = Math.ceil(products.length / PAGE_SIZE) || 1;
  const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () =>
    setFilters({
      category: null,
      brand: null,
      minRating: null,
      maxPrice: null,
      inStockOnly: false,
      onSaleOnly: false,
      newOnly: false,
      sort: "featured",
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Shop" }]} />
      <h1 className="font-display text-4xl mt-3 mb-8">All Products</h1>

      <div className="flex gap-10">
        <div className="hidden lg:block">
          <FilterSidebar
            categories={categories}
            brands={brands}
            priceRange={priceRange}
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm border border-line rounded-sm px-3 py-2"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
            <p className="text-sm text-ink2">{products.length} results</p>
            <div className="flex items-center gap-3 ml-auto">
              <SortDropdown value={filters.sort} onChange={(sort) => setFilters((f) => ({ ...f, sort }))} />
              <ViewToggle view={view} onChange={setView} />
            </div>
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <ProductGrid
              products={paginated}
              loading={loading}
              columns={view === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}
              isCategoryFilter={!!filters.category}
            />
          </motion.div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Mobile filter overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-paper p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            <FilterSidebar
              categories={categories}
              brands={brands}
              priceRange={priceRange}
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageInner />
    </Suspense>
  );
}
