import { createClient } from '@supabase/supabase-js';

// Tenta obter das variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('custom_supabase_url') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('custom_supabase_anon_key') || '';

export const isSupabaseConfigured = () => {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
};

export const getSupabaseClient = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('custom_supabase_url') || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('custom_supabase_anon_key') || '';
  
  if (!url || !key) return null;
  return createClient(url, key);
};

export const saveCustomCredentials = (url: string, key: string) => {
  localStorage.setItem('custom_supabase_url', url);
  localStorage.setItem('custom_supabase_anon_key', key);
  window.location.reload();
};

export const clearCustomCredentials = () => {
  localStorage.removeItem('custom_supabase_url');
  localStorage.removeItem('custom_supabase_anon_key');
  window.location.reload();
};