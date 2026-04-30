import { useState } from "react";
import { ClassStudent, TeacherClass } from "@/types";
import { Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  students: ClassStudent[];
  classes: TeacherClass[];
  selectedClass: string;
}

type AttStatus = "presente" | "ausente" | "justificado";

export function TeacherAttendance({ students, classes, selectedClass }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState<Record<string, AttStatus>>(() => {
    const init: Record<string, AttStatus> = {};
    students.forEach(s => { init[s.id] = "presente"; });
    return init;
  });
  const [saved, setSaved] = useState(false);

  const cls = classes.find(c => c.id === selectedClass) || classes[0];

  if (!cls) {
    return <div className="p-8 text-center text-muted-foreground">Nenhuma turma encontrada.</div>;
  }
  const presentes = Object.values(attendance).filter(a => a === "presente").length;

  const statusBtns: { value: AttStatus; label: string; cls: string; active: string }[] = [
    { value: "presente", label: "P", cls: "border border-success/30 text-success hover:bg-success hover:text-success-foreground", active: "bg-success text-success-foreground" },
    { value: "ausente", label: "F", cls: "border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground", active: "bg-destructive text-destructive-foreground" },
    { value: "justificado", label: "J", cls: "border border-warning/30 text-warning hover:bg-warning hover:text-warning-foreground", active: "bg-warning text-warning-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Registro de Frequência</h2>
          <p className="text-muted-foreground text-sm">{cls.name} — {cls.subject}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="h-9 border border-input bg-background rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="gradient-brand text-primary-foreground h-9">
            {saved ? <><CheckCircle className="w-4 h-4 mr-1" />Salvo!</> : <><Save className="w-4 h-4 mr-1" />Salvar</>}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-success-light border border-success/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-success">{presentes}</div>
          <div className="text-xs text-success/70">Presentes</div>
        </div>
        <div className="bg-destructive-light border border-destructive/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{Object.values(attendance).filter(a => a === "ausente").length}</div>
          <div className="text-xs text-destructive/70">Faltas</div>
        </div>
        <div className="bg-warning-light border border-warning/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-warning">{Object.values(attendance).filter(a => a === "justificado").length}</div>
          <div className="text-xs text-warning/70">Justificadas</div>
        </div>
      </div>

      {/* Mark all buttons */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Marcar todos:</span>
        {statusBtns.map(btn => (
          <button
            key={btn.value}
            onClick={() => {
              const upd: Record<string, AttStatus> = {};
              students.forEach(s => { upd[s.id] = btn.value; });
              setAttendance(upd);
            }}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${btn.cls}`}
          >
            Todos {btn.label === "P" ? "Presentes" : btn.label === "F" ? "Faltaram" : "Justificados"}
          </button>
        ))}
      </div>

      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {students.map((s) => (
            <div key={s.id} className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {s.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{s.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{s.matricula}</div>
                </div>
              </div>
              <div className="flex gap-1.5">
                {statusBtns.map(btn => (
                  <button
                    key={btn.value}
                    onClick={() => setAttendance(prev => ({ ...prev, [s.id]: btn.value }))}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      attendance[s.id] === btn.value ? btn.active : btn.cls
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
