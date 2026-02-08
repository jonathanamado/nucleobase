export function Sidebar() {
  return (
    <aside className="w-full md:w-1/4 flex flex-col gap-4 text-sm text-gray-600">
      <a href="/sobre" className="hover:text-blue-600">Sobre a Núcleo Base</a>
      <a href="/como_funciona" className="hover:text-blue-600">Como funciona</a>
      <a href="/seguranca_privacidade" className="hover:text-blue-600">Segurança e privacidade</a>
      <a href="/visao_produto" className="hover:text-blue-600">Visão do produto</a>
      <a href="/contato" className="hover:text-blue-600">Contato</a>
    </aside>
  );
}
