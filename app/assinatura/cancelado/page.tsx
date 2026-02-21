export default function CanceladoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-red-600">Pagamento Cancelado</h1>
      <p className="text-gray-600 mt-2">Ops! Parece que você desistiu da assinatura.</p>
      <a href="/planos" className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg">Voltar aos Planos</a>
    </div>
  );
}