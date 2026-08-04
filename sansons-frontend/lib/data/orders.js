export const orders = [
  {
    id: "ORD-10234",
    customer: "Harriet Adeyemi",
    email: "harriet@example.com",
    date: "2026-07-28",
    status: "Delivered",
    paymentMethod: "COD",
    total: 1450,
    items: [{ productId: "p-001", name: "Meridian Automatic Watch", qty: 1, price: 1450 }],
  },
  {
    id: "ORD-10235",
    customer: "Marco Belline",
    email: "marco@example.com",
    date: "2026-07-30",
    status: "Processing",
    paymentMethod: "Card",
    total: 830,
    items: [
      { productId: "p-010", name: "Merino Turtleneck", qty: 1, price: 210 },
      { productId: "p-005", name: "Cortina Oxford", qty: 1, price: 460 },
      { productId: "p-008", name: "Linea Hoop Earrings", qty: 1, price: 320 },
    ],
  },
  {
    id: "ORD-10236",
    customer: "Yuki Tanaka",
    email: "yuki@example.com",
    date: "2026-08-01",
    status: "Shipped",
    paymentMethod: "COD",
    total: 620,
    items: [{ productId: "p-003", name: "Sansons Tote", qty: 1, price: 620 }],
  },
  {
    id: "ORD-10237",
    customer: "Daniel Kim",
    email: "daniel@example.com",
    date: "2026-08-01",
    status: "Pending",
    paymentMethod: "Card",
    total: 720,
    items: [{ productId: "p-009", name: "Wool Overcoat", qty: 1, price: 720 }],
  },
  {
    id: "ORD-10238",
    customer: "Priya Nair",
    email: "priya@example.com",
    date: "2026-07-25",
    status: "Cancelled",
    paymentMethod: "COD",
    total: 380,
    items: [{ productId: "p-011", name: "Canvas Messenger", qty: 1, price: 380 }],
  },
];

export const customers = [
  { id: "cus-1", name: "Harriet Adeyemi", email: "harriet@example.com", orders: 4, totalSpent: 4820, joined: "2025-02-11", status: "Active" },
  { id: "cus-2", name: "Marco Belline", email: "marco@example.com", orders: 7, totalSpent: 6110, joined: "2024-11-03", status: "Active" },
  { id: "cus-3", name: "Yuki Tanaka", email: "yuki@example.com", orders: 2, totalSpent: 1240, joined: "2026-01-22", status: "Active" },
  { id: "cus-4", name: "Daniel Kim", email: "daniel@example.com", orders: 1, totalSpent: 720, joined: "2026-06-30", status: "Active" },
  { id: "cus-5", name: "Priya Nair", email: "priya@example.com", orders: 3, totalSpent: 1590, joined: "2025-09-14", status: "Blocked" },
];

export const coupons = [
  { id: "cp-1", code: "WELCOME10", type: "Percentage", value: 10, minSpend: 0, usageLimit: 1000, used: 412, active: true, expires: "2026-12-31" },
  { id: "cp-2", code: "FREESHIP", type: "Free Shipping", value: 0, minSpend: 150, usageLimit: 5000, used: 1888, active: true, expires: "2026-09-30" },
  { id: "cp-3", code: "VIP25", type: "Percentage", value: 25, minSpend: 500, usageLimit: 200, used: 199, active: false, expires: "2026-07-01" },
];
