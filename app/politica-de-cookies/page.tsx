"use client";
import React, { useEffect } from "react";
import { 
  ShieldCheck, 
  Cookie, 
  Lock, 
  ShieldAlert,
  Fingerprint,
  Database,
  Instagram
} from "lucide-react";

export default function CookiePolicy() {
  
  useEffect(() => {
    window.dataLayer?.push({
      event: "view_page_content",
      content_category: "institucional",
      content_name: "politica_cookies"
    });
  }, []);

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER DA PÁGINA PADRONIZADO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Privacidade<span className="text-blue-600">.</span></span>
            <Cookie size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          
          <h2 className="text-gray-500 text-base md:text-lg font-medium w-full leading-relaxed mt-0">
            Transparência total sobre nossos cookies funcionais.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Nossas Diretrizes <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-20">
        
        {/* NARRATIVA PRINCIPAL - ENRIQUECIDA PARA ALINHAMENTO DE ALTURA */}
        <div className="lg:col-span-7 text-gray-700 text-lg leading-[1.8] pr-0 lg:pr-10 flex flex-col justify-between">
          <div className="space-y-8">
            <p className="text-gray-700">
              Na <strong>Nucleobase</strong>, a sua segurança é o nosso alicerce. Ao contrário da maioria das plataformas de gestão, 
              <span className="text-blue-600 font-bold ml-1">optamos por um ecossistema limpo</span>: não utilizamos cookies de terceiros para publicidade, remarketing ou rastreamento de comportamento fora do nosso domínio.
            </p>

            {/* MANIFESTO DE PRIVACIDADE PADRONIZADO */}
            <div 
              onMouseEnter={() => window.dataLayer?.push({ event: "reading_privacy_manifesto" })}
              className="bg-blue-50/40 border-l-4 border-blue-600 p-6 md:p-10 my-8 rounded-2xl md:rounded-r-[3rem] relative overflow-hidden group transition-all hover:bg-blue-50/60"
            >
              <ShieldCheck className="absolute -right-6 -bottom-6 text-blue-600 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" size={180} />
              <p className="font-medium text-blue-900 italic text-xl md:text-2xl leading-relaxed relative z-10 tracking-tight">
                "Não vendemos seus hábitos financeiros. Nossos cookies existem apenas para garantir que sua experiência seja fluida, segura e privada."
              </p>
            </div>

            <p className="text-gray-700">
              Entendemos que dados financeiros são sensíveis. Por isso, toda a inteligência de visualização de resultados e lançamentos é processada de forma <span className="text-gray-900 font-bold underline decoration-blue-200 underline-offset-4 decoration-2">nativa e interna</span>. Os cookies que emitimos são técnicos e fundamentais para a estabilidade da sua conta.
            </p>

            <p className="text-gray-700">
              Nossa arquitetura foi desenhada sob o princípio de <strong>Privacy by Design</strong>. Isso significa que a cada nova funcionalidade implementada, a primeira pergunta que respondemos é como proteger a identidade do usuário. Ao eliminar scripts de rastreamento de Big Techs, reduzimos drasticamente o tempo de carregamento da interface e removemos qualquer possibilidade de vazamento de preferências de consumo para algoritmos de vendas externos.
            </p>

            <p className="text-gray-700">
              Ao navegar pela plataforma, você tem a garantia de que seu fluxo de caixa e patrimônio permanecem em um ambiente isolado. O controle consciente que defendemos começa pela clareza de saber que, aqui, você não é o produto — você é o estrategista. Sua soberania digital é respeitada através de sessões criptografadas que expiram automaticamente para sua proteção.
            </p>
          </div>
        </div>

        {/* SIDEBAR DE ATRIBUTOS TÉCNICOS - MANTIDA INTEGRALMENTE */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* CARD DE STATUS CRIPTOGRÁFICO */}
          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex flex-col justify-center flex-1 min-h-[180px]">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <Lock size={180} strokeWidth={1} className="text-blue-500" />
            </div>

            <div className="relative z-10 w-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 shrink-0 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Fingerprint size={24} />
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Segurança Base</p>
                  <h4 className="font-bold text-white text-xl leading-tight">Dados Blindados</h4>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                Cookies essenciais que protegem sua sessão contra acessos não autorizados e garantem a integridade do seu DNA financeiro.
              </p>
            </div>
          </div>

          {/* LISTA DE COOKIES NECESSÁRIOS */}
          {[
            { id: "auth_supabase", icon: <ShieldAlert size={24} />, title: "Autenticação", desc: "Mantém seu login seguro." },
            { id: "stripe_payment", icon: <Database size={24} />, title: "Transacional", desc: "Integridade das assinaturas." },
            { id: "ui_preferences", icon: <Lock size={24} />, title: "Preferências", desc: "Retém suas escolhas de UI." }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onMouseEnter={() => window.dataLayer?.push({ event: "hover_cookie_type", cookie_id: item.id })}
              className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group flex items-center gap-6 flex-1"
            >
              <div className="w-14 h-14 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                {item.icon}
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-lg mb-1 tracking-tight">{item.title}</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO */}
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