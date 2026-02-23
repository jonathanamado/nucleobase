"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; 
import { 
  UserCircle, LayoutDashboard, X, Menu, 
  Info, Newspaper, CreditCard, BarChart3, Star, HelpCircle, 
  MessageSquare, Shield, LifeBuoy, ChevronRight, Undo2, AppWindow
} from "lucide-react";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ nome: string; avatar: string | null }>({
    nome: "",
    avatar: null,
  });
  const pathname = usePathname();
  const router = useRouter();

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
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile({ nome: "", avatar: null });
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
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push("/");
  };

  const menuLinks = [
    { name: "Sobre a Plataforma", href: "/sobre", icon: <Info size={18} /> },
    { name: "Blog da Núcleo", href: "/blog", icon: <Newspaper size={18} /> },
    { name: "Assinatura digital", href: "/planos", icon: <CreditCard size={18} /> },
    { name: "Painel de Resultados", href: "/resultados", icon: <BarChart3 size={18} /> },
    { name: "Depoimentos", href: "/depoimentos", icon: <Star size={18} /> },
    { name: "FAQ", href: "/faq", icon: <HelpCircle size={18} /> },
    //{ name: "Fale conosco", href: "/contato", icon: <MessageSquare size={18} /> },
    { name: "Segurança", href: "/seguranca_privacidade", icon: <Shield size={18} /> },
    //{ name: "Suporte técnico", href: "/suporte", icon: <LifeBuoy size={18} /> },
  ];

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="w-full px-6 lg:px-10 h-20 flex items-center justify-between relative">
        
        {/* BLOCO DA LOGO */}
        <div className="flex items-center flex-shrink-0 min-w-fit"> 
          <div className="flex-shrink-0">
             <a href="/" className="block hover:opacity-90 transition">
               <img 
                src="/logo-oficial.png?v=3" 
                alt="Logo Núcleo Base"
                width={120} 
                height={65} 
                className="w-[140px] h-auto lg:w-[170px] lg:h-auto object-contain" 
              />
             </a>
          </div>

          <div className="hidden lg:flex flex-col text-[13px] font-bold text-gray-900 leading-tight tracking-tighter -ml-8 select-none">
            <a href="/" className="hover:opacity-80 transition flex flex-col">
              <span className="pl-0">Sua plataforma</span>
              <span className="pl-7.5 mt-0 text-gray-500">financeira</span>
              <span className="pl-9.5 mt-0.5">
                <span className="bg-blue-600 text-white px-1.5 pt-1 pb-0.5 rounded-md text-[10px] shadow-sm inline-block">
                  DIGITAL
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden md:flex items-center gap-3 text-[13px] text-gray-600">
          {!isLoggedIn ? (
            <>
              {pathname !== "/" && (
                <a href="/" className="flex items-center gap-2.5 text-gray-400 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest mr-4 group">
                  <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition-colors border border-gray-100 group-hover:border-blue-100">
                    <AppWindow size={16} strokeWidth={2} />
                  </div>
                  Página inicial
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
                <a href="/" className="flex items-center gap-2.5 text-gray-400 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest mr-2 group">
                  <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition-colors border border-gray-100 group-hover:border-blue-100">
                    <AppWindow size={16} strokeWidth={2} />
                  </div>
                  <span className="hidden lg:inline">Início</span>
                </a>
              )}
              <a href="/acesso-usuario" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-bold shadow-sm">
                <LayoutDashboard size={18} />
                Acessar Plataforma
              </a>
              <button 
                onClick={() => router.push("/minha-conta")}
                className="ml-1 flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-100 hover:border-blue-500 transition-all overflow-hidden bg-gray-50"
              >
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-black text-blue-600 tracking-tighter">{getInitials(userProfile.nome)}</span>
                )}
              </button>
            </div>
          )}
        </nav>

        {/* BOTÃO MOBILE */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 text-gray-600 active:scale-95 transition-all z-[110]"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* OVERLAY E DROPDOWN MOBILE */}
        {isMenuOpen && (
          <>
            {/* Camada para fechar ao clicar fora */}
            <div 
              className="fixed inset-0 bg-black/5 z-[90] md:hidden" 
              onClick={() => setIsMenuOpen(false)}
            />

            <div className="absolute top-[85px] right-6 left-6 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 md:hidden">
              <div className="max-h-[70vh] overflow-y-auto p-4 custom-scrollbar">
                
                {/* Página Inicial - Novo item no topo do menu mobile */}
                <a
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl text-blue-600 bg-blue-50/50 border border-blue-100 mb-2 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="p-2 bg-white rounded-full shadow-sm text-blue-600">
                      <AppWindow size={18} strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-bold uppercase tracking-tight">Página Inicial</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </a>

                {isLoggedIn && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl mb-4 border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-white border border-blue-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-blue-600 text-sm">{getInitials(userProfile.nome)}</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-gray-900 truncate">{userProfile.nome || "Usuário"}</span>
                      <button 
                        onClick={() => {router.push("/minha-conta"); setIsMenuOpen(false);}}
                        className="text-[10px] text-blue-600 font-bold uppercase tracking-wider text-left"
                      >
                        Minha Conta
                      </button>
                    </div>
                  </div>
                )}

                <nav className="space-y-0.5">
                  {menuLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-1.5 rounded-2xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                          {link.icon}
                        </span>
                        <span className="text-sm font-semibold">{link.name}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 opacity-50" />
                    </a>
                  ))}
                </nav>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  {!isLoggedIn ? (
                    <div className="grid grid-cols-2 gap-3">
                      <a href="/acesso-usuario" className="py-4 bg-orange-500 text-white text-center rounded-2xl font-bold text-xs uppercase tracking-tighter shadow-md">
                        Acessar
                      </a>
                      <a href="/cadastro" className="py-4 bg-blue-600 text-white text-center rounded-2xl font-bold text-xs uppercase tracking-tighter shadow-md">
                        Criar Conta
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <a href="/acesso-usuario" className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-lg">
                        <LayoutDashboard size={18} /> Painel Principal
                      </a>
                      <button 
                        onClick={handleLogout}
                        className="py-3 text-gray-400 font-bold text-[11px] uppercase tracking-widest"
                      >
                        Sair da conta
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}