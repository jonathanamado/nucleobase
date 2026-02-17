"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Send, CheckCircle2, Loader2, Sparkles, Unlock, Briefcase, Lock, Mail, Clock, FileText, ChevronRight } from "lucide-react";

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
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
        updateUserState(session.user);
      }
      setIsMontado(true);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        updateUserState(session.user);
      } else {
        setUser(null);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const updateUserState = (supabaseUser: any) => {
    setUser({
      nome: supabaseUser.user_metadata?.full_name || supabaseUser.email,
      email: supabaseUser.email,
      id: supabaseUser.id
    });
    setEmail(supabaseUser.email || "");
  };

  // FUNÇÃO DE AUTENTICAÇÃO COM LÓGICA DE INDICAÇÃO INTEGRADA
  const handleAuthRapido = async () => {
    if (!nome || !email || !senha) {
      alert("Preencha os campos para liberar.");
      return;
    }
    setAuthLoading(true);

    // 1. Cadastro no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { full_name: nome } }
    });

    if (authError) {
      alert("Erro na autenticação: " + authError.message);
      setAuthLoading(false);
      return;
    }

    // 2. Lógica de Indicação e Perfil
    if (authData.user) {
      // Registrar na tabela de indicações se houver um ID no LocalStorage
      const indicadorId = localStorage.getItem("nucleobase_referral_id");
      
      if (indicadorId && indicadorId !== authData.user.id) {
        try {
          await supabase.from("indicacoes").insert([
            {
              indicador_id: indicadorId,
              indicado_id: authData.user.id,
              status: 'pendente'
            }
          ]);
          localStorage.removeItem("nucleobase_referral_id");
        } catch (err) {
          console.error("Erro ao processar indicação:", err);
        }
      }

      // Criar perfil básico (Opcional, mas recomendado para consistência)
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: email,
        nome_completo: nome,
        plan_type: 'free'
      });
    }

    setAuthLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const tituloArtigo = formData.get("Titulo_do_Artigo") as string;
    const categoriaArtigo = formData.get("Categoria") as string;
    const autorSocial = formData.get("Autor_Social") as string;
    const autorWebsite = formData.get("Autor_Website") as string;
    const autorAtuacao = formData.get("Autor_Atuacao") as string;

    formData.append("access_key", "9ef5a274-150a-4664-a885-0b052efd06f7");
    formData.append("email_do_autor", user.email); 
    formData.append("nome_do_autor", user.nome);
    formData.append("enviar_copia", enviarCopia ? "Sim" : "Não");

    try {
      const { error: dbError } = await supabase
        .from("artigos_colaborativos")
        .insert([
          {
            user_id: user.id,
            titulo: tituloArtigo,
            categoria: categoriaArtigo,
            autor_social: autorSocial,
            autor_website: autorWebsite,
            autor_atuacao: autorAtuacao
          }
        ]);

      if (dbError) throw dbError;

      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: json
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setEnviado(true);
      } else {
        alert("Erro no servidor de envio.");
      }
    } catch (error) {
      console.error("Erro no envio:", error);
      alert("Erro ao processar envio.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMontado) return null;

  if (enviado) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-12 px-6 animate-in fade-in zoom-in duration-500 min-h-[85vh] text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Artigo enviado!</h1>
        <p className="text-gray-500 text-sm mb-10">Seu conteúdo foi entregue com sucesso à nossa curadoria.</p>
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-start justify-between bg-gray-50/50 border border-gray-100 rounded-2xl p-6 mb-8">
            <div className="flex flex-col items-center gap-2 flex-1"><Clock size={20} className="text-blue-500 mb-1" /><span className="text-[9px] font-bold uppercase text-gray-500 leading-tight">Análise</span></div>
            <ChevronRight size={14} className="text-gray-200 mt-1" />
            <div className="flex flex-col items-center gap-2 flex-1"><Mail size={20} className="text-purple-500 mb-1" /><span className="text-[9px] font-bold uppercase text-gray-500 leading-tight">Cópia e-mail</span></div>
            <ChevronRight size={14} className="text-gray-200 mt-1" />
            <div className="flex flex-col items-center gap-2 flex-1"><FileText size={20} className="text-emerald-500 mb-1" /><span className="text-[9px] font-bold uppercase text-gray-500 leading-tight">Publicação</span></div>
          </div>
        </div>
        <a href="/blog" className="mt-4 px-12 py-4 bg-gray-900 text-white rounded-full font-bold text-xs uppercase tracking-widest no-underline hover:bg-black">Voltar ao Blog</a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-20 mt-0 font-sans">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">Escreva para a Núcleo<span className="text-blue-600">.</span></h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!user ? (
          <div className="bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <Sparkles size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Identificação do Autor</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nome Completo</label><input value={nome} onChange={(e) => setNome(e.target.value)} type="text" placeholder="Nome para créditos" className="w-full bg-white border border-blue-100 rounded-xl py-3 px-5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition-all" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">E-mail</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" className="w-full bg-white border border-blue-100 rounded-xl py-3 px-5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition-all" /></div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Criar Senha</label>
                <div className="relative"><input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" placeholder="••••••" className="w-full bg-white border border-blue-100 rounded-xl py-3 px-5 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition-all" /><Lock size={12} className="absolute right-4 top-4 text-blue-200" /></div>
              </div>
            </div>
            <button type="button" onClick={handleAuthRapido} disabled={authLoading} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {authLoading ? <Loader2 className="animate-spin" size={14} /> : <Unlock size={14} />}
              {authLoading ? "Autenticando..." : "Liberar Envio"}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-[1.5rem] p-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">{user.nome?.charAt(0)}</div>
              <div><p className="text-[10px] font-black text-emerald-600 uppercase">Autor Conectado</p><p className="text-sm font-bold text-gray-900">{user.nome}</p></div>
            </div>
            <button type="button" onClick={() => supabase.auth.signOut()} className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase">Sair</button>
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2"><Briefcase size={16}/> Perfil do Autor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase ml-2">Instagram</label><input name="Autor_Social" type="text" placeholder="@seuuser" className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase ml-2">Web Site</label><input name="Autor_Website" type="text" placeholder="www.link.com" className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase ml-2">Atuação</label><input name="Autor_Atuacao" type="text" placeholder="Ex: Gestor" className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none" /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-400"><Mail size={16} /><h3 className="text-[10px] font-black uppercase">Conteúdo</h3></div>
            <label className="flex items-center gap-3 cursor-pointer group bg-gray-50 hover:bg-blue-50 px-4 py-2 rounded-full transition-all text-[9px] font-black text-gray-400 uppercase">
                Receber cópia no E-mail
                <input type="checkbox" checked={enviarCopia} onChange={() => setEnviarCopia(!enviarCopia)} className="sr-only peer" />
                <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3"></div>
            </label>
          </div>
          <div className="space-y-5">
            <input name="Titulo_do_Artigo" required type="text" placeholder="Título do artigo..." className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-5 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-lg" />
            <select name="Categoria" className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none">
                <option>Gestão</option><option>Estratégia</option><option>Tributário</option><option>Mentalidade</option><option>Tecnologia</option>
            </select>
            <textarea name="Conteudo_Completo" required placeholder="Escreva seu conhecimento..." className="w-full h-80 bg-gray-50 border-transparent rounded-xl p-6 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none"></textarea>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-5 bg-gray-900 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {loading ? "Enviando..." : user ? "Enviar Artigo" : "Identifique-se acima"}
        </button>
      </form>
    </div>
  );
}