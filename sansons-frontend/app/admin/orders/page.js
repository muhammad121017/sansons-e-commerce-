"use client";

import { useEffect, useState } from "react";
import { Eye, Phone, Clock, MapPin, Mail, User } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { getOrders, updateOrderStatus } from "@/lib/services/orderService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/lib/context/ToastContext";

const STATUS_TONE = { Delivered: "success", Shipped: "neutral", Processing: "warning", Pending: "warning", Cancelled: "danger" };
const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const { showToast } = useToast();

  const loadOrders = () => {
    setLoading(true);
    getOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter((o) => statusFilter === "all" || o.status.toLowerCase() === statusFilter.toLowerCase());

  const handleUpdateStatus = async (order, newStatus) => {
    try {
      const targetId = order.rawId || order.id;
      await updateOrderStatus(targetId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
      showToast(`Order ${order.id} status updated to ${newStatus}`, "success");
    } catch (err) {
      showToast(`Failed to update status on server`, "danger");
    }
  };

  return (
    <div>
      <AdminTopbar title="Orders" />
      <div className="p-8">
        <div className="flex gap-3 mb-5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-line rounded-sm text-sm px-3 py-2.5 bg-paper"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <p className="text-sm text-ink2 ml-auto self-center">
            {loading ? "Loading..." : `${filtered.length} orders`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-ink2 text-sm">
            Loading orders from database...
          </div>
        ) : (
          <div className="bg-paper border border-line rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink2 text-xs uppercase bg-canvas2">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer & Phone</th>
                  <th className="px-6 py-3">Order Date & Time</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="px-6 py-3.5 font-mono font-medium text-xs">#{o.id}</td>
                    <td className="px-6 py-3.5">
                      <div>
                        <p className="font-medium text-xs">{o.customer}</p>
                        <p className="text-[11px] text-ink2 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone size={11} className="text-forest shrink-0" />
                          <span>{o.phone || "N/A"}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-ink2 font-mono">
                      <div>
                        <p className="font-medium text-ink">{o.formattedDate || formatDate(o.date)}</p>
                        <p className="text-[11px] text-ink2 flex items-center gap-1 mt-0.5">
                          <Clock size={11} className="shrink-0" />
                          <span>{o.formattedTime || "N/A"}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-xs">{o.paymentMethod}</td>
                    <td className="px-6 py-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o, e.target.value)}
                        className="text-xs border border-line rounded-sm px-2 py-1 bg-paper font-medium"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-semibold">{formatCurrency(o.total)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button onClick={() => setSelected(o)} aria-label="View order" className="p-1.5 hover:text-forest">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-ink2 text-sm">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order Details #${selected?.id}`}>
        {selected && (
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-line pb-3">
              <div>
                <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
                  <User size={14} className="text-forest" /> {selected.customer}
                </p>
                <p className="text-xs text-ink2 flex items-center gap-1 mt-1">
                  <Mail size={12} /> {selected.email}
                </p>
                <p className="text-xs text-forest font-mono flex items-center gap-1 mt-1 font-semibold">
                  <Phone size={12} /> Phone: {selected.phone || "Not provided"}
                </p>
              </div>
              <div className="text-right">
                <Badge tone={STATUS_TONE[selected.status] || "neutral"}>{selected.status}</Badge>
                <p className="text-[11px] text-ink2 font-mono mt-1.5 flex items-center justify-end gap-1">
                  <Clock size={11} /> {selected.formattedDate} at {selected.formattedTime}
                </p>
              </div>
            </div>

            {selected.shippingAddress && (
              <div className="bg-canvas2 border border-line rounded-md p-3 text-xs">
                <p className="font-semibold text-ink flex items-center gap-1 mb-1">
                  <MapPin size={13} className="text-forest" /> Shipping Address
                </p>
                <p className="text-ink2 leading-relaxed">{selected.shippingAddress}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink2 mb-2">Ordered Items</p>
              <ul className="divide-y divide-line border border-line rounded-md px-3 bg-paper">
                {selected.items.map((item, i) => (
                  <li key={i} className="py-2.5 flex justify-between text-sm">
                    <span>{item.name} × {item.qty}</span>
                    <span className="font-mono font-medium">{formatCurrency(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between font-bold text-base border-t border-line pt-3">
              <span>Total Amount</span>
              <span className="font-mono text-forest">{formatCurrency(selected.total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

