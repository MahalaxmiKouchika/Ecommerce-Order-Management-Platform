import React, { useState, useEffect } from "react";
import { Product, Review, ReviewResponse, AuthResponse } from "../types";
import {
  X,
  Star,
  ShieldCheck,
  ThumbsUp,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Lock,
  Sparkles,
} from "lucide-react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  currentUser: AuthResponse | null;
  onAddToCart: (product: Product, quantity?: number) => Promise<boolean>;
  onOpenAuth: () => void;
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  currentUser,
  onAddToCart,
  onOpenAuth,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Reviews state
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Helpful click tracker
  const [helpfulVoted, setHelpfulVoted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!product || !isOpen) return;

    setQuantity(1);
    setShowReviewForm(false);
    setNewTitle("");
    setNewComment("");
    setNewRating(5);

    // Fetch reviews
    setIsLoadingReviews(true);
    const headers: Record<string, string> = {};
    if (currentUser?.token) {
      headers["Authorization"] = `Bearer ${currentUser.token}`;
    }

    fetch(`/api/products/${product.id}/reviews`, { headers })
      .then((res) => res.json())
      .then((data) => {
        setReviewData(data);
      })
      .catch((err) => console.error("Error loading reviews:", err))
      .finally(() => setIsLoadingReviews(false));
  }, [product, isOpen, currentUser]);

  if (!isOpen || !product) return null;

  const originalPrice = product.originalPrice || Math.round(product.price * 1.25);
  const discountPct = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    await onAddToCart(product, quantity);
    setIsAdding(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!newComment.trim() || newComment.trim().length < 5) {
      if (showToast) showToast("Review comment must be at least 5 characters.", "error");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          rating: newRating,
          title: newTitle.trim(),
          comment: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (showToast) showToast("Verified purchaser review submitted successfully!", "success");
        setShowReviewForm(false);
        setNewComment("");
        setNewTitle("");

        // Refresh reviews
        const refreshRes = await fetch(`/api/products/${product.id}/reviews`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const refreshedData = await refreshRes.json();
        setReviewData(refreshedData);
      } else {
        if (showToast) showToast(data.error || "Failed to submit review", "error");
      }
    } catch (err) {
      if (showToast) showToast("Network error submitting review", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleHelpful = async (reviewId: number) => {
    if (helpfulVoted[reviewId]) return;
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    try {
      const res = await fetch(`/api/products/${product.id}/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      if (res.ok) {
        setHelpfulVoted((prev) => ({ ...prev, [reviewId]: true }));
        setReviewData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            reviews: prev.reviews.map((r) =>
              r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
            ),
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalReviews = reviewData?.totalReviews ?? (product.reviewsCount || 0);
  const avgRating = reviewData?.averageRating ?? (product.rating || 4.7);
  const distribution = reviewData?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {product.category}
            </span>
            {product.badge && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                {product.badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "details"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Overview & Order
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "reviews"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Verified Reviews & Ratings
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700">
              {totalReviews}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {activeTab === "details" ? (
            /* TAB 1: PRODUCT DETAILS */
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Product Image */}
              <div className="w-full md:w-1/2 rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200 flex items-center justify-center min-h-[300px]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover max-h-[360px]"
                />
              </div>

              {/* Product Info & Cart Action */}
              <div className="w-full md:w-1/2 space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs mb-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("reviews")}
                      className="flex items-center text-amber-500 font-bold hover:underline cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                      {avgRating} ({totalReviews} verified ratings)
                    </button>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {product.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {originalPrice > product.price && (
                      <span className="text-sm text-slate-400 line-through">
                        ₹{originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Inclusive of all taxes • Standard Express Courier Available
                  </div>
                </div>

                {/* Assurance Highlights */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-800 font-semibold">Free Shipping</strong>
                      <span className="text-[11px] text-slate-500">Orders over ₹500</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-800 font-semibold">7-Day Returns</strong>
                      <span className="text-[11px] text-slate-500">Instant replacement</span>
                    </div>
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Select Quantity</span>
                    {!isOutOfStock && (
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-900 min-w-8 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                          disabled={quantity >= product.stock}
                          className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isOutOfStock || isAdding}
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAdding ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding to Cart...
                      </>
                    ) : isOutOfStock ? (
                      <>
                        <AlertCircle className="w-4 h-4" /> Currently Out of Stock
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Add {quantity} to Cart • ₹
                        {(product.price * quantity).toLocaleString("en-IN")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: VERIFIED REVIEWS & RATINGS */
            <div className="space-y-6">
              {/* Rating Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs shrink-0 min-w-[110px]">
                    <div className="text-3xl font-black text-slate-900 leading-none">
                      {avgRating}
                    </div>
                    <div className="flex items-center justify-center text-amber-400 my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(avgRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {totalReviews} verified ratings
                    </div>
                  </div>

                  {/* Rating Breakdown Bars */}
                  <div className="space-y-1.5 w-48 sm:w-56 text-xs">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const count = distribution[s as keyof typeof distribution] || 0;
                      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                      return (
                        <div key={s} className="flex items-center gap-2 text-[11px] text-slate-600">
                          <span className="w-4 font-bold">{s}★</span>
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-7 text-right text-slate-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Write Review Action or Status */}
                <div className="shrink-0 w-full md:w-auto text-center md:text-right">
                  {!currentUser ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">Sign in to check verified purchase status</p>
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        Sign In to Review
                      </button>
                    </div>
                  ) : reviewData?.hasReviewed ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Thank you! Your verified review is published.</span>
                    </div>
                  ) : reviewData?.canReview ? (
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-2 mx-auto md:ml-auto"
                    >
                      <Star className="w-4 h-4" />
                      {showReviewForm ? "Cancel Review" : "Write a Verified Review"}
                    </button>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 text-left max-w-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600" /> Verified Purchasers Only
                      </div>
                      <p className="text-[11px] text-amber-700 leading-snug">
                        To maintain authenticity, only customers who have ordered this item can leave a review.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && reviewData?.canReview && (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-md space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Publish Verified Customer Review
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Order Confirmed
                    </span>
                  </div>

                  {/* Star Rating Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 hover:scale-115 transition cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= (hoverRating || newRating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {newRating === 5
                          ? "5 - Excellent, loved it!"
                          : newRating === 4
                          ? "4 - Very good"
                          : newRating === 3
                          ? "3 - Average"
                          : newRating === 2
                          ? "2 - Below expectation"
                          : "1 - Poor"}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Review Headline (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Best purchase this year, exceptional quality"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Detailed Feedback *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share details about product performance, build quality, and delivery experience..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              {isLoadingReviews ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Loading verified customer reviews...</p>
                </div>
              ) : reviewData && reviewData.reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviewData.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center uppercase">
                            {rev.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {rev.userName}
                              </span>
                              {rev.isVerifiedPurchase && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Title & Comment */}
                      <div>
                        {rev.title && (
                          <h5 className="text-xs font-bold text-slate-800">{rev.title}</h5>
                        )}
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                          {rev.comment}
                        </p>
                      </div>

                      {/* Helpful Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 text-[11px]">Was this review helpful?</span>
                        <button
                          type="button"
                          onClick={() => handleHelpful(rev.id)}
                          disabled={helpfulVoted[rev.id]}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                            helpfulVoted[rev.id]
                              ? "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({rev.helpfulCount})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 p-6">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No reviews yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Be the first verified purchaser to leave a review and share your experience with other shoppers.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
