import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useAnnouncements, useCreateAnnouncement } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";

export function ManagerAnnouncements() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("geral");
    const [priority, setPriority] = useState("media");
    const [targetRole, setTargetRole] = useState("docente");

    const { data: announcements, isLoading } = useAnnouncements();
    const createAnnouncementMutation = useCreateAnnouncement();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAnnouncementMutation.mutateAsync({
                title,
                content,
                category,
                priority,
                target_role: targetRole
            });
            toast({ title: "Publicado!", description: "Aviso enviado com sucesso." });
            setIsModalOpen(false);
            setTitle("");
            setContent("");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao publicar aviso",
                description: error?.message ?? "Tente novamente."
            });
        }

    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Comunicados & Avisos</h2>
                    <p className="text-muted-foreground text-sm">Envie avisos para docentes e alunos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 gradient-brand text-white text-sm px-4 py-2 rounded-lg font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Novo Aviso
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card w-full max-w-lg rounded-xl p-6 shadow-xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-muted-foreground">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold mb-4">Criar Comunicado</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Título</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Categoria</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg">
                                        <option value="geral">Geral</option>
                                        <option value="academico">Acadêmico</option>
                                        <option value="financeiro">Financeiro</option>
                                        <option value="evento">Evento</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Público Alvo</label>
                                    <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-primary font-bold">
                                        <option value="docente">Docentes</option>
                                        <option value="aluno">Alunos</option>
                                        <option value="todos">Todos</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-muted-foreground">Conteúdo</label>
                                <textarea required rows={4} value={content} onChange={e => setContent(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                            </div>
                            <button disabled={createAnnouncementMutation.isPending} className="w-full gradient-brand text-white py-2 rounded-lg font-bold">
                                {createAnnouncementMutation.isPending ? "Enviando..." : "Publicar Agora"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {isLoading ? <p>Carregando avisos...</p> : announcements?.map((a: any) => (
                    <div key={a.id} className="bg-card border border-border p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase px-2 py-0.5 bg-muted rounded text-muted-foreground">{a.category}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-foreground">{a.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                        <div className="mt-3 text-[10px] flex items-center gap-2">
                            <span className="text-muted-foreground">Para:</span>
                            <span className="font-bold text-primary uppercase">{a.target_role}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
