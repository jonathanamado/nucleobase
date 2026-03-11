"use client";

import { useState, useEffect } from "react";
import { Search, Share2, User, Home, X, Rocket, LogOut, Dna } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ nome: string; avatar: string | null }>({
    nome: "",
    avatar: null,
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Lógica de Autenticação e Perfil
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
      if (session?.user) fetchProfile(session.user.id);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) fetchProfile(session.user.id);
      else setUserProfile({ nome: "", avatar: null });
    });

    return () => subscription.unsubscribe();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "NB";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    // Ajuste realizado aqui: adicionado .auth para acessar o método signOut
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      router.push("/acesso-usuario");
      return;
    }

    if (pathname === "/minha-conta") {
      const confirmLogout = window.confirm("Deseja sair da sua conta?");
      if (confirmLogout) handleLogout();
    } else {
      router.push("/minha-conta");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Nucleobase",
          text: "Confira este conteúdo na Nucleobase:",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Erro ao compartilhar", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/busca?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Overlay de Busca */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-[110] flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase shadow-sm">
              Plataforma Digital
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-gray-50 rounded-full">
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          <div className="flex flex-col flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
              O que você procura? <Dna size={20} className="text-blue-600 opacity-30" />
            </h2>
            <form onSubmit={handleSearch} className="relative mb-8">
              <input 
                autoFocus
                type="text"
                placeholder="Ex: Cadastro, Lançamentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl shadow-md">
                <Search size={20} />
              </button>
            </form>

            <div className="mt-auto py-8 flex flex-col items-center border-t border-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-900 font-bold tracking-tighter text-lg">nucleobase<span className="text-blue-600">.</span>app</span>
              </div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Sua evolução financeira</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar Principal */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 z-[100] flex items-center justify-between shadow-[0_-4px_15px_rgba(0,0,0,0.06)] pb-safe-bottom">
        
        {/* Home */}
        <button 
          onClick={() => router.push("/")} 
          className={`p-2 transition-colors ${pathname === "/" ? "text-blue-600" : "text-gray-400"}`}
        >
          <Home size={22} strokeWidth={pathname === "/" ? 2.5 : 2} />
        </button>

        {/* Lançamentos (Foguete) */}
        <button 
          onClick={() => router.push("/lancamentos")} 
          className={`p-2 transition-colors ${pathname === "/lancamentos" ? "text-orange-500" : "text-gray-400"}`}
        >
          <Rocket size={22} strokeWidth={pathname === "/lancamentos" ? 2.5 : 2} />
        </button>

        {/* Lupa (Busca) */}
        <button 
          onClick={() => setIsSearchOpen(true)} 
          className={`p-2 transition-colors ${pathname === "/busca" ? "text-blue-600" : "text-gray-400 active:text-blue-600"}`}
        >
          <Search size={22} strokeWidth={pathname === "/busca" ? 2.5 : 2} />
        </button>

        {/* Botão de Compartilhar */}
        <button 
          onClick={handleShare}
          className="p-2 text-gray-400 active:text-blue-600"
        >
          <Share2 size={22} />
        </button>

        {/* Perfil / Logout */}
        <button 
          onClick={handleProfileClick}
          className={`w-9 h-9 rounded-full border transition-all overflow-hidden flex items-center justify-center relative ${
            pathname === "/minha-conta" ? "border-blue-600 ring-2 ring-blue-50" : "border-gray-100 bg-gray-50"
          }`}
        >
          {isLoggedIn && userProfile.avatar ? (
            <div className="relative w-full h-full">
               <img src={userProfile.avatar} alt="Perfil" className="w-full h-full object-cover" />
               {pathname === "/minha-conta" && (
                 <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <LogOut size={14} className="text-white drop-shadow-md" />
                 </div>
               )}
            </div>
          ) : isLoggedIn ? (
            <span className="text-[10px] font-black text-blue-600 tracking-tighter">
              {pathname === "/minha-conta" ? <LogOut size={16} /> : getInitials(userProfile.nome)}
            </span>
          ) : (
            <User size={20} className="text-gray-400" />
          )}
        </button>
      </div>
    </>
  );
}