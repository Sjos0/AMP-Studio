/**
 * Configuração do Cliente Supabase
 * Sistema de Memória Persistente - AMP Studio
 */

import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente (configure no .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validação de configuração - lança erro claro se não configurado
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase não configurado! Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local'
  );
}

// Cliente Supabase para uso no browser/client components
// TypeScript agora sabe que nunca é null
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
