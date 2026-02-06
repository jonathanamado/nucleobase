import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <Header />

      <main className="flex flex-col md:flex-row gap-8 px-8 py-10">
        <Sidebar />
        <MainContent />
      </main>

    </div>
  );
}
