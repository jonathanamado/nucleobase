"use client";
import React, { useState } from "react";
import { 
  Zap, ShieldCheck, BarChart3, ShoppingCart, 
  CheckCircle2, Info, Star, TrendingUp, Gem,
  QrCode, X, Copy, Check, MessageCircle, Instagram,
  ChevronLeft, ChevronRight, Headphones, RefreshCcw, Rocket
} from "lucide-react";

export default function PaginaDePlanos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, qrCode: string} | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [currentCardMobile, setCurrentCardMobile] = useState(0);
  const [currentCardDesktop, setCurrentCardDesktop] = useState(0);

  const PIX_KEY = "contato@nucleobase.app";
  const WHATSAPP_LINK_ID = "q46hkm"; 

  const diferenciais = [
    { icon: <ShieldCheck size={32} />, title: "Criptografia Base", desc: "Privacidade total dos seus dados." },
    { icon: <BarChart3 size={32} />, title: "Gestão Estratégica", desc: "Análise real de patrimônio." },
    { icon: <CheckCircle2 size={32} />, title: "Fidelidade Zero", desc: "Cancele quando desejar." },
    { icon: <Headphones size={32} />, title: "Suporte Premium", desc: "Atendimento humano e ágil." },
    { icon: <RefreshCcw size={32} />, title: "Update Contínuo", desc: "Novas funções mensalmente." }
  ];

  const nextCardMobile = () => {
    setCurrentCardMobile((prev) => (prev === diferenciais.length - 1 ? 0 : prev + 1));
  };
  const prevCardMobile = () => {
    setCurrentCardMobile((prev) => (prev === 0 ? diferenciais.length - 1 : prev - 1));
  };

  const nextCardDesktop = () => {
    setCurrentCardDesktop((prev) => (prev >= diferenciais.length - 2 ? 0 : prev + 2));
  };
  const prevCardDesktop = () => {
    setCurrentCardDesktop((prev) => (prev <= 0 ? diferenciais.length - 2 : prev - 2));
  };

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
    description,
    href 
  }: { 
    lookupKey: string, 
    label: string, 
    className?: string,
    description: string,
    href?: string
  }) => {
    if (href) {
      return (
        <a href={href} className="block w-full no-underline">
          <button className={`${className} cursor-pointer transition-transform active:scale-[0.98]`}>
            {label}
          </button>
        </a>
      );
    }

    return (
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
  };

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* MODAL PIX */}
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
                 <img src={`/${selectedPlan?.qrCode}`} alt="QR Code Pix" className="w-48 h-48 object-contain" />
              </div>
              <div className="w-full space-y-3">
                <div className="relative group">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Chave E-mail:</p>
                    <button onClick={handleCopyPix} className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-700 rounded-2xl font-mono text-sm flex items-center justify-center gap-3 hover:border-blue-400 hover:bg-white transition-all active:scale-95">
                        {PIX_KEY}
                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-400" />}
                    </button>
                </div>
                <button onClick={handleSendProof} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-95">
                  <MessageCircle size={20} /> Enviar Comprovante
                </button>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest pt-2">A liberação ocorre após validação manual.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Planos e Assinaturas<span className="text-blue-600">.</span></span>
            <ShoppingCart size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Escolha o nível de controle que sua jornada financeira precisa.
          </h2>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Níveis de Acesso <div className="h-px bg-gray-200 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
        
        {/* CARD EXPERIÊNCIA / GRATUITO */}
        <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 flex flex-col transition-all hover:border-blue-200 relative group overflow-hidden">
          <div className="relative z-10 flex-grow">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
              <Star size={18} className="fill-blue-600" /> Grátis
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">90 Dias de Experiência</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">Conheça e valide. Sem restrições. Período de degustação completo.</p>
            <ul className="space-y-4 mb-10">
              {["Registros ilimitados", "Lançamentos online", "Painel de Resultados"].map((v, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <CheckCircle2 size={16} className="text-blue-500" /> {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative z-10">
            <a href="/cadastro" className="block w-full py-4 bg-white border border-slate-200 text-slate-900 text-center rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
              Começar Degustação
            </a>
          </div>
          <Zap className="absolute -bottom-10 -right-10 text-slate-200/50 w-40 h-40 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>

        {/* PLANO ESSENCIAL */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all flex flex-col border-b-4 border-b-transparent hover:border-b-blue-600">
          <div className="flex-grow">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
              <Rocket size={18} /> Uso Pessoal
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Essencial</h3>
            <div className="flex flex-col mb-8">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ 9,90</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">/mês</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-10">
              <CheckoutForm lookupKey="essencial_trimestral" label="Trim." description="Trimestral" className="w-full py-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-white hover:border-slate-300 transition-all" />
              <CheckoutForm lookupKey="essencial_semestral" label="Semest." description="Semestral" className="w-full py-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-white hover:border-slate-300 transition-all" />
              <CheckoutForm lookupKey="essencial_anual" label="Anual" description="Anual" className="w-full py-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all" />
            </div>

            <ul className="space-y-4 mb-6">
              {["Fidelidade Zero", "Multi-dispositivos", "Suporte via Base"].map((v, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <CheckCircle2 size={16} className="text-emerald-500" /> {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto">
            <CheckoutForm lookupKey="essencial_mensal" label="Assinar Mensal" href="/planos/essencial" description="Mensal" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm" />
          </div>
        </div>

        {/* PLANO PRO */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl flex flex-col relative overflow-hidden group transition-all border-b-4 border-b-transparent hover:border-b-orange-500">
          <div className="relative z-10 flex-grow">
            <div className="flex items-center w-full mb-8">
                <div className="px-3 py-1 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest">Recomendado</div>
                <div className="flex-1 flex justify-center items-center">
                  <Gem size={18} className="text-orange-500" />
                </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Plano Pro</h3>
            <div className="flex flex-col mb-8">
              <span className="text-4xl font-black text-white tracking-tighter">R$ 19,90</span>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">/mês</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-10">
              <CheckoutForm lookupKey="pro_trimestral" label="Trim." description="Trimestral" className="w-full py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-white/10 transition-all" />
              <CheckoutForm lookupKey="pro_semestral" label="Semest." description="Semestral" className="w-full py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-white/10 transition-all" />
              <CheckoutForm lookupKey="pro_anual" label="Anual" description="Anual" className="w-full py-2 bg-white text-slate-900 rounded-lg text-[9px] font-bold uppercase tracking-tighter hover:bg-blue-400 hover:text-white transition-all" />
            </div>

            <ul className="space-y-4 mb-6">
              {["Importação via arquivo", "Integração Contínua", "Suporte Prioritário"].map((v, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <CheckCircle2 size={16} className="text-blue-400" /> {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative z-10 mt-auto">
            <CheckoutForm lookupKey="pro_mensal" label="Assinar Pro Mensal" href="/planos/pro" description="Mensal" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40" />
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700"></div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 mt-20 mb-10"></div>
      
      <div className="mb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Por que somos diferentes?</h4>
        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-3xl">Conheça os pilares que sustentam a segurança e a transparência da nossa plataforma para transformar sua gestão financeira.</p>
      </div>

      <div className="hidden md:flex flex-row items-center gap-12">
        <div className="w-1/3">
          <h5 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Diferenciais Nucleobase</h5>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">Desenvolvemos uma infraestrutura focada na sua privacidade e no crescimento do seu patrimônio, garantindo suporte e evolução constante.</p>
          <div className="flex gap-3">
            <button onClick={prevCardDesktop} className="p-3 bg-white shadow-md rounded-full text-gray-400 hover:text-blue-600 transition-all border border-gray-100 active:scale-90"><ChevronLeft size={24} /></button>
            <button onClick={nextCardDesktop} className="p-3 bg-white shadow-md rounded-full text-gray-400 hover:text-blue-600 transition-all border border-gray-100 active:scale-90"><ChevronRight size={24} /></button>
          </div>
        </div>

        <div className="w-2/3 overflow-hidden">
          <div className="flex transition-transform duration-700 ease-in-out gap-6" style={{ transform: `translateX(-${currentCardDesktop * (50 + 1.5)}%)` }}>
            {diferenciais.map((item, idx) => (
              <div key={idx} className="min-w-[calc(50%-12px)] flex flex-col items-start gap-4 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors shrink-0">{item.icon}</div>
                <div>
                  <h5 className="font-black text-gray-900 text-sm uppercase tracking-tight">{item.title}</h5>
                  <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="md:hidden">
        <div className="relative px-2">
          <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 w-full left-0 z-10 px-1">
            <button onClick={prevCardMobile} className="p-2 bg-white shadow-lg rounded-full text-gray-400 active:scale-90 transition-transform border border-gray-100"><ChevronLeft size={20} /></button>
            <button onClick={nextCardMobile} className="p-2 bg-white shadow-lg rounded-full text-gray-400 active:scale-90 transition-transform border border-gray-100"><ChevronRight size={20} /></button>
          </div>
          <div className="overflow-hidden">
             <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentCardMobile * 100}%)` }}>
                {diferenciais.map((item, idx) => (
                  <div key={idx} className="min-w-full px-10">
                    <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                      <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 mb-4">{item.icon}</div>
                      <h5 className="font-black text-gray-900 text-sm uppercase tracking-tight mb-1">{item.title}</h5>
                      <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-6">
            {diferenciais.map((_, idx) => (
              <div key={idx} className={`h-1 rounded-full transition-all ${idx === currentCardMobile ? "w-6 bg-blue-600" : "w-1.5 bg-gray-200"}`}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="max-w-3xl mb-12">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">Fique por dentro <br className="md:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span></h4>
          <p className="text-gray-500 font-medium text-sm md:text-base">Insights, novidades e bastidores da Nucleobase diretamente no seu feed.</p>
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