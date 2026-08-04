import Accordion from "@/components/ui/Accordion";

export default function FAQSection({ items }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">Good to Know</p>
        <h2 className="font-display text-3xl sm:text-4xl">Frequently Asked Questions</h2>
      </div>
      <Accordion items={items} />
    </section>
  );
}
