"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Save, MapPin, Heart, LogOut, UserCircle, LayoutDashboard, KeyRound, X, Camera, 
  GraduationCap, Share2, Briefcase, Mail, AtSign, Loader2, Eye, EyeOff, Target, Baby, User, Instagram
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
  
  const [dadosOriginais, setDadosOriginais] = useState<any>(null);
  
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
          const dados = {
            nome: profile.nome_completo || "",
            slug: profile.slug || "",
            emailContato: profile.email_contato || "",
            telefone: profile.telefone || "",
            profissao: profile.profissao || "",
            formacao: profile.formacao || "",
            dataNascimento: profile.data_nascimento || "",
            genero: profile.genero || "",
            estadoCivil: profile.estado_civil || "",
            cidade: profile.cidade || "",
            estado: profile.estado || "",
            usoApp: profile.uso_app || "",
            objetivoFinanceiro: profile.objetivo_financeiro || "",
            origem: profile.origem || "",
            possuiFilhos: profile.possui_filhos || "",
            objetivoPlataforma: profile.objetivo_plataforma || "",
          };
          
          setNome(dados.nome);
          setSlug(dados.slug);
          setEmailContato(dados.emailContato);
          setTelefone(dados.telefone);
          setProfissao(dados.profissao);
          setFormacao(dados.formacao);
          setDataNascimento(dados.dataNascimento);
          setGenero(dados.genero);
          setEstadoCivil(dados.estadoCivil);
          setCidade(dados.cidade);
          setEstado(dados.estado);
          setUsoApp(dados.usoApp);
          setObjetivoFinanceiro(dados.objetivoFinanceiro);
          setOrigem(dados.origem);
          setPossuiFilhos(dados.possuiFilhos);
          setObjetivoPlataforma(dados.objetivoPlataforma);
          setAvatarUrl(profile.avatar_url || null);
          
          setDadosOriginais(dados);
        }
      } else { window.location.href = "/"; }
      setLoading(false);
    }
    carregarDados();
  }, []);

  const temAlteracoes = dadosOriginais && (
    nome !== dadosOriginais.nome ||
    emailContato !== dadosOriginais.emailContato ||
    telefone !== dadosOriginais.telefone ||
    profissao !== dadosOriginais.profissao ||
    formacao !== dadosOriginais.formacao ||
    dataNascimento !== dadosOriginais.dataNascimento ||
    genero !== dadosOriginais.genero ||
    estadoCivil !== dadosOriginais.estadoCivil ||
    cidade !== dadosOriginais.cidade ||
    estado !== dadosOriginais.estado ||
    usoApp !== dadosOriginais.usoApp ||
    objetivoFinanceiro !== dadosOriginais.objetivoFinanceiro ||
    origem !== dadosOriginais.origem ||
    possuiFilhos !== dadosOriginais.possuiFilhos ||
    objetivoPlataforma !== dadosOriginais.objetivoPlataforma
  );

  // Notificar navegador e interceptar botão Voltar
  useEffect(() => {
    // 1. Bloqueio para Fechar Aba / Recarregar (F5)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (temAlteracoes) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };

    // 2. Bloqueio para o Botão "Voltar" do Navegador
    const handlePopState = (e: PopStateEvent) => {
      if (temAlteracoes) {
        const confirmacao = window.confirm("Você tem alterações não salvas. Deseja realmente sair?");
        if (!confirmacao) {
          // Se cancelar, "anula" a volta forçando a rota atual de novo no histórico
          window.history.pushState(null, "", window.location.pathname);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Inicializa um estado no histórico para o popstate ter o que capturar
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [temAlteracoes]);

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
      else {
        alert("Dados atualizados com sucesso!");
        setDadosOriginais({
          nome, emailContato, telefone, profissao, formacao, dataNascimento,
          genero, estadoCivil, cidade, estado, usoApp, objetivoFinanceiro,
          origem, possui_filhos: possuiFilhos, objetivoPlataforma
        });
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

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 animate-pulse font-medium">Sincronizando perfil...</div>;

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <div className="text-sm text-gray-500 font-medium leading-relaxed">
              <span className="hidden md:inline">Olá{nome ? ` ${nome.split(' ')[0]}` : ","}, conecte-se em seus dispositivos utilizando seu id{" "}</span>
              <span className="inline md:hidden">Olá{nome ? ` ${nome.split(' ')[0]}` : ""}, conecte-se em qualquer dispositivo utilizando seu id{" "}</span>
              <span className="inline-flex align-middle">
                <span className="bg-blue-600 text-white px-1.5 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm lowercase leading-none select-none">#{slug?.toLowerCase() || "---"}</span>
              </span>
              <span className="mx-1">ou e-mail</span>
              <span className="inline-flex align-middle">
                <span className="bg-blue-600 text-white px-1.5 pt-1 pb-0.5 rounded-md text-[10px] font-bold shadow-sm lowercase leading-none select-none">{email.toLowerCase()}</span>
              </span>
              <span className="hidden md:inline"> e aproveite todas as funções da Plataforma da Nucleo.</span>
              <span className="inline md:hidden">.</span>
            </div>
          </div>
          <div className="lg:col-span-4 hidden md:block">
            <div className="w-full bg-gray-50/80 p-2 rounded-[2rem] border border-gray-100 shadow-inner flex items-center justify-center">
              <button onClick={() => setShowPassModal(true)} className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-gray-500 uppercase hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm">
                <KeyRound size={14} /> Alterar senha de acesso
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        <div className="lg:col-span-8">
          <section className="bg-white rounded-[2.5rem] px-5 py-10 md:p-10 border border-gray-100 shadow-sm relative flex flex-col h-full">
            <div className="flex flex-col xl:flex-row justify-between items-start mb-12 gap-8">
              <div className="flex flex-row items-start md:items-center gap-6">
                <div className="relative group shrink-0">
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all ${uploadingAvatar ? 'opacity-40' : 'opacity-100'}`}>
                    {avatarUrl ? <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserCircle size={48} className="text-gray-200" />}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-[2rem] md:rounded-[2.5rem] cursor-pointer transition-all">
                    <Camera size={24} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadAvatar} disabled={uploadingAvatar} />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Dados Cadastrais</h4>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-medium leading-tight max-w-[180px] md:max-w-[200px]">Clique sobre o ícone da câmera para incluir ou editar sua imagem de perfil.</p>
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
                <p className="text-[11px] text-blue-100/60 leading-relaxed italic font-medium">Seus dados atualizados otimizam a sua experiência no ecossistema <span className="text-blue-400">nucleobase.app</span>.</p>
              </div>
            </div>
          </section>
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gray-50/80 p-2 rounded-[2rem] border border-gray-100 shadow-inner flex md:hidden items-center justify-center">
              <button onClick={() => setShowPassModal(true)} className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-gray-500 uppercase hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm">
                <KeyRound size={14} /> Alterar senha de acesso
              </button>
            </div>
            <button onClick={handleUpdate} disabled={updating} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] hover:bg-blue-700 transition-all font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 group">
              <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
              {updating ? "Sincronizando..." : "Salvar Alterações"}
            </button>
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