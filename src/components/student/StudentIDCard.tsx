import { Student } from "@/types";
import { QrCode, Download, Share2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { student: Student }

export function StudentIDCard({ student }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Carteirinha Digital</h2>
        <p className="text-muted-foreground text-sm">Identidade estudantil com validação online</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Card front */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "1.586" }}>
            {/* Background */}
            <div className="absolute inset-0 gradient-brand" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative p-5 h-full flex flex-col justify-between text-primary-foreground">
              {/* Header */}
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 opacity-90" />
                <div>
                  <div className="font-bold text-sm leading-tight">EduManager</div>
                  <div className="text-xs opacity-70">Faculdade de Excelência</div>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">ESTUDANTE</span>
                </div>
              </div>

              {/* Student info */}
              <div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mb-2 border-2 border-white/40">
                  {student.avatarInitials}
                </div>
                <div className="font-bold text-base leading-tight">{student.name}</div>
                <div className="text-xs opacity-80 mt-0.5">{student.course}</div>
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs opacity-60">Matrícula</div>
                  <div className="font-mono text-sm font-bold">{student.matricula}</div>
                  <div className="text-xs opacity-60">Turma: {student.class}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-60">Válido até</div>
                  <div className="text-sm font-semibold">12/2025</div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Frente da carteirinha</p>
        </div>

        {/* Card back with QR */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border bg-card" style={{ aspectRatio: "1.586" }}>
            <div className="p-5 h-full flex flex-col justify-between">
              <div className="text-center">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">QR Code de Validação</div>
                {/* Fake QR Code */}
                <div className="w-28 h-28 mx-auto bg-foreground rounded-lg flex items-center justify-center p-1">
                  <div className="w-full h-full grid grid-cols-7 grid-rows-7 gap-0.5">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-sm"
                        style={{
                          background: Math.random() > 0.45 ? "white" : "transparent",
                          ...(i < 7 || i > 41 || (i % 7 === 0 && i < 21) || (i % 7 === 6 && i < 21)) ? { background: "white" } : {}
                        }}
                      />
                    ))}
                  </div>
                </div>
                <QrCode className="w-24 h-24 mx-auto text-foreground" />
              </div>
              <div className="text-center">
                <div className="font-mono text-xs text-muted-foreground">{student.matricula}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Aponte a câmera para validar</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Em caso de dúvidas, acesse</div>
                <div className="text-xs text-accent font-medium">validacao.edumanager.edu.br</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Verso da carteirinha</p>
        </div>

        {/* Actions & details */}
        <div className="flex-1 space-y-4">
          <div className="bg-card shadow-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Dados do Estudante</h3>
            <dl className="space-y-3">
              {[
                { label: "Nome completo", value: student.name },
                { label: "Matrícula", value: student.matricula },
                { label: "Curso", value: student.course },
                { label: "Turma", value: student.class },
                { label: "E-mail", value: student.email },
                { label: "Telefone", value: student.phone },
                { label: "Data de ingresso", value: student.enrollmentDate },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <dt className="text-xs text-muted-foreground font-medium w-36 flex-shrink-0">{label}</dt>
                  <dd className="text-sm font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 gradient-brand text-primary-foreground">
              <Download className="w-4 h-4 mr-2" />
              Baixar Carteirinha
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>

          <div className="bg-success-light border border-success/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-success" />
            </div>
            <div>
              <div className="text-sm font-semibold text-success">Carteirinha Válida</div>
              <div className="text-xs text-success/70">Matrícula ativa · Verificada em {new Date().toLocaleDateString("pt-BR")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
