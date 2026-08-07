// app/condo/adm/components/ModalEdicaoMorador.tsx
import React from "react";
import { X, Pencil, CheckCircle2, KeyRound } from "lucide-react";

interface ModalEdicaoMoradorProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editandoId: string | null;
    novoMoradorNome: string;
    setNovoMoradorNome: (val: string) => void;
    novoMoradorEmail: string;
    setNovoMoradorEmail: (val: string) => void;
    editandoSemEmail: boolean;
    novoMoradorUnidade: string;
    setNovoMoradorUnidade: (val: string) => void;
    autorizadoApp: boolean;
    setAutorizadoApp: (val: boolean) => void;
    actionLoading: boolean;
    formError: string;
    formSuccess: string;
    handleResetPasswordByAdmin: () => void;
    resetPasswordError: string;
    resetPasswordSuccess: string;
}

export function ModalEdicaoMorador({
    isOpen,
    onClose,
    onSubmit,
    editandoId,
    novoMoradorNome,
    setNovoMoradorNome,
    novoMoradorEmail,
    setNovoMoradorEmail,
    editandoSemEmail,
    novoMoradorUnidade,
    setNovoMoradorUnidade,
    autorizadoApp,
    setAutorizadoApp,
    actionLoading,
    formError,
    formSuccess,
    handleResetPasswordByAdmin,
    resetPasswordError,
    resetPasswordSuccess,
}: ModalEdicaoMoradorProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 my-auto">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                    <Pencil className="text-indigo-600" size={20} />
                    <h2 className="font-bold text-base">Editar Morador</h2>
                </div>

                <form onSubmit={onSubmit} className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Nome Completo</label>
                        <input
                            type="text"
                            placeholder="Ex: João da Silva"
                            required
                            value={novoMoradorNome}
                            onChange={(e) => setNovoMoradorNome(e.target.value)}
                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                            E-mail Login {editandoSemEmail ? "(Bloqueado)" : "(Opcional)"}
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: john@dominio.com"
                            value={novoMoradorEmail}
                            disabled={editandoSemEmail}
                            onChange={(e) => setNovoMoradorEmail(e.target.value)}
                            className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all text-xs font-medium ${editandoSemEmail
                                    ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed select-none'
                                    : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-blue-400'
                                }`}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Unidade</label>
                        <input
                            type="text"
                            placeholder="Ex: Apto 102"
                            required
                            value={novoMoradorUnidade}
                            onChange={(e) => setNovoMoradorUnidade(e.target.value)}
                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 transition-all text-xs font-medium"
                        />
                    </div>

                    <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-3 rounded-xl">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Acesso APP</span>
                            <span className="text-[10px] text-zinc-400 font-medium">Permissão digital do perfil</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAutorizadoApp(!autorizadoApp)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 outline-none cursor-pointer ${autorizadoApp ? 'bg-blue-600 justify-end' : 'bg-zinc-300 justify-start'
                                }`}
                        >
                            <div className="bg-white w-4 h-4 rounded-full shadow-md transition-all"></div>
                        </button>
                    </div>

                    {formError && <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-xl">{formError}</p>}
                    {formSuccess && (
                        <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2">
                            <CheckCircle2 size={14} /> {formSuccess}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 text-white cursor-pointer bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10"
                    >
                        {actionLoading ? "Processando..." : "Salvar Alterações"}
                    </button>

                    {editandoId && (
                        <div className="pt-2 border-t border-zinc-100 space-y-2">
                            <button
                                type="button"
                                onClick={handleResetPasswordByAdmin}
                                disabled={actionLoading}
                                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                                <KeyRound size={14} /> Solicitar redefinição de senha (WhatsApp)
                            </button>
                            {resetPasswordError && <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 p-2 rounded-xl text-center">{resetPasswordError}</p>}
                            {resetPasswordSuccess && (
                                <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-xl flex items-center justify-center gap-1.5">
                                    <CheckCircle2 size={14} /> {resetPasswordSuccess}
                                </p>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}