import { supabase } from "../integrations/supabase/client";

export const isSupabaseConfigured = () => {
  return true; // Sempre configurado agora com o cliente oficial integrado
};

export const getSupabaseClient = () => {
  return supabase;
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