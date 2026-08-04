// Everything in this file represents content an admin edits from the
// admin portal's CMS screen (see app/admin/cms). In production this
// would be fetched from the CMS/database instead of imported statically.

export const announcementBar = {
  enabled: true,
  messages: [
    "Free shipping on orders over $200",
    "New season arrivals are live",
    "Cash on delivery available nationwide",
  ],
  linkLabel: "Shop now",
  linkHref: "/shop",
};

export const heroSlides = [
  {
    id: "hero-1",
    eyebrow: "New Season",
    title: "Quiet luxury,\nmade to last.",
    subtitle: "Considered objects for everyday use — built by hand, backed for life.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1800&q=80",
    ctaLabel: "Shop the Edit",
    ctaHref: "/shop",
    secondaryCtaLabel: "Our Story",
    secondaryCtaHref: "#brand-story",
  },
  {
    id: "hero-2",
    eyebrow: "Heritage Craft",
    title: "Made by hand.\nHeld for decades.",
    subtitle: "Full-grain leather, solid metals, natural fibers — nothing that pretends to be something it isn't.",
    image:
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1800&q=80",
    ctaLabel: "Explore Collections",
    ctaHref: "/shop",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
  },
  {
    id: "hero-3",
    eyebrow: "This Week",
    title: "Best sellers,\nback in stock.",
    subtitle: "The pieces our customers reorder most, restocked for the season.",
    image:
      "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?w=1800&q=80",
    ctaLabel: "View Best Sellers",
    ctaHref: "/shop?sort=best-selling",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
  },
];

export const trustBadges = [
  { id: "tb1", icon: "Truck", title: "Fast Delivery", description: "2–6 business days, tracked." },
  { id: "tb2", icon: "Banknote", title: "Cash on Delivery", description: "Available on most items." },
  { id: "tb3", icon: "RotateCcw", title: "Easy Returns", description: "30-day no-questions returns." },
  { id: "tb4", icon: "ShieldCheck", title: "Secure Payments", description: "Encrypted checkout, always." },
  { id: "tb5", icon: "Headset", title: "Customer Support", description: "Real humans, 7 days a week." },
];

export const whyChooseUs = [
  { id: "w1", icon: "Gem", title: "Quality", description: "Every material is sourced and tested before it earns a place in the catalog." },
  { id: "w2", icon: "Headset", title: "Support", description: "A real person replies to every message, usually within a few hours." },
  { id: "w3", icon: "ShieldCheck", title: "Reliability", description: "What you see is what ships — accurate stock, accurate photos." },
  { id: "w4", icon: "Eye", title: "Transparency", description: "Clear pricing, clear sourcing, no dark patterns at checkout." },
  { id: "w5", icon: "Truck", title: "Delivery", description: "Tracked shipping with realistic estimates, not optimistic ones." },
];

export const brandStory = {
  eyebrow: "Our Story",
  title: "Built slowly, on purpose.",
  body:
    "We started with a simple frustration: most \"premium\" goods online weren't. So we went directly to the workshops — tanneries, casehouses, ateliers — and built a catalog of things we'd actually want to own for a decade, not a season.",
  image:
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80",
  ctaLabel: "Read the full story",
  ctaHref: "/pages/about",
};

export const faq = [
  { id: "f1", question: "How long does delivery take?", answer: "Most orders arrive within 2–6 business days depending on your location and the item's delivery estimate, shown on every product page." },
  { id: "f2", question: "Is cash on delivery available?", answer: "Yes, on eligible items — look for the COD badge on the product card or product page." },
  { id: "f3", question: "What is your return policy?", answer: "Most items include a 30-day free return window. Final-sale and engraved items are excluded and marked clearly on the product page." },
  { id: "f4", question: "Do you ship internationally?", answer: "Currently we ship within supported regions shown at checkout once you enter your address." },
  { id: "f5", question: "How do I track my order?", answer: "Once your order ships, you'll receive a tracking link by email and can also view status under Account → Orders." },
];

export const newsletter = {
  title: "Join the list",
  subtitle: "Early access to restocks and new arrivals. No spam, unsubscribe anytime.",
};

export const footerContent = {
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
  social: [
    { platform: "Instagram", href: "https://instagram.com" },
    { platform: "Pinterest", href: "https://pinterest.com" },
    { platform: "TikTok", href: "https://tiktok.com" },
  ],
  contact: {
    email: "hello@yourstore.com",
    phone: "+1 (800) 555-0192",
    address: "142 Atelier Street, New York, NY",
  },
};

// Controls which homepage sections render, in what order — editable
// from the admin CMS screen (app/admin/cms).
export const homepageSections = [
  { id: "hero", label: "Hero", visible: true, order: 1 },
  { id: "trust-badges", label: "Trust Badges", visible: true, order: 2 },
  { id: "featured-categories", label: "Featured Categories", visible: true, order: 3 },
  { id: "best-sellers", label: "Best Sellers", visible: true, order: 4 },
  { id: "why-choose-us", label: "Why Choose Us", visible: true, order: 5 },
  { id: "featured-collections", label: "Featured Collections", visible: true, order: 6 },
  { id: "reviews", label: "Customer Reviews", visible: true, order: 7 },
  { id: "brand-story", label: "Brand Story", visible: true, order: 8 },
  { id: "faq", label: "FAQ", visible: true, order: 9 },
  { id: "newsletter", label: "Newsletter", visible: true, order: 10 },
];

export const navigationMenu = [
  {
    id: "nav-shop",
    label: "Shop",
    href: "/shop",
    megaMenu: true,
    columns: [
      { title: "Categories", links: [
        { label: "Timepieces", href: "/shop?category=timepieces" },
        { label: "Bags", href: "/shop?category=bags" },
        { label: "Footwear", href: "/shop?category=footwear" },
        { label: "Jewelry", href: "/shop?category=jewelry" },
        { label: "Apparel", href: "/shop?category=apparel" },
      ]},
      { title: "Collections", links: [
        { label: "The Autumn Edit", href: "/shop?collection=autumn-edit" },
        { label: "Heritage Craft", href: "/shop?collection=heritage-craft" },
        { label: "Quiet Luxury", href: "/shop?collection=quiet-luxury" },
      ]},
      { title: "Featured", links: [
        { label: "New Arrivals", href: "/shop?filter=new" },
        { label: "Best Sellers", href: "/shop?sort=best-selling" },
        { label: "On Sale", href: "/shop?filter=sale" },
      ]},
    ],
    featuredImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80",
    featuredLabel: "The Autumn Edit",
    featuredHref: "/shop?collection=autumn-edit",
  },
  { id: "nav-new", label: "New Arrivals", href: "/shop?filter=new", megaMenu: false },
  { id: "nav-collections", label: "Collections", href: "/shop", megaMenu: false },
  { id: "nav-about", label: "About", href: "/pages/about", megaMenu: false },
];

export const trendingSearches = ["Overcoat", "Automatic watch", "Leather tote", "Gold ring"];
export const popularSearches = ["Best sellers", "New arrivals", "Sale", "Gift ideas"];
