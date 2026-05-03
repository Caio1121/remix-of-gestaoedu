import { X } from 'lucide-react';
import { useCreateClassForm } from '@/hooks/useCreateClassForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateClassModal({ isOpen, onClose }: Props) {
  const { form, setField, handleSubmit, isPending } = useCreateClassForm(onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold mb-4">Criar Nova Turma</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome da Turma</label>
            <input
              required
              value={form.name}
              onChange={setField('name')}
              placeholder="Ex: Turma ADM-4A"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Período</label>
            <input
              required
              value={form.period}
              onChange={setField('period')}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Matéria / Disciplina</label>
            <input
              value={form.subject}
              onChange={setField('subject')}
              placeholder="Ex: Administração Financeira"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Horário</label>
              <input
                value={form.schedule}
                onChange={setField('schedule')}
                placeholder="Ex: Seg/Qua 19h-21h"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sala</label>
              <input
                value={form.room}
                onChange={setField('room')}
                placeholder="Ex: Sala 204-B"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full gradient-brand text-primary-foreground py-2 rounded-lg font-bold disabled:opacity-50"
          >
            {isPending ? 'Criando...' : 'Criar Turma'}
          </button>
        </form>
      </div>
    </div>
  );
}
