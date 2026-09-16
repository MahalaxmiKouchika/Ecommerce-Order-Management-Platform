import React, { useState } from "react";
import {
  Package,
  Truck,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  QrCode,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { OrderResponse } from "../types";

interface OrderHistoryProps {
  orders: OrderResponse[];
  isLoading: boolean;
  onTrackOrder: (orderId: number) => void;
  onPayOrder?: (orderId: number, method: string) => Promise<void>;
  onOpenPayment: (order: OrderResponse) => void;
  onRefresh: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  isLoading,
  onTrackOrder,
  onOpenPayment,
}) => {
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "ALL") return true;
    return o.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "PLACED":
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            My Orders & Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View order status, complete pending UPI or COD payments, and track live shipments
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "ALL" ? "All Orders" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">
          <Package className="w-10 h-10 animate-bounce mx-auto mb-2 text-slate-300" />
          <p className="text-sm">Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When you place orders from the catalog, you can pay via UPI or Cash on Delivery and track shipments here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const hasPayment = Boolean(order.payment);
            const isUpiPaid = order.payment?.paymentMethod === "UPI";
            const isCod = order.payment?.paymentMethod === "CASH_ON_DELIVERY";
            const needsPayment = order.status === "PLACED" && !hasPayment;

            return (
              <div
                key={order.orderId}
                id={`order-card-${order.orderId}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Order Placed
                      </span>
                      <span className="font-semibold text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Order ID
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        #{order.orderId}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Total Amount
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center space-x-2">
                    {/* Payment Badge */}
                    {isUpiPaid && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Paid (UPI)</span>
                      </span>
                    )}

                    {isCod && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center space-x-1">
                        <Banknote className="w-3 h-3 text-indigo-600" />
                        <span>Cash on Delivery</span>
                      </span>
                    )}

                    {needsPayment && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Payment Pending</span>
                      </span>
                    )}

                    {/* Order Fulfillment Status Badge */}
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {item.productName}
                        </h4>
                        <span className="text-slate-500">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        ${item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 text-xs">
                    {/* Pay Button if pending */}
                    {needsPayment ? (
                      <button
                        id={`pay-order-btn-${order.orderId}`}
                        onClick={() => onOpenPayment(order)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 transition shadow-xs cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Pay Now (UPI / Cash on Delivery)</span>
                      </button>
                    ) : isUpiPaid ? (
                      <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>
                          Verified UPI Payment &bull;{" "}
                          <span className="font-mono font-semibold text-slate-600 text-[11px]">
                            {order.payment?.transactionId}
                          </span>
                        </span>
                      </div>
                    ) : isCod ? (
                      <div className="flex items-center space-x-1.5 text-indigo-700 font-medium">
                        <Banknote className="w-4 h-4 text-indigo-600" />
                        <span>
                          Cash on Delivery Confirmed &bull; Pay ${order.totalAmount.toFixed(2)} upon delivery
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-emerald-700 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Payment Confirmed</span>
                      </div>
                    )}
                  </div>

                  {/* Track Shipment Button */}
                  <button
                    id={`track-shipment-btn-${order.orderId}`}
                    onClick={() => onTrackOrder(order.orderId)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Shipment</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
