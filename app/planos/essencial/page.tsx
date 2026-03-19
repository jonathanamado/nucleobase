"use client";
import React, { useState } from "react";
import { 
  ShieldCheck, CheckCircle2, QrCode, X, Copy, Check, 
  MessageCircle, Instagram, Gift, Users, ArrowUpRight
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
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0 bg-white">
      
      {/* HEADER PADRONIZADO COM A PÁGINA "SOBRE" */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Essencial, <span className="text-blue-600">prático e profissional.</span></span>
            <ShieldCheck size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-3xl leading-relaxed mt-0">
            Organização simples e funcional.
          </h2>
        </div>
      </div>

      {/* LINHA DIVISÓRIA "ASSINATURA ESSENCIAL" */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Assinatura Essencial <div className="h-px bg-gray-200 flex-1"></div>
      </h3>

      {/* SEÇÃO REFORMULADA */}
      <div className="max-w-4xl mx-auto px-2">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-stretch">
          
          {/* CONTAINER ESQUERDO: TEXTO + BENEFÍCIOS + EXPLICAÇÃO DESKTOP */}
          <div className="flex-1 flex flex-col justify-between w-full py-2">
            
            <div className="flex flex-col gap-8">
              {/* TEXTO INICIAL */}
              <div className="space-y-4">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed font-light">
                  O <span className="text-gray-900 font-medium">Plano Essencial</span> foi desenhado para quem valoriza a precisão do lançamento manual como ferramenta de <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[10px] md:text-xs font-bold shadow-sm inline-block mx-1 leading-none">consciência financeira.</span>
                </p>
              </div>

              {/* CARD EXIBIDO AQUI NO MOBILE */}
              <div className="block lg:hidden w-full">
                <CardPreco 
                  openPixModal={openPixModal} 
                  CheckoutForm={CheckoutForm}
                />
              </div>

              {/* TÓPICOS/BENEFÍCIOS */}
              <div className="grid grid-cols-1 gap-5">
                {[
                  "Registros ilimitados de transações",
                  "Acesso Multiplataforma (PC/Mobile)",
                  "Gráficos de Performance em tempo real",
                  "Segurança com criptografia total"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span className="text-gray-500 text-sm font-medium tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TEXTO EXPLICATIVO (APENAS DESKTOP) PARA ALINHAMENTO DE ALTURA */}
            <div className="hidden lg:block mt-12 pt-8 border-t border-gray-200">
               <p className="text-[13px] text-gray-500 leading-relaxed font-light">
                A assinatura Nucleo transforma sua gestão financeira em uma experiência digital fluida. 
                Ao contrário de planilhas complexas que exigem manutenção e fórmulas pesadas, 
                nossa plataforma oferece uma interface intuitiva focada no que importa: 
                a clareza dos números sem burocracia manual, com praticidade nos lançamentos diários, semanais ou mensais.
               </p>
            </div>
          </div>

          {/* CONTAINER DIREITO: CARD (DESKTOP) */}
          <div className="hidden lg:block w-full lg:w-[380px] shrink-0">
            <CardPreco 
              openPixModal={openPixModal} 
              CheckoutForm={CheckoutForm}
            />
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
              <p className="text-gray-500 mb-6 text-sm">Escaneie o código para o plano <span className="font-bold text-blue-600 uppercase">{selectedPlan?.name}</span></p>
              
              <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner border border-gray-100">
                 <img src={`/${selectedPlan?.qrCode}`} alt="QR Code" className="w-48 h-48 object-contain" />
              </div>

              <div className="w-full space-y-3">
                <button onClick={handleCopyPix} className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-mono text-sm flex items-center justify-center gap-3 hover:border-blue-400 transition-all">
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

      {/* FOOTER INSTAGRAM PADRÃO "SOBRE" */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="max-w-3xl mb-12">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <br className="md:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
          </p>
        </div>
        
        <a href="https://www.instagram.com/nucleobase.app/" target="_blank" rel="noopener noreferrer" className="group relative flex flex-col items-center gap-6">
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

    </div>
  );
}

{/* SUBCOMPONENTE CARD */}
function CardPreco({ openPixModal, CheckoutForm }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow duration-500 w-full h-full flex flex-col justify-center">
      <div className="flex justify-between items-start mb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Essencial</p>
          <h4 className="text-4xl font-light text-gray-900 tracking-tighter">
            R$ 9,90 <span className="text-base text-gray-500 font-medium">/ mês</span>
          </h4>
        </div>
        <Gift size={20} className="text-gray-500" />
      </div>

      <div className="mb-4">
        <p className="text-[12px] text-center text-gray-400 leading-tight font-medium">
          Pagamento seguro via <span className="text-gray-900 font-bold tracking-tight">Stripe</span>. Assine via Cartão de crédito com renovação automática e segurança global.
        </p>
      </div>

      <div className="space-y-3">
        <CheckoutForm 
          lookupKey="essencial_mensal" 
          label="Plano mensal" 
          description="Plano Essencial Mensal"
          className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-sm"
        />

        <div className="grid grid-cols-3 gap-2 pt-2">
          <CheckoutForm lookupKey="essencial_trimestral" label="Trim." description="R$ 26,90" className="py-2.5 bg-gray-50 text-gray-500 rounded-lg font-bold text-[9px] hover:bg-gray-100 transition-colors uppercase" />
          <CheckoutForm lookupKey="essencial_semestral" label="Semest." description="R$ 49,90" className="py-2.5 bg-gray-50 text-gray-500 rounded-lg font-bold text-[9px] hover:bg-gray-100 transition-colors uppercase" />
          <CheckoutForm lookupKey="essencial_anual" label="Anual" description="R$ 89,90" className="py-2.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-[9px] hover:bg-blue-100 transition-colors uppercase" />
        </div>

        <div className="flex items-center gap-3 py-4">
          <div className="h-px bg-gray-100 flex-1"></div>
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">OPÇÃO SEM CARTÃO</span>
          <div className="h-px bg-gray-100 flex-1"></div>
        </div>

        <div className="mb-2">
          <p className="text-[12px] text-gray-400 leading-tight font-medium text-center">
            Com a opção do <span className="text-gray-900 font-bold">PIX</span> você garante sua assinatura sem vincular um Cartão de crédito.
          </p>
        </div>

        <button 
          onClick={() => openPixModal("Essencial Mensal", "R$ 9,90", "nucleo-chave-essencial.png")}
          className="w-full py-3 border border-gray-100 rounded-xl flex items-center justify-center gap-2 group hover:bg-gray-50 transition-all"
        >
          <QrCode size={14} className="text-gray-400 group-hover:text-blue-600" />
          <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-widest transition-colors">Assinar via PIX</span>
        </button>
      </div>
    </div>
  );
}