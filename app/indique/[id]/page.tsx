"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PaginaCapturaIndicacao() {
  const router = useRouter();
  const params = useParams();
  const [erro, setErro] = useState(false);

  // Captura o parâmetro da URL (slug ou id)
  const identificador = typeof params.slug === 'string' ? params.slug : typeof params.id === 'string' ? params.id : "";

  useEffect(() => {
    async function processarIndicacao() {
      if (!identificador || identificador === "faca-login") {
        router.push("/cadastro");
        return;
      }

      try {
        // BUSCA NO BANCO: Quem é o dono desse slug? 
        // Usando maybeSingle() para evitar erro 406
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('slug', identificador)
          .maybeSingle();

        if (profile?.id) {
          // Achou pelo SLUG, salva o ID real
          localStorage.setItem("nucleobase_referral_id", profile.id);
        } else {
          // Se não achou por slug, tenta ver se é um ID antigo
          // Primeiro verifica se tem formato de UUID para evitar o erro 400
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identificador);

          if (isUuid) {
            const { data: profileById } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', identificador)
              .maybeSingle();

            if (profileById) {
              localStorage.setItem("nucleobase_referral_id", profileById.id);
            }
          }
        }

        // Redireciona para o cadastro
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