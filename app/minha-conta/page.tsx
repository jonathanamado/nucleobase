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
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Minha conta<span className="text-blue-600">.</span></span>
            <UserCircle size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          
          <h2 className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed mt-0">
            <span className="hidden md:block">Gerencie suas informações e preferências.</span>
            <span className="block md:hidden">Gerencie seus dados.</span>
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2 flex items-center gap-4">
          Perfil e Segurança <div className="h-px bg-gray-300 flex-1"></div>
        </h3>
        
        {/* GRID SINCRONIZADO COM O CONTEÚDO ABAIXO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* TEXTO DE IDENTIFICAÇÃO (OCUPA A MESMA LARGURA DO FORMULÁRIO) */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500 font-medium leading-relaxed">
              {/* VERSÃO DESKTOP */}
              <span className="hidden md:inline">
                Olá{nome ? ` ${nome.split(' ')[0]}` : ","} , você poderá logar em qualquer dispositivo utilizando seu id ou e-mail e sua senha de acesso. Suas identificações na Nucleo são:
              </span>
              
              {/* VERSÃO MOBILE RESUMIDA */}
              <span className="inline md:hidden">
                Olá{nome ? ` ${nome.split(' ')[0]}` : ""}, acesse sua conta com:
              </span>
              
              <div className="flex flex-col text-[11px] font-bold text-gray-900 leading-tight tracking-tighter select-none">
                <span className="bg-blue-600 text-white px-1.5 pt-1 pb-0.5 rounded-md text-[10px] shadow-sm inline-block lowercase">
                  #{slug?.toLowerCase() || "---"}
                </span>
              </div>

              <span>e</span>

              <div className="flex flex-col text-[11px] font-bold text-gray-900 leading-tight tracking-tighter select-none">
                <span className="bg-blue-600 text-white px-1.5 pt-1 pb-0.5 rounded-md text-[10px] shadow-sm inline-block lowercase">
                  {email.toLowerCase()} .
                </span>
              </div>
            </div>
          </div>

          {/* BOTÃO ALTERAR SENHA (OCUPA A MESMA LARGURA DO CARD DE PREFERÊNCIAS) - OCULTO NO MOBILE NESTA POSIÇÃO */}
          <div className="lg:col-span-4 hidden md:block">
            <div className="w-full bg-gray-50/80 p-2 rounded-[2rem] border border-gray-100 shadow-inner flex items-center justify-center">
              <button onClick={() => setShowPassModal(true)} className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-gray-500 uppercase hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm">
                <KeyRound size={14} /> Alterar senha de acesso
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <div className="lg:col-span-8">
          <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative flex flex-col h-full">
            
            <div className="flex flex-col xl:flex-row justify-between items-start mb-12 gap-8">
              {/* BLOCO DA FOTO */}
              <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
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
                <div className="text-center md:text-left">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Dados Cadastrais</h4>
                  <p className="text-[11px] text-gray-400 font-medium leading-tight max-w-[200px]">
                    Clique sobre o ícone da câmera para incluir ou editar sua imagem de perfil.
                  </p>
                </div>
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

        {/* COLUNA DIREITA: PREFERÊNCIAS */}
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

          {/* ÁREA DE BOTÕES - MOBILE FRIENDLY */}
          <div className="flex flex-col gap-4">
            {/* BOTÃO ALTERAR SENHA (VISÍVEL APENAS NO MOBILE NESTA POSIÇÃO) */}
            <div className="w-full bg-gray-50/80 p-2 rounded-[2rem] border border-gray-100 shadow-inner flex md:hidden items-center justify-center">
              <button onClick={() => setShowPassModal(true)} className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-gray-500 uppercase hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm">
                <KeyRound size={14} /> Alterar senha de acesso
              </button>
            </div>

            {/* BOTÃO DE SALVAR */}
            <button onClick={handleUpdate} disabled={updating} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] hover:bg-blue-700 transition-all font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 group">
              <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
              {updating ? "Sincronizando..." : "Salvar Alterações"}
            </button>
          </div>
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