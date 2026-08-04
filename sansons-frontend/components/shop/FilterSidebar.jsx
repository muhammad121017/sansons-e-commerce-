"use client";

import { AccordionItem } from "@/components/ui/Accordion";
import StarRating from "@/components/ui/StarRating";

export default function FilterSidebar({ categories, brands, priceRange, filters, onChange, onClear }) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Filters</h3>
        <button onClick={onClear} className="text-xs text-forest underline">
          Clear all
        </button>
      </div>

      <AccordionItemGroup title="Category" defaultOpen>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c.slug} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === c.slug}
                onChange={() => update({ category: c.slug })}
                className="accent-forest"
              />
              {c.name}
            </label>
          ))}
          {filters.category && (
            <button onClick={() => update({ category: null })} className="text-xs text-ink2 underline">
              Reset category
            </button>
          )}
        </div>
      </AccordionItemGroup>

      <AccordionItemGroup title="Brand">
        <div className="space-y-2">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="brand"
                checked={filters.brand === b}
                onChange={() => update({ brand: b })}
                className="accent-forest"
              />
              {b}
            </label>
          ))}
          {filters.brand && (
            <button onClick={() => update({ brand: null })} className="text-xs text-ink2 underline">
              Reset brand
            </button>
          )}
        </div>
      </AccordionItemGroup>

      <AccordionItemGroup title="Price">
        <div className="space-y-3">
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={filters.maxPrice ?? priceRange.max}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
            className="w-full accent-forest"
          />
          <p className="text-xs text-ink2">
            Up to ${filters.maxPrice ?? priceRange.max}
          </p>
        </div>
      </AccordionItemGroup>

      <AccordionItemGroup title="Rating">
        <div className="space-y-2">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === r}
                onChange={() => update({ minRating: r })}
                className="accent-forest"
              />
              <StarRating rating={r} showCount={false} size={13} /> & up
            </label>
          ))}
          {filters.minRating && (
            <button onClick={() => update({ minRating: null })} className="text-xs text-ink2 underline">
              Reset rating
            </button>
          )}
        </div>
      </AccordionItemGroup>

      <AccordionItemGroup title="Availability & Deals">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.inStockOnly}
              onChange={(e) => update({ inStockOnly: e.target.checked })}
              className="accent-forest"
            />
            In stock only
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.onSaleOnly}
              onChange={(e) => update({ onSaleOnly: e.target.checked })}
              className="accent-forest"
            />
            On sale
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.newOnly}
              onChange={(e) => update({ newOnly: e.target.checked })}
              className="accent-forest"
            />
            New arrivals
          </label>
        </div>
      </AccordionItemGroup>
    </aside>
  );
}

function AccordionItemGroup({ title, children, defaultOpen = false }) {
  return (
    <div className="border-b border-line py-4">
      <details open={defaultOpen}>
        <summary className="cursor-pointer text-sm font-medium mb-3 list-none">{title}</summary>
        {children}
      </details>
    </div>
  );
}
