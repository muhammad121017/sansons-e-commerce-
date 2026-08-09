"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { getFooterContent } from "@/lib/services/cmsService";
import { useToast } from "@/lib/context/ToastContext";

export default function ContactPage() {
  const [content, setContent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    getFooterContent().then(setContent);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      if (showToast) showToast("Thank you! Your message has been sent to Sansons Concierge.", "success");
    }, 600);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-display text-4xl mb-4 text-forest">Contact Sansons Concierge</h1>
        <p className="text-ink2 leading-relaxed text-sm">
          Have a question about an order, bespoke inquiries, or product details? We look forward to assisting you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Contact Details Card */}
        <div className="bg-paper border border-line rounded-lg p-8 space-y-8 shadow-soft">
          <div>
            <h2 className="font-display text-xl text-ink mb-2">Get in Touch</h2>
            <p className="text-xs text-ink2 leading-relaxed">
              {content?.description || "Considered goods, made by hand. Built for a decade of use."}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-full bg-forest/10 text-forest shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink2 font-semibold">Email Us</p>
                <p className="text-sm font-medium text-ink mt-0.5">{content?.contact?.email || "hello@yourstore.com"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-full bg-forest/10 text-forest shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink2 font-semibold">Phone / Support</p>
                <p className="text-sm font-medium text-ink mt-0.5">{content?.contact?.phone || "+1 (800) 555-0192"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-full bg-forest/10 text-forest shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink2 font-semibold">Atelier Address</p>
                <p className="text-sm font-medium text-ink mt-0.5">{content?.contact?.address || "142 Atelier Street, New York, NY"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-paper border border-line rounded-lg p-8 shadow-soft">
          {submitted ? (
            <div className="text-center py-16 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-forest mx-auto animate-bounce" />
              <h3 className="font-display text-2xl text-ink">Message Received</h3>
              <p className="text-sm text-ink2 max-w-md mx-auto">
                Thank you for reaching out. A Sansons representative will review your message and reply within 24 hours.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline" size="sm" className="mt-4">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="font-display text-xl text-ink mb-6">Send an Inquiry</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink2 mb-2 font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-line rounded-sm px-4 py-3 bg-canvas outline-none focus:border-forest text-sm"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink2 mb-2 font-medium">Your Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-line rounded-sm px-4 py-3 bg-canvas outline-none focus:border-forest text-sm"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink2 mb-2 font-medium">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-line rounded-sm px-4 py-3 bg-canvas outline-none focus:border-forest text-sm"
                  placeholder="Order Inquiry / Product Details"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink2 mb-2 font-medium">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full border border-line rounded-sm px-4 py-3 bg-canvas outline-none focus:border-forest text-sm"
                  placeholder="How can we help you today?"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
                <Send size={16} /> {loading ? "Sending Message…" : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
