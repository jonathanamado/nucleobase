"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Save, Heart, KeyRound, X, Share2, Mail, Loader2, Eye, EyeOff, Target, 
  Settings2, ShieldCheck, BellRing, Smartphone, ExternalLink, Instagram,
  Sparkles, Fingerprint
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfiguracoesPage() {
  const [email, setEmail] = useState(""); 
  const [emailContato, setEmailContato] = useState(""); 
  const [slug, setSlug] = useState(""); 
  const [usoApp, setUsoApp] = useState("");
  const [objetivoFinanceiro, setObjetivoFinanceiro] = useState("");
  const [origem, setOrigem] = useState("");
  const [objetivoPlataforma, setObjetivoPlataforma] = useState("");
  
  const [dadosOriginais, setDadosOriginais] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || ""); 
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          const dados = {
            slug: profile.slug || "",
            emailContato: profile.email_contato || "",
            usoApp: profile.uso_app || "",
            objetivoFinanceiro: profile.objetivo_financeiro || "",
            origem: profile.origem || "",
            objetivoPlataforma: profile.objetivo_plataforma || "",
          };
          
          setSlug(dados.slug);
          setEmailContato(dados.emailContato);
          setUsoApp(dados.usoApp);
          setObjetivoFinanceiro(dados.objetivoFinanceiro);
          setOrigem(dados.origem);
          setObjetivoPlataforma(dados.objetivoPlataforma);
          setDadosOriginais(dados);
        }
      } else { window.location.href = "/"; }
      setLoading(false);
    }
    carregarDados();
  }, []);

  const temAlteracoes = dadosOriginais && (
    emailContato !== dadosOriginais.emailContato ||
    usoApp !== dadosOriginais.usoApp ||
    objetivoFinanceiro !== dadosOriginais.objetivoFinanceiro ||
    origem !== dadosOriginais.origem ||
    objetivoPlataforma !== dadosOriginais.objetivoPlataforma
  );

  const handleUpdate = async () => {
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("profiles").upsert({ 
        id: user.id,
        email_contato: emailContato,
        uso_app: usoApp,
        objetivo_financeiro: objetivoFinanceiro,
        origem: origem,
        objetivo_plataforma: objetivoPlataforma,
        updated_at: new Date()
      });
      if (error) alert("Erro: " + error.message);
      else {
        alert("Configurações atualizadas!");
        setDadosOriginais({ emailContato, usoApp, objetivoFinanceiro, origem, objetivoPlataforma });
      }
    }
    setUpdating(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("As senhas não coincidem!");
    setPassLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert("Erro: " + error.message);
    else {
      alert("Senha alterada com sucesso!");
      setShowPassModal(false);
    }
    setPassLoading(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 animate-pulse font-medium">Carregando preferências...</div>;

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Configurações<span className="text-blue-600">.</span></span>
            <Settings2 size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Ajuste a lógica do ecossistema e suas preferências de segurança.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: ACESSO E SEGURANÇA */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* CARD DE IDENTIDADE DIGITAL */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck size={120} />
            </div>
            
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-3">
              <Fingerprint size={16} className="text-blue-600"/> Ecossistema
            </h3>

            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">ID da Plataforma</label>
                  <div className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center text-sm font-bold text-gray-500 select-none">
                    #{slug?.toLowerCase() || "---"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">E-mail de Login</label>
                  <div className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center text-sm font-bold text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap select-none">
                    {email.toLowerCase()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase ml-1 tracking-[0.1em] flex items-center gap-2">
                  <BellRing size={14}/> E-mail para Alertas e Notificações
                </label>
                <input 
                  type="email" 
                  value={emailContato} 
                  placeholder="notificacoes@seuemail.com" 
                  className="w-full h-14 px-5 bg-blue-50/30 border border-blue-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-blue-900" 
                  onChange={(e) => setEmailContato(e.target.value)} 
                />
                <p className="text-[10px] text-gray-400 ml-1">Onde você receberá relatórios e avisos de segurança.</p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setShowPassModal(true)} 
                  className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                >
                  <KeyRound size={16} /> Alterar Senha de Segurança
                </button>
              </div>
            </div>
          </section>

          {/* CARD DE INTEGRAÇÃO (RESIDUAL) */}
          <section className="bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100/50">
             <div className="flex items-start gap-5">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                   <Smartphone size={24} className="text-blue-600" />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-blue-900 mb-1 uppercase tracking-tight">Sessões Ativas</h4>
                   <p className="text-xs text-blue-700/60 leading-relaxed font-medium">Gerencie os dispositivos que possuem acesso à sua conta Nucleobase.</p>
                   <button className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                      Visualizar dispositivos <ExternalLink size={12}/>
                   </button>
                </div>
             </div>
          </section>
        </div>

        {/* COLUNA DIREITA: PREFERÊNCIAS DE USO */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all flex flex-col justify-between flex-1">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <Sparkles size={200} strokeWidth={1} className="text-blue-500" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[12px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-10">
                <Sparkles size={18} fill="currentColor"/> Experiência de Uso
              </h3>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Share2 size={12}/> Como nos conheceu?
                  </label>
                  <select value={origem} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all" onChange={(e) => setOrigem(e.target.value)}>
                    <option value="" className="text-gray-900 italic">Selecione uma opção</option>
                    <option value="instagram" className="text-gray-900">Instagram</option>
                    <option value="google" className="text-gray-900">Google</option>
                    <option value="linkedin" className="text-gray-900">LinkedIn</option>
                    <option value="indicacao" className="text-gray-900">Indicação</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Target size={12}/> Qual seu foco hoje?
                  </label>
                  <select value={objetivoPlataforma} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all" onChange={(e) => setObjetivoPlataforma(e.target.value)}>
                    <option value="" className="text-gray-900 italic">Selecione...</option>
                    <option value="sair_dividas" className="text-gray-900">Sair de dívidas</option>
                    <option value="organizar_gastos" className="text-gray-900">Organizar gastos</option>
                    <option value="guardar_dinheiro" className="text-gray-900">Guardar dinheiro</option>
                    <option value="investir" className="text-gray-900">Começar a investir</option>
                    <option value="liberdade_financeira" className="text-gray-900">Liberdade Financeira</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ritmo de Lançamentos</label>
                  <select value={usoApp} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all" onChange={(e) => setUsoApp(e.target.value)}>
                    <option value="" className="text-gray-900"></option>
                    <option value="uso_pessoal" className="text-gray-900">Uso Diário</option>
                    <option value="trabalho" className="text-gray-900">Constância semanal</option>
                    <option value="estudos" className="text-gray-900">Lançamento mensal</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nicho do Orçamento</label>
                  <select value={objetivoFinanceiro} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all" onChange={(e) => setObjetivoFinanceiro(e.target.value)}>
                    <option value="" className="text-gray-900"></option>
                    <option value="pessoal" className="text-gray-900">Pessoal</option>
                    <option value="familiar" className="text-gray-900">Familiar</option>
                    <option value="empresarial" className="text-gray-900">Empresarial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 text-center">
              <p className="text-[10px] text-blue-100/40 leading-relaxed font-medium">Configurações que moldam seus <br/> relatórios inteligentes.</p>
            </div>
          </section>

          <button 
            onClick={handleUpdate} 
            disabled={updating || !temAlteracoes} 
            className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] hover:bg-blue-700 transition-all font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-30 group"
          >
            <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
            {updating ? "Aplicando..." : "Salvar Configurações"}
          </button>
        </div>
      </div>

      {/* RODAPÉ E SOCIAL */}
      <div className="mt-24 border-t border-gray-100 pt-20 flex flex-col items-center">
        <h4 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tighter mb-8">
          Acompanhe o <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Universo Nucleo.</span>
        </h4>
        <a href="https://www.instagram.com/nucleobase.app/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[2rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-all duration-500">
              <Instagram size={32} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
        </a>
      </div>

      {/* MODAL DE SENHA */}
      {showPassModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowPassModal(false)} className="absolute right-10 top-10 text-gray-300 hover:text-gray-900 transition-colors">
              <X size={28} strokeWidth={1.5} />
            </button>
            <div className="text-center mb-10">
              <div className="bg-blue-50 w-20 h-20 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-6 border border-blue-100 shadow-sm">
                <KeyRound size={36} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Nova Senha</h2>
              <p className="text-gray-400 text-sm mt-2 font-medium">Ajuste seu código de acesso.</p>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Nova senha" required onChange={(e) => setNewPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input type={showPass ? "text" : "password"} placeholder="Confirmar nova senha" required onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
              <button disabled={passLoading} className="w-full bg-gray-900 text-white h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg mt-4 active:scale-95 transition-all disabled:opacity-50">
                {passLoading ? "Atualizando..." : "Confirmar Alteração"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}