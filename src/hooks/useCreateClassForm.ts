import { useState } from 'react';
import { useCreateClass } from '@/hooks/useClassActions';
import { toast } from "sonner";

interface ClassFormState {
  name: string;
  period: string;
  subject: string;
  schedule: string;
  room: string;
}

const INITIAL_STATE: ClassFormState = {
  name: '',
  period: '',
  subject: '',
  schedule: '',
  room: '',
};

export function useCreateClassForm(onSuccess: () => void) {
  const [form, setForm] = useState<ClassFormState>(INITIAL_STATE);
  const createClassMutation = useCreateClass();

  const setField =
    (field: keyof ClassFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const reset = () => setForm(INITIAL_STATE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClassMutation.mutateAsync({
        name: form.name,
        period: form.period,
        subject: form.subject,
        schedule: form.schedule,
        room: form.room,
      });
      toast.success('Sucesso!', { description: 'Nova turma criada com sucesso.' });
      reset();
      onSuccess();
    } catch (err: any) {
      toast.error('Erro ao criar turma', {
        description: err instanceof Error ? err.message : 'Erro desconhecido ao tentar salvar os dados.',
      });
    }
  };

  return {
    form,
    setField,
    handleSubmit,
    isPending: createClassMutation.isPending,
  };
}
