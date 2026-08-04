"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { getCoupons, createCoupon, deleteCoupon, toggleCouponActive } from "@/lib/services/orderService";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/lib/context/ToastContext";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", type: "Percentage", value: "", minSpend: "", usageLimit: "", expires: "" });
  const { showToast } = useToast();

  useEffect(() => {
    getCoupons().then((data) => {
      setCoupons(data);
      setLoading(false);
    });
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const nextStatus = await toggleCouponActive(id, currentStatus);
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: nextStatus } : c)));
      showToast("Coupon status updated", "success");
    } catch (err) {
      showToast("Failed to toggle coupon status", "danger");
    }
  };

  const remove = async (id) => {
    if (confirm("Delete this coupon?")) {
      try {
        await deleteCoupon(id);
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        showToast("Coupon deleted successfully", "success");
      } catch (err) {
        showToast("Failed to delete coupon", "danger");
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newCoupon = await createCoupon(form);
      setCoupons((prev) => [...prev, newCoupon]);
      setForm({ code: "", type: "Percentage", value: "", minSpend: "", usageLimit: "", expires: "" });
      setModalOpen(false);
      showToast("Coupon created successfully", "success");
    } catch (err) {
      showToast("Failed to create coupon", "danger");
    }
  };

  return (
    <div>
      <AdminTopbar
        title="Coupons & Discounts"
        actions={
          <Button onClick={() => setModalOpen(true)} variant="primary" size="sm">
            <Plus size={15} /> New Coupon
          </Button>
        }
      />
      <div className="p-8">
        {loading ? (
          <div className="text-center py-12 text-ink2 text-sm">
            Loading coupons from database...
          </div>
        ) : (
          <div className="bg-paper border border-line rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink2 text-xs uppercase bg-canvas2">
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Value</th>
                  <th className="px-6 py-3">Min. Spend</th>
                  <th className="px-6 py-3">Usage</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-6 py-3.5 font-mono font-medium">{c.code}</td>
                    <td className="px-6 py-3.5">{c.type}</td>
                    <td className="px-6 py-3.5">{c.type === "Percentage" ? `${c.value}%` : "—"}</td>
                    <td className="px-6 py-3.5">${c.minSpend}</td>
                    <td className="px-6 py-3.5">{c.used} / {c.usageLimit}</td>
                    <td className="px-6 py-3.5 text-ink2">{formatDate(c.expires)}</td>
                    <td className="px-6 py-3.5">
                      <button onClick={() => handleToggleActive(c.id, c.active)}>
                        <Badge tone={c.active ? "success" : "neutral"}>{c.active ? "Active" : "Inactive"}</Badge>
                      </button>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button onClick={() => remove(c.id)} aria-label="Delete coupon" className="p-1.5 hover:text-wine">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-ink2 text-sm">
                      No coupons found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Code" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))} />
          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
            >
              <option>Percentage</option>
              <option>Fixed Amount</option>
              <option>Free Shipping</option>
            </select>
          </label>
          <Field label="Value (% or $)" type="number" value={form.value} onChange={(v) => setForm((f) => ({ ...f, value: v }))} />
          <Field label="Minimum Spend" type="number" value={form.minSpend} onChange={(v) => setForm((f) => ({ ...f, minSpend: v }))} />
          <Field label="Usage Limit" type="number" value={form.usageLimit} onChange={(v) => setForm((f) => ({ ...f, usageLimit: v }))} />
          <Field label="Expiry Date" type="date" value={form.expires} onChange={(v) => setForm((f) => ({ ...f, expires: v }))} />
          <Button type="submit" variant="primary" className="w-full">Create Coupon</Button>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
      />
    </label>
  );
}
