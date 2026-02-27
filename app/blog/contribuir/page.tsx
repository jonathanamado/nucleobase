"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Send, CheckCircle2, Loader2, Sparkles, 
  Unlock, Briefcase, Lock, Mail, Clock, FileText, 
  ChevronRight, Eye, EyeOff, AtSign, Dna, PenTool,
  LogOut, X, LifeBuoy, ArrowRight
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ContribuirBlog() {
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMontado, setIsMontado] = useState(false);
  
  // Estados de Autenticação (Baseado no padrão AcessoUsuarioPage)
  const [slug, setSlug] = useState(""); 
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState(""); // Para novos perfis
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  
  const [enviarCopia, setEnviarCopia] = useState(true);

  useEffect(() => {
    if (enviado) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [enviado]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        fetchProfileData(session.user);
      }
      setIsMontado(true);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfileData(session.user);
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileData = async (supabaseUser: any) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome_completo, email')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    setUser({
      nome: profile?.nome_completo || supabaseUser.user_metadata?.full_name || "Autor",
      email: supabaseUser.email,
      id: supabaseUser.id
    });
    setSlug(supabaseUser.email || "");
  };

  const handleAuthRapido = async () => {
    if (!slug || !senha) {
      alert("Preencha o acesso e a senha para liberar.");
      return;
    }
    setAuthLoading(true);

    const inputAcesso = slug.trim().toLowerCase();
    const isEmail = inputAcesso.includes("@");

    try {
      let emailParaAuth = "";
      if (isEmail) {
        emailParaAuth = inputAcesso;
      } else {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('slug', inputAcesso)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile || !profile.email) {
          alert("ID de usuário não encontrado.");
          setAuthLoading(false);
          return;
        }
        emailParaAuth = profile.email;
      }

      // Tenta Login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: emailParaAuth,
        password: senha,
      });

      // Se login falhar e tiver nome, tenta cadastro
      if (loginError) {
        if (nome) {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailParaAuth,
            password: senha,
            options: { data: { full_name: nome } }
          });
          if (authError) throw authError;

          if (authData.user) {
            const indicadorId = localStorage.getItem("nucleobase_referral_id");
            if (indicadorId && indicadorId !== authData.user.id) {
              await supabase.from("indicacoes").insert([{ indicador_id: indicadorId, indicado_id: authData.user.id, status: 'pendente' }]);
            }
            await supabase.from('profiles').upsert({ id: authData.user.id, email: emailParaAuth, nome_completo: nome, plan_type: 'free' });
          }
        } else {
          alert("Acesso incorreto. Se você é novo, preencha também o seu nome completo.");
        }
      }
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: "https://nucleobase.app/reset-password",
    });
    if (error) alert("Erro: " + error.message);
    else {
      alert("Link enviado com sucesso!");
      setShowForgotModal(false);
    }
    setResetLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "9ef5a274-150a-4664-a885-0b052efd06f7");
    formData.append("email_do_autor", user.email); 
    formData.append("nome_do_autor", user.nome);

    try {
      const { error: dbError } = await supabase.from("artigos_colaborativos").insert([{
        user_id: user.id,
        titulo: formData.get("Titulo_do_Artigo"),
        categoria: formData.get("Categoria"),
        autor_social: formData.get("Autor_Social"),
        autor_website: formData.get("Autor_Website"),
        autor_atuacao: formData.get("Autor_Atuacao")
      }]);

      if (dbError) throw dbError;
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      if (response.ok) setEnviado(true);
    } catch (error) {
      alert("Erro ao processar envio.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMontado) return null;

  if (enviado) {
    return (
      <div className="w-full pr-10 animate-in fade-in zoom-in duration-500 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-6 mx-auto border border-emerald-100">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Artigo enviado!</h1>
        <p className="text-gray-500 text-lg mb-10 font-medium italic">Sua contribuição foi recebida e está em análise.</p>
        <a href="/blog" className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all">Voltar ao Blog</a>
      </div>
    );
  }

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Escreva para a gente<span className="text-blue-600">.</span></span>
            <PenTool size={60} className="text-blue-600 skew-x-12 opacity-35 ml-4" strokeWidth={1.2} />
          </h1>
          <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed mt-0">
            Simplicidade em compartilhar o seu conhecimento.
          </h2>
        </div>

        {user && (
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors bg-gray-50 px-3 py-2 rounded-xl">
            <LogOut size={16} /> Logoff
          </button>
        )}
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4 w-full">
        Conteúdo e Identidade <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* FORMULÁRIO */}
        <div className="lg:col-span-7 space-y-8">
          {!user ? (
            <div className="bg-white rounded-[3rem] border border-gray-100 p-8 md:p-12 shadow-2xl shadow-blue-900/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-orange-50 p-3 rounded-2xl text-orange-500"><AtSign size={28} /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Acesso Rápido</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Identifique-se para liberar o envio</p>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="ID ou E-mail" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <input type="text" placeholder="Nome Completo (Apenas para novos autores)" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
              </div>

              <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] text-gray-400 font-bold hover:text-blue-600 mb-6 block">Esqueceu a senha?</button>

              <button onClick={handleAuthRapido} disabled={authLoading} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                {authLoading ? <Loader2 className="animate-spin" size={18} /> : <Unlock size={18} />}
                {authLoading ? "Verificando..." : "Liberar Envio"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-gray-100 p-8 md:p-12 shadow-2xl shadow-blue-900/5 space-y-8">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-2 text-gray-400"><Mail size={18} /><h3 className="text-[11px] font-black uppercase tracking-widest">Editor de Conteúdo</h3></div>
                <label className="flex items-center gap-3 cursor-pointer group bg-gray-50 px-4 py-2 rounded-full text-[9px] font-black text-gray-400 uppercase">
                    Receber cópia
                    <input type="checkbox" checked={enviarCopia} onChange={() => setEnviarCopia(!enviarCopia)} className="sr-only peer" />
                    <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 transition-all peer-checked:after:translate-x-3"></div>
                </label>
              </div>

              <div className="space-y-6">
                <input name="Titulo_do_Artigo" required placeholder="Título do seu artigo..." className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-2xl" />
                <select name="Categoria" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-8 text-sm font-bold text-gray-500 outline-none cursor-pointer">
                    <option>Gestão</option><option>Estratégia</option><option>Tributário</option><option>Mentalidade</option><option>Tecnologia</option>
                </select>
                <textarea name="Conteudo_Completo" required placeholder="Desenvolva seu conhecimento aqui..." className="w-full h-96 bg-gray-50 border-none rounded-[2rem] p-8 text-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none font-medium text-gray-700 shadow-inner"></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-blue-700 flex items-center justify-center gap-3 shadow-xl">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {loading ? "Enviando..." : "Publicar Artigo"}
              </button>
            </form>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl group relative overflow-hidden transition-all flex flex-col justify-center min-h-[300px]">
            <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
              <Dna size={180} strokeWidth={1} className="text-blue-500" />
            </div>
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Briefcase size={24} /></div>
                <div><p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Credibilidade</p><h4 className="font-bold text-white text-xl">Perfil do Autor</h4></div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-500 uppercase">Instagram</label><input form="artigo-form" name="Autor_Social" type="text" placeholder="@seuuser" className="w-full bg-white/5 border-none rounded-xl py-3 px-5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-500 uppercase">Website</label><input form="artigo-form" name="Autor_Website" type="text" placeholder="www.link.com" className="w-full bg-white/5 border-none rounded-xl py-3 px-5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-500 uppercase">Atuação</label><input form="artigo-form" name="Autor_Atuacao" type="text" placeholder="Ex: Gestor Financeiro" className="w-full bg-white/5 border-none rounded-xl py-3 px-5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50/40 border-l-4 border-blue-600 p-8 rounded-r-[2.5rem]">
            <p className="text-blue-900 font-bold text-sm leading-relaxed italic">
              "Sua experiência transforma números em decisões inteligentes para toda a comunidade."
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE RECUPERAÇÃO */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 text-center">
            <button onClick={() => setShowForgotModal(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-900"><X size={20} /></button>
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 mb-4 w-fit mx-auto"><LifeBuoy size={32} /></div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Recuperar Acesso</h2>
            <p className="text-gray-500 text-xs mb-6">Informe seu e-mail cadastrado para redefinir a senha.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="email" required placeholder="seu@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
              </div>
              <button disabled={resetLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                {resetLoading ? "Enviando..." : "Enviar Link"} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}