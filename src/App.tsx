import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { ProductCatalog } from "./components/ProductCatalog";
import { CartDrawer } from "./components/CartDrawer";
import { OrderHistory } from "./components/OrderHistory";
import { ShipmentTrackingModal } from "./components/ShipmentTrackingModal";
import { AuthModal } from "./components/AuthModal";
import { PaymentModal } from "./components/PaymentModal";
import { AdminPortal } from "./components/AdminPortal";
import {
  AuthResponse,
  Product,
  CartResponse,
  OrderResponse,
  AddressResponse,
  ShipmentResponse,
  AppTab,
  Role,
  OrderStatus,
  ShipmentStatus,
} from "./types";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(() => {
    try {
      const saved = localStorage.getItem("ecommerce_auth");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<AppTab>("store");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [adminOrders, setAdminOrders] = useState<OrderResponse[]>([]);

  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<number | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentResponse | null>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalOrder, setPaymentModalOrder] = useState<OrderResponse | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper for authenticated API calls
  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers || {});
      if (currentUser?.token) {
        headers.set("Authorization", `Bearer ${currentUser.token}`);
      }
      if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
        headers.set("Content-Type", "application/json");
      }
      return fetch(url, { ...options, headers });
    },
    [currentUser]
  );

  // Fetch Products
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        showToast("Failed to load products", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error loading catalog", "error");
    } finally {
      setIsLoadingProducts(false);
    }
  }, [showToast]);

  // Fetch Cart
  const loadCart = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await apiFetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  }, [currentUser, apiFetch]);

  // Fetch Orders
  const loadOrders = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingOrders(true);
    try {
      const res = await apiFetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [currentUser, apiFetch]);

  // Fetch Addresses
  const loadAddresses = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await apiFetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error("Addresses fetch error:", err);
    }
  }, [currentUser, apiFetch]);

  // Load Admin Orders
  const loadAdminOrders = useCallback(async () => {
    if (!currentUser || currentUser.role !== "ADMIN") return;
    setIsLoadingAdmin(true);
    try {
      const res = await apiFetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setAdminOrders(data);
      }
    } catch (err) {
      console.error("Admin orders fetch error:", err);
    } finally {
      setIsLoadingAdmin(false);
    }
  }, [currentUser, apiFetch]);

  // Initial load
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("ecommerce_auth", JSON.stringify(currentUser));
      loadCart();
      loadOrders();
      loadAddresses();
      if (currentUser.role === "ADMIN") {
        loadAdminOrders();
      }
    } else {
      localStorage.removeItem("ecommerce_auth");
      setCart(null);
      setOrders([]);
      setAddresses([]);
      setAdminOrders([]);
    }
  }, [currentUser, loadCart, loadOrders, loadAddresses, loadAdminOrders]);

  // Handle Login
  const handleLogin = async (
    email: string,
    pass: string,
    adminSecurityKey?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass, adminSecurityKey }),
      });
      if (res.ok) {
        const data: AuthResponse = await res.json();
        setCurrentUser(data);
        showToast(`Welcome back, ${data.name}!`, "success");
        if (data.role === "ADMIN") {
          setCurrentTab("admin");
        }
        return true;
      } else {
        const err = await res.json();
        showToast(err.error || "Authentication failed", "error");
        return false;
      }
    } catch (err) {
      console.error(err);
      showToast("Network error during login", "error");
      return false;
    }
  };

  // Handle Register
  const handleRegister = async (
    name: string,
    email: string,
    pass: string,
    role: Role = "CUSTOMER",
    adminSecurityKey?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: pass,
          role,
          adminSecurityKey,
        }),
      });
      if (res.ok) {
        const data: AuthResponse = await res.json();
        setCurrentUser(data);
        showToast(`Account created successfully as ${role}!`, "success");
        if (data.role === "ADMIN") {
          setCurrentTab("admin");
        }
        return true;
      } else {
        const err = await res.json();
        showToast(err.error || "Registration failed", "error");
        return false;
      }
    } catch (err) {
      console.error(err);
      showToast("Network error during registration", "error");
      return false;
    }
  };

  // Admin Actions
  const handleAddProduct = async (productData: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
  }) => {
    try {
      const res = await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        showToast(`Product "${productData.name}" added to catalog!`, "success");
        await loadProducts();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to add product", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error adding product", "error");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const res = await apiFetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Product deleted successfully", "success");
        await loadProducts();
      } else {
        showToast("Failed to delete product", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting product", "error");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Order #${orderId} status updated to ${status}`, "success");
        loadAdminOrders();
        loadOrders();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to update order status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating order status", "error");
    }
  };

  const handleCreateShipment = async (orderId: number, courier: string, eta: string) => {
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}/shipment`, {
        method: "POST",
        body: JSON.stringify({ courier, eta }),
      });
      if (res.ok) {
        showToast(`Shipment created for Order #${orderId}`, "success");
        loadAdminOrders();
        loadOrders();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to create shipment", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating shipment", "error");
    }
  };

  const handleUpdateShipment = async (
    orderId: number,
    status: ShipmentStatus,
    location: string,
    lat?: number,
    lng?: number
  ) => {
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}/shipment`, {
        method: "PUT",
        body: JSON.stringify({ status, location, latitude: lat, longitude: lng }),
      });
      if (res.ok) {
        showToast(`Shipment checkpoint updated for Order #${orderId}`, "success");
        loadAdminOrders();
        loadOrders();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to update shipment", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating shipment", "error");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab("store");
    showToast("Signed out successfully", "info");
  };

  // Cart Operations
  const handleAddToCart = async (product: Product, quantity: number = 1): Promise<boolean> => {
    if (!currentUser) {
      setIsAuthOpen(true);
      showToast("Please sign in to add items to cart", "info");
      return false;
    }

    try {
      const res = await apiFetch("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart);
        showToast(`Added ${product.name} to cart`, "success");
        return true;
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to add item", "error");
        return false;
      }
    } catch {
      showToast("Network error updating cart", "error");
      return false;
    }
  };

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    try {
      const res = await apiFetch(`/api/cart/items/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart);
      }
    } catch {
      showToast("Failed to update item quantity", "error");
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      const res = await apiFetch(`/api/cart/items/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart);
        showToast("Item removed from cart", "info");
      }
    } catch {
      showToast("Failed to remove item", "error");
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await apiFetch("/api/cart", {
        method: "DELETE",
      });
      if (res.ok) {
        setCart({ cartId: 0, items: [], total: 0 });
        showToast("Cart emptied", "info");
      }
    } catch {
      showToast("Failed to clear cart", "error");
    }
  };

  const handleAddNewAddress = async (newAddr: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  }) => {
    try {
      const res = await apiFetch("/api/addresses", {
        method: "POST",
        body: JSON.stringify(newAddr),
      });
      if (res.ok) {
        const savedAddr = await res.json();
        setAddresses((prev) => [...prev, savedAddr]);
        showToast("Shipping address saved", "success");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save address", "error");
      }
    } catch {
      showToast("Failed to save address", "error");
    }
  };

  const handleCheckout = async (_addressId: number) => {
    setIsCheckingOut(true);
    try {
      const res = await apiFetch("/api/orders", {
        method: "POST",
      });
      if (res.ok) {
        const newOrder: OrderResponse = await res.json();
        showToast(`Order #${newOrder.orderId} placed! Please complete your payment.`, "success");
        setIsCartOpen(false);
        await loadCart();
        await loadOrders();
        setCurrentTab("orders");
        // Open payment modal for the customer to choose UPI or Cash on Delivery
        setPaymentModalOrder(newOrder);
        setIsPaymentModalOpen(true);
      } else {
        const err = await res.json();
        showToast(err.error || "Checkout failed", "error");
      }
    } catch {
      showToast("Network error during checkout", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Payment Operations (UPI / Cash on Delivery)
  const handlePaymentSuccess = async (
    orderId: number,
    method: "UPI" | "CASH_ON_DELIVERY",
    details?: { upiId?: string; upiRef?: string }
  ): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/payments/${orderId}`, {
        method: "POST",
        body: JSON.stringify({
          paymentMethod: method,
          upiId: details?.upiId,
          upiRef: details?.upiRef,
        }),
      });
      if (res.ok) {
        showToast(
          method === "UPI"
            ? `UPI payment verified for Order #${orderId}!`
            : `Cash on Delivery confirmed for Order #${orderId}!`,
          "success"
        );
        await loadOrders();
        return true;
      } else {
        const err = await res.json();
        showToast(err.error || "Payment failed", "error");
        return false;
      }
    } catch {
      showToast("Failed to process payment", "error");
      return false;
    }
  };

  const handleTrackOrder = async (orderId: number) => {
    setSelectedTrackingOrder(orderId);
    setIsTrackingOpen(true);
    setIsLoadingTracking(true);
    setShipmentData(null);

    try {
      const res = await apiFetch(`/api/orders/${orderId}/tracking`);
      if (res.ok) {
        const data = await res.json();
        setShipmentData(data);
      } else {
        setShipmentData(null);
      }
    } catch {
      setShipmentData(null);
    } finally {
      setIsLoadingTracking(false);
    }
  };

  const totalCartCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        cartCount={totalCartCount}
        onOpenCart={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
            showToast("Please sign in to view your cart", "info");
          } else {
            setIsCartOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === "store" && (
          <ProductCatalog
            products={products}
            isLoading={isLoadingProducts}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentTab === "orders" && (
          <div>
            {!currentUser ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto p-6">
                <Info className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Sign in to view orders</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                  Track shipment status, complete pending UPI / Cash on Delivery payments, and review your purchase history.
                </p>
                <button
                  id="orders-sign-in-btn"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            ) : (
              <OrderHistory
                orders={orders}
                isLoading={isLoadingOrders}
                onTrackOrder={handleTrackOrder}
                onOpenPayment={(order) => {
                  setPaymentModalOrder(order);
                  setIsPaymentModalOpen(true);
                }}
                onRefresh={loadOrders}
              />
            )}
          </div>
        )}

        {currentTab === "admin" && currentUser?.role === "ADMIN" && (
          <AdminPortal
            orders={adminOrders}
            products={products}
            isLoading={isLoadingAdmin}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onCreateShipment={handleCreateShipment}
            onUpdateShipment={handleUpdateShipment}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onRefresh={() => {
              loadProducts();
              loadAdminOrders();
            }}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        addresses={addresses}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
        onAddNewAddress={handleAddNewAddress}
        isCheckingOut={isCheckingOut}
      />

      {/* Live Shipment Tracking Modal */}
      <ShipmentTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        shipment={shipmentData}
        isLoading={isLoadingTracking}
        orderId={selectedTrackingOrder}
      />

      {/* Payment Modal (UPI & Cash on Delivery) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={paymentModalOrder}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border text-sm max-w-sm transition-all duration-300 ${
              t.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : t.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {t.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
            {t.type === "info" && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="flex-1 font-medium leading-snug">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
