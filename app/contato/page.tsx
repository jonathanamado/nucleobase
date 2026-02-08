import { Header } from "@/components/Header";
import { Mail, Instagram, Send } from "lucide-react"; 

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-5xl mx-auto py-16 px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Conte com a gente
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dúvidas, sugestões ou feedbacks? Estamos prontos para te ouvir e melhorar sua experiência na Nucleobase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CARDS DE CONTATO DIRETO */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">E-mail</h3>
                <p className="text-sm text-gray-500">Respostas em até 24h</p>
                <a href="mailto:nucleobase.app@gmail.com" className="text-blue-600 text-sm font-medium hover:underline">
                  nucleobase.app@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-pink-50 p-3 rounded-xl text-pink-600">
                <Instagram size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Instagram</h3>
                <p className="text-sm text-gray-500">Novidades e Direct</p>
                <a href="https://www.instagram.com/nucleobase.app" target="_blank" rel="noopener noreferrer" className="text-pink-600 text-sm font-medium hover:underline">
                  @nucleobase.app
                </a>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO DE MENSAGEM */}
          <form 
            action="https://api.web3forms.com/submit" 
            method="POST" 
            className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-8 rounded-3xl shadow-md border border-gray-50"
          >            
            <input type="hidden" name="access_key" value="9ef5a274-150a-4664-a885-0b052efd06f7" />
            
            {/* REDIRECIONAMENTO PARA A PÁGINA DE SUCESSO */}
            {/* Se estiver testando local use: value="http://localhost:3000/contato/sucesso" */}
            <input type="hidden" name="redirect" value="https://nucleobase.vercel.app" />

            <input type="hidden" name="subject" value="Novo contato pelo site Nucleobase" />
            <input type="hidden" name="from_name" value="Site Nucleobase" />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Nome</label>
              <input name="name" required type="text" className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="Seu nome" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">E-mail</label>
              <input name="email" required type="email" className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="seu@email.com" />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Mensagem</label>
              <textarea name="message" required rows={4} className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="Como podemos ajudar?"></textarea>
            </div>

            <button type="submit" className="sm:col-span-2 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg">
              <Send size={18} /> Enviar Mensagem
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
