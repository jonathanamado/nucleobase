"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

// Lista de páginas do seu site para o motor de busca interno
const siteMap = [
  { term: "cadastro", title: "Criar Nova Conta", desc: "Comece a gerenciar suas finanças agora.", href: "/cadastro" },
  { term: "login", title: "Acessar Plataforma", desc: "Entre na sua conta Nucleobase.", href: "/acesso-usuario" },
  { term: "planos", title: "Planos e Assinaturas", desc: "Conheça os planos Essential e Pro.", href: "/planos" },
  { term: "segurança", title: "Central de Segurança", desc: "Saiba como protegemos seus dados.", href: "/seguranca_privacidade" },
  { term: "contato", title: "Fale Conosco", desc: "Suporte via WhatsApp e E-mail.", href: "https://wa.link/qbxg9f" },
  { term: "lançamentos", title: "Novidades e Lançamentos", desc: "Acompanhe as atualizações da plataforma.", href: "/lancamentos" },
];

export default function BuscaPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  // Filtra os resultados com base no que foi digitado
  const results = siteMap.filter(
    (item) => 
      item.term.includes(query) || 
      item.title.toLowerCase().includes(query)
  );

  return (
    <div className="max-w-2xl mx-auto pt-10 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
          <Search size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resultados para:</h1>
          <p className="text-gray-500">"{query}"</p>
        </div>
      </div>

      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((result, index) => (
            <Link 
              key={index} 
              href={result.href}
              className="block bg-white p-6 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{result.desc}</p>
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Nenhum resultado encontrado para essa busca.</p>
            <Link href="/" className="text-blue-600 text-sm font-bold mt-4 inline-block uppercase tracking-widest">
              Voltar ao início
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}