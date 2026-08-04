# Atelier & Co. — Ecommerce Frontend

A complete Next.js (App Router) storefront + admin portal, built with Tailwind CSS
and Framer Motion. Designed to be handed to a dev/AI tool (e.g. Antigravity) to
swap into an existing project or connect to a real backend.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the storefront and `http://localhost:3000/admin`
for the admin portal.

## Architecture — read this before wiring up a backend

**Service layer.** No page or component reads mock data directly. Everything goes
through `lib/services/*.js` (`productService`, `cmsService`, `orderService`).
To connect a real backend (Django REST, etc.), you only need to edit the
function bodies in those three files — swap the mock array lookups for
`fetch('/api/...')` calls. No component code needs to change.

**Mock data.** Lives in `lib/data/*.js` — products, categories, collections,
reviews, orders, customers, coupons, and all CMS-controlled content (hero
slides, homepage section order, FAQ, brand story, footer, navigation menu).

**State/contexts** (`lib/context/*`):
- `CartContext` — cart, coupon, shipping/tax estimate. Persists to `localStorage`.
- `WishlistContext` — persists to `localStorage`.
- `AuthContext` — **mock auth**: any email/password combination signs you in.
  Replace `login`/`register`/`requestPasswordReset` with real API calls before launch.
- `ToastContext` — global toast notifications.

**Motion system.** `lib/motion.js` centralizes every animation variant
(fade-ups, drawers, modals, hero slides, card hover, page transitions) so
motion stays consistent and easy to retune globally.

**Admin portal** (`app/admin/*`) is a separate layout from the storefront
(`app/(storefront)/*`), so it never shows the customer nav/footer. Admin CRUD
screens (products, categories, orders, customers, coupons, CMS) currently
mutate in-memory React state only — changes reset on reload. Wire them to
real API routes/DB calls to persist.

## What's stubbed for future integration

- **Payment gateways** — only Cash on Delivery is functional; card payment UI
  exists in checkout but is disabled pending a gateway (Stripe/Razorpay/etc.).
- **Real authentication** — mock only, see `AuthContext`.
- **AI features** — placeholders in `/admin/settings` (search, recommendations,
  descriptions, SEO, inventory forecasting, marketing generator, support bot).
- **CMS persistence** — the `/admin/cms` screen edits local React state; connect
  it to a real CMS or database table to persist across reloads/users.
- **Media library** — image fields currently take a pasted URL; wire to a real
  upload/storage service (S3, Cloudinary, etc.) when ready.
- **Newsletter** — the signup form is a mock submit; connect to an ESP
  (Klaviyo, Mailchimp) via an API route.

## Design system

- **Colors:** warm stone canvas, deep forest green (primary/CTA), brass (accents/
  ratings), wine (sale/discount) — defined in `tailwind.config.js`.
- **Type:** Fraunces (display), Inter (body), IBM Plex Mono (prices/SKUs/data).
- **Accessibility:** visible focus rings, `prefers-reduced-motion` support,
  semantic landmarks, aria-labels on icon-only buttons.

## Folder map

```
app/
  (storefront)/       storefront routes — layout includes announcement bar, navbar, footer, cart drawer
    page.js            homepage (renders CMS-ordered sections)
    shop/              catalog with filters/sort/pagination
    product/[slug]/    product detail page
    cart/ checkout/ wishlist/ search/
    account/           login, register, forgot-password, orders, addresses, settings
  admin/               admin portal — separate layout with sidebar
    products/ categories/ orders/ customers/ coupons/ cms/ settings/
components/
  layout/ home/ product/ shop/ ui/ admin/
lib/
  data/                mock data
  services/             service/repository layer — point real APIs here
  context/             Cart, Wishlist, Auth, Toast providers
  motion.js            centralized animation variants
  utils.js             formatCurrency, cn, slugify, etc.
```
