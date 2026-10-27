"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, ShieldCheck, GraduationCap } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, role, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/masuk");
      } else if (role !== "admin") {
        router.push("/akses-ditolak");
      }
    }
  }, [user, role, isLoading, router]);

  // Close mobile sheet on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Memverifikasi hak akses administrator...</p>
      </div>
    );
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    const src = name?.trim() || email?.split("@")[0] || "AD";
    return src
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar (Fixed left, width 240px / w-60) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-60 lg:flex-col">
        <AdminSidebar />
      </aside>

      {/* Mobile Top Header (Sticky 56px / h-14) */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card px-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu admin"
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              PijarAksara <span className="text-primary text-xs font-semibold">Admin</span>
            </span>
          </Link>
        </div>

        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
            {getInitials(profile?.nama_lengkap, user?.email)}
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 sm:w-80">
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area (Offset by pl-60 on desktop) */}
      <div className="lg:pl-60 min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
