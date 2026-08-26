// components/MobileTabBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, Home, X, Rocket, Power, Dna, Settings, Key, UserPlus, PlayCircle, KeyRound, Eye, EyeOff, Info, Fingerprint, Building2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ nome: string; avatar: string | null }>({
    nome: "",
    avatar: null,
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("nome_completo, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (profileData) {
      setUserProfile({
        nome: profileData.nome_completo || "",
        avatar: profileData.avatar_url || null,
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      setIsLoggedIn(!!session);
      if (session?.user) fetchProfile(session.user.id);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setIsLoggedIn(!!session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile({ nome: "", avatar: null });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Logout inteligente e seguro (Preserva consentimento de cookies e limpa estritamente os tokens de sessão)
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Deseja realmente sair da conta?");
    if (!confirmLogout) return;

    setIsMenuOpen(false);

    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {
      console.error("Erro ao deslogar no servidor:", e);
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error("Erro ao limpar storages de sessão:", e);
    }

    setIsLoggedIn(false);
    setUserProfile({ nome: "", avatar: null });

    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSearchOpen(false);
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/busca?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-gray-700" }: any) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full active:bg-gray-50 transition-colors cursor-pointer"
    >
      <Icon size={18} className={color} strokeWidth={2} />
      <span className={`text-[8px] font-black uppercase tracking-widest text-center leading-none ${color}`}>{label}</span>
    </button>
  );

  const isCondoActive = !isSearchOpen && !isMenuOpen && (pathname === "/condo" || pathname?.startsWith("/condo/"));

  const isProfileActive = isMenuOpen ||
    (!isSearchOpen && !isMenuOpen &&
      (pathname === "/minha-conta" || pathname === "/configuracoes" || pathname === "/cadastro" || pathname === "/acesso-usuario" || pathname === "/demonstracao" || pathname === "/sobre"));

  return (
    <div ref={menuRef}>
      {/* Menu Adicional */}
      {isMenuOpen && (
        <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-[95] animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between h-20 px-2">
              {isLoggedIn ? (
                <div className="flex items-center w-full h-full">
                  <MenuItem icon={User} label="Conta" onClick={() => { router.push("/minha-conta"); setIsMenuOpen(false); }} />
                  <MenuItem icon={Settings} label="Ajustes" onClick={() => { router.push("/configuracoes"); setIsMenuOpen(false); }} />
                  <MenuItem icon={PlayCircle} label="Demo" onClick={() => { router.push("/demonstracao"); setIsMenuOpen(false); }} />
                  <MenuItem icon={Power} label="Sair" color="text-red-500" onClick={handleLogout} />
                </div>
              ) : (
                <div className="flex items-center w-full h-full">
                  <MenuItem icon={UserPlus} label="Criar" onClick={() => { router.push("/cadastro"); setIsMenuOpen(false); }} />
                  <MenuItem icon={Fingerprint} label="Entrar" onClick={() => { router.push("/acesso-usuario"); setIsMenuOpen(false); }} />
                  <MenuItem icon={Info} label="Sobre" onClick={() => { router.push("/sobre"); setIsMenuOpen(false); }} />
                  <MenuItem icon={PlayCircle} label="Demo" onClick={() => { router.push("/demonstracao"); setIsMenuOpen(false); }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay de Busca */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[110] animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white h-[50vh] rounded-t-[3rem] shadow-2xl flex flex-col p-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase shadow-sm">
                Busca Rápida
              </div>
              <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-gray-50 rounded-full cursor-pointer">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight flex items-center gap-2">
                O que você procura? <Dna size={18} className="text-blue-600 opacity-30" />
              </h2>
              <form onSubmit={handleSearch} className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="Ex: Cadastro, Lançamentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-inner"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl shadow-md cursor-pointer">
                  <Search size={18} />
                </button>
              </form>
            </div>
            <div className="mt-auto pb-4 flex flex-col items-center">
              <span className="text-gray-300 font-bold tracking-tighter text-sm italic">nucleobase.app</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar Principal */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 h-[60px] z-[100] flex items-center justify-between shadow-[0_-1px_10px_rgba(0,0,0,0.02)] pb-safe-bottom">

        <button onClick={() => { setIsMenuOpen(false); setIsSearchOpen(false); router.push("/"); }} className={`p-2 transition-colors cursor-pointer ${!isSearchOpen && !isMenuOpen && pathname === "/" ? "text-blue-600" : "text-gray-400"}`}>
          <Home size={22} strokeWidth={!isSearchOpen && !isMenuOpen && pathname === "/" ? 2.5 : 2} />
        </button>

        <button onClick={() => { setIsMenuOpen(false); setIsSearchOpen(false); router.push("/lancamentos"); }} className={`p-2 transition-colors cursor-pointer ${!isSearchOpen && !isMenuOpen && pathname === "/lancamentos" ? "text-orange-500" : "text-gray-400"}`}>
          <Rocket size={22} className="-rotate-45" strokeWidth={!isSearchOpen && !isMenuOpen && pathname === "/lancamentos" ? 2.5 : 2} />
        </button>

        <button onClick={() => { setIsMenuOpen(false); setIsSearchOpen(false); router.push("/condo"); }} className={`p-2 transition-colors cursor-pointer ${isCondoActive ? "text-blue-600" : "text-gray-400"}`}>
          <Building2 size={22} strokeWidth={isCondoActive ? 2.5 : 2} />
        </button>

        <button onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }} className={`p-2 transition-colors cursor-pointer ${(isSearchOpen || pathname === "/busca") && !isMenuOpen ? "text-blue-600" : "text-gray-400 active:text-blue-600"}`}>
          <Search size={22} strokeWidth={(isSearchOpen || pathname === "/busca") && !isMenuOpen ? 2.5 : 2} />
        </button>

        <button onClick={handleProfileClick} className={`w-9 h-9 rounded-full border transition-all overflow-hidden flex items-center justify-center relative cursor-pointer ${isProfileActive ? "border-blue-600 ring-2 ring-blue-600/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]" : "border-gray-100 bg-gray-50"}`}>
          {isLoggedIn && userProfile.avatar ? (
            <div className="relative w-full h-full">
              <img src={userProfile.avatar} alt="Perfil" className="w-full h-full object-cover" />
              {isProfileActive && (isMenuOpen || pathname === "/minha-conta") && (
                <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                  {isMenuOpen ? <X size={14} className="text-white drop-shadow-md" /> : null}
                </div>
              )}
            </div>
          ) : isLoggedIn ? (
            <span className={`text-[10px] font-black tracking-tighter ${isProfileActive ? "text-blue-600" : "text-gray-400"}`}>
              {isMenuOpen ? <X size={16} /> : (userProfile.nome ? getInitials(userProfile.nome) : <User size={16} />)}
            </span>
          ) : (
            <>
              {pathname === "/demonstracao" && isProfileActive ? (
                <PlayCircle size={20} className="text-blue-600" />
              ) : (
                <User size={20} className={isProfileActive ? "text-blue-600" : "text-gray-400"} />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}