"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GripVertical, Eye, EyeOff, Save, Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Button from "@/components/ui/Button";
import { heroSlides as initialHero, announcementBar as initialAnnouncement, faq as initialFaq, brandStory as initialStory } from "@/lib/data/cms";
import { useToast } from "@/lib/context/ToastContext";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_HOMEPAGE_SECTIONS = [
  { id: "hero", label: "Hero Banner & Carousel", visible: true, order: 1 },
  { id: "badges", label: "Value Proposition Badges", visible: true, order: 2 },
  { id: "categories", label: "Featured Categories Grid", visible: true, order: 3 },
  { id: "deal", label: "Deal of the Week Banner", visible: true, order: 4 },
  { id: "bestsellers", label: "Best Sellers Product Grid", visible: true, order: 5 },
  { id: "story", label: "Brand Story Section", visible: true, order: 6 },
  { id: "reviews", label: "Customer Reviews & Ratings", visible: true, order: 7 },
  { id: "faq", label: "Frequently Asked Questions (FAQ)", visible: true, order: 8 },
];

const DEFAULT_FOOTER = {
  description: "Considered goods, made by hand. Built for a decade of use, not a season of trend.",
  contact: {
    email: "hello@yourstore.com",
    phone: "+1 (800) 555-0192",
    address: "142 Atelier Street, New York, NY",
  },
  social: [
    { platform: "Instagram", href: "https://instagram.com" },
    { platform: "Facebook", href: "https://facebook.com" },
    { platform: "Twitter", href: "https://twitter.com" },
    { platform: "WhatsApp", href: "https://wa.me/15550192" },
  ],
  columns: [
    {
      title: "Shop",
      links: [
        { label: "New Arrivals", href: "/shop?filter=new" },
        { label: "Best Sellers", href: "/shop?sort=best-selling" },
        { label: "All Products", href: "/shop" },
        { label: "Gift Cards", href: "/pages/gift-cards" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact Us", href: "/pages/contact" },
        { label: "Shipping & Returns", href: "/pages/shipping" },
        { label: "FAQ", href: "/pages/faq" },
        { label: "Track Order", href: "/account/orders" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/pages/about" },
        { label: "Sustainability", href: "/pages/sustainability" },
        { label: "Careers", href: "/pages/careers" },
      ],
    },
  ],
};

const TABS = ["Homepage Sections", "Featured Categories", "Featured Best Sellers", "Hero Featured Products", "Hero Slides", "Announcement Bar", "Brand Story", "FAQ", "Footer & Contact Details"];
const CMS_STORAGE_KEY = "sansons_cms_config";

export default function AdminCmsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink2">Loading CMS Manager...</div>}>
      <AdminCmsPageInner />
    </Suspense>
  );
}

