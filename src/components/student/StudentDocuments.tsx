import { useState, useRef } from "react";
import { Upload, File, Trash2, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useDashboardData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const docTypes = [
  "RG / CNH",
  "CPF",
  "Comprovante de Residência",
  "Histórico Escolar",
  "Diploma / Certificado",
  "Atestado Médico",
  "Outros",
];

const statusConfig: Record<string, { cls: string; label: string }> = {
  enviado: { cls: "bg-info-light text-info", label: "Enviado" },
  analisando: { cls: "bg-warning-light text-warning", label: "Em análise" },
  aprovado: { cls: "bg-success-light text-success", label: "Aprovado ✓" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StudentDocuments() {
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState(docTypes[0]);
  const [dragging, setDragging] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["student-documents", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("student_documents")
        .select("*")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const uploadDoc = useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.id) throw new Error("Perfil não encontrado");

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) throw new Error("Arquivo excede 10 MB");

      const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) throw new Error("Tipo de arquivo não permitido. Use PDF, JPG ou PNG.");

      const ext = file.name.split(".").pop();
      const storagePath = `${profile.id}/${Date.now()}_${file.name}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("student-documents")
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      // 2. Get signed URL (bucket is private)
      const { data: urlData } = await supabase.storage
        .from("student-documents")
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

      // 3. Insert record in DB
      const { error: dbError } = await supabase.from("student_documents").insert({
        student_id: profile.id,
        name: file.name,
        doc_type: selectedType,
        file_size: formatFileSize(file.size),
        file_url: storagePath,
        status: "enviado",
      });
      if (dbError) {
        // Rollback: delete from storage
        await supabase.storage.from("student-documents").remove([storagePath]);
        throw dbError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents"] });
      toast({ title: "Documento enviado!", description: "Arquivo carregado com sucesso." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    },
  });

  const deleteDoc = useMutation({
    mutationFn: async (doc: { id: string; file_url: string | null }) => {
      // Delete from storage if path exists
      if (doc.file_url) {
        await supabase.storage.from("student-documents").remove([doc.file_url]);
      }
      const { error } = await supabase.from("student_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents"] });
      toast({ title: "Documento removido" });
    },
  });

  const handleDownload = async (fileUrl: string, fileName: string) => {
    const { data } = await supabase.storage
      .from("student-documents")
      .createSignedUrl(fileUrl, 60 * 5); // 5 min
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      toast({ title: "Erro ao gerar link", variant: "destructive" });
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadDoc.mutate(files[0]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Envio de Documentação</h2>
        <p className="text-muted-foreground text-sm">Gerencie seus documentos digitais</p>
      </div>

      <div className="bg-card shadow-card rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Novo Documento</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Tipo de Documento</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full h-10 border border-input bg-background rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {docTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragging ? "border-accent bg-accent-light" : "border-border hover:border-primary/40 hover:bg-muted/30"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadDoc.isPending ? (
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
          ) : (
            <Upload className={`w-8 h-8 mx-auto mb-3 ${dragging ? "text-accent" : "text-muted-foreground"}`} />
          )}
          <div className="text-sm font-medium text-foreground">
            {uploadDoc.isPending ? "Enviando arquivo..." : "Arraste e solte ou clique para enviar"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG · Máximo 10 MB</div>
        </div>
      </div>

      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Documentos Enviados</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : docs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Nenhum documento enviado ainda.</div>
        ) : (
          <div className="divide-y divide-border">
            {docs.map((doc: any) => {
              const cfg = statusConfig[doc.status] || statusConfig.enviado;
              return (
                <div key={doc.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                      <File className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.doc_type} · {doc.file_size || "–"} · {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.cls}`}>{cfg.label}</span>
                    {doc.file_url && (
                      <button
                        onClick={() => handleDownload(doc.file_url, doc.name)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Baixar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteDoc.mutate({ id: doc.id, file_url: doc.file_url })}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
