"use client";
import React from "react";
import { 
  Zap, ShieldCheck, BarChart3, ShoppingCart, 
  CheckCircle2, Info, Star, TrendingUp, Gem 
} from "lucide-react";

export default function PaginaDePlanos() {
  
  const CheckoutForm = ({ 
    lookupKey, 
    label, 
    className, 
    description 
  }: { 
    lookupKey: string, 
    label: string, 
    className?: string,
    description: string 
  }) => (
    <form action="/api/stripe" method="POST" className="w-full">
      <input type="hidden" name="lookup_key" value={lookupKey} />
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
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER - PADRONIZADO COM O MODELO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Planos e Assinaturas<span className="text-blue-600">.</span></span>
            <ShoppingCart size={60} className="text-blue-600 opacity-35 ml-4" strokeWidth={1.2} />
          </h1>
          <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed mt-0">
            Escolha o nível de controle que sua jornada financeira precisa.
          </h2>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Níveis de Acesso <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* BANNER DE DESCONTO - LARGURA TOTAL */}
      <div className="mb-10 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 ml-2">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <TrendingUp size={24} />
          </div>
          <p className="text-base text-gray-700 font-medium">
            Incentivamos sua disciplina de longo prazo: garanta até <span className="text-blue-600 font-bold underline decoration-blue-200 underline-offset-4">24% de economia</span> nos ciclos estendidos.
          </p>
        </div>
      </div>

      {/* GRID DE PLANOS - EXPANSIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LADO ESQUERDO: EXPERIÊNCIA (Ocupa 4/12) */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-blue-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-xl shadow-blue-900/20 h-full flex flex-col justify-between group transition-all hover:scale-[1.01]">
            <div className="relative z-10">
              <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <Star className="text-white fill-white" size={32} />
              </div>
              <h3 className="text-4xl font-bold mb-6 tracking-tight">14 Dias de Experiência</h3>
              <p className="text-blue-100 text-lg leading-relaxed mb-8 opacity-90">
                Inicie sua jornada com <strong className="text-white">acesso completo e gratuito</strong> para entender o poder da gestão consciente.
              </p>
              <ul className="space-y-5 text-base font-bold mb-10">
                <li className="flex items-center gap-4"><CheckCircle2 size={20} className="text-blue-300" /> Registro ilimitado</li>
                <li className="flex items-center gap-4"><CheckCircle2 size={20} className="text-blue-300" /> Painel de indicadores</li>
                <li className="flex items-center gap-4"><CheckCircle2 size={20} className="text-blue-300" /> Suporte prioritário</li>
              </ul>

              {/* AJUSTE SOLICITADO: BOTÃO DE ASSINATURA GRATUITA */}
              <a href="/cadastro" className="block w-full decoration-transparent mb-8">
                <button className="w-full py-5 bg-white text-blue-600 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-lg active:scale-[0.98]">
                  Assine gratuitamente
                </button>
              </a>
            </div>
            
            <div className="relative z-10 pt-8 border-t border-white/10 flex items-center gap-3">
              <Info size={18} className="text-blue-200" />
              <p className="text-[12px] text-blue-200 uppercase tracking-widest font-black">Sem cobrança prévia</p>
            </div>
            
            <Zap size={300} className="absolute -right-24 -bottom-24 text-white opacity-10 -rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-1000" />
          </div>
        </div>

        {/* LADO DIREITO: OS PLANOS (Ocupa 8/12) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* PLANO ESSENCIAL */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm hover:shadow-xl transition-all flex flex-col h-full border-b-4 border-b-transparent hover:border-b-blue-600">
            <div className="mb-10">
              <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] mb-3 block">Ideal para começar</span>
              <h3 className="text-4xl font-bold text-gray-900 tracking-tight">Essencial</h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">R$ 9,90</span>
                <span className="text-gray-400 text-base font-bold uppercase tracking-widest">/mês</span>
              </div>
            </div>

            <div className="space-y-5 mb-12 flex-grow">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-1 rounded-lg">
                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                </div>
                <p className="text-base text-gray-600 font-medium">Registro <strong className="text-gray-900">ilimitado</strong> de dados</p>
              </div>
            </div>

            <CheckoutForm 
              lookupKey="essencial_mensal" 
              label="Assinar Essencial Mensal" 
              description="Finalizar assinatura: Plano Essencial Mensal"
              className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-black shadow-xl shadow-gray-200 text-center"
            />
            
            <div className="mt-8 pt-8 border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 text-center tracking-widest">Economize com Ciclos Longos:</p>
                <div className="grid grid-cols-3 gap-3">
                    <CheckoutForm lookupKey="essencial_trimestral" label="Trim." description="Assinar: Essencial Trimestral (R$ 26,90)" className="w-full p-3 bg-gray-50 rounded-xl text-[10px] text-blue-600 font-bold hover:bg-gray-100 transition-colors" />
                    <CheckoutForm lookupKey="essencial_semestral" label="Semest." description="Assinar: Essencial Semestral (R$ 49,90)" className="w-full p-3 bg-gray-50 rounded-xl text-[10px] text-blue-600 font-bold hover:bg-gray-100 transition-colors" />
                    <CheckoutForm lookupKey="essencial_anual" label="Anual" description="Assinar: Essencial Anual (R$ 89,90)" className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-600 font-bold hover:bg-blue-100 transition-colors" />
                </div>
            </div>
          </div>

          {/* PLANO PRO */}
          <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-10 shadow-2xl flex flex-col relative overflow-hidden group h-full transition-all hover:scale-[1.01]">
            <div className="relative z-10 mb-10 flex-grow">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest animate-pulse">Mais Escolhido</span>
                <Gem className="text-blue-500 group-hover:scale-110 transition-transform" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-white tracking-tight">Plano Pro</h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">R$ 19,90</span>
                <span className="text-gray-500 text-base font-bold uppercase tracking-widest">/mês</span>
              </div>
            </div>

            <CheckoutForm 
              lookupKey="pro_mensal" 
              label="Assinar Plano Pro Mensal" 
              description="Finalizar assinatura: Plano Pro Mensal"
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 shadow-lg shadow-blue-900/40 relative z-10 text-center"
            />

            <div className="mt-8 pt-8 border-t border-white/10 relative z-10 text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Ciclos de Performance:</p>
                <div className="grid grid-cols-3 gap-3">
                    <CheckoutForm lookupKey="pro_trimestral" label="Trim." description="Assinar: Pro Trimestral (R$ 53,90)" className="w-full p-3 bg-white/5 rounded-xl text-[10px] text-blue-400 font-bold hover:bg-white/10 transition-colors" />
                    <CheckoutForm lookupKey="pro_semestral" label="Semest." description="Assinar: Pro Semestral (R$ 99,90)" className="w-full p-3 bg-white/5 rounded-xl text-[10px] text-blue-400 font-bold hover:bg-white/10 transition-colors" />
                    <CheckoutForm lookupKey="pro_anual" label="Anual" description="Assinar: Pro Anual (R$ 179,90)" className="w-full p-3 bg-blue-600/20 border border-blue-600/30 rounded-xl text-[10px] text-blue-400 font-bold hover:bg-blue-600/40 transition-colors" />
                </div>
            </div>
            
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700"></div>
          </div>
        </div>
      </div>
      
      {/* FOOTER DE DIFERENCIAIS - LARGURA TOTAL */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
          <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h5 className="font-black text-gray-900 text-base uppercase tracking-tight">Criptografia Base</h5>
            <p className="text-sm text-gray-500 font-medium">Privacidade total dos seus dados.</p>
          </div>
        </div>
        <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
          <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors">
            <BarChart3 size={32} />
          </div>
          <div>
            <h5 className="font-black text-gray-900 text-base uppercase tracking-tight">Gestão Estratégica</h5>
            <p className="text-sm text-gray-500 font-medium">Análise real de patrimônio.</p>
          </div>
        </div>
        <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
          <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h5 className="font-black text-gray-900 text-base uppercase tracking-tight">Fidelidade Zero</h5>
            <p className="text-sm text-gray-500 font-medium">Cancele quando desejar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}