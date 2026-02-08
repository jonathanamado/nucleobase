"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Header } from "@/components/Header";

// Inicializa o cliente do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Usuário criado com sucesso! Verifique seu e-mail ou acesse o sistema.");
      window.location.href = "https://nucleobase.streamlit.app";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Criar Conta</h2>
          
          <form onSubmit={handleCadastro} className="space-y-4">
            <input 
              type="email" 
              placeholder="E-mail" 
              required
              className="w-full px-4 py-2 border rounded-md outline-none text-gray-900"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Senha" 
              required
              className="w-full px-4 py-2 border rounded-md outline-none text-gray-900"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              {loading ? "Cadastrando..." : "Finalizar Cadastro"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
