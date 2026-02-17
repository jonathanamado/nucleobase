// app/privacidade/page.tsx

export default function PrivacidadeSeguranca() {
  return (
    <div className="w-full">
      {/* TÍTULO: Padrão visual Nucleobase */}
      <h1 className="text-5xl font-bold text-gray-900 mb-2 mt-2 tracking-tight">
        Segurança e Privacidade<span className="text-blue-600">.</span> 🛡️
      </h1>
      
      {/* SUBTÍTULO */}
      <h2 className="text-gray-500 text-lg mb-8 font-bold">
        Sua tranquilidade é o nosso principal ativo.
      </h2>

      {/* CONTEÚDO */}
      <div className="text-gray-700 text-lg leading-[2.1] max-w-3xl">
        <p className="mb-6">
          A segurança no <strong>App da Núcleo</strong> é tratada como prioridade absoluta. Entendemos que dados financeiros 
          exigem o mais alto nível de atenção, e por isso projetamos uma arquitetura focada na garantia de acesso restrito e 
          proteção da sua identidade.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Autenticação Blindada</h3>
        <p className="mb-6">
          Para assegurar que apenas você tenha acesso às suas informações, o cadastro na plataforma é obrigatoriamente 
          vinculado a um e-mail de identificação único. Além disso, implementamos um sistema de 
          <strong> validação de dois fatores (2FA)</strong>, como o uso de PIN, garantindo que o seu primeiro acesso 
          e movimentações sensíveis passem por uma camada extra de verificação.
        </p>

        <div className="bg-blue-50 border border-blue-100 p-6 my-8 rounded-xl shadow-sm">
          <h4 className="text-blue-900 font-bold mb-2">Compromisso com o Usuário</h4>
          <p className="text-blue-800 text-base leading-relaxed">
            Nossa equipe de engenharia monitora constantemente a integridade da plataforma. Seus dados são 
            criptografados e tratados sob rígidos protocolos de privacidade, seguindo as melhores práticas 
            de conformidade digital.
          </p>
        </div>

        <p className="mb-8 font-medium">
          Dúvidas sobre pontos sensíveis? Estamos à disposição. Conte com nosso canal de apoio para esclarecimentos, 
          sugestões ou suporte técnico dedicado.
        </p>
      </div>      
    </div>
  );
}