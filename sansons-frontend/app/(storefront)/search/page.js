"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductGrid from "@/components/product/ProductGrid";
import { fetchProducts } from "@/lib/services/productService";
import { getPopularSearches } from "@/lib/services/cmsService";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ query }).then((res) => {
      setProducts(res);
      setLoading(false);
    });
    getPopularSearches().then(setPopular);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Search" }]} />
      <h1 className="font-display text-4xl mt-3 mb-2">
        {query ? `Results for “${query}”` : "Search"}
      </h1>
      {!loading && <p className="text-ink2 mb-8">{products.length} products found</p>}

      <ProductGrid products={products} loading={loading} />

      {!loading && products.length === 0 && (
        <div className="mt-8">
          <p className="text-sm text-ink2 mb-3">You might try:</p>
          <div className="flex flex-wrap gap-2">
            {popular.map((p) => (
              <a key={p} href={`/search?q=${encodeURIComponent(p)}`} className="text-sm px-3 py-1.5 rounded-full bg-canvas2 hover:bg-line">
                {p}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
