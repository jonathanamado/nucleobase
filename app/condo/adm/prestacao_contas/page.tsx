"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Building2,
    CheckCircle2,
    ArrowLeft,
    Instagram,
    FileSpreadsheet,
    Edit3,
    Lock,
    Key,
    AtSign,
    Eye,
    EyeOff,
    LifeBuoy,
    Mail,
    X,
    KeyRound,
    UserCheck,
    ArrowRight,
    Flame,
    PartyPopper,
    Plus,
    Trash2,
    Wallet,
    Calendar,
    DollarSign,
    Users
} from "lucide-react";

interface SalaoUsoItem {
    id: string;
    unidade: string;
    taxa: number;
    responsavel_nome: string;
    data_reserva: string;
    status: string;
    status_cobranca?: string;
}

export default function PrestacaoContasPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // Estados de loading independentes por seção
    const [loadingContas, setLoadingContas] = useState(false);
    const [loadingTarifaGas, setLoadingTarifaGas] = useState(false);
    const [loadingMedicaoGas, setLoadingMedicaoGas] = useState(false);
    const [loadingFundo, setLoadingFundo] = useState(false);
    const [loadingRateioSindico, setLoadingRateioSindico] = useState(false);

    // Controle de Login
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");

    // Modais de Recuperação e Primeiro Acesso
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
    const [firstAccessSlug, setFirstAccessSlug] = useState("");
    const [firstAccessLoading, setFirstAccessLoading] = useState(false);

    // Dados do Condomínio
    const [condominio, setCondominio] = useState<{ id: string; nome: string } | null>(null);
    const [isApenasMorador, setIsApenasMorador] = useState(false);

    // Filtro de Mês/Ano específico para Consumos e Reservas
    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Estados para Lançamentos de Prestação de Contas
    const [tipoConta, setTipoConta] = useState<'receita' | 'despesa'>('receita');
    const [categoriaConta, setCategoriaConta] = useState('Receita Condomínio');
    const [descricaoConta, setDescricaoConta] = useState('Pagamento Condomínio');
    const [valorPrevistoConta, setValorPrevistoConta] = useState('0,00');
    const [valorRealizadoConta, setValorRealizadoConta] = useState('0,00');
    const [dataCompetenciaConta, setDataCompetenciaConta] = useState(new Date().toISOString().slice(0, 7) + '-01');
    const [contasError, setContasError] = useState('');
    const [contasSuccess, setContasSuccess] = useState('');

    // Estados para Controle de Consumo
    const [valorMetroCubicoGas, setValorMetroCubicoGas] = useState('0,00');
    const [tarifaGasSuccess, setTarifaGasSuccess] = useState('');

    const [unidadesCondominio, setUnidadesCondominio] = useState<string[]>([]);
    const [gasConsumoMap, setGasConsumoMap] = useState<Record<string, { anterior: string; atual: string }>>({});
    const [medicaoGasSuccess, setMedicaoGasSuccess] = useState('');

    const [salaoUsos, setSalaoUsos] = useState<SalaoUsoItem[]>([]);

    const [valorFundoReserva, setValorFundoReserva] = useState('0,00');
    const [fundoReservaSuccess, setFundoReservaSuccess] = useState('');

    // Estados para Rateio Síndico
    const [valorRateioSindico, setValorRateioSindico] = useState('0,00');
    const [qtdAptosRateioSindico, setQtdAptosRateioSindico] = useState('');
    const [rateioSindicoSuccess, setRateioSindicoSuccess] = useState('');

    const isMountedRef = useRef(true);

    const formatarNomePrimeiroEUltimo = (nomeCompleto: string) => {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(/\s+/);
        if (partes.length <= 1) return partes[0] || "";
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    const formatarValorExibicao = (valor: any): string => {
        if (valor === null || valor === undefined || valor === '') return '0,00';
        const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
        if (isNaN(num)) return '0,00';
        return num.toFixed(2).replace('.', ',');
    };

    // Formatação específica para medidores (3 casas decimais)
    const formatarMedicaoGasExibicao = (valor: any): string => {
        if (valor === null || valor === undefined || valor === '') return '';
        const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
        if (isNaN(num)) return '';
        return num.toFixed(3).replace('.', ',');
    };

    // Conversão robusta de "442,185" para 442.185 do DB
    const converterParaFloat = (valorStr: string): number => {
        if (!valorStr) return 0;
        let limpo = String(valorStr).trim();
        if (limpo.includes('.') && limpo.includes(',')) {
            limpo = limpo.replace(/\./g, '').replace(',', '.');
        } else if (limpo.includes(',')) {
            limpo = limpo.replace(',', '.');
        } else if ((limpo.match(/\./g) || []).length > 1) {
            limpo = limpo.replace(/\./g, '');
        }
        const num = parseFloat(limpo);
        return isNaN(num) ? 0 : num;
    };

    const handleTipoContaChange = (novoTipo: 'receita' | 'despesa') => {
        setTipoConta(novoTipo);
        if (novoTipo === 'receita') {
            setCategoriaConta('Receita Condomínio');
            setDescricaoConta('Pagamento Condomínio');
        } else {
            setCategoriaConta('Despesa Condomínio');
            setDescricaoConta('Manutenção Geral');
        }
    };

    const carregarDadosCompetencia = async (condoId: string, competencia: string) => {
        try {
            const dataCompetenciaCompleta = `${competencia}-01`;

            const { data: membrosData } = await supabase
                .from("condominio_membros")
                .select("unidade")
                .eq("condominio_id", condoId);

            const unicas = Array.from(new Set((membrosData || []).map((m: any) => m.unidade?.trim()).filter(Boolean))).sort();
            setUnidadesCondominio(unicas);

            const { data: tarifaData } = await supabase
                .from("condominio_contas_gas_metro_cubico")
                .select("valor_metro_cubico")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            if (tarifaData) {
                setValorMetroCubicoGas(formatarValorExibicao(tarifaData.valor_metro_cubico));
            } else {
                const { data: ultimaTarifa } = await supabase
                    .from("condominio_contas_gas_metro_cubico")
                    .select("valor_metro_cubico")
                    .eq("condominio_id", condoId)
                    .lte("data_competencia", dataCompetenciaCompleta)
                    .order("data_competencia", { ascending: false })
                    .limit(1);

                if (ultimaTarifa && ultimaTarifa.length > 0) {
                    setValorMetroCubicoGas(formatarValorExibicao(ultimaTarifa[0].valor_metro_cubico));
                } else {
                    setValorMetroCubicoGas('0,00');
                }
            }

            const { data: medicaoAtualData } = await supabase
                .from("condominio_contas_gas_medicao")
                .select("unidade, leitura_anterior, leitura_atual")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            const [anoStr, mesStr] = competencia.split('-');
            let anoNum = parseInt(anoStr);
            let mesNum = parseInt(mesStr) - 1;
            if (mesNum === 0) {
                mesNum = 12;
                anoNum -= 1;
            }
            const competenciaAnterior = `${anoNum}-${String(mesNum).padStart(2, '0')}-01`;

            const { data: medicaoAnteriorData } = await supabase
                .from("condominio_contas_gas_medicao")
                .select("unidade, leitura_atual")
                .eq("condominio_id", condoId)
                .eq("data_competencia", competenciaAnterior);

            const mapaMedicao: Record<string, { anterior: string; atual: string }> = {};
            unicas.forEach(u => {
                const atualReg = (medicaoAtualData || []).find((m: any) => m.unidade === u);
                const anteriorRegDoMes = atualReg ? atualReg.leitura_anterior : null;
                const anteriorRegDoMesAnterior = (medicaoAnteriorData || []).find((m: any) => m.unidade === u)?.leitura_atual;

                const valAnt = anteriorRegDoMes !== null && anteriorRegDoMes !== undefined ? anteriorRegDoMes : (anteriorRegDoMesAnterior !== undefined ? anteriorRegDoMesAnterior : '');
                const valAtu = atualReg ? atualReg.leitura_atual : '';

                mapaMedicao[u] = {
                    anterior: formatarMedicaoGasExibicao(valAnt),
                    atual: formatarMedicaoGasExibicao(valAtu)
                };
            });
            setGasConsumoMap(mapaMedicao);

            const [anoSel, mesSel] = competencia.split('-').map(Number);
            const primeiroDia = `${competencia}-01`;
            const ultimoDiaObj = new Date(anoSel, mesSel, 0);
            const ultimoDia = `${competencia}-${String(ultimoDiaObj.getDate()).padStart(2, '0')}`;

            const { data: reservasData } = await supabase
                .from("condominio_reservas")
                .select("*")
                .eq("condominio_id", condoId)
                .gte("data_reserva", primeiroDia)
                .lte("data_reserva", ultimoDia)
                .eq("status", "ativa");

            const { data: cobrancasData } = await supabase
                .from("condominio_reservas_cobrancas")
                .select("*")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta);

            const cobrancasMap = new Map((cobrancasData || []).map((c: any) => [c.reserva_id, c]));

            const usosMapeados: SalaoUsoItem[] = (reservasData || []).map((r: any) => {
                const cobrancaReg = cobrancasMap.get(r.id);
                const statusCob = cobrancaReg ? cobrancaReg.status : null;
                let statusExibicao = 'Pendente';
                if (statusCob === 'cobrado') {
                    statusExibicao = 'Cobrança ativa';
                } else if (statusCob === 'cancelado' || statusCob === 'excluido') {
                    statusExibicao = 'Cobrança cancelada';
                }

                return {
                    id: r.id,
                    unidade: r.unidade || 'N/I',
                    taxa: 100.00,
                    responsavel_nome: r.responsavel_nome || 'Morador',
                    data_reserva: r.data_reserva,
                    status: r.status,
                    status_cobranca: statusExibicao
                };
            });
            setSalaoUsos(usosMapeados);

            const { data: fundoData } = await supabase
                .from("condominio_contas_fundo_de_reservas")
                .select("valor")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .limit(1);

            if (fundoData && fundoData.length > 0) {
                setValorFundoReserva(formatarValorExibicao(fundoData[0].valor));
            } else {
                const { data: ultimoFundo } = await supabase
                    .from("condominio_contas_fundo_de_reservas")
                    .select("valor")
                    .eq("condominio_id", condoId)
                    .lte("data_competencia", dataCompetenciaCompleta)
                    .order("data_competencia", { ascending: false })
                    .limit(1);

                if (ultimoFundo && ultimoFundo.length > 0) {
                    setValorFundoReserva(formatarValorExibicao(ultimoFundo[0].valor));
                } else {
                    setValorFundoReserva('0,00');
                }
            }

            const { data: sindicoPagamentoData } = await supabase
                .from("condominio_pagamento_sindico")
                .select("valor, quantidade_apartamentos")
                .eq("condominio_id", condoId)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            if (sindicoPagamentoData) {
                setValorRateioSindico(formatarValorExibicao(sindicoPagamentoData.valor));
                setQtdAptosRateioSindico(sindicoPagamentoData.quantidade_apartamentos ? String(sindicoPagamentoData.quantidade_apartamentos) : '');
            } else {
                setValorRateioSindico('0,00');
                setQtdAptosRateioSindico('');
            }
        } catch (err) {
            console.error("Erro em carregarDadosCompetencia:", err);
        }
    };

    const verifySindicoAndLoadData = async (currentSession: any) => {
        try {
            if (!currentSession || !currentSession.user) {
                if (isMountedRef.current) {
                    setSession(null);
                    setCondominio(null);
                    setIsApenasMorador(false);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) setSession(currentSession);
            const userId = currentSession.user.id;

            const { data: membroDataList, error: membroError } = await supabase
                .from("condominio_membros")
                .select("condominio_id, role, unidade, acesso_app, condominio_nome")
                .eq("user_id", userId);

            if (membroError && !membroError.message.includes("AbortError")) {
                console.error("Erro na consulta Supabase (membros):", membroError);
            }

            if (!membroDataList || membroDataList.length === 0) {
                if (isMountedRef.current) {
                    setIsApenasMorador(true);
                    setCondominio(null);
                    setLoading(false);
                }
                return;
            }

            const vinculoAdm = membroDataList.find((m: any) => m.role === 'sindico') || membroDataList[0];

            if (!vinculoAdm || vinculoAdm.role !== 'sindico') {
                if (isMountedRef.current) {
                    setIsApenasMorador(true);
                    setCondominio(null);
                    setLoading(false);
                }
                return;
            }

            let nomeCondominioOficial = vinculoAdm.condominio_nome || "Condomínio";
            if (vinculoAdm.condominio_id) {
                const { data: condoDataReal } = await supabase
                    .from("condominios")
                    .select("nome")
                    .eq("id", vinculoAdm.condominio_id)
                    .maybeSingle();
                if (condoDataReal && condoDataReal.nome) {
                    nomeCondominioOficial = condoDataReal.nome;
                }
            }

            if (isMountedRef.current) {
                setIsApenasMorador(false);
                setCondominio({ id: vinculoAdm.condominio_id, nome: nomeCondominioOficial });
                await carregarDadosCompetencia(vinculoAdm.condominio_id, competenciaSelecionada);
            }
        } catch (e: any) {
            console.warn("Exceção tratada em verifySindicoAndLoadData:", e);
            if (isMountedRef.current) setCondominio(null);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        let authSub: any = null;

        const initAuth = async () => {
            try {
                const timeoutId = setTimeout(() => {
                    if (isMountedRef.current && loading) setLoading(false);
                }, 5000);

                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                clearTimeout(timeoutId);

                if (sessionError && !currentSession) throw sessionError;

                if (isMountedRef.current) {
                    await verifySindicoAndLoadData(currentSession);
                }
            } catch (err: any) {
                console.error("Erro ao recuperar sessão inicial:", err);
                if (isMountedRef.current) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMountedRef.current) return;
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (currentSession) await verifySindicoAndLoadData(currentSession);
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setCondominio(null);
                setIsApenasMorador(false);
                setLoading(false);
            }
        });
        authSub = subscription;

        return () => {
            isMountedRef.current = false;
            if (authSub) authSub.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (condominio && condominio.id) {
            carregarDadosCompetencia(condominio.id, competenciaSelecionada);
        }
    }, [competenciaSelecionada]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setLoginError("");

        const inputAcesso = emailOrSlug.trim().toLowerCase();
        const isEmail = inputAcesso.includes("@");

        try {
            let emailParaLogin = "";
            if (isEmail) {
                emailParaLogin = inputAcesso;
            } else {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('email_contato')
                    .eq('slug', inputAcesso)
                    .maybeSingle();

                if (profileError) throw profileError;
                if (!profile || !profile.email_contato) {
                    setLoginError("ID de Síndico ou E-mail não localizado.");
                    setAuthLoading(false);
                    return;
                }
                emailParaLogin = profile.email_contato;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailParaLogin,
                password
            });

            if (error || !data.session) {
                setLoginError("Acesso negado. Credenciais incorretas.");
                setAuthLoading(false);
                return;
            }

            if (data.session) {
                window.dispatchEvent(new Event("storage"));
                await verifySindicoAndLoadData(data.session);
            }
        } catch (err) {
            setLoginError("Ocorreu um erro inesperado ao entrar.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: "https://nucleobase.app/reset-password",
        });

        if (error) alert("Erro: " + error.message);
        else {
            alert("Link de recuperação enviado com sucesso!");
            setShowForgotModal(false);
        }
        setResetLoading(false);
    };

    const handleFirstAccessSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setFirstAccessLoading(true);

        const inputSlug = firstAccessSlug.trim().toLowerCase();

        try {
            const { data: profileData, error: profileQueryError } = await supabase
                .from('profiles')
                .select('id, slug, email_contato')
                .ilike('slug', inputSlug)
                .maybeSingle();

            if (profileQueryError) throw profileQueryError;

            if (!profileData || !profileData.id) {
                alert("ID de Usuário (slug) não localizado no sistema. Verifique a chave informada.");
                setFirstAccessLoading(false);
                return;
            }

            alert(
                `Conta localizada com sucesso!\n\nPara acessar pela primeira vez, utilize o seu ID (${profileData.slug}) na tela de login e a senha temporária fornecida.\n\nApós entrar, recomendamos alterar sua senha nas configurações.`
            );

            setEmailOrSlug(profileData.slug);
            setShowFirstAccessModal(false);
            setFirstAccessSlug("");
        } catch (err: any) {
            console.error("Erro no primeiro acesso:", err);
            alert(err?.message || "Houve uma falha interna ao processar sua solicitação.");
        } finally {
            setFirstAccessLoading(false);
        }
    };

    const handleSaveContas = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominio || !session) return;

        setLoadingContas(true);
        setContasError("");
        setContasSuccess("");

        try {
            const previstoNum = converterParaFloat(valorPrevistoConta);
            const realizadoNum = converterParaFloat(valorRealizadoConta);

            const { error } = await supabase
                .from("condominio_contas")
                .insert([
                    {
                        condominio_id: condominio.id,
                        tipo: tipoConta,
                        categoria: categoriaConta.trim(),
                        descricao: descricaoConta.trim(),
                        valor_previsto: previstoNum,
                        valor_realizado: realizadoNum > 0 ? realizadoNum : previstoNum,
                        data_competencia: dataCompetenciaConta,
                        data_vencimento: null,
                        status: tipoConta === 'receita' ? 'recebido' : 'pago',
                        criado_por: session.user.id
                    }
                ]);

            if (error) throw error;

            setContasSuccess("Lançamento financeiro registrado com sucesso!");
            setValorPrevistoConta("0,00");
            setValorRealizadoConta("0,00");
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            setTimeout(() => setContasSuccess(""), 2000);
        } catch (err: any) {
            console.error("Erro ao salvar conta:", err);
            setContasError(err?.message || "Erro ao registrar lançamento financeiro.");
        } finally {
            setLoadingContas(false);
        }
    };

    const handleSalvarTarifaGas = async () => {
        if (!condominio || !session) return;
        setLoadingTarifaGas(true);
        setTarifaGasSuccess("");

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;
            const valorGasNum = converterParaFloat(valorMetroCubicoGas);

            const { data: tarifaExistente } = await supabase
                .from("condominio_contas_gas_metro_cubico")
                .select("id")
                .eq("condominio_id", condominio.id)
                .eq("data_competencia", dataCompetenciaCompleta)
                .maybeSingle();

            if (tarifaExistente) {
                const { error: updateErr } = await supabase
                    .from("condominio_contas_gas_metro_cubico")
                    .update({
                        valor_metro_cubico: valorGasNum,
                        atualizado_em: new Date().toISOString()
                    })
                    .eq("id", tarifaExistente.id);
                if (updateErr) throw updateErr;
            } else {
                const { error: insertErr } = await supabase
                    .from("condominio_contas_gas_metro_cubico")
                    .insert([{
                        condominio_id: condominio.id,
                        valor_metro_cubico: valorGasNum,
                        data_competencia: dataCompetenciaCompleta,
                        criado_por: session.user.id,
                        atualizado_em: new Date().toISOString()
                    }]);
                if (insertErr) throw insertErr;
            }

            setTarifaGasSuccess("Tarifa do gás salva com sucesso!");
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            setTimeout(() => setTarifaGasSuccess(""), 3000);
        } catch (err: any) {
            console.error("Erro ao salvar tarifa de gás:", err);
            alert("Erro ao salvar tarifa: " + (err?.message || JSON.stringify(err)));
        } finally {
            setLoadingTarifaGas(false);
        }
    };

    const handleSalvarMedicaoGas = async () => {
        if (!condominio || !session) return;
        setLoadingMedicaoGas(true);
        setMedicaoGasSuccess("");

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;

            const payloads = unidadesCondominio.map((unidade) => {
                const dadosUnidade = gasConsumoMap[unidade] || { anterior: '', atual: '' };
                const antNum = converterParaFloat(dadosUnidade.anterior);
                const atuNum = converterParaFloat(dadosUnidade.atual);
                const consumoCalc = Math.max(0, atuNum - antNum);

                return {
                    condominio_id: condominio.id,
                    unidade: unidade,
                    leitura_anterior: antNum,
                    leitura_atual: atuNum,
                    consumo_calculado: consumoCalc,
                    data_competencia: dataCompetenciaCompleta,
                    criado_por: session.user.id,
                    atualizado_em: new Date().toISOString()
                };
            });

            if (payloads.length > 0) {
                // CORREÇÃO CRÍTICA: o onConflict exige a lista de colunas, não o nome da constraint do Postgres
                const { error: upsertErr } = await supabase
                    .from("condominio_contas_gas_medicao")
                    .upsert(payloads, {
                        onConflict: 'condominio_id,unidade,data_competencia'
                    });

                if (upsertErr) throw upsertErr;
            }

            setMedicaoGasSuccess("Medições de gás salvas com sucesso!");
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            setTimeout(() => setMedicaoGasSuccess(""), 3000);
        } catch (err: any) {
            console.error("Erro ao salvar medição:", err);
            alert("Erro ao salvar medições: " + (err?.message || JSON.stringify(err)));
        } finally {
            setLoadingMedicaoGas(false);
        }
    };

    const handleSalvarFundoReserva = async () => {
        if (!condominio || !session) return;
        setLoadingFundo(true);
        setFundoReservaSuccess("");

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;
            const valorFundoNum = converterParaFloat(valorFundoReserva);

            for (const unidade of unidadesCondominio) {
                const { data: fundoExistente } = await supabase
                    .from("condominio_contas_fundo_de_reservas")
                    .select("id")
                    .eq("condominio_id", condominio.id)
                    .eq("unidade", unidade)
                    .eq("data_competencia", dataCompetenciaCompleta)
                    .maybeSingle();

                if (fundoExistente) {
                    const { error: funUpErr } = await supabase
                        .from("condominio_contas_fundo_de_reservas")
                        .update({
                            valor: valorFundoNum,
                            atualizado_em: new Date().toISOString()
                        })
                        .eq("id", fundoExistente.id);
                    if (funUpErr) throw funUpErr;
                } else {
                    const { error: funInsErr } = await supabase
                        .from("condominio_contas_fundo_de_reservas")
                        .insert([{
                            condominio_id: condominio.id,
                            unidade,
                            valor: valorFundoNum,
                            data_competencia: dataCompetenciaCompleta,
                            criado_por: session.user.id,
                            atualizado_em: new Date().toISOString()
                        }]);
                    if (funInsErr) throw funInsErr;
                }
            }

            setFundoReservaSuccess("Fundo de reservas salvo com sucesso para todas as unidades!");
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            setTimeout(() => setFundoReservaSuccess(""), 3000);
        } catch (err: any) {
            console.error("Erro ao salvar fundo de reserva:", err);
            alert("Erro ao salvar fundo de reservas: " + (err?.message || JSON.stringify(err)));
        } finally {
            setLoadingFundo(false);
        }
    };

    const handleSalvarRateioSindico = async () => {
        if (!condominio || !session) return;
        setLoadingRateioSindico(true);
        setRateioSindicoSuccess("");

        try {
            const valorNum = converterParaFloat(valorRateioSindico);
            const qtdNum = parseInt(qtdAptosRateioSindico) || 0;

            if (valorNum <= 0 || qtdNum <= 0) {
                alert("Informe um valor e a quantidade de apartamentos válidos para o rateio.");
                setLoadingRateioSindico(false);
                return;
            }

            const payload = {
                condominio_id: condominio.id,
                data_competencia: `${competenciaSelecionada}-01`,
                valor: valorNum,
                quantidade_apartamentos: qtdNum,
                criado_por: session.user.id,
                atualizado_em: new Date().toISOString()
            };

            const { error } = await supabase
                .from("condominio_pagamento_sindico")
                .upsert([payload], { onConflict: 'condominio_id,data_competencia' });

            if (error) {
                throw error;
            }

            setRateioSindicoSuccess("Rateio do Síndico salvo com sucesso!");
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            setTimeout(() => setRateioSindicoSuccess(""), 3000);
        } catch (err: any) {
            console.error("Erro ao salvar rateio síndico:", err);
            alert("Erro ao salvar rateio do síndico: " + (err?.message || JSON.stringify(err)));
        } finally {
            setLoadingRateioSindico(false);
        }
    };

    const handleCobrarReserva = async (reservaId: string, unidade: string, responsavel: string, taxa: number, dataReserva: string) => {
        if (!condominio || !session) return;
        if (!confirm(`Deseja registrar a cobrança da taxa do salão de festas (R$ ${taxa.toFixed(2).replace('.', ',')}) para a unidade ${unidade}?`)) return;

        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;
            const { error } = await supabase
                .from("condominio_reservas_cobrancas")
                .upsert([
                    {
                        condominio_id: condominio.id,
                        reserva_id: reservaId,
                        unidade: unidade,
                        responsavel_nome: responsavel,
                        taxa: taxa,
                        data_reserva: dataReserva,
                        data_competencia: dataCompetenciaCompleta,
                        status: 'cobrado',
                        criado_por: session.user.id,
                        atualizado_em: new Date().toISOString()
                    }
                ], { onConflict: 'reserva_id' });

            if (error) throw error;
            alert(`Cobrança de R$ ${taxa.toFixed(2).replace('.', ',')} gerada com sucesso na tabela de cobranças!`);
            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
        } catch (err: any) {
            alert("Erro ao gerar cobrança: " + (err?.message || JSON.stringify(err)));
        }
    };

    const handleRemoveReservaSalao = async (reservaId: string) => {
        if (!confirm("Deseja realmente excluir/cancelar o lançamento deste agendamento do salão de festas?")) return;
        try {
            const dataCompetenciaCompleta = `${competenciaSelecionada}-01`;

            const { error: cobrancaError } = await supabase
                .from("condominio_reservas_cobrancas")
                .update({
                    status: 'cancelado',
                    atualizado_em: new Date().toISOString()
                })
                .eq('reserva_id', reservaId);

            if (cobrancaError) throw cobrancaError;

            await carregarDadosCompetencia(condominio.id, competenciaSelecionada);
            alert("Lançamento atualizado com sucesso para 'Cobrança cancelada'!");
        } catch (err: any) {
            alert("Erro ao atualizar cobrança: " + err.message);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut({ scope: 'global' });
        } catch (e) {
            console.error("Erro ao deslogar no servidor:", e);
        }

        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('nucleo'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.error("Erro ao limpar storages locais:", e);
        }

        setSession(null);
        setCondominio(null);
        setIsApenasMorador(false);
        setLoading(false);
        window.dispatchEvent(new Event("storage"));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin text-emerald-600 mb-4">
                    <FileSpreadsheet size={32} />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Carregando prestação de contas...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em]">Área da Administração</span>
                        <h1 className="text-2xl font-black tracking-tight">Login do Síndico</h1>
                        <p className="text-xs text-zinc-500">Faça login com suas credenciais de síndico cadastradas.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail ou ID de Síndico</label>
                            <div className="relative group">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Exemplo: joao-sindico"
                                    required
                                    className="w-full pl-11 pr-5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-sm font-medium"
                                    value={emailOrSlug}
                                    onChange={(e) => setEmailOrSlug(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-sm font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 p-1 hover:text-zinc-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 mt-1 pr-1">
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-[10px] text-zinc-400 font-bold hover:text-emerald-600 transition-colors cursor-pointer"
                            >
                                Esqueceu a senha?
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowFirstAccessModal(true)}
                                className="text-[10px] text-emerald-600 font-black hover:text-emerald-700 transition-colors cursor-pointer"
                            >
                                Primeiro acesso com ID de usuário?
                            </button>
                        </div>

                        {loginError && (
                            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                                {loginError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full bg-zinc-900 text-white py-4 rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {authLoading ? "Acessando..." : "Entrar como Síndico"}
                        </button>
                    </form>
                </div>

                {showForgotModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowForgotModal(false)}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 mb-4">
                                    <LifeBuoy size={32} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Recuperar Acesso</h2>
                                <p className="text-gray-500 text-xs mb-6">
                                    Informe seu e-mail cadastrado para receber um link de redefinição de senha.
                                </p>

                                <form onSubmit={handleForgotPassword} className="w-full space-y-4">
                                    <div className="relative group text-left">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="seu@email.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                                        />
                                    </div>
                                    <button
                                        disabled={resetLoading}
                                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {resetLoading ? "Enviando..." : "Enviar Link de Acesso"}
                                        <ArrowRight size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {showFirstAccessModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowFirstAccessModal(false)}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 mb-4">
                                    <KeyRound size={32} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Primeiro Acesso</h2>
                                <p className="text-gray-500 text-xs mb-6">
                                    Insira a chave/slug gerada para validar seu cadastro e realizar o login com sua senha temporária.
                                </p>

                                <form onSubmit={handleFirstAccessSetup} className="w-full space-y-3">
                                    <div className="relative group text-left">
                                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: condo-joao-xyz"
                                            value={firstAccessSlug}
                                            onChange={(e) => setFirstAccessSlug(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none text-xs font-mono font-bold text-gray-700 uppercase"
                                        />
                                    </div>

                                    <button
                                        disabled={firstAccessLoading}
                                        className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2 uppercase tracking-widest text-[10px] cursor-pointer"
                                    >
                                        {firstAccessLoading ? "Verificando Chave..." : "Validar e Acessar"}
                                        <ArrowRight size={14} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (session && isApenasMorador) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Lock size={30} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-black tracking-tight">Área Restrita</h1>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                            Olá! O seu perfil possui acesso restrito. Esta página de administração é destinada apenas aos gestores com perfil de síndico autorizado.
                        </p>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-zinc-900/10 cursor-pointer hidden md:flex"
                        >
                            <ArrowLeft size={14} /> Voltar à página anterior
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                            Entrar com outra conta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-4 md:p-10 flex flex-col justify-between">
            <div className="space-y-8">
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 w-full justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-auto h-auto bg-emerald-600 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0 self-stretch">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                        Prestação de Contas
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-0.5">
                                        <span className="md:hidden text-black">{formatarNomePrimeiroEUltimo(condominio?.nome || "")}</span>
                                        <span className="hidden md:inline">{condominio?.nome}</span>
                                    </h1>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-3">
                                <Link
                                    href="/condo/adm"
                                    className="group relative flex items-center justify-center gap-1.5 h-8 pl-3 pr-4 bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-95 overflow-hidden shrink-0 cursor-pointer"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-600 to-teal-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10" />
                                    <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform duration-300 ease-out" />
                                    <span>Voltar</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* CONTROLE DE CONTAS */}
                    <div className="pt-2 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 mb-1">
                                Controle de Contas
                            </h2>
                            <p className="text-xs md:text-sm text-zinc-500 font-medium">
                                Registre lançamentos financeiros de receitas e despesas para a prestação de contas do condomínio.
                            </p>
                        </div>
                    </div>

                    <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
                        <form onSubmit={handleSaveContas} className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleTipoContaChange('receita')}
                                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${tipoConta === 'receita' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}
                                >
                                    Receita
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTipoContaChange('despesa')}
                                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${tipoConta === 'despesa' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}
                                >
                                    Despesa
                                </button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Categoria</label>
                                <input
                                    type="text"
                                    required
                                    value={categoriaConta}
                                    onChange={(e) => setCategoriaConta(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Descrição</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Pagamento Condomínio"
                                    required
                                    value={descricaoConta}
                                    onChange={(e) => setDescricaoConta(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Planejado (R$)</label>
                                    <input
                                        type="text"
                                        placeholder="0,00"
                                        required
                                        value={valorPrevistoConta}
                                        onChange={(e) => setValorPrevistoConta(e.target.value)}
                                        onBlur={(e) => setValorPrevistoConta(formatarValorExibicao(e.target.value))}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Realizado (R$)</label>
                                    <input
                                        type="text"
                                        placeholder="0,00"
                                        required
                                        value={valorRealizadoConta}
                                        onChange={(e) => setValorRealizadoConta(e.target.value)}
                                        onBlur={(e) => setValorRealizadoConta(formatarValorExibicao(e.target.value))}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Mês de Competência</label>
                                <input
                                    type="date"
                                    required
                                    value={dataCompetenciaConta}
                                    onChange={(e) => setDataCompetenciaConta(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-xs font-medium text-zinc-900"
                                />
                            </div>

                            {contasError && <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{contasError}</p>}
                            {contasSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2"><CheckCircle2 size={14} /> {contasSuccess}</p>}

                            <div className="pt-2 flex flex-col gap-2">
                                <button
                                    type="submit"
                                    disabled={loadingContas}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loadingContas ? "Registrando..." : "Salvar Lançamento"}
                                </button>

                                <Link
                                    href="/condo/adm/edicao_lancamentos"
                                    className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-zinc-900/10 flex items-center justify-center gap-2 cursor-pointer text-center"
                                >
                                    <Edit3 size={14} /> Editar lançamentos
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <hr className="border-zinc-200 my-8" />

                {/* CONTROLES DE CONSUMO DE GÁS */}
                <div className="pt-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 mb-1">
                                Controles de Consumo
                            </h2>
                            <p className="text-xs md:text-sm text-zinc-500 font-medium">
                                Gerenciamento de consumo de gás para o período de {competenciaSelecionada}.
                            </p>
                        </div>

                        {/* Filtro do Mês/Ano */}
                        <div className="bg-white border border-zinc-200 p-3 rounded-2xl flex items-center gap-3 shadow-sm shrink-0">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Mês / Ano de Referência</label>
                                <input
                                    type="month"
                                    value={competenciaSelecionada}
                                    onChange={(e) => setCompetenciaSelecionada(e.target.value)}
                                    className="text-xs font-bold text-zinc-900 bg-transparent outline-none cursor-pointer mt-0.5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="bg-amber-50/60 border border-amber-200/70 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-500 text-white p-2.5 rounded-xl">
                                        <Flame size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">Tarifa do Gás (Metro Cúbico) - {competenciaSelecionada}</h3>
                                        <p className="text-xs text-amber-700">Valor unitário aplicado no cálculo de consumo para este mês.</p>
                                    </div>
                                </div>
                                <div className="w-full sm:w-48 shrink-0">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                                        <input
                                            type="text"
                                            placeholder="0,00"
                                            value={valorMetroCubicoGas}
                                            onChange={(e) => setValorMetroCubicoGas(e.target.value)}
                                            onBlur={(e) => setValorMetroCubicoGas(formatarValorExibicao(e.target.value))}
                                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-amber-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {tarifaGasSuccess && (
                                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                                    <CheckCircle2 size={14} /> {tarifaGasSuccess}
                                </p>
                            )}

                            <div>
                                <button
                                    type="button"
                                    onClick={handleSalvarTarifaGas}
                                    disabled={loadingTarifaGas}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-amber-600/10 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loadingTarifaGas ? "Salvando Tarifa..." : "Salvar Tarifa do Gás"}
                                </button>
                            </div>
                        </div>

                        <hr className="border-zinc-100 my-4" />

                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                                Medição de Gás por Apartamento (Antes x Depois)
                            </h3>
                            <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                            <th className="p-3.5 pl-5">Mês / Ano</th>
                                            <th className="p-3.5">Unidade / Apartamento</th>
                                            <th className="p-3.5">Leitura Mês Passado (Antes)</th>
                                            <th className="p-3.5">Leitura Mês Atual (Depois)</th>
                                            <th className="p-3.5 pr-5 text-right">Consumo Calculado (m³)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {unidadesCondominio.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-xs text-zinc-400">
                                                    Nenhuma unidade cadastrada neste condomínio.
                                                </td>
                                            </tr>
                                        ) : (
                                            unidadesCondominio.map((unidade) => {
                                                const ant = converterParaFloat(gasConsumoMap[unidade]?.anterior);
                                                const atu = converterParaFloat(gasConsumoMap[unidade]?.atual);
                                                const consumo = Math.max(0, atu - ant);
                                                const tarifaVal = converterParaFloat(valorMetroCubicoGas);
                                                const valorTotalGas = consumo * tarifaVal;

                                                return (
                                                    <tr key={unidade} className="hover:bg-zinc-50/50 transition-colors">
                                                        <td className="p-3.5 pl-5 text-xs font-bold text-emerald-600 font-mono">
                                                            {competenciaSelecionada}
                                                        </td>
                                                        <td className="p-3.5 text-xs font-bold text-zinc-800">
                                                            Apto {unidade}
                                                        </td>
                                                        <td className="p-3.5">
                                                            <input
                                                                type="text"
                                                                placeholder="0,000"
                                                                value={gasConsumoMap[unidade]?.anterior || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setGasConsumoMap(prev => ({
                                                                        ...prev,
                                                                        [unidade]: { ...(prev[unidade] || { atual: '' }), anterior: val }
                                                                    }));
                                                                }}
                                                                onBlur={() => {
                                                                    setGasConsumoMap(prev => ({
                                                                        ...prev,
                                                                        [unidade]: {
                                                                            ...(prev[unidade] || { atual: '' }),
                                                                            anterior: formatarMedicaoGasExibicao(prev[unidade]?.anterior)
                                                                        }
                                                                    }));
                                                                }}
                                                                className="w-full max-w-[140px] px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-emerald-400"
                                                            />
                                                        </td>
                                                        <td className="p-3.5">
                                                            <input
                                                                type="text"
                                                                placeholder="0,000"
                                                                value={gasConsumoMap[unidade]?.atual || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setGasConsumoMap(prev => ({
                                                                        ...prev,
                                                                        [unidade]: { ...(prev[unidade] || { anterior: '' }), atual: val }
                                                                    }));
                                                                }}
                                                                onBlur={() => {
                                                                    setGasConsumoMap(prev => ({
                                                                        ...prev,
                                                                        [unidade]: {
                                                                            ...(prev[unidade] || { anterior: '' }),
                                                                            atual: formatarMedicaoGasExibicao(prev[unidade]?.atual)
                                                                        }
                                                                    }));
                                                                }}
                                                                className="w-full max-w-[140px] px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-emerald-400"
                                                            />
                                                        </td>
                                                        <td className="p-3.5 pr-5 text-right text-xs font-black text-emerald-600">
                                                            {consumo.toFixed(3).replace('.', ',')} m³ <span className="text-[10px] text-zinc-400 font-normal">({valorTotalGas > 0 ? `R$ ${valorTotalGas.toFixed(2).replace('.', ',')}` : 'R$ 0,00'})</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {medicaoGasSuccess && (
                            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={14} /> {medicaoGasSuccess}
                            </p>
                        )}

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleSalvarMedicaoGas}
                                disabled={loadingMedicaoGas}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loadingMedicaoGas ? "Salvando Medições..." : "Salvar Medições de Gás"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* FUNDO DE RESERVAS */}
                <div className="pt-6">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 mb-1">
                        Fundo de reservas
                    </h2>
                    <p className="text-xs md:text-sm text-zinc-500 font-medium mb-6">
                        Controle e aplicação da taxa de fundo de reservas e fundo de obras para o período de {competenciaSelecionada}.
                    </p>

                    <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="bg-emerald-50/60 border border-emerald-200/70 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-600 text-white p-2.5 rounded-xl">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">Valor Aplicável por Unidade ({competenciaSelecionada})</h3>
                                    <p className="text-xs text-emerald-700">Valor padrão herdado do último mês informado ou ajustável para este mês.</p>
                                </div>
                            </div>
                            <div className="w-full sm:w-48 shrink-0">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                                    <input
                                        type="text"
                                        placeholder="100,00"
                                        value={valorFundoReserva}
                                        onChange={(e) => setValorFundoReserva(e.target.value)}
                                        onBlur={(e) => setValorFundoReserva(formatarValorExibicao(e.target.value))}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                                Unidades Aplicadas (Fundo de Reservas)
                            </h3>
                            <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                            <th className="p-3.5 pl-5">Mês / Ano</th>
                                            <th className="p-3.5">Unidade / Apartamento</th>
                                            <th className="p-3.5">Status da Taxa</th>
                                            <th className="p-3.5 pr-5 text-right">Valor Definido</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {unidadesCondominio.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-8 text-xs text-zinc-400">
                                                    Nenhuma unidade cadastrada neste condomínio.
                                                </td>
                                            </tr>
                                        ) : (
                                            unidadesCondominio.map((unidade) => {
                                                const valorNumerico = converterParaFloat(valorFundoReserva);
                                                return (
                                                    <tr key={unidade} className="hover:bg-zinc-50/50 transition-colors">
                                                        <td className="p-3.5 pl-5 text-xs font-bold text-emerald-600 font-mono">
                                                            {competenciaSelecionada}
                                                        </td>
                                                        <td className="p-3.5 text-xs font-bold text-zinc-800">
                                                            Apto {unidade}
                                                        </td>
                                                        <td className="p-3.5 text-xs font-medium text-emerald-600 flex items-center gap-1">
                                                            <CheckCircle2 size={14} /> Aplicável (Fixo)
                                                        </td>
                                                        <td className="p-3.5 pr-5 text-right text-xs font-black text-zinc-900">
                                                            R$ {valorNumerico.toFixed(2).replace('.', ',')}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {fundoReservaSuccess && (
                            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={14} /> {fundoReservaSuccess}
                            </p>
                        )}

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleSalvarFundoReserva}
                                disabled={loadingFundo}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loadingFundo ? "Salvando Fundo..." : "Salvar Fundo de Reservas"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* SALÃO DE FESTAS */}
                <div className="pt-6">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 mb-1">
                        Salão de festas
                    </h2>
                    <p className="text-xs md:text-sm text-zinc-500 font-medium mb-6">
                        Controle de locações, agendamentos e geração de cobranças para o período de {competenciaSelecionada}.
                    </p>

                    <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                                        Agendamentos Ativos ({competenciaSelecionada})
                                    </h3>
                                    <p className="text-[11px] text-zinc-500">Agendamentos obtidos da tabela de reservas do condomínio.</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                            <th className="p-3.5 pl-5">Data / Unidade</th>
                                            <th className="p-3.5">Responsável</th>
                                            <th className="p-3.5">Taxa de Locação</th>
                                            <th className="p-3.5">Status Cobrança</th>
                                            <th className="p-3.5 pr-5 text-right">Ações (Deletar / Cobrar)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {salaoUsos.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-xs text-zinc-400">
                                                    Nenhum agendamento de salão de festas encontrado para este mês.
                                                </td>
                                            </tr>
                                        ) : (
                                            salaoUsos.map((item) => {
                                                const isAtivo = item.status_cobranca === 'Cobrança ativa';
                                                const isCancelado = item.status_cobranca === 'Cobrança cancelada';
                                                return (
                                                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                                                        <td className="p-3.5 pl-5 text-xs font-bold text-zinc-800 flex items-center gap-2">
                                                            <PartyPopper size={16} className="text-purple-600" />
                                                            <div>
                                                                <div>Apto {item.unidade}</div>
                                                                <div className="text-[10px] text-zinc-400 font-normal">{item.data_reserva}</div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3.5 text-xs font-medium text-zinc-700">
                                                            {item.responsavel_nome}
                                                        </td>
                                                        <td className="p-3.5 text-xs font-bold text-zinc-700">
                                                            R$ {item.taxa.toFixed(2).replace('.', ',')}
                                                        </td>
                                                        <td className="p-3.5 text-xs font-bold">
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isAtivo ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : isCancelado ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                                                                {item.status_cobranca}
                                                            </span>
                                                        </td>
                                                        <td className="p-3.5 pr-5 text-right space-x-2">
                                                            {(!isAtivo || isCancelado) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCobrarReserva(item.id, item.unidade, item.responsavel_nome, item.taxa, item.data_reserva)}
                                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1 cursor-pointer shadow-sm"
                                                                    title="Cobrar (Gerar Lançamento)"
                                                                >
                                                                    <DollarSign size={13} /> Cobrar
                                                                </button>
                                                            )}

                                                            {isAtivo && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveReservaSalao(item.id)}
                                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition-colors cursor-pointer inline-flex items-center"
                                                                    title="Excluir Lançamento"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RATEIO SÍNDICO */}
                <div className="pt-6">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 mb-1">
                        Rateio Síndico
                    </h2>
                    <p className="text-xs md:text-sm text-zinc-500 font-medium mb-6">
                        Custo de isenção da Taxa Base do Síndico que é pago pelos demais moradores (aprovação em assembleia) para o período de {competenciaSelecionada}.
                    </p>

                    <div className="w-full bg-white border border-zinc-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Valor a ser aplicado na cobrança (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                                    <input
                                        type="text"
                                        placeholder="0,00"
                                        value={valorRateioSindico}
                                        onChange={(e) => setValorRateioSindico(e.target.value)}
                                        onBlur={(e) => setValorRateioSindico(formatarValorExibicao(e.target.value))}
                                        className="w-full pl-9 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:border-emerald-400 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Quantidade de apartamentos a ratear</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input
                                        type="number"
                                        placeholder="Ex: 10"
                                        value={qtdAptosRateioSindico}
                                        onChange={(e) => setQtdAptosRateioSindico(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:border-emerald-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {rateioSindicoSuccess && (
                            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={14} /> {rateioSindicoSuccess}
                            </p>
                        )}

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleSalvarRateioSindico}
                                disabled={loadingRateioSindico}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loadingRateioSindico ? "Salvando Rateio..." : "Salvar Lançamento"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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