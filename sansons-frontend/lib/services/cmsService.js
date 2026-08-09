import api from '../api';
import {
  announcementBar as mockAnnouncementBar,
  heroSlides as mockHeroSlides,
  trustBadges as mockTrustBadges,
  whyChooseUs as mockWhyChooseUs,
  brandStory as mockBrandStory,
  faq as mockFaq,
  newsletter as mockNewsletter,
  footerContent as mockFooterContent,
  homepageSections as mockHomepageSections,
  navigationMenu as mockNavigationMenu,
  trendingSearches as mockTrendingSearches,
  popularSearches as mockPopularSearches,
} from '../data/cms';
import { categories as mockCategories, collections as mockCollections } from '../data/categories';
import { testimonials as mockTestimonials } from '../data/reviews';

const wait = (data) => Promise.resolve(data);

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

export const getHomepageSections = async () => {
  try {
    const response = await api.get('dashboard/cms/');
    const data = response.data;
    if (data && Array.isArray(data.homepage_sections) && data.homepage_sections.length > 0) {
      const loadedIds = new Set(data.homepage_sections.map((s) => s.id));
      const missing = DEFAULT_HOMEPAGE_SECTIONS.filter((s) => !loadedIds.has(s.id));
      return [...data.homepage_sections, ...missing];
    }
  } catch (err) {
    console.warn("Failed to fetch live homepage sections, using defaults.", err);
  }
  return DEFAULT_HOMEPAGE_SECTIONS;
};

export const getAnnouncementBar = async () => {
  try {
    const response = await api.get('dashboard/cms/');
    if (response.data?.announcement_bar?.enabled !== undefined) {
      return response.data.announcement_bar;
    }
  } catch (e) {}
  return mockAnnouncementBar;
};

export const getHeroSlides = async () => {
  try {
    const response = await api.get('dashboard/cms/');
    if (Array.isArray(response.data?.hero_slides) && response.data.hero_slides.length > 0) {
      return response.data.hero_slides;
    }
  } catch (e) {}

  try {
    const response = await api.get('products/banners/');
    const list = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    if (list.length > 0) {
      return list.map((b) => ({
        id: b.id,
        eyebrow: b.badge || '🔥 Mega Sale',
        title: b.title,
        subtitle: b.subtitle || '',
        image: b.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
        ctaLabel: b.cta_text || 'Shop Now',
        ctaHref: '/shop',
      }));
    }
  } catch (err) {}
  return mockHeroSlides.filter(Boolean);
};

export const getCategories = async () => {
  try {
    const [cmsRes, catRes] = await Promise.allSettled([
      api.get('dashboard/cms/'),
      api.get('products/categories/')
    ]);

    let featuredSlugs = [];
    if (cmsRes.status === 'fulfilled' && Array.isArray(cmsRes.value.data?.featured_categories)) {
      featuredSlugs = cmsRes.value.data.featured_categories;
    }

    if (catRes.status === 'fulfilled') {
      const list = Array.isArray(catRes.value.data) ? catRes.value.data : (catRes.value.data?.results || []);
      if (list.length > 0) {
        let filtered = list;
        if (featuredSlugs.length > 0) {
          filtered = list.filter((c) => featuredSlugs.includes(c.slug));
          if (filtered.length === 0) filtered = list;
        }

        const categoryImages = {
          "timepieces": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80",
          "bags": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80",
          "footwear": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=80",
          "jewelry": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80",
          "apparel": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80",
          "electronics": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=900&q=80",
          "fashion-apparel": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80",
          "sports-outdoors": "https://images.unsplash.com/photo-1517649763962-0c6232661a0b?w=900&q=80",
          "luxury-watches": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80",
          "updated-luxury-watches": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80",
        };

        return filtered.map((c) => {
          let img = c.image;
          if (typeof img === 'string' && (img.includes("127.0.0.1") || img.includes("localhost"))) {
            if (img.includes("/media/")) {
              img = "/media/" + img.split("/media/")[1];
            } else {
              img = null;
            }
          }
          if (!img) {
            img = categoryImages[c.slug] || "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80";
          }
          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            image: img,
            productCount: c.count || 0,
            visible: c.status !== 'hidden',
          };
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch categories from database, using mock.", err);
  }
  return mockCategories.filter((c) => c.visible).sort((a, b) => a.order - b.order);
};

export const getBrandStory = async () => {
  try {
    const response = await api.get('dashboard/cms/');
    if (response.data?.brand_story && Object.keys(response.data.brand_story).length > 0) {
      return response.data.brand_story;
    }
  } catch (e) {}
  return mockBrandStory;
};

export const getFaq = async () => {
  try {
    const response = await api.get('dashboard/cms/');
    if (Array.isArray(response.data?.faq_items) && response.data.faq_items.length > 0) {
      return response.data.faq_items;
    }
  } catch (e) {}
  return mockFaq;
};

export const getTrustBadges = () => wait(mockTrustBadges);
export const getWhyChooseUs = () => wait(mockWhyChooseUs);
export const getNewsletterContent = () => wait(mockNewsletter);
export const getFooterContent = async () => {
  try {
    const response = await api.get('dashboard/cms/');
    const fc = response.data?.footer_content;
    if (fc && typeof fc === 'object' && Object.keys(fc).length > 0) {
      return {
        description: fc.description || mockFooterContent.description,
        contact: {
          email: fc.contact?.email || mockFooterContent.contact.email,
          phone: fc.contact?.phone || mockFooterContent.contact.phone,
          address: fc.contact?.address || mockFooterContent.contact.address,
        },
        social: Array.isArray(fc.social) && fc.social.length > 0 ? fc.social : mockFooterContent.social,
        columns: Array.isArray(fc.columns) && fc.columns.length > 0 ? fc.columns : mockFooterContent.columns,
      };
    }
  } catch (e) {}
  return mockFooterContent;
};
export const getNavigationMenu = async () => {
  try {
    const response = await api.get('products/categories/');
    const list = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    if (list.length > 0) {
      const dynamicCategoryLinks = list.map((c) => ({
        label: c.name,
        href: `/shop?category=${c.slug}`
      }));
      const menu = JSON.parse(JSON.stringify(mockNavigationMenu));
      const shopNav = menu.find((n) => n.id === 'nav-shop');
      if (shopNav && Array.isArray(shopNav.columns)) {
        const catCol = shopNav.columns.find((col) => col.title === 'Categories');
        if (catCol) {
          catCol.links = dynamicCategoryLinks;
        }
      }
      return menu;
    }
  } catch (err) {}
  return mockNavigationMenu;
};


const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
];

export const getTestimonials = async () => {
  try {
    const response = await api.get('products/reviews/');
    const list = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    if (list.length > 0) {
      return list.map((r, idx) => ({
        id: r.id || `rev-${idx}`,
        name: r.purchaser_name || r.author || 'Verified Customer',
        role: 'Verified Buyer',
        rating: r.rating || 5,
        quote: r.comment || r.content || r.body || 'Exceptional quality and incredible service.',
        avatar: r.avatar || AVATARS[idx % AVATARS.length]
      }));
    }
  } catch (err) {}
  return mockTestimonials;
};



export const getTrendingSearches = () => wait(mockTrendingSearches);
export const getPopularSearches = () => wait(mockPopularSearches);
export const getCollections = () => wait(mockCollections.filter((c) => c.visible).sort((a, b) => a.order - b.order));
