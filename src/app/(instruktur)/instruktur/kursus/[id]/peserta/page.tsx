"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Eye,
  FileCheck2,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

interface ModulItem {
  id: string;
  urutan: number;
  judul: string;
}

interface PercobaanKuisItem {
  id: string;
  modul_id: string;
  nomor_percobaan: number;
  nilai: number;
  lulus: boolean;
  jumlah_benar?: number;
  jumlah_soal?: number;
  dikerjakan_pada?: string;
}

interface ProgresModulItem {
  modul_id: string;
  materi_dibaca_pada: string | null;
  lulus_pada: string | null;
}

interface PesertaRow {
  pendaftaranId: string;
  userId: string;
  namaLengkap: string;
  email: string;
  noHp: string | null;
  statusPembayaran: string;
  tanggalDaftar: string;
  modulSelesaiCount: number;
  persenProgres: number;
  progresList: ProgresModulItem[];
  percobaanList: PercobaanKuisItem[];
  kuisScores: { [modulId: string]: { nilai: number; statusLulus: boolean; percobaanCount: number } };
  sertifikat: {
    nomor: string;
    tanggalTerbit: string;
  } | null;
}

function RekapPesertaContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSource = searchParams.get("from");
  const detailParam = searchParams.get("detail");

  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  const kursusId = params.id as string;

  const [kursus, setKursus] = useState<any | null>(null);
  const [modulList, setModulList] = useState<ModulItem[]>([]);
  const [pesertaList, setPesertaList] = useState<PesertaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  // Selected student for detail sheet
  const [selectedPesertaId, setSelectedPesertaId] = useState<string | null>(detailParam);

  // Keep selectedPesertaId in sync with search params
  useEffect(() => {
    setSelectedPesertaId(detailParam);
  }, [detailParam]);

  const handleOpenDetail = (id: string) => {
    setSelectedPesertaId(id);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("detail", id);
    router.replace(`/instruktur/kursus/${kursusId}/peserta?${newParams.toString()}`, {
      scroll: false,
    });
  };

  const handleCloseDetail = () => {
    setSelectedPesertaId(null);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("detail");
    router.replace(`/instruktur/kursus/${kursusId}/peserta?${newParams.toString()}`, {
      scroll: false,
    });
  };

  const loadData = useCallback(async () => {
    if (!kursusId || !user) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Ambil detail kursus
      const { data: kursusData, error: kErr } = await supabase
        .from("kursus")
        .select("id, judul, kategori, nilai_lulus, status, instruktur_id")
        .eq("id", kursusId)
        .single();

      if (kErr || !kursusData) {
        throw new Error(kErr?.message || "Kursus tidak ditemukan.");
      }

      if (kursusData.instruktur_id !== user.id && role !== "admin") {
        throw new Error("Anda tidak memiliki akses melihat data peserta kursus ini.");
      }

      setKursus(kursusData);

      // 2. Ambil daftar modul untuk kursus ini
      const { data: moduls, error: mErr } = await supabase
        .from("modul")
        .select("id, urutan, judul")
        .eq("kursus_id", kursusId)
        .order("urutan", { ascending: true });

      if (mErr) throw new Error(mErr.message);
      const sortedModuls = moduls || [];
      setModulList(sortedModuls);

      // 3. Ambil pendaftaran beserta profil, progres_modul, percobaan_kuis, dan sertifikat
      const { data: regs, error: rErr } = await supabase
        .from("pendaftaran")
        .select(`
          id, peserta_id, status, didaftarkan_pada,
          profiles:profiles!pendaftaran_peserta_id_fkey (id, nama_lengkap, email, no_hp),
          progres_modul (modul_id, materi_dibaca_pada, lulus_pada),
          percobaan_kuis (id, modul_id, nomor_percobaan, nilai, lulus, jumlah_benar, jumlah_soal, dikerjakan_pada),
          sertifikat (nomor_sertifikat, diterbitkan_pada)
        `)
        .eq("kursus_id", kursusId)
        .order("didaftarkan_pada", { ascending: false });

      if (rErr) throw new Error(rErr.message);

      const totalModulsCount = sortedModuls.length || 1;

      const formatted: PesertaRow[] = (regs || []).map((r: any) => {
        const prof = r.profiles || {};
        const progresArr: ProgresModulItem[] = r.progres_modul || [];
        const kuisArr: PercobaanKuisItem[] = r.percobaan_kuis || [];
        const certArr = r.sertifikat || [];

        const modulSelesai = progresArr.filter((p) => p.lulus_pada !== null).length;
        const persen = Math.min(100, Math.round((modulSelesai / totalModulsCount) * 100));

        // Group kuis per modul (ambil nilai tertinggi)
        const kuisMap: { [modulId: string]: { nilai: number; statusLulus: boolean; percobaanCount: number } } = {};
        kuisArr.forEach((k) => {
          if (!kuisMap[k.modul_id] || k.nilai > kuisMap[k.modul_id].nilai) {
            kuisMap[k.modul_id] = {
              nilai: k.nilai,
              statusLulus: k.lulus,
              percobaanCount: (kuisMap[k.modul_id]?.percobaanCount || 0) + 1,
            };
          } else {
            kuisMap[k.modul_id].percobaanCount += 1;
          }
        });

        const certObj =
          certArr.length > 0
            ? {
                nomor: certArr[0].nomor_sertifikat,
                tanggalTerbit: certArr[0].diterbitkan_pada,
              }
            : null;

        return {
          pendaftaranId: r.id,
          userId: r.peserta_id,
          namaLengkap: prof.nama_lengkap || "Peserta Tanpa Nama",
          email: prof.email || "-",
          noHp: prof.no_hp || null,
          statusPembayaran: r.status,
          tanggalDaftar: r.didaftarkan_pada,
          modulSelesaiCount: modulSelesai,
          persenProgres: persen,
          progresList: progresArr,
          percobaanList: kuisArr,
          kuisScores: kuisMap,
          sertifikat: certObj,
        };
      });

      setPesertaList(formatted);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memuat rekap peserta.");
    } finally {
      setLoading(false);
    }
  }, [kursusId, user, role, supabase]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/masuk");
      } else {
        loadData();
      }
    }
  }, [isLoading, user, loadData, router]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const totalPeserta = pesertaList.length;
    const pesertaAktif = pesertaList.filter(
      (p) => p.statusPembayaran === "aktif" || p.statusPembayaran === "selesai"
    ).length;
    const lulusBersertifikat = pesertaList.filter(
      (p) => p.sertifikat !== null || p.statusPembayaran === "selesai"
    ).length;
    const validProgres = pesertaList.filter(
      (p) => p.statusPembayaran === "aktif" || p.statusPembayaran === "selesai"
    );
    const rataRataProgres =
      validProgres.length > 0
        ? Math.round(
            validProgres.reduce((acc, curr) => acc + curr.persenProgres, 0) / validProgres.length
          )
        : 0;

    return { totalPeserta, pesertaAktif, lulusBersertifikat, rataRataProgres };
  }, [pesertaList]);

  // Filter & Search Logic
  const filteredPeserta = useMemo(() => {
    return pesertaList.filter((p) => {
      const matchSearch =
        p.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === "aktif") return p.statusPembayaran === "aktif";
      if (statusFilter === "selesai") return p.statusPembayaran === "selesai" || p.sertifikat !== null;
      if (statusFilter === "menunggu")
        return (
          p.statusPembayaran === "menunggu_bayar" ||
          p.statusPembayaran === "menunggu_pembayaran" ||
          p.statusPembayaran === "menunggu_konfirmasi"
        );
      if (statusFilter === "dibatalkan")
        return p.statusPembayaran === "dibatalkan" || p.statusPembayaran === "kedaluwarsa";

      return true;
    });
  }, [pesertaList, searchQuery, statusFilter]);

  // Selected student for detail sheet
  const selectedPeserta = useMemo(() => {
    if (!selectedPesertaId) return null;
    return pesertaList.find((p) => p.pendaftaranId === selectedPesertaId || p.userId === selectedPesertaId) || null;
  }, [pesertaList, selectedPesertaId]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "selesai":
        return <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200">Selesai Lulus</Badge>;
      case "aktif":
        return <Badge className="bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 border-sky-200">Aktif Belajar</Badge>;
      case "menunggu_bayar":
      case "menunggu_pembayaran":
        return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200">Menunggu Bayar</Badge>;
      case "menunggu_konfirmasi":
        return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-200">Konfirmasi</Badge>;
      case "dibatalkan":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      case "kedaluwarsa":
        return <Badge variant="secondary">Kedaluwarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name[0] || "P").toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (errorMsg || !kursus) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Terjadi Kesalahan</h1>
        <p className="text-muted-foreground mb-6">{errorMsg || "Kursus tidak ditemukan."}</p>
        <Button asChild>
          <Link href="/instruktur/kursus">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Kursus
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* PageHeader with Breadcrumbs */}
      <PageHeader
        title="Rekap Peserta & Progres"
        description={`Pantau aktivitas belajar, kelulusan materi, dan perolehan sertifikat peserta pada kursus "${kursus.judul}".`}
        breadcrumbs={
          role === "admin" || fromSource === "admin"
            ? [
                { label: "Admin Dashboard", href: "/admin/dashboard" },
                { label: "Tinjauan Kursus", href: "/admin/tinjauan" },
                { label: kursus.judul, href: `/instruktur/kursus/${kursus.id}` },
                { label: "Peserta" },
              ]
            : [
                { label: "Kursus Saya", href: "/instruktur/kursus" },
                { label: kursus.judul, href: `/instruktur/kursus/${kursus.id}` },
                { label: "Peserta" },
              ]
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild size="sm">
              <Link href={`/instruktur/kursus/${kursus.id}`}>
                <BookOpen className="w-4 h-4 mr-1.5" />
                Buka Kurikulum
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Pendaftar
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPeserta}</div>
            <p className="text-xs text-muted-foreground mt-1">Siswa terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Peserta Aktif
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">{stats.pesertaAktif}</div>
            <p className="text-xs text-muted-foreground mt-1">Sedang atau telah belajar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Lulus Bersertifikat
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.lulusBersertifikat}</div>
            <p className="text-xs text-muted-foreground mt-1">Selesai seluruh modul & kuis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rata-rata Progres
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.rataRataProgres}%</div>
            <p className="text-xs text-muted-foreground mt-1">Kelulusan materi rata-rata</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar Search & Filter */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email..."
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="w-full sm:w-[200px] h-9">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="aktif">Peserta Aktif</SelectItem>
                <SelectItem value="selesai">Selesai (Lulus)</SelectItem>
                <SelectItem value="menunggu">Menunggu Pembayaran</SelectItem>
                <SelectItem value="dibatalkan">Dibatalkan / Kedaluwarsa</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filteredPeserta.length} dari {pesertaList.length} peserta
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Peserta */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px]">Peserta</TableHead>
              <TableHead>Status Pembayaran</TableHead>
              <TableHead className="min-w-[180px]">Progres Materi</TableHead>
              {modulList.map((m) => (
                <TableHead key={m.id} className="text-center min-w-[90px]">
                  M{m.urutan} Kuis
                </TableHead>
              ))}
              <TableHead>Sertifikat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeserta.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5 + modulList.length}
                  className="h-40 text-center text-muted-foreground"
                >
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Belum ada peserta yang cocok dengan filter pencarian.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPeserta.map((p) => {
                return (
                  <TableRow key={p.pendaftaranId} className="hover:bg-muted/40 transition-colors">
                    {/* Peserta Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {getInitials(p.namaLengkap)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground text-sm truncate">
                            {p.namaLengkap}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                          {p.noHp && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span>{p.noHp}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{renderStatusBadge(p.statusPembayaran)}</TableCell>

                    {/* Progres Belajar */}
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-muted-foreground">
                            {p.modulSelesaiCount}/{modulList.length} Modul
                          </span>
                          <span className="font-semibold">{p.persenProgres}%</span>
                        </div>
                        <Progress value={p.persenProgres} className="h-1.5" />
                      </div>
                    </TableCell>

                    {/* Nilai Kuis Tiap Modul */}
                    {modulList.map((m) => {
                      const kuis = p.kuisScores[m.id];
                      if (!kuis) {
                        return (
                          <TableCell key={m.id} className="text-center text-xs text-muted-foreground">
                            -
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={m.id} className="text-center">
                          <Badge
                            variant={kuis.statusLulus ? "default" : "destructive"}
                            className="font-mono text-xs px-2 py-0.5"
                            title={`Percobaan: ${kuis.percobaanCount}x`}
                          >
                            {kuis.nilai}
                          </Badge>
                        </TableCell>
                      );
                    })}

                    {/* Sertifikat */}
                    <TableCell>
                      {p.sertifikat ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <Award className="w-3.5 h-3.5" />
                            <span className="font-mono text-[11px]">{p.sertifikat.nomor}</span>
                          </div>
                          {p.sertifikat.tanggalTerbit && (
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(p.sertifikat.tanggalTerbit).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      ) : p.statusPembayaran === "selesai" ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lulus</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Belum Lulus</span>
                      )}
                    </TableCell>

                    {/* Aksi Slide-over Sheet */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(p.pendaftaranId)}
                        className="h-8 gap-1 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Slide-over Detail Sheet (U11) */}
      <Sheet open={!!selectedPeserta} onOpenChange={(open) => !open && handleCloseDetail()}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selectedPeserta && (
            <div className="space-y-6 py-2">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  {renderStatusBadge(selectedPeserta.statusPembayaran)}
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {selectedPeserta.pendaftaranId.slice(0, 8)}...
                  </span>
                </div>
                <SheetTitle className="text-xl font-bold mt-2">
                  {selectedPeserta.namaLengkap}
                </SheetTitle>
                <SheetDescription className="space-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" /> {selectedPeserta.email}
                  </span>
                  {selectedPeserta.noHp && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" /> {selectedPeserta.noHp}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> Terdaftar:{" "}
                    {new Date(selectedPeserta.tanggalDaftar).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </SheetDescription>
              </SheetHeader>

              {/* Sertifikat Banner */}
              {selectedPeserta.sertifikat ? (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                      Sertifikat Kelulusan
                    </div>
                    <div className="font-mono text-sm font-bold text-emerald-950 mt-0.5">
                      {selectedPeserta.sertifikat.nomor}
                    </div>
                    <div className="text-xs text-emerald-700 mt-1">
                      Diterbitkan pada{" "}
                      {new Date(selectedPeserta.sertifikat.tanggalTerbit).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Progres Keseluruhan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progres Kursus</span>
                  <span className="font-bold">{selectedPeserta.persenProgres}%</span>
                </div>
                <Progress value={selectedPeserta.persenProgres} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {selectedPeserta.modulSelesaiCount} dari {modulList.length} modul selesai
                </div>
              </div>

              {/* Rincian Modul & Kuis */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Rincian Modul & Riwayat Kuis
                </h3>

                <div className="space-y-3">
                  {modulList.map((m) => {
                    const prog = selectedPeserta.progresList.find((p) => p.modul_id === m.id);
                    const kuisAttempts = selectedPeserta.percobaanList.filter((k) => k.modul_id === m.id);
                    const isLulus = !!prog?.lulus_pada;

                    return (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-lg border bg-card text-card-foreground space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                              Modul {m.urutan}
                            </span>
                            <div className="text-sm font-semibold leading-snug">{m.judul}</div>
                          </div>
                          {isLulus ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 shrink-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Lulus
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="shrink-0">
                              <Clock className="w-3 h-3 mr-1" /> Proses
                            </Badge>
                          )}
                        </div>

                        {/* Status Baca Materi */}
                        <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t">
                          <div className="flex items-center justify-between">
                            <span>Materi dibaca:</span>
                            <span className="font-medium text-foreground">
                              {prog?.materi_dibaca_pada
                                ? new Date(prog.materi_dibaca_pada).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Belum dibaca"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Modul diselesaikan:</span>
                            <span className="font-medium text-foreground">
                              {prog?.lulus_pada
                                ? new Date(prog.lulus_pada).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Riwayat Percobaan Kuis */}
                        <div className="pt-2 border-t">
                          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                            Percobaan Kuis ({kuisAttempts.length}x)
                          </div>
                          {kuisAttempts.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">
                              Belum ada percobaan kuis untuk modul ini.
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {kuisAttempts.map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">Ke-{att.nomor_percobaan}</span>
                                    {att.dikerjakan_pada && (
                                      <span className="text-[11px] text-muted-foreground">
                                        {new Date(att.dikerjakan_pada).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {att.jumlah_benar !== undefined && att.jumlah_soal !== undefined && (
                                      <span className="text-[11px] text-muted-foreground">
                                        {att.jumlah_benar}/{att.jumlah_soal} benar
                                      </span>
                                    )}
                                    <Badge
                                      variant={att.lulus ? "default" : "destructive"}
                                      className="font-mono text-[11px] px-1.5 py-0"
                                    >
                                      {att.nilai} ({att.lulus ? "Lulus" : "Gagal"})
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}

export default function RekapPesertaKursusPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        }
      >
        <RekapPesertaContent />
      </Suspense>
    </div>
  );
}
