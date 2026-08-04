"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, CheckCircle2 } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

export default function CheckoutPage() {
  const { items, subtotal, discount, shippingEstimate, taxEstimate, total, clearCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated, user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      showToast("Please sign in to complete your checkout.", "warning");
      router.push("/account/login?redirect=/checkout");
    }
  }, [hydrated, isAuthenticated, router, showToast]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    billingSameAsShipping: true,
    paymentMethod: "cod",
    notes: "",
  });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        email: f.email || user.email || "",
        firstName: f.firstName || user.first_name || user.name || "",
        lastName: f.lastName || user.last_name || "",
      }));
    }
  }, [user]);


  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast("Your bag is empty", "error");
      return;
    }
    setPlacing(true);
    try {
      const addressString = `${form.address}, ${form.city}, ${form.state} ${form.zip}`;
      const payload = {
        email: form.email,
        phone: form.phone,
        shipping_address: addressString,
        billing_address: form.billingSameAsShipping ? addressString : addressString,
        payment_method: form.paymentMethod || 'cod',
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };


      await api.post('products/checkout/', payload, {
        headers: {
          'Idempotency-Key': `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        },
      });

      clearCart();
      showToast("Order placed successfully! Thank you for your purchase.", "success");
      router.push("/account/orders");
    } catch (err) {
      console.error("Checkout failed:", err);
      const msg = err.response?.data?.error || err.response?.data?.detail || "Order placement failed. Please try again.";
      showToast(msg, "danger");
    } finally {
      setPlacing(false);
    }
  };


  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-3">Nothing to check out</h1>
        <p className="text-ink2 mb-6">Your bag is empty — add something you love first.</p>
        <Button as="a" href="/shop">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Bag", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="font-display text-4xl mt-3 mb-10">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-10">
          <section>
            <h2 className="font-display text-xl mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" value={form.firstName} onChange={(v) => update({ firstName: v })} required />
              <Field label="Last name" value={form.lastName} onChange={(v) => update({ lastName: v })} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => update({ email: v })} required className="col-span-2" />
              <Field label="Phone" value={form.phone} onChange={(v) => update({ phone: v })} required className="col-span-2" />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl mb-4">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Street address" value={form.address} onChange={(v) => update({ address: v })} required className="col-span-2" />
              <Field label="City" value={form.city} onChange={(v) => update({ city: v })} required />
              <Field label="State / Province" value={form.state} onChange={(v) => update({ state: v })} required />
              <Field label="ZIP / Postal code" value={form.zip} onChange={(v) => update({ zip: v })} required />
            </div>
            <label className="flex items-center gap-2 text-sm mt-4">
              <input
                type="checkbox"
                checked={form.billingSameAsShipping}
                onChange={(e) => update({ billingSameAsShipping: e.target.checked })}
                className="accent-forest"
              />
              Billing address same as shipping
            </label>
          </section>

          <section>
            <h2 className="font-display text-xl mb-4">Payment Method</h2>
            <div className="space-y-3">
              <PaymentOption
                icon={Banknote}
                label="Cash on Delivery"
                description="Pay with cash when your order arrives."
                checked={form.paymentMethod === "cod"}
                onSelect={() => update({ paymentMethod: "cod" })}
              />
              <PaymentOption
                icon={CreditCard}
                label="Credit / Debit Card"
                description="Coming soon — card gateway integration is future-ready."
                checked={form.paymentMethod === "card"}
                onSelect={() => update({ paymentMethod: "card" })}
                disabled
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl mb-4">Order Notes (Optional)</h2>
            <textarea
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={3}
              placeholder="Delivery instructions, gift notes, etc."
              className="w-full border border-line rounded-sm px-4 py-3 text-sm bg-paper outline-none focus:border-forest"
            />
          </section>
        </div>

        <div className="bg-paper rounded-md p-6 h-fit">
          <h2 className="font-display text-xl mb-5">Order Summary</h2>
          <ul className="space-y-3 mb-5 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <li key={`${item.id}-${item.color}-${item.size}`} className="flex justify-between text-sm">
                <span className="text-ink2">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2.5 text-sm border-t border-line pt-4">
            <Row label="Subtotal" value={formatCurrency(subtotal)} />
            {discount > 0 && <Row label="Discount" value={`− ${formatCurrency(discount)}`} accent />}
            <Row label="Shipping" value={shippingEstimate === 0 ? "Free" : formatCurrency(shippingEstimate)} />
            <Row label="Tax" value={formatCurrency(taxEstimate)} />
          </div>
          <div className="border-t border-line mt-4 pt-4 flex justify-between font-medium text-base">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-6" disabled={placing}>
            {placing ? "Placing Order…" : "Place Order"}
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-ink2 justify-center mt-3">
            <CheckCircle2 size={13} /> Secure checkout, encrypted end-to-end
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, className = "" }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
      />
    </label>
  );
}

function PaymentOption({ icon: Icon, label, description, checked, onSelect, disabled }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={checked}
      className={`w-full flex items-start gap-3 p-4 border rounded-sm text-left transition-colors disabled:opacity-50 ${
        checked ? "border-forest bg-forest/5" : "border-line hover:border-ink"
      }`}
    >
      <Icon size={20} className="text-forest mt-0.5" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-ink2">{description}</p>
      </div>
    </button>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink2">{label}</span>
      <span className={`font-mono ${accent ? "text-forest" : ""}`}>{value}</span>
    </div>
  );
}