function AdminCmsPageInner() {
  const searchParams = useSearchParams();
  const initialTabFromUrl = searchParams.get("tab");
  const [tab, setTab] = useState(initialTabFromUrl && TABS.includes(initialTabFromUrl) ? initialTabFromUrl : TABS[0]);
  const [sections, setSections] = useState(DEFAULT_HOMEPAGE_SECTIONS);
  const [hero, setHero] = useState(initialHero);
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [story, setStory] = useState(initialStory);
  const [faqItems, setFaqItems] = useState(initialFaq);
  const [footerContent, setFooterContent] = useState(DEFAULT_FOOTER);
  
  const [dbCategories, setDbCategories] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [heroFeaturedProducts, setHeroFeaturedProducts] = useState([]);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadCmsAndOptions = async () => {
    setLoading(true);
    try {
      const [cmsRes, catRes, prodRes] = await Promise.allSettled([
        api.get("dashboard/cms/"),
        api.get("products/categories/"),
        api.get("products/dashboard/products/"),
      ]);

      if (catRes.status === "fulfilled") {
        const cats = Array.isArray(catRes.value.data) ? catRes.value.data : (catRes.value.data?.results || []);
        setDbCategories(cats);
      }

      if (prodRes.status === "fulfilled") {
        const prods = Array.isArray(prodRes.value.data) ? prodRes.value.data : (prodRes.value.data?.results || []);
        setDbProducts(prods);
      }

      if (cmsRes.status === "fulfilled" && cmsRes.value.data) {
        const data = cmsRes.value.data;
        
        // Merge DB homepage sections with DEFAULT_HOMEPAGE_SECTIONS to ensure ALL 8 blocks appear
        if (Array.isArray(data.homepage_sections) && data.homepage_sections.length > 0) {
          const loadedIds = new Set(data.homepage_sections.map((s) => s.id));
          const missing = DEFAULT_HOMEPAGE_SECTIONS.filter((s) => !loadedIds.has(s.id));
          setSections([...data.homepage_sections, ...missing]);
        } else {
          setSections(DEFAULT_HOMEPAGE_SECTIONS);
        }

        if (Array.isArray(data.hero_slides) && data.hero_slides.length > 0) setHero(data.hero_slides);
        if (data.announcement_bar && Object.keys(data.announcement_bar).length > 0) setAnnouncement(data.announcement_bar);
        if (data.brand_story && Object.keys(data.brand_story).length > 0) setStory(data.brand_story);
        if (Array.isArray(data.faq_items) && data.faq_items.length > 0) setFaqItems(data.faq_items);
        if (Array.isArray(data.featured_categories)) setSelectedCategories(data.featured_categories);
        if (Array.isArray(data.featured_products)) setSelectedProducts(data.featured_products);
        if (Array.isArray(data.hero_featured_products)) setHeroFeaturedProducts(data.hero_featured_products);
        if (data.footer_content && typeof data.footer_content === "object" && Object.keys(data.footer_content).length > 0) {
          setFooterContent({
            description: data.footer_content.description || DEFAULT_FOOTER.description,
            contact: {
              email: data.footer_content.contact?.email || DEFAULT_FOOTER.contact.email,
              phone: data.footer_content.contact?.phone || DEFAULT_FOOTER.contact.phone,
              address: data.footer_content.contact?.address || DEFAULT_FOOTER.contact.address,
            },
            social: Array.isArray(data.footer_content.social) && data.footer_content.social.length > 0 ? data.footer_content.social : DEFAULT_FOOTER.social,
            columns: Array.isArray(data.footer_content.columns) && data.footer_content.columns.length > 0 ? data.footer_content.columns : DEFAULT_FOOTER.columns,
          });
        }
      }
    } catch (err) {
      console.warn("Failed to load CMS options", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsAndOptions();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = {
      homepage_sections: sections,
      hero_slides: hero,
      announcement_bar: announcement,
      brand_story: story,
      faq_items: faqItems,
      featured_categories: selectedCategories,
      featured_products: selectedProducts,
      hero_featured_products: heroFeaturedProducts,
      footer_content: footerContent,
    };

    try {
      await Promise.all([
        api.post("dashboard/cms/", payload),
        api.post("dashboard/settings/", {
          support_email: footerContent.contact?.email,
          support_phone: footerContent.contact?.phone,
          store_address: footerContent.contact?.address,
        }),
      ]);
      try {
        localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}
      showToast("CMS Changes & Contact details saved to database!", "success");
    } catch (err) {
      try {
        localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(payload));
        showToast("CMS Changes saved locally.", "success");
      } catch (e) {
        showToast("Failed to save changes", "danger");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (id) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));

  const moveSection = (id, dir) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const swap = idx + dir;
      if (swap < 0 || swap >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const toggleCategorySelection = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleProductSelection = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleHeroFeaturedProduct = (id, title = "") => {
    setHeroFeaturedProducts((prev) => {
      const isCurrentlyFeatured = prev.includes(id);
      const updated = isCurrentlyFeatured ? prev.filter((p) => p !== id) : [...prev, id];
      showToast(
        isCurrentlyFeatured
          ? `Product "${title || id}" removed from Hero Section`
          : `Product "${title || id}" is now Featured in Hero Section!`,
        isCurrentlyFeatured ? "warning" : "success"
      );
      return updated;
    });
  };

  return (
    <div>
      <AdminTopbar
        title="Content (CMS)"
        actions={
          <Button onClick={save} variant="primary" size="sm" disabled={saving}>
            <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        }
      />
      <div className="p-8">
        <div className="flex gap-2 mb-6 border-b border-line overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 font-medium ${
                tab === t ? "border-forest text-forest" : "border-transparent text-ink2 hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-ink2">Loading CMS configuration from database...</div>
        ) : (
          <>
            {/* 1. HOMEPAGE SECTIONS ORDERING & VISIBILITY */}
            {tab === "Homepage Sections" && (
              <div className="bg-paper border border-line rounded-md p-4 max-w-2xl">
                <p className="text-xs text-ink2 mb-4 font-medium">
                  Use ↑ and ↓ to order homepage blocks. Click the eye icon to toggle visibility.
                </p>
                <ul className="space-y-2">
                  {sections.map((s, i) => (
                    <li key={s.id} className="flex items-center gap-3 px-4 py-3 border border-line rounded-sm bg-canvas/40 hover:bg-canvas/80 transition-colors">
                      <GripVertical size={16} className="text-ink2 shrink-0" />
                      <span className="flex-1 text-sm font-medium">{s.label}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => moveSection(s.id, -1)}
                          disabled={i === 0}
                          className="px-2 py-1 border border-line rounded-sm text-xs text-ink2 disabled:opacity-30 hover:border-forest hover:text-forest"
                          title="Move up"
                        >
                          ↑ Up
                        </button>
                        <button
                          onClick={() => moveSection(s.id, 1)}
                          disabled={i === sections.length - 1}
                          className="px-2 py-1 border border-line rounded-sm text-xs text-ink2 disabled:opacity-30 hover:border-forest hover:text-forest"
                          title="Move down"
                        >
                          ↓ Down
                        </button>
                        <button
                          onClick={() => toggleSection(s.id)}
                          aria-label="Toggle visibility"
                          className="p-1.5 border border-line rounded-sm hover:border-forest"
                        >
                          {s.visible ? (
                            <Eye size={16} className="text-forest" title="Visible on homepage" />
                          ) : (
                            <EyeOff size={16} className="text-ink2" title="Hidden on homepage" />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 2. FEATURED CATEGORIES SELECTOR */}
            {tab === "Featured Categories" && (
              <div className="bg-paper border border-line rounded-md p-6 max-w-2xl space-y-4">
                <div>
                  <h2 className="font-medium text-base mb-1">Featured Categories on Homepage</h2>
                  <p className="text-xs text-ink2">Select which categories appear in the Featured Categories grid on the storefront.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {dbCategories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.slug);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategorySelection(cat.slug)}
                        className={`flex items-center gap-3 p-3.5 border rounded-sm text-left transition-colors ${
                          isSelected ? "border-forest bg-forest/5 text-forest font-medium" : "border-line hover:border-ink"
                        }`}
                      >
                        {isSelected ? <CheckSquare size={18} className="text-forest shrink-0" /> : <Square size={18} className="text-ink2 shrink-0" />}
                        <div className="truncate">
                          <p className="text-sm truncate">{cat.name}</p>
                          <p className="text-xs text-ink2 font-mono">{cat.slug}</p>
                        </div>
                      </button>
                    );
                  })}
                  {dbCategories.length === 0 && (
                    <p className="text-sm text-ink2 col-span-2 py-4 text-center">No categories found in database. Create categories under the Categories menu first.</p>
                  )}
                </div>
              </div>
            )}

            {/* 3. FEATURED BEST SELLERS SELECTOR */}
            {tab === "Featured Best Sellers" && (
              <div className="bg-paper border border-line rounded-md p-6 max-w-2xl space-y-4">
                <div>
                  <h2 className="font-medium text-base mb-1">Featured Best Sellers</h2>
                  <p className="text-xs text-ink2">Select products from your database to feature in the Best Sellers section.</p>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pt-2 pr-2">
                  {dbProducts.map((prod) => {
                    const isSelected = selectedProducts.includes(prod.id);
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => toggleProductSelection(prod.id)}
                        className={`w-full flex items-center gap-3 p-3 border rounded-sm text-left transition-colors ${
                          isSelected ? "border-forest bg-forest/5 text-forest font-medium" : "border-line hover:border-ink"
                        }`}
                      >
                        {isSelected ? <CheckSquare size={18} className="text-forest shrink-0" /> : <Square size={18} className="text-ink2 shrink-0" />}
                        <div className="w-10 h-10 rounded bg-canvas2 overflow-hidden shrink-0">
                          <img src={prod.images?.[0] || 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=100'} alt={prod.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-sm truncate">{prod.title}</p>
                          <p className="text-xs text-ink2 font-mono">{formatCurrency(prod.price)}</p>

                        </div>
                      </button>
                    );
                  })}
                  {dbProducts.length === 0 && (
                    <p className="text-sm text-ink2 py-4 text-center">No products found in database. Create products under the Products menu first.</p>
                  )}
                </div>
              </div>
            )}

            {/* 3.5 HERO FEATURED PRODUCTS MANAGER */}
            {tab === "Hero Featured Products" && (
              <div className="bg-paper border border-line rounded-md p-6 max-w-4xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-medium text-base mb-1">Hero Section Featured Products</h2>
                    <p className="text-xs text-ink2">
                      Manage which marketplace products appear in the Hero Section slider. Toggle the switch to feature or remove any product in real time.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink2" />
                    <input
                      type="text"
                      placeholder="Filter products..."
                      value={heroSearchQuery}
                      onChange={(e) => setHeroSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-line rounded-sm bg-canvas outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div className="border border-line rounded-md overflow-hidden">
                  <div className="max-h-[460px] overflow-y-auto divide-y divide-line">
                    {dbProducts
                      .filter((p) => (p.title || p.name || "").toLowerCase().includes(heroSearchQuery.toLowerCase()))
                      .map((prod) => {
                        const isFeatured = heroFeaturedProducts.includes(prod.id);
                        return (
                          <div
                            key={prod.id}
                            className={`flex items-center justify-between p-3.5 transition-colors ${
                              isFeatured ? "bg-forest/5" : "bg-paper hover:bg-canvas2"
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-md bg-canvas2 overflow-hidden shrink-0 border border-line/60">
                                <img
                                  src={prod.images?.[0] || "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=100"}
                                  alt={prod.title || prod.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-ink truncate">{prod.title || prod.name}</p>
                                <div className="flex items-center gap-2 text-xs text-ink2 font-mono">
                                  <span>{formatCurrency(prod.price)}</span>
                                  <span>•</span>
                                  <span>Stock: {prod.stock_quantity ?? prod.stock ?? 10}</span>
                                </div>
                              </div>
                            </div>

                            {/* Styled Tailwind Switch Toggle */}
                            <label className="relative inline-flex items-center cursor-pointer gap-2.5 shrink-0 ml-4">
                              <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={() => toggleHeroFeaturedProduct(prod.id, prod.title || prod.name)}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
                              <span className={`text-xs font-semibold ${isFeatured ? "text-forest" : "text-ink2"}`}>
                                {isFeatured ? "Featured in Hero" : "Feature in Hero"}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    {dbProducts.length === 0 && (
                      <p className="text-sm text-ink2 py-8 text-center">No products found in database. Create products under the Products menu first.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. HERO SLIDES */}
            {tab === "Hero Slides" && (
              <div className="space-y-4 max-w-2xl">
                {hero.map((slide, i) => (
                  <div key={slide.id} className="bg-paper border border-line rounded-md p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs uppercase text-ink font-bold">Slide {i + 1}</p>
                      {hero.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setHero((prev) => prev.filter((s) => s.id !== slide.id))}
                          className="p-1.5 rounded hover:bg-wine/10 text-wine text-xs font-semibold flex items-center gap-1 border border-line"
                          title="Delete Slide"
                        >
                          <Trash2 size={13} /> Delete Slide
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <LabeledInput label="Eyebrow" value={slide.eyebrow} onChange={(v) => updateHero(setHero, slide.id, { eyebrow: v })} />
                      <LabeledInput label="Title" value={slide.title} onChange={(v) => updateHero(setHero, slide.id, { title: v })} />
                      <LabeledInput label="Subtitle" value={slide.subtitle} onChange={(v) => updateHero(setHero, slide.id, { subtitle: v })} />
                      <LabeledInput label="Image URL" value={slide.image} onChange={(v) => updateHero(setHero, slide.id, { image: v })} />
                      <div className="grid grid-cols-2 gap-3">
                        <LabeledInput label="CTA Label" value={slide.ctaLabel} onChange={(v) => updateHero(setHero, slide.id, { ctaLabel: v })} />
                        <LabeledInput label="CTA Link" value={slide.ctaHref} onChange={(v) => updateHero(setHero, slide.id, { ctaHref: v })} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setHero((prev) => [...prev, { id: "slide-" + Date.now(), eyebrow: "New Collection", title: "Luxury Item", subtitle: "Refined details", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200", ctaLabel: "Shop Collection", ctaHref: "/shop" }])}
                >
                  <Plus size={14} /> Add Slide
                </Button>
              </div>
            )}

            {/* 5. ANNOUNCEMENT BAR */}
            {tab === "Announcement Bar" && (
              <div className="bg-paper border border-line rounded-md p-5 max-w-xl space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={announcement.enabled}
                    onChange={(e) => setAnnouncement((a) => ({ ...a, enabled: e.target.checked }))}
                    className="accent-forest"
                  />
                  Enabled
                </label>
                {announcement.messages.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={m}
                      onChange={(e) =>
                        setAnnouncement((a) => ({
                          ...a,
                          messages: a.messages.map((msg, idx) => (idx === i ? e.target.value : msg)),
                        }))
                      }
                      className="flex-1 border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
                    />
                    <button
                      onClick={() => setAnnouncement((a) => ({ ...a, messages: a.messages.filter((_, idx) => idx !== i) }))}
                      aria-label="Remove message"
                      className="p-2 text-wine"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setAnnouncement((a) => ({ ...a, messages: [...a.messages, "New announcement message"] }))}
                >
                  <Plus size={14} /> Add Message
                </Button>
              </div>
            )}

            {/* 6. BRAND STORY */}
            {tab === "Brand Story" && (
              <div className="bg-paper border border-line rounded-md p-5 max-w-xl space-y-3">
                <LabeledInput label="Eyebrow" value={story.eyebrow} onChange={(v) => setStory((s) => ({ ...s, eyebrow: v }))} />
                <LabeledInput label="Title" value={story.title} onChange={(v) => setStory((s) => ({ ...s, title: v }))} />
                <label className="block text-sm">
                  <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Body</span>
                  <textarea
                    rows={4}
                    value={story.body}
                    onChange={(e) => setStory((s) => ({ ...s, body: e.target.value }))}
                    className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
                  />
                </label>
                <LabeledInput label="Image URL" value={story.image} onChange={(v) => setStory((s) => ({ ...s, image: v }))} />
              </div>
            )}

            {/* 7. FAQ */}
            {tab === "FAQ" && (
              <div className="space-y-3 max-w-2xl">
                {faqItems.map((f, i) => (
                  <div key={f.id} className="bg-paper border border-line rounded-md p-4 space-y-2">
                    <LabeledInput
                      label="Question"
                      value={f.question}
                      onChange={(v) => setFaqItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, question: v } : item)))}
                    />
                    <label className="block text-sm">
                      <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Answer</span>
                      <textarea
                        rows={2}
                        value={f.answer}
                        onChange={(e) => setFaqItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, answer: e.target.value } : item)))}
                        className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
                      />
                    </label>
                  </div>
                ))}
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setFaqItems((prev) => [...prev, { id: "f" + Date.now(), question: "New question", answer: "Detailed answer..." }])}
                >
                  <Plus size={14} /> Add FAQ Item
                </Button>
              </div>
            )}

            {/* 8. Footer & Contact Details */}
            {tab === "Footer & Contact Details" && (
              <div className="space-y-8 max-w-4xl">
                {/* Storefront Tagline & Description */}
                <div className="bg-paper border border-line rounded-md p-6 space-y-4">
                  <h3 className="font-semibold text-lg border-b border-line pb-2">Footer Tagline &amp; Brand Story</h3>
                  <label className="block text-sm">
                    <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Footer Description Text</span>
                    <textarea
                      rows={3}
                      value={footerContent.description || ""}
                      onChange={(e) => setFooterContent((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
                      placeholder="Considered goods, made by hand..."
                    />
                  </label>
                </div>

                {/* Direct Contact Details */}
                <div className="bg-paper border border-line rounded-md p-6 space-y-4">
                  <h3 className="font-semibold text-lg border-b border-line pb-2">Store Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <LabeledInput
                      label="Support Email"
                      value={footerContent.contact?.email || ""}
                      onChange={(v) => setFooterContent((prev) => ({ ...prev, contact: { ...prev.contact, email: v } }))}
                    />
                    <LabeledInput
                      label="Contact Phone / WhatsApp"
                      value={footerContent.contact?.phone || ""}
                      onChange={(v) => setFooterContent((prev) => ({ ...prev, contact: { ...prev.contact, phone: v } }))}
                    />
                  </div>
                  <label className="block text-sm">
                    <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Physical Store Address</span>
                    <input
                      value={footerContent.contact?.address || ""}
                      onChange={(e) => setFooterContent((prev) => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
                      className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
                      placeholder="142 Atelier Street, New York, NY"
                    />
                  </label>
                </div>

                {/* Social Media Links */}
                <div className="bg-paper border border-line rounded-md p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h3 className="font-semibold text-lg">Social Media Links</h3>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => setFooterContent((prev) => ({
                        ...prev,
                        social: [...(prev.social || []), { platform: "Instagram", href: "https://instagram.com" }]
                      }))}
                    >
                      <Plus size={14} /> Add Social Link
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(footerContent.social || []).map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-canvas p-3 border border-line rounded-sm">
                        <select
                          value={s.platform}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFooterContent((prev) => {
                              const copy = [...(prev.social || [])];
                              copy[idx] = { ...copy[idx], platform: val };
                              return { ...prev, social: copy };
                            });
                          }}
                          className="border border-line rounded px-2 py-1.5 text-xs bg-paper font-medium"
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Twitter">Twitter / X</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="YouTube">YouTube</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Pinterest">Pinterest</option>
                        </select>
                        <input
                          type="text"
                          value={s.href}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFooterContent((prev) => {
                              const copy = [...(prev.social || [])];
                              copy[idx] = { ...copy[idx], href: val };
                              return { ...prev, social: copy };
                            });
                          }}
                          className="flex-1 border border-line rounded px-2 py-1.5 text-xs bg-paper outline-none focus:border-forest"
                          placeholder="https://..."
                        />
                        <button
                          onClick={() => {
                            setFooterContent((prev) => ({
                              ...prev,
                              social: (prev.social || []).filter((_, i) => i !== idx)
                            }));
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete Social Link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Columns & Links */}
                <div className="bg-paper border border-line rounded-md p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h3 className="font-semibold text-lg">Footer Columns &amp; Menu Links</h3>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => setFooterContent((prev) => ({
                        ...prev,
                        columns: [...(prev.columns || []), { title: "New Column", links: [{ label: "Link Item", href: "/shop" }] }]
                      }))}
                    >
                      <Plus size={14} /> Add New Column
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {(footerContent.columns || []).map((col, colIdx) => (
                      <div key={colIdx} className="bg-canvas border border-line rounded-md p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-line pb-2">
                          <input
                            value={col.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFooterContent((prev) => {
                                const cols = [...(prev.columns || [])];
                                cols[colIdx] = { ...cols[colIdx], title: val };
                                return { ...prev, columns: cols };
                              });
                            }}
                            className="font-bold text-sm bg-transparent border-b border-line outline-none focus:border-forest w-full mr-2"
                            placeholder="Column Title"
                          />
                          <button
                            onClick={() => {
                              setFooterContent((prev) => ({
                                ...prev,
                                columns: (prev.columns || []).filter((_, i) => i !== colIdx)
                              }));
                            }}
                            className="text-rose-600 hover:bg-rose-50 p-1 rounded shrink-0"
                            title="Delete Column"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(col.links || []).map((lnk, lnkIdx) => (
                            <div key={lnkIdx} className="flex items-center gap-1.5 bg-paper p-2 border border-line rounded-sm">
                              <input
                                value={lnk.label}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFooterContent((prev) => {
                                    const cols = [...(prev.columns || [])];
                                    const lnks = [...(cols[colIdx].links || [])];
                                    lnks[lnkIdx] = { ...lnks[lnkIdx], label: val };
                                    cols[colIdx] = { ...cols[colIdx], links: lnks };
                                    return { ...prev, columns: cols };
                                  });
                                }}
                                className="w-1/2 text-xs border border-line rounded px-2 py-1 bg-canvas outline-none focus:border-forest"
                                placeholder="Label"
                              />
                              <input
                                value={lnk.href}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFooterContent((prev) => {
                                    const cols = [...(prev.columns || [])];
                                    const lnks = [...(cols[colIdx].links || [])];
                                    lnks[lnkIdx] = { ...lnks[lnkIdx], href: val };
                                    cols[colIdx] = { ...cols[colIdx], links: lnks };
                                    return { ...prev, columns: cols };
                                  });
                                }}
                                className="w-1/2 text-xs border border-line rounded px-2 py-1 bg-canvas outline-none focus:border-forest"
                                placeholder="/href"
                              />
                              <button
                                onClick={() => {
                                  setFooterContent((prev) => {
                                    const cols = [...(prev.columns || [])];
                                    const lnks = (cols[colIdx].links || []).filter((_, i) => i !== lnkIdx);
                                    cols[colIdx] = { ...cols[colIdx], links: lnks };
                                    return { ...prev, columns: cols };
                                  });
                                }}
                                className="text-rose-600 hover:bg-rose-50 p-1 rounded shrink-0"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          className="w-full text-xs mt-1 text-forest font-medium hover:underline flex items-center justify-center gap-1 py-1"
                          onClick={() => {
                            setFooterContent((prev) => {
                              const cols = [...(prev.columns || [])];
                              const lnks = [...(cols[colIdx].links || []), { label: "New Link", href: "/shop" }];
                              cols[colIdx] = { ...cols[colIdx], links: lnks };
                              return { ...prev, columns: cols };
                            });
                          }}
                        >
                          <Plus size={12} /> Add Link Item
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function updateHero(setHero, id, patch) {
  setHero((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
}

function LabeledInput({ label, value, onChange }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
      />
    </label>
  );
}
