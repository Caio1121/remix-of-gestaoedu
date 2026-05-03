import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Mutação para gerar uma cobrança via Asaas (PIX ou boleto).
 * Chama a Edge Function `create-asaas-charge`.
 * Por padrão aponta para o sandbox. Para produção, altere a URL na Edge Function.
 * @returns `pixqrcode`, `piximageurl`, `boletourl`, `invoiceUrl`, `billingType`
 * @throws Erro se a Edge Function retornar `result.error`
 */
export const useGeneratePayment = () =>
  useMutation({
    mutationFn: async (data: {
      amount: number;
      description: string;
      studentProfile: any;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: result, error } = await supabase.functions.invoke('create-asaas-charge', {
        body: {
          amount: data.amount,
          description: data.description,
          studentId: data.studentProfile.id,
          studentEmail: session?.user?.email,
          studentName: data.studentProfile.fullname,
          studentCpf: data.studentProfile.cpf || '000.000.000-00',
        },
      });
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      return {
        pixCode: result.invoiceUrl,
        pixqrcode: result.pixCode,
        piximageurl: result.pixImage,
        billingType: result.billingType,
        invoiceUrl: result.invoiceUrl,
        boletourl: result.bankSlipUrl ?? result.invoiceUrl,
      };
    },
  });
