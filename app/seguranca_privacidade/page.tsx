import { Header } from "@/components/Header";

export default function PaginaInterna() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-20 px-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Página em Construção 🚀
        </h1>
        <p className="text-lg text-gray-600">
          Estamos preparando novidades incríveis para esta seção.
        </p>
        <a href="/" className="mt-8 inline-block text-blue-600 hover:underline">
          ← Voltar para o Início
        </a>
      </main>
    </div>
  );
}
