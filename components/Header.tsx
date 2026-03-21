"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation"; 
import { 
  UserCircle, LayoutDashboard, X, Menu, 
  Info, Newspaper, CreditCard, BarChart3, Star, HelpCircle, 
  Shield, ChevronRight, Power,
  Search, Gift, Settings, Key, UserPlus, LogIn, PlayCircle,
  KeyRound, Eye, EyeOff, Play
} from "lucide-react";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ nome: string; avatar: string | null }>({
    nome: "",
    avatar: null,
  });
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      
      if (
        isMenuOpen && 
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileButtonRef.current && 
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

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
    const confirmLogout = window.confirm("Tem certeza que deseja sair da conta?");
    if (confirmLogout) {
      await supabase.auth.signOut();
      setIsMenuOpen(false);
      setIsUserDropdownOpen(false);
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q");
    if (query) {
      router.push(`/busca?q=${encodeURIComponent(query.toString())}`);
    }
  };

  const menuLinks = [
    { name: "Sobre a Plataforma", href: "/sobre", icon: <Info size={18} /> },
    { name: "Indique e ganhe", href: "/indique", icon: <Gift size={18} /> },
    { name: "Blog da Nucleo", href: "/blog", icon: <Newspaper size={18} /> },
    { name: "Assinatura digital", href: "/planos", icon: <CreditCard size={18} /> },
    { name: "Depoimentos", href: "/depoimentos", icon: <Star size={18} /> },
    { name: "FAQ", href: "/faq", icon: <HelpCircle size={18} /> },
    { name: "Segurança", href: "/seguranca_privacidade", icon: <Shield size={18} /> },
  ];

  const DropdownItem = ({ icon: Icon, label, onClick, color = "text-gray-600" }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm ${color} hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-gray-50 last:border-0`}
    >
      <Icon size={18} strokeWidth={2} />
      <span className="font-bold">{label}</span>
    </button>
  );

  return (
    // Adicionado text-gray-900 e forçado bg-white
    <header className="w-full border-b border-gray-200 bg-white text-gray-900 sticky top-0 z-50">
      <style jsx global>{`
        @keyframes blink-play {
          0%, 50% { fill: currentColor; }
          50.1%, 100% { fill: transparent; }
        }
        .animate-blink-play {
          animation: blink-play 3s infinite;
        }
      `}</style>

      {/* MODAL DE SENHA - Blindado com bg-white e texto escuro */}
      {showPassModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowPassModal(false)} className="absolute right-10 top-10 text-gray-400 hover:text-gray-900 transition-colors">
              <X size={28} strokeWidth={1.5} />
            </button>
            <div className="text-center mb-10">
              <div className="bg-blue-50 w-20 h-20 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-6 border border-blue-100 shadow-sm">
                <KeyRound size={36} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Nova Senha</h2>
              <p className="text-gray-500 text-sm mt-2 font-medium">Redefina seu acesso com segurança.</p>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Nova senha" 
                  required 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-gray-900 placeholder:text-gray-400" 
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="Confirmar nova senha" 
                required 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full h-14 px-6 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-gray-900 placeholder:text-gray-400" 
              />
              <button disabled={passLoading} className="w-full bg-gray-900 text-white h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg mt-4 active:scale-95 transition-all disabled:opacity-50">
                {passLoading ? "Atualizando..." : "Confirmar Alteração"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="w-full px-4 md:px-8 lg:px-10 h-20 flex items-center justify-between relative bg-white">
        <div className="flex items-center flex-shrink-0 min-w-fit bg-white"> 
          <div className="flex-shrink-0">
              <a href="/" rel="external" className="block hover:opacity-90 transition">
                <img 
                  src="/logo-oficial.png?v=3" 
                  alt="Logo Nucleo Base"
                  width={120} 
                  height={60} 
                  className="w-[125px] h-auto lg:w-[155px] lg:h-auto object-contain" 
                />
              </a>
          </div>

          <div className="hidden lg:flex flex-col text-[13px] font-bold text-gray-900 leading-tight tracking-tighter -ml-8 select-none">
            <a href="/" rel="external" className="hover:opacity-80 transition flex flex-col">
              <span className="pl-0">Sua plataforma</span>
              <span className="pl-7.5 mt-0 text-gray-500">financeira</span>
              <span className="pl-9.5 mt-0.5">
                  <span className="bg-blue-600 text-white px-1.5 pt-1 pb-0.5 rounded-md text-[11px] shadow-sm inline-block">
                    DIGITAL 
                  </span>
              </span>
            </a>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-3 text-[13px] text-gray-600 bg-white">
          {pathname === "/" && (
            <form onSubmit={handleSearch} className="flex items-center bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 focus-within:border-blue-300 transition-all mr-2 group">
              <input 
                name="q"
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent outline-none text-[12px] w-24 lg:w-40 transition-all focus:w-32 lg:focus:w-56 text-gray-900"
              />
              <button type="submit" className="text-gray-400 group-hover:text-blue-600 transition-colors ml-1">
                <Search size={18} strokeWidth={2.5} />
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 relative bg-white">
            {!isLoggedIn ? (
              <div className="flex items-center gap-3 bg-white">
                <a href="/cadastro" className="min-w-[120px] inline-block text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-bold shadow-sm">
                  Criar Conta
                </a>
                <a href="/acesso-usuario" className="min-w-[120px] inline-block text-center bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition font-bold shadow-sm">
                  Acessar
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white">
                <a href="/acesso-usuario" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-bold shadow-sm">
                  <LayoutDashboard size={18} />
                  Acessar Plataforma
                </a>
                
                {pathname === "/minha-conta" && (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-100 transition-all shadow-sm active:scale-95"
                    title="Sair da conta"
                  >
                    <Power size={18} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}
            
            {pathname !== "/minha-conta" && (
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className={`ml-1 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all overflow-hidden bg-gray-50 ${isUserDropdownOpen ? 'border-blue-500 shadow-md' : 'border-gray-100 hover:border-blue-400'}`}
                >
                  {isLoggedIn ? (
                    userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-blue-600 tracking-tighter">{getInitials(userProfile.nome)}</span>
                    )
                  ) : (
                    pathname === "/demonstracao" ? (
                      <Play size={20} className="text-blue-600 animate-blink-play" />
                    ) : (
                      <UserCircle size={24} className="text-gray-300" />
                    )
                  )}
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    {isLoggedIn ? (
                      <div className="flex flex-col bg-white">
                        <DropdownItem icon={UserCircle} label="Minha Conta" onClick={() => { router.push("/minha-conta"); setIsUserDropdownOpen(false); }} />
                        <DropdownItem icon={Settings} label="Configurações" onClick={() => { router.push("/configuracoes"); setIsUserDropdownOpen(false); }} />
                        <DropdownItem icon={Key} label="Alterar senha" onClick={() => { setIsUserDropdownOpen(false); setShowPassModal(true); }} />
                        <DropdownItem icon={Power} label="Sair da conta" color="text-red-500" onClick={handleLogout} />
                      </div>
                    ) : (
                      <div className="flex flex-col bg-white">
                        <DropdownItem icon={UserPlus} label="Criar conta" onClick={() => { router.push("/cadastro"); setIsUserDropdownOpen(false); }} />
                        <DropdownItem icon={LogIn} label="Realizar login" onClick={() => { router.push("/acesso-usuario"); setIsUserDropdownOpen(false); }} />
                        <DropdownItem icon={PlayCircle} label="Demonstração APP" onClick={() => { router.push("/demonstracao"); setIsUserDropdownOpen(false); }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* MENU MOBILE */}
        <div className="md:hidden flex items-center bg-white">
          <button 
            ref={mobileButtonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              relative flex items-center justify-center gap-2 
              h-9 px-4 rounded-xl transition-all duration-300 z-[110]
              ${isMenuOpen 
                ? "bg-gray-900 text-white shadow-lg ring-4 ring-gray-900/10" 
                : "bg-white text-gray-600 border border-gray-200 shadow-sm active:scale-95"
              }
            `}
          >
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${isMenuOpen ? "opacity-100" : "opacity-80"}`}>
              {isMenuOpen ? "Fechar" : "Menu"}
            </span>
            <div className="relative w-4 h-4 flex items-center justify-center">
              {isMenuOpen ? (
                <X size={18} strokeWidth={2.5} className="animate-in spin-in-90 duration-300" />
              ) : (
                <Menu size={18} strokeWidth={2.5} className="animate-in fade-in zoom-in duration-300" />
              )}
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-[90] md:hidden animate-in fade-in duration-300" 
              onClick={() => setIsMenuOpen(false)}
            />

            <div 
              ref={mobileMenuRef}
              className="absolute top-[85px] right-4 left-4 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 md:hidden"
            >
              <div className="max-h-[70vh] overflow-y-auto p-6 bg-white">
                <nav className="space-y-1 bg-white">
                  {menuLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all group bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                          {link.icon}
                        </span>
                        <span className="text-sm font-bold tracking-tight">{link.name}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 opacity-50 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 bg-white">
                  {!isLoggedIn ? (
                    <div className="grid grid-cols-2 gap-4 bg-white">
                      <a href="/acesso-usuario" className="py-4 bg-orange-500 text-white text-center rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        Acessar
                      </a>
                      <a href="/cadastro" className="py-4 bg-blue-600 text-white text-center rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        Criar Conta
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 bg-white">
                      <a href="/acesso-usuario" className="flex items-center justify-center gap-2 w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all">
                        <LayoutDashboard size={18} /> Painel Acesso APP
                      </a>
                      <a href="/resultados" className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all">
                        <BarChart3 size={18} /> Visão de Resultados
                      </a>
                      <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100 active:scale-95 transition-all">
                        <Power size={18} /> Sair da conta
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