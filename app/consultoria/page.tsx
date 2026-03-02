"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js"; 
import { 
  ShieldCheck, Target, Zap, LockKeyhole, Star, 
  LineChart, FileText, Crown, Lock, ArrowRight
} from "lucide-react";

export default function ConsultoriaPro() {
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('plan_type, is_subscribed')
            .eq('id', session.user.id)
            .single();

          if (profile && !error) {
            const planName = profile.plan_type?.toLowerCase() || "";
            if (planName.includes("pro") && profile.is_subscribed) {
              setIsPro(true);
            }
          }
        }
      } catch (err) {
        console.error("Erro na validação:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // FUNÇÃO PARA REGISTAR NO BANCO E ABRIR WHATSAPP
  const handleSolicitacao = async () => {
    try {
      setIsSubmitting(true);
      
      // Chama a função RPC que criamos no SQL
      const { error } = await supabase.rpc('registrar_solicitacao_consultoria');

      if (error) throw error;

      // Evento de Tracking
      window.dataLayer?.push({ event: "consultoria_registrada_db" });

      // Abre o WhatsApp numa nova aba
      window.open("https://wa.link/wc2pzb", "_blank");

    } catch (err) {
      console.error("Erro ao registar solicitação:", err);
      // Mesmo com erro no DB, abrimos o zap para não perder a conversão
      window.open("https://wa.link/wc2pzb", "_blank");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] animate-pulse">Sincronizando DNA Pro...</p>
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4 md:px-0">
        <div className="bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl min-h-[500px] flex flex-col items-center justify-center text-center">
          <Lock className="text-blue-500 mb-6 opacity-40" size={64} />
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Conteúdo Exclusivo <span className="text-blue-500">PRO</span></h2>
          <p className="text-gray-400 max-w-md mb-8 leading-relaxed">Disponível apenas para assinantes das modalidades Pro.</p>
          <a href="/planos" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center gap-3">
            Fazer upgrade para Pro <Crown size={16} />
          </a>
          <Zap size={300} className="absolute -right-24 -bottom-24 text-white opacity-5 -rotate-12 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Premium</span>
            <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Acompanhamento de Resultados</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Consultoria<span className="text-blue-600">.</span></span>
            <LineChart size={60} className="text-blue-600 skew-x-12 opacity-35 ml-4" strokeWidth={1.2} />
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ShieldCheck className="text-blue-600" /> Como funciona?
              </h3>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>Nossa equipe processa os seus dados para identificar gargalos e oportunidades de investimento.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="flex items-start gap-3 bg-gray-50 p-5 rounded-2xl">
                    <Target className="text-blue-600 shrink-0" size={20} />
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Metas de Longo Prazo</span>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 p-5 rounded-2xl">
                    <FileText className="text-blue-600 shrink-0" size={20} />
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Saúde Patrimonial</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
              <Zap className="absolute -right-10 -top-10 text-white opacity-10" size={150} />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-blue-200">Ação Necessária</p>
              <h4 className="text-2xl font-bold mb-6">Iniciar diagnóstico financeiro?</h4>
              <button 
                onClick={handleSolicitacao}
                disabled={isSubmitting}
                className="w-full md:w-auto bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center justify-center gap-4 shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "A registar..." : "Solicitar Consultoria Agora"} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-gray-900 p-10 rounded-[2.5rem] group relative overflow-hidden flex-1 flex flex-col justify-center text-white">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/40">
                <Star size={30} fill="white" className="text-white" />
              </div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Sua Conta</p>
              <h4 className="text-white text-3xl font-bold mb-6 tracking-tight">Acesso Liberado.</h4>
              <div className="space-y-4 border-t border-white/10 pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Análises</span>
                  <span className="font-bold">01 mensal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Resposta</span>
                  <span className="font-bold">48h úteis</span>
                </div>
              </div>
            </div>
            <LockKeyhole size={200} className="absolute -right-20 -bottom-20 text-blue-500 opacity-5 -rotate-12 pointer-events-none group-hover:rotate-0 transition-all duration-1000" />
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
            <div className="w-14 h-14 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-lg mb-1 tracking-tight">Sigilo Absoluto</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed font-medium tracking-tight">Dados protegidos por criptografia.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}