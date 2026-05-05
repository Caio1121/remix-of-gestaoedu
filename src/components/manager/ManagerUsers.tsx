import { useState } from "react";
import { Users, Search, UserCheck, UserX, Plus, X } from "lucide-react";
import { UserRole } from "@/types";
import { useCreateUser, useAllStudents, useAllTeachers } from "@/hooks/useDashboardData";
import { toast } from "sonner";

interface Props {
  kpis: { totalStudents: number; totalTeachers: number; totalClasses: number };
}

export function ManagerUsers({ kpis }: Props) {
  const [tab, setTab] = useState<TabType>("alunos");
  const [search, setSearch] = useState("");
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("aluno");

  const { data: realStudents = [], isLoading: loadingStudents } = useAllStudents();
  const { data: realTeachers = [], isLoading: loadingTeachers } = useAllTeachers();
  const createUserMutation = useCreateUser();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserMutation.mutateAsync({
        email: newUserEmail,
        fullname: newUserName,
        role: newUserRole,
      });
      toast.success("Sucesso!", { description: "Usuário convidado com sucesso." });
      setIsNewUserModalOpen(false);
      setNewUserName("");
      setNewUserEmail("");
    } catch (error: any) {
      toast.error("Erro", {
        description: error.message || "Erro ao criar usuário.",
      });
    }
  };

  type TabType = "alunos" | "docentes";

  const filteredStudents = realStudents
    .filter((s) => s.fullname?.toLowerCase().includes(search.toLowerCase()));

  const filteredTeachers = realTeachers
    .filter((t) => t.fullname?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Usuários & Turmas</h2>
          <p className="text-muted-foreground text-sm">Gerencie alunos, docentes e turmas</p>
        </div>
        <button
          onClick={() => setIsNewUserModalOpen(true)}
          className="flex items-center gap-2 gradient-brand text-primary-foreground text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo usuário
        </button>
      </div>

      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-xl relative">
            <button
              onClick={() => setIsNewUserModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Cadastrar Novo Usuário</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome Completo</label>
                <input
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">E-mail Corporativo</label>
                <input
                  required
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="usuario@edu.br"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cargo / Função</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background"
                >
                  <option value="aluno">Aluno</option>
                  <option value="docente">Docente</option>
                  <option value="gestor">Gestor</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                O usuário receberá um e-mail para confirmar a conta e definir sua senha.
              </p>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="w-full gradient-brand text-primary-foreground py-2 rounded-lg font-bold disabled:opacity-50"
              >
                {createUserMutation.isPending ? "Processando..." : "Criar Usuário"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Alunos", value: kpis.totalStudents, color: "gradient-brand" },
          { icon: UserCheck, label: "Docentes", value: kpis.totalTeachers, color: "bg-accent" },
          { icon: Users, label: "Turmas", value: kpis.totalClasses, color: "bg-success" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card shadow-card rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="flex border-b border-border">
          {(["alunos", "docentes"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(""); }}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "alunos" ? `Alunos (${kpis.totalStudents})` : `Docentes (${kpis.totalTeachers})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder={`Buscar ${tab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* List */}
        {tab === "alunos" ? (
          <div className="divide-y divide-border">
            {loadingStudents ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">Carregando alunos...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                <UserX className="w-8 h-8 opacity-40" />
                <span>Nenhum aluno encontrado</span>
              </div>
            ) : (
              filteredStudents.map((s) => (
                <div key={s.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {s.fullname?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "AL"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{s.fullname}</div>
                      <div className="text-xs text-muted-foreground">{s.studentcardid || "Sem Matrícula"}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-success-light text-success">Ativo</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {loadingTeachers ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">Carregando docentes...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                <UserX className="w-8 h-8 opacity-40" />
                <span>Nenhum docente encontrado</span>
              </div>
            ) : (
              filteredTeachers.map((t) => (
                <div key={t.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold">
                      {t.fullname?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "PR"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{t.fullname}</div>
                      <div className="text-xs text-muted-foreground">Docente Regular</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-success-light text-success">Ativo</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
