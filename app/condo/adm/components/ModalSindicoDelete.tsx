// app/condo/adm/components/ModalSindicoDelete.tsx
import React from "react";
import { X, ShieldAlert, MessageCircle } from "lucide-react";

interface ModalSindicoDeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ModalSindicoDelete({ isOpen, onClose, onConfirm }: ModalSindicoDeleteProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 mb-4">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-base text-zinc-900">Ação Protegida</h2>
                        <p className="text-[11px] text-zinc-500">Exclusão de Conta Principal (Síndico)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-xs text-zinc-600 leading-relaxed">
                        Para evitar erros operacionais críticos, a própria conta de <strong>síndico</strong> não pode ser excluída diretamente por esta tela.
                    </p>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                        Ao confirmar, você será direcionado ao WhatsApp da central da Nucleo para solicitar o suporte necessário com a equipe técnica.
                    </p>

                    <button
                        onClick={onConfirm}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                        <MessageCircle size={15} /> Falar com a Central Nucleo (WhatsApp)
                    </button>
                </div>
            </div>
        </div>
    );
}