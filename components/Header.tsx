"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  UserCircle, LayoutDashboard, X, Menu, 
  Info, Newspaper, CreditCard, Star, HelpCircle, 
  Shield, AppWindow, LogOut, Search, ChevronRight,
  Settings, Lock, PlusCircle, LogIn, MonitorPlay, BarChart3
} from "lucide-react";

export function Header() {
  const { isLoggedIn, userProfile, loading } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false); 
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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
          if (databases) {
            databases.forEach(db => {
              if (db.name?.includes('supabase')) {
                window.indexedDB.deleteDatabase(db.name);
              }
            });
          }

          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
        }

        setIsMenuOpen(false);
        setIsUserDropdownOpen(false);
        window.location.href = "/";
      } catch (error) {
        console.error("Erro ao sair:", error);
        window.location.href = "/";
      }
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q");
    if (query) {
      router.push(`/busca?q=${encodeURIComponent(query.toString())}`);
      setIsMenuOpen(false); // Fecha o menu ao pesquisar
    }
  };

  const menuLinks = [
    { name: "Sobre a Plataforma", href: "/sobre", icon: <Info size={18} /> },
    { name: "Blog da Nucleo", href: "/blog", icon: <Newspaper size={18} /> },
    { name: "Assinatura digital", href: "/planos", icon: <CreditCard size={18} /> },
    { name: "Depoimentos", href: "/depoimentos", icon: <Star size={18} /> },
    { name: "FAQ", href: "/faq", icon: <HelpCircle size={18} /> },
    { name: "Segurança", href: "/seguranca_privacidade", icon: <Shield size={18} /> },
  ];

  if (!mounted || loading) {
    return <header className="w-full h-20 bg-white border-b border-gray-200 sticky top-0 z-50" />;
  }

  const isActuallyLoggedIn = isLoggedIn && userProfile;

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="w-full px-4 md:px-8 lg:px-10 h-20 flex items-center justify-between relative">
        
        {/* BLOCO DA LOGO */}
        <div className="flex items-center flex-shrink-0 min-w-fit"> 
          <div className="flex-shrink-0">
              <Link href="/" className="block hover:opacity-90 transition">
                <img 
                  src="/logo-oficial.png?v=3" 
                  alt="Logo Nucleo Base"
                  width={120} 
                  height={65} 
                  className="w-[140px] h-auto lg:w-[170px] lg:h-auto object-contain" 
                />
              </Link>
          </div>

          <div className="hidden lg:flex flex-col text-[13px] font-bold text-gray-900 leading-tight tracking-tighter -ml-8 select-none">
            <Link href="/" className="hover:opacity-80 transition flex flex-col">
              <span className="pl-0">Sua plataforma</span>
              <span className="pl-7.5 mt-0 text-gray-500">financeira</span>
              <span className="pl-9.5 mt-0.5">
                <span className="bg-blue-600 text-white px-1.5 pt-1 pb-0.5 rounded-md text-[11px] shadow-sm inline-block">
                  DIGITAL
                </span>
              </span>
            </Link>
          </div>
        </div>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden md:flex items-center gap-3 text-[13px] text-gray-600">
          
          {pathname === "/" && (
            <form onSubmit={handleSearch} className="flex items-center bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 focus-within:border-blue-300 transition-all mr-2 group">
              <input 
                name="q"
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent outline-none text-[12px] w-24 lg:w-40 transition-all focus:w-32 lg:focus:w-56"
              />
              <button type="submit" className="text-gray-400 group-hover:text-blue-600 transition-colors ml-1">
                <Search size={18} strokeWidth={2.5} />
              </button>
            </form>
          )}

          {!isActuallyLoggedIn ? (
            <>
              {pathname !== "/" && (
                <Link href="/" className="flex items-center gap-2.5 text-gray-400 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest mr-4 group">
                  <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition-colors border border-gray-100 group-hover:border-blue-100">
                    <AppWindow size={16} strokeWidth={2} />
                  </div>
                  Página inicial
                </Link>
              )}
              <Link href="/cadastro" className="min-w-[120px] inline-block text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-bold shadow-sm">
                Criar Conta
              </Link>
              <Link href="/acesso-usuario" className="min-w-[120px] inline-block text-center bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition font-bold shadow-sm">
                Acessar
              </Link>
            </>
          ) : (
            <>
              {pathname !== "/" && (
                <Link href="/" className="flex items-center gap-2.5 text-gray-400 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest mr-2 group">
                  <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition-colors border border-gray-100 group-hover:border-blue-100">
                    <AppWindow size={16} strokeWidth={2} />
                  </div>
                  <span className="hidden lg:inline">Início</span>
                </Link>
              )}
              <Link href="/acesso-usuario" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-bold shadow-sm">
                <LayoutDashboard size={18} />
                Acessar Plataforma
              </Link>
            </>
          )}

          {/* BOTÃO DA IMAGEM DE PERFIL */}
          <div className="relative ml-1">
            <button 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-100 hover:border-blue-500 transition-all overflow-hidden bg-gray-50"
            >
              {isActuallyLoggedIn && userProfile?.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs font-black text-blue-600 tracking-tighter">
                  {isActuallyLoggedIn ? getInitials(userProfile?.nome || "") : <UserCircle size={22} strokeWidth={2.5} />}
                </span>
              )}
            </button>

            {isUserDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsUserDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {!isActuallyLoggedIn ? (
                    <div className="px-2">
                      <Link href="/cadastro" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                        <PlusCircle size={18} className="text-blue-600" /> Criar conta
                      </Link>
                      <Link href="/acesso-usuario" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
                        <LogIn size={18} className="text-orange-500" /> Realizar Login
                      </Link>
                      <Link href="/demonstracao" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <MonitorPlay size={18} className="text-gray-400" /> Realizar demonstração
                      </Link>
                    </div>
                  ) : (
                    <div className="px-2">
                      <Link href="/minha-conta" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <UserCircle size={18} className="text-blue-600" /> Minha conta
                      </Link>
                      <Link href="/configuracoes" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <Settings size={18} className="text-gray-400" /> Configurações
                      </Link>
                      <Link href="/alterar-senha" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <Lock size={18} className="text-orange-500" /> Alterar senha
                      </Link>
                      <div className="my-1 border-t border-gray-100"></div>
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={18} /> Sair da conta
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* BOTÃO MOBILE */}
        <div className="md:hidden flex items-center gap-2">
          {pathname !== "/" && (
              <Link href="/" className="p-2.5 text-gray-400 active:text-blue-600 transition-colors bg-gray-50 rounded-2xl border border-gray-100">
                <AppWindow size={20} strokeWidth={2} />
              </Link>
          )}

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 text-gray-600 active:scale-95 transition-all z-[110]"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* OVERLAY E DROPDOWN MOBILE */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 z-[90] md:hidden" 
              onClick={() => setIsMenuOpen(false)}
            />

            <div className="absolute top-[80px] right-0 left-0 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-t border-b border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 md:hidden">
              <div className="max-h-[70vh] overflow-y-auto p-6 custom-scrollbar">
                
                <nav className="space-y-1">
                  {menuLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-2xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                          {link.icon}
                        </span>
                        <span className="text-sm font-semibold">{link.name}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 opacity-50" />
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  {!isActuallyLoggedIn ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Link 
                        href="/acesso-usuario" 
                        onClick={() => setIsMenuOpen(false)}
                        className="py-4 bg-orange-500 text-white text-center rounded-2xl font-bold text-xs uppercase tracking-tighter shadow-md"
                      >
                        Acessar
                      </Link>
                      <Link 
                        href="/cadastro" 
                        onClick={() => setIsMenuOpen(false)}
                        className="py-4 bg-blue-600 text-white text-center rounded-2xl font-bold text-xs uppercase tracking-tighter shadow-md"
                      >
                        Criar Conta
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link href="/acesso-usuario" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg">
                        <LayoutDashboard size={18} /> Painel Acesso APP
                      </Link>
                      <Link 
                        href="/visao-resultados" 
                        onClick={() => setIsMenuOpen(false)} 
                        className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg"
                      >
                        <BarChart3 size={18} /> Visão de Resultados
                      </Link>
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