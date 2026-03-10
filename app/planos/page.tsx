"use client";
import React, { useState } from "react";
import { 
  Zap, ShieldCheck, BarChart3, ShoppingCart, 
  CheckCircle2, Info, Star, TrendingUp, Gem,
  QrCode, X, Copy, Check, MessageCircle, Instagram,
  ChevronLeft, ChevronRight, Headphones, RefreshCcw
} from "lucide-react";

export default function PaginaDePlanos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, qrCode: string} | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Estados para os carrosséis
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

  // Lógica Carrossel Mobile (1 em 1)
  const nextCardMobile = () => {
    setCurrentCardMobile((prev) => (prev === diferenciais.length - 1 ? 0 : prev + 1));
  };
  const prevCardMobile = () => {
    setCurrentCardMobile((prev) => (prev === 0 ? diferenciais.length - 1 : prev - 1));
  };

  // Lógica Carrossel Desktop (2 em 2)
  const nextCardDesktop = () => {
    // Avança de 2 em 2, mas garante que não passe do limite (length - 2)
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

      {/* BANNER DE INCENTIVO */}
      <div className="mb-10 bg-blue-50/50 border border-blue-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
        <div className="flex items-start md:items-center gap-4 md:ml-2">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200 shrink-0">
            <TrendingUp size={24} />
          </div>
          
          <p className="hidden md:block text-sm md:text-base text-gray-700 font-medium leading-relaxed">
            Incentivamos disciplina de longo prazo: garanta até <span className="text-blue-600 font-bold underline decoration-blue-200 underline-offset-4">24% de economia</span> nos ciclos estendidos. Reforçamos antes sua opção em <span className="text-blue-600 font-bold underline decoration-blue-200 underline-offset-4">degustar da Plataforma por 90 dias</span>, pois não temos pressa e garantimos sua satisfação ofertando este benefício. Viemos pra ficar e pra ressignificar o seu conhecimento pelo seu próprio dinheiro<span className="text-blue-600 font-bold underline decoration-blue-200 underline-offset-4">.</span>
          </p>

          <div className="md:hidden flex flex-col gap-2">
            <h4 className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Benefícios Nucleobase</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-gray-800">90 dias grátis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-gray-800">Até 24% OFF</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mt-1">
                Aproveite o período de degustação e ressignifique sua relação com o dinheiro.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
        
        {/* EXPERIÊNCIA */}
        <a href="/cadastro" className="lg:col-span-4 h-full block group decoration-transparent">
          <div className="bg-blue-600 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-blue-900/20 h-full flex flex-col transition-all hover:scale-[1.01] cursor-pointer">
            <div className="relative z-10 flex-grow">
              <div className="flex flex-col items-center mb-6 md:mb-10 relative">
                <div className="relative flex w-full items-center justify-center bg-white/10 border border-white/20 text-white text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest text-center">
                  <Star className="text-white fill-white absolute left-5 group-hover:scale-110 transition-transform hidden md:block" size={20} />
                  Conheça e valide. Sem restrições.
                </div>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-center md:text-left">90 Dias de Experiência</h3>
              <div className="mt-2 md:mt-6 flex flex-col mb-8 text-center md:text-left">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">Grátis</span>
                <span className="text-blue-200 text-xs md:text-base font-bold uppercase tracking-widest mt-1">Período de Degustação</span>
              </div>
              
              <div className="space-y-4 mb-8 flex-grow">
                {[
                  "Registros ilimitados",
                  "Lançamentos online",
                  "Painel de Resultados"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-blue-200 shrink-0" />
                    <p className="text-sm md:text-base text-blue-50 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="p-5 md:p-6 bg-white/10 border border-white/10 rounded-[2rem]">
                <button className="w-full py-4 md:py-5 bg-white text-blue-600 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl text-center">
                  Começar agora gratuitamente.
                </button>
                <p className="text-center text-blue-100/70 text-[10px] font-medium italic mt-4">
                  Teste por 3 meses sem compromisso.
                </p>
              </div>
            </div>
            <Zap size={200} className="absolute -right-16 -bottom-16 text-white opacity-10 -rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-1000 md:block hidden" />
          </div>
        </a>

        {/* LADO DIREITO: OS PLANOS */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* PLANO ESSENCIAL */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 shadow-sm hover:shadow-xl transition-all flex flex-col h-full border-b-4 border-b-transparent hover:border-b-blue-600 group">
            <div className="mb-6 md:mb-10">
              <div className="relative flex w-full items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest mb-6">
                Econômico. Funcional.
                <ShieldCheck className="text-blue-600 absolute right-5 hidden md:block" size={20} />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Essencial</h3>
              <div className="mt-4 flex flex-col">
                <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">R$ 9,90</span>
                <span className="text-gray-400 text-xs md:text-base font-bold uppercase tracking-widest mt-1">/Mês</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              {["Registros ilimitados", "Lançamentos online", "Painel de Resultados"].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <p className="text-sm md:text-base text-gray-600 font-medium">{item}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="p-5 md:p-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Via Cartão</p>
                <CheckoutForm 
                  lookupKey="essencial_mensal" 
                  href="/planos/essencial"
                  label="Assinar Mensal" 
                  description="Plano Essencial Mensal"
                  className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-black shadow-lg text-center"
                />
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                        <CheckoutForm lookupKey="essencial_trimestral" label="Trim." description="R$ 26,90" className="w-full h-10 bg-white rounded-xl text-[9px] text-blue-600 font-bold border border-gray-100" />
                        <CheckoutForm lookupKey="essencial_semestral" label="Semest." description="R$ 49,90" className="w-full h-10 bg-white rounded-xl text-[9px] text-blue-600 font-bold border border-gray-100" />
                        <CheckoutForm lookupKey="essencial_anual" label="Anual" description="R$ 89,90" className="w-full h-10 bg-blue-50 border border-blue-100 rounded-xl text-[9px] text-blue-600 font-bold" />
                    </div>
                </div>
              </div>

              <button onClick={() => openPixModal("Essencial", "R$ 9,90", "nucleo-chave-essencial.png")} className="w-full p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center group/pix transition-all hover:bg-white text-center">
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Pagar via PIX</p>
                <p className="text-[10px] text-gray-400 font-medium">Liberação manual</p>
              </button>
            </div>
          </div>

          {/* PLANO PRO */}
          <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 shadow-2xl flex flex-col relative overflow-hidden group h-full transition-all hover:scale-[1.01]">
            <div className="relative z-10 mb-6 md:mb-10 flex-grow">
              <div className="relative flex w-full items-center justify-center bg-blue-600 text-white text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest animate-pulse mb-6">
                Melhor custo x benefício.
                <Gem className="text-white absolute right-5 hidden md:block" size={20} />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Plano Pro</h3>
              <div className="mt-4 flex flex-col">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">R$ 19,90</span>
                <span className="text-gray-500 text-xs md:text-base font-bold uppercase tracking-widest mt-1">/Mês</span>
              </div>

              <div className="space-y-4 mt-8">
                {["Importação via arquivo", "Integração Contínua (D-1)", "Suporte prioritário"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
                    <p className="text-sm md:text-base text-gray-300 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="p-5 md:p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Via Cartão</p>
                <CheckoutForm 
                  lookupKey="pro_mensal" 
                  href="/planos/pro"
                  label="Assinar Pro Mensal" 
                  description="Plano Pro Mensal"
                  className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 shadow-lg shadow-blue-900/40 relative z-10 text-center"
                />

                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-2">
                        <CheckoutForm lookupKey="pro_trimestral" label="Trim." description="R$ 53,90" className="w-full h-10 bg-white/5 rounded-xl text-[9px] text-blue-400 font-bold" />
                        <CheckoutForm lookupKey="pro_semestral" label="Semest." description="R$ 99,90" className="w-full h-10 bg-white/5 rounded-xl text-[9px] text-blue-400 font-bold" />
                        <CheckoutForm lookupKey="pro_anual" label="Anual" description="R$ 179,90" className="w-full h-10 bg-blue-600/20 border border-blue-600/30 rounded-xl text-[9px] text-blue-400 font-bold" />
                    </div>
                </div>
              </div>

              <button onClick={() => openPixModal("Pro", "R$ 19,90", "nucleo-chave-pro.png")} className="w-full p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center group/pix transition-all hover:bg-white/10 text-center">
                <p className="text-[11px] font-black text-white uppercase tracking-tight">Pagar via PIX</p>
                <p className="text-[10px] text-gray-500 font-medium">Liberação assistida</p>
              </button>
            </div>
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700"></div>
          </div>
        </div>
      </div>

      {/* LINHA DIVISÓRIA (DESKTOP) E CONTEXTO INICIAL */}
      <div className="hidden md:block">
        <div className="w-full h-px bg-gray-200 mt-20 mb-10"></div>
        <div className="mb-12">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Por que somos diferentes?</h4>
          <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-3xl">Conheça os pilares que sustentam a segurança e a transparência da nossa plataforma para transformar sua gestão financeira.</p>
        </div>
      </div>

      {/* SEÇÃO DE DIFERENCIAIS (DESKTOP ADAPTADA) */}
      <div className="hidden md:flex flex-row items-center gap-12">
        {/* Lado Esquerdo: Explicação */}
        <div className="w-1/3">
          <h5 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Diferenciais Nucleobase</h5>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
            Desenvolvemos uma infraestrutura focada na sua privacidade e no crescimento do seu patrimônio, garantindo suporte e evolução constante.
          </p>
          <div className="flex gap-3">
            <button onClick={prevCardDesktop} className="p-3 bg-white shadow-md rounded-full text-gray-400 hover:text-blue-600 transition-all border border-gray-100 active:scale-90">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextCardDesktop} className="p-3 bg-white shadow-md rounded-full text-gray-400 hover:text-blue-600 transition-all border border-gray-100 active:scale-90">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Lado Direito: Carrossel de 2 em 2 */}
        <div className="w-2/3 overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-in-out gap-6" 
            style={{ transform: `translateX(-${currentCardDesktop * (50 + 1.5)}%)` }} // 50% largura + gap proporcional
          >
            {diferenciais.map((item, idx) => (
              <div key={idx} className="min-w-[calc(50%-12px)] flex flex-col items-start gap-4 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h5 className="font-black text-gray-900 text-sm uppercase tracking-tight">{item.title}</h5>
                  <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* SEÇÃO MOBILE: DIVISÓRIA E CARROSSEL DE DIFERENCIAIS */}
      <div className="md:hidden">
        <div className="w-full h-px bg-gray-200 mt-16 mb-8"></div>
        <div className="text-center mb-8 px-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Por que somos diferentes?</h4>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">Conheça os pilares que sustentam a segurança e a transparência da nossa plataforma.</p>
        </div>

        <div className="relative px-2">
          {/* Navegação Carrossel Mobile */}
          <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 w-full left-0 z-10 px-1">
            <button onClick={prevCardMobile} className="p-2 bg-white shadow-lg rounded-full text-gray-400 active:scale-90 transition-transform border border-gray-100">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextCardMobile} className="p-2 bg-white shadow-lg rounded-full text-gray-400 active:scale-90 transition-transform border border-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Card Ativo Mobile */}
          <div className="overflow-hidden">
             <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentCardMobile * 100}%)` }}>
                {diferenciais.map((item, idx) => (
                  <div key={idx} className="min-w-full px-10">
                    <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                      <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 mb-4">
                        {item.icon}
                      </div>
                      <h5 className="font-black text-gray-900 text-sm uppercase tracking-tight mb-1">{item.title}</h5>
                      <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          
          {/* Indicadores Mobile */}
          <div className="flex justify-center gap-1.5 mt-6">
            {diferenciais.map((_, idx) => (
              <div key={idx} className={`h-1 rounded-full transition-all ${idx === currentCardMobile ? "w-6 bg-blue-600" : "w-1.5 bg-gray-200"}`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* LINHA DIVISÓRIA FINAL */}
      <div className="w-full h-px bg-gray-100 my-20"></div>

      {/* BANNER INSTAGRAM */}
      <div className="flex flex-col items-center text-center">
        <div className="max-w-3xl">
          <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
            Fique por dentro <br className="md:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
          </h4>
          <p className="text-gray-500 font-medium text-sm md:text-base mb-8">
            Insights, novidades e bastidores da Nucleobase diretamente no seu feed.
          </p>
        </div>
        
        <a 
          href="https://www.instagram.com/nucleobase.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-4 md:gap-6 p-2 pr-6 md:pr-10 bg-white border border-gray-100 rounded-full hover:shadow-2xl hover:border-pink-100 transition-all duration-500 group"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
            <Instagram size={24} className="md:hidden" />
            <Instagram size={32} className="hidden md:block" />
          </div>
          <div className="text-left">
            <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-pink-500 transition-colors">Social Feed</span>
            <span className="block text-lg md:text-xl font-bold text-gray-900">@nucleobase.app</span>
          </div>
        </a>
      </div>

    </div>
  );
}