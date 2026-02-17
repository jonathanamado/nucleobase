"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

export default function PaginaCapturaIndicacao() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id && id !== "faca-login") {
      // Salva o ID do indicador para ser resgatado no momento do cadastro real
      localStorage.setItem("nucleobase_referral_id", id as string);
      
      const timer = setTimeout(() => {
        router.push("/cadastro");
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      router.push("/cadastro");
    }
  }, [id, router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-6">
      <div className="relative">
        <div className="absolute -inset-4 bg-blue-100/50 rounded-full blur-xl animate-pulse"></div>
        <Loader2 className="animate-spin text-blue-600 relative z-10" size={48} />
      </div>
      
      <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
          <Sparkles size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Convite Identificado</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Preparando seu acesso...</h2>
        <p className="text-gray-400 text-sm mt-2 max-w-xs">
          Estamos configurando os benefícios do seu convite exclusivo para a Nucleobase.
        </p>
      </div>
    </div>
  );
}