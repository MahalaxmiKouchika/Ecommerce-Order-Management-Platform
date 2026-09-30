import React, { useState } from "react";
import { CartResponse, AddressResponse } from "../types";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  MapPin,
  PlusCircle,
  Check,
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartResponse | null;
  addresses: AddressResponse[];
  onUpdateQuantity: (productId: number, quantity: number) => Promise<void>;
  onRemoveItem: (productId: number) => Promise<void>;
  onClearCart: () => Promise<void>;
  onCheckout: (addressId: number) => Promise<void>;
  onAddNewAddress: (address: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  }) => Promise<void>;
  isCheckingOut: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  addresses,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onAddNewAddress,
  isCheckingOut,
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(() => {
    return addresses.length > 0 ? addresses[0].id : null;
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Sync selected address if needed
  React.useEffect(() => {
    if (selectedAddressId === null && addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const shippingFee = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal + shippingFee;

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.addressLine || !newAddr.city || !newAddr.pincode) {
      return;
    }
    setSavingAddress(true);
    try {
      await onAddNewAddress(newAddr);
      setShowAddressForm(false);
      setNewAddr({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
                title="Clear all items"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">Your cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore our catalog and add items to your cart to proceed with checkout.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="divide-y divide-slate-100 space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {item.productName}
                      </h4>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>₹{item.price.toLocaleString("en-IN")} each</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">
                          ₹{item.subtotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity <= 1) {
                              onRemoveItem(item.productId);
                            } else {
                              onUpdateQuantity(item.productId, item.quantity - 1);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800 min-w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId)}
                        className="text-slate-300 hover:text-rose-600 transition p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Delivery Address
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    {showAddressForm ? "Cancel" : "Add New"}
                  </button>
                </div>

                {/* Add New Address Form */}
                {showAddressForm ? (
                  <form onSubmit={handleSaveAddress} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 mb-3 text-xs">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        required
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Address (Street / House / Landmark)"
                        required
                        value={newAddr.addressLine}
                        onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        required
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        required
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                    >
                      {savingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </form>
                ) : addresses.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No shipping address saved yet. Please add an address to proceed.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start justify-between ${
                            isSelected
                              ? "bg-blue-50/60 border-blue-500 text-slate-900 font-medium"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-800">{addr.fullName} ({addr.phone})</div>
                            <div className="text-slate-500 line-clamp-1">{addr.addressLine}, {addr.city} - {addr.pincode}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-800">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-base text-blue-600">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              id="cart-checkout-btn"
              type="button"
              disabled={isCheckingOut || items.length === 0}
              onClick={() => {
                onCheckout(selectedAddressId || (addresses[0] ? addresses[0].id : 1));
              }}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
