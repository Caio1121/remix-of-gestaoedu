import { useState } from "react";
import { FileText, Film, Link2, Presentation, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeacherClasses, useMaterials, useUploadMaterial } from "@/hooks/useDashboardData";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const typeConfig = {
  pdf: { icon: FileText, color: "bg-destructive-light text-destructive" },
  video: { icon: Film, color: "bg-info-light text-info" },
  link: { icon: Link2, color: "bg-accent-light text-accent" },
  slide: { icon: Presentation, color: "bg-warning-light text-warning" },
};

export function TeacherContent() {
  const { data: profile } = useProfile();
  const { data: classes, isLoading: classesLoading } = useTeacherClasses(profile?.id);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const { data: materials, isLoading: materialsLoading, refetch } = useMaterials(selectedClassId || undefined);
  const uploadMaterial = useUploadMaterial();

  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"pdf" | "video" | "link" | "slide">("pdf");
  const [contentUrl, setContentUrl] = useState("");

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${selectedClassId}/${fileName}`;

      const { error } = await supabase.storage
        .from('materials')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      setContentUrl(publicUrl);
      toast.success("Upload concluído", { description: "Arquivo carregado com sucesso!" });
    } catch (error: any) {
      toast.error("Falha no upload", { description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedClassId || !title || !contentUrl) {
      toast.error("Campos incompletos", { description: "Preencha todos os campos e anexe um arquivo ou link." });
      return;
    }

    setIsSubmitting(true);

    try {
      await uploadMaterial.mutateAsync({
        classid: selectedClassId,
        title,
        description,
        materialtype: type,
        contenturl: contentUrl
      });
      toast.success("Publicado", { description: "Material publicado com sucesso!" });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setContentUrl("");
      refetch();
    } catch (error: any) {
      toast.error("Falha na publicação", { description: error?.message ?? "Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (!error) {
      toast.success("Removido", { description: "Material removido com sucesso." });
      refetch();
    } else {
      toast.error("Erro ao remover", { description: error.message });
    }
  };

  if (classesLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Conteúdo / Aulas</h2>
          <p className="text-muted-foreground text-sm">Gerencie materiais e planejamento de aulas</p>
        </div>
        <div className="flex gap-3">
          <select
            className="h-10 border border-input bg-background rounded-lg px-3 text-sm"
            onChange={(e) => setSelectedClassId(e.target.value)}
            value={selectedClassId || ""}
          >
            <option value="">Selecione a Turma</option>
            {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button onClick={() => setShowForm(!showForm)} className="gradient-brand text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Novo Material
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card shadow-card rounded-xl p-5 border border-primary/20 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-4">Adicionar novo material</h3>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Título</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Aula 13 — Amortização"
                className="w-full h-10 border border-input bg-background rounded-lg px-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as any)}
                className="w-full h-10 border border-input bg-background rounded-lg px-3 text-sm">
                <option value="pdf">PDF</option>
                <option value="slide">Slide</option>
                <option value="video">Vídeo</option>
                <option value="link">Link</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fonte do Conteúdo</label>
              <div className="space-y-3">
                <input
                  type="file"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  disabled={isUploading || !selectedClassId}
                />
                <div className="flex items-center gap-2">
                  <div className="h-[1px] flex-1 bg-border"></div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Ou link externo</span>
                  <div className="h-[1px] flex-1 bg-border"></div>
                </div>
                <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://youtube.com/... ou URL do arquivo"
                  className="w-full h-10 border border-input bg-background rounded-lg px-3 text-sm focus:ring-primary"
                  disabled={isUploading} />
                {isUploading && <p className="text-xs text-primary animate-pulse font-medium">Enviando arquivo para o servidor...</p>}
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição (opcional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                className="w-full h-20 border border-input bg-background rounded-lg p-3 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" disabled={isSubmitting || isUploading} onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handlePublish} disabled={isSubmitting || isUploading} className="gradient-brand text-primary-foreground min-w-[140px] flex items-center justify-center gap-2">
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isSubmitting ? "Publicando..." : "Publicar Material"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Materiais Publicados ({materials?.length || 0})</h3>
        </div>
        <div className="divide-y divide-border">
          {materialsLoading ? <div className="p-5 text-sm text-center">Carregando...</div> :
            materials?.map((item) => {
              const cfg = typeConfig[item.material_type as keyof typeof typeConfig] || typeConfig.link;
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description || "Sem descrição"} · {new Date(item.created_at || "").toLocaleDateString()}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
