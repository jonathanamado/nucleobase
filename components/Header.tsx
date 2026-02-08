export function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
      
      {/* LOGO */}
      <div className="text-lg font-bold text-gray-900">
        nucleobase.app
      </div>

      {/* NAVEGAÇÃO PRINCIPAL */}
      <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
        <a href="/" className="hover:text-gray-900">Início</a>
        <a href="/plataforma" className="hover:text-gray-900">A Plataforma</a>
        <a href="/recursos" className="hover:text-gray-900">Recursos</a>

        {/* ESPAÇADOR VISUAL (Opcional, apenas para separar os botões dos links) */}
        <span className="h-4 w-px bg-gray-200 mx-2"></span>

        {/* BOTÃO CRIAR CONTA (Outline) */}
        <a
          href="/cadastro" 
          className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition font-medium"
        >
          Criar Conta
        </a>
        {/* BOTÃO ACESSAR (Destaque Blue) */}
        <a
          href="https://nucleobase.streamlit.app/"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium"
        >
          Acessar
        </a>
      </nav>

      {/* Mobile (Hambúrguer) */}
      <button className="md:hidden text-2xl text-gray-600 hover:text-gray-900">
        ☰
      </button>
    </header>
  );
}
