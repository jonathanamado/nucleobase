"use client";
import React from "react";
import { 
  Zap, ShieldCheck, BarChart3, ShoppingCart, 
  CheckCircle2, Info, Star, TrendingUp, Gem 
} from "lucide-react";

export default function PaginaDePlanos() {
  
  // Função auxiliar para renderizar o formulário de checkout com UX aprimorada
  const CheckoutForm = ({ 
    lookupKey, 
    label, 
    className, 
    description 
  }: { 
    lookupKey: string, 
    label: string, 
    className?: string,
    description: string // Nome que aparecerá no canto inferior do navegador
  }) => (
    <form action="/api/stripe" method="POST" className="w-full">
      <input type="hidden" name="lookup_key" value={lookupKey} />
      {/* O <a> envolve o botão apenas para disparar o comportamento nativo de mostrar o link no rodapé do browser */}
      <a href={`#checkout-${lookupKey}`} title={description} className="block w-full cursor-pointer decoration-transparent">
        <button 
          type="submit" 
          className={`${className} cursor-pointer transition-transform active:scale-[0.98]`}
        >
          {label}
        </button>
      </a>
    </form>
  );

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="mb-6 mt-0">
        <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight flex items-center">
          <span>Planos e Assinaturas<span className="text-blue-600">.</span></span>
          <ShoppingCart size={55} className="text-blue-600 opacity-25 ml-4" strokeWidth={1.5} />
        </h1>
        <h2 className="text-gray-500 text-lg max-w-2xl">
          Escolha o nível de controle que sua jornada financeira precisa.
        </h2>
      </div>

      {/* BANNER DE DESCONTO */}
      <div className="mb-10 bg-blue-50/50 border border-blue-100 rounded-[2rem] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 ml-4">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm text-gray-700 font-medium">
            Incentivamos sua disciplina de longo prazo: garanta até <span className="text-blue-600 font-bold">24% de economia</span> nos ciclos estendidos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LADO ESQUERDO: EXPERIÊNCIA */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-xl shadow-blue-100 h-full flex flex-col">
            <div className="relative z-10 flex-grow">
              <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                <Star className="text-white fill-white" size={28} />
              </div>
              <h3 className="text-3xl font-bold mb-6">14 Dias de Experiência</h3>
              <p className="text-blue-100 text-base leading-relaxed mb-8">
                Inicie sua jornada com <strong>acesso completo e gratuito</strong>.
              </p>
              <ul className="space-y-4 text-sm font-medium mb-8">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-300" /> Registro ilimitado</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-300" /> Painel de indicadores</li>
              </ul>
            </div>
            <div className="relative z-10 pt-6 border-t border-white/10 flex items-center gap-3">
              <Info size={16} className="text-blue-200" />
              <p className="text-[11px] text-blue-200 uppercase tracking-widest font-black">Sem cobrança prévia</p>
            </div>
            <Zap size={220} className="absolute -right-20 -bottom-20 text-white opacity-10 -rotate-12" />
          </div>
        </div>

        {/* LADO DIREITO: OS PLANOS */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* PLANO ESSENCIAL */}
          <div className="bg-white border border-gray-200 rounded-[3rem] p-8 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="mb-6">
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-2 block">Ideal para começar</span>
              <h3 className="text-3xl font-bold text-gray-900">Essencial</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">R$ 9,90</span>
                <span className="text-gray-400 text-sm font-bold">/mês</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">Registro <strong>ilimitado</strong></p>
              </div>
            </div>

            <CheckoutForm 
              lookupKey="essencial_mensal" 
              label="Assinar Essencial Mensal" 
              description="Finalizar assinatura: Plano Essencial Mensal"
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-gray-800 shadow-lg text-center"
            />
            
            <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 text-center">Planos com Desconto:</p>
                <div className="grid grid-cols-3 gap-2">
                    <CheckoutForm lookupKey="essencial_trimestral" label="Trim." description="Assinar: Essencial Trimestral (R$ 26,90)" className="w-full p-2 bg-gray-50 rounded-xl text-[10px] text-blue-600 font-bold hover:bg-gray-100" />
                    <CheckoutForm lookupKey="essencial_semestral" label="Semest." description="Assinar: Essencial Semestral (R$ 49,90)" className="w-full p-2 bg-gray-50 rounded-xl text-[10px] text-blue-600 font-bold hover:bg-gray-100" />
                    <CheckoutForm lookupKey="essencial_anual" label="Anual" description="Assinar: Essencial Anual (R$ 89,90)" className="w-full p-2 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-600 font-bold hover:bg-blue-100" />
                </div>
            </div>
          </div>

          {/* PLANO PRO */}
          <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-8 shadow-2xl flex flex-col relative overflow-hidden group h-full">
            <div className="relative z-10 mb-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Mais Escolhido</span>
                <Gem className="text-blue-500" size={24} />
              </div>
              <h3 className="text-3xl font-bold text-white">Plano Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">R$ 19,90</span>
                <span className="text-gray-500 text-sm font-bold">/mês</span>
              </div>
            </div>

            <CheckoutForm 
              lookupKey="pro_mensal" 
              label="Assinar Plano Pro Mensal" 
              description="Finalizar assinatura: Plano Pro Mensal"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 shadow-lg shadow-blue-900/40 relative z-10 text-center"
            />

            <div className="mt-6 pt-6 border-t border-white/10 relative z-10 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">Ciclos de Performance:</p>
                <div className="grid grid-cols-3 gap-2">
                    <CheckoutForm lookupKey="pro_trimestral" label="Trim." description="Assinar: Pro Trimestral (R$ 53,90)" className="w-full p-2 bg-white/5 rounded-xl text-[10px] text-blue-400 font-bold hover:bg-white/10" />
                    <CheckoutForm lookupKey="pro_semestral" label="Semest." description="Assinar: Pro Semestral (R$ 99,90)" className="w-full p-2 bg-white/5 rounded-xl text-[10px] text-blue-400 font-bold hover:bg-white/10" />
                    <CheckoutForm lookupKey="pro_anual" label="Anual" description="Assinar: Pro Anual (R$ 179,90)" className="w-full p-2 bg-blue-600/20 border border-blue-600/30 rounded-xl text-[10px] text-blue-400 font-bold hover:bg-blue-600/40" />
                </div>
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
          </div>
        </div>
      </div>
      
      {/* FOOTER */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <ShieldCheck className="text-blue-600" size={32} />
          <div>
            <h5 className="font-bold text-gray-900 text-sm">Criptografia Base</h5>
            <p className="text-xs text-gray-500">Privacidade total dos seus dados.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <BarChart3 className="text-blue-600" size={32} />
          <div>
            <h5 className="font-bold text-gray-900 text-sm">Gestão Estratégica</h5>
            <p className="text-xs text-gray-500">Análise real de patrimônio.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <CheckCircle2 className="text-blue-600" size={32} />
          <div>
            <h5 className="font-bold text-gray-900 text-sm">Fidelidade Zero</h5>
            <p className="text-xs text-gray-500">Cancele quando desejar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}