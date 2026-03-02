"use client";
import React, { useState } from "react";
import { 
  Zap, ShieldCheck, BarChart3, ShoppingCart, 
  CheckCircle2, Info, Star, TrendingUp, Gem,
  QrCode, X, Copy, Check, MessageCircle
} from "lucide-react";

export default function PaginaDePlanos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, qrCode: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const PIX_KEY = "contato@nucleobase.app";
  const WHATSAPP_LINK_ID = "q46hkm"; // Extraído do link https://wa.link/q46hkm

  const openPixModal = (name: string, price: string, qrCode: string) => {
    setSelectedPlan({ name, price, qrCode });
    setIsModalOpen(true);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendProof = () => {
    const message = encodeURIComponent(`Olá! Realizei o pagamento via PIX do plano ${selectedPlan?.name} (${selectedPlan?.price}). Segue o comprovante em anexo.`);
    window.open(`https://wa.link/${WHATSAPP_LINK_ID}?text=${message}`, '_blank');
  };

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
      
      {/* MODAL PIX INTEGRADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <div className="p-8 flex flex-col items-center text-center">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-6">
                <QrCode size={40} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pagamento via PIX</h3>
              <p className="text-gray-500 mb-6">
                Plano <span className="font-bold text-blue-600">{selectedPlan?.name}</span> por <span className="font-bold text-gray-900">{selectedPlan?.price}</span>
              </p>

              <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner border border-gray-100">
                 <img 
                    src={`/${selectedPlan?.qrCode}`} 
                    alt="QR Code Pix" 
                    className="w-48 h-48 object-contain"
                 />
              </div>

              <div className="w-full space-y-3">
                <div className="relative group">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Chave E-mail:</p>
                    <button 
                        onClick={handleCopyPix}
                        className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-700 rounded-2xl font-mono text-sm flex items-center justify-center gap-3 hover:border-blue-400 hover:bg-white transition-all active:scale-95"
                    >
                        {PIX_KEY}
                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-400" />}
                    </button>
                </div>

                <button 
                  onClick={handleSendProof}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                >
                  <MessageCircle size={20} />
                  Enviar Comprovante
                </button>

                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest pt-2">
                  A liberação ocorre após validação manual.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
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

      {/* BANNER DE DESCONTO */}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
      {/* LADO ESQUERDO: EXPERIÊNCIA */}
        <a href="/cadastro" className="lg:col-span-4 h-full block group decoration-transparent">
          <div className="bg-blue-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-xl shadow-blue-900/20 h-full flex flex-col justify-between transition-all hover:scale-[1.01] cursor-pointer">
            <div className="relative z-10">
              <div className="flex flex-col items-center mb-6 relative">
                {/* ESTRELA REPOSICIONADA MAIS À ESQUERDA E ACIMA */}
                <Star className="text-white fill-white group-hover:scale-110 transition-transform shrink-0 absolute -top-4 -left-4" size={32} />
                
                {/* TEXTOS CENTRALIZADOS */}
                <div className="flex flex-col gap-1 w-full items-center text-center">
                  <span className="text-blue-200 text-[11px] font-black uppercase tracking-[0.2em] block">
                    Conheça e valide.
                  </span>
                  <div className="bg-white/10 border border-white/20 text-white text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest min-h-[3.5rem] flex items-center justify-center w-full max-w-[280px]">
                    Cadastre-se aqui
                  </div>
                </div>
              </div>
              
              <h3 className="text-4xl font-bold mb-6 tracking-tight">14 Dias de Experiência</h3>
              <p className="text-blue-100 text-lg leading-relaxed mb-8 opacity-90">
                Inicie sua jornada com <strong className="text-white">acesso completo e gratuito</strong> para entender o poder da gestão consciente.
              </p>
              <ul className="space-y-5 text-base font-bold mb-10">
                <li className="flex items-center gap-4"><CheckCircle2 size={20} className="text-blue-300" /> Registros ilimitados</li>
                <li className="flex items-center gap-4"><CheckCircle2 size={20} className="text-blue-300" /> Painel de Resultados</li>
                <li className="flex items-center gap-4"><CheckCircle2 size={20} className="text-blue-300" /> Lançamentos online</li>
              </ul>

              <div className="w-full mb-8">
                <button className="w-full py-5 bg-blue-600 text-white border border-blue-400/30 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] text-center">
                  Cadastre-se gratuitamente. Teste todas as funções.
                </button>
                <p className="text-center text-blue-200/70 text-sm mt-4 font-medium italic">
                  Teste a plataforma sem restrições. Experimente e assine.
                </p>
              </div>
            </div>
            
            <div className="relative z-10 pt-8 border-t border-white/10">
              <p className="text-[10px] font-black text-blue-200/60 uppercase mb-4 text-center tracking-widest">Conheça</p>
              <div className="flex items-center gap-3 justify-center">
                <Info size={18} className="text-blue-200" />
                <p className="text-[12px] text-blue-200 uppercase tracking-widest font-black">Sem cobrança prévia</p>
              </div>
            </div>
            
            <Zap size={300} className="absolute -right-24 -bottom-24 text-white opacity-10 -rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-1000" />
          </div>
        </a>

        {/* LADO DIREITO: OS PLANOS */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* PLANO ESSENCIAL */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm hover:shadow-xl transition-all flex flex-col h-full border-b-4 border-b-transparent hover:border-b-blue-600 group">
            <div className="mb-10">
              <div className="flex justify-between items-start mb-6">
                <div className="relative flex w-full items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest min-h-[3.5rem] text-center">
                  Econômico.<br />Funcional.
                  <ShieldCheck className="text-blue-600 absolute right-5" size={24} />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 tracking-tight">Essencial</h3>
              <div className="mt-6 flex flex-col">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">R$ 9,90</span>
                <span className="text-gray-400 text-base font-bold uppercase tracking-widest mt-1">/Mês (Cartão ou PIX)</span>
              </div>
            </div>

            <div className="space-y-5 mb-12 flex-grow">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-1 rounded-lg">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                </div>
                <p className="text-base text-gray-600 font-medium">Registro <strong className="text-gray-900">ilimitado</strong> de dados</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-1 rounded-lg">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                </div>
                <p className="text-base text-gray-600 font-medium">Importação via tela</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-1 rounded-lg">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                </div>
                <p className="text-base text-gray-600 font-medium">Painel de Resultados</p>
              </div>
              
              <div className="pt-4 text-center">
                <p className="text-sm text-gray-400 font-medium italic">
                  Neste plano você desbloqueia ótimas funções para controle no seu dia a dia.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* AJUSTE: CONTAINER EM VOLTA DO CARTÃO */}
              <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Pagamento via Cartão</p>
                <CheckoutForm 
                  lookupKey="essencial_mensal" 
                  label="Assinar Essencial Mensal" 
                  description="Finalizar assinatura: Plano Essencial Mensal"
                  className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-black shadow-xl shadow-gray-200 text-center"
                />
                
                {/* BLOCO DE CICLOS LONGOS - COPIAR E COLAR ESTE TRECHO NO LUGAR DO ANTERIOR */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-300 uppercase mb-4 text-center tracking-widest">
                        Ciclos Longos Essencial:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <CheckoutForm 
                            lookupKey="essencial_trimestral" 
                            label="Trim." 
                            description="Assinar: Essencial Trimestral (R$ 26,90)" 
                            className="w-full h-10 flex items-center justify-center bg-white rounded-xl text-[9px] text-blue-600 font-bold hover:bg-gray-100 transition-colors border border-gray-100 px-1 text-center" 
                        />
                        <CheckoutForm 
                            lookupKey="essencial_semestral" 
                            label="Semest." 
                            description="Assinar: Essencial Semestral (R$ 49,90)" 
                            className="w-full h-10 flex items-center justify-center bg-white rounded-xl text-[9px] text-blue-600 font-bold hover:bg-gray-100 transition-colors border border-gray-100 px-1 text-center" 
                        />
                        <CheckoutForm 
                            lookupKey="essencial_anual" 
                            label="Anual" 
                            description="Assinar: Essencial Anual (R$ 89,90)" 
                            className="w-full h-10 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-xl text-[9px] text-blue-600 font-bold hover:bg-blue-100 transition-colors px-1 text-center" 
                        />
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-gray-100 flex-1"></div>
                <span className="text-[9px] font-black text-gray-300 uppercase">Ou se preferir</span>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>

              <button onClick={() => openPixModal("Essencial", "R$ 9,90", "nucleo-chave-essencial.png")} className="w-full p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center group/pix transition-all hover:border-blue-300 hover:bg-white text-center">
                <div className="bg-white p-2 rounded-lg shadow-sm text-gray-400 group-hover/pix:text-blue-600 transition-colors mb-2">
                  <QrCode size={20} />
                </div>
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Pagamento via PIX</p>
                <p className="text-[10px] text-gray-400 font-medium">Liberação manual assistida</p>
              </button>
            </div>
          </div>

          {/* PLANO PRO */}
          <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-10 shadow-2xl flex flex-col relative overflow-hidden group h-full transition-all hover:scale-[1.01]">
            <div className="relative z-10 mb-10 flex-grow">
              <div className="flex justify-between items-start mb-6">
                <div className="relative flex w-full items-center justify-center bg-blue-600 text-white text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest animate-pulse min-h-[3.5rem] text-center">
                  Melhor custo<br />x benefício.
                  <Gem className="text-white absolute right-5" size={24} />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white tracking-tight">Plano Pro</h3>
              <div className="mt-6 flex flex-col">
                <span className="text-5xl font-black text-white tracking-tighter">R$ 19,90</span>
                <span className="text-gray-500 text-base font-bold uppercase tracking-widest mt-1">/Mês (Cartão ou PIX)</span>
              </div>

              <div className="space-y-5 mt-10">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-1 rounded-lg">
                    <CheckCircle2 size={20} className="text-blue-400 shrink-0" />
                  </div>
                  <p className="text-base text-gray-300 font-medium">Registro <strong className="text-white">ilimitado</strong> de dados</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-1 rounded-lg">
                    <CheckCircle2 size={20} className="text-blue-400 shrink-0" />
                  </div>
                  <p className="text-base text-gray-300 font-medium">Importação via tela e arquivo</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-1 rounded-lg">
                    <CheckCircle2 size={20} className="text-blue-400 shrink-0" />
                  </div>
                  <p className="text-base text-gray-300 font-medium">Integração Contínua (D-1)</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-1 rounded-lg">
                    <CheckCircle2 size={20} className="text-blue-400 shrink-0" />
                  </div>
                  <p className="text-base text-gray-300 font-medium">Painel de Resultados</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-1 rounded-lg">
                    <CheckCircle2 size={20} className="text-blue-400 shrink-0" />
                  </div>
                  <p className="text-base text-gray-300 font-medium">Suporte prioritário</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              {/* AJUSTE: CONTAINER EM VOLTA DO CARTÃO */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pagamento via Cartão</p>
                <CheckoutForm 
                  lookupKey="pro_mensal" 
                  label="Assinar Plano Pro Mensal" 
                  description="Finalizar assinatura: Plano Pro Mensal"
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 shadow-lg shadow-blue-900/40 relative z-10 text-center"
                />

                {/* BLOCO DE CICLOS DE PERFORMANCE (PRO) - COPIAR E COLAR ESTE TRECHO NO LUGAR DO ANTERIOR */}
                <div className="mt-8 pt-8 border-t border-white/10 relative z-10 text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">
                        Ciclos de Performance Plano Pro:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <CheckoutForm 
                            lookupKey="pro_trimestral" 
                            label="Trim." 
                            description="Assinar: Pro Trimestral (R$ 53,90)" 
                            className="w-full h-10 flex items-center justify-center bg-white/5 rounded-xl text-[9px] text-blue-400 font-bold hover:bg-white/10 transition-colors px-1 text-center" 
                        />
                        <CheckoutForm 
                            lookupKey="pro_semestral" 
                            label="Semest." 
                            description="Assinar: Pro Semestral (R$ 99,90)" 
                            className="w-full h-10 flex items-center justify-center bg-white/5 rounded-xl text-[9px] text-blue-400 font-bold hover:bg-white/10 transition-colors px-1 text-center" 
                        />
                        <CheckoutForm 
                            lookupKey="pro_anual" 
                            label="Anual" 
                            description="Assinar: Pro Anual (R$ 179,90)" 
                            className="w-full h-10 flex items-center justify-center bg-blue-600/20 border border-blue-600/30 rounded-xl text-[9px] text-blue-400 font-bold hover:bg-blue-600/40 transition-colors px-1 text-center" 
                        />
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-[9px] font-black text-gray-600 uppercase">Ou se preferir</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <button onClick={() => openPixModal("Pro", "R$ 19,90", "nucleo-chave-pro.png")} className="w-full p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center group/pix transition-all hover:bg-white/10 hover:border-blue-500/50 text-center">
                <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400 group-hover/pix:bg-blue-600 group-hover/pix:text-white transition-all mb-2">
                  <QrCode size={20} />
                </div>
                <p className="text-[11px] font-black text-white uppercase tracking-tight">Pagamento via PIX</p>
                <p className="text-[10px] text-gray-500 font-medium">Liberação manual assistida</p>
              </button>
            </div>
            
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700"></div>
          </div>
        </div>
      </div>
      
      {/* FOOTER DE DIFERENCIAIS */}
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