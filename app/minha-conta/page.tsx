"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Save, MapPin, Heart, LogOut, Mail, UserCircle, LayoutDashboard, KeyRound, Eye, EyeOff, X 
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MinhaContaPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profissao, setProfissao] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [usoApp, setUsoApp] = useState("");
  const [objetivoFinanceiro, setObjetivoFinanceiro] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Estados para o Modal de Senha
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

  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          setNome(profile.nome_completo || "");
          setTelefone(profile.telefone || "");
          setProfissao(profile.profissao || "");
          setDataNascimento(profile.data_nascimento || "");
          setGenero(profile.genero || "");
          setEstadoCivil(profile.estado_civil || "");
          setCidade(profile.cidade || "");
          setEstado(profile.estado || "");
          setUsoApp(profile.uso_app || "");
          setObjetivoFinanceiro(profile.objetivo_financeiro || "");
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
        telefone: telefone,
        profissao: profissao,
        data_nascimento: dataNascimento,
        genero: genero,
        estado_civil: estadoCivil,
        cidade: cidade,
        estado: estado,
        uso_app: usoApp,
        objetivo_financeiro: objetivoFinanceiro,
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
    if (newPassword.length < 6) return alert("A senha deve ter no mínimo 6 caracteres.");

    setPassLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert("Erro ao atualizar senha: " + error.message);
    } else {
      alert("Senha alterada com sucesso!");
      setShowPassModal(false);
      setNewPassword("");
      setConfirmPassword("");
    }
    setPassLoading(false);
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center text-gray-400 animate-pulse font-medium">
      Sincronizando perfil...
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-3 pt-0 pb-20 min-h-screen flex flex-col select-none relative bg-white">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-0">
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
            Perfil<span className="text-blue-600">.</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            {nome ? nome.trim().split(' ')[0] : "Usuário"} (Configurações da conta)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => window.location.href = "/acesso-usuario"} className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <LayoutDashboard size={14} /> Painel do usuário
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <LogOut size={14} /> Realizar logoff
          </button>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* COLUNA ESQUERDA + CENTRAL (FORMULÁRIOS) */}
        <div className="lg:col-span-2 space-y-3">
          
          <section className="bg-white rounded-[1.5rem] p-2.5 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4">
              <UserCircle size={14}/> Dados Fundamentais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              {/* NOME COMPLETO */}
              <div className="space-y-0.5 md:col-span-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Nome Completo</label>
                <input type="text" value={nome} className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" onChange={(e) => setNome(e.target.value)} />
              </div>

              {/* ESTADO CIVIL (AO LADO DO NOME) */}
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Estado Civil</label>
                <select value={estadoCivil} className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" onChange={(e) => setEstadoCivil(e.target.value)}>
                  <option value=""></option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="uniao_estavel">União Estável</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">E-mail</label>
                <div className="flex items-center px-3 py-2 bg-gray-100/50 rounded-xl text-xs text-gray-500 border border-gray-100 italic">
                  <Mail size={12} className="mr-2" /> {email}
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Telefone</label>
                <input type="text" value={telefone} placeholder="(00) 00000-0000" className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))} />
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Nascimento</label>
                <input type="date" value={dataNascimento} className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" onChange={(e) => setDataNascimento(e.target.value)} />
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Gênero</label>
                <select value={genero} className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" onChange={(e) => setGenero(e.target.value)}>
                  <option value=""></option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[1.5rem] p-2 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-4">
              <MapPin size={14}/> Localização e Carreira
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Cidade</label>
                <input type="text" value={cidade} className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all" onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">UF</label>
                <select value={estado} className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all" onChange={(e) => setEstado(e.target.value)}>
                  <option value=""></option>
                  {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Profissão</label>
                <input type="text" value={profissao} className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all" onChange={(e) => setProfissao(e.target.value)} />
              </div>
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-blue-600 rounded-[1.5rem] p-4 text-white shadow-lg shadow-blue-100">
            <h3 className="text-[10px] font-black text-blue-100 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Heart size={14}/> Preferências do App
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-blue-200 uppercase ml-1">Perfil de Uso</label>
                <select value={usoApp} className="w-full px-3 py-2.5 bg-blue-500/30 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/20 text-white" onChange={(e) => setUsoApp(e.target.value)}>
                  <option value="" className="text-gray-900"></option>
                  <option value="uso_pessoal" className="text-gray-900">Uso Pessoal Diário</option>
                  <option value="trabalho" className="text-gray-900">Trabalho</option>
                  <option value="estudos" className="text-gray-900">Estudos</option>
                  <option value="equipe" className="text-gray-900">Gestão de Equipes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-blue-200 uppercase ml-1">Foco Financeiro</label>
                <select value={objetivoFinanceiro} className="w-full px-3 py-2.5 bg-blue-500/30 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/20 text-white" onChange={(e) => setObjetivoFinanceiro(e.target.value)}>
                  <option value="" className="text-gray-900"></option>
                  <option value="pessoal" className="text-gray-900">Pessoal</option>
                  <option value="familiar" className="text-gray-900">Familiar</option>
                  <option value="empresarial" className="text-gray-900">Empresarial</option>
                  <option value="investimentos" className="text-gray-900">Investimentos</option>
                </select>
              </div>
            </div>

            <div className="mt-7 p-4 bg-white/10 rounded-2xl border border-white/10">
              <p className="text-[11px] text-blue-100 leading-tight italic">
                As preferências ajudam a nucleobase.app a personalizar suas experiências, sugestões e dashboards que adaptam-se ao seu estilo.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowPassModal(true)}
            className="w-full bg-orange-500 text-white py-4 rounded-[1.5rem] hover:bg-orange-600 transition-all font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95"
          >
            <KeyRound size={18} /> Alterar senha de acesso
          </button>
        </div>
      </div>

      {/* BOTÃO SALVAR DADOS - REPOSICIONADO PARA OCUPAR TODA A LARGURA DA PÁGINA */}
      <button 
        onClick={handleUpdate} 
        disabled={updating} 
        className="w-full bg-gray-900 text-white py-2 rounded-[1.5rem] hover:bg-black transition-all font-bold text-base shadow-2xl flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50 mt-3"
      >
        <Save size={20} /> {updating ? "Sincronizando..." : "Salvar todas as alterações do perfil"}
      </button>

      {/* MODAL DE ALTERAÇÃO DE SENHA */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowPassModal(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-900">
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-4">
                <KeyRound size={24} />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Nova Senha</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Atualize sua segurança</p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nova Senha</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={newPassword}
                    required
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-100 outline-none"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                <input 
                  type={showPass ? "text" : "password"} 
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>

              <button 
                disabled={passLoading}
                className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all disabled:opacity-50 mt-4"
              >
                {passLoading ? "Atualizando..." : "Confirmar Alteração"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}