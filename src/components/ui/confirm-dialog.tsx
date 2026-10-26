"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ConfirmDialogProps {
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

const variantMeta = {
  danger: {
    icon: AlertCircle,
    iconClass: "text-destructive",
    iconBg: "bg-destructive/10",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-highlight-foreground",
    iconBg: "bg-highlight",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  primary: {
    icon: HelpCircle,
    iconClass: "text-primary",
    iconBg: "bg-primary/10",
  },
} as const;

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "primary",
  loading = false,
}: ConfirmDialogProps) {
  const meta = variantMeta[variant];
  const Icon = meta.icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}
            >
              <Icon className={`h-5 w-5 ${meta.iconClass}`} />
            </span>
            <div className="space-y-1.5">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{message}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={onClose}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            disabled={loading}
            onClick={onConfirm}
            variant={variant === "danger" ? "destructive" : "default"}
            className={
              variant === "warning"
                ? "bg-highlight text-highlight-foreground hover:bg-highlight/80"
                : variant === "success"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : undefined
            }
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
