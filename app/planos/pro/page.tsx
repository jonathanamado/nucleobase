"use client";
import React, { useState } from "react";
import { 
  Gem, CheckCircle2, QrCode, X, Copy, Check, 
  MessageCircle, ArrowLeft, Zap, Shield, RefreshCw,
  BarChart3, Headphones, Globe, Star, Gift, Instagram
} from "lucide-react";

export default function PaginaPlanoPro() {
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
    const message = encodeURIComponent(`Olá! Realizei o pagamento via PIX do plano PRO (${selectedPlan?.price}). Quero liberar meu acesso total.`);
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
      <a href="/planos" className="flex items-center gap-2 text-gray-400 hover:text-amber-600 transition-colors mb-8 group w-fit">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Ver todos os planos</span>
      </a>

      {/* HEADER EXCLUSIVO PRO */}
      <div className="flex flex-col mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-500 p-2 rounded-xl text-white shadow-lg shadow-amber-200">
            <Gem size={24} />
          </div>
          <span className="text-amber-600 font-black text-xs uppercase tracking-[0.3em]">Experiência Premium</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Gestão <span className="text-amber-500 font-black">Inteligente</span> <br />em seu dia a dia.
        </h1>
        <p className="text-gray-500 text-xl max-w-2xl leading-relaxed">
          O Plano Pro é o coração da Nucleobase. Criado para quem valoriza tempo e precisão, unindo automação funcional com suporte exclusivo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LADO ESQUERDO: DETALHAMENTO E BENEFÍCIOS PRO */}
        <div className="lg:col-span-7 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-amber-100 rounded-[2rem] shadow-sm relative overflow-hidden group">
              <div className="text-amber-600 mb-4 bg-amber-50 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <RefreshCw size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Sincronização D-1</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Conecte seus arquivos e veja suas transações aparecerem automaticamente toda manhã.</p>
            </div>
            
            <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm group">
              <div className="text-blue-600 mb-4 bg-blue-50 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Relatórios Avançados</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Análises profundas de patrimônio, projeções futuras e abertura para customizações.</p>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm group">
              <div className="text-indigo-600 mb-4 bg-indigo-50 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Headphones size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Suporte Prioritário</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Fila exclusiva de atendimento via WhatsApp para resolver qualquer dúvida em minutos.</p>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm group">
              <div className="text-emerald-600 mb-4 bg-emerald-50 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Multi-Cartões</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Ideal para quem possui diferentes entradas e saídas em contas correntes e cartões de crédito separados.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Star className="text-amber-400 fill-amber-400" size={20} />
                <h3 className="text-2xl font-bold">Tudo do Essencial, mais:</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Lançamentos via tela em poucos passos",
                  "Conexão online com seus arquivos",
                  "Atualização da fonte de dados em '1 clique'",
                  "Painel de Resultados realtime",
                  "Acesso antecipado a novas funções",
                  "Consultoria inteligente ao seu perfil"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 size={18} className="text-amber-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <Gem size={180} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
          </div>
        </div>

        {/* LADO DIREITO: CARD DE ASSINATURA PRO */}
        <div className="lg:col-span-5 sticky top-8 flex flex-col">
          
          {/* BANNER DEGUSTAÇÃO */}
          <div className="mb-6 bg-amber-50 border border-amber-100 rounded-[2.5rem] p-7 flex items-center gap-5 animate-pulse">
            <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-md">
              <Gift size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em]">Oferta de Lançamento</p>
              <p className="text-sm text-amber-900 font-medium leading-relaxed">
                Aproveite <strong>3 meses de degustação</strong> antes da assinatura do seu Plano. 
                <a href="/cadastro" className="ml-2 inline-block align-middle">
                  <span className="bg-amber-600 text-white px-2 py-1 rounded-md text-[10px] font-black shadow-sm hover:bg-amber-700 transition-colors uppercase tracking-tighter">
                    Clique aqui.
                  </span>
                </a>
              </p>
            </div>
          </div>

          {/* CARD PRINCIPAL */}
          <div className="bg-white border-2 border-amber-500 rounded-[2.5rem] p-6 shadow-2xl shadow-amber-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white px-5 py-1.5 rounded-bl-2xl font-black text-[9px] uppercase tracking-tighter">
              Melhor Escolha
            </div>

            <div className="text-center mb-6">
              <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Plano Mensal Pro</span>
              <div className="mt-4">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">R$ 19,90</span>
                <span className="text-gray-400 font-bold block mt-1 tracking-widest uppercase text-[10px]">por mês</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center mb-1">Ativação Instantânea</p>
              <CheckoutForm 
                lookupKey="pro_mensal" 
                label="Assinar Plano Pro Agora" 
                description="Plano Pro Mensal"
                className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all"
              />

              <div className="pt-4 border-t border-gray-100">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] text-center mb-3">Planos com Desconto:</p>
                <div className="grid grid-cols-1 gap-2">
                  <CheckoutForm 
                    lookupKey="pro_trimestral" 
                    label="Trimestral - R$ 54,90" 
                    discount="-12%"
                    description="Pro Trimestral"
                    className="py-3 bg-slate-50 text-slate-700 rounded-lg font-bold text-[11px] hover:bg-slate-100 transition-colors border border-slate-100"
                  />
                  
                  <CheckoutForm 
                    lookupKey="pro_semestral" 
                    label="Semestral - R$ 99,90" 
                    discount="-18%"
                    description="Pro Semestral"
                    className="py-3 bg-slate-50 text-slate-700 rounded-lg font-bold text-[11px] hover:bg-slate-100 transition-colors border border-slate-100"
                  />
                  
                  <CheckoutForm 
                    lookupKey="pro_anual" 
                    label="Anual - R$ 189,90" 
                    discount="-25%"
                    description="Pro Anual"
                    className="py-3 bg-slate-900 text-white rounded-lg font-bold text-[11px] hover:bg-black transition-colors shadow-md"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => openPixModal("Pro Mensal", "R$ 19,90", "nucleo-qr-pro.png")}
                  className="w-full p-3 border-2 border-dashed border-amber-100 rounded-xl flex items-center justify-center gap-3 group hover:border-amber-300 hover:bg-amber-50/30 transition-all"
                >
                  <QrCode size={18} className="text-amber-500" />
                  <div className="text-left">
                    <p className="text-[9px] font-black text-gray-900 uppercase">Pagar via PIX</p>
                    <p className="text-[8px] text-gray-400 font-medium italic">Liberação via suporte</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA PADRONIZADA */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO COM GRADIENTE E BRILHO */}
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
            {/* Efeito de brilho/glow ao fundo do ícone */}
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

      {/* MODAL PIX PRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative border border-amber-100">
            <div className="p-8 flex flex-col items-center text-center">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
              <div className="bg-amber-50 p-4 rounded-full text-amber-600 mb-6">
                <Gem size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Assinatura Pro via PIX</h3>
              <p className="text-gray-500 mb-6 text-sm">Escaneie o código para liberar o acesso ao plano <span className="font-bold text-amber-600 uppercase">{selectedPlan?.name}</span></p>
              
              <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner border border-gray-100">
                 <img src={`/${selectedPlan?.qrCode}`} alt="QR Code" className="w-48 h-48 object-contain" />
              </div>

              <div className="w-full space-y-3">
                <button onClick={handleCopyPix} className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-700 rounded-2xl font-mono text-sm flex items-center justify-center gap-3 hover:border-amber-400 transition-all">
                  {PIX_KEY}
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-400" />}
                </button>
                <button onClick={handleSendProof} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all">
                  <MessageCircle size={20} /> Liberar Acesso Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}