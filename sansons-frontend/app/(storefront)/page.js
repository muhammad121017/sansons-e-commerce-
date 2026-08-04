import Hero from "@/components/home/Hero";
import TrustBadges from "@/components/home/TrustBadges";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import BestSellers from "@/components/home/BestSellers";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BrandStory from "@/components/home/BrandStory";
import FAQSection from "@/components/home/FAQSection";
import Newsletter from "@/components/home/Newsletter";

import {
  getHeroSlides,
  getTrustBadges,
  getCategories,
  getWhyChooseUs,
  getCollections,
  getTestimonials,
  getBrandStory,
  getFaq,
  getNewsletterContent,
  getHomepageSections,
} from "@/lib/services/cmsService";
import { fetchBestSellers } from "@/lib/services/productService";

const SECTION_COMPONENTS = {
  hero: async () => <Hero slides={await getHeroSlides()} />,
  badges: async () => <TrustBadges badges={await getTrustBadges()} />,
  "trust-badges": async () => <TrustBadges badges={await getTrustBadges()} />,
  categories: async () => <FeaturedCategories categories={await getCategories()} />,
  "featured-categories": async () => <FeaturedCategories categories={await getCategories()} />,
  deal: async () => <WhyChooseUs items={await getWhyChooseUs()} />,
  bestsellers: async () => <BestSellers products={await fetchBestSellers()} />,
  "best-sellers": async () => <BestSellers products={await fetchBestSellers()} />,
  "why-choose-us": async () => <WhyChooseUs items={await getWhyChooseUs()} />,
  "featured-collections": async () => <FeaturedCollections collections={await getCollections()} />,
  reviews: async () => <TestimonialsSection testimonials={await getTestimonials()} />,
  story: async () => <BrandStory story={await getBrandStory()} />,
  "brand-story": async () => <BrandStory story={await getBrandStory()} />,
  faq: async () => <FAQSection items={await getFaq()} />,
  newsletter: async () => <Newsletter content={await getNewsletterContent()} />,
};

export default async function HomePage() {
  const sections = await getHomepageSections();
  const visibleSections = sections.filter((s) => s.visible !== false);

  const rendered = await Promise.all(
    visibleSections.map(async (s) => {
      const render = SECTION_COMPONENTS[s.id];
      if (!render) return null;
      return { id: s.id, node: await render() };
    })
  );

  return <div>{rendered.filter(Boolean).map((s) => <div key={s.id}>{s.node}</div>)}</div>;
}
