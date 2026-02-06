/**
 * Configuração do Cliente Supabase
 * Sistema de Memória Persistente - AMP Studio
 */

import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente (configure no .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente Supabase para uso no browser/client components
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente para uso em server components
export const createServerClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente Supabase não configuradas');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Verificação de configuração
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Configuração do projeto
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  projectId: 'mibdbwmmxnhtyrywoarw', // ID do projeto Supabase
};
