import { Mail, Instagram, Send, MessageCircle } from "lucide-react";

export default function ContatoPage() {
  // Link gerado via Wa.link para evitar erros de sintaxe e caracteres especiais
  const whatsappLink = "https://wa.link/qbxg9f";

  return (
    <div className="w-full">
      {/* Alinhamento superior padrão com -mt-3 */}
      <div className="mb-8 mt-2 text-left">
        <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">
          Conte com a gente<span className="text-blue-600">.</span> 🤝
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl font-bold">
          Dúvidas, sugestões ou feedbacks? Queremos te ouvir na nucleobase.app.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl">
        
        {/* COLUNA DE LINKS RÁPIDOS */}
        <div className="flex flex-col gap-4">
          {/* INSTAGRAM - Ajustado com barra final, z-index e pointer-events p/ Mobile */}
          <a 
            href="https://www.instagram.com/nucleobase.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition group cursor-pointer relative z-20 active:bg-gray-50"
          >
            <div className="bg-pink-50 p-3 rounded-xl text-pink-600 group-hover:bg-pink-100 transition pointer-events-none">
              <Instagram size={24} />
            </div>
            <div className="pointer-events-none">
              <h3 className="font-bold text-gray-900">Instagram</h3>
              <p className="text-xs text-gray-500">Novidades e Direct</p>
              <span className="text-pink-600 text-xs font-medium hover:underline">
                @nucleobase.app
              </span>
            </div>
          </a>

          {/* WHATSAPP */}
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition group cursor-pointer relative z-20 active:bg-gray-50"
          >
            <div className="bg-green-50 p-3 rounded-xl text-green-600 group-hover:bg-green-100 transition pointer-events-none">
              <MessageCircle size={24} />
            </div>
            <div className="pointer-events-none">
              <h3 className="font-bold text-gray-900">WhatsApp</h3>
              <p className="text-xs text-gray-500">Atendimento ágil</p>
              <span className="text-green-600 text-xs font-medium hover:underline">
                Chamar no Whats
              </span>
            </div>
          </a>

          {/* E-MAIL */}
          <a 
            href="mailto:nucleobase.app@gmail.com"
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition group cursor-pointer relative z-20 active:bg-gray-50"
          >
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-100 transition pointer-events-none">
              <Mail size={24} />
            </div>
            <div className="pointer-events-none">
              <h3 className="font-bold text-gray-900">E-mail</h3>
              <p className="text-xs text-gray-500">Respostas em até 24h</p>
              <span className="text-blue-600 text-xs font-medium hover:underline">
                nucleobase.app@gmail.com
              </span>
            </div>
          </a>
        </div>

        {/* COLUNA DO FORMULÁRIO */}
        <form 
          action="https://api.web3forms.com/submit" 
          method="POST"
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white p-7 rounded-3xl shadow-md border border-gray-50 h-full"
        >            
          <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Nome</label>
            <input name="name" required type="text" className="px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="Seu nome" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">E-mail</label>
            <input name="email" required type="email" className="px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="seu@email.com" />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2 flex-1">
            <label className="text-sm font-semibold text-gray-700">Mensagem</label>
            <textarea name="message" required className="flex-1 px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 resize-none min-h-[102px]" placeholder="Como podemos ajudar?"></textarea>
          </div>

          <button type="submit" className="sm:col-span-2 bg-blue-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg mt-2">
            <Send size={18} /> Enviar Mensagem
          </button>
        </form>
      </div>
    </div>
  );
}