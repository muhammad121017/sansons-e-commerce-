"use client";

import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";

const OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export function SortDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort products"
      className="border border-line rounded-sm text-sm px-3 py-2 bg-paper"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          Sort: {o.label}
        </option>
      ))}
    </select>
  );
}

export function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center border border-line rounded-sm overflow-hidden">
      <button
        onClick={() => onChange("grid")}
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        className={`p-2 ${view === "grid" ? "bg-ink text-canvas" : "hover:bg-canvas2"}`}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onChange("list")}
        aria-label="List view"
        aria-pressed={view === "list"}
        className={`p-2 ${view === "list" ? "bg-ink text-canvas" : "hover:bg-canvas2"}`}
      >
        <List size={16} />
      </button>
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-14">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        className="p-2 border border-line rounded-sm disabled:opacity-30 hover:bg-canvas2"
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          aria-current={page === i + 1}
          className={`w-9 h-9 text-sm rounded-sm border ${
            page === i + 1 ? "bg-ink text-canvas border-ink" : "border-line hover:bg-canvas2"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
        className="p-2 border border-line rounded-sm disabled:opacity-30 hover:bg-canvas2"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
