// app/condo/adm/gestao_ativos/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Loader2,
    ArrowLeft,
    Instagram,
    Package,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Edit3,
    X
} from "lucide-react";

interface AtivoItem {
    id: string;
    condominio_id: string;
    nome: string;
    categoria: string;
    quantidade: number;
    valor_aquisicao: number | string;
    data_aquisicao: string;
}

interface UserMemberData {
    role: string;
    condominio_id: string;
    unidade: string;
    condominio: {
        nome: string;
    };
}

export default function GestaoAtivosPage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [memberData, setMemberData] = useState<UserMemberData | null>(null);
    const [ativos, setAtivos] = useState<AtivoItem[]>([]);

    // Estados de Modal / Cadastro / Edição
    const [showModal, setShowModal] = useState(false);
    const [itemEditando, setItemEditando] = useState<AtivoItem | null>(null);

    // Campos do Formulário
    const [nomeInput, setNomeInput] = useState("");
    const [categoriaInput, setCategoriaInput] = useState("Equipamento");
    const [quantidadeInput, setQuantidadeInput] = useState("1");
    const [valorInput, setValorInput] = useState("");
    const [dataAquisicaoInput, setDataAquisicaoInput] = useState(new Date().toISOString().split('T')[0]);

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

    const loadAtivos = async (condoId: string) => {
        try {
            const { data, error } = await supabase
                .from("condominio_ativos")
                .select("*")
                .eq("condominio_id", condoId)
                .order("data_aquisicao", { ascending: false });

            if (!error && data && isMountedRef.current) {
                setAtivos(data as AtivoItem[]);
            }
        } catch (err) {
            console.error("Erro ao carregar ativos:", err);
        }
    };

    const verifyAccessAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setMemberData(null);
                    setAtivos([]);
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
                    console.error("Erro na consulta Supabase (membros ativos):", errorMsg);
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
                await loadAtivos(vinculoAdm.condominio_id);
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
                    console.error("Erro ao recuperar sessão inicial ativos:", errString);
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
                setAtivos([]);
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
        setNomeInput("");
        setCategoriaInput("Equipamento");
        setQuantidadeInput("1");
        setValorInput("");
        setDataAquisicaoInput(new Date().toISOString().split('T')[0]);
        setMsgSucesso("");
        setMsgErro("");
        setShowModal(true);
    };

    const abrirEdicao = (item: AtivoItem) => {
        setItemEditando(item);
        setNomeInput(item.nome);
        setCategoriaInput(item.categoria);
        setQuantidadeInput(item.quantidade.toString());
        setValorInput(item.valor_aquisicao ? item.valor_aquisicao.toString() : "");
        setDataAquisicaoInput(item.data_aquisicao ? item.data_aquisicao.split('T')[0] : new Date().toISOString().split('T')[0]);
        setMsgSucesso("");
        setMsgErro("");
        setShowModal(true);
    };

    const handleSalvarAtivo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberData) return;

        setActionLoading(true);
        setMsgErro("");
        setMsgSucesso("");

        try {
            const valorTratado = valorInput.replace(',', '.');
            const valorNumerico = parseFloat(valorTratado);

            const payload = {
                condominio_id: memberData.condominio_id,
                nome: nomeInput.trim(),
                categoria: categoriaInput.trim(),
                quantidade: parseInt(quantidadeInput, 10) || 1,
                valor_aquisicao: isNaN(valorNumerico) ? 0 : valorNumerico,
                data_aquisicao: dataAquisicaoInput
            };

            if (itemEditando) {
                const { error } = await supabase
                    .from("condominio_ativos")
                    .update(payload)
                    .eq("id", itemEditando.id);

                if (error) throw error;
                setMsgSucesso("Ativo atualizado com sucesso!");
            } else {
                const { error } = await supabase
                    .from("condominio_ativos")
                    .insert([payload]);

                if (error) throw error;
                setMsgSucesso("Ativo cadastrado com sucesso!");
            }

            await loadAtivos(memberData.condominio_id);
            setTimeout(() => {
                setShowModal(false);
                setMsgSucesso("");
            }, 1000);
        } catch (err: any) {
            setMsgErro(err?.message || "Erro ao salvar ativo do condomínio.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExcluir = async (id: string) => {
        if (!confirm("Deseja realmente remover este ativo do inventário?")) return;
        if (!memberData) return;

        setActionLoading(true);
        const { error } = await supabase
            .from("condominio_ativos")
            .delete()
            .eq("id", id);

        if (!error) {
            await loadAtivos(memberData.condominio_id);
        }
        setActionLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando controle de bens...</p>
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
                            <div className="w-auto h-auto bg-indigo-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0 self-stretch">
                                <Package size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Gestão de Ativos</span>
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
                        Cadastre e gerencie o patrimônio e os bens permanentes pertencentes ao condomínio.
                    </p>

                    <button
                        onClick={abrirNovoCadastro}
                        className="group relative flex items-center justify-center gap-1.5 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-600/10 active:scale-95 shrink-0 cursor-pointer self-end sm:self-auto"
                    >
                        <Plus size={12} />
                        <span>Novo Ativo</span>
                    </button>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm mb-12">
                    {ativos.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <AlertCircle className="mx-auto text-zinc-300" size={36} />
                            <p className="text-zinc-400 text-sm font-medium">Nenhum bem patrimonial cadastrado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[450px]">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="sticky top-0 bg-white z-10 border-b border-zinc-100">
                                    <tr>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Item / Bem</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Categoria</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Qtd</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Valor</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Data</th>
                                        <th className="pb-3 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right sticky right-0 bg-white md:bg-transparent pl-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {ativos.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.nome}
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.categoria}
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.quantidade} un
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                R$ {Number(item.valor_aquisicao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3.5 pr-3 text-xs font-bold text-zinc-800">
                                                {item.data_aquisicao ? new Date(item.data_aquisicao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                            </td>
                                            <td className="py-3.5 text-right sticky right-0 bg-white md:bg-transparent pl-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => abrirEdicao(item)}
                                                        className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                                                        title="Editar Ativo"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleExcluir(item.id)}
                                                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                                        title="Excluir Ativo"
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
                            <Package className="text-indigo-600" size={20} />
                            <h2 className="font-bold text-base">{itemEditando ? "Editar Ativo" : "Novo Ativo / Bem"}</h2>
                        </div>

                        <form onSubmit={handleSalvarAtivo} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Nome do Item</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Microondas, Frigobar, Mesas..."
                                    required
                                    value={nomeInput}
                                    onChange={(e) => setNomeInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Categoria</label>
                                <select
                                    value={categoriaInput}
                                    onChange={(e) => setCategoriaInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-bold uppercase tracking-wider cursor-pointer text-zinc-900"
                                >
                                    <option value="Equipamento">Equipamento</option>
                                    <option value="Mobiliário">Mobiliário</option>
                                    <option value="Eletrodoméstico">Eletrodoméstico</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Quantidade</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={quantidadeInput}
                                        onChange={(e) => setQuantidadeInput(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium text-zinc-900"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Valor Unitário (R$)</label>
                                    <input
                                        type="text"
                                        placeholder="0.00"
                                        required
                                        value={valorInput}
                                        onChange={(e) => setValorInput(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium text-zinc-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Data de Aquisição</label>
                                <input
                                    type="date"
                                    required
                                    value={dataAquisicaoInput}
                                    onChange={(e) => setDataAquisicaoInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium text-zinc-900"
                                />
                            </div>

                            {msgErro && <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl">{msgErro}</p>}
                            {msgSucesso && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {msgSucesso}</p>}

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {actionLoading ? "Salvando..." : itemEditando ? "Salvar Alterações" : "Cadastrar Ativo"}
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