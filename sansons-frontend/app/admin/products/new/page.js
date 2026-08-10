"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Upload, X, Plus } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Button from "@/components/ui/Button";
import { fetchProductBySlug, createProduct, updateProduct } from "@/lib/services/productService";
import { useToast } from "@/lib/context/ToastContext";
import api from "@/lib/api";

function ProductFormInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const initialCatFromUrl = searchParams.get("subcategory") || searchParams.get("category");
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [newUrlInput, setNewUrlInput] = useState("");

  const [form, setForm] = useState({
    name: "",
    brand: "",
    sku: "",
    category: initialCatFromUrl || "",
    price: "",
    compareAtPrice: "",
    stock: "",
    description: "",
    isPublished: true,
    isNew: false,
    isBestSeller: false,
    codAvailable: true,
  });

  useEffect(() => {
    api.get("products/categories/").then((res) => {
      const cats = res.data?.results || res.data || [];
      setCategories(cats);
      if (!id && !initialCatFromUrl && cats.length > 0) {
        setForm((f) => ({ ...f, category: cats[0].slug }));
      }
    }).catch(() => {
      setCategories([
        { id: "1", slug: "electronics", name: "Electronics" },
        { id: "2", slug: "fashion-apparel", name: "Fashion & Apparel" },
        { id: "3", slug: "home-living", name: "Home & Living" },
        { id: "4", slug: "sports-outdoors", name: "Sports & Outdoors" },
      ]);
    });
  }, [id, initialCatFromUrl]);

  useEffect(() => {
    if (id) {
      setInitialLoading(true);
      fetchProductBySlug(id).then((editing) => {
        if (editing) {
          setForm({
            name: editing.name,
            brand: editing.brand || "",
            sku: editing.sku,
            category: editing.category,
            price: editing.price,
            compareAtPrice: editing.compareAtPrice || "",
            stock: editing.stock,
            description: editing.description,
            isPublished: editing.isPublished ?? editing.is_published ?? true,
            isNew: editing.isNew,
            isBestSeller: editing.isBestSeller,
            codAvailable: editing.codAvailable,
          });
          if (Array.isArray(editing.images) && editing.images.length > 0) {
            setImageUrls(editing.images);
          }
        }
        setInitialLoading(false);
      });
    }
  }, [id]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleMultipleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrls((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addImageUrl = () => {
    if (newUrlInput.trim()) {
      setImageUrls((prev) => [...prev, newUrlInput.trim()]);
      setNewUrlInput("");
    }
  };

  const removeImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      showToast("Please select a category", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        is_published: form.isPublished,
        imageUrl: imageUrls[0] || "",
        images: imageUrls
      };

      if (id) {
        await updateProduct(id, payload);
        showToast("Product updated successfully", "success");
      } else {
        await createProduct(payload);
        showToast("Product created successfully with multiple photos", "success");
      }
      router.push("/admin/products");
    } catch (err) {
      const detail = err?.response?.data;
      const msg = detail
        ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
        : (id ? "Failed to update product" : "Failed to create product");
      showToast(msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div>
        <AdminTopbar title={id ? "Edit Product" : "Add Product"} />
        <div className="p-8 text-center text-ink2 text-sm">
          Loading product details from database...
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminTopbar title={id ? "Edit Product" : "Add Product"} />
      <div className="p-8 max-w-3xl">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-ink2 hover:text-ink mb-6">
          <ArrowLeft size={15} /> Back to Products
        </Link>

        <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-md p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Name" value={form.name} onChange={(v) => update({ name: v })} className="col-span-2" required />
            <Field label="Brand" value={form.brand} onChange={(v) => update({ brand: v })} />
            <Field label="SKU" value={form.sku} onChange={(v) => update({ sku: v })} />

            <label className="block text-sm">
              <div className="flex justify-between items-center mb-1.5">
                <span className="block text-xs uppercase tracking-wider text-ink2 font-semibold">
                  Target Category / Sub-Category *
                </span>
                <Link
                  href="/admin/categories"
                  className="text-[11px] text-forest font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Request New Category to Admin
                </Link>
              </div>
              <select
                value={form.category}
                onChange={(e) => update({ category: e.target.value })}
                required
                className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
              >
                {categories.length === 0 && <option value="">Loading categories…</option>}
                {categories
                  .filter((c) => !c.parent && !c.parent_id)
                  .map((mainCat) => {
                    const subs = categories.filter((c) => c.parent === mainCat.id || c.parent_id === mainCat.id);
                    return (
                      <optgroup key={mainCat.id} label={`📂 ${mainCat.name}`}>
                        <option value={mainCat.slug}>👉 {mainCat.name} (Main Category)</option>
                        {subs.map((sub) => (
                          <option key={sub.id} value={sub.slug}>
                            &nbsp;&nbsp;&nbsp;&nbsp;↳ {sub.name} (Sub-Category)
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
              </select>
            </label>

            <Field label="Price (PKR)" type="number" value={form.price} onChange={(v) => update({ price: v })} required />

            <Field label="Compare-at Price (optional)" type="number" value={form.compareAtPrice} onChange={(v) => update({ compareAtPrice: v })} />
            <Field label="Stock Quantity" type="number" value={form.stock} onChange={(v) => update({ stock: v })} required />
          </div>

          {/* MULTI-PHOTO UPLOAD SECTION */}
          <div className="border border-line rounded-sm p-4 space-y-3 bg-canvas/30">
            <span className="block text-xs uppercase tracking-wider text-ink2 font-medium">Product Photos (Multiple Supported)</span>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newUrlInput}
                onChange={(e) => setNewUrlInput(e.target.value)}
                placeholder="Paste Image URL (https://...)"
                className="flex-1 border border-line rounded-sm px-3.5 py-2 text-xs bg-paper outline-none focus:border-forest"
              />
              <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                <Plus size={14} /> Add URL
              </Button>
              <label className="cursor-pointer bg-forest text-white hover:bg-forest/90 px-3 py-2 rounded-sm text-xs flex items-center gap-1.5 transition-colors">
                <Upload size={14} /> Browse Multiple Files
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleMultipleFiles} />
              </label>
            </div>

            {/* PREVIEW THUMBNAILS GRID */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-3 pt-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square border border-line rounded-sm overflow-hidden group bg-canvas2">
                    <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-wine/80 hover:bg-wine text-white p-1 rounded-full text-xs shadow-sm transition-colors"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
            />
          </label>

          <div className="flex flex-wrap gap-6 border-t border-b border-line py-4 my-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink cursor-pointer bg-canvas px-3 py-1.5 border border-line rounded">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => update({ isPublished: e.target.checked })}
                className="accent-forest w-4 h-4"
              />
              <span>Published on Storefront (Visible to Customers)</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isNew} onChange={(e) => update({ isNew: e.target.checked })} className="accent-forest" />
              Mark as New
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => update({ isBestSeller: e.target.checked })} className="accent-forest" />
              Best Seller
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.codAvailable} onChange={(e) => update({ codAvailable: e.target.checked })} className="accent-forest" />
              COD Available
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              <Save size={15} /> {loading ? "Saving..." : (id ? "Save Changes" : "Create Product")}
            </Button>
            <Button as={Link} href="/admin/products" variant="ghost" type="button">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", className = "", required = false }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
      />
    </label>
  );
}

export default function AdminProductFormPage() {
  return (
    <Suspense fallback={null}>
      <ProductFormInner />
    </Suspense>
  );
}
