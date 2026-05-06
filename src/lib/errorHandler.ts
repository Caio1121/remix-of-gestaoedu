import { toast } from "sonner";

/**
 * Mapeia erros técnicos do Supabase/Postgrest para mensagens amigáveis em português.
 */
const ERROR_MAPPING: Record<string, string> = {
  "PGRST116": "O registro solicitado não foi encontrado.",
  "23505": "Este registro já existe (duplicidade detectada).",
  "42501": "Você não tem permissão para realizar essa ação.",
  "23503": "Não é possível excluir este item pois ele está sendo usado em outro lugar.",
  "auth/invalid-helper": "Credenciais inválidas.",
  "auth/user-not-found": "Usuário não encontrado.",
  "invalid_credentials": "E-mail ou senha incorretos.",
  "CLASS_HAS_ENROLLMENTS": "Não é possível excluir esta turma pois ela ainda possui alunos matriculados.",
};

interface SupabaseError {
  code?: string;
  message: string;
}

/**
 * Centraliza o tratamento de erros da aplicação.
 * @param error Objeto de erro retornado pelo Supabase ou capturado em try/catch
 * @param context Contexto opcional para log técnico (ex: 'saveGrade')
 */
export const handleSupabaseError = (error: any, context?: string) => {
  const err = error as SupabaseError;
  const errorCode = err.code || "";
  
  // Log técnico apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error Handler - ${context || 'General'}]:`, error);
  }

  const message = ERROR_MAPPING[errorCode] || "Ocorreu um erro inesperado. Tente novamente mais tarde.";

  toast.error(message, {
    description: process.env.NODE_ENV === 'development' ? err.message : undefined
  });

  return message;
};
