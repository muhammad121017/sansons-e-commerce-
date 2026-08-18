"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingCart, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { AdminTopbar, StatCard } from "@/components/admin/AdminUI";
import Badge from "@/components/ui/Badge";
import { getOrders } from "@/lib/services/orderService";
import { fetchAdminProducts } from "@/lib/services/productService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import api from "@/lib/api";

const STATUS_TONE = { Delivered: "success", Shipped: "neutral", Processing: "warning", Pending: "warning", Cancelled: "danger" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [sellerFilter, setSellerFilter] = useState("all");

  useEffect(() => {
    if (user?.role === "admin") {
      api.get("dashboard/admin/sellers/")
        .then((res) => {
          setSellers(res.data.results || res.data || []);
        })
        .catch(() => {});
    }
  }, [user]);

  const loadDashboardData = (sId = sellerFilter) => {
    const url = sId && sId !== "all"
      ? `dashboard/admin/financials/?seller_id=${sId}`
      : "dashboard/admin/financials/";
      
    api.get(url)
      .then((res) => {
        const d = res.data;
        setStats({
          totalRevenue: parseFloat(d.total_revenue || d.total_gmv || 0),
          totalOrders: d.total_orders || 0,
          pending: d.pending || d.pending_orders || 0,
          avgOrderValue: parseFloat(d.avg_order_value || 0)
        });
      })
      .catch(() => {});

    getOrders(sId).then((o) => setOrders(o.slice(0, 5))).catch(() => {});
    fetchAdminProducts(sId).then((p) => setProducts(p)).catch(() => {});
  };

  useEffect(() => {
    loadDashboardData(sellerFilter);
  }, [sellerFilter]);

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter((p) => p.stock === 0);

  return (
    <div>
      <AdminTopbar title="Dashboard" />
      <div className="p-4 sm:p-6 space-y-4">
        {user?.role === "admin" && (
          <div className="flex items-center justify-between mb-6 bg-paper p-4 border border-line rounded-md">
            <div>
              <h3 className="font-semibold text-sm text-ink">Marketplace Sales Filter</h3>
              <p className="text-xs text-ink2">Filter revenue, orders, and top products by specific seller store.</p>
            </div>
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="border border-line rounded px-3.5 py-2 text-xs bg-paper font-medium focus:border-forest outline-none"
            >
              <option value="all">🏪 All Marketplace Sales (Overall)</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  👤 {s.email} ({s.first_name || "Seller"})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon={DollarSign} label="Total Revenue" value={stats ? formatCurrency(stats.totalRevenue) : "—"} tone="forest" trend="+12.4%" />
          <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders ?? "—"} tone="brass" />
          <StatCard icon={Clock} label="Pending / Processing" value={stats?.pending ?? "—"} tone="wine" />
          <StatCard icon={TrendingUp} label="Avg. Order Value" value={stats ? formatCurrency(stats.avgOrderValue) : "—"} tone="forest" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-paper border border-line rounded-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <h2 className="font-medium">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-forest underline">View all</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink2 text-xs uppercase">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="px-6 py-3.5 font-medium">{o.id}</td>
                    <td className="px-6 py-3.5">{o.customer}</td>
                    <td className="px-6 py-3.5 text-ink2">{formatDate(o.date)}</td>
                    <td className="px-6 py-3.5">
                      <Badge tone={STATUS_TONE[o.status] || "neutral"}>{o.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono">{formatCurrency(o.total)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-ink2 text-sm">
                      No recent orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-paper border border-line rounded-md p-6">
            <h2 className="font-medium flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-wine" /> Inventory Alerts
            </h2>
            <p className="text-xs uppercase text-ink2 mb-2">Low Stock</p>
            <ul className="space-y-2 mb-5">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="line-clamp-1">{p.name}</span>
                  <span className="font-mono text-brass">{p.stock} left</span>
                </li>
              ))}
              {lowStock.length === 0 && <li className="text-sm text-ink2">Nothing low right now.</li>}
            </ul>
            <p className="text-xs uppercase text-ink2 mb-2">Out of Stock</p>
            <ul className="space-y-2">
              {outOfStock.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="line-clamp-1">{p.name}</span>
                  <span className="font-mono text-wine">0</span>
                </li>
              ))}
              {outOfStock.length === 0 && <li className="text-sm text-ink2">Nothing out of stock.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
