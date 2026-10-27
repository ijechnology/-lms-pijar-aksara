"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpenCheck,
  CreditCard,
  Users,
  ShieldAlert,
  ExternalLink,
  LogOut,
  Shield,
  GraduationCap,
} from "lucide-react";

interface AdminSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: "Utama",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "Operasional",
    items: [
      {
        label: "Tinjauan Kursus",
        href: "/admin/tinjauan",
        icon: BookOpenCheck,
      },
      {
        label: "Pendaftaran & Bayar",
        href: "/admin/pendaftaran",
        icon: CreditCard,
      },
    ],
  },
  {
    group: "Sistem",
    items: [
      {
        label: "Manajemen Pengguna",
        href: "/admin/pengguna",
        icon: Users,
      },
      {
        label: "Log Audit",
        href: "/admin/audit",
        icon: ShieldAlert,
      },
    ],
  },
];

export default function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const getInitials = (name?: string | null, email?: string | null) => {
    const src = name?.trim() || email?.split("@")[0] || "AD";
    return src
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  };

  const isLinkActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-card border-r border-border select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-border">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 font-bold tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none text-base">
              <span className="font-black text-foreground">Pijar</span>
              <span className="font-semibold text-primary">Aksara</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="outline" className="text-[10px] font-semibold px-1 py-0 h-4 border-primary/30 text-primary">
                Admin
              </Badge>
              <span className="text-[10px] text-muted-foreground">Console</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigasi Berkelompok */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((g) => (
          <div key={g.group} className="space-y-1">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {g.group}
            </div>
            <div className="space-y-0.5 pt-1">
              {g.items.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profil & Aksi Akun */}
      <div className="p-3 border-t border-border space-y-3 bg-muted/20">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {getInitials(profile?.nama_lengkap, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-foreground truncate">
              {profile?.nama_lengkap || "Administrator"}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {user?.email || "admin@pijaraksara.test"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs font-medium gap-1.5 w-full justify-center"
          >
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Situs</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              window.location.href = "/masuk";
            }}
            className="h-8 text-xs font-medium gap-1.5 w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
