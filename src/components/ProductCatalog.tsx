import React, { useState, useMemo, useEffect } from "react";
import { Product, AuthResponse } from "../types";
import { ProductDetailModal } from "./ProductDetailModal";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Tag,
  Check,
  AlertCircle,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Eye,
  Grid,
  List,
  Flame,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  Layers,
} from "lucide-react";

interface ProductCatalogProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product, quantity?: number) => Promise<boolean>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  currentUser?: AuthResponse | null;
  onOpenAuth?: () => void;
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
}

// Promotional Banners Carousel Data
const PROMO_BANNERS = [
  {
    id: 1,
    tag: "FESTIVAL SPECIAL",
    title: "Flagship Tech & Gadget Bonanza",
    subtitle: "Up to 35% OFF on latest M3 MacBooks, Sony ANC Headphones & Pro Smartphones.",
    code: "TECHBOOST",
    category: "Smartphones",
    bgGradient: "from-blue-900 via-indigo-900 to-slate-900",
    accent: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  },
  {
    id: 2,
    tag: "LIMITED EDITION",
    title: "Luxury Timepieces & Fragrances",
    subtitle: "Handcrafted Swiss automatics and niche French perfumes with verified authenticity.",
    code: "LUXE20",
    category: "Watches",
    bgGradient: "from-amber-950 via-slate-900 to-stone-900",
    accent: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  },
  {
    id: 3,
    tag: "GOURMET & LIVING",
    title: "Artisan Kitchen & Home Haven",
    subtitle: "Italian espresso machines, cast iron cookware, and solid walnut designer furniture.",
    code: "HOMENEST",
    category: "Kitchen",
    bgGradient: "from-emerald-950 via-slate-900 to-teal-950",
    accent: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  },
];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  isLoading,
  onAddToCart,
  searchQuery: propSearchQuery,
  onSearchChange,
  selectedCategory: propSelectedCategory,
  onCategoryChange,
  currentUser,
  onOpenAuth,
  showToast,
}) => {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalCategory, setInternalCategory] = useState<string>("all");

  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearch;
  const selectedCategory = propSelectedCategory !== undefined ? propSelectedCategory : internalCategory;

  const setSearchQuery = (val: string) => {
    setInternalSearch(val);
    if (onSearchChange) onSearchChange(val);
  };

  const setSelectedCategory = (cat: string) => {
    setInternalCategory(cat);
    if (onCategoryChange) onCategoryChange(cat);
  };
  const [priceRange, setPriceRange] = useState<string>("all");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "rating" | "discount" | "name"
  >("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(16);

  const [activeBannerIdx, setActiveBannerIdx] = useState<number>(0);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState<number>(1);

  // Auto-rotate promotional banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Compute categories and counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const categories = useMemo(() => {
    return ["all", ...Object.keys(categoryStats).sort()];
  }, [categoryStats]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Query match
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q);

        // Category match
        const matchesCat =
          selectedCategory === "all" ||
          product.category.toLowerCase() === selectedCategory.toLowerCase();

        // Price Range filter
        let matchesPrice = true;
        if (priceRange === "under2k") matchesPrice = product.price < 2000;
        else if (priceRange === "2k-10k") matchesPrice = product.price >= 2000 && product.price <= 10000;
        else if (priceRange === "10k-50k") matchesPrice = product.price > 10000 && product.price <= 50000;
        else if (priceRange === "above50k") matchesPrice = product.price > 50000;

        // In Stock filter
        const matchesStock = !onlyInStock || product.stock > 0;

        // Rating filter
        const rating = product.rating || 4.5;
        const matchesRating = rating >= minRating;

        return matchesQuery && matchesCat && matchesPrice && matchesStock && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 4.5) - (a.rating || 4.5);
        if (sortBy === "discount") {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        }
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return a.id - b.id; // Featured
      });
  }, [products, searchQuery, selectedCategory, priceRange, onlyInStock, minRating, sortBy]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, onlyInStock, minRating, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleQtyChange = (productId: number, delta: number, maxStock: number) => {
    const current = quantities[productId] || 1;
    const next = Math.max(1, Math.min(maxStock, current + delta));
    setQuantities((prev) => ({ ...prev, [productId]: next }));
  };

  const handleAdd = async (product: Product, customQty?: number) => {
    const qty = customQty || quantities[product.id] || 1;
    setAddingId(product.id);
    await onAddToCart(product, qty);
    setAddingId(null);
  };

  const currentBanner = PROMO_BANNERS[activeBannerIdx];

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Hero Promotional Showcase */}
      <div className={`relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r ${currentBanner.bgGradient} text-white transition-all duration-700 p-6 sm:p-10 flex flex-col justify-between min-h-[220px]`}>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${currentBanner.accent}`}>
                <Flame className="w-3.5 h-3.5" /> {currentBanner.tag}
              </span>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full border border-white/20 font-mono">
                CODE: <strong className="text-amber-300">{currentBanner.code}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {currentBanner.title}
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {currentBanner.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedCategory(currentBanner.category);
              }}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2"
            >
              Explore {currentBanner.category} <ChevronRight className="w-4 h-4" />
            </button>
            <div className="hidden lg:flex flex-col items-center bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center">
              <span className="text-xl font-black text-white">{products.length}</span>
              <span className="text-[11px] text-slate-200 font-medium uppercase tracking-wider">Catalog Items</span>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="relative z-10 flex items-center justify-center gap-2 mt-6 pt-3 border-t border-white/10">
          {PROMO_BANNERS.map((banner, idx) => (
            <button
              key={banner.id}
              onClick={() => setActiveBannerIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeBannerIdx === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Visual Category Carousel / Quick-Nav Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Browse by Department
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {categories.length - 1} Departments
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count = cat === "all" ? products.length : categoryStats[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs scale-102"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="capitalize">{cat === "all" ? "All Categories" : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Comprehensive Search, Filters, and Sorting Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top Search & Layout bar */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Search across 150+ products, specs, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Price Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Price: All</option>
              <option value="under2k">Under ₹2,000</option>
              <option value="2k-10k">₹2,000 – ₹10,000</option>
              <option value="10k-50k">₹10,000 – ₹50,000</option>
              <option value="above50k">Above ₹50,000</option>
            </select>

            {/* Sort Dropdown */}
            <select
              id="catalog-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discounts</option>
              <option value="name">Name: A to Z</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "list" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips Bar (In Stock, High Rating, Active Reset) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* In Stock Toggle */}
          <button
            type="button"
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer border ${
              onlyInStock
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {onlyInStock ? "✓ In Stock Only" : "In Stock Only"}
          </button>

          {/* Rating 4.5+ Toggle */}
          <button
            type="button"
            onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer border flex items-center gap-1 ${
              minRating === 4.5
                ? "bg-amber-50 text-amber-700 border-amber-300 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            4.5★ & Above
          </button>

          {/* Results Summary */}
          <div className="ml-auto text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> matching products
          </div>
        </div>
      </div>

      {/* 4. Product Catalog Listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="h-48 bg-slate-200 rounded-xl w-full" />
              <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
              <div className="h-3 bg-slate-100 rounded-sm w-1/2" />
              <div className="h-6 bg-slate-200 rounded-sm w-1/3 pt-2" />
              <div className="h-10 bg-slate-200 rounded-xl w-full mt-2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs p-8 space-y-4">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try resetting your price filters or searching with different keywords.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setPriceRange("all");
              setOnlyInStock(false);
              setMinRating(0);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;
            const currentQty = quantities[product.id] || 1;
            const isAdding = addingId === product.id;
            const rating = product.rating || 4.6;
            const reviewsCount = product.reviewsCount || 120;
            const originalPrice = product.originalPrice || Math.round(product.price * 1.25);
            const discountPct = Math.round(((originalPrice - product.price) / originalPrice) * 100);

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Product Image Area */}
                <div className="relative h-52 bg-slate-100 overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-106 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                    {product.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-900/80 text-white backdrop-blur-xs">
                      {product.category}
                    </span>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Out of stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Only {product.stock} left
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        In stock ({product.stock})
                      </span>
                    )}
                  </div>

                  {/* Quick View Button on Hover */}
                  <button
                    type="button"
                    onClick={() => {
                      setQuickViewProduct(product);
                      setQuickViewQty(1);
                    }}
                    className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition duration-200 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Quick View
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800 ml-1">{rating}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">({reviewsCount.toLocaleString()})</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-0.5">
                        <Truck className="w-3 h-3" /> Free Delivery
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description || "Authentic quality product from verified distributor."}
                    </p>
                  </div>

                  {/* Pricing and Cart Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {originalPrice > product.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        {discountPct > 0 && (
                          <span className="text-[11px] font-bold text-emerald-600">
                            {discountPct}% OFF with offer
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      {!isOutOfStock && (
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(product.id, -1, product.stock)}
                            disabled={currentQty <= 1}
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 min-w-5 text-center">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(product.id, 1, product.stock)}
                            disabled={currentQty >= product.stock}
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      id={`add-to-cart-btn-${product.id}`}
                      type="button"
                      disabled={isOutOfStock || isAdding}
                      onClick={() => handleAdd(product)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        isOutOfStock
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : isAdding
                          ? "bg-blue-500 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow"
                      }`}
                    >
                      {isAdding ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding to Cart...
                        </>
                      ) : isOutOfStock ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          Sold Out
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Add to Cart {currentQty > 1 && `(${currentQty})`}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-4">
          {paginatedProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const currentQty = quantities[product.id] || 1;
            const isAdding = addingId === product.id;
            const rating = product.rating || 4.6;
            const originalPrice = product.originalPrice || Math.round(product.price * 1.25);
            const discountPct = Math.round(((originalPrice - product.price) / originalPrice) * 100);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-center gap-5"
              >
                <div className="w-full md:w-44 h-40 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                    {product.category}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                      {rating}
                    </span>
                    <span className="text-slate-400">({product.reviewsCount || 100} reviews)</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-600 font-semibold">{product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{product.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium"><ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> 100% Genuine</span>
                    <span className="flex items-center gap-1 font-medium"><RotateCcw className="w-3.5 h-3.5 text-blue-600" /> 7-Day Returns</span>
                  </div>
                </div>

                <div className="w-full md:w-56 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {discountPct > 0 && (
                      <span className="text-xs font-bold text-emerald-600">{discountPct}% OFF</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isOutOfStock || isAdding}
                      onClick={() => handleAdd(product)}
                      className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickViewProduct(product);
                        setQuickViewQty(1);
                      }}
                      className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition cursor-pointer"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination Bar */}
      {filteredProducts.length > itemsPerPage && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
            <strong className="text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
            </strong>{" "}
            of <strong className="text-slate-800">{filteredProducts.length}</strong> products
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Keep first, last, and pages close to current
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
              <option value={32}>32</option>
            </select>
          </div>
        </div>
      )}

      {/* 6. Marketplace Trust Highlights Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Express Delivery</h4>
            <p className="text-[11px] text-slate-500">Free courier for orders above ₹500</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">100% Genuine Items</h4>
            <p className="text-[11px] text-slate-500">Directly sourced from verified brands</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">7-Day Easy Returns</h4>
            <p className="text-[11px] text-slate-500">Instant refund or replacement policy</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Live Order Tracking</h4>
            <p className="text-[11px] text-slate-500">Real-time status updates at every hop</p>
          </div>
        </div>
      </div>

      {/* 7. Product Details & Verified Reviews Modal */}
      <ProductDetailModal
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
        currentUser={currentUser || null}
        onAddToCart={onAddToCart}
        onOpenAuth={onOpenAuth || (() => {})}
        showToast={showToast}
      />
    </div>
  );
};
