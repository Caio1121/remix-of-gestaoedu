import { useState } from "react";
import { ClassStudent, TeacherClass } from "@/types";
import { Save, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface Props {
  students: ClassStudent[];
  classes: TeacherClass[];
  selectedClass: string;
  onClassChange: (id: string) => void;
}

export function TeacherGrades({ students, classes, selectedClass, onClassChange }: Props) {
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    students.forEach(s => {
      init[s.id] = {
        av1: s.av1?.toString() ?? "",
        av2: s.av2?.toString() ?? "",
        av3: s.av3?.toString() ?? "",
      };
    });
    return init;
  });
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const upsertData = students.map((s) => {
        const av1Raw = grades[s.id]?.av1
        const av2Raw = grades[s.id]?.av2
        const av3Raw = grades[s.id]?.av3
        const av1Val = av1Raw !== '' && av1Raw != null ? parseFloat(av1Raw as string) : null
        const av2Val = av2Raw !== '' && av2Raw != null ? parseFloat(av2Raw as string) : null
        const av3Val = av3Raw !== '' && av3Raw != null ? parseFloat(av3Raw as string) : null
        const finalStr = getFinal(s.id)
        const finalVal = finalStr && finalStr !== 'Inválido' ? parseFloat(finalStr) : null
        return {
          studentid: s.id,
          classid: selectedClass,
          av1: av1Val,
          av2: av2Val,
          av3: av3Val,
          gradevalue: finalVal,
          updatedat: new Date().toISOString(),
        }
      })

      const { error } = await supabase
        .from('grades')
        .upsert(upsertData, { onConflict: 'studentid,classid' })

      if (error) throw error

      setSaved(true)
      toast.success('Notas salvas', { description: 'As notas foram registradas com sucesso.' })
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      toast.error('Erro ao salvar', { description: err?.message ?? 'Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const cls = classes.find(c => c.id === selectedClass) || classes[0];

  if (!cls) {
    return <div className="p-8 text-center text-muted-foreground">Nenhuma turma encontrada.</div>;
  }

const getFinal = (sid: string): string | null => {
  const raw = [grades[sid]?.av1, grades[sid]?.av2, grades[sid]?.av3]
  const entered = raw.filter((v) => v !== '' && v !== undefined && v !== null)
  if (entered.length === 0) return null
  const vals = entered.map((v) => parseFloat(v as string))
  if (vals.some((v) => isNaN(v))) return 'Inválido'
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}



  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Lançamento de Notas</h2>
          <p className="text-muted-foreground text-sm">Edite e salve as notas dos alunos</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={e => onClassChange(e.target.value)}
            className="h-9 border border-input bg-background rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.subject}</option>)}
          </select>
          <Button onClick={handleSave} disabled={isSubmitting} className="gradient-brand text-primary-foreground h-9">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Salvando...</> : (saved ? <><CheckCircle className="w-4 h-4 mr-1" />Salvo!</> : <><Save className="w-4 h-4 mr-1" />Salvar</>)}
          </Button>
        </div>
      </div>

      <div className="bg-accent-light border border-accent/20 rounded-xl px-4 py-2.5 text-sm text-accent">
        Turma <strong>{cls.name}</strong> — {cls.subject} · {students.length} alunos
      </div>

      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Aluno</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Matrícula</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">AV1</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">AV2</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">AV3</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Média</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s) => {
                const final = getFinal(s.id);
                const finalNum = final ? parseFloat(final) : null;
                return (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                          {s.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                        </div>
                        <span className="text-sm font-medium text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{s.matricula}</td>
                    {["av1", "av2", "av3"].map(av => (
                      <td key={av} className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min={0} max={10} step={0.1}
                          value={grades[s.id]?.[av] ?? ""}
                          onChange={e => setGrades(prev => ({
                            ...prev,
                            [s.id]: { ...prev[s.id], [av]: e.target.value }
                          }))}
                          className="w-14 h-8 text-center border border-input rounded-lg text-sm font-semibold text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-base font-bold ${
                        finalNum === null ? "text-muted-foreground" :
                        finalNum >= 7 ? "text-success" : finalNum >= 5 ? "text-warning" : "text-destructive"
                      }`}>
                        {final ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        finalNum === null ? "bg-muted text-muted-foreground" :
                        finalNum >= 6 ? "bg-success-light text-success" : "bg-destructive-light text-destructive"
                      }`}>
                        {finalNum === null ? "Em curso" : finalNum >= 6 ? "Aprovado" : "Reprovado"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
