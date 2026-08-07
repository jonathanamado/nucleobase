// app/condo/adm/components/ModalRecuperacaoESeguranca.tsx
import React from "react";
import { X, LifeBuoy, KeyRound, ArrowRight, UserCheck, Mail } from "lucide-react";

export function ModalEsqueceuSenha({
    isOpen,
    onClose,
    onSubmit,
    resetEmail,
    setResetEmail,
    resetLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    resetEmail: string;
    setResetEmail: (v: string) => void;
    resetLoading: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 mb-4">
                        <LifeBuoy size={32} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Recuperar Acesso</h2>
                    <p className="text-gray-500 text-xs mb-6">Informe seu e-mail cadastrado para receber um link de redefinição de senha.</p>

                    <form onSubmit={onSubmit} className="w-full space-y-4">
                        <div className="relative group text-left">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="email"
                                required
                                placeholder="seu@email.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                            />
                        </div>
                        <button
                            disabled={resetLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {resetLoading ? "Enviando..." : "Enviar Link de Acesso"}
                            <ArrowRight size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export function ModalPrimeiroAcesso({
    isOpen,
    onClose,
    onSubmit,
    firstAccessSlug,
    setFirstAccessSlug,
    firstAccessLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    firstAccessSlug: string;
    setFirstAccessSlug: (v: string) => void;
    firstAccessLoading: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 mb-4">
                        <KeyRound size={32} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Primeiro Acesso</h2>
                    <p className="text-gray-500 text-xs mb-6">Insira a chave/slug gerada para validar seu cadastro e realizar o login com sua senha temporária.</p>

                    <form onSubmit={onSubmit} className="w-full space-y-3">
                        <div className="relative group text-left">
                            <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                required
                                placeholder="Ex: condo-joao-xyz"
                                value={firstAccessSlug}
                                onChange={(e) => setFirstAccessSlug(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-xs font-mono font-bold text-gray-700 uppercase"
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
    );
}