import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica se as chaves são reais e não os placeholders de exemplo
const isValidConfig = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://seu-projeto.supabase.co' && 
  supabaseAnonKey !== 'sua-chave-anon-public-aqui';

// Inicializa o cliente apenas se as chaves forem válidas para evitar crash no build
export const supabase = isValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (null as any);

// Função auxiliar para verificar se o Supabase está configurado com chaves reais
export const isSupabaseConfigured = (): boolean => {
  return isValidConfig;
};