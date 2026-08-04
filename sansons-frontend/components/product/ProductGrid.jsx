import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { PackageSearch } from "lucide-react";

export default function ProductGrid({ products, loading, columns = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" }) {
  if (loading) return <ProductGridSkeleton count={8} />;

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No products found"
        description="Try adjusting your filters or search for something else."
        ctaLabel="Clear filters"
        ctaHref="/shop"
      />
    );
  }

  return (
    <div className={`grid ${columns} gap-x-6 gap-y-10`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
