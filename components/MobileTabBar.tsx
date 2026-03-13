"use client";

import { useState, useEffect } from "react";
import { 
  Search, Share2, User, Home, X, Rocket, LogOut, Dna, 
  Settings, Lock, UserCircle, PlusCircle, LogIn, MonitorPlay
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

export function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const { isLoggedIn, userProfile, loading } = useAuth();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authTrigger, setAuthTrigger] = useState(0);

  // Listener para resolver o delay de login via Google/OAuth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setAuthTrigger(prev => prev + 1);
      }
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
    const confirmLogout = window.confirm("Tem certeza que deseja sair?");
    if (confirmLogout) {
      try {
        await supabase.auth.signOut({ scope: 'global' });
        
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
          const databases = await window.indexedDB.databases?.();
          databases?.forEach(db => db.name?.includes('supabase') && window.indexedDB.deleteDatabase(db.name!));
          
          document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
        }

        setIsMenuOpen(false);
        window.location.href = "/";
      } catch (error) {
        window.location.href = "/";
      }
    }
  };

  const handleAction = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  const handlePasswordReset = () => {
    setIsMenuOpen(false);
    alert("Acionando alteração de senha...");
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

  const isActuallyLoggedIn = (isLoggedIn || authTrigger > 0) && !!userProfile;

  if (loading) return null;

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

      {/* Menu suspenso do Perfil */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed bottom-20 right-6 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-[110] animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
            <div className="flex flex-col">
              {isActuallyLoggedIn ? (
                <>
                  <button onClick={() => handleAction("/minha-conta")} className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-gray-700 font-semibold text-sm text-left">
                    <UserCircle size={20} className="text-blue-600" /> Minha conta
                  </button>
                  <button onClick={() => handleAction("/configuracoes")} className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-gray-700 font-semibold text-sm text-left">
                    <Settings size={20} className="text-gray-400" /> Configurações
                  </button>
                  <button onClick={handlePasswordReset} className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-gray-700 font-semibold text-sm text-left border-b border-gray-50">
                    <Lock size={20} className="text-orange-500" /> Alterar senha
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-3 p-4 hover:bg-red-50 rounded-2xl transition-colors text-red-600 font-bold text-sm text-left">
                    <LogOut size={20} /> Sair da conta
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleAction("/cadastro")} className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-gray-700 font-semibold text-sm text-left">
                    <PlusCircle size={20} className="text-blue-600" /> Criar conta
                  </button>
                  <button onClick={() => handleAction("/acesso-usuario")} className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-gray-700 font-semibold text-sm text-left">
                    <LogIn size={20} className="text-orange-500" /> Realizar login
                  </button>
                  <button onClick={() => handleAction("/demonstracao")} className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-gray-700 font-semibold text-sm text-left">
                    <MonitorPlay size={20} className="text-gray-400" /> Realizar demonstração
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Tab Bar Principal */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 z-[100] flex items-center justify-between shadow-[0_-4px_15px_rgba(0,0,0,0.06)] pb-safe-bottom">
        
        <button onClick={() => router.push("/")} className={`p-2 transition-colors ${pathname === "/" ? "text-blue-600" : "text-gray-400"}`}>
          <Home size={22} strokeWidth={pathname === "/" ? 2.5 : 2} />
        </button>

        <button onClick={() => router.push("/lancamentos")} className={`p-2 transition-colors ${pathname === "/lancamentos" ? "text-orange-500" : "text-gray-400"}`}>
          <Rocket size={22} strokeWidth={pathname === "/lancamentos" ? 2.5 : 2} />
        </button>

        <button onClick={() => setIsSearchOpen(true)} className={`p-2 transition-colors ${pathname === "/busca" ? "text-blue-600" : "text-gray-400"}`}>
          <Search size={22} strokeWidth={pathname === "/busca" ? 2.5 : 2} />
        </button>

        <button onClick={handleShare} className="p-2 text-gray-400 active:text-blue-600">
          <Share2 size={22} />
        </button>

        {/* Perfil */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-9 h-9 rounded-full border transition-all overflow-hidden flex items-center justify-center relative ${
            isMenuOpen || pathname === "/minha-conta" ? "border-blue-600 ring-2 ring-blue-50" : "border-gray-100 bg-gray-50"
          }`}
        >
          {isActuallyLoggedIn && userProfile?.avatar ? (
            <img 
              src={userProfile.avatar} 
              alt="Perfil" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : isActuallyLoggedIn ? (
            <span className="text-[10px] font-black text-blue-600 tracking-tighter">
              {getInitials(userProfile?.nome || "")}
            </span>
          ) : (
            <User size={20} className="text-gray-400" />
          )}
        </button>
      </div>
    </>
  );
}