import { useState } from "react";
import { TeacherClass } from "@/types";
import { Users, Clock, MapPin, BookOpen, Plus, X } from "lucide-react";
import { useCreateClass } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";

interface Props {
  classes: TeacherClass[];
  onSelectClass: (id: string) => void;
}

export function TeacherClasses({ classes, onSelectClass }: Props) {
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassPeriod, setNewClassPeriod] = useState("2025.1");
  const createClassMutation = useCreateClass();
  const { toast } = useToast();

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClassMutation.mutateAsync({
        name: newClassName,
        period: newClassPeriod,
      });
      toast({ title: "Sucesso!", description: "Nova turma criada com sucesso." });
      setIsOpeningModal(false);
      setNewClassName("");
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar a turma." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Minhas Turmas</h2>
          <p className="text-muted-foreground text-sm">Gerencie suas turmas do período {classes[0]?.period || "2025.1"}</p>
        </div>
        <button
          onClick={() => setIsOpeningModal(true)}
          className="flex items-center gap-2 gradient-brand text-primary-foreground text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      {isOpeningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-xl relative">
            <button onClick={() => setIsOpeningModal(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Criar Nova Turma</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Turma</label>
                <input
                  required
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="Ex: Turma ADM-4A"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Período</label>
                <input
                  required
                  value={newClassPeriod}
                  onChange={e => setNewClassPeriod(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={createClassMutation.isPending}
                className="w-full gradient-brand text-primary-foreground py-2 rounded-lg font-bold disabled:opacity-50"
              >
                {createClassMutation.isPending ? "Criando..." : "Criar Turma"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div key={c.id} className="bg-card shadow-card rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="gradient-brand p-4">
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground font-bold text-lg">{c.name}</span>
                <span className="bg-white/20 text-primary-foreground text-xs px-2 py-0.5 rounded-full">{c.period}</span>
              </div>
              <div className="text-primary-foreground/80 text-sm mt-0.5">{c.subject || "Matéria Geral"}</div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary/60" />
                <span>{c.schedule || "Horário a definir"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary/60" />
                <span>{c.room || "Sala a definir"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary/60" />
                <span>{c.students || 0} alunos matriculados</span>
              </div>
              <button
                onClick={() => onSelectClass(c.id)}
                className="w-full mt-2 text-sm bg-primary/10 text-primary py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors"
              >
                Ver alunos e notas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
