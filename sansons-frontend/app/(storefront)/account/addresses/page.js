"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import AccountShell from "@/components/layout/AccountShell";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([
    { id: "a1", label: "Home", line1: "142 Atelier Street", city: "New York", state: "NY", zip: "10012", default: true },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ label: "", line1: "", city: "", state: "", zip: "" });

  const handleSave = (e) => {
    e.preventDefault();
    setAddresses((prev) => [...prev, { ...form, id: "a" + Date.now(), default: prev.length === 0 }]);
    setForm({ label: "", line1: "", city: "", state: "", zip: "" });
    setModalOpen(false);
  };

  const remove = (id) => setAddresses((prev) => prev.filter((a) => a.id !== id));

  return (
    <AccountShell title="Saved Addresses">
      <div className="mb-6">
        <Button onClick={() => setModalOpen(true)} variant="primary">
          <Plus size={15} /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses saved" description="Add an address to speed up checkout." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="border border-line rounded-md p-5 relative">
              {a.default && <span className="absolute top-4 right-4 text-[10px] uppercase text-forest">Default</span>}
              <p className="font-medium">{a.label}</p>
              <p className="text-sm text-ink2 mt-1">
                {a.line1}, {a.city}, {a.state} {a.zip}
              </p>
              <div className="flex gap-3 mt-4">
                <button className="text-xs text-ink2 flex items-center gap-1 hover:text-ink">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => remove(a.id)} className="text-xs text-wine flex items-center gap-1">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Address">
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Label (e.g. Home)" value={form.label} onChange={(v) => setForm((f) => ({ ...f, label: v }))} />
          <Field label="Street address" value={form.line1} onChange={(v) => setForm((f) => ({ ...f, line1: v }))} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
            <Field label="State" value={form.state} onChange={(v) => setForm((f) => ({ ...f, state: v }))} />
            <Field label="ZIP" value={form.zip} onChange={(v) => setForm((f) => ({ ...f, zip: v }))} />
          </div>
          <Button type="submit" variant="primary" className="w-full">Save Address</Button>
        </form>
      </Modal>
    </AccountShell>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">{label}</span>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
      />
    </label>
  );
}
