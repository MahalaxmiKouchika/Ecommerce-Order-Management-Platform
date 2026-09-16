import React from "react";
import {
  ShoppingCart,
  Package,
  LogOut,
  LogIn,
  Store,
  Truck,
  Shield,
} from "lucide-react";
import { AuthResponse, AppTab } from "../types";

interface NavbarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  currentUser: AuthResponse | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onLogout,
}) => {
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-6">
            <button
              id="nav-logo-btn"
              onClick={() => setCurrentTab("store")}
              className="flex items-center space-x-2 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-blue-700 transition">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                  NexusOrder
                </span>
                <span className="text-xs text-slate-500 font-medium block">
                  E-Commerce & Logistics
                </span>
              </div>
            </button>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                id="nav-tab-store"
                onClick={() => setCurrentTab("store")}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                  currentTab === "store"
                    ? "bg-blue-50 text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Shop</span>
              </button>

              <button
                id="nav-tab-orders"
                onClick={() => setCurrentTab("orders")}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                  currentTab === "orders"
                    ? "bg-blue-50 text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </button>

              {isAdmin && (
                <button
                  id="nav-tab-admin"
                  onClick={() => setCurrentTab("admin")}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                    currentTab === "admin"
                      ? "bg-amber-50 text-amber-800 border border-amber-200 shadow-xs"
                      : "text-amber-700 hover:text-amber-900 hover:bg-amber-50/60"
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Admin Portal</span>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md">
                    Staff
                  </span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Cart Button */}
            <button
              id="nav-cart-btn"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition flex items-center cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Controls */}
            {currentUser ? (
              <div className="flex items-center space-x-2.5">
                <div className="hidden sm:flex flex-col text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.name}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
