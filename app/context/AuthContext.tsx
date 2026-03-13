"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  isLoggedIn: boolean;
  userProfile: { nome: string; avatar: string | null };
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ nome: "", avatar: null });

  const fetchProfile = useCallback(async (user: any) => {
    if (!user) return;

    const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    const metaName = user.user_metadata?.full_name || user.email?.split('@')[0] || "";
    
    setUserProfile({ nome: metaName, avatar: metaAvatar });

    const { data } = await supabase
      .from("profiles")
      .select("nome_completo, avatar_url")
      .eq("id", user.id)
      .single();

    if (data) {
      setUserProfile({
        nome: data.nome_completo || metaName,
        avatar: data.avatar_url || metaAvatar,
      });
    }
  }, []);

  useEffect(() => {
    // 1. Checagem inicial
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        await fetchProfile(session.user);
      }
      setLoading(false);
    };

    initAuth();

    // 2. Escuta mudanças de estado (Login/Logout/Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        fetchProfile(session.user);
      } else {
        setIsLoggedIn(false);
        setUserProfile({ nome: "", avatar: null });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};