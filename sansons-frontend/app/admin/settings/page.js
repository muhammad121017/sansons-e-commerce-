"use client";

import { useEffect, useState } from "react";
import { Save, Sparkles } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Button from "@/components/ui/Button";
import { useToast } from "@/lib/context/ToastContext";
import api from "@/lib/api";

const SETTINGS_STORAGE_KEY = "sansons_global_settings";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [store, setStore] = useState({ name: "Sansons", email: "hello@sansons.com", currency: "PKR" });
  const [shipping, setShipping] = useState({ freeThreshold: 5000, flatRate: 250 });
  const [codEnabled, setCodEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSettings = () => {
    setLoading(true);
    api.get("dashboard/settings/")
      .then((res) => {
        const data = res.data;
        if (data) {
          setStore({
            name: data.store_name || "Sansons",
            email: data.support_email || "hello@sansons.com",
            currency: data.currency || "PKR"
          });
          setShipping({
            freeThreshold: parseFloat(data.free_shipping_threshold) || 5000,
            flatRate: parseFloat(data.flat_shipping_rate) || 250
          });
          setCodEnabled(data.cod_enabled ?? true);
        }
        setLoading(false);
      })
      .catch(() => {
        try {
          const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
          if (stored) {
            const data = JSON.parse(stored);
            if (data.store) setStore(data.store);
            if (data.shipping) setShipping(data.shipping);
            if (data.codEnabled !== undefined) setCodEnabled(data.codEnabled);
          }
        } catch (e) {}
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      store_name: store.name,
      support_email: store.email,
      currency: store.currency,
      free_shipping_threshold: shipping.freeThreshold,
      flat_shipping_rate: shipping.flatRate,
      cod_enabled: codEnabled,
    };

    try {
      await api.post("dashboard/settings/", payload);
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ store, shipping, codEnabled }));
      } catch (e) {}
      showToast("Global Settings saved to PostgreSQL database!", "success");
    } catch (err) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ store, shipping, codEnabled }));
        showToast("Global Settings saved locally.", "success");
      } catch (e) {
        showToast("Failed to save settings", "danger");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminTopbar title="Settings" />
      <form onSubmit={handleSave} className="p-8 max-w-2xl space-y-8">
        {loading ? (
          <div className="py-12 text-center text-sm text-ink2">Loading global settings from database...</div>
        ) : (
          <>
            <section className="bg-paper border border-line rounded-md p-6">
              <h2 className="font-medium mb-4">Store Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Store Name" value={store.name} onChange={(v) => setStore((s) => ({ ...s, name: v }))} />
                <Field label="Support Email" value={store.email} onChange={(v) => setStore((s) => ({ ...s, email: v }))} />
                <label className="block text-sm">
                  <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Currency</span>
                  <select
                    value={store.currency}
                    onChange={(e) => setStore((s) => ({ ...s, currency: e.target.value }))}
                    className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
                  >
                    <option>PKR</option>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="bg-paper border border-line rounded-md p-6">
              <h2 className="font-medium mb-4">Shipping</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Free Shipping Threshold (PKR)" type="number" value={shipping.freeThreshold} onChange={(v) => setShipping((s) => ({ ...s, freeThreshold: v }))} />
                <Field label="Flat Shipping Rate (PKR)" type="number" value={shipping.flatRate} onChange={(v) => setShipping((s) => ({ ...s, flatRate: v }))} />
              </div>
            </section>


            <section className="bg-paper border border-line rounded-md p-6">
              <h2 className="font-medium mb-4">Payments</h2>
              <label className="flex items-center gap-2 text-sm mb-3">
                <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="accent-forest" />
                Enable Cash on Delivery
              </label>
              <p className="text-xs text-ink2">
                Card/wallet gateways (Stripe, Razorpay, PayPal) are not yet connected — this panel is future-ready for that integration.
              </p>
            </section>

            <section className="bg-paper border border-line rounded-md p-6">
              <h2 className="font-medium mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-brass" /> AI Features (Coming Soon)
              </h2>
              <ul className="text-sm text-ink2 space-y-1.5 list-disc list-inside">
                <li>AI-assisted search & recommendations</li>
                <li>AI-generated product descriptions & SEO metadata</li>
                <li>AI inventory forecasting</li>
                <li>AI marketing campaign generator</li>
                <li>AI customer support assistant</li>
              </ul>
            </section>

            <Button type="submit" variant="primary" disabled={saving}>
              <Save size={15} /> {saving ? "Saving..." : "Save Settings"}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest"
      />
    </label>
  );
}
