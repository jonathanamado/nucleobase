"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation"; 
import { UserCircle, LayoutDashboard, Home, LogOut } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ nome: string; avatar: string | null }>({
    nome: "",
    avatar: null,
  });
  const pathname = usePathname();
  const router = useRouter();

  // Função para buscar dados do perfil
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("nome_completo, avatar_url")
      .eq("id", userId)
      .single();

    if (data) {
      setUserProfile({
        nome: data.nome_completo || "",
        avatar: data.avatar_url || null,
      });
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile({ nome: "", avatar: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função para pegar as iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return "NB"; // Fallback para Nucleo Base
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="w-full px-10 h-20 flex items-center justify-between">
        
        {/* BLOCO DA LOGO */}
        <div className="flex items-center flex-shrink-0 min-w-fit"> 
          <div className="flex-shrink-0">
             <a href="/" className="block hover:opacity-90 transition">
               <img 
                src="/logo-oficial.png?v=3" 
                alt="Logo Núcleo Base"
                width={140} 
                height={75} 
                className="object-contain" 
              />
             </a>
          </div>

          <div className="flex flex-col text-[13px] font-bold text-gray-900 leading-tight tracking-tighter -ml-8 select-none">
            <a href="/" className="hover:opacity-80 transition flex flex-col">
              <span className="pl-1">Sua</span>
              <span className="pl-6.5 mt-0 text-gray-500">plataforma</span>
              <span className="pl-10 mt-0.5">
                <span className="bg-blue-600 text-white px-1.5 pt-1 pb-0.5 rounded-md text-[10px] shadow-sm inline-block">
                  DIGITAL
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* NAVEGAÇÃO DIREITA */}
        <nav className="hidden md:flex items-center gap-3 text-[13px] text-gray-600">
          {!isLoggedIn ? (
            <>
              {pathname !== "/" && (
                <a href="/" className="flex items-center gap-2 hover:text-gray-900 transition-colors font-medium mr-2">
                  <Home size={18} /> Página inicial
                </a>
              )}
              <a href="/cadastro" className="min-w-[120px] inline-block text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-bold shadow-sm">
                Criar Conta
              </a>
              <a href="/acesso-usuario" className="min-w-[120px] inline-block text-center bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition font-bold shadow-sm">
                Acessar
              </a>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {pathname !== "/" && (
                <a href="/" className="px-2 py-2 text-gray-600 hover:text-blue-600 transition">
                  <Home size={18} />
                </a>
              )}
              
              <a href="/acesso-usuario" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-bold shadow-sm">
                <LayoutDashboard size={18} />
                Acessar Plataforma
              </a>

              {/* BOTÃO DO PERFIL (FOTO OU INICIAIS) */}
              <button 
                onClick={() => router.push("/minha-conta")}
                className="ml-1 flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-100 hover:border-blue-500 transition-all overflow-hidden bg-gray-50"
              >
                {userProfile.avatar ? (
                  <img 
                    src={userProfile.avatar} 
                    alt="Perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-blue-600 tracking-tighter">
                    {getInitials(userProfile.nome)}
                  </span>
                )}
              </button>
            </div>
          )}
        </nav>

        <button className="md:hidden text-2xl text-gray-600">☰</button>
      </div>
    </header>
  );
}