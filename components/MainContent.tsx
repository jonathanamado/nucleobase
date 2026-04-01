"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { 
  Zap, ArrowRight, Mail, Newspaper, ShieldCheck, 
  BarChart3, MessageSquare, Lock, 
  Users, Gift, X, Loader2, CheckCircle2, FileWarning,
  LayoutDashboard, Instagram, Dna, Play
} from "lucide-react"; 
import { supabase } from "@/lib/supabase"; 

export function MainContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    formData.append("access_key", "9ef5a274-150a-4664-a885-0b052efd06f7");
    formData.append("subject", "Nova Inscrição na Newsletter - Home Nucleobase");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase
        .from("newsletter")
        .insert([{ email: email, user_id: user?.id || null }]);
      if (dbError && dbError.code !== '23505') throw dbError;
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) setEnviado(true);
      else throw new Error("Erro no serviço de e-mail");
    } catch (err) {
      console.error("Erro no processamento:", err);
      alert("Erro ao processar assinatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white text-gray-900 min-h-screen">
      
      {/* --- MODAL DE NEWSLETTER --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative shadow-2xl scale-in-center">
            <button 
              onClick={() => {setIsModalOpen(false); setEnviado(false);}} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={24} />
            </button>
            {!enviado ? (
              <>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-blue-600"><Mail size={24} /></span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Assinar Newsletter</h3>
                <p className="text-gray-500 mb-8 font-medium">Insights financeiros e estratégicos toda semana.</p>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input required type="email" name="email" placeholder="Seu melhor e-mail" className="w-full bg-gray-50 border-transparent rounded-2xl py-4 px-6 text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Inscrever-se agora"}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo à lista!</h3>
                <p className="text-gray-500 font-medium text-sm">Inscrição confirmada com sucesso.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          LAYOUT MOBILE MODERNIZADO
          ============================================================ */}
      <div className="block lg:hidden px-4 pb-20 space-y-10 animate-in fade-in duration-700">
        
        {/* HERO SECTION MOBILE */}
        <div className="mt-0 pt-2 space-y-8 text-left">
          <div className="relative space-y-2">
             <h1 className="text-3xl font-bold text-gray-900 tracking-tighter flex items-center gap-1">
               <span>Nucleobase<span className="text-blue-600">.</span></span>
               <span className="text-gray-400 font-light">app</span>
               <Zap size={22} className="text-orange-500 fill-orange-500 ml-1 animate-pulse" />
             </h1>
             
             <p className="text-gray-500 text-base font-medium leading-tight max-w-[280px]">
               Seu controle financeiro centralizado em uma <span className="text-gray-900">plataforma única.</span>
             </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.6rem] blur opacity-10"></div>
            <div className="relative bg-white border border-gray-100 p-7 rounded-[2.5rem] shadow-xl shadow-blue-900/5">
              <div className="mb-6">
                <p className="text-gray-700 text-base leading-snug font-medium text-center">
                  Você acaba de chegar ao APP em que números brutos tornam-se <span className="text-gray-900 font-bold not-italic">decisões inteligentes e práticas</span> para o seu dia a dia. Clique na <span className="text-blue-600 font-bold">Logo</span> <LayoutDashboard size={14} strokeWidth={3} className="inline-block text-blue-600 mb-1" /> abaixo, acesse seu <span className="text-gray-900 font-bold not-italic">'Painel'</span> e profissionalize seu controle.
                </p>
              </div>
              
              <Link 
                href="/acesso-usuario" 
                className="grid grid-cols-[1fr_auto_1fr] items-center w-full p-2 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-[0.96] transition-all hover:bg-black"
              >
                <div className="w-[36px]" aria-hidden="true" />
                <span className="text-center">Acessar<br />Área do Usuário</span>
                <div className="flex justify-end">
                  <div className="bg-blue-600 p-2 rounded-xl shadow-inner flex items-center justify-center">
                    <LayoutDashboard size={20} />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-start gap-5 pt-0">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 shrink-0">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <Link href="/cadastro" className="group flex items-center gap-2">
                  <p className="text-gray-500 text-[12px] font-bold leading-tight group-hover:text-gray-900 transition-colors">
                    Junte-se ao time da Nucleo
                  </p>
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <ArrowRight size={12} />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-4">
              Tour Rápido <div className="h-px bg-gray-200 flex-1"></div>
            </h3>

            <div className="space-y-3 px-2">
                <p className="text-gray-600 text-base leading-relaxed font-medium py-1">
                  Assista ao nosso vídeo institucional e entenda como a <span className="text-gray-900 font-bold">Nucleobase</span> transforma sua gestão financeira em poucos cliques.
                </p>
                <Link href="/demonstracao" className="group flex items-center gap-2 mb-8">
                  <span className="text-gray-600 text-base font-bold underline hover:text-blue-600 transition-colors">
                    <u>Explore as dicas que criamos e aproveite o máximo da plataforma.</u>
                  </span>
                </Link>
            </div>

            <div className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-gray-100 shadow-lg">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/tmQMvox673g" 
                title="Nucleobase Tour" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0 flex items-center gap-4">
            Informativos e acessos <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          <p className="text-gray-600 text-base leading-relaxed font-medium py-1">
            A <span className="text-gray-900 font-bold">Nucleobase</span> é o seu centro de comando. Diferente de planilhas complexas, traduzimos seu controle financeiro em inteligência estratégica para que você reduza custos. Conheça a nossa história e os nossos objetivos <Link href="/sobre" className="font-bold underline hover:text-blue-600 transition-colors"><u>clicando aqui</u></Link>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={() => setIsModalOpen(true)} className="col-span-1 bg-blue-50 p-6 rounded-3xl flex flex-col gap-4 border border-blue-100 text-left relative overflow-hidden active:scale-95 transition-transform">
                <Mail className="text-blue-600" size={24} />
                <span className="font-bold text-[10px] uppercase tracking-widest text-gray-800">Assinar Newsletter</span>
            </button>
            <Link href="/blog" className="col-span-1 bg-gray-50 p-6 rounded-3xl flex flex-col gap-4 border border-gray-100 text-left active:scale-95 transition-transform">
                <Newspaper className="text-gray-400" size={24} />
                <span className="font-bold text-[10px] uppercase tracking-widest text-gray-800">Blog da Nucleo</span>
            </Link>

            <Link href="/resultados" className="col-span-2 bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-lg shadow-gray-200/50 active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 blur-lg opacity-20"></div>
                        <div className="relative p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                            <BarChart3 size={22} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-[11px] uppercase tracking-[0.15em] text-gray-900">
                            Painel de Resultados
                        </span>
                        <span className="text-[9px] text-gray-400 text-center font-medium uppercase tracking-wider">
                            Análise em tempo real
                        </span>
                    </div>
                </div>
            </Link>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-4">
                <p className="text-blue-400 text-[10px] uppercase font-black tracking-widest">O seu controle</p>
                <h4 className="text-base font-bold">Pronto para o próximo nível?</h4>
                <Link href="/cadastro" className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform">
                    Criar conta gratuita <ArrowRight size={16} />
                </Link>
            </div>
            <ShieldCheck size={120} className="absolute -right-8 -bottom-8 text-white opacity-5" />
        </div>

        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-4">
            Segurança <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          <Link href="/seguranca_privacidade" className="block bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2.5rem] relative overflow-hidden active:bg-emerald-50 transition-colors">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <Lock size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Privacidade e Dados</h4>
              <p className="text-gray-500 text-xs font-medium mb-4">Sua soberania digital é nossa prioridade.</p>
              <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit">
                Acesse aqui <ArrowRight size={10} />
              </span>
            </div>
          </Link>
        </section>

        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-4">
            Canais e Contato <div className="h-px bg-gray-300 flex-1"></div>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/suporte" className="bg-gray-50 p-6 rounded-3xl flex flex-col gap-2 border border-gray-100 active:bg-gray-100 transition-colors">
                <FileWarning size={20} className="text-amber-500" />
                <span className="font-bold text-[10px] uppercase text-gray-800">Suporte</span>
            </Link>
            <Link href="/contato" className="bg-emerald-50 p-6 rounded-3xl flex flex-col gap-2 border border-emerald-100 active:bg-emerald-100 transition-colors">
                <MessageSquare size={20} className="text-emerald-600" />
                <span className="font-bold text-[10px] uppercase text-gray-800">Contato</span>
            </Link>
            <Link href="/indique" className="bg-blue-50 p-6 rounded-3xl flex flex-col gap-2 border border-blue-100 active:bg-blue-100 transition-colors">
                <Gift size={20} className="text-blue-600" />
                <span className="font-bold text-[10px] uppercase text-gray-800">Indicar</span>
            </Link>
            <Link href="/parceria" className="bg-orange-50 p-6 rounded-3xl flex flex-col gap-2 border border-orange-100 active:bg-orange-100 transition-colors">
                <Users size={20} className="text-orange-600" />
                <span className="font-bold text-[10px] uppercase text-gray-800">Parceria</span>
            </Link>
          </div>
        </section>

        <section className="pb-10 pt-4">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-gray-200 flex-1"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
              Conecte-se
            </h3>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-8">
                <h4 className="text-2xl font-bold text-gray-900 tracking-tighter mb-2 leading-tight">
                  Fique por dentro <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
                </h4>
                <p className="text-gray-500 font-medium text-xs mx-auto max-w-[280px]">Insights, novidades e bastidores da Nucleobase diretamente no seu feed.</p>
            </div>
            
            <a 
              href="https://www.instagram.com/nucleobase.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
                <div className="w-20 h-20 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[1.8rem] flex items-center justify-center text-white shadow-lg relative z-10 group-hover:rotate-6 transition-all duration-500">
                  <Instagram size={40} strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
                <div className="h-0.5 w-0 bg-pink-500 mt-1 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            </a>
          </div>
        </section>
      </div>

      {/* ============================================================
          LAYOUT DESKTOP
          ============================================================ */}
      <div className="hidden lg:block w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
        <div className="mb-12 mt-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Nucleobase<span className="text-blue-600">.APP</span></span>
            <Zap size={32} className="text-blue-600 skew-x-[-15deg] opacity-30 ml-4" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-lg font-medium leading-relaxed mt-0">
            Organização financeira inteligente.
          </h2>
        </div>

        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
          Quem somos <div className="h-px bg-gray-300 flex-1"></div>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="mb-0">
              <p className="text-base text-gray-600 leading-relaxed pr-6">
                A <strong>nucleobase.app</strong> é uma plataforma digital, totalmente online, focada em organização financeira simples e consciente. Através do seu{" "}
                <span className="inline-flex items-center justify-center bg-orange-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
                  Acesso ao APP
                </span>{" "}
                , você centraliza seu controle de gastos diários ou parcelados, reduzindo dependência em planilhas manuais. Na consulta de{" "}
                <span className="inline-flex items-center justify-center bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm uppercase align-middle">
                  Resultados
                </span>{" "}
                , transformamos dados em informações{" "}
                <span className="text-gray-900 underline decoration-2 decoration-orange-500/30 underline-offset-4 font-medium">
                  oferecendo clareza para você entender onde economizar e como acelerar seus projetos pessoais ou profissionais.
                </span>
              </p>
              
              <div className="flex items-center gap-3 mt-5 animate-in fade-in duration-1000">
                <div className="flex -space-x-2 shrink-0">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <Link href="/cadastro" className="group flex items-center gap-2">
                  <p className="text-gray-500 text-[12px] font-bold leading-tight group-hover:text-gray-900 transition-colors">
                    Junte-se ao time da Nucleo e cresça com a gente
                  </p>
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <ArrowRight size={12} />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex">
            <Link href="/lancamentos" className="flex-1 bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center w-full">
              <div className="bg-orange-50 p-3 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 mb-4">
                <LayoutDashboard size={24} />
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-1">Acessar APP</h4>
              <p className="text-[11px] text-gray-500 leading-tight mb-4">Gerencie seus lançamentos e controle seu fluxo de caixa.</p>
              <div className="w-full mt-auto py-2.5 bg-orange-50/50 border border-orange-100 text-orange-600 rounded-xl font-bold text-[10px] uppercase tracking-widest group-hover:bg-orange-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                Entrar agora <ArrowRight size={12} />
              </div>
            </Link>
          </div>

          <div className="lg:col-span-3 flex">
            <Link href="/resultados" className="flex-1 bg-blue-50/50 border border-blue-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center w-full">
              <div className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mb-4">
                <BarChart3 size={24} />
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-1">Visão Resultados</h4>
              <p className="text-[11px] text-gray-600 leading-tight mb-4">Analise sua performance financeira estratégica.</p>
              <div className="w-full mt-auto py-2.5 bg-white border border-blue-200 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                Ver Painel <ArrowRight size={12} />
              </div>
            </Link>
          </div>
        </div>

        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
          O que fazemos <div className="h-px bg-gray-300 flex-1"></div>
        </h3>

        {/* --- SEÇÃO DO VÍDEO DESKTOP --- */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-10 items-stretch mb-16">
          <div className="md:col-span-8 relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[3.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="relative aspect-video bg-gray-900 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/tmQMvox673g" 
                title="Nucleobase Overview" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
          
          <div className="md:col-span-4 flex flex-col">
            <div className="h-full border border-gray-100 bg-gray-50/30 p-6 rounded-[2.5rem] flex flex-col justify-between shadow-sm">
              
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 px-4 py-2 bg-gray-900/5 backdrop-blur-md border border-gray-200/50 rounded-2xl w-full">
                  <h4 className="text-sm font-bold tracking-tight text-gray-900 uppercase">
                    Nucleo em ação.
                  </h4>
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-lg shadow-lg shadow-blue-200 animate-pulse">
                    <Play fill="white" size={12} className="ml-0.5" />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    Faça um tour rápido pela interface e descubra como simplificamos o que antes era complexo.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {/* Item 01 */}
                    <div className="flex flex-col gap-2">
                      <Link href="/demonstracao" className="group/thumb relative aspect-video bg-white rounded-xl overflow-hidden border border-gray-200 transition-all hover:border-blue-300 shadow-sm">
                        <img 
                          src="/imagem-miniatura-criar-conta.png" 
                          alt="Como criar conta" 
                          className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 group-hover/thumb:bg-gray-900/0 transition-all">
                          <div className="bg-[#FF0000] p-1 rounded-md shadow-lg">
                            <Play fill="white" size={8} className="text-white ml-0.5" />
                          </div>
                        </div>
                      </Link>
                      <span className="text-[9px] font-bold text-gray-400 uppercase leading-tight text-center">
                        Criar<br />Conta
                      </span>
                    </div>

                    {/* Item 02 */}
                    <div className="flex flex-col gap-2">
                      <Link href="/demonstracao" className="group/thumb relative aspect-video bg-white rounded-xl overflow-hidden border border-gray-200 transition-all hover:border-blue-300 shadow-sm">
                        <img 
                          src="/imagem-miniatura-realizar-lancamento.png" 
                          alt="Como realizar lançamento" 
                          className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 group-hover/thumb:bg-gray-900/0 transition-all">
                          <div className="bg-[#FF0000] p-1 rounded-md shadow-lg">
                            <Play fill="white" size={8} className="text-white ml-0.5" />
                          </div>
                        </div>
                      </Link>
                      <span className="text-[9px] font-bold text-gray-400 uppercase leading-tight text-center">
                        Realizar<br />Lançamento
                      </span>
                    </div>

                    {/* Item 03 */}
                    <div className="flex flex-col gap-2">
                      <Link href="/demonstracao" className="group/thumb relative aspect-video bg-white rounded-xl overflow-hidden border border-gray-200 transition-all hover:border-blue-300 shadow-sm">
                        <img 
                          src="/imagem-miniatura-acompanhar-resultado.png" 
                          alt="Como acompanhar resultados" 
                          className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 group-hover/thumb:bg-gray-900/0 transition-all">
                          <div className="bg-[#FF0000] p-1 rounded-md shadow-lg">
                            <Play fill="white" size={8} className="text-white ml-0.5" />
                          </div>
                        </div>
                      </Link>
                      <span className="text-[9px] font-bold text-gray-400 uppercase leading-tight text-center">
                        Analisar<br />Resultado
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/demonstracao" className="group/link block pt-4 border-t border-gray-100">
                <span className="text-[13px] font-bold text-orange-600 leading-snug group-hover/link:text-orange-700 transition-colors">
                  Confira dicas sobre a plataforma e suas funcionalidades, <span className="underline underline-offset-4 decoration-2">clique aqui.</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full mb-12">
          <p className="text-gray-600 text-base leading-[1.8]">
            <span className="text-gray-900 font-semibold">Acreditamos que</span> a verdadeira inteligência financeira nasce da união entre clareza de dados e disciplina, transformando números isolados em um roteiro seguro. <span className="text-gray-900 font-semibold">Desenvolvemos uma tecnologia</span> que não apenas organiza estes números, mas traduz comportamentos. <span className="text-gray-900 font-semibold">Ao eliminar a complexidade de planilhas,</span> permitimos que você foque no que importa: entender e agir. Saiba mais sobre a Nucleo 
            <Link href="/sobre" className="inline-flex items-center ml-2 group">
              <span className="bg-blue-600 text-white px-2 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm hover:bg-blue-700 transition-colors uppercase tracking-wider">
                clicando aqui.
              </span>
            </Link>
          </p>
        </div>

        <div className="w-full bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group mb-12">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <p className="text-blue-400 text-xs uppercase tracking-[0.3em] font-black mb-4">A ferramenta certa</p>
              <h4 className="text-2xl md:text-2xl font-bold leading-tight">
                A Nucleobase é o seu centro de comando. Diferente de planilhas complexas, traduzimos seu controle financeiro em inteligência estratégica para que você reduza custos.
              </h4>
            </div>
            <a href="/cadastro" className="shrink-0 inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full transition-all font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-900/20 group-hover:scale-105">
              Criar conta gratuita <ArrowRight size={20} />
            </a>
          </div>
          <ShieldCheck size={240} className="absolute -right-10 -bottom-20 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>

        <div className="space-y-12">
          <section>
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
              Segurança de Dados <div className="h-px bg-gray-300 flex-1"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-stretch">
              <div className="md:col-span-7 bg-emerald-50/50 border border-emerald-100 p-10 rounded-[3rem] flex flex-row gap-8 items-center relative overflow-hidden">
                <div className="w-20 h-20 bg-white text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-sm shrink-0">
                  <Lock size={40} />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Segurança e Privacidade</h4>
                  <p className="text-gray-600 text-base font-medium leading-relaxed mb-4">Custódia integral sob o princípio do Zero-Knowledge.</p>
                  <div className="flex gap-2">
                    <Link href="/seguranca_privacidade" className="group flex-1">
                        <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center justify-center text-center gap-2 w-full h-full">
                          Acesse a área de Segurança aqui <ArrowRight size={12} />
                        </span>
                    </Link>
                    <Link href="/politica-de-cookies" className="group flex-1">
                        <span className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-black transition-all uppercase tracking-widest flex items-center justify-center text-center gap-2 w-full h-full">
                          Conheça nossa política aqui <ArrowRight size={12} />
                        </span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 flex flex-col justify-center text-right pr-6">
                 <h4 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight leading-tight">Soberania digital reconhecida</h4>
                 <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                   Sua soberania digital é nossa prioridade. Implementamos padrões de criptografia de ponta para garantir que apenas você acesse seus dados.
                 </p>
                 <Link href="/depoimentos" className="group w-fit ml-auto">
                    <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest inline-flex items-center gap-2">
                      CLIQUE AQUI <ArrowRight size={12} />
                    </span>
                 </Link>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
              Painel de Resultados <div className="h-px bg-gray-300 flex-1"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-stretch">
              <div className="md:col-span-7 text-left flex flex-col justify-center">
                <h4 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">Sua visão 360º diretamente no seu Painel</h4>
                <p className="text-gray-600 text-base leading-relaxed mb-8">
                  Mais do que números, entregamos inteligência financeira. O Dashboard da Nucleobase processa seus dados para oferecer diagnósticos precisos.
                </p>
                <Link href="/resultados" className="group w-fit">
                  <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest inline-flex items-center gap-2">
                    CLIQUE AQUI <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
              <Link href="/resultados" className="md:col-span-5 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl group hover:border-blue-100 transition-all flex flex-col justify-center min-h-[280px]">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <BarChart3 size={32} />
                </div>
                <h5 className="font-bold text-gray-900 mb-2">Análise de Performance</h5>
                <p className="text-gray-500 text-sm leading-relaxed">Visualize tendências e identifique gargalos.</p>
              </Link>
            </div>
          </section>

          <section className="pb-20">
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
              Canais e Oportunidades <div className="h-px bg-gray-300 flex-1"></div>
            </h3>
            <div className="grid grid-cols-4 gap-6 mb-20">
                {[
                { href: "/suporte", icon: <FileWarning size={28} className="text-amber-500" />, title: "Suporte Técnico", label: "Abrir Chamado", bg: "bg-gray-50", hover: "hover:bg-gray-900" },
                { href: "/contato", icon: <MessageSquare size={28} className="text-emerald-600" />, title: "Fale Conosco", label: "Contactar-nos", bg: "bg-emerald-50/50", hover: "hover:bg-emerald-600" },
                { href: "/indique", icon: <Gift size={28} className="text-blue-600" />, title: "Indique e Ganhe", label: "Gerar Link", bg: "bg-blue-50/50", hover: "hover:bg-blue-600" },
                { href: "/parceria", icon: <Users size={28} className="text-orange-600" />, title: "Seja Parceiro", label: "Amplie Parceria", bg: "bg-orange-50/50", hover: "hover:bg-orange-500" }
                ].map((item, idx) => (
                <div key={idx} className={`${item.bg} border border-gray-100 rounded-[2.5rem] p-8 h-[280px] flex flex-col justify-between group ${item.hover} transition-all duration-500`}>
                    <div>
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-white">{item.title}</h4>
                    </div>
                    <a href={item.href} className="w-fit bg-gray-900 text-white px-6 py-3 rounded-full font-bold text-[10px] uppercase group-hover:bg-white group-hover:text-gray-900 transition-all">{item.label}</a>
                </div>
                ))}
            </div>

            {/* AJUSTE DESKTOP INSTAGRAM COM DIVISÓRIA */}
            <div className="mt-24 flex items-center gap-4 mb-12">
              <div className="h-px bg-gray-200 flex-1"></div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
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
          </section>
        </div>
      </div>
    </div>
  );
}