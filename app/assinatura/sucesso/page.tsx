export default function SucessoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-emerald-600">Pagamento Confirmado!</h1>
      <p className="text-gray-600 mt-2">Obrigado por assinar o Plano Essencial.</p>
      <a href="/acesso-usuario" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg">Ir para a Página do Usuário</a>
    </div>
  );
}