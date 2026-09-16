import React, { useState } from "react";
import {
  ShieldCheck,
  Package,
  Truck,
  DollarSign,
  Plus,
  Edit2,
  RefreshCw,
  MapPin,
  Calendar,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { OrderResponse, OrderStatus, ShipmentStatus, Product } from "../types";

interface AdminPortalProps {
  orders: OrderResponse[];
  products: Product[];
  isLoading: boolean;
  onUpdateOrderStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  onCreateShipment: (orderId: number, courier: string, eta: string) => Promise<void>;
  onUpdateShipment: (
    orderId: number,
    status: ShipmentStatus,
    location: string,
    lat?: number,
    lng?: number
  ) => Promise<void>;
  onAddProduct: (product: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
  }) => Promise<void>;
  onDeleteProduct?: (productId: number) => Promise<void>;
  onRefresh: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  orders,
  products,
  isLoading,
  onUpdateOrderStatus,
  onCreateShipment,
  onUpdateShipment,
  onAddProduct,
  onDeleteProduct,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [shipmentModalOrder, setShipmentModalOrder] = useState<OrderResponse | null>(null);
  const [courierName, setCourierName] = useState("FedEx Express");
  const [etaDays, setEtaDays] = useState("3");

  // Shipment Update Form State
  const [updateShipmentOrder, setUpdateShipmentOrder] = useState<OrderResponse | null>(null);
  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>("IN_TRANSIT");
  const [currentLocation, setCurrentLocation] = useState("Central Distribution Hub");
  const [latitude, setLatitude] = useState("37.7749");
  const [longitude, setLongitude] = useState("-122.4194");

  // New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 25,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const inTransitCount = orders.filter((o) => o.status === "SHIPPED").length;

  const handleCreateShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentModalOrder) return;
    const etaDate = new Date(Date.now() + parseInt(etaDays, 10) * 86400000).toISOString();
    await onCreateShipment(shipmentModalOrder.orderId, courierName, etaDate);
    setShipmentModalOrder(null);
  };

  const handleUpdateShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateShipmentOrder) return;
    await onUpdateShipment(
      updateShipmentOrder.orderId,
      shipmentStatus,
      currentLocation,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    setUpdateShipmentOrder(null);
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddProduct(newProd);
    setShowAddProductModal(false);
    setNewProd({
      name: "",
      description: "",
      price: 0,
      stock: 25,
      category: "Electronics",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Orders</span>
            <p className="text-lg font-bold text-slate-900">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Gross Revenue</span>
            <p className="text-lg font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Shipments</span>
            <p className="text-lg font-bold text-slate-900">{inTransitCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Delivered</span>
            <p className="text-lg font-bold text-slate-900">{deliveredCount}</p>
          </div>
        </div>
      </div>

      {/* Main Admin Controller */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Control Strip */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              Operations & Logistics Console
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === "orders" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === "products" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Inventory ({products.length})
              </button>
            </div>

            {activeTab === "products" && (
              <button
                id="admin-add-product-btn"
                onClick={() => setShowAddProductModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 hover:bg-blue-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            )}

            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders Table */}
        {activeTab === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Order Status</th>
                  <th className="p-3 text-right">Logistics Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      #{order.orderId}
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 text-slate-700">
                      {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3">
                      {order.payment?.paymentMethod === "UPI" ? (
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            UPI (Paid)
                          </span>
                          <span className="block text-[10px] font-mono text-slate-500 mt-0.5 truncate max-w-[120px]">
                            {order.payment.transactionId}
                          </span>
                        </div>
                      ) : order.payment?.paymentMethod === "CASH_ON_DELIVERY" ? (
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            Cash on Delivery
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            Collect on delivery
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Unpaid / Placed
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(order.orderId, e.target.value as OrderStatus)
                        }
                        className="p-1 text-xs font-semibold rounded border border-slate-300 bg-white"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button
                        onClick={() => setShipmentModalOrder(order)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold hover:bg-blue-100 transition"
                        title="Create Tracking/Dispatch"
                      >
                        Dispatch
                      </button>
                      <button
                        onClick={() => setUpdateShipmentOrder(order)}
                        className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold hover:bg-amber-100 transition"
                        title="Update Shipment Checkpoint"
                      >
                        Update Hub
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Products Table */}
        {activeTab === "products" && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase font-semibold border-b border-slate-200 sticky top-0 bg-white">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-slate-500">#{p.id}</td>
                    <td className="p-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold">${p.price.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`font-semibold ${
                          p.stock < 10 ? "text-rose-600" : "text-slate-800"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {onDeleteProduct && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch / Create Shipment Modal */}
      {shipmentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Dispatch Order #{shipmentModalOrder.orderId}
              </h3>
              <button
                onClick={() => setShipmentModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateShipmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Courier Carrier
                </label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  placeholder="e.g. FedEx Express, DHL, Blue Dart"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Estimated Delivery (Days from today)
                </label>
                <select
                  value={etaDays}
                  onChange={(e) => setEtaDays(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="1">Next Day (1 day)</option>
                  <option value="2">Express (2 days)</option>
                  <option value="3">Standard (3 days)</option>
                  <option value="5">Ground (5 days)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShipmentModalOrder(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
                >
                  Create Shipment Label
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Shipment Checkpoint Modal */}
      {updateShipmentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Update Logistics for Order #{updateShipmentOrder.orderId}
              </h3>
              <button
                onClick={() => setUpdateShipmentOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateShipmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Shipment Status
                </label>
                <select
                  value={shipmentStatus}
                  onChange={(e) => setShipmentStatus(e.target.value as ShipmentStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="CREATED">CREATED</option>
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="RETURNED">RETURNED</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Current Checkpoint Location
                </label>
                <input
                  type="text"
                  required
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  placeholder="e.g. San Francisco Sorting Facility"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateShipmentOrder(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition"
                >
                  Update Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Product</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newProd.price}
                    onChange={(e) =>
                      setNewProd({ ...newProd, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProd.stock}
                    onChange={(e) =>
                      setNewProd({ ...newProd, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newProd.imageUrl}
                  onChange={(e) => setNewProd({ ...newProd, imageUrl: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
