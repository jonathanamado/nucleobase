"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { 
  Save, MapPin, UserCircle, Camera, GraduationCap, Briefcase, 
  Baby, CalendarDays, Activity, MousePointerClick, 
  KeyRound, Instagram, X, Eye, EyeOff,
  Target, Share2, Wallet, Zap, Rocket, LayoutDashboard, Info,
  ShieldCheck, PieChart, Award, ChartPie
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MinhaContaPage() {
  // --- ESTADOS DE DADOS ---
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
  
  // --- ESTADOS DE SISTEMA ---
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Estados para os Popovers de Insight
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // --- LÓGICA DE AVISO DE SAÍDA ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Você tem alterações não salvas. Deseja realmente sair?";
        return e.returnValue;
      }
    };

    const handleInternalNavigation = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (isDirty && link && link.href && !link.href.includes("#") && !link.target) {
        const confirmExit = window.confirm("Você possui alterações não salvas. Deseja sair sem salvar?");
        if (!confirmExit) {
          e.preventDefault();
          e.stopPropagation();
          saveButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleInternalNavigation, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleInternalNavigation, true);
    };
  }, [isDirty]);

  const handleChange = (setter: Function, value: any) => {
    setter(value);
    setIsDirty(true);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeInsight && insightRef.current && !insightRef.current.contains(event.target as Node)) {
        setActiveInsight(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeInsight]);

  const getPrimeiroNome = () => {
    if (!nome) return slug || "user";
    const primeiro = nome.trim().split(" ")[0];
    return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase();
  };

  // --- ESTATÍSTICAS REAIS (ESTADO) ---
  const [stats, setStats] = useState({
    totalLancamentos: 0,
    mesesAtivos: [] as string[],
    mesesPendentes: 0,
    patrimonioConectado: 0,
    detalheConexoes: "",
    detalheLancamentos: "",
    mediaGastosDiarios: "R$ 0,00",
    percCustosFixos: 0,
    margemManobra: "R$ 0,00",
    dataLimiteFixos: "",
    percGastosVariaveis: 0,
    numCracha: "---",
    tempoCasa: "",
    diasCadastro: ""
  });

  // Função para calcular dias de cadastro
  const calcularDiasCadastro = (dataCriacao: string) => {
    const inicio = new Date(dataCriacao);
    const hoje = new Date();
    const diferencaTempo = Math.abs(hoje.getTime() - inicio.getTime());
    const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
    return `${diferencaDias} ${diferencaDias === 1 ? '(d)' : '(d)'}`;
  };

  async function carregarEstatisticas(userId: string) {
    const agora = new Date();
    const mesAtualNum = agora.getMonth() + 1;
    const anoAtualNum = agora.getFullYear();

    const { data: userData } = await supabase.from("usuarios").select("num_cracha, criado_em").eq("id", userId).single();

    const { count, data: allRecords } = await supabase
      .from("lancamentos_financeiros")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    const diasDeUso = userData?.criado_em ? calcularDiasCadastro(userData.criado_em) : "---";

    if (allRecords && allRecords.length > 0) {
      const mesesMap: Record<string, string> = {
        '01': 'jan', '02': 'fev', '03': 'mar', '04': 'abr', '05': 'mai', '06': 'jun',
        '07': 'jul', '08': 'ago', '09': 'set', '10': 'out', '11': 'nov', '12': 'dez'
      };

      const rawMonths = allRecords
        .map(l => l.data_competencia.substring(0, 7))
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort();

      const mesesFormatados = rawMonths.map(ym => {
        const [year, month] = ym.split('-');
        return `${mesesMap[month]}/${year}`;
      });

      let pendentes = 0;
      if (rawMonths.length > 1) {
        const start = new Date(rawMonths[0] + "-01");
        const end = new Date(rawMonths[rawMonths.length - 1] + "-01");
        let current = new Date(start);
        current.setMonth(current.getMonth() + 1);
        while (current < end) {
          const check = current.toISOString().substring(0, 7);
          if (!rawMonths.includes(check)) pendentes++;
          current.setMonth(current.getMonth() + 1);
        }
      }

      const despesas = allRecords.filter(l => l.natureza === 'Despesa');
      const custosFixos = despesas.filter(l => l.tipo_de_custo === 'Fixo').reduce((acc, curr) => acc + Math.abs(Number(curr.valor)), 0);
      const custosVariaveis = despesas.filter(l => l.tipo_de_custo === 'Variável').reduce((acc, curr) => acc + Math.abs(Number(curr.valor)), 0);
      const despesasTotais = custosFixos + custosVariaveis;

      const percFixos = despesasTotais > 0 ? Math.round((custosFixos / despesasTotais) * 100) : 0;
      const percVariaveis = despesasTotais > 0 ? Math.round((custosVariaveis / despesasTotais) * 100) : 0;
      
      const datasFixos = allRecords.filter(l => l.fixo_ate).map(l => l.fixo_ate).sort();
      const limiteFixos = datasFixos.length > 0 ? datasFixos[datasFixos.length - 1].split('-').reverse().slice(0, 2).join('/') : "---";

      const txtLacuna = pendentes > 0 ? ` Atualmente, identificamos ${pendentes} ${pendentes === 1 ? 'mês de lacuna' : 'meses de lacuna'} sem registros.` : " Não identificamos lacunas em seu histórico.";
      const textoLancamentos = `Seu histórico acumula ${count} registros, abrangendo o período de ${mesesFormatados[0]} a ${mesesFormatados[mesesFormatados.length - 1]}.${txtLacuna} É fundamental manter seus lançamentos sempre atualizados para garantir a precisão das análises e do seu planejamento.`;

      const despesasMes = despesas.filter(l => {
        const [ano, mes] = l.data_competencia.split('-');
        return Number(mes) === mesAtualNum && Number(ano) === anoAtualNum;
      });
      const totalDespesasMes = despesasMes.reduce((acc, curr) => acc + Math.abs(Number(curr.valor)), 0);
      const mediaDiaria = totalDespesasMes / agora.getDate();

      setStats({
        ...stats,
        totalLancamentos: count || 0,
        mesesAtivos: mesesFormatados,
        mesesPendentes: pendentes,
        patrimonioConectado: new Set(allRecords.map(l => `${l.origem}-${l.tipo_origem}`)).size,
        detalheLancamentos: textoLancamentos,
        mediaGastosDiarios: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(mediaDiaria),
        percCustosFixos: percFixos,
        dataLimiteFixos: limiteFixos,
        percGastosVariaveis: percVariaveis,
        numCracha: userData?.num_cracha || "---",
        tempoCasa: userData?.criado_em ? new Date(userData.criado_em).toLocaleDateString('pt-BR') : "",
        diasCadastro: diasDeUso
      });
    } else {
        // Caso não haja registros ainda carregar o tempo de casa
        setStats(prev => ({ ...prev, diasCadastro: diasDeUso, tempoCasa: userData?.criado_em ? new Date(userData.criado_em).toLocaleDateString('pt-BR') : "" }));
    }
  }

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
          setPossuiFilhos(profile.possui_filhos || "");
          setObjetivoPlataforma(profile.objetivo_plataforma || "");
          setAvatarUrl(profile.avatar_url || null);
        }
        await carregarEstatisticas(user.id);
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
        id: user.id, nome_completo: nome, email_contato: emailContato, telefone: telefone,
        profissao: profissao, formacao: formacao, data_nascimento: dataNascimento || null,
        genero: genero, estado_civil: estadoCivil, cidade: cidade, estado: estado,
        uso_app: usoApp, objetivo_financeiro: objetivoFinanceiro, origem: origem,
        possui_filhos: possuiFilhos, objetivo_plataforma: objetivoPlataforma, updated_at: new Date()
      });
      if (error) alert("Erro: " + error.message);
      else {
        alert("Dados salvos!");
        setIsDirty(false);
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
    else { alert("Senha atualizada!"); setShowPassModal(false); }
    setPassLoading(false);
  };

  const InsightPopover = ({ id, title, content, colorClass, align = "left" }: { id: string, title: string, content: string, colorClass: string, align?: "left" | "right" }) => {
    if (activeInsight !== id) return null;
    
    const positionClasses = align === "left" ? "bottom-[calc(100%+15px)] left-0" : "bottom-[calc(100%+15px)] right-0";
    const arrowClasses = align === "left" ? "left-6" : "right-6";

    return (
      <div 
        ref={insightRef}
        className={`absolute ${positionClasses} w-[280px] md:w-80 p-5 bg-gray-900 text-white rounded-[2rem] shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300`}
      >
        <div className={`absolute w-4 h-4 bg-gray-900 -bottom-2 ${arrowClasses} border-l border-b rotate-[-45deg]`}></div>
        <h4 className={`text-[10px] font-black uppercase tracking-widest ${colorClass} mb-2 flex items-center gap-2`}>
           <Zap size={12} fill="currentColor"/> Insight de {title}
        </h4>
        <p className="text-[11px] leading-relaxed text-gray-200 font-medium">{content}</p>
      </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 animate-pulse font-medium">Sincronizando...</div>;

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Minha conta<span className="text-blue-600">.</span></span>
            <UserCircle size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <h2 className="text-gray-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-0">
            Olá<span className="whitespace-nowrap font-bold text-gray-900"> {getPrimeiroNome()},</span> gerencie seus dados e entenda o seu comportamento.
          </h2>
        </div>
      </div>

      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-4">
        Perfil e Configurações <div className="h-px bg-gray-300 flex-1"></div>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-7 h-full order-2 md:order-1">
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-6 mb-12">
              <div className="relative group shrink-0">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all ${uploadingAvatar ? 'opacity-40' : 'opacity-100'}`}>
                  {avatarUrl ? <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserCircle size={48} className="text-gray-200" />}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-[2rem] md:rounded-[2.5rem] cursor-pointer transition-all">
                  <Camera size={24} />
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-gray-900">Dados Cadastrais</h4>
                <p className="text-[10px] md:text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1 leading-tight">Identidade Nucleobase</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-1">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nome Completo</label>
                <input type="text" value={nome} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none transition-all focus:border-blue-200" onChange={(e) => handleChange(setNome, e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase ml-1 tracking-widest">E-mail de Notificações</label>
                <input type="email" value={emailContato} className="w-full h-12 px-5 bg-blue-50/30 border border-blue-100 rounded-2xl text-sm text-blue-900 outline-none" onChange={(e) => handleChange(setEmailContato, e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Telefone</label>
                <input type="text" value={telefone} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => handleChange(setTelefone, aplicarMascaraTelefone(e.target.value))} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Data de Nascimento</label>
                <input type="date" value={dataNascimento} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => handleChange(setDataNascimento, e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Gênero</label>
                <select value={genero} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => handleChange(setGenero, e.target.value)}>
                  <option value=""></option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Prefiro não dizer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Estado Civil</label>
                <select value={estadoCivil} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => handleChange(setEstadoCivil, e.target.value)}>
                  <option value=""></option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="uniao_estavel">União Estável</option>
                  <option value="divorciado">Divorciado(a)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2"><Baby size={14}/> Possui filhos?</label>
                <select value={possuiFilhos} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => handleChange(setPossuiFilhos, e.target.value)}>
                  <option value=""></option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2"><MapPin size={14}/> Cidade / UF</label>
                <div className="flex gap-2 flex-nowrap">
                    <input type="text" value={cidade} placeholder="Cidade" className="flex-1 min-w-0 h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => handleChange(setCidade, e.target.value)} />
                    <select value={estado} className="w-20 shrink-0 h-12 px-2 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => handleChange(setEstado, e.target.value)}>
                        <option value=""></option>
                        {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2"><Briefcase size={14}/> Profissão Atual</label>
                <input type="text" value={profissao} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => handleChange(setProfissao, e.target.value)} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2"><GraduationCap size={14}/> Formação Acadêmica</label>
                <select value={formacao} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => handleChange(setFormacao, e.target.value)}>
                  <option value="">Selecione...</option>
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

        {/* COLUNA DIREITA */}
        <div className="lg:col-span-5 flex flex-col gap-6 order-1 md:order-2">
          <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex-1 flex flex-col">
            
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                   <CalendarDays size={16} className="text-purple-600" /> Controle lançamentos
                </h3>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                {stats.mesesAtivos.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between relative px-1 mb-2">
                      <div className="text-center z-10 bg-gray-50 px-1 min-w-[40px]">
                        <p className="text-[7px] font-bold text-gray-400 uppercase">Início</p>
                        <p className="text-[10px] font-black text-gray-900">{stats.mesesAtivos[0]}</p>
                      </div>
                      <div className="absolute left-[45px] right-[45px] top-1/2 -translate-y-1/2 flex items-center h-px">
                        <div className="w-full border-b border-gray-300"></div>
                      </div>
                      <div className="text-center z-10 bg-gray-50 px-1 min-w-[40px]">
                        <p className="text-[7px] font-bold text-gray-400 uppercase">Fim</p>
                        <p className="text-[10px] font-black text-gray-900">{stats.mesesAtivos[stats.mesesAtivos.length - 1]}</p>
                      </div>
                    </div>
                    {stats.mesesPendentes > 0 && (
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight text-center pt-2 border-t border-gray-200/50">
                        Você possui <span className="text-orange-600">{stats.mesesPendentes} {stats.mesesPendentes === 1 ? 'mês pendente' : 'meses pendentes'}</span> em seu intervalo de lançamentos.
                      </p>
                    )}
                  </div>
                ) : (
                  <Link href="/lancamentos" className="block w-full p-6 bg-orange-500 rounded-[2rem] group hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10 text-center">
                    <p className="text-[8px] font-black text-white/70 uppercase tracking-widest mb-1">
                      Você ainda não possui lançamentos.<br /><br />
                    </p>
                    <p className="text-white text-xs font-bold leading-tight">
                      Clique aqui para importar seus registros e iniciar sua gestão digital.
                    </p>
                  </Link>
                )}
              </div>
            </div>

            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 mb-10">
              <Activity size={16} className="text-blue-600"/> Atividades Recentes
            </h3>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-10">
              <div className="flex items-center gap-4 relative" 
                onMouseEnter={() => setActiveInsight('lancamentos')} 
                onMouseLeave={() => setActiveInsight(null)}
                onClick={() => setActiveInsight(activeInsight === 'lancamentos' ? null : 'lancamentos')}
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm cursor-pointer">
                  <MousePointerClick size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Registros</p>
                    <Info size={10} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-black text-gray-900">{stats.totalLancamentos}</p>
                </div>
                <InsightPopover id="lancamentos" title="Lançamentos" colorClass="text-blue-400" content={stats.detalheLancamentos} align="left" />
              </div>

              <div className="flex items-center gap-4 relative" 
                onMouseEnter={() => setActiveInsight('conexoes')} 
                onMouseLeave={() => setActiveInsight(null)}
                onClick={() => setActiveInsight(activeInsight === 'conexoes' ? null : 'conexoes')}
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm cursor-pointer">
                  <Wallet size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Cartões</p>
                    <Info size={10} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-black text-gray-900">{stats.patrimonioConectado}</p>
                </div>
                <InsightPopover id="conexoes" title="Cartões" colorClass="text-emerald-400" content={`Você possui ${stats.patrimonioConectado} fontes de dados conectadas à plataforma, permitindo uma visão consolidada do seu patrimônio.`} align="right" />
              </div>

              <div className="flex items-center gap-4 relative" 
                onMouseEnter={() => setActiveInsight('previsibilidade')} 
                onMouseLeave={() => setActiveInsight(null)}
                onClick={() => setActiveInsight(activeInsight === 'previsibilidade' ? null : 'previsibilidade')}
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm cursor-pointer">
                  <ChartPie size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Fixos</p>
                    <Info size={10} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-black text-gray-900">{stats.percCustosFixos}%</p>
                </div>
                <InsightPopover id="previsibilidade" title="Custo Fixo" colorClass="text-indigo-400" content={`Analisamos que ${stats.percCustosFixos}% das suas despesas estão atreladas a custos fixos até ${stats.dataLimiteFixos}. Manter custos fixos sob controle é o primeiro passo para a liberdade financeira e aumento do seu fluxo de caixa mensal.`} align="left" />
              </div>

              <div className="flex items-center gap-4 relative" 
                onMouseEnter={() => setActiveInsight('eficiencia')} 
                onMouseLeave={() => setActiveInsight(null)}
                onClick={() => setActiveInsight(activeInsight === 'eficiencia' ? null : 'eficiencia')}
              >
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shrink-0 shadow-sm cursor-pointer">
                  <PieChart size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Variáveis</p>
                    <Info size={10} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-black text-gray-900">{stats.percGastosVariaveis}%</p>
                </div>
                <InsightPopover id="eficiencia" title="Variáveis" colorClass="text-rose-400" content={`Atualmente, seus Gastos Variáveis representam ${stats.percGastosVariaveis}% das suas despesas totais. Este é o grupo onde você tem maior poder de decision imediata. Pequenos ajustes aqui são o caminho mais rápido para aumentar sua capacidade de investimento.`} align="right" />
              </div>

              <div className="flex items-center gap-4 relative" 
                onMouseEnter={() => setActiveInsight('media')} 
                onMouseLeave={() => setActiveInsight(null)}
                onClick={() => setActiveInsight(activeInsight === 'media' ? null : 'media')}
              >
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0 shadow-sm cursor-pointer">
                  <Zap size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Média/Dia</p>
                    <Info size={10} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-black text-gray-900">{stats.mediaGastosDiarios.split(',')[0]}</p>
                </div>
                <InsightPopover id="media" title="Média/Dia (Mês atual)" colorClass="text-orange-400" content={`Sua média diária atual de despesas é de ${stats.mediaGastosDiarios}. Este indicador é vital para o seu controle comportamental. Ao monitorar este valor, a Nucleo consegue propor formas eficazes de otimização financeira. Sua memória de cálculo é o 'Total de Despesas do mês atual' dividido pela 'Soma de dias do mês atual até o dia atual'`} align="left" />
              </div>

              <div className="flex items-center gap-4 relative" 
                onMouseEnter={() => setActiveInsight('membro')} 
                onMouseLeave={() => setActiveInsight(null)}
                onClick={() => setActiveInsight(activeInsight === 'membro' ? null : 'membro')}
              >
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 shadow-sm cursor-pointer">
                  <Award size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Cadastro</p>
                    <Info size={10} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-black text-gray-900">{stats.diasCadastro}</p>
                </div>
                <InsightPopover id="membro" title="Uso da Plataforma" colorClass="text-amber-500" content={`Você está conosco há ${stats.diasCadastro}! Quanto maior o seu tempo de uso na plataforma, mais refinados se tornam nossos algoritmos de inteligência de dados, proporcionando insights cada vez mais precisos para sua governança financeira pessoal.`} align="right" />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-10">
              <Link href="/lancamentos" className="block w-full p-4 bg-orange-500 rounded-xl group hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Novos Lançamentos</p>
                    <p className="text-white text-xs font-bold leading-tight">Atualize seus registros. Clique aqui.</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform shrink-0">
                    <Rocket size={20} fill="currentColor" className="text-orange-100" />
                  </div>
                </div>
              </Link>
              <Link href="/resultados" className="block w-full p-4 bg-blue-600 rounded-xl group hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Performance</p>
                    <p className="text-white text-xs font-bold leading-tight">Painel de Resultados. Acesse.</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform shrink-0">
                    <LayoutDashboard size={20} fill="currentColor" className="text-blue-100" />
                  </div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-12">
          <section className="bg-gray-50/50 rounded-[2.5rem] p-6 md:p-10 border border-gray-100">
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
                Preferências <div className="h-px bg-gray-200 flex-1"></div>
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Share2 size={12}/> Canal Origem</label>
                    <select value={origem} className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs outline-none" onChange={(e) => handleChange(setOrigem, e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="instagram">Instagram</option>
                        <option value="google">Google</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="indicacao">Indicação</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Target size={12}/> Objetivo</label>
                    <select value={objetivoPlataforma} className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs outline-none" onChange={(e) => handleChange(setObjetivoPlataforma, e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="liberdade">Liberdade Financeira</option>
                        <option value="sair_dividas">Sair de Dívidas</option>
                        <option value="investir">Começar a Investir</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Frequência</label>
                    <select value={usoApp} className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs outline-none" onChange={(e) => handleChange(setUsoApp, e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="diario">Diário</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensal">Mensal</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foco Atual</label>
                    <select value={objetivoFinanceiro} className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs outline-none" onChange={(e) => handleChange(setObjetivoFinanceiro, e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="pessoal">Pessoal</option>
                        <option value="familiar">Familiar</option>
                        <option value="empresa">Empresarial</option>
                    </select>
                </div>
             </div>
          </section>
      </div>

      <div className="mt-4 flex flex-col md:flex-row gap-4 justify-end border-gray-50 pt-8">
        <button 
          ref={saveButtonRef}
          onClick={handleUpdate} 
          disabled={updating} 
          className="flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          <Save size={16} /> {updating ? "Sincronizando..." : "Salvar Alterações"}
        </button>
      </div>

      <div className="mt-24 flex items-center gap-4 mb-12">
        <div className="h-px bg-gray-200 flex-1"></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

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

      {showPassModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowPassModal(false)} className="absolute right-8 top-8 text-gray-300 hover:text-gray-900 transition-colors">
              <X size={24} />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mx-auto mb-4">
                <KeyRound size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Nova Senha</h2>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <input type={showPass ? "text" : "password"} placeholder="Nova senha" required onChange={(e) => setNewPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none" />
              <input type={showPass ? "text" : "password"} placeholder="Confirmar senha" required onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none" />
              <button disabled={passLoading} className="w-full bg-gray-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                {passLoading ? "Processando..." : "Atualizar Senha"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const aplicarMascaraTelefone = (value: string) => {
  return value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
};