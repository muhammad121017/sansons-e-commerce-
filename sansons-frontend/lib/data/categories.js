// Mock data — swap this module's contents for a real API/CMS response.
// Shape is intentionally flat & serializable so it maps 1:1 to a future
// Django REST / GraphQL payload.

export const categories = [
  {
    id: "cat-watches",
    name: "Timepieces",
    slug: "timepieces",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80",
    description: "Hand-finished mechanical watches.",
    productCount: 4,
    visible: true,
    order: 1,
  },
  {
    id: "cat-bags",
    name: "Bags",
    slug: "bags",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80",
    description: "Full-grain leather carry.",
    productCount: 4,
    visible: true,
    order: 2,
  },
  {
    id: "cat-footwear",
    name: "Footwear",
    slug: "footwear",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=80",
    description: "Resoleable, built to last.",
    productCount: 4,
    visible: true,
    order: 3,
  },
  {
    id: "cat-jewelry",
    name: "Jewelry",
    slug: "jewelry",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80",
    description: "Solid gold and silver, made to last generations.",
    productCount: 4,
    visible: true,
    order: 4,
  },
  {
    id: "cat-apparel",
    name: "Apparel",
    slug: "apparel",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80",
    description: "Quiet, considered essentials.",
    productCount: 4,
    visible: true,
    order: 5,
  },
];

export const collections = [
  {
    id: "col-autumn",
    name: "The Autumn Edit",
    slug: "autumn-edit",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    description: "Twelve pieces for the season ahead.",
    visible: true,
    order: 1,
  },
  {
    id: "col-heritage",
    name: "Heritage Craft",
    slug: "heritage-craft",
    image:
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1200&q=80",
    description: "Old-world techniques, made new.",
    visible: true,
    order: 2,
  },
  {
    id: "col-minimal",
    name: "Quiet Luxury",
    slug: "quiet-luxury",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80",
    description: "Nothing loud. Nothing wasted.",
    visible: true,
    order: 3,
  },
];
