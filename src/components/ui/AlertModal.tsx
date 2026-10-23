"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "info" | "error" | "success";
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}: AlertModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
          iconBg: "bg-rose-100",
          btnColor: "bg-rose-600 hover:bg-rose-700 text-white",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          iconBg: "bg-emerald-100",
          btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-6 h-6 text-brand-600" />,
          iconBg: "bg-brand-100",
          btnColor: "bg-brand-600 hover:bg-brand-700 text-white",
        };
    }
  };

  const tStyle = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop overlay dengan blur sempurna */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="relative z-10 bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center"
        role="alertdialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${tStyle.iconBg}`}>
          {tStyle.icon}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-md transition ${tStyle.btnColor}`}
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
