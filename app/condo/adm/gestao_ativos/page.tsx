// app/condo/adm/gestao_ativos/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
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

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'nucleo_condo_auth_session',
        }
    }
);

interface AtivoItem {
    id: string;
    condominio_id: string;
    nome: string;
    categoria: string;
    quantidade: number;
    valor_aquisicao: number | string;
    data_aquisicao: string;
}

export default function GestaoAtivosPage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
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

    const loadAtivos = async (condoId: string) => {
        const { data, error } = await supabase
            .from("condominio_ativos")
            .select("*")
            .eq("condominio_id", condoId)
            .order("data_aquisicao", { ascending: false });

        if (!error && data && isMountedRef.current) {
            setAtivos(data as AtivoItem[]);
        }
    };

    const verifySindicoAndLoadData = async (currentSession: any, retries = 2) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setCondominio(null);
                    setAtivos([]);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setSession(currentSession);
            }
            const userId = currentSession.user.id;

            let membroDataList = null;
            let membroError = null;

            for (let i = 0; i <= retries; i++) {
                const res = await supabase
                    .from("condominio_membros")
                    .select("condominio_id, role, unidade, acesso_app, condominio_nome")
                    .eq("user_id", userId);

                membroDataList = res.data;
                membroError = res.error;

                if (membroError) {
                    const errorMsg = membroError.message || JSON.stringify(membroError);
                    if (!errorMsg.includes("AbortError") && !errorMsg.includes("Lock broken")) {
                        console.error("Erro na consulta Supabase (membros):", errorMsg);
                    }
                }

                if (membroDataList && membroDataList.length > 0) {
                    break;
                }

                if (i < retries) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            }

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) {
                    setCondominio(null);
                    setLoading(false);
                }
                return;
            }

            const vinculoAdm = membroDataList.find(
                (m: any) => m.role === 'sindico'
            );

            if (!vinculoAdm) {
                if (isMountedRef.current) {
                    setCondominio(null);
                    setLoading(false);
                }
                return;
            }

            let nomeCondominioOficial = vinculoAdm.condominio_nome || "Condomínio";
            const { data: condoDataReal } = await supabase
                .from("condominios")
                .select("nome")
                .eq("id", vinculoAdm.condominio_id)
                .maybeSingle();

            if (condoDataReal && condoDataReal.nome) {
                nomeCondominioOficial = condoDataReal.nome;
            }

            if (isMountedRef.current) {
                setCondominio({
                    id: vinculoAdm.condominio_id,
                    nome: nomeCondominioOficial
                });
            }

            await loadAtivos(vinculoAdm.condominio_id);
        } catch (e: any) {
            const errString = e?.message || JSON.stringify(e);
            if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                console.warn("Exceção tratada em verifySindicoAndLoadData:", errString);
            }
            if (isMountedRef.current) {
                setCondominio(null);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;

        const initAuth = async () => {
            try {
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError && !currentSession) throw sessionError;

                if (isMountedRef.current) {
                    await verifySindicoAndLoadData(currentSession);
                }
            } catch (err: any) {
                const errString = err?.message || JSON.stringify(err);
                if (!errString.includes("AbortError") && !errString.includes("Lock broken")) {
                    console.error("Erro ao recuperar sessão inicial do síndico:", errString);
                }
                if (isMountedRef.current) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMountedRef.current) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (currentSession) {
                    await verifySindicoAndLoadData(currentSession);
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setCondominio(null);
                setAtivos([]);
                setLoading(false);
            }
        });

        return () => {
            isMountedRef.current = false;
            subscription.unsubscribe();
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
        if (!condominio) return;

        setActionLoading(true);
        setMsgErro("");
        setMsgSucesso("");

        try {
            // Normaliza o valor monetário substituindo vírgula por ponto para evitar erros de parse
            const valorTratado = valorInput.replace(',', '.');
            const valorNumerico = parseFloat(valorTratado);

            const payload = {
                condominio_id: condominio.id,
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

            await loadAtivos(condominio.id);
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

        setActionLoading(true);
        const { error } = await supabase
            .from("condominio_ativos")
            .delete()
            .eq("id", id);

        if (!error && condominio) {
            await loadAtivos(condominio.id);
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

    if (!session || !condominio) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <h1 className="text-xl font-black text-zinc-900">Acesso restrito</h1>
                    <p className="text-sm text-zinc-500">Faça login como síndico para acessar esta página.</p>
                    <Link href="/condo/adm" className="inline-block bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                        Voltar ao Painel
                    </Link>
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
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5 text-zinc-900">Controle Bens</h1>
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
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Categoria</label>
                                <select
                                    value={categoriaInput}
                                    onChange={(e) => setCategoriaInput(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-bold uppercase tracking-wider cursor-pointer"
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
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
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
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
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
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 text-xs font-medium"
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
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Conecte-se</h3>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="flex flex-col items-center text-center pb-6">
                    <a
                        href="https://www.instagram.com/nucleobase.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col items-center gap-4"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[1.8rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-xl relative z-10 group-hover:rotate-6 transition-all duration-500">
                            <Instagram className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                        </div>
                        <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-pink-500 transition-colors">@nucleobase.app</span>
                    </a>
                </div>
            </div>
        </div>
    );
}