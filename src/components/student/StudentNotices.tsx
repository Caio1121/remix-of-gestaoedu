import { Notice } from "@/types";
import { Bell, AlertCircle, Clock, CheckCircle } from "lucide-react";

interface Props { notices: Notice[] }

const categoryColor: Record<string, string> = {
  academico: "bg-info-light text-info",
  financeiro: "bg-warning-light text-warning",
  evento: "bg-accent-light text-accent",
  geral: "bg-muted text-muted-foreground",
};

const priorityConfig = {
  alta: { icon: AlertCircle, cls: "text-destructive", label: "Alta" },
  media: { icon: Clock, cls: "text-warning", label: "Média" },
  baixa: { icon: CheckCircle, cls: "text-muted-foreground", label: "Baixa" },
};

export function StudentNotices({ notices }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Quadro de Avisos</h2>
        <p className="text-muted-foreground text-sm">Comunicados institucionais</p>
      </div>

      <div className="space-y-4">
        {notices.map((n) => {
          const pri = priorityConfig[(n.priority as keyof typeof priorityConfig)] || priorityConfig.media;
          const Icon = pri.icon;
          return (
            <div key={n.id} className="bg-card shadow-card rounded-xl p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  n.priority === "alta" ? "bg-destructive-light" :
                  n.priority === "media" ? "bg-warning-light" : "bg-muted"
                }`}>
                  <Icon className={`w-4 h-4 ${pri.cls}`} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{n.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[n.category || 'geral'] || categoryColor.geral}`}>
                      {n.category}
                    </span>
                    <span className={`text-xs font-medium ${pri.cls}`}>
                      Prioridade: {pri.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{n.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">{n.date || (n.created_at ? new Date(n.created_at).toLocaleDateString('pt-BR') : '')}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
