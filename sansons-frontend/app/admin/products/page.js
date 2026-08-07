"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, AlertTriangle, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

import { AdminTopbar } from "@/components/admin/AdminUI";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { fetchAdminProducts, deleteProduct, toggleProductPublish } from "@/lib/services/productService";

import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/lib/context/ToastContext";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const { showToast } = useToast();

  const loadProducts = () => {
    setLoading(true);
    setError(null);
    fetchAdminProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        const msg = err?.response?.status === 401
          ? "Session expired. Please log out and log in again."
          : "Failed to load products. Is the Django server running on port 8000?";
        setError(msg);
        setLoading(false);
      });
  };

  // Layout already ensures authentication before this page renders
  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);

  const lowStockProducts = useMemo(() => products.filter((p) => p.stock > 0 && p.stock <= 5), [products]);
  const outOfStockProducts = useMemo(() => products.filter((p) => p.stock === 0), [products]);

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    let matchesStock = true;
    if (stockFilter === "low") matchesStock = p.stock > 0 && p.stock <= 5;
    if (stockFilter === "out") matchesStock = p.stock === 0;
    if (stockFilter === "in") matchesStock = p.stock > 5;
    return matchesQuery && matchesCategory && matchesStock;
  });

  const handleDelete = async (id) => {
    if (confirm("Delete this product? This cannot be undone.")) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast("Product deleted successfully", "success");
      } catch (err) {
        showToast("Failed to delete product", "danger");
      }
    }
  };

  const handleTogglePublish = async (id, currentPublishedStatus) => {
    try {
      const res = await toggleProductPublish(id, !currentPublishedStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPublished: res.is_published, is_published: res.is_published } : p))
      );
      showToast(
        res.is_published
          ? "Product is now live & visible on the storefront!"
          : "Product is now hidden from storefront.",
        "info"
      );
    } catch (err) {
      showToast("Failed to update product visibility", "danger");
    }
  };

  return (
    <div>
      <AdminTopbar
        title="Products"
        actions={
          <Button as={Link} href="/admin/products/new" variant="primary" size="sm">
            <Plus size={15} /> Add Product
          </Button>
        }
      />
      <div className="p-8">
        {/* Inventory Alert Cards Banner */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-md">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">Low Stock Alert</p>
                <p className="text-xs text-amber-700">{lowStockProducts.length} product(s) have 5 or fewer items remaining</p>
              </div>
            </div>
            <button
              onClick={() => setStockFilter(stockFilter === "low" ? "all" : "low")}
              className={`text-xs px-3 py-1.5 rounded-sm font-medium transition-colors ${
                stockFilter === "low" ? "bg-amber-800 text-white" : "bg-amber-200 text-amber-900 hover:bg-amber-300"
              }`}
            >
              {stockFilter === "low" ? "Show All" : "View Low Stock"}
            </button>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-md p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-800 rounded-md">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-900">Sold Out Alert</p>
                <p className="text-xs text-rose-700">{outOfStockProducts.length} product(s) are completely out of stock (0 left)</p>
              </div>
            </div>
            <button
              onClick={() => setStockFilter(stockFilter === "out" ? "all" : "out")}
              className={`text-xs px-3 py-1.5 rounded-sm font-medium transition-colors ${
                stockFilter === "out" ? "bg-rose-800 text-white" : "bg-rose-200 text-rose-900 hover:bg-rose-300"
              }`}
            >
              {stockFilter === "out" ? "Show All" : "View Sold Out"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or SKU…"
              className="pl-9 pr-3 py-2.5 text-sm border border-line rounded-sm bg-paper outline-none focus:border-forest w-64"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-line rounded-sm text-sm px-3 py-2.5 bg-paper"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="border border-line rounded-sm text-sm px-3 py-2.5 bg-paper"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">⚠️ Low Stock (1–5 left)</option>
            <option value="out">🚫 Sold Out / Out of Stock (0 left)</option>
            <option value="in">✅ In Stock (&gt; 5 left)</option>
          </select>
          <p className="text-sm text-ink2 ml-auto">
            {loading ? "Loading..." : `${filtered.length} products`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-ink2 text-sm">
            Loading products from database...
          </div>
        ) : error ? (
          <div className="bg-wine/10 border border-wine/30 rounded-md px-6 py-8 text-center">
            <p className="text-wine text-sm font-medium mb-3">{error}</p>
            <button
              onClick={loadProducts}
              className="text-xs px-4 py-2 bg-forest text-white rounded-sm hover:bg-forest/80 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="bg-paper border border-line rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink2 text-xs uppercase bg-canvas2">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock Quantity</th>
                  <th className="px-6 py-3">Stock Status</th>
                  <th className="px-6 py-3">Visibility</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-t border-line ${
                      p.stock === 0 ? "bg-rose-50/40" : p.stock <= 5 ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded-sm overflow-hidden bg-canvas2 shrink-0">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <span className="font-medium line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-ink2">{p.sku}</td>
                    <td className="px-6 py-3.5 capitalize text-ink2">{p.category}</td>
                    <td className="px-6 py-3.5 font-mono">{formatCurrency(p.price)}</td>
                    <td className="px-6 py-3.5 font-mono font-medium">
                      {p.stock === 0 ? (
                        <span className="text-rose-600 font-bold">0 (Sold Out)</span>
                      ) : p.stock <= 5 ? (
                        <span className="text-amber-600 font-bold">{p.stock} left</span>
                      ) : (
                        <span>{p.stock} units</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      {p.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-100 text-rose-800 text-xs font-semibold">
                          <AlertCircle size={14} /> Sold Out
                        </span>
                      ) : p.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-semibold">
                          <AlertTriangle size={14} /> Low Stock ({p.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-medium">
                          <CheckCircle2 size={14} /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      {p.isPublished !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-medium bg-emerald-100/80 px-2.5 py-1 rounded">
                          <Eye size={13} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-700 font-medium bg-zinc-200 px-2.5 py-1 rounded">
                          <EyeOff size={13} /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end items-center gap-2.5">
                        <button
                          onClick={() => handleTogglePublish(p.id, p.isPublished !== false)}
                          title={p.isPublished !== false ? "Hide product from storefront" : "Unhide / Publish product on storefront"}
                          aria-label="Toggle storefront visibility"
                          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded font-semibold transition-colors border ${
                            p.isPublished !== false
                              ? "border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                              : "border-zinc-300 text-zinc-700 bg-zinc-100 hover:bg-zinc-200"
                          }`}
                        >
                          {p.isPublished !== false ? (
                            <>
                              <EyeOff size={12} /> Hide
                            </>
                          ) : (
                            <>
                              <Eye size={12} /> Publish
                            </>
                          )}
                        </button>
                        <Link
                          href={`/admin/products/new?id=${p.id}`}
                          aria-label="Edit product"
                          className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 bg-forest text-white rounded hover:bg-forest/80 font-semibold"
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          aria-label="Delete product"
                          className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 border border-wine/30 text-wine rounded hover:bg-wine/5 font-semibold"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-ink2 text-sm">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
