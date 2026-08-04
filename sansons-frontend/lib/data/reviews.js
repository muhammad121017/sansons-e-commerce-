export const productReviews = {
  "p-001": [
    { id: "r1", author: "Daniel K.", rating: 5, title: "Exceeds the price point", body: "The finishing on the case is better than watches twice this price. Keeps time within 2 seconds a day.", date: "2026-06-12", verified: true },
    { id: "r2", author: "Mireille T.", rating: 4, title: "Beautiful, slightly large", body: "Gorgeous watch, runs a little big on my wrist but the strap is easy to size down.", date: "2026-05-30", verified: true },
    { id: "r3", author: "Owen P.", rating: 5, title: "Worth the wait", body: "Ordered during a restock, shipped fast, arrived in immaculate packaging.", date: "2026-05-02", verified: false },
  ],
  "p-003": [
    { id: "r4", author: "Sasha L.", rating: 5, title: "My everyday bag now", body: "The leather is already breaking in beautifully after three weeks.", date: "2026-06-20", verified: true },
    { id: "r5", author: "Priya N.", rating: 5, title: "Structured but soft", body: "Holds its shape on the shelf but softens up nicely once loaded.", date: "2026-04-18", verified: true },
  ],
};

export const getReviewsForProduct = (productId) => productReviews[productId] || [];

export const testimonials = [
  {
    id: "t1",
    name: "Harriet Adeyemi",
    role: "Verified Customer",
    quote:
      "Every piece feels considered. Packaging, notes, follow-up — the whole experience is unusually calm for online shopping.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  },
  {
    id: "t2",
    name: "Marco Belline",
    role: "Verified Customer",
    quote: "I've returned three times now. The quality-to-price ratio has no real competitor I've found.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  },
  {
    id: "t3",
    name: "Yuki Tanaka",
    role: "Verified Customer",
    quote: "Customer support resolved a sizing issue same-day, no back and forth. Rare these days.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
  },
];
