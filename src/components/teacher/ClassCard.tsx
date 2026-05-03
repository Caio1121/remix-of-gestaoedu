import { Users, Clock, MapPin } from 'lucide-react';
import type { TeacherClass } from '@/types';

interface Props {
  class_: TeacherClass;
  onSelect: (id: string) => void;
}

export function ClassCard({ class_: c, onSelect }: Props) {
  return (
    <div className="bg-card shadow-card rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="gradient-brand p-4">
        <div className="flex items-center justify-between">
          <span className="text-primary-foreground font-bold text-lg">{c.name}</span>
          <span className="bg-white/20 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {c.period}
          </span>
        </div>
        <div className="text-primary-foreground/80 text-sm mt-0.5">
          {c.subject ?? 'Matéria Geral'}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-primary/60" />
          <span>{c.schedule ?? 'Horário a definir'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary/60" />
          <span>{c.room ?? 'Sala a definir'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4 text-primary/60" />
          <span>{c.students ?? 0} alunos matriculados</span>
        </div>

        <button
          onClick={() => onSelect(c.id)}
          className="w-full mt-2 text-sm bg-primary/10 text-primary py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors"
        >
          Ver alunos e notas
        </button>
      </div>
    </div>
  );
}
