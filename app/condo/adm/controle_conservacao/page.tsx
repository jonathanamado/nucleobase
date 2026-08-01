// app/condo/adm/controle_conservacao/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Loader2,
    ArrowLeft,
    Instagram,
    Wrench,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Edit3,
    X
} from "lucide-react";

interface ConservacaoItem {
    id: string;
    condominio_id: string;
    area_item: string;
    tipo_manutencao: string;
    frequencia: string;
    ultima_realizacao: string;
}

interface UserMemberData {
    role: string;
    condominio_id: string;
    unidade: string;
    condominio: {
        nome: string;
    };
}

export default function ControleConservacaoPage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);
    const [itens, setItens] = useState<ConservacaoItem[]>([]);

    // Estados de Modal / Cadastro / Edição
    const [showModal, setShowModal] = useState(false);
    const [itemEditando, setItemEditando] = useState<ConservacaoItem | null>(null);

    // Campos do Formulário
    const [areaItemInput, setAreaItemInput] = useState("");
    const [tipoManutencaoInput, setTipoManutencaoInput] = useState("Preventiva");
    const [frequenciaInput, setFrequenciaInput] = useState("Mensal");
    const [ultimaRealizacaoInput, setUltimaRealizacaoInput] = useState(new Date().toISOString().split('T')[0]);

    const [msgSucesso, setMsgSucesso] = useState("");
    const [msgErro, setMsgErro] = useState("");

    const isMountedRef = useRef(true);

    const formatarNomePrimeiroEUltimo = (nomeCompleto?: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length === 0) return "";
        if (partes.length === 1) return partes[0];
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const loadItens = async (condoId: string) => {
        try {
            const { data, error } = await supabase
                .from("condominio_conservacao")
                .select("*")
                .eq("condominio_id", condoId)
                .order("ultima_realizacao", { ascending: false });

            if (!error && data && isMountedRef.current) {
                setItens(data as ConservacaoItem[]);
            }
        } catch (err) {
            console.error("Erro ao carregar itens de conservação:", err);
        }
    };

    const verifyAccessAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setMemberData(null);
                    setItens([]);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setSession(currentSession);
            }
            const userId = currentSession.user.id;

            const { data: membroDataList, error: membroError } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, unidade, acesso_app, condominio_nome")
                .eq("user_id", userId);

            if (membroError) {
                const errorMsg = membroError.message || JSON.stringify(membroError);
                if (!errorMsg.includes("AbortError") && !errorMsg.includes("Lock broken")) {
                    console.error("Erro na consulta Supabase (membros conservação):", errorMsg);
                }
            }

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) {
                    setMemberData(null);
                    setLoading(false);
                }
                return;
            }

            const vinculoAdm = membroDataList.find(
                (m: any) => {
                    const r = (m.role || "").toLowerCase();
                    const u = (m.unidade || "").toLowerCase();
                    return r === 'sindico' || r === 'síndico' || r === 'adm' || r === 'administrador' || u === '106' || u === 'adm';
                }
            ) || membroDataList[0];

            if (!vinculoAdm) {
                if (isMountedRef.current) {
                    setMemberData(null);
                    setLoading(false);
                }
                return;
            }

            let nomeCondominioOficial = vinculoAdm.condominio_nome || "Condomínio";
            if (vinculoAdm.condominio_id) {
                const { data: condoData } = await supabase
                    .from("condominios")
                    .select("nome")
                    .eq("id", vinculoAdm.condominio_id)
                    .maybeSingle();

                if (condoData && condoData.nome) {
                    nomeCondominioOficial = condoData.nome;
                }
            }

            if (isMountedRef.current) {
                setMemberData({
                    role: vinculoAdm.role,
                    condominio_id: vinculoAdm.condominio_id,
                    unidade: vinculoAdm.unidade,
                    condominio: {
                        nome: nomeCondominioOficial
                    }
                });
                await loadItens(vinculoAdm.condominio_id);
            }
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.warn("Exceção tratada em verifyAccessAndLoadData:", errString);
            }
            if (isMountedRef.current) {
                setMemberData(null);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        let authSub: any = null;

        const initAuth = async () => {
            try {
                const timeoutId = setTimeout(() => {
                    if (isMountedRef.current && loading) {
                        setLoading(false);
                    }
                }, 5000);

                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                clearTimeout(timeoutId);

                if (sessionError && !currentSession) throw sessionError;

                if (isMountedRef.current) {
                    await verifyAccessAndLoadData(currentSession);
                }
            } catch (err: any) {
                const errString = err?.message || JSON.stringify(err);
                if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                    console.error("Erro ao recuperar sessão inicial conservação:", errString);
                }
                if (isMountedRef.current) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMountedRef.current) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (currentSession) {
                    await verifyAccessAndLoadData(currentSession);
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setMemberData(null);
                setItens([]);
                setLoading(false);
            }
        });
        authSub = subscription;

        return () => {
            isMountedRef.current = false;
            if (authSub) authSub.unsubscribe();
        };
    }, []);

    const abrirNovoCadastro = () => {
        setItemEditando(null);
        setAreaItemInput("");
        setTipoManutencaoInput("Preventiva");
        setFrequenciaInput("Mensal");
        setUltimaRealizacaoInput(new Date().toISOString().split('T')[0]);
        setMsgSucesso("");
        setMsgErro("");
        setShowModal(true);
    };

    const abrirEdicao = (item: ConservacaoItem) => {
        setItemEditando(item);
        setAreaItemInput(item.area_item);
        setTipoManutencaoInput(item.tipo_manutencao);
        setFrequenciaInput(item.frequencia);
        setUltimaRealizacaoInput(item.ultima_realizacao ? item.ultima_realizacao.split('T')[0] : new Date().toISOString().split('T')[0]);
        setMsgSucesso("");
        setMsgErro("");
        setShowModal(true);
    };

    const handleSalvarItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberData) return;

        setActionLoading(true);
        setMsgErro("");
        setMsgSucesso("");

        try {
            const payload = {
                condominio_id: memberData.condominio_id,
                area_item: areaItemInput.trim(),
                tipo_manutencao: tipoManutencaoInput.trim(),
                frequencia: frequenciaInput.trim(),
                ultima_realizacao: ultimaRealizacaoInput
            };

            if (itemEditando) {
                const { error } = await supabase
                    .from("condominio_conservacao")
                    .update(payload)
                    .eq("id", itemEditando.id);

                if (error) throw error;
                setMsgSucesso("Registro de conservação atualizado com sucesso!");
            } else {
                const { error } = await supabase
                    .from("condominio_conservacao")
                    .insert([payload]);

                if (error) throw error;
                setMsgSucesso("Registro de conservação cadastrado com sucesso!");
            }

            await loadItens(memberData.condominio_id);
            setTimeout(() => {
                setShowModal(false);
                setMsgSucesso("");
            }, 1000);
        } catch (err: any) {
            setMsgErro(err?.message || "Erro ao salvar registro de conservação do condomínio.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExcluir = async (id: string) => {
        if (!confirm("Deseja realmente remover este registro de conservação?")) return;
        if (!memberData) return;

        setActionLoading(true);
        const { error } = await supabase
            .from("condominio_conservacao")
            .delete()
            .eq("id", id);

        if (!error) {
            await loadItens(memberData.condominio_id);
        }
        setActionLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-zinc-900 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando controle de conservação...</p>
            </div>
        );
    }

    if (!session || !memberData) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Faça login com um perfil autorizado para acessar esta página.</p>
                    <div className="pt-2 flex flex-col gap-2">
                        <Link href="/condo/adm" className="inline-block bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                            Voltar ao Painel
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 md:p-10 flex flex-col justify-between">
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-auto h-auto bg-zinc-900 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/25 shrink-0 self-stretch">
                                <Wrench size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Controle Conservação</span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5 text-zinc-900">
                                    <span className="md:hidden text-black">{formatarNomePrimeiroEUltimo(memberData?.condominio?.nome)}</span>
                                    <span className="hidden md:inline">{memberData?.condominio?.nome || "Condomínio"}</span>
                                </h1>
                            </div>
                        </div>

                        <button
                            onClick={() => router.back()}
                            className="group relative hidden md:flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 overflow-hidden shrink-0 cursor-pointer"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                            <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                            <span>Voltar</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">
                        Monitore a manutenção, a preservação e os cuidados periódicos das áreas comuns do condomínio.
                    </p>

                    <button
                        onClick={abrirNovoCadastro}
                        className="group relative flex items-center justify-center gap-1.5 h-9 px-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 shrink-0 cursor-pointer self-end sm:self-auto"
                    >
                        <Plus size={12} />
                        <span>Novo Registro</span>
                    </button>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm mb-12">
                    {itens.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <AlertCircle className="mx-auto text-zinc-300" size={36} />
                            <p className="text-zinc-400 text-sm font-medium">Nenhum registro de conservação cadastrado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[450px]">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="sticky top-0 bg-white z-10 border-b border-zinc-100">
                                    <tr>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Área / Item</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Tipo</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Frequência</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Última Realização</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right sticky right-0 bg-white md:bg-transparent pl-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {itens.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.area_item}
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.tipo_manutencao}
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.frequencia}
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.ultima_realizacao ? new Date(item.ultima_realizacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                            </td>
                                            <td className="py-3.5 text-right sticky right-0 bg-white md:bg-transparent pl-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => abrirEdicao(item)}
                                                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                                                        title="Editar Registro"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleExcluir(item.id)}
                                                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                                        title="Excluir Registro"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative border border-zinc-100 animate-in zoom-in-95 duration-200 my-auto">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                            <Wrench className="text-zinc-900" size={20} />
                            <h2 className="font-bold text-base">{itemEditando ? "Editar Conservação" : "Novo Registro de Conservação"}</h2>
                        </div>

                        <form onSubmit={handleSalvarItem} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Área / Item</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Elevadores, Jardim, Fachada, Piscina..."
                                    required
                                    value={areaItemInput}
                                    onChange={(e) => setAreaItemInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-400 text-xs font-medium text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Tipo de Manutenção</label>
                                <select
                                    value={tipoManutencaoInput}
                                    onChange={(e) => setTipoManutencaoInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-400 text-xs font-bold uppercase tracking-wider cursor-pointer text-zinc-900"
                                >
                                    <option value="Preventiva">Preventiva</option>
                                    <option value="Corretiva">Corretiva</option>
                                    <option value="Limpeza / Conservação">Limpeza / Conservação</option>
                                    <option value="Inspeção">Inspeção</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Frequência</label>
                                <select
                                    value={frequenciaInput}
                                    onChange={(e) => setFrequenciaInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-400 text-xs font-bold uppercase tracking-wider cursor-pointer text-zinc-900"
                                >
                                    <option value="Semanal">Semanal</option>
                                    <option value="Mensal">Mensal</option>
                                    <option value="Trimestral">Trimestral</option>
                                    <option value="Semestral">Semestral</option>
                                    <option value="Anual">Anual</option>
                                    <option value="Eventual">Eventual</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Última Realização</label>
                                <input
                                    type="date"
                                    required
                                    value={ultimaRealizacaoInput}
                                    onChange={(e) => setUltimaRealizacaoInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-400 text-xs font-medium text-zinc-900"
                                />
                            </div>

                            {msgErro && <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl">{msgErro}</p>}
                            {msgSucesso && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {msgSucesso}</p>}

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-zinc-900 hover:bg-black text-white py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-zinc-900/10 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {actionLoading ? "Salvando..." : itemEditando ? "Salvar Alterações" : "Cadastrar Registro"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div>
                <div className="mt-24 flex items-center gap-4 mb-12">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="max-w-3xl mb-12">
                        <h4 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tighter mb-2">
                            Fique por dentro <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">do nosso universo.</span>
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
            </div>
        </div>
    );
}