"use client";

import { useState, useEffect } from "react";
import { Search, Share2, User, Home, X, Rocket, LogOut, Dna, Settings, Key, UserPlus, PlayCircle, LogIn, KeyRound, Eye, EyeOff } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [userProfile, setUserProfile] = useState<{ nome: string; avatar: string | null }>({
    nome: "",
    avatar: null,
  });
  
  // Estados para o Modal de Senha
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Lógica para resetar o destaque de compartilhar ao mudar de página
  useEffect(() => {
    setIsSharing(false);
  }, [pathname]);

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
    const confirmLogout = window.confirm("Tem certeza que deseja sair da conta?");
    if (confirmLogout) {
      await supabase.auth.signOut();
      setIsMenuOpen(false);
      router.push("/");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("As senhas não coincidem!");
    setPassLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert("Erro: " + error.message);
    else {
      alert("Senha alterada com sucesso!");
      setShowPassModal(false);
    }
    setPassLoading(false);
  };

  const handleProfileClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleShare = async () => {
    setIsSharing(true);
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

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-gray-700" }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-0"
    >
      <Icon size={20} className={color} />
      <span className={`text-sm font-bold ${color}`}>{label}</span>
    </button>
  );

  return (
    <>
      {/* Modal de Alteração de Senha (conforme aprendido) */}
      {showPassModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowPassModal(false)} className="absolute right-10 top-10 text-gray-300 hover:text-gray-900 transition-colors">
              <X size={28} strokeWidth={1.5} />
            </button>
            <div className="text-center mb-10">
              <div className="bg-blue-50 w-20 h-20 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-6 border border-blue-100 shadow-sm">
                <KeyRound size={36} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Nova Senha</h2>
              <p className="text-gray-400 text-sm mt-2 font-medium">Redefina seu acesso com segurança.</p>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Nova senha" required onChange={(e) => setNewPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-gray-900" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input type={showPass ? "text" : "password"} placeholder="Confirmar nova senha" required onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-gray-900" />
              <button disabled={passLoading} className="w-full bg-gray-900 text-white h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg mt-4 active:scale-95 transition-all disabled:opacity-50">
                {passLoading ? "Atualizando..." : "Confirmar Alteração"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Overlay do Menu de Perfil */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[120] animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute bottom-24 right-6 left-6 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Opções</span>
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><X size={20}/></button>
            </div>
            
            {isLoggedIn ? (
              <div className="flex flex-col">
                <MenuItem icon={User} label="Minha conta" onClick={() => { router.push("/minha-conta"); setIsMenuOpen(false); }} />
                <MenuItem icon={Settings} label="Configurações" onClick={() => { router.push("/configuracoes"); setIsMenuOpen(false); }} />
                <MenuItem icon={Key} label="Alterar senha" onClick={() => { setIsMenuOpen(false); setShowPassModal(true); }} />
                <MenuItem icon={LogOut} label="Sair da conta" color="text-red-500" onClick={handleLogout} />
              </div>
            ) : (
              <div className="flex flex-col">
                <MenuItem icon={UserPlus} label="Criar conta gratuita" onClick={() => { router.push("/cadastro"); setIsMenuOpen(false); }} />
                <MenuItem icon={LogIn} label="Realizar login" onClick={() => { router.push("/acesso-usuario"); setIsMenuOpen(false); }} />
                <MenuItem icon={PlayCircle} label="Demonstração APP" onClick={() => { router.push("/demonstracao"); setIsMenuOpen(false); }} />
              </div>
            )}
          </div>
        </div>
      )}

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
          className={`p-2 transition-colors ${isSharing ? "text-blue-600" : "text-gray-400 active:text-blue-600"}`}
        >
          <Share2 size={22} strokeWidth={isSharing ? 2.5 : 2} />
        </button>

        {/* Perfil / Menu */}
        <button 
          onClick={handleProfileClick}
          className={`w-9 h-9 rounded-full border transition-all overflow-hidden flex items-center justify-center relative ${
            isMenuOpen || pathname === "/minha-conta" ? "border-blue-600 ring-2 ring-blue-600/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]" : "border-gray-100 bg-gray-50"
          }`}
        >
          {isLoggedIn && userProfile.avatar ? (
            <div className="relative w-full h-full">
               <img src={userProfile.avatar} alt="Perfil" className="w-full h-full object-cover" />
               {(isMenuOpen || pathname === "/minha-conta") && (
                 <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                    {isMenuOpen ? <X size={14} className="text-white drop-shadow-md" /> : null}
                 </div>
               )}
            </div>
          ) : isLoggedIn ? (
            <span className={`text-[10px] font-black tracking-tighter ${isMenuOpen || pathname === "/minha-conta" ? "text-blue-600" : "text-gray-400"}`}>
              {isMenuOpen ? <X size={16} /> : getInitials(userProfile.nome)}
            </span>
          ) : (
            <User size={20} className={isMenuOpen ? "text-blue-600" : "text-gray-400"} />
          )}
        </button>
      </div>
    </>
  );
}