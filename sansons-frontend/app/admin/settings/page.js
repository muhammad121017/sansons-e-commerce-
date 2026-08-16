"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Save, Sparkles, ExternalLink } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Button from "@/components/ui/Button";
import { useToast } from "@/lib/context/ToastContext";
import api from "@/lib/api";

const SETTINGS_STORAGE_KEY = "sansons_global_settings";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [store, setStore] = useState({ name: "Sansons", email: "hello@sansons.com", phone: "+1 (800) 555-0192", address: "142 Atelier Street, New York, NY", currency: "PKR" });
  const [shipper, setShipper] = useState({
    name: "Sansons Logistics & Fulfillment",
    address: "Sansons Warehouse, Industrial Hub Gate 4, Karachi",
    phone: "+92 300 1234567",
    email: "dispatch@sansons.com",
    returnNote: "Please inspect package upon delivery. Returns accepted within 30 days."
  });
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
            phone: data.support_phone || "+1 (800) 555-0192",
            address: data.store_address || "142 Atelier Street, New York, NY",
            currency: data.currency || "PKR"
          });
          setShipping({
            freeThreshold: parseFloat(data.free_shipping_threshold) || 5000,
            flatRate: parseFloat(data.flat_shipping_rate) || 250
          });
          setCodEnabled(data.cod_enabled ?? true);
          setShipper({
            name: data.shipper_name || "Sansons Logistics & Fulfillment",
            address: data.shipper_address || "Sansons Warehouse, Industrial Hub Gate 4, Karachi",
            phone: data.shipper_phone || "+92 300 1234567",
            email: data.shipper_email || "dispatch@sansons.com",
            returnNote: data.return_policy_note || "Please inspect package upon delivery. Returns accepted within 30 days."
          });
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
            if (data.shipper) setShipper(data.shipper);
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
      support_phone: store.phone,
      store_address: store.address,
      currency: store.currency,
      free_shipping_threshold: shipping.freeThreshold,
      flat_shipping_rate: shipping.flatRate,
      cod_enabled: codEnabled,
      shipper_name: shipper.name,
      shipper_address: shipper.address,
      shipper_phone: shipper.phone,
      shipper_email: shipper.email,
      return_policy_note: shipper.returnNote,
    };

    try {
      await api.post("dashboard/settings/", payload);
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ store, shipping, codEnabled, shipper }));
      } catch (e) {}
      showToast("Global Settings saved to PostgreSQL database!", "success");
    } catch (err) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ store, shipping, codEnabled, shipper }));
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
            <div className="bg-forest/10 border border-forest/30 rounded-md p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-forest font-semibold mb-1">Live Database Connection</p>
                <p className="text-sm font-medium text-ink font-display">PostgreSQL Central Store Configuration</p>
              </div>
              <Link href="/admin/cms?tab=footer" className="text-xs text-forest hover:underline flex items-center gap-1 font-semibold">
                Manage Store CMS & Footer <ExternalLink size={13} />
              </Link>
            </div>

            <section className="bg-paper border border-line rounded-md p-6">
              <h2 className="font-medium mb-4">Store Identity & Contact Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Store Name" value={store.name} onChange={(v) => setStore((s) => ({ ...s, name: v }))} />
                <Field label="Support Email" type="email" value={store.email} onChange={(v) => setStore((s) => ({ ...s, email: v }))} />
                <Field label="Support Phone" value={store.phone} onChange={(v) => setStore((s) => ({ ...s, phone: v }))} />
                <Field label="Store Address" value={store.address} onChange={(v) => setStore((s) => ({ ...s, address: v }))} />
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

            {/* SHIPPER & PACKING SLIP DETAILS */}
            <section className="bg-paper border border-line rounded-md p-6">
              <h2 className="font-medium mb-1">Shipper Details (Printed Invoices & Packing Slips)</h2>
              <p className="text-xs text-ink2 mb-4">These details will be printed on the official Order Packing Slips and Customer Invoices.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Shipper / Warehouse Name" value={shipper.name} onChange={(v) => setShipper((s) => ({ ...s, name: v }))} />
                  <Field label="Dispatch Phone" value={shipper.phone} onChange={(v) => setShipper((s) => ({ ...s, phone: v }))} />
                  <Field label="Dispatch Email" type="email" value={shipper.email} onChange={(v) => setShipper((s) => ({ ...s, email: v }))} />
                  <Field label="Warehouse Address" value={shipper.address} onChange={(v) => setShipper((s) => ({ ...s, address: v }))} />
                </div>
                <Field label="Invoice Return & Inspection Note" value={shipper.returnNote} onChange={(v) => setShipper((s) => ({ ...s, returnNote: v }))} />
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
