import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Implementação de singleton para o cliente Supabase
let supabaseClientInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Função para obter a instância do cliente Supabase
export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseClientInstance === null) {
    supabaseClientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igkgkyvwymjamexlqyic.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2dreXZ3eW1qYW1leGxxeWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzA5MzcsImV4cCI6MjA2MzQwNjkzN30.ZELe85oTfWsc1FkQbvgr6Co9GPXBivn8DTfDLhYSlh0'
    );
  }
  return supabaseClientInstance;
};

// Função para obter a instância do cliente Supabase Admin
export const getSupabaseAdmin = (): SupabaseClient => {
  if (supabaseAdminInstance === null) {
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igkgkyvwymjamexlqyic.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2dreXZ3eW1qYW1leGxxeWljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzgzMDkzNywiZXhwIjoyMDYzNDA2OTM3fQ.qAD2CnrpLmhP4KyEPHcbfRdqqddxr5j3EaJ3qWiOoIk'
    );
  }
  return supabaseAdminInstance;
};

// Para compatibilidade com código existente
export const supabaseClient = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdmin();
