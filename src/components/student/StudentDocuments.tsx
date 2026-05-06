import { useState, useRef } from "react";
import { Upload, File, Trash2, Loader2, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsService } from "@/services/documentsService";
import { handleSupabaseError } from "@/lib/errorHandler";
import { toast } from "sonner";

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
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState(docTypes[0]);
  const [dragging, setDragging] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["student-documents", profile?.id],
    queryFn: async () => {
      const { data, error } = await documentsService.getDocumentsByStudent(profile?.id || "");
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

      // 2. Insert record in DB
      const { error: dbError } = await documentsService.createDocument({
        studentid: profile.id,
        name: file.name,
        doctype: selectedType,
        fileurl: storagePath,
        filesize: formatFileSize(file.size)
      });

      if (dbError) {
        // Rollback: delete from storage
        await supabase.storage.from("student-documents").remove([storagePath]);
        throw dbError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents"] });
      toast.success("Documento enviado!", { description: "Arquivo carregado com sucesso." });
    },
    onError: (err: Error) => {
      toast.error("Erro no upload", { description: err.message });
    },
  });

  const deleteDoc = useMutation({
    mutationFn: async (doc: { id: string; fileurl: string | null }) => {
      // Delete from storage if path exists
      if (doc.fileurl) {
        await supabase.storage.from("student-documents").remove([doc.fileurl]);
      }
      const { error } = await documentsService.deleteDocument(doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents"] });
      toast.success("Documento removido");
    },
  });

  const handleDownload = async (fileUrl: string, fileName: string) => {
    const { data } = await supabase.storage
      .from("student-documents")
      .createSignedUrl(fileUrl, 60 * 5); // 5 min
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      toast.error("Erro ao gerar link");
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
                        {doc.doctype} · {doc.filesize || "–"} · {new Date(doc.createdat).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.cls}`}>{cfg.label}</span>
                    {doc.fileurl && (
                      <button
                        onClick={() => handleDownload(doc.fileurl, doc.name)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Baixar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteDoc.mutate({ id: doc.id, fileurl: doc.fileurl })}
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
