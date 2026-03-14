"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Save, MapPin, UserCircle, Camera, GraduationCap, Briefcase, 
  Baby, CalendarDays, Activity, MousePointerClick, 
  Trophy, CheckCircle2, TrendingUp, Info, KeyRound, Instagram, X, Eye, EyeOff,
  Target, Share2, Wallet, Zap
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
  
  // --- ESTADOS DE SISTEMA ---
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // --- ESTATÍSTICAS REAIS ---
  const [stats, setStats] = useState({
    totalLancamentos: 0,
    mesesAtivos: [] as string[],
    ultimoLancamento: "---",
    percentualPerfil: 100,
    patrimonioConectado: 0,
    mediaGastosDiarios: "R$ 0,00"
  });

  const aplicarMascaraTelefone = (value: string) => {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
  };

  async function carregarEstatisticas(userId: string) {
    const agora = new Date();
    const mesAtualNum = agora.getMonth() + 1;
    const anoAtualNum = agora.getFullYear();

    const { count, data: allRecords } = await supabase
      .from("lancamentos_financeiros")
      .select("created_at, origem, cartao_nome, data_competencia, natureza, valor", { count: "exact" })
      .eq("user_id", userId);

    if (allRecords && allRecords.length > 0) {
      const mesesMap: Record<string, string> = {
        '01': 'jan', '02': 'fev', '03': 'mar', '04': 'abr', '05': 'mai', '06': 'jun',
        '07': 'jul', '08': 'ago', '09': 'set', '10': 'out', '11': 'nov', '12': 'dez'
      };

      const mesesUnicosSorted = allRecords
        .map(l => l.data_competencia.substring(0, 7))
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort()
        .map(ym => {
          const [year, month] = ym.split('-');
          return `${mesesMap[month]}/${year}`;
        });

      const bancosUnicos = new Set(allRecords.map(l => l.origem).filter(Boolean)).size;
      const cartoesUnicos = new Set(allRecords.map(l => l.cartao_nome).filter(Boolean)).size;

      const despesasMes = allRecords.filter(l => {
        const [ano, mes] = l.data_competencia.split('-');
        const isDespesa = l.natureza === 'Despesa';
        const isMesAtual = Number(mes) === mesAtualNum && Number(ano) === anoAtualNum;
        return isDespesa && isMesAtual;
      });

      const totalDespesas = despesasMes.reduce((acc, curr) => acc + Math.abs(Number(curr.valor)), 0);
      const diaCorrente = agora.getDate();
      const mediaDiaria = totalDespesas / diaCorrente;

      const lastRecord = [...allRecords].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      setStats({
        totalLancamentos: count || 0,
        mesesAtivos: mesesUnicosSorted,
        ultimoLancamento: new Date(lastRecord.created_at).toLocaleDateString('pt-BR'),
        percentualPerfil: 100,
        patrimonioConectado: bancosUnicos + cartoesUnicos,
        mediaGastosDiarios: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaDiaria)
      });
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
      else alert("Dados salvos!");
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

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 animate-pulse font-medium">Sincronizando...</div>;

  return (
    <div className="w-full md:pr-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 relative px-4 md:px-0">
      
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight flex items-center">
            <span>Minha conta<span className="text-blue-600">.</span></span>
            <UserCircle size={32} className="text-blue-600 opacity-35 ml-3" strokeWidth={2} />
          </h1>
          <div className="flex items-center gap-3">
             <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold lowercase">#{slug || "user"}</span>
             <p className="text-gray-500 text-sm font-medium leading-relaxed">, gerencie seus dados e acompanhe seu comportamento.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* COLUNA ESQUERDA: DADOS PESSOAIS */}
        <div className="lg:col-span-8 h-full">
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-6 mb-12">
              <div className="relative group shrink-0">
                <div className={`w-24 h-24 rounded-[2.5rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all ${uploadingAvatar ? 'opacity-40' : 'opacity-100'}`}>
                  {avatarUrl ? <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserCircle size={48} className="text-gray-200" />}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-[2.5rem] cursor-pointer transition-all">
                  <Camera size={24} />
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Dados Cadastrais</h4>
                <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1 leading-tight">Identidade Nucleobase</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-1">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nome Completo</label>
                <input type="text" value={nome} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white outline-none font-medium transition-all" onChange={(e) => setNome(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase ml-1 tracking-widest">E-mail de Notificações</label>
                <input type="email" value={emailContato} className="w-full h-12 px-5 bg-blue-50/30 border border-blue-100 rounded-2xl text-sm text-blue-900 outline-none" onChange={(e) => setEmailContato(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Telefone</label>
                <input type="text" value={telefone} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm" onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Data de Nascimento</label>
                <input type="date" value={dataNascimento} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm" onChange={(e) => setDataNascimento(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Gênero</label>
                <select value={genero} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => setGenero(e.target.value)}>
                  <option value=""></option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Prefiro não dizer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">Estado Civil</label>
                <select value={estadoCivil} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => setEstadoCivil(e.target.value)}>
                  <option value=""></option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="uniao_estavel">União Estável</option>
                  <option value="divorciado">Divorciado(a)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2"><Baby size={14}/> Possui filhos?</label>
                <select value={possuiFilhos} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => setPossuiFilhos(e.target.value)}>
                  <option value=""></option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              {/* AJUSTE SOLICITADO: CIDADE / UF EM UMA LINHA NO MOBILE */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2"><MapPin size={14}/> Cidade / UF</label>
                <div className="flex gap-2 flex-nowrap">
                    <input type="text" value={cidade} placeholder="Cidade" className="flex-1 min-w-0 h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => setCidade(e.target.value)} />
                    <select value={estado} className="w-20 shrink-0 h-12 px-2 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => setEstado(e.target.value)}>
                        <option value=""></option>
                        {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2"><Briefcase size={14}/> Profissão Atual</label>
                <input type="text" value={profissao} className="w-full h-12 px-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => setProfissao(e.target.value)} />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2"><GraduationCap size={14}/> Formação Acadêmica</label>
                <select value={formacao} className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none" onChange={(e) => setFormacao(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="medio">Ensino Médio</option>
                  <option value="superior">Ensino Superior</option>
                  <option value="pos">Pós-graduação</option>
                  <option value="mestrado">Mestrado</option>
                  <option value="doutorado">Doutorado</option>
                </select>
              </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row gap-4 justify-end border-t border-gray-50 pt-8">
              <button onClick={() => setShowPassModal(true)} className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                <KeyRound size={16} /> Alterar Senha
              </button>
              <button onClick={handleUpdate} disabled={updating} className="flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                <Save size={16} /> {updating ? "Sincronizando..." : "Salvar Alterações"}
              </button>
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA: COMPORTAMENTO */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shrink-0">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Força dos Dados</h3>
                <span className="text-xs font-bold">{stats.percentualPerfil}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${stats.percentualPerfil}%` }}></div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed italic">
                {stats.percentualPerfil < 100 
                  ? "Complete seus dados para obter uma análise comparativa de mercado."
                  : "Perfil completo! Sua precisão nos relatórios é máxima."}
              </p>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex-1 flex flex-col">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 mb-8">
              <Activity size={16} className="text-blue-600"/> Atividade Recente
            </h3>

            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <MousePointerClick size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Total Lançamentos (Acumulado)</p>
                  <p className="text-lg font-black text-gray-900">{stats.totalLancamentos}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Meses Ativos</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {stats.mesesAtivos.length > 0 ? (
                      stats.mesesAtivos.map(m => (
                        <span key={m} className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">{m}</span>
                      ))
                    ) : (
                      <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase">---</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Patrimônio Conectado</p>
                  <p className="text-sm font-bold text-gray-900">{stats.patrimonioConectado} origens de cartão informada(s)</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Gasto Diário Médio (Mês atual)</p>
                  <p className="text-sm font-bold text-gray-900">{stats.mediaGastosDiarios}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Última Atividade de Lançamento</p>
                  <p className="text-sm font-bold text-gray-900">{stats.ultimoLancamento}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-blue-50 rounded-3xl border border-blue-100 relative overflow-hidden group">
               <TrendingUp size={40} className="absolute -right-2 -bottom-2 text-blue-200/40 group-hover:scale-110 transition-transform" />
               <h4 className="text-[10px] font-black text-blue-700 uppercase mb-2 flex items-center gap-2">
                 <Trophy size={12}/> Insight Nucleobase
               </h4>
               <p className="text-[11px] text-blue-900/60 font-medium leading-relaxed">
                 O equilíbrio entre receita e despesa é o primeiro passo para a sua liberdade financeira.
               </p>
            </div>
          </section>

          <section className="p-6 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex items-center gap-4 shrink-0">
             <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <Info size={20} />
             </div>
             <p className="text-[10px] text-gray-400 font-medium leading-tight">
               Seus dados demográficos são usados apenas para gerar comparativos anônimos de custo de vida na sua região.
             </p>
          </section>
        </div>
      </div>

      {/* SEÇÃO DE OBJETIVOS */}
      <div className="mt-10">
          <section className="bg-gray-50/50 rounded-[2.5rem] p-10 border border-gray-100">
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
               Preferências da Plataforma <div className="h-px bg-gray-200 flex-1"></div>
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Share2 size={12}/> Canal Origem</label>
                    <select value={origem} className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs" onChange={(e) => setOrigem(e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="instagram">Instagram</option>
                        <option value="google">Google</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="indicacao">Indicação</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Target size={12}/> Objetivo</label>
                    <select value={objetivoPlataforma} className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs" onChange={(e) => setObjetivoPlataforma(e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="liberdade">Liberdade Financeira</option>
                        <option value="sair_dividas">Sair de Dívidas</option>
                        <option value="investir">Começar a Investir</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Frequência</label>
                    <select value={usoApp} className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs" onChange={(e) => setUsoApp(e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="diario">Diário</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensal">Mensal</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foco Atual</label>
                    <select value={objetivoFinanceiro} className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs" onChange={(e) => setObjetivoFinanceiro(e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="pessoal">Pessoal</option>
                        <option value="familiar">Familiar</option>
                        <option value="empresa">Empresarial</option>
                    </select>
                </div>
             </div>
          </section>
      </div>

      {/* BLOCO INSTAGRAM */}
      <div className="mt-24 text-center border-t border-gray-100 pt-20">
        <h4 className="text-3xl font-bold text-gray-900 tracking-tighter mb-12">Fique por dentro <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span></h4>
        <a href="https://www.instagram.com/nucleobase.app/" target="_blank" rel="noopener noreferrer" className="group inline-flex flex-col items-center gap-4 transition-all">
          <div className="w-24 h-24 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[2.5rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-all duration-500">
            <Instagram size={48} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-600 transition-colors">@nucleobase.app</span>
        </a>
      </div>

      {/* MODAL ALTERAR SENHA */}
      {showPassModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
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
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Nova senha" required onChange={(e) => setNewPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input type={showPass ? "text" : "password"} placeholder="Confirmar senha" required onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none" />
              <button disabled={passLoading} className="w-full bg-gray-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] mt-2 active:scale-95 transition-all">
                {passLoading ? "Processando..." : "Atualizar Senha"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}