import { createClient } from '@supabase/supabase-js'

// As strings devem estar entre aspas simples ou duplas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ayxwgqsowewwiurncaux.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHdncXNvd2V3d2l1cm5jYXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDkyNTYsImV4cCI6MjA4NTk4NTI1Nn0.vIy09-8WR4NFVj4j_AbyGkTxp1KuF51m7pQt3tFywok'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)