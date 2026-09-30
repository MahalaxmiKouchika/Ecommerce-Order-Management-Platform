import React, { useState, useEffect } from "react";
import {
  X,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
} from "lucide-react";
import { OrderResponse } from "../types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse | null;
  onPaymentSuccess: (
    orderId: number,
    method: "UPI" | "CASH_ON_DELIVERY",
    details?: { upiId?: string; upiRef?: string }
  ) => Promise<boolean>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CASH_ON_DELIVERY">("UPI");
  const [upiMode, setUpiMode] = useState<"qr" | "id" | "apps">("qr");
  const [upiId, setUpiId] = useState("");
  const [selectedApp, setSelectedApp] = useState<string>("Google Pay");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [codAgreed, setCodAgreed] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [completedDetails, setCompletedDetails] = useState<{
    method: "UPI" | "CASH_ON_DELIVERY";
    txnId?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentCompleted(false);
      setCompletedDetails(null);
      setError(null);
      setIsProcessing(false);
      setCodAgreed(false);
      setUpiId("");
    }
  }, [isOpen, order?.orderId]);

  if (!isOpen || !order) return null;

  const totalFormatted = `$${order.totalAmount.toFixed(2)}`;
  const merchantUpi = "nexusorders@icici";

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(merchantUpi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleUpiSubmit = async (customRef?: string) => {
    setError(null);
    if (upiMode === "id" && !customRef) {
      if (!upiId.trim() || !upiId.includes("@")) {
        setError("Please enter a valid UPI ID (e.g., yourname@okhdfcbank)");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate authentic UPI bank/NPCI verification latency
    setTimeout(async () => {
      try {
        const refId =
          customRef ||
          `UPI-${Date.now().toString(36).toUpperCase()}-${Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()}`;

        const success = await onPaymentSuccess(order.orderId, "UPI", {
          upiId: upiId || merchantUpi,
          upiRef: refId,
        });

        if (success) {
          setPaymentCompleted(true);
          setCompletedDetails({ method: "UPI", txnId: refId });
        } else {
          setError("Failed to record UPI payment. Please try again.");
        }
      } catch (err: any) {
        setError(err?.message || "Payment transaction encountered an error.");
      } finally {
        setIsProcessing(false);
      }
    }, 1200);
  };

  const handleCodSubmit = async () => {
    if (!codAgreed) {
      setError("Please check the confirmation box to authorize Cash on Delivery.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const codRef = `COD-ORD-${order.orderId}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;

      const success = await onPaymentSuccess(order.orderId, "CASH_ON_DELIVERY", {
        upiRef: codRef,
      });

      if (success) {
        setPaymentCompleted(true);
        setCompletedDetails({ method: "CASH_ON_DELIVERY", txnId: codRef });
      } else {
        setError("Failed to confirm Cash on Delivery order.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to confirm Cash on Delivery.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={paymentCompleted ? onClose : undefined}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {paymentCompleted ? "Payment Status" : "Order Payment Gateway"}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Order #{order.orderId} &bull; Total: {totalFormatted}
                </span>
              </div>
            </div>
            <button
              id="payment-modal-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen */}
          {paymentCompleted ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {completedDetails?.method === "UPI"
                    ? "Payment Successful!"
                    : "Cash on Delivery Confirmed!"}
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  {completedDetails?.method === "UPI"
                    ? `Your payment of ${totalFormatted} was verified. Your order is confirmed and scheduled for packaging.`
                    : `Your order is confirmed! Please keep ${totalFormatted} in cash or ready via UPI for the courier upon delivery.`}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-left space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Order ID:</span>
                  <span className="font-bold text-slate-800">#{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Payment Method:</span>
                  <span className="font-bold text-slate-800">
                    {completedDetails?.method === "UPI" ? "UPI Instant Payment" : "Cash on Delivery (COD)"}
                  </span>
                </div>
                {completedDetails?.txnId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Reference No:</span>
                    <span className="font-bold text-blue-600">{completedDetails.txnId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Amount:</span>
                  <span className="font-bold text-emerald-600">{totalFormatted}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  id="payment-done-close-btn"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center justify-center space-x-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>View in My Orders</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Order Quick Summary Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="text-xs">
                  <span className="text-slate-500 block">Payable Amount</span>
                  <span className="text-base font-bold text-slate-900">{totalFormatted}</span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-500 block">Total Items</span>
                  <span className="font-semibold text-slate-800">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Payment Method Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Payment Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="select-upi-method-btn"
                    onClick={() => {
                      setPaymentMethod("UPI");
                      setError(null);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                      paymentMethod === "UPI"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        paymentMethod === "UPI" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-900">UPI Instant</span>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                          0% Fee
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        QR Code, GPay, PhonePe, Paytm
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="select-cod-method-btn"
                    onClick={() => {
                      setPaymentMethod("CASH_ON_DELIVERY");
                      setError(null);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        paymentMethod === "CASH_ON_DELIVERY"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Cash on Delivery
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Pay cash or UPI at delivery
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* UPI Options Pane */}
              {paymentMethod === "UPI" && (
                <div className="space-y-4 pt-1">
                  {/* UPI Submode buttons */}
                  <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setUpiMode("qr")}
                      className={`flex-1 py-1.5 font-medium rounded-md transition ${
                        upiMode === "qr" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
                      }`}
                    >
                      Scan QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode("id")}
                      className={`flex-1 py-1.5 font-medium rounded-md transition ${
                        upiMode === "id" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
                      }`}
                    >
                      Enter UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode("apps")}
                      className={`flex-1 py-1.5 font-medium rounded-md transition ${
                        upiMode === "apps" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
                      }`}
                    >
                      UPI Apps
                    </button>
                  </div>

                  {/* Mode 1: Scan QR Code */}
                  {upiMode === "qr" && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center space-y-3">
                      <div className="inline-block p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                        {/* Interactive Styled UPI QR */}
                        <div className="relative w-36 h-36 mx-auto bg-slate-900 p-2 rounded-lg flex flex-col justify-between items-center text-white">
                          <div className="w-full flex justify-between">
                            <div className="w-7 h-7 border-4 border-white rounded-xs" />
                            <div className="w-7 h-7 border-4 border-white rounded-xs" />
                          </div>
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black tracking-widest text-emerald-400">
                              UPI
                            </span>
                            <span className="text-[8px] font-mono text-slate-300 font-bold">
                              {totalFormatted}
                            </span>
                          </div>
                          <div className="w-full flex justify-between">
                            <div className="w-7 h-7 border-4 border-white rounded-xs" />
                            <div className="w-4 h-4 bg-emerald-400 rounded-xs self-end" />
                          </div>
                        </div>
                      </div>

                      <div className="text-xs">
                        <div className="flex items-center justify-center space-x-2 text-slate-600">
                          <span>Payee VPA:</span>
                          <span className="font-mono font-semibold text-slate-900">{merchantUpi}</span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="text-blue-600 hover:text-blue-800 p-0.5"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Scan with PhonePe, Google Pay, Paytm, BHIM, or any UPI app
                        </p>
                      </div>

                      <button
                        type="button"
                        id="simulate-upi-qr-pay-btn"
                        disabled={isProcessing}
                        onClick={() => handleUpiSubmit()}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying UPI Payment...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>I Have Paid &bull; Confirm Payment</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Mode 2: Enter UPI ID */}
                  {upiMode === "id" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Enter your UPI ID / Virtual Payment Address (VPA)
                        </label>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            id="upi-id-input"
                            type="text"
                            placeholder="e.g. yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Quick Handles */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] text-slate-500">Quick Suffix:</span>
                        {["@okaxis", "@okhdfcbank", "@paytm", "@ybl", "@upi"].map((suffix) => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => {
                              const base = upiId.includes("@") ? upiId.split("@")[0] : upiId || "user";
                              setUpiId(base + suffix);
                            }}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono transition"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        id="verify-pay-upi-btn"
                        disabled={isProcessing}
                        onClick={() => handleUpiSubmit()}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Requesting Payment from UPI Bank...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify & Pay {totalFormatted}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Mode 3: Direct UPI Apps */}
                  {upiMode === "apps" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600">
                        Choose your installed UPI application to authorize the transaction:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {["Google Pay", "PhonePe", "Paytm", "BHIM UPI"].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setSelectedApp(app)}
                            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                              selectedApp === app
                                ? "border-blue-500 bg-blue-50 text-blue-800"
                                : "border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span>{app}</span>
                            {selectedApp === app && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        id="pay-via-selected-app-btn"
                        disabled={isProcessing}
                        onClick={() => handleUpiSubmit(`UPI-${selectedApp.replace(/\s+/g, "").toUpperCase()}`)}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Opening {selectedApp} & Authorizing...</span>
                          </>
                        ) : (
                          <>
                            <span>Pay {totalFormatted} via {selectedApp}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Cash on Delivery Options Pane */}
              {paymentMethod === "CASH_ON_DELIVERY" && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Pay Cash or UPI upon Doorstep Delivery
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        No immediate card or online payment required right now. You can pay the courier with cash or scan the courier's dynamic UPI QR code when your shipment arrives.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>Order Amount:</span>
                      <span>{totalFormatted}</span>
                    </div>
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>COD Handling Fee:</span>
                      <span className="text-emerald-600 font-semibold">FREE ($0.00)</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Due on Delivery:</span>
                      <span className="text-blue-600">{totalFormatted}</span>
                    </div>
                  </div>

                  {/* Mandatory Checkbox */}
                  <label className="flex items-start space-x-2.5 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      id="cod-confirm-checkbox"
                      type="checkbox"
                      checked={codAgreed}
                      onChange={(e) => setCodAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      I confirm that I will pay <strong>{totalFormatted}</strong> in cash or UPI to the delivery courier upon arrival of package #{order.orderId}.
                    </span>
                  </label>

                  <button
                    type="button"
                    id="confirm-cod-btn"
                    disabled={isProcessing || !codAgreed}
                    onClick={handleCodSubmit}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming Cash on Delivery Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Order with Cash on Delivery</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
