"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Send, CheckCircle2, Loader2, Sparkles, 
  Unlock, Briefcase, Lock, Mail, Clock, FileText, 
  ChevronRight, Eye, EyeOff, AtSign, Dna, PenTool,
  X, LifeBuoy, ArrowRight, Instagram,
  ShieldCheck, Zap, Globe, Key, UserPlus
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
  
  // Estados de Autenticação
  const [slug, setSlug] = useState(""); 
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState(""); 
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

  const handleAuthRapido = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: emailParaAuth,
        password: senha,
      });

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

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    // Lógica Sugerida: Validar Perfil do Autor
    const autorSocial = formData.get("Autor_Social");
    const autorWebsite = formData.get("Autor_Website");
    const autorAtuacao = formData.get("Autor_Atuacao");

    if (!autorSocial && !autorWebsite && !autorAtuacao) {
      const confirmarEnvio = window.confirm(
        "Você ainda não preencheu o seu 'Perfil do Autor' (Instagram, Website ou Atuação). \n\nSugerimos preencher para dar mais credibilidade ao seu artigo. Deseja enviar assim mesmo?"
      );
      if (!confirmarEnvio) return;
    }

    setLoading(true);
    formData.append("access_key", "9ef5a274-150a-4664-a885-0b052efd06f7");
    formData.append("email_do_autor", user.email); 
    formData.append("nome_do_autor", user.nome);

    try {
      const { error: dbError } = await supabase.from("artigos_colaborativos").insert([{
        user_id: user.id,
        titulo: formData.get("Titulo_do_Artigo"),
        categoria: formData.get("Categoria"),
        autor_social: autorSocial,
        autor_website: autorWebsite,
        autor_atuacao: autorAtuacao
      }]);

      if (dbError) throw dbError;
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      if (response.ok) {
        formElement.reset(); 
        setEnviado(true);
      }
    } catch (error) {
      alert("Erro ao processar envio.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setEnviado(false);
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button onClick={handleGoBack} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all">Go Back</button>
          <a href="/blog" className="px-10 py-4 border border-gray-200 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all">Ir para o Blog</a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER PADRONIZADO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Escreva para a gente<span className="text-blue-600">.</span></span>
            <PenTool size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium w-full leading-relaxed mt-0">
            Compartilhando seu conhecimento.
          </h2>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5 flex items-center gap-2 w-full">
        Conteúdo e Identidade <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* FORMULÁRIO / LOGIN (ESQUERDA) */}
        <div className="lg:col-span-7 h-full">
          {!user ? (
            <div className="h-full">
                <div className="w-full bg-white p-6 md:p-4 rounded-[3rem] border border-gray-100 shadow-2xl shadow-blue-900/5 h-full flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 px-1">
                    Realizar login<span className="text-orange-500">.</span>
                  </h2>
                  <form onSubmit={handleAuthRapido} className="flex flex-col gap-1 flex-grow">
                      <div className="space-y-3">
                        <div className="relative group">
                          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-500 transition-colors" size={16} />
                          <input 
                            type="text" 
                            placeholder="ID de Usuário ou E-mail" 
                            required
                            value={slug}
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-xs text-gray-900 font-medium"
                            onChange={(e) => setSlug(e.target.value)}
                          />
                        </div>
                        <div className="relative group">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-500 transition-colors" size={16} />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Senha" 
                            required
                            value={senha}
                            className="w-full pl-11 pr-10 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-xs text-gray-900"
                            onChange={(e) => setSenha(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[10px] text-gray-400 font-bold hover:text-orange-500 transition-colors text-right pr-1"
                      >
                        Esqueceu a senha?
                      </button>

                      <button 
                        disabled={authLoading}
                        className="w-full bg-orange-500 text-white h-[56px] rounded-2xl font-bold hover:bg-orange-600 transition shadow-lg text-xs disabled:opacity-50 mt-2"
                      >
                        {authLoading ? "Verificando..." : "Acessar Plataforma"}
                      </button>
                  </form>

                  <div className="mt-6 pt-2 border-t border-gray-100">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Ainda não se cadastrou?</p>
                    <a href="/cadastro" className="flex items-center justify-center gap-3 bg-white text-gray-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95">
                      <UserPlus size={18} className="text-orange-500" /> Criar conta gratuita
                    </a>
                  </div>
              </div>
            </div> 
          ) : (
            <form id="artigo-form" onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-gray-100 p-8 md:p-12 shadow-2xl shadow-blue-900/5 space-y-8 flex flex-col h-full">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-2 text-gray-400"><Mail size={18} /><h3 className="text-[11px] font-black uppercase tracking-widest">Editor de Conteúdo</h3></div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group bg-gray-50 px-4 py-2 rounded-full text-[9px] font-black text-gray-400 uppercase">
                      Receber cópia
                      <input type="checkbox" checked={enviarCopia} onChange={() => setEnviarCopia(!enviarCopia)} className="sr-only peer" />
                      <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 transition-all peer-checked:after:translate-x-3"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-6 flex-grow flex flex-col">
                <input 
                  name="Titulo_do_Artigo" 
                  required 
                  placeholder="Título do seu artigo..." 
                  className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-2xl placeholder:text-gray-400" 
                />
                
                <div className="relative">
                  <select 
                    name="Categoria" 
                    className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-8 pr-14 text-sm font-bold text-gray-500 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-blue-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3D%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_1.5rem_center] bg-no-repeat transition-all"
                  >
                    <option value="" disabled selected className="text-gray-400">Escolha uma categoria...</option>
                    <option>Gestão</option>
                    <option>Estratégia</option>
                    <option>Tributário</option>
                    <option>Mentalidade</option>
                    <option>Tecnologia</option>
                  </select>
                </div>

                <textarea 
                  name="Conteudo_Completo" 
                  required 
                  placeholder="Desenvolva seu conhecimento aqui..." 
                  className="w-full flex-grow bg-gray-50 border-none rounded-[2rem] p-8 text-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none font-medium text-gray-700 shadow-inner min-h-[400px] placeholder:text-gray-400"
                ></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-blue-700 flex items-center justify-center gap-3 shadow-xl">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {loading ? "Enviando..." : "Publicar Artigo"}
              </button>
            </form>
          )}
        </div>

        {/* SIDEBAR (DIREITA) */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full">
          {/* CARD CREDIBILIDADE - Agora condicional ao login */}
          {user && (
            <div className="bg-gray-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex flex-col justify-center h-full">
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
          )}
          
          {/* CARD DIRETRIZES E IMPACTO */}
          {user && (
            <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex-grow flex flex-col justify-between">
                <div>
                <div className="flex items-center gap-3 mb-8">
                    <ShieldCheck className="text-emerald-500" size={24} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Diretrizes de Publicação</h4>
                </div>
                <ul className="space-y-6">
                    {[
                    { title: "Conteúdo Autoral", desc: "Artigos devem ser originais e inéditos." },
                    { title: "Tom Técnico-Executivo", desc: "Foco em clareza, dados e aplicabilidade." },
                    { title: "Revisão Nucleo", desc: "O texto passará por curadoria antes de ir ao ar." }
                    ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0"></div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    </li>
                    ))}
                </ul>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="text-blue-500" size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Impacto na Rede</h4>
                </div>
                <div className="bg-blue-50/40 border-l-4 border-blue-600 p-6 rounded-r-3xl transition-all hover:bg-blue-50/60">
                    <p className="text-blue-900 font-bold text-xs md:text-sm text-center leading-relaxed italic">
                    "Sua trajetória inspira pessoas, transformando conhecimento humano em um legado poderoso que conecta, guia e fortalece toda a nossa comunidade."
                    </p>
                </div>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* LINHA DIVISÓRIA "CONECTE-SE" */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM */}
      <div className="flex flex-col items-center text-center">
        <div className="max-w-3xl mb-12">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <br className="md:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
          </p>
        </div>
        
        <a 
          href="https://www.instagram.com/nucleobase.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
            <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[2.2rem] md:rounded-[2.5rem] flex items-center justify-center text-white shadow-xl relative z-10 group-hover:rotate-6 transition-all duration-500">
              <Instagram className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
            <div className="h-1 w-0 bg-pink-500 mt-2 group-hover:w-full transition-all duration-500 rounded-full"></div>
          </div>
        </a>
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