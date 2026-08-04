"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { fadeUp, viewportOnce } from "@/lib/motion";

export default function Newsletter({ content }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // NOTE: mock submission — wire to a real ESP (Klaviyo/Mailchimp) API route later.
    setSubmitted(true);
  };

  return (
    <section className="bg-ink text-canvas">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="max-w-2xl mx-auto px-6 py-20 text-center"
      >
        <h2 className="font-display text-3xl sm:text-4xl mb-3">{content.title}</h2>
        <p className="text-canvas/70 mb-8">{content.subtitle}</p>

        {submitted ? (
          <p className="flex items-center justify-center gap-2 text-brassLight">
            <CheckCircle2 size={18} /> You're on the list — welcome.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-w-md mx-auto border-b border-canvas/40 focus-within:border-brassLight">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Email address"
              className="flex-1 bg-transparent py-3 outline-none placeholder:text-canvas/50"
            />
            <button type="submit" aria-label="Subscribe" className="p-3 text-brassLight hover:text-canvas">
              <ArrowRight size={20} />
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
