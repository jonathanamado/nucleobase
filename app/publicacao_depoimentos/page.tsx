"use client";
import React, { useState, useEffect } from "react";
import { Star, Send, ArrowLeft, CheckCircle2, Loader2, Lock, LogIn } from "lucide-react";
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
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relato enviado!</h1>
        <p className="text-gray-500 text-base mb-6 font-medium max-w-md">Sua experiência já está visível para a comunidade.</p>
        <a href="/depoimentos" className="px-8 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all">
          Voltar para Depoimentos
        </a>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto px-4 pt-0 ${!user ? "max-w-md" : "max-w-2xl"}`}>
      <div className="mt-0 pt-1">
        <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight leading-none">
          Sua Voz<span className="text-blue-600">.</span>
        </h1>
        <h2 className="text-gray-400 text-base mb-4 font-bold leading-tight">
          {user ? "Compartilhe sua percepção." : "Entre para publicar."}
        </h2>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm relative overflow-hidden transition-all">
        
        {!user ? (
          <form onSubmit={handleInlineLogin} className="flex flex-col animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <Lock size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Acesso Restrito</h3>
            </div>

            <div className="space-y-2 mb-4">
              <input 
                type="email" 
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-transparent rounded-xl py-2.5 px-4 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                required
              />
              <input 
                type="password" 
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-transparent rounded-xl py-2.5 px-4 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <button 
                type="submit" 
                disabled={loginLoading}
                className="w-full bg-gray-900 text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                {loginLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                {loginLoading ? "Entrando..." : "Entrar e Publicar"}
              </button>
              <a href="/cadastro" className="text-center text-[10px] font-bold text-blue-600 hover:underline">
                Não tem conta? Cadastre-se
              </a>
            </div>
          </form>
        ) : (
          /* FORMULÁRIO DE DEPOIMENTO COMPACTADO */
          <div className="animate-in fade-in duration-700">
            <div className="mb-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">
                Nota da experiência
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <Star 
                      size={28} 
                      className={`transition-colors ${
                        star <= (hover || rating) ? "fill-orange-400 text-orange-400" : "text-gray-200"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">
                Seu Depoimento
              </label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Conte-nos sua experiência..."
                className="w-full h-28 bg-gray-50 border-transparent rounded-2xl p-4 text-gray-700 text-base focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none shadow-inner"
              ></textarea>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSubmitDepoimento}
                disabled={loading}
                className="flex-[2] bg-gray-900 text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-gray-200"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? "Publicando..." : "Publicar"}
              </button>
              <a href="/depoimentos" className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-400 rounded-full hover:text-blue-600 hover:bg-blue-50 transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Voltar
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}