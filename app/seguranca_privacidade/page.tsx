"use client";
import React from "react";
import { 
  ShieldCheck, 
  LockKeyhole, 
  Fingerprint, 
  ShieldAlert, 
  ArrowUpRight,
  FileLock2,
  MessageSquare,
  Instagram
} from "lucide-react";

export default function PrivacidadeSeguranca() {
  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER - PADRONIZADO COM PÁGINA SOBRE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Segurança e Privacidade<span className="text-blue-600">.</span></span>
            <ShieldCheck size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          
          <h2 className="text-gray-500 text-base md:text-lg font-medium leading-relaxed mt-0">
            Sua tranquilidade é o nosso principal ativo.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href="/faq" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm">
            <ShieldAlert size={14} /> Centro de Ajuda
          </a>
        </div>
      </div>

      {/* LINHA DIVISÓRIA DE SEÇÃO */}
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Protocolos e Diretrizes <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* NARRATIVA PRINCIPAL */}
        <div className="lg:col-span-7 text-gray-700 text-lg leading-[1.8] pr-0 lg:pr-10 flex flex-col">
          <p className="mb-8">
            A segurança no <strong className="text-gray-900 font-bold">App da Núcleo</strong> é tratada como prioridade absoluta. Entendemos que dados financeiros 
            exigem o mais alto nível de atenção, e por isso projetamos uma arquitetura focada na garantia de acesso restrito e 
            proteção da sua identidade.
          </p>

          <div className="bg-white border border-gray-100 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm relative overflow-hidden group flex-1">
             <div className="absolute -right-6 -bottom-6 text-blue-600 opacity-5 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                <LockKeyhole size={180} />
             </div>
             
             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 relative z-10 flex items-center gap-3">
               <Fingerprint className="text-blue-600" /> Autenticação Blindada
             </h3>
            <p className="relative z-10 text-gray-600 text-sm md:text-lg leading-relaxed">
              Para assegurar a total confidencialidade do seu ecossistema financeiro, o acesso é restrito via 
              <strong className="text-gray-900 font-bold"> autenticação criptografada</strong> vinculada a um identificador único. 
              Implementamos protocolos rigorosos de segurança onde sua 
              <strong className="text-gray-900 font-bold"> identificação pessoal é opcional</strong>, permitindo o uso da plataforma sob 
              <strong className="text-gray-900 font-bold"> pseudonimato</strong>. Seus dados são tratados como ativos sensíveis, protegidos por camadas de validação 
              que garantem que a soberania sobre cada movimentação registrada pertença exclusivamente a você.
            </p>
          </div>
        </div>

        {/* SIDEBAR DE DESTAQUES TÉCNICOS - AJUSTE DE PROPORÇÃO (FLEX-1.4 vs FLEX-1) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* CARD INFRAESTRUTURA - AUMENTADO PARA NÃO CORTAR O TEXTO */}
          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex-[1.4]">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <FileLock2 size={180} strokeWidth={1} className="text-blue-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Infraestrutura</p>
                  <h4 className="font-bold text-white text-xl leading-tight">Camada de Dados</h4>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "Criptografia Ponta-a-Ponta",
                  "Arquitetura Segregada",
                  "Conformidade com LGPD",
                  "Monitoramento 24/7"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium border-b border-white/5 pb-3 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD CUSTÓDIA - DIMINUÍDO PROPORCIONALMENTE */}
          <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group flex-1 flex flex-col justify-center">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <ArrowUpRight size={24} />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-lg mb-2 tracking-tight">Custódia de Informação</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                  A Nucleobase não armazena senhas de banco ou tokens de acesso direto. Você mantém o controle total.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COMPROMISSO COM O USUÁRIO */}
        <div className="lg:col-span-12">
          <div className="bg-blue-50/40 border-l-4 border-blue-600 p-10 my-4 rounded-r-[3rem] relative overflow-hidden group transition-all hover:bg-blue-50/60 w-full">
            <h4 className="text-blue-900 font-black text-xs uppercase tracking-[0.2em] mb-4">Compromisso com o Usuário</h4>
            <p className="font-medium text-blue-900 italic text-xl md:text-2xl leading-relaxed relative z-10 tracking-tight">
              "Nossa equipe de engenharia monitora constantemente a integridade da plataforma. Seus dados são 
              criptografados e tratados sob rígidos protocolos de privacidade, seguindo as melhores práticas 
              de conformidade digital."
            </p>
          </div>
        </div>

        {/* SUPORTE */}
        <div className="lg:col-span-12 mt-4">
          <div className="bg-gray-50 border border-gray-100 p-10 md:p-14 rounded-[3.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-3xl">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  Transparência total em cada camada da sua operação.
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed font-medium">
                  Dúvidas sobre protocolos específicos ou pontos sensíveis de conformidade? Nosso time de especialistas em segurança digital está à disposição para fornecer esclarecimentos técnicos.
                </p>
              </div>

              <a 
                href="/contato" 
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-200 shrink-0"
              >
                <MessageSquare size={18} className="group-hover:rotate-12 transition-transform" />
                Acessar Canal de Apoio
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* LINHA DIVISÓRIA "CONECTE-SE" */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM */}
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

      <p className="text-center mt-12 text-gray-400 text-xs font-medium italic">
        Nucleobase App — Segurança em conformidade com as diretrizes globais de proteção de dados.
      </p>
    </div>
  );
}