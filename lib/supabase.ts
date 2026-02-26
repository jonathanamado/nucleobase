import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ayxwgqsowewwiurncaux.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHdncXNvd2V3d2l1cm5jYXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDkyNTYsImV4cCI6MjA4NTk4NTI1Nn0.vIy09-8WR4NFVj4j_AbyGkTxp1KuF51m7pQt3tFywok'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'nucleobase-auth-token', // Garante que a chave seja a mesma em todos os apps
    // Configuração de cookie compatível com subdomínios
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        const cookie = document.cookie.split('; ').find(row => row.startsWith(`${key}=`));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : window.localStorage.getItem(key);
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        // Salva no Cookie com domínio global para subdomínios (.nucleobase.app)
        // O ponto antes do domínio permite que subdomínios leiam o cookie
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; domain=.nucleobase.app; max-age=31536000; SameSite=Lax; Secure`;
        window.localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        document.cookie = `${key}=; path=/; domain=.nucleobase.app; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        window.localStorage.removeItem(key);
      }
    }
  }
})