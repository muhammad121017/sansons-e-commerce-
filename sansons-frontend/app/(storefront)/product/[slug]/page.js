"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Share2, Truck, RotateCcw, Banknote, Check } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import QuantitySelector from "@/components/ui/QuantitySelector";
import { AccordionItem } from "@/components/ui/Accordion";
import ReviewsSection from "@/components/product/ReviewsSection";
import { RelatedProducts, RecentlyViewedRail } from "@/components/product/RelatedProducts";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/services/productService";
import { getReviewsForProduct } from "@/lib/data/reviews";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useToast } from "@/lib/context/ToastContext";
import { trackRecentlyViewed, useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { formatCurrency, discountPercent } from "@/lib/utils";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const recentlyViewed = useRecentlyViewed(product?.id);

  useEffect(() => {
    setLoading(true);
    fetchProductBySlug(slug).then((p) => {
      setProduct(p);
      setLoading(false);
      if (p) {
        setColor(p.variants?.colors?.[0]?.name || "");
        setSize(p.variants?.sizes?.[0] || "");
        trackRecentlyViewed(p);
        fetchRelatedProducts(p).then(setRelated);
      }
    });
  }, [slug]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-24 text-center text-ink2">Loading…</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-3">Product not found</h1>
        <p className="text-ink2">This item may have been removed or the link is incorrect.</p>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock === 0;
  const wished = isWishlisted(product.id);

  const handleAddToCart = () => {
    addItem(product, { color, size, quantity });
    showToast(`${product.name} added to bag`, "success");
  };

  const handleBuyNow = () => {
    addItem(product, { color, size, quantity });
    showToast("Redirecting to checkout…", "info");
    window.location.href = "/checkout";
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard", "success");
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Breadcrumb items={[{ label: "Shop", href: "/shop" }, { label: product.name }]} />
      </div>

      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-12"
      >
        <motion.div variants={fadeUp}>
          <ProductGallery images={product.images} name={product.name} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <p className="text-xs uppercase tracking-wider text-ink2">{product.brand}</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-1">{product.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            <span className="text-xs text-ink2 font-mono">SKU: {product.sku}</span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="font-mono text-2xl font-medium">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="font-mono text-base text-ink2 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
                <Badge tone="sale">-{discount}%</Badge>
              </>
            )}
          </div>

          <p className="text-ink2 leading-relaxed mt-5">{product.description}</p>

          {product.variants?.colors?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-ink2 mb-2">Color: {color}</p>
              <div className="flex gap-2">
                {product.variants.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    aria-pressed={color === c.name}
                    className={`w-9 h-9 rounded-full border-2 ${color === c.name ? "border-forest" : "border-line"}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.variants?.sizes?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-ink2 mb-2">Size: {size}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`px-3.5 py-2 text-sm border rounded-sm ${
                      size === s ? "border-forest bg-forest text-canvas" : "border-line hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center gap-3">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <Button variant="primary" size="lg" className="flex-1" disabled={outOfStock} onClick={handleAddToCart}>
              {outOfStock ? "Out of Stock" : "Add to Bag"}
            </Button>
            <button
              onClick={() => {
                toggleWishlist(product);
                showToast(wished ? "Removed from wishlist" : "Added to wishlist", "success");
              }}
              aria-label="Toggle wishlist"
              className="p-4 border border-line rounded-sm hover:border-ink"
            >
              <Heart size={18} className={wished ? "fill-wine text-wine" : ""} />
            </button>
            <button onClick={handleShare} aria-label="Share product" className="p-4 border border-line rounded-sm hover:border-ink">
              <Share2 size={18} />
            </button>
          </div>

          {!outOfStock && (
            <Button variant="outline" size="lg" className="w-full mt-3" onClick={handleBuyNow}>
              Buy Now
            </Button>
          )}

          <div className="grid grid-cols-3 gap-3 mt-8 text-center">
            <InfoChip icon={Truck} label={product.deliveryEstimate} />
            <InfoChip icon={RotateCcw} label={product.returnPolicy} />
            {product.codAvailable && <InfoChip icon={Banknote} label="COD Available" />}
          </div>

          <div className="mt-10">
            <AccordionItem
              question="Specifications"
              answer={Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join("  •  ")}
              defaultOpen
            />
            <AccordionItem
              question="Delivery Information"
              answer={`Estimated delivery: ${product.deliveryEstimate}. ${product.codAvailable ? "Cash on delivery is available for this item." : "This item ships prepaid only."}`}
            />
            <AccordionItem question="Return Policy" answer={product.returnPolicy} />
          </div>
        </motion.div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-6 py-16 border-t border-line">
        <h2 className="font-display text-2xl mb-8">Reviews</h2>
        <ReviewsSection product={product} reviews={getReviewsForProduct(product.id)} />
      </div>

      <RelatedProducts title="You May Also Like" products={related} />
      <RecentlyViewedRail items={recentlyViewed} />
    </div>
  );
}

function InfoChip({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 border border-line rounded-sm">
      <Icon size={18} className="text-forest" />
      <p className="text-xs text-ink2 leading-tight">{label}</p>
    </div>
  );
}
