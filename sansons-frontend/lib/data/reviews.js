export const productReviews = {};

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
