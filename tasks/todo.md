# Project Todo List - EduFlow

## [x] PHASE 1 — Hardening & Performance (V5) — CONCLUIDA

- [x] TASK 1 — Unificar convenção de nomes (fullname, studentcardid)
- [x] TASK 2 — Consolidar UserRole em fonte única
- [x] TASK 3 — Eliminar busca duplicada de perfil (AuthContext -> useProfile)
- [x] TASK 4 — Otimizar performance O(n) em useClassStudents (Map indexing)
- [x] TASK 5 — Implementar staleTime para cache inteligente
- [x] TASK 6 — Migrar credenciais hardcoded para .env (Demo Mode)
- [x] TASK 7 — Extrair constantes (PASSING_GRADE) e limpar .temp do Git
- [x] TASK 8 — Refatorar Index.tsx God Component (Quebrado em hooks e componentes)
- [x] TASK 9 — Substituir select('*') por campos explícitos em hooks principais

---

## [x] PHASE 2 — Consistência de Nomes V5 (PRE-REQUISITO DO BANCO) — CONCLUÍDA

Contexto: A V5 padronizou todos os nomes de colunas do banco removendo underscores.
Os hooks principais já foram atualizados, mas 4 componentes ainda referenciam nomes antigos.
Este phase DEVE ser concluído ANTES de executar o script SQL V5 no Supabase.
Se o SQL for executado antes, o sistema vai quebrar nesses componentes.

Regra geral de substituição:
- full_name -> fullname
- student_card_id -> studentcardid
- grade_value -> gradevalue
- student_id -> studentid
- class_id -> classid
- updated_at -> updatedat
- is_paid -> ispaid
- due_date -> duedate
- invoice_url -> invoiceurl

### Ordem obrigatória de execução:

- [x] TASK 10 — Corrigir ManagerUsers.tsx
- [x] TASK 11 — Corrigir StudentGrades.tsx
- [x] TASK 12 — Corrigir StudentFinancial.tsx
- [x] TASK 13 — Corrigir TeacherGrades.tsx
- [x] TASK 14 — Executar setup_supabase.sql V5 no Supabase
Status: setup_supabase.sql reescrito para V5 (commit 2520c62). Executar no Supabase Dashboard.

---

## [x] PHASE 3 — Novos Recursos & UX — CONCLUÍDA

Contexto: Features novas. Só iniciar após a PHASE 2 estar 100% concluída e o banco V5 no ar.

### Plano de Implementação Detalhado

---

- [x] TASK 15 — Implementar sistema de chat por turmas (Supabase Realtime)

Anlise: Chat de Mensagens Diretas (DM) já está parcialmente implementado.

Estado atual:
- src/hooks/useChat.ts EXISTE - useChatMessages + useSendMessage hooks, nomes V5
- src/components/chat/AdminChat.tsx EXISTE - UI completa DM, V5 compliant, filtragem por role
- src/pages/TeacherDashboard.tsx EXISTE - nav 'chat' + renderContent case
- src/pages/ManagerDashboard.tsx EXISTE - nav 'chat' + renderContent case
- src/pages/StudentDashboard.tsx FALTANDO - nav item + renderContent case
- src/components/Layout.tsx FALTANDO - floating button só mostra para docente || gestor

Arquivos a alterar:
1. src/pages/StudentDashboard.tsx
   - Adicionar MessageCircle aos imports do lucide-react
   - Adicionar { id: 'chat', label: 'Mensagens', icon: MessageCircle } em navItems
   - Adicionar case 'chat': return <div className="p-4 max-w-2xl mx-auto"><AdminChat /></div>
   - Adicionar import { AdminChat } from '../components/chat/AdminChat'
2. src/components/Layout.tsx
   - Mudar condição do floating button:
     DE: userRole === 'docente' || userRole === 'gestor'
     PARA: userRole === 'docente' || userRole === 'gestor' || userRole === 'aluno'

---

- [x] TASK 16 — Adicionar exportação de boletim em PDF

Estratégia: window.print() com CSS print (zero dependências, output limpo)

Arquivo a alterar:
1. src/components/student/StudentGrades.tsx
   - Adicionar botão "Exportar PDF" com ícone Download
   - Implementar função handlePrintPDF:
     const handlePrintPDF = () => {
       const original = document.title;
       document.title = 'Boletim_EduFlow';
       window.print();
       document.title = original;
     };
   - Envolver tabela de notas em <div id="grades-print-area">
   - Adicionar estilos print no bloco <style> inline ou em index.css:
     @media print {
       body > *:not(#grades-print-area) { display: none; }
       #grades-print-area { display: block !important; }
     }

---

- [x] TASK 17 — Melhorar feedback visual em formulários de edição

Biblioteca: sonner (já instalada) - import { toast } from 'sonner'

Arquivos a alterar:
1. src/components/teacher/TeacherGrades.tsx
   - Adicionar Loader2 aos imports do lucide-react
   - import { toast } from 'sonner'
   - const [isSubmitting, setIsSubmitting] = useState(false)
   - No submit handler: setIsSubmitting(true) -> await -> toast.success('Notas salvas!') -> setIsSubmitting(false)
   - Desabilitar botão + mostrar spinner enquanto submete
2. src/components/teacher/TeacherAttendance.tsx
   - Mesmo padrão de TeacherGrades.tsx
3. src/components/teacher/TeacherContent.tsx
   - Mesmo padrão - loading nos botões upload/salvar
4. src/components/manager/ManagerAnnouncements.tsx
   - Substituir useToast por import { toast } from 'sonner'
   - toast({ title: 'Publicado!'... }) -> toast.success('Aviso publicado com sucesso!')
   - toast de erro -> toast.error('Erro ao publicar aviso')

---

- [x] TASK 18 — Implementar Rate Limiting nas Edge Functions (Segurança)

Padrão: IP-based rate limiting com Map em memória (10 req/min por IP)

Arquivos a alterar:
1. supabase/functions/create-asaas-charge/index.ts
2. supabase/functions/create-user/index.ts

Código a adicionar em cada function:

  // Rate limiter - 10 requests per minute per IP
  const rateLimitMap = new Map();
  function checkRateLimit(ip, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= maxRequests) return false;
    entry.count++;
    return true;
  }

    // No início do handler (antes da lógica principal):
  const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

Verificar: Testar com mais de 10 requisições em 1 minuto — deve retornar HTTP 429 com body { error: 'Too many requests' }
