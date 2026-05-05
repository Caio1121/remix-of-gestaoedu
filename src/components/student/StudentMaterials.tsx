import { useState } from "react";
import { FileText, Film, Link2, Presentation, Download, ExternalLink } from "lucide-react";

interface Props { materials: any[] }

const typeConfig = {
  pdf: { icon: FileText, label: "PDF", color: "bg-destructive-light text-destructive" },
  video: { icon: Film, label: "Vídeo", color: "bg-info-light text-info" },
  link: { icon: Link2, label: "Link", color: "bg-accent-light text-accent" },
  slide: { icon: Presentation, label: "Slide", color: "bg-warning-light text-warning" },
};

export function StudentMaterials({ materials }: Props) {
  const [selectedType, setSelectedType] = useState<string>("all");

  const filtered = selectedType === "all" ? materials : materials.filter(m => m.materialtype === selectedType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Materiais Didáticos</h2>
        <p className="text-muted-foreground text-sm">Conteúdos disponibilizados pelos professores</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelectedType("all")}
          className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${selectedType === "all" ? "gradient-brand text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/40"}`}>
          Todos ({materials.length})
        </button>
        {Object.keys(typeConfig).map(type => (
          <button key={type} onClick={() => setSelectedType(type)}
            className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${selectedType === type ? "gradient-brand text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/40"}`}>
            {typeConfig[type as keyof typeof typeConfig].label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? <div className="col-span-full py-20 text-center text-muted-foreground">Nenhum material encontrado.</div> :
          filtered.map((m) => {
            const cfg = typeConfig[m.materialtype as keyof typeof typeConfig] || typeConfig.link;
            const Icon = cfg.icon;
            return (
              <div key={m.id} className="bg-card shadow-card rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm leading-tight">{m.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description || "Sem descrição"}</div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">{new Date(m.createdat).toLocaleDateString()}</span>
                  <a
                    href={m.contenturl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    {m.materialtype === "link" || m.materialtype === "video" ? <ExternalLink className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                    {m.materialtype === "link" || m.materialtype === "video" ? "Abrir" : "Baixar"}
                  </a>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
