import { Header } from "@/components/Header";
import { CheckCircle } from "lucide-react";

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md border border-gray-100 flex flex-col items-center">
          <div className="bg-green-100 p-4 rounded-full text-green-600 mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mensagem Enviada!</h1>
          <p className="text-gray-600 mb-8">
            Obrigado! Recebemos sua mensagem e retornaremos em breve.
          </p>
          <a 
            href="/" 
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
          >
            Voltar para o Início
          </a>
        </div>
      </main>
    </div>
  );
}
