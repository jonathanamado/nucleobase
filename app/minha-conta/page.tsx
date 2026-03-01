"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Save, MapPin, Heart, LogOut, UserCircle, LayoutDashboard, KeyRound, X, Camera, 
  GraduationCap, Share2, Briefcase, Mail, AtSign, Loader2, Eye, EyeOff, Target, Baby, User
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MinhaContaPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState(""); 
  const [emailContato, setEmailContato] = useState(""); 
  const [slug, setSlug] = useState(""); 
  const [telefone, setTelefone] = useState("");
  const [profissao, setProfissao] = useState("");
  const [formacao, setFormacao] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [usoApp, setUsoApp] = useState("");
  const [objetivoFinanceiro, setObjetivoFinanceiro] = useState("");
  const [origem, setOrigem] = useState("");
  
  // NOVOS CAMPOS
  const [possuiFilhos, setPossuiFilhos] = useState("");
  const [objetivoPlataforma, setObjetivoPlataforma] = useState("");
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const aplicarMascaraTelefone = (value: string) => {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert("Erro ao processar imagem: " + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || ""); 
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          setNome(profile.nome_completo || "");
          setSlug(profile.slug || "");
          setEmailContato(profile.email_contato || "");
          setTelefone(profile.telefone || "");
          setProfissao(profile.profissao || "");
          setFormacao(profile.formacao || "");
          setDataNascimento(profile.data_nascimento || "");
          setGenero(profile.genero || "");
          setEstadoCivil(profile.estado_civil || "");
          setCidade(profile.cidade || "");
          setEstado(profile.estado || "");
          setUsoApp(profile.uso_app || "");
          setObjetivoFinanceiro(profile.objetivo_financeiro || "");
          setOrigem(profile.origem || "");
          setAvatarUrl(profile.avatar_url || null);
          setPossuiFilhos(profile.possui_filhos || "");
          setObjetivoPlataforma(profile.objetivo_plataforma || "");
        }
      } else { window.location.href = "/"; }
      setLoading(false);
    }
    carregarDados();
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("profiles").upsert({ 
        id: user.id,
        nome_completo: nome,
        email_contato: emailContato,
        telefone: telefone,
        profissao: profissao,
        formacao: formacao,
        data_nascimento: dataNascimento || null,
        genero: genero,
        estado_civil: estadoCivil,
        cidade: cidade,
        estado: estado,
        uso_app: usoApp,
        objetivo_financeiro: objetivoFinanceiro,
        origem: origem,
        possui_filhos: possuiFilhos,
        objetivo_plataforma: objetivoPlataforma,
        updated_at: new Date()
      });
      if (error) alert("Erro: " + error.message);
      else alert("Dados atualizados com sucesso!");
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

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 animate-pulse font-medium">Sincronizando perfil...</div>;

  return (
    <div className="w-full pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER DA PÁGINA MINHA CONTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-0 tracking-tight flex items-center">
            <span>Minha conta<span className="text-blue-600">.</span></span>
            {/* REMOVIDO skew-x-12 PARA RETIRAR O ITÁLICO DO ÍCONE */}
            <UserCircle size={60} className="text-blue-600 opacity-35 ml-4" strokeWidth={1.2} />
          </h1>
          
          <h2 className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed mt-0">
            Gerencie suas informações e preferências.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => window.location.href = "/acesso-usuario"} className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm">
            <LayoutDashboard size={14} /> Painel do usuário
          </button>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg">
            <LogOut size={14} /> Realizar logoff
          </button>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Perfil e Segurança <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <div className="lg:col-span-8">
          <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative flex flex-col h-full">
            
            <div className="flex flex-col xl:flex-row justify-between items-start mb-12 gap-8">
              {/* BLOCO DA FOTO E TEXTOS ABAIXO */}
              <div className="flex flex-col items-center xl:items-start gap-4">
                <div className="relative group shrink-0">
                  <div className={`w-24 h-24 rounded-[2.5rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all ${uploadingAvatar ? 'opacity-40' : 'opacity-100'}`}>
                    {avatarUrl ? <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserCircle size={48} className="text-gray-200" />}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-[2.5rem] cursor-pointer transition-all">
                    <Camera size={24} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadAvatar} disabled={uploadingAvatar} />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                {/* TEXTOS ABAIXO DA FOTO */}
                <div className="text-center xl:text-left">
                  <h4 className="text-xl font-bold text-gray-900 mb-1 text-center">Dados Cadastrais</h4>
                </div>
              </div>

              {/* BLOCO ID USUÁRIO E LOGIN COM DISTÂNCIA DA BORDA */}
              <div className="w-full xl:max-w-md bg-gray-50/80 p-6 rounded-[2.5rem] border border-gray-100 space-y-4 shadow-inner xl:mr-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-2 shrink-0"><AtSign size={12}/> ID Usuário</span>
                    <span className="text-xs font-bold text-gray-700 truncate text-right">{slug || "---"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-gray-200/50 pt-3 px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-2 shrink-0"><Mail size={12}/> Login </span>
                    <span className="text-xs font-medium text-gray-500 italic truncate text-right">{email}</span>
                  </div>
                </div>
                <button onClick={() => setShowPassModal(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-gray-500 uppercase hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm">
                  <KeyRound size={14} /> Alterar senha de acesso
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">Nome Completo</label>
                <input type="text" value={nome} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" onChange={(e) => setNome(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase ml-1 tracking-[0.1em]">E-mail de Notificações</label>
                <input type="email" value={emailContato} placeholder="seu-email@exemplo.com" className="w-full h-12 px-5 bg-blue-50/30 border border-blue-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-blue-900" onChange={(e) => setEmailContato(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">Telefone de Contato</label>
                <input type="text" value={telefone} placeholder="(00) 00000-0000" className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all" onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">Gênero</label>
                <select value={genero} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white outline-none" onChange={(e) => setGenero(e.target.value)}>
                  <option value=""></option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro / Prefiro não dizer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">Estado Civil</label>
                <select value={estadoCivil} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white outline-none" onChange={(e) => setEstadoCivil(e.target.value)}>
                  <option value=""></option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="uniao_estavel">União Estável</option>
                  <option value="divorciado">Divorciado(a)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">Data de Nascimento</label>
                <input type="date" value={dataNascimento} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white outline-none transition-all" onChange={(e) => setDataNascimento(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em] flex items-center gap-2"><Baby size={14}/> Possui filhos?</label>
                <select value={possuiFilhos} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white outline-none" onChange={(e) => setPossuiFilhos(e.target.value)}>
                  <option value=""></option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em] flex items-center gap-2"><MapPin size={14}/> Cidade</label>
                <input type="text" value={cidade} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white outline-none" onChange={(e) => setCidade(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em]">UF</label>
                <select value={estado} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white outline-none" onChange={(e) => setEstado(e.target.value)}>
                  <option value=""></option>
                  {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em] flex items-center gap-2"><Briefcase size={14}/> Profissão Atual</label>
                <input type="text" value={profissao} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white outline-none" onChange={(e) => setProfissao(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-[0.1em] flex items-center gap-2"><GraduationCap size={14}/> Formação Acadêmica</label>
                <select value={formacao} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white outline-none" onChange={(e) => setFormacao(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="fundamental">Ensino Fundamental</option>
                  <option value="medio">Ensino Médio</option>
                  <option value="superior">Ensino Superior</option>
                  <option value="pos">Pós-graduação</option>
                  <option value="mestrado">Mestrado</option>
                  <option value="doutorado">Doutorado</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA: SIDEBAR DE PREFERÊNCIAS */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          <section className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl shadow-blue-900/10 group relative overflow-hidden transition-all hover:scale-[1.01] flex flex-col justify-between flex-1">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <Heart size={200} strokeWidth={1} className="text-blue-500" />
            </div>

            <div className="relative z-10">
              <h3 className="text-[12px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-10">
                <Heart size={18} fill="currentColor"/> Preferências
              </h3>
              
              <div className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Share2 size={12}/> Canal de Origem
                  </label>
                  <select value={origem} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all" onChange={(e) => setOrigem(e.target.value)}>
                    <option value="" className="text-gray-900 italic">Selecione uma opção</option>
                    <option value="instagram" className="text-gray-900">Instagram</option>
                    <option value="google" className="text-gray-900">Google</option>
                    <option value="linkedin" className="text-gray-900">LinkedIn</option>
                    <option value="youtube" className="text-gray-900">YouTube</option>
                    <option value="indicacao" className="text-gray-900">Indicação</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Target size={12}/> Objetivo Principal
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Frequência de Uso</label>
                  <select value={usoApp} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all" onChange={(e) => setUsoApp(e.target.value)}>
                    <option value="" className="text-gray-900"></option>
                    <option value="uso_pessoal" className="text-gray-900">Uso Diário</option>
                    <option value="trabalho" className="text-gray-900">Constância semanal</option>
                    <option value="estudos" className="text-gray-900">Lançamento mensal</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foco do Orçamento</label>
                  <select value={objetivoFinanceiro} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all" onChange={(e) => setObjetivoFinanceiro(e.target.value)}>
                    <option value="" className="text-gray-900"></option>
                    <option value="pessoal" className="text-gray-900">Pessoal</option>
                    <option value="familiar" className="text-gray-900">Familiar</option>
                    <option value="empresarial" className="text-gray-900">Empresarial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 group-hover:bg-white/10 transition-all">
                <p className="text-[11px] text-blue-100/60 leading-relaxed italic font-medium">
                  Estes dados otimizam a sua experiência no ecossistema <span className="text-blue-400">nucleobase.app</span>.
                </p>
              </div>
            </div>
          </section>

          {/* BOTÃO DE SALVAR */}
          <button onClick={handleUpdate} disabled={updating} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] hover:bg-blue-700 transition-all font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 group">
            <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
            {updating ? "Sincronizando..." : "Salvar Alterações"}
          </button>
        </div>
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
              <p className="text-gray-400 text-sm mt-2 font-medium">Redefina seu acesso com segurança.</p>
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