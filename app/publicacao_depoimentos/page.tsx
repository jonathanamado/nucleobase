"use client";
import React, { useState, useEffect } from "react";
import { 
  Star, Send, ArrowLeft, CheckCircle2, 
  Loader2, Lock, LogIn, Quote, MessageSquareQuote 
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function PublicacaoDepoimentos() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setCheckingAuth(false);
  }

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await checkUser();
    } catch (error: any) {
      alert("Erro ao entrar: " + error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSubmitDepoimento = async () => {
    if (rating === 0) return alert("Por favor, selecione uma nota.");
    if (content.length < 10) return alert("O depoimento deve ter pelo menos 10 caracteres.");

    setLoading(true);
    try {
      if (!user) throw new Error("Você precisa estar logado.");
      const { error: insertError } = await supabase
        .from("depoimentos")
        .insert([{ 
          user_id: user.id, 
          rating, 
          content,
          status: "aprovado" 
        }]);
      if (insertError) throw insertError;
      setEnviado(true);
    } catch (error: any) {
      alert(error.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Experiência Registrada!</h1>
        <p className="text-gray-500 text-lg mb-10 font-medium max-w-md italic">
          "Obrigado por contribuir. Sua voz ajuda a moldar o futuro da Nucleobase."
        </p>
        <a href="/depoimentos" className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl">
          Voltar para a Comunidade
        </a>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 ${!user ? "max-w-md" : "max-w-3xl"}`}>
      
      {/* HEADER DINÂMICO */}
      <div className="mb-10 text-left relative">
        <div className="flex items-center gap-2 text-blue-600 mb-3">
            <Quote size={16} className="fill-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Feedback Loop</span>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2 tracking-tight leading-none flex items-center">
          Sua Voz<span className="text-blue-600">.</span>
          <MessageSquareQuote size={60} className="text-blue-600 opacity-20 ml-6 -rotate-12" strokeWidth={1} />
        </h1>
        <p className="text-gray-500 text-xl font-medium">
          {user ? "Sua percepção é o nosso ouro. Compartilhe seu relato." : "Conecte-se para autenticar seu relato."}
        </p>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 p-8 md:p-12 shadow-2xl shadow-blue-900/5 relative overflow-hidden transition-all">
        
        {!user ? (
          <form onSubmit={handleInlineLogin} className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Acesso de Membro</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Segurança Nucleobase</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200"
            >
              {loginLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {loginLoading ? "Sincronizando..." : "Entrar e Publicar"}
            </button>
            
            <a href="/cadastro" className="text-center mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
              Ainda não faz parte? Criar conta
            </a>
          </form>
        ) : (
          /* FORMULÁRIO DE DEPOIMENTO */
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="mb-8">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-4">
                Qual nota você nos daria?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transform transition-transform active:scale-90"
                  >
                    <Star 
                      size={42} 
                      className={`transition-all duration-300 ${
                        star <= (hover || rating) 
                          ? "fill-orange-400 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.4)]" 
                          : "text-gray-100"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-4">
                Seu Relato
              </label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Como a Nucleobase mudou sua gestão hoje?"
                className="w-full h-44 bg-gray-50 border-none rounded-[2rem] p-8 text-gray-700 text-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none shadow-inner font-medium italic"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={handleSubmitDepoimento}
                disabled={loading}
                className="w-full sm:flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-blue-100"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? "Processando..." : "Publicar Experiência"}
              </button>
              <a href="/depoimentos" className="w-full sm:flex-1 px-8 py-5 border border-gray-100 text-gray-400 rounded-2xl hover:text-gray-900 hover:bg-gray-50 transition-all font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                <ArrowLeft size={16} /> Cancelar
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
          Transparência & Comunidade • Nucleobase 2026
        </p>
      </div>
    </div>
  );
}