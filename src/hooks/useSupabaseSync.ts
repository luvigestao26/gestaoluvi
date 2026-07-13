import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

export function useSupabaseSync() {
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    setConfigured(isSupabaseConfigured() && !!supabase);
  }, []);

  // Helper para converter snake_case do banco para camelCase do frontend
  const mapFromDb = (item: any) => {
    if (!item) return null;
    const mapped: any = {};
    for (const key in item) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      mapped[camelKey] = item[key];
    }
    return mapped;
  };

  // Helper para converter camelCase do frontend para snake_case do banco
  const mapToDb = (item: any) => {
    if (!item) return null;
    const mapped: any = {};
    for (const key in item) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      mapped[snakeKey] = item[key];
    }
    return mapped;
  };

  // Carregar dados de uma tabela filtrando pelo usuário logado
  const loadTable = async (tableName: string) => {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data ? data.map(mapFromDb) : [];
    } catch (err: any) {
      console.error(`Erro ao carregar ${tableName}:`, err.message);
      return null;
    }
  };

  // Salvar/Inserir item vinculando ao usuário logado
  const saveItem = async (tableName: string, item: any) => {
    if (!isSupabaseConfigured() || !supabase) return false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const dbItem = mapToDb(item);
      dbItem.user_id = user.id; // Vincula o registro ao usuário logado

      const { error } = await supabase.from(tableName).upsert(dbItem);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error(`Erro ao salvar em ${tableName}:`, err.message);
      showError(`Erro ao salvar dados na nuvem.`);
      return false;
    }
  };

  // Deletar item garantindo que pertence ao usuário logado
  const deleteItem = async (tableName: string, id: string) => {
    if (!isSupabaseConfigured() || !supabase) return false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error(`Erro ao deletar de ${tableName}:`, err.message);
      showError(`Erro ao remover dados da nuvem.`);
      return false;
    }
  };

  // Carregar configurações específicas do usuário logado
  const loadSettings = async () => {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapFromDb(data) : null;
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err.message);
      return null;
    }
  };

  return {
    isConfigured: configured,
    loadTable,
    saveItem,
    deleteItem,
    loadSettings
  };
}