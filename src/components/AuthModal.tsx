import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  AlertCircle,
  Shield,
  ShoppingBag,
  KeyRound,
} from "lucide-react";
import { Role } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (
    email: string,
    password: string,
    adminSecurityKey?: string
  ) => Promise<boolean>;
  onRegister: (
    name: string,
    email: string,
    password: string,
    role: Role,
    adminSecurityKey?: string
  ) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecurityKey, setAdminSecurityKey] = useState("");
  const [requireAdminKeyOnLogin, setRequireAdminKeyOnLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError("Full name is required.");
          setIsSubmitting(false);
          return;
        }
        if (role === "ADMIN" && !adminSecurityKey.trim()) {
          setError("Admin Master Security Passcode is required to register as Admin.");
          setIsSubmitting(false);
          return;
        }

        const success = await onRegister(
          name,
          email,
          password,
          role,
          role === "ADMIN" ? adminSecurityKey.trim() : undefined
        );
        if (success) {
          onClose();
        } else {
          setError("Registration failed. Please check your credentials or passcode.");
        }
      } else {
        const success = await onLogin(
          email,
          password,
          adminSecurityKey.trim() || undefined
        );
        if (success) {
          onClose();
        } else {
          // If login failed, it might be an admin account requiring key
          setRequireAdminKeyOnLogin(true);
          setError("Invalid credentials or Admin Security Passcode required.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Authentication error. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isRegister
                  ? role === "ADMIN"
                    ? "Register Store Administrator"
                    : "Create Customer Account"
                  : "Sign In to Your Account"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegister
                  ? "Enter your details to create an account"
                  : "Sign in with your email and password"}
              </p>
            </div>
            <button
              id="auth-modal-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Account Role Selector on Register */}
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="auth-role-customer"
                    onClick={() => setRole("CUSTOMER")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                      role === "CUSTOMER"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    id="auth-role-admin"
                    onClick={() => setRole("ADMIN")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                      role === "ADMIN"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Store Admin</span>
                  </button>
                </div>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "ADMIN" ? "Store Administrator" : "Jane Doe"}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Admin Security Passcode field */}
            {((isRegister && role === "ADMIN") || (!isRegister && requireAdminKeyOnLogin)) && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                <label className="block text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin Master Security Passcode</span>
                </label>
                <input
                  id="auth-admin-passcode-input"
                  type="password"
                  required
                  value={adminSecurityKey}
                  onChange={(e) => setAdminSecurityKey(e.target.value)}
                  placeholder="Enter Passcode (ADM-SECURE-9481)"
                  className="w-full px-3 py-2 text-sm border border-amber-300 bg-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-amber-700">
                  Required for Admin authority. Configured in your <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env</code> (default: <code className="font-mono">ADM-SECURE-9481</code>).
                </p>
              </div>
            )}

            {!isRegister && !requireAdminKeyOnLogin && (
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  id="auth-toggle-admin-key-btn"
                  onClick={() => setRequireAdminKeyOnLogin(true)}
                  className="text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center space-x-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Signing in as Store Admin?</span>
                </button>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "Please wait..."
                : isRegister
                ? role === "ADMIN"
                  ? "Create Admin Account"
                  : "Create Account"
                : "Sign In"}
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                id="auth-toggle-mode-btn"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                  setRequireAdminKeyOnLogin(false);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer"
              >
                {isRegister
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Register here"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
