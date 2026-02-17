"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Save, MapPin, Heart, LogOut, Mail, UserCircle, LayoutDashboard 
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
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [usoApp, setUsoApp] = useState("");
  const [objetivoFinanceiro, setObjetivoFinanceiro] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center text-gray-400 animate-pulse font-medium">
      Sincronizando perfil...
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-3 pt-0 pb-4 h-fit flex flex-col overflow-hidden select-none">
      
      {/* HEADER ULTRA-COMPACTO COM NOVO BOTÃO */}
      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-1">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
            Perfil<span className="text-blue-600">.</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            {nome ? nome.trim().split(' ')[0] : "Usuário"} / Configurações
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* BOTÃO VOLTAR AO PAINEL */}
          <button 
            onClick={() => window.location.href = "/acesso-usuario"}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <LayoutDashboard size={14} /> Painel do usuário
          </button>

          {/* BOTÃO SAIR */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={14} /> Realizar logoff
          </button>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* COLUNA ESQUERDA: IDENTIFICAÇÃO E LOCALIZAÇÃO */}
        <div className="lg:col-span-2 space-y-3">
          
          <section className="bg-white rounded-[1.5rem] p-2.5 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4">
              <UserCircle size={14}/> Dados Fundamentais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-0.5 md:col-span-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Nome Completo</label>
                <input type="text" value={nome} className="w-full px-3 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" onChange={(e) => setNome(e.target.value)} />
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
            onClick={handleUpdate} 
            disabled={updating} 
            className="w-full bg-gray-900 text-white py-4 rounded-[1.5rem] hover:bg-black transition-all font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-90 disabled:opacity-50"
          >
            <Save size={18} /> {updating ? "Salvando..." : "Salvar Dados"}
          </button>
        </div>

      </div>
    </div>
  );
}