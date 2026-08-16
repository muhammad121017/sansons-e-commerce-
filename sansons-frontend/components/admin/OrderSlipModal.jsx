"use client";

import React from "react";
import { Printer, X, CheckCircle, Package, MapPin, Phone, User, Calendar, CreditCard } from "lucide-react";
import api from "@/lib/api";

export default function OrderSlipModal({ order, isOpen, onClose }) {
  const [shipper, setShipper] = React.useState({
    name: "Sansons Logistics & Fulfillment",
    address: "Sansons Warehouse, Industrial Hub Gate 4, Karachi",
    phone: "+92 300 1234567",
    email: "dispatch@sansons.com",
    returnNote: "Please inspect package upon delivery. Returns accepted within 30 days."
  });

  React.useEffect(() => {
    if (isOpen) {
      api.get("dashboard/settings/")
        .then((res) => {
          if (res.data) {
            setShipper({
              name: res.data.shipper_name || res.data.store_name || "Sansons Logistics & Fulfillment",
              address: res.data.shipper_address || res.data.store_address || "Sansons Warehouse, Industrial Hub Gate 4, Karachi",
              phone: res.data.shipper_phone || res.data.support_phone || "+92 300 1234567",
              email: res.data.shipper_email || res.data.support_email || "dispatch@sansons.com",
              returnNote: res.data.return_policy_note || "Please inspect package upon delivery. Returns accepted within 30 days."
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = order.items || order.order_items || [];
  
  // Calculate subtotal and grand total
  const itemsSubtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.price_at_purchase || item.price || 0);
    const qty = parseInt(item.quantity || 1);
    return acc + price * qty;
  }, 0);

  const shippingFee = 200;
  const grandTotal = itemsSubtotal > 0 ? itemsSubtotal + shippingFee : parseFloat(order.total_amount || 0);

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleDateString();

  const customerName = order.customer_name || `${order.first_name || ''} ${order.last_name || ''}`.trim() || order.shipping_address?.full_name || "Guest Customer";
  const customerPhone = order.customer_phone || order.phone || order.phone_number || order.shipping_address?.phone || "N/A";
  const addressStr = order.shipping_address
    ? typeof order.shipping_address === "string"
      ? order.shipping_address
      : `${order.shipping_address.street || order.shipping_address.address || ""}, ${order.shipping_address.city || ""}, ${order.shipping_address.province || order.shipping_address.state || ""}`
    : "Standard Shipping Address";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-order-slip, #printable-order-slip * {
            visibility: visible;
          }
          #printable-order-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-zinc-200 print:shadow-none print:border-none print:max-w-none print:max-h-none print:w-full">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-zinc-900 text-white border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-medium text-sm tracking-wide">Order Packing Slip & Invoice</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div id="printable-order-slip" className="p-8 overflow-y-auto bg-white text-zinc-900">
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight text-zinc-900">SANSONS</h1>
              <p className="text-xs tracking-widest text-zinc-500 uppercase font-medium mt-1">Official Packing Slip & Invoice</p>
              <p className="text-xs text-zinc-600 mt-1 font-medium">{shipper.name}</p>
              <p className="text-xs text-zinc-500">{shipper.address}</p>
              <p className="text-xs text-zinc-500">Phone: {shipper.phone} | Email: {shipper.email}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-zinc-100 border border-zinc-300 rounded text-xs font-mono font-bold text-zinc-800 uppercase tracking-wider">
                #{order.id ? strShort(order.id) : "ORD-00000"}
              </span>
              <p className="text-xs text-zinc-500 mt-2 flex items-center justify-end gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Customer & Order Metadata Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8 bg-zinc-50 p-4 rounded-md border border-zinc-200 text-xs">
            <div>
              <h4 className="font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                Customer Shipping Details
              </h4>
              <p className="font-semibold text-sm text-zinc-900">{customerName}</p>
              <p className="text-zinc-600 mt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                <span className="font-mono font-medium">{customerPhone}</span>
              </p>
              <p className="text-zinc-600 mt-1 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>{addressStr}</span>
              </p>
            </div>

            <div>
              <h4 className="font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                Payment & Fulfillment
              </h4>
              <p className="text-zinc-700">
                <span className="font-medium text-zinc-500">Payment Method: </span>
                <span className="font-semibold uppercase font-mono text-zinc-900">
                  {order.payment_gateway_ref === "cod" || order.payment_method === "cod" ? "Cash on Delivery (COD)" : "Online Payment"}
                </span>
              </p>
              <p className="text-zinc-700 mt-1">
                <span className="font-medium text-zinc-500">Payment Status: </span>
                <span className={`font-semibold uppercase px-2 py-0.5 rounded text-[10px] ${
                  order.payment_status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                }`}>
                  {order.payment_status || "Unpaid (Collect COD)"}
                </span>
              </p>
              <p className="text-zinc-700 mt-1">
                <span className="font-medium text-zinc-500">Order Status: </span>
                <span className="font-semibold capitalize text-zinc-900">{order.order_status || "Pending"}</span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mb-8">
            <h4 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] mb-3">Itemized Order Details</h4>
            <table className="w-full text-xs text-left border-collapse border border-zinc-200">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-300">
                  <th className="p-2.5 w-10 text-center border-r border-zinc-200">#</th>
                  <th className="p-2.5 border-r border-zinc-200">Item & Description</th>
                  <th className="p-2.5 border-r border-zinc-200">SKU</th>
                  <th className="p-2.5 w-16 text-center border-r border-zinc-200">Qty</th>
                  <th className="p-2.5 w-28 text-right border-r border-zinc-200">Unit Price</th>
                  <th className="p-2.5 w-28 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const price = parseFloat(item.price_at_purchase || item.price || 0);
                    const qty = parseInt(item.quantity || 1);
                    const title = item.product_name || item.product?.title || item.title || "Product";
                    const sku = item.sku || item.product?.sku || "N/A";
                    return (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="p-2.5 text-center text-zinc-500 border-r border-zinc-200 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-medium text-zinc-900 border-r border-zinc-200">{title}</td>
                        <td className="p-2.5 text-zinc-500 font-mono border-r border-zinc-200">{sku}</td>
                        <td className="p-2.5 text-center font-bold text-zinc-800 border-r border-zinc-200">{qty}</td>
                        <td className="p-2.5 text-right text-zinc-600 font-mono border-r border-zinc-200">Rs. {price.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-semibold font-mono text-zinc-900">Rs. {(price * qty).toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-zinc-400">No items recorded for this order.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-72 bg-zinc-50 p-4 rounded border border-zinc-200 text-xs space-y-2">
              <div className="flex justify-between text-zinc-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-medium">Rs. {itemsSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping Fee:</span>
                <span className="font-mono font-medium">Rs. {shippingFee}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Sales Tax (0%):</span>
                <span className="font-mono font-medium">Rs. 0</span>
              </div>
              <div className="border-t border-zinc-300 pt-2 flex justify-between font-bold text-sm text-zinc-900">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-700">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer & Barcode Section */}
          <div className="border-t border-zinc-200 pt-6 flex items-center justify-between text-[11px] text-zinc-500">
            <div>
              <p className="font-semibold text-zinc-700">Packing & Dispatch Instructions:</p>
              <p>Verify item SKU and quantity before sealing package. Keep this slip inside parcel.</p>
            </div>
            <div className="text-right">
              <div className="inline-block border-2 border-dashed border-zinc-400 px-4 py-1.5 font-mono text-xs font-bold text-zinc-700 tracking-widest uppercase">
                SANSONS-VERIFIED
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">Generated by Sansons Portal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function strShort(idStr) {
  if (!idStr) return "00000";
  return idStr.toString().substring(0, 8).toUpperCase();
}
