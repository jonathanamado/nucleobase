"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Save, KeyRound, X, Settings2, ShieldCheck, BellRing, Smartphone, 
  ExternalLink, Instagram, Fingerprint, ShieldAlert, History, Lock, 
  ShieldEllipsis, CheckCircle2, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfiguracoesPage() {
  const [email, setEmail] = useState(""); 
  const [emailContato, setEmailContato] = useState(""); 
  const [slug, setSlug] = useState(""); 
  
  const [dadosOriginais, setDadosOriginais] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || ""); 
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        
        const { data: factors } = await supabase.auth.mfa.listFactors();
        if ((factors?.all?.length || 0) > 0) setMfaEnabled(true);

        if (profile) {
          const dados = {
            slug: profile.slug || "",
            emailContato: profile.email_contato || "",
          };
          setSlug(dados.slug);
          setEmailContato(dados.emailContato);
          setDadosOriginais(dados);
        }
      } else { window.location.href = "/"; }
      setLoading(false);
    }
    carregarDados();
  }, []);

  const temAlteracoes = dadosOriginais && (emailContato !== dadosOriginais.emailContato);

  const handleUpdate = async () => {
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("profiles").upsert({ 
        id: user.id,
        email_contato: emailContato,
        updated_at: new Date()
      });
      if (error) alert("Erro: " + error.message);
      else {
        alert("Configurações atualizadas!");
        setDadosOriginais({ emailContato });
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

  const toggleMFA = async () => {
    setMfaLoading(true);
    if (!mfaEnabled) {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) alert(error.message);
      else {
        alert("Escaneie o QR Code enviado ao seu e-mail de segurança.");
      }
    } else {
      alert("Para desativar o MFA, entre em contato com o suporte.");
    }
    setMfaLoading(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 animate-pulse font-medium">Carregando preferências de segurança...</div>;

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Configurações da Conta<span className="text-blue-600">.</span></span>
            <ShieldCheck size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-full leading-relaxed mt-0">
            Gerencie suas credenciais e os protocolos de proteção dos seus dados administrativos.
          </p>
        </div>
      </div>

      {/* BLOCO SUPERIOR: CREDENCIAIS + MFA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
        
        {/* COLUNA ESQUERDA: CREDENCIAIS */}
        <section className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-full">
          <div className="relative z-10">
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-3">
              <Fingerprint size={16} className="text-blue-600"/> Credenciais de Acesso
            </h3>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">ID de Auditoria</label>
                  <div className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center text-[12px] md:text-[13px] font-bold text-gray-500 select-none overflow-hidden">
                    <span className="truncate">#{slug?.toLowerCase() || "---"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">E-mail Proprietário</label>
                  <div className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center text-[12px] md:text-[13px] font-bold text-gray-500 select-none overflow-hidden">
                    <span className="truncate">{email.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase ml-1 tracking-[0.1em] flex items-center gap-2">
                  <BellRing size={14}/> Canal de Alertas Críticos
                </label>
                <input 
                  type="email" 
                  value={emailContato} 
                  placeholder="seguranca@suaempresa.com" 
                  className="w-full h-14 px-5 bg-blue-50/30 border border-blue-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-blue-900" 
                  onChange={(e) => setEmailContato(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-3 pt-8 mt-auto">
            <button 
              onClick={() => setShowPassModal(true)} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-gray-900 text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
            >
              <KeyRound size={14} className="hidden sm:block" /> Nova Senha
            </button>
            <button 
              onClick={handleUpdate} 
              disabled={updating || !temAlteracoes}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg disabled:opacity-30"
            >
              <Save size={14} className="hidden sm:block" /> {updating ? "Salvando" : "Salvar"}
            </button>
          </div>
        </section>

        {/* COLUNA DIREITA: MFA COM BANNER EXTERNO */}
        <section className="lg:col-span-5 relative h-full">
          
          <div className="absolute -top-3 right-6 z-20 bg-blue-600 text-white text-[8px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl shadow-blue-500/20 border border-white/20 animate-pulse">
            Em desenvolvimento
          </div>

          <div className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all flex flex-col h-full border border-white/5">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <ShieldEllipsis size={200} strokeWidth={1} className="text-blue-500" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-[12px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                <Smartphone size={18} /> Segundo Fator (MFA)
              </h3>
              
              <div className="flex-1">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${mfaEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {mfaEnabled ? "Ativado" : "Desativado"}
                      </span>
                      <Smartphone className="text-white/20" size={24} />
                    </div>
                    <h4 className="text-white font-bold text-base mb-2">Autenticação por Aplicativo</h4>
                    <p className="text-gray-400 text-[11px] md:text-xs leading-relaxed mb-6">
                      Adicione uma camada extra de segurança. Ao entrar, você precisará de um código gerado pelo Google ou Microsoft Authenticator.
                    </p>
                  </div>
                  
                  <button 
                    onClick={toggleMFA}
                    disabled={mfaLoading}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      mfaEnabled 
                      ? 'bg-transparent border border-white/20 text-white hover:bg-white/10' 
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20'
                    }`}
                  >
                    {mfaLoading ? "Processando..." : mfaEnabled ? "Configurar Novo Dispositivo" : "Ativar MFA Agora"}
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <Link 
                  href="/seguranca_privacidade" 
                  className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mx-auto hover:text-white transition-colors justify-center"
                >
                  <ExternalLink size={14}/> Ver Política de Segurança Nucleobase
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* LINHA DIVISÓRIA PADRONIZADA COM "SOBRE" */}
      <div className="flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Segurança</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* BLOCO INFERIOR: PROTOCOLOS + DISPOSITIVOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* PROTOCOLOS DE PROTEÇÃO */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-3">
            <ShieldAlert size={16} className="text-orange-500"/> Protocolos de Proteção
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
             <div className="p-6 rounded-3xl bg-gray-50 flex flex-col gap-3 justify-center">
                <History className="text-gray-400" size={20} />
                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-700 mb-1">Logs de Atividade</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">Rastreamento completo de todas as alterações na base.</p>
                </div>
             </div>
             <div className="p-6 rounded-3xl bg-gray-50 flex flex-col gap-3 justify-center">
                <Lock className="text-gray-400" size={20} />
                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-700 mb-1">Criptografia AES-256</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">Dados financeiros protegidos por criptografia.</p>
                </div>
             </div>
          </div>
        </section>

        {/* DISPOSITIVOS CONECTADOS COM BANNER EXTERNO */}
        <section className="relative h-full">
          
          <div className="absolute -top-3 right-6 z-20 bg-blue-600 text-white text-[8px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl shadow-blue-500/20 border border-white/20 animate-pulse">
            Em desenvolvimento
          </div>

          <div className="bg-blue-50/40 rounded-[2.5rem] p-8 border border-blue-100/50 flex flex-col justify-center h-full">
            <div className="flex items-start gap-6">
              <div className="bg-white p-5 rounded-[1.5rem] shadow-sm flex-shrink-0">
                 <Smartphone size={28} className="text-blue-600" />
              </div>
              <div className="flex flex-col h-full justify-center">
                 <h4 className="text-sm font-bold text-blue-900 mb-1 uppercase tracking-tight">Dispositivos Conectados</h4>
                 <p className="text-xs text-blue-700/60 leading-relaxed font-medium">Sua conta está ativa em 1 dispositivo no momento.</p>
                 <button className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                   Encerrar outras sessões <ExternalLink size={12}/>
                 </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* NOVA LINHA DIVISÓRIA "CONECTE-SE" CENTRALIZADA (PADRÃO SOBRE) */}
      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Conecte-se
        </h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* BLOCO INSTAGRAM CENTRALIZADO COM GRADIENTE E BRILHO (PADRÃO SOBRE) */}
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
              <p className="text-gray-400 text-sm mt-2 font-medium">Requisito: Mínimo 8 caracteres e símbolos.</p>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Nova senha" required onChange={(e) => setNewPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input type={showPass ? "text" : "password"} placeholder="Confirmar nova senha" required onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold" />
              <button disabled={passLoading} className="w-full bg-gray-900 text-white h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg mt-4 active:scale-95 transition-all disabled:opacity-50">
                {passLoading ? "Validando..." : "Confirmar Alteração"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}