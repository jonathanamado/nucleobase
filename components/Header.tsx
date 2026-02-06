export function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
      
      <div className="text-lg font-bold">
        nucleobase.app
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
        <a href="#" className="hover:text-gray-900">Início</a>
        <a href="#" className="hover:text-gray-900">A Plataforma</a>
        <a href="#" className="hover:text-gray-900">Recursos</a>

        {/* LINK PARA O STREAMLIT */}
        <a
          href="https://nucleobase.streamlit.app/"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Acessar
        </a>
      </nav>

      {/* Mobile (por enquanto só visual) */}
      <button className="md:hidden text-2xl">☰</button>
    </header>
  );
}
