import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { TeacherClass } from '@/types';
import { CreateClassModal } from './CreateClassModal';
import { ClassCard } from './ClassCard';

interface Props {
  classes: TeacherClass[];
  onSelectClass: (id: string) => void;
}

export function TeacherClasses({ classes, onSelectClass }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Minhas Turmas</h2>
          <p className="text-muted-foreground text-sm">
            Gerencie suas turmas do período {classes[0]?.period ?? '2025.1'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 gradient-brand text-primary-foreground text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <ClassCard
            key={c.id}
            class_={c}
            onSelect={onSelectClass}
          />
        ))}
      </div>
    </div>
  );
}
