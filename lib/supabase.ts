import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ayxwgqsowewwiurncaux.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHdncXNvd2V3d2l1cm5jYXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDkyNTYsImV4cCI6MjA4NTk4NTI1Nn0.vIy09-8WR4NFVj4j_AbyGkTxp1KuF51m7pQt3tFywok'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'nucleobase-auth', // Garante consistência no localStorage
    cookieOptions: {
      // O ponto antes do domínio (ex: .nucleobase.app) permite 
      // que subdomínios compartilhem o mesmo cookie de login.
      domain: '.nucleobase.app', 
      path: '/',
      sameSite: 'lax',
      secure: true,
    },
  },
})