"use client";
import React, { useState } from "react";
import { 
  ShieldCheck, CheckCircle2, QrCode, X, Copy, Check, 
  MessageCircle, ArrowLeft, Zap, Shield, MousePointerClick,
  Lock, Smartphone, Cloud, Gift
} from "lucide-react";

export default function PaginaPlanoEssencial() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, qrCode: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const PIX_KEY = "contato@nucleobase.app";
  const WHATSAPP_LINK_ID = "q46hkm"; 

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
    const message = encodeURIComponent(`Olá! Realizei o pagamento via PIX do plano Essencial (${selectedPlan?.price}). Segue o comprovante.`);
    window.open(`https://wa.link/${WHATSAPP_LINK_ID}?text=${message}`, '_blank');
  };

  const CheckoutForm = ({ lookupKey, label, className, description, discount }: { lookupKey: string, label: string, className?: string, description: string, discount?: string }) => (
    <form action="/api/stripe" method="POST" className="w-full">
      <input type="hidden" name="lookup_key" value={lookupKey} />
      <button type="submit" title={description} className={`${className} cursor-pointer transition-transform active:scale-[0.98] flex items-center justify-center gap-2 w-full`}>
        {label}
        {discount && (
          <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-black">
            {discount}
          </span>
        )}
      </button>
    </form>
  );

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* BOTÃO VOLTAR */}
      <a href="/planos" className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-8 group w-fit">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Ver todos os planos</span>
      </a>

      {/* HEADER EXCLUSIVO ESSENCIAL */}
      <div className="flex flex-col mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
            <ShieldCheck size={24} />
          </div>
          <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em]">Plano Essencial</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Controle prático, <br />resultado <span className="text-blue-600 font-black">profissional.</span>
        </h1>
        <p className="text-gray-500 text-xl max-w-2xl leading-relaxed">
          Ideal para quem busca organizar as finanças com agilidade e segurança, sem a complexidade de automações bancárias, mas com todo o poder analítico da Nucleo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LADO ESQUERDO: DETALHAMENTO E BENEFÍCIOS */}
        <div className="lg:col-span-7 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm group">
              <div className="text-blue-600 mb-4 bg-blue-50 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <MousePointerClick size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Lançamentos Manuais</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Interface otimizada para registros rápidos de gastos e receitas em segundos.</p>
            </div>
            
            <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm group">
              <div className="text-blue-600 mb-4 bg-blue-50 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Cloud size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Acesso Multiplataforma</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Seus dados sincronizados em tempo real entre desktop, tablet e mobile.</p>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm group">
              <div className="text-blue-600 mb-4 bg-blue-50 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Lock size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Segurança Total</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Criptografia de ponta a ponta. Seus dados financeiros pertencem apenas a você.</p>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm group">
              <div className="text-blue-600 mb-4 bg-blue-50 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Smartphone size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">App Web Progressive</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Instale no seu celular para uma experiência de aplicativo nativo sem ocupar espaço.</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6">O que está incluso:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Registros ilimitados de transações",
                  "Categorização personalizada",
                  "Gráficos de fluxo de caixa",
                  "Exportação de dados (CSV)",
                  "Gestão de Contas e Cartões",
                  "Suporte via Central de Ajuda"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 size={18} className="text-blue-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <Shield size={180} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
          </div>
        </div>

        {/* LADO DIREITO: CARD DE ASSINATURA E CICLOS */}
        <div className="lg:col-span-5 sticky top-8 flex flex-col">
          
          {/* BANNER DEGUSTAÇÃO - AJUSTADO CONFORME PRO */}
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-[2.5rem] p-7 flex items-center gap-5 animate-pulse">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md">
              <Gift size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Oferta de Lançamento</p>
              <p className="text-sm text-blue-900 font-medium leading-relaxed">
                Aproveite <strong>3 meses de degustação</strong> antes da assinatura do seu Plano. 
                <a href="/cadastro" className="ml-2 inline-block align-middle">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-[10px] font-black shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-tighter">
                    Clique aqui.
                  </span>
                </a>
              </p>
            </div>
          </div>

          {/* CARD PRINCIPAL - COMPACTADO */}
          <div className="bg-white border-2 border-blue-600 rounded-[2.5rem] p-6 shadow-2xl shadow-blue-100 relative overflow-hidden">
            <div className="text-center mb-6">
              <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Plano Mensal</span>
              <div className="mt-4">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">R$ 9,90</span>
                <span className="text-gray-400 font-bold block mt-1 tracking-widest uppercase text-[10px]">por mês</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center mb-1">Assinar via Cartão de Crédito</p>
              <CheckoutForm 
                lookupKey="essencial_mensal" 
                label="Começar Assinatura Mensal" 
                description="Plano Essencial Mensal"
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black shadow-lg shadow-gray-200 transition-all"
              />

              <div className="pt-4 border-t border-gray-100">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] text-center mb-3">Ou economize com ciclos longos:</p>
                <div className="grid grid-cols-1 gap-2">
                  <CheckoutForm 
                    lookupKey="essencial_trimestral" 
                    label="Trimestral - R$ 26,90" 
                    discount="-10%"
                    description="Essencial Trimestral"
                    className="py-3 bg-blue-50 text-blue-600 rounded-lg font-bold text-[11px] hover:bg-blue-100 transition-colors"
                  />
                  
                  <CheckoutForm 
                    lookupKey="essencial_semestral" 
                    label="Semestral - R$ 49,90" 
                    discount="-16%"
                    description="Essencial Semestral"
                    className="py-3 bg-blue-50 text-blue-600 rounded-lg font-bold text-[11px] hover:bg-blue-100 transition-colors"
                  />
                  
                  <CheckoutForm 
                    lookupKey="essencial_anual" 
                    label="Anual - R$ 89,90" 
                    discount="-24%"
                    description="Essencial Anual"
                    className="py-3 bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700 transition-colors shadow-md"
                  />
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-px bg-gray-100 flex-1"></div>
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Alternativa</span>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>
                
                <button 
                  onClick={() => openPixModal("Essencial Mensal", "R$ 9,90", "nucleo-chave-essencial.png")}
                  className="w-full p-3 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center gap-3 group hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                >
                  <QrCode size={18} className="text-gray-400 group-hover:text-blue-600" />
                  <div className="text-left">
                    <p className="text-[9px] font-black text-gray-900 uppercase">Pagar com PIX</p>
                    <p className="text-[8px] text-gray-400 font-medium italic">Liberação via WhatsApp</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PIX */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative border border-blue-100">
            <div className="p-8 flex flex-col items-center text-center">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
              <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-6">
                <QrCode size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pagamento via PIX</h3>
              <p className="text-gray-500 mb-6 text-sm">Escaneie o QR Code para ativar o plano <span className="font-bold text-blue-600 uppercase">{selectedPlan?.name}</span></p>
              
              <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner border border-gray-100">
                 <img src={`/${selectedPlan?.qrCode}`} alt="QR Code" className="w-48 h-48 object-contain" />
              </div>

              <div className="w-full space-y-3">
                <button onClick={handleCopyPix} className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-700 rounded-2xl font-mono text-sm flex items-center justify-center gap-3 hover:border-blue-400 transition-all">
                  {PIX_KEY}
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-400" />}
                </button>
                <button onClick={handleSendProof} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all">
                  <MessageCircle size={20} /> Enviar Comprovante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}