"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, ShieldCheck, CreditCard, 
  Lock, CheckCircle2, Loader2 
} from "lucide-react";

// 1. Criamos um componente interno que contém a lógica do checkout
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planSlug = searchParams.get("plan");
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cpf, setCpf] = useState("");

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .substring(0, 14);
    setCpf(formattedValue);
  };

  useEffect(() => {
    async function fetchPlan() {
      if (!planSlug) {
        router.push("/assinatura");
        return;
      }

      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("slug", planSlug)
        .single();

      if (error || !data) {
        console.error("Plano não encontrado");
        router.push("/assinatura");
      } else {
        setPlan(data);
      }
      setLoading(false);
    }

    fetchPlan();
  }, [planSlug, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Carregando detalhes da assinatura...</p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-in fade-in duration-700">
      <Link href="/assinatura" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest">Alterar Plano</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h1>
          <p className="text-gray-500 mb-10">Preencha os dados abaixo para processar seu acesso.</p>

          <section className="space-y-8">
            <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">1</span>
                Dados de Faturamento
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">CPF para Nota Fiscal</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-dashed border-gray-300 p-8 rounded-[2rem] opacity-60">
              <h3 className="font-bold text-gray-400 mb-6 flex items-center gap-2">
                <CreditCard size={20} />
                Método de Pagamento
              </h3>
              <p className="text-sm text-gray-400 italic">Integração com gateway de pagamento disponível em breve.</p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-gray-900 rounded-[3rem] p-8 text-white sticky top-10">
            <h3 className="text-xl font-bold mb-8 border-b border-white/10 pb-4">Resumo do Pedido</h3>
            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Plano Selecionado</p>
                  <p className="text-xl font-bold">{plan.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">R$ {plan.price.toFixed(2).replace('.', ',')}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold italic">
                    {plan.interval === 'annual' ? 'Cobrança Anual' : 'Cobrança Mensal'}
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {plan.features?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-gray-400">
                    <CheckCircle2 size={16} className="text-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Subtotal</span>
                <span className="text-sm font-bold">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span className="text-sm">Desconto aplicado</span>
                <span className="text-sm font-bold">- R$ 0,00</span>
              </div>
              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold">Total hoje</span>
                <span className="text-2xl font-black text-blue-500">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button disabled className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/40 opacity-50 cursor-not-allowed mb-6">
              Confirmar e Pagar
            </button>

            <div className="flex items-center justify-center gap-4 text-gray-500">
              <div className="flex items-center gap-1"><Lock size={12} /><span className="text-[9px] font-bold uppercase tracking-widest">Ambiente Seguro</span></div>
              <div className="flex items-center gap-1"><ShieldCheck size={12} /><span className="text-[9px] font-bold uppercase tracking-widest">Privacidade Garantida</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. O export default envolve o conteúdo com Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}