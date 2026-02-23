"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Verifique se o caminho da sua importação está correto

export default function PaginaCapturaIndicacao() {
  const router = useRouter();
  const params = useParams();
  const [erro, setErro] = useState(false);
  
  // Captura o parâmetro da URL (pode vir como id ou slug dependendo do nome da pasta)
  const identificador = params.slug || params.id;

  useEffect(() => {
    async function processarIndicacao() {
      if (!identificador || identificador === "faca-login") {
        router.push("/cadastro");
        return;
      }

      try {
        // BUSCA NO BANCO: Quem é o dono desse slug?
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('slug', identificador)
          .single();

        if (profile?.id) {
          // Se achou pelo SLUG (novo formato), salva o ID real do banco
          localStorage.setItem("nucleobase_referral_id", profile.id);
        } else {
          // Se não achou por slug, tenta ver se é um ID antigo (UUID) para não quebrar links velhos
          const { data: profileById } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', identificador)
            .single();
          
          if (profileById) {
            localStorage.setItem("nucleobase_referral_id", profileById.id);
          }
        }

        // Redireciona após o processamento
        setTimeout(() => {
          router.push("/cadastro");
        }, 1200);

      } catch (err) {
        console.error("Erro ao processar indicação:", err);
        setErro(true);
        setTimeout(() => router.push("/cadastro"), 2000);
      }
    }

    processarIndicacao();
  }, [identificador, router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-6">
      <div className="relative">
        <div className="absolute -inset-4 bg-blue-100/50 rounded-full blur-xl animate-pulse"></div>
        {erro ? (
          <AlertCircle className="text-orange-500 relative z-10" size={48} />
        ) : (
          <Loader2 className="animate-spin text-blue-600 relative z-10" size={48} />
        )}
      </div>
      
      <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
          <Sparkles size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            {erro ? "Convite não localizado" : "Convite Identificado"}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {erro ? "Redirecionando..." : "Preparando seu acesso..."}
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-xs">
          {erro 
            ? "Não conseguimos validar o código, mas você pode criar sua conta normalmente."
            : "Estamos configurando os benefícios do seu convite exclusivo para a Nucleobase."
          }
        </p>
      </div>
    </div>
  );
}