"use client";

import React from "react";
import { AlertCircle, HelpCircle, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary" | "success";
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "primary",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
          iconBg: "bg-rose-100",
          btnColor: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: "bg-amber-100",
          btnColor: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          iconBg: "bg-emerald-100",
          btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
        };
      case "primary":
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-brand-600" />,
          iconBg: "bg-brand-100",
          btnColor: "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20",
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop overlay dengan blur sempurna */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        aria-hidden="true"
        onClick={!loading ? onClose : undefined}
      />
      <div
        className="relative z-10 bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl flex-shrink-0 ${vStyle.iconBg}`}>
            {vStyle.icon}
          </div>
          <div className="space-y-1.5 flex-1 pr-4">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 ${vStyle.btnColor} ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
