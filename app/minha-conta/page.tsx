"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Save, MapPin, Heart, LogOut, UserCircle, LayoutDashboard, KeyRound, X, Camera, GraduationCap, Share2, Briefcase, Mail, AtSign, Loader2, Eye, EyeOff, Target, Baby
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
          // Carregamento dos novos campos
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
    <div className="w-full max-w-[100%] mx-auto px-4 md:px-8 pt-0 pb-20 min-h-screen flex flex-col select-none bg-white">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between py-6 border-b border-gray-100 mb-8 gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
            Minha Conta<span className="text-blue-600">.</span>
          </h1>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Gerencie suas informações e preferências</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = "/acesso-usuario"} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-100 shadow-sm">
            <LayoutDashboard size={16} /> Painel do usuário
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100 shadow-sm">
            <LogOut size={16} /> Realizar logoff
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* COLUNA ESQUERDA: DADOS FUNDAMENTAIS */}
        <div className="lg:col-span-9 h-full">
          <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative flex flex-col h-full">
            
            <div className="flex flex-col xl:flex-row justify-between items-start mb-10 gap-8">
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  <div className={`w-20 h-20 rounded-[2rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all ${uploadingAvatar ? 'opacity-40' : 'opacity-100'}`}>
                    {avatarUrl ? <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-gray-200" />}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-[2rem] cursor-pointer transition-all">
                    <Camera size={20} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadAvatar} disabled={uploadingAvatar} />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Dados Fundamentais</h3>
                  <p className="text-gray-400 text-[11px] font-medium uppercase">Perfil, Carreira e Localização</p>
                </div>
              </div>

              {/* BOX DE DADOS DE ACESSO */}
              <div className="w-full xl:w-auto bg-gray-50/80 p-5 rounded-[2rem] border border-gray-100 space-y-4 min-w-[320px] shadow-inner">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-6 px-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1"><AtSign size={10}/> ID Usuário</span>
                    <span className="text-xs font-bold text-gray-700">{slug || "---"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6 border-t border-gray-200/50 pt-2.5 px-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1"><Mail size={10}/> E-mail Acesso</span>
                    <span className="text-xs font-medium text-gray-500 italic truncate ml-4">{email}</span>
                  </div>
                </div>
                <button onClick={() => setShowPassModal(true)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-500 uppercase hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all active:scale-95 shadow-sm">
                  <KeyRound size={12} /> Alterar senha de acesso
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* NOME */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">Nome Completo</label>
                <input type="text" value={nome} className="w-full h-11 px-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium" onChange={(e) => setNome(e.target.value)} />
              </div>

              {/* EMAIL NOTIFICAÇÕES E TELEFONE */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-blue-600 uppercase ml-1 tracking-wider">E-mail de Notificações</label>
                <input type="email" value={emailContato} placeholder="seu-email@exemplo.com" className="w-full h-11 px-4 bg-blue-50/30 border border-blue-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium" onChange={(e) => setEmailContato(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">Telefone de Contato</label>
                <input type="text" value={telefone} placeholder="(00) 00000-0000" className="w-full h-11 px-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))} />
              </div>

              {/* GÊNERO E ESTADO CIVIL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">Gênero</label>
                <select value={genero} className="w-full h-11 px-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white outline-none" onChange={(e) => setGenero(e.target.value)}>
                  <option value=""></option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro / Prefiro não dizer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">Estado Civil</label>
                <select value={estadoCivil} className="w-full h-11 px-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white outline-none" onChange={(e) => setEstadoCivil(e.target.value)}>
                  <option value=""></option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="uniao_estavel">União Estável</option>
                  <option value="divorciado">Divorciado(a)</option>
                </select>
              </div>

              {/* DATA NASCIMENTO E FILHOS (LINHA DEBAIXO) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">Data de Nascimento</label>
                <input type="date" value={dataNascimento} className="w-full h-11 px-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" onChange={(e) => setDataNascimento(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider flex items-center gap-1"><Baby size={10}/> Possui filhos?</label>
                <select value={possuiFilhos} className="w-full h-11 px-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white outline-none" onChange={(e) => setPossuiFilhos(e.target.value)}>
                  <option value=""></option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              {/* CIDADE E UF */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider flex items-center gap-1"><MapPin size={10}/> Cidade</label>
                <input type="text" value={cidade} className="w-full h-11 px-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-50 outline-none" onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">UF</label>
                <select value={estado} className="w-full h-11 px-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white outline-none" onChange={(e) => setEstado(e.target.value)}>
                  <option value=""></option>
                  {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>

              {/* PROFISSÃO E FORMAÇÃO */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider flex items-center gap-1"><Briefcase size={10}/> Profissão Atual</label>
                <input type="text" value={profissao} className="w-full h-11 px-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white outline-none" onChange={(e) => setProfissao(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider flex items-center gap-1"><GraduationCap size={10}/> Formação Acadêmica</label>
                <select value={formacao} className="w-full h-11 px-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:bg-white outline-none" onChange={(e) => setFormacao(e.target.value)}>
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

        {/* COLUNA DIREITA: PREFERÊNCIAS (AZUL) */}
        <div className="lg:col-span-3 h-full">
          <section className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 flex flex-col h-full">
            <h3 className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] flex items-center gap-2 mb-10">
              <Heart size={16}/> Preferências do APP
            </h3>
            
            <div className="space-y-8 flex-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <Share2 size={12}/> Onde nos conheceu?
                </label>
                <select value={origem} className="w-full h-12 px-4 bg-blue-500/30 border border-blue-400/30 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-white/20 text-white" onChange={(e) => setOrigem(e.target.value)}>
                  <option value="" className="text-gray-900 italic">Selecione uma opção</option>
                  <option value="instagram" className="text-gray-900">Instagram</option>
                  <option value="google" className="text-gray-900">Google</option>
                  <option value="linkedin" className="text-gray-900">LinkedIn</option>
                  <option value="youtube" className="text-gray-900">YouTube</option>
                  <option value="indicacao" className="text-gray-900">Indicação</option>
                </select>
              </div>

              {/* NOVO CAMPO: OBJETIVO NA PLATAFORMA */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200 uppercase ml-1 tracking-widest flex items-center gap-2">
                  <Target size={12}/> Objetivo na Plataforma
                </label>
                <select value={objetivoPlataforma} className="w-full h-12 px-4 bg-blue-500/30 border border-blue-400/30 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-white/20 text-white" onChange={(e) => setObjetivoPlataforma(e.target.value)}>
                  <option value="" className="text-gray-900 italic">Selecione...</option>
                  <option value="sair_dividas" className="text-gray-900">Sair de dívidas</option>
                  <option value="organizar_gastos" className="text-gray-900">Organizar gastos</option>
                  <option value="guardar_dinheiro" className="text-gray-900">Guardar dinheiro</option>
                  <option value="investir" className="text-gray-900">Começar a investir</option>
                  <option value="liberdade_financeira" className="text-gray-900">Liberdade Financeira</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200 uppercase ml-1 tracking-widest">Perfil de Uso</label>
                <select value={usoApp} className="w-full h-12 px-4 bg-blue-500/30 border border-blue-400/30 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-white/20 text-white" onChange={(e) => setUsoApp(e.target.value)}>
                  <option value="" className="text-gray-900"></option>
                  <option value="uso_pessoal" className="text-gray-900">Uso Pessoal Diário</option>
                  <option value="trabalho" className="text-gray-900">Trabalho</option>
                  <option value="estudos" className="text-gray-900">Estudos</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200 uppercase ml-1 tracking-widest">Foco Financeiro</label>
                <select value={objetivoFinanceiro} className="w-full h-12 px-4 bg-blue-500/30 border border-blue-400/30 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-white/20 text-white" onChange={(e) => setObjetivoFinanceiro(e.target.value)}>
                  <option value="" className="text-gray-900"></option>
                  <option value="pessoal" className="text-gray-900">Pessoal</option>
                  <option value="familiar" className="text-gray-900">Familiar</option>
                  <option value="empresarial" className="text-gray-900">Empresarial</option>
                </select>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10">
              <div className="p-5 bg-white/10 rounded-[2rem] border border-white/5">
                <p className="text-[10px] text-blue-100 leading-relaxed italic opacity-80">
                  A nucleobase.app utiliza estas preferências para calibrar algoritmos de sugestão e interface.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-12 sticky bottom-8 z-50">
        <button onClick={handleUpdate} disabled={updating} className="w-full bg-gray-900 text-white py-5 rounded-[2.5rem] hover:bg-black transition-all font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50">
          <Save size={20} /> {updating ? "Sincronizando..." : "Salvar todas as alterações do perfil"}
        </button>
      </div>

      {/* MODAL DE SENHA */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative border border-gray-100">
            <button onClick={() => setShowPassModal(false)} className="absolute right-8 top-8 text-gray-300 hover:text-gray-900 transition-colors"><X size={24} /></button>
            <div className="text-center mb-8">
              <div className="bg-orange-50 w-16 h-16 rounded-3xl flex items-center justify-center text-orange-500 mx-auto mb-4 border border-orange-100"><KeyRound size={32} /></div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Nova Senha</h2>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Nova senha" required onChange={(e) => setNewPassword(e.target.value)} className="w-full h-12 px-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input type={showPass ? "text" : "password"} placeholder="Confirmar senha" required onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-12 px-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100" />
              <button disabled={passLoading} className="w-full bg-orange-500 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-100 mt-4 active:scale-95 transition-transform disabled:opacity-50">
                {passLoading ? "Atualizando..." : "Confirmar Alteração"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}