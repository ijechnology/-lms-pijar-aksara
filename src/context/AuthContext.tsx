"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  nama_lengkap: string;
  email: string;
  no_hp?: string | null;
  peran: "peserta" | "instruktur" | "admin";
  aktif: boolean;
  dibuat_pada: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: "peserta" | "instruktur" | "admin" | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.warn("Gagal mengambil profil pengguna:", error.message);
          return null;
        }
        return data as Profile;
      } catch (err) {
        console.error("Kesalahan fetch profile:", err);
        return null;
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const prof = await fetchProfile(user.id);
    if (prof) setProfile(prof);
  }, [user, fetchProfile]);

  const currentUserRef = useRef<User | null>(null);
  const currentProfileRef = useRef<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          currentUserRef.current = session.user;
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          if (isMounted) {
            currentProfileRef.current = prof;
            setProfile(prof);
          }
        } else if (isMounted) {
          currentUserRef.current = null;
          currentProfileRef.current = null;
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Kesalahan inisialisasi auth:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT" || !session?.user) {
        currentUserRef.current = null;
        currentProfileRef.current = null;
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // Jika user ID sama dan profile sudah ada, hindari trigger re-render saat token refresh
      const isSameUser = currentUserRef.current?.id === session.user.id;
      if (isSameUser && currentProfileRef.current && (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
        setIsLoading(false);
        return;
      }

      currentUserRef.current = session.user;
      setUser(session.user);

      if (!isSameUser || event === "USER_UPDATED" || !currentProfileRef.current) {
        const prof = await fetchProfile(session.user.id);
        if (isMounted) {
          currentProfileRef.current = prof;
          setProfile(prof);
        }
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      window.location.href = "/masuk";
    } catch (err) {
      console.error("Gagal keluar akun:", err);
    }
  };

  const role = profile?.peran || (user?.user_metadata?.peran as "peserta" | "instruktur" | "admin") || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
