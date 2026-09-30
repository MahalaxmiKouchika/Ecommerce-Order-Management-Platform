import React, { useState } from "react";
import {
  ShoppingCart,
  Package,
  LogOut,
  LogIn,
  Store,
  Truck,
  Shield,
  Search,
  X,
  Database,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { AuthResponse, AppTab } from "../types";

interface DbStatus {
  connected: boolean;
  provider: string;
  host?: string;
  productCount?: number;
}

interface NavbarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  currentUser: AuthResponse | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  dbStatus: DbStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onLogout,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  dbStatus,
}) => {
  const isAdmin = currentUser?.role === "ADMIN";
  const [showDbInfo, setShowDbInfo] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTab !== "store") {
      setCurrentTab("store");
    }
  };

  const handleInputChange = (val: string) => {
    onSearchChange(val);
    if (currentTab !== "store" && val.trim().length > 0) {
      setCurrentTab("store");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-4 lg:space-x-6 shrink-0">
            <button
              id="nav-logo-btn"
              onClick={() => setCurrentTab("store")}
              className="flex items-center space-x-2 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-blue-700 transition">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-slate-900 tracking-tight block leading-tight">
                  NexusOrder
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">
                  Marketplace & Tracking
                </span>
              </div>
            </button>

            {/* Nav Tabs */}
            <nav className="hidden xl:flex items-center space-x-1">
              <button
                id="nav-tab-store"
                onClick={() => setCurrentTab("store")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  currentTab === "orders"
                    ? "bg-blue-50 text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Orders</span>
              </button>

              {isAdmin && (
                <button
                  id="nav-tab-admin"
                  onClick={() => setCurrentTab("admin")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    currentTab === "admin"
                      ? "bg-amber-50 text-amber-800 border border-amber-200 shadow-xs"
                      : "text-amber-700 hover:text-amber-900 hover:bg-amber-50/60"
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Admin</span>
                  <span className="text-[9px] uppercase font-black tracking-wider bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                    Staff
                  </span>
                </button>
              )}
            </nav>
          </div>

          {/* Desktop Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-4">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 border border-slate-200 rounded-xl transition duration-200 overflow-hidden"
            >
              {/* Category Selector Dropdown */}
              <div className="relative border-r border-slate-200/80 shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    onCategoryChange(e.target.value);
                    if (currentTab !== "store") setCurrentTab("store");
                  }}
                  className="appearance-none bg-transparent pl-3 pr-7 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer capitalize max-w-[130px] truncate"
                >
                  <option value="all">All Departments</option>
                  {categories
                    .filter((c) => c !== "all")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search Input Field */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Global search by product name, category, or specs..."
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="p-1 mr-2 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Database / Supabase Status Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDbInfo(!showDbInfo)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                  dbStatus?.connected
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
                title="Click to view Database & Supabase connection details"
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">
                  {dbStatus?.provider || "Supabase Ready"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              {/* DB Status Dropdown Popover */}
              {showDbInfo && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-blue-600" /> Database Engine
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mode:</span>
                      <strong className="text-slate-800 font-semibold">{dbStatus?.provider || "Cloud Ready"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Products Cached:</span>
                      <strong className="text-slate-800 font-semibold">{dbStatus?.productCount || "250+"} items</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Supabase Client:</span>
                      <strong className="text-emerald-600 font-semibold">Enabled & Configured</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 leading-relaxed">
                    Set <code className="text-blue-600 font-mono">DATABASE_URL</code> or <code className="text-blue-600 font-mono">SUPABASE_URL</code> in <code className="font-mono">.env</code> to link your remote Supabase cloud project.
                  </p>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              id="nav-cart-btn"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition flex items-center cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Controls */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex flex-col text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </span>
                    {isAdmin && (
                      <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Global Search Bar */}
        <div className="md:hidden pb-3 pt-1">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-slate-100/90 border border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20"
          >
            <select
              value={selectedCategory}
              onChange={(e) => {
                onCategoryChange(e.target.value);
                if (currentTab !== "store") setCurrentTab("store");
              }}
              className="bg-transparent pl-2.5 pr-1 py-2 text-xs font-semibold text-slate-700 border-r border-slate-200 focus:outline-hidden max-w-[110px] truncate"
            >
              <option value="all">All</option>
              {categories
                .filter((c) => c !== "all")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
            <div className="relative flex-1 flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-2.5" />
              <input
                type="text"
                placeholder="Search products or categories..."
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full px-2 py-1.5 text-xs text-slate-900 bg-transparent focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="p-1 mr-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};
