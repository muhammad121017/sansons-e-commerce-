"use client";

import { useEffect, useState } from "react";
import AccountShell from "@/components/layout/AccountShell";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Package } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { getOrdersByEmail } from "@/lib/services/orderService";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_TONE = {
  Delivered: "success",
  Shipped: "neutral",
  Processing: "warning",
  Pending: "warning",
  Cancelled: "danger",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // NOTE: mock user has no real order history, so we show sample orders
    // for demo purposes. Replace with getOrdersByEmail(user.email) only.
    getOrdersByEmail(user?.email || "").then((res) => {
      import("@/lib/data/orders").then(({ orders: allOrders }) => {
        setOrders(res.length ? res : allOrders.slice(0, 3));
      });
    });
  }, [user]);

  return (
    <AccountShell title="Order History">
      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" description="Your past orders will show up here." ctaLabel="Start Shopping" ctaHref="/shop" />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-line rounded-md p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="font-medium">{order.id}</p>
                <Badge tone={STATUS_TONE[order.status] || "neutral"}>{order.status}</Badge>
              </div>
              <p className="text-xs text-ink2 mb-3">Placed on {formatDate(order.date)} · {order.paymentMethod}</p>
              <ul className="text-sm space-y-1 mb-3">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-ink2">
                    <span>{item.name} × {item.qty}</span>
                    <span className="font-mono">{formatCurrency(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-medium border-t border-line pt-3">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
