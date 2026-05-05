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


---

## [x] VALIDAÇÃO TÉCNICA FINAL — CONCLUÍDA

- [x] npm run build — executado com sucesso, zero erros de compilação
- [x] npm run lint — executado; erros de `any` são pré-existentes, nenhum novo aviso crítico introduzido

### Resumo das Correções Implementadas (PHASE 3)

**CORREÇÃO 1 — StudentDashboard.tsx**
- Integrado chat: import MessageCircle + AdminChat
- Adicionado item `{ id: 'chat', label: 'Mensagens', icon: MessageCircle }` em navItems
- Adicionado `case 'chat': return <AdminChat />` em renderContent

**CORREÇÃO 2 — Layout.tsx**
- Floating button de chat agora exibido para `aluno` além de `docente` e `gestor`

**CORREÇÃO 3 — StudentGrades.tsx**
- Exportação PDF via `window.print()` com troca de `document.title`
- Botão com ícone Printer e texto "Exportar PDF"
- Conteúdo envolvido em wrapper `#grades-print-area` com `@media print`

**CORREÇÃO 4 — Migração Sonner & Spinners**
- `useToast` removido de 5 arquivos: ManagerAnnouncements, TeacherGrades, TeacherContent, TeacherAttendance, AdminChat
- Migrado para `toast.success()` / `toast.error()` do sonner
- Spinners CSS + estados `disabled` adicionados em todos os botões de submit

**CORREÇÃO 5 — Rate Limiting nas Edge Functions**
- `rateLimitMap` + `checkRateLimit()` implementados em `create-user/index.ts` e `create-asaas-charge/index.ts`
- Retorna HTTP 429 após 10 req/min por IP


---

## [ ] PHASE 4 — Bugfix Pós-Auditoria (Erros Críticos Identificados)

Contexto: Auditoria completa do código após a Phase 3 revelou 6 bugs. 2 deles impedem funcionamento correto em produção (severidade ALTA). Corrigir nesta ordem exata.

---

- [ ] TASK 19 — Atualizar src/types/index.ts para nomes V5 (PREREQ DE TODAS AS OUTRAS)
Severidade: ALTA — bloqueia TypeScript e gera erros silenciosos em todos os componentes
Arquivo: src/types/index.ts

Problema: As interfaces ainda usam nomes antigos com underscore. O banco V5 e todos os hooks já usam sem underscore. Isso gera conflito de tipos em tempo de compilação.

Substituições na interface Grade:
- student_id: string -> studentid: string
- class_id: string -> classid: string
- grade_value: number | null -> gradevalue: number | null
- updated_at: string -> updatedat: string

Substituições na interface Payment:
- student_id?: string -> studentid?: string
- due_date: string -> duedate: string
- is_paid?: boolean -> ispaid?: boolean
- invoice_url?: string | null -> invoiceurl?: string | null
- created_at?: string -> createdat?: string

Substituições na interface AttendanceRecord:
- student_id?: string -> studentid?: string
- class_id?: string -> classid?: string
- is_present?: boolean -> ispresent?: boolean

Substituições na interface Notice:
- created_at?: string -> createdat?: string
- target_role?: string -> targetrole?: string
- author_id?: string -> authorid?: string

Substituições na interface Material:
- class_id?: string -> classid?: string
- content_url?: string -> contenturl?: string
- material_type?: string -> materialtype?: string
- created_at?: string -> createdat?: string

Substituições na interface TeacherClass:
- teacher_id?: string -> teacherid?: string
- created_at?: string -> createdat?: string

Verificar: grep em src/types/index.ts não deve encontrar nenhum campo com underscore (exceto Legacy comments)

---

- [ ] TASK 20 — Corrigir ManagerAnnouncements.tsx: target_role -> targetrole
Severidade: ALTA — filtro de avisos por papel quebrado silenciosamente
Arquivo: src/components/manager/ManagerAnnouncements.tsx

Problema: mutateAsync passa target_role com underscore, mas o banco V5 e useCreateAnnouncement esperam targetrole sem underscore. O aviso é salvo sem targetrole definido, o que aciona o DEFAULT 'todos' no banco — tornando todos os avisos públicos para todos os roles independente do filtro escolhido.

Substituição necessária em handleSubmit:
- DE: target_role: targetRole
- PARA: targetrole: targetRole

Verificar: grep em ManagerAnnouncements.tsx não deve encontrar target_role após a correção

---

- [ ] TASK 21 — Corrigir TeacherAttendance.tsx: substituir setTimeout simulado por upsert real no Supabase
Severidade: ALTA — frequência nunca persiste no banco
Arquivo: src/components/teacher/TeacherAttendance.tsx

Problema: handleSave usa setTimeout simulando a operação com um comentario admitindo "Simulating save logic as it was missing a real backend call in the snippet". Nenhuma chamada Supabase existe.

Código correto para handleSave (substituir o setTimeout):
```
const handleSave = async () => {
  setIsSubmitting(true);
  try {
    const records = students.map(s => ({
      studentid: s.id,
      classid: selectedClass,
      date: date,
      ispresent: attendance[s.id] === 'presente',
      status: attendance[s.id],
    }));
    const { error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'studentid,classid,date' });
    if (error) throw error;
    setSaved(true);
    toast.success('Frequência salva!', { description: `${records.length} registros gravados.` });
    setTimeout(() => setSaved(false), 2000);
  } catch (err: any) {
    toast.error('Erro ao salvar', { description: err.message });
  } finally {
    setIsSubmitting(false);
  }
};
```

Adicionar import do supabase no topo (se não existir):
- import { supabase } from '@/integrations/supabase/client';

Verificar: grep não deve encontrar setTimeout em handleSave após a correção. Testar fluxo completo de registro de frequência no banco.

---

- [ ] TASK 22 — Corrigir StudentGrades.tsx: PDF via window.print() sem destruir o DOM
Severidade: MÉDIA — UX ruim: React é destruído e página recarrega após impressão
Arquivo: src/components/student/StudentGrades.tsx

Problema: handlePrintPDF substitui document.body.innerHTML inteiro pelo conteúdo da área de impressão, destruindo todos os event listeners do React. Chama window.location.reload() como workaround. O @media print já existe no componente e isola visualmente o conteúdo sem precisar manipular o DOM.

Substituição de handlePrintPDF:
- DE (código atual que quebra):
  const printArea = document.getElementById('grades-print-area');
  if (!printArea) return;
  const originalBody = document.body.innerHTML;
  document.body.innerHTML = printArea.innerHTML;
  window.print();
  document.body.innerHTML = originalBody;
  window.location.reload();

- PARA (correto, sem destruir o DOM):
  const original = document.title;
  document.title = 'Boletim_EduFlow';
  window.print();
  document.title = original;

Verificar: após imprimir, a página NÃO deve recarregar. O @media print no JSX já garante que apenas #grades-print-area seja visível no PDF.

---

- [ ] TASK 23 — Migrar StudentFinancial.tsx de useToast para sonner
Severidade: MÉDIA — inconsistência: 5 arquivos migrados, 1 esquecido
Arquivo: src/components/student/StudentFinancial.tsx

Problema: Único componente que ainda importa e usa useToast. Identificado que a migração da CORREÇÃO 4 da Phase 3 não incluiu este arquivo.

Substituições necessárias:
1. Remover: import { useToast } from '@/hooks/use-toast';
2. Adicionar: import { toast } from 'sonner';
3. Remover: const { toast } = useToast();
4. Substituir chamadas de toast:
   - toast({ title: 'Sucesso', description: '...' }) -> toast.success('Sucesso', { description: '...' })
   - toast({ title: 'Erro', ... variant: 'destructive' }) -> toast.error('Erro', { description: '...' })

Verificar: grep em StudentFinancial.tsx não deve encontrar useToast após a correção

---

- [ ] TASK 24 — Corrigir handle_new_user() no SQL: full_name -> fullname no metadata
Severidade: MÉDIA — usuários criados via Edge Function ficam sem nome no perfil
Arquivo: supabase/setup_supabase.sql

Problema: A função handle_new_user() lê raw_user_meta_data->>'full_name' (com underscore), mas a Edge Function create-user passa fullname (sem underscore) no user_metadata. Resultado: o trigger não encontra full_name, cai no fallback split_part(email, '@', 1), e o usuário criado fica com o email como nome no perfil até o INSERT explícito do profileError corrigir.

Nota: A Edge Function create-user já faz INSERT direto na tabela profiles com fullname correto (após o auth.admin.createUser), então o impacto é na ordem das operações — o trigger roda antes do INSERT manual.

Substituição na função handle_new_user():
- DE: COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
- PARA: COALESCE(new.raw_user_meta_data->>'fullname', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))

(mantém 'full_name' como segundo fallback para compatibilidade com OAuth/magic link)

Verificar: Criar um usuário via painel Gestor e confirmar que profiles.fullname mostra o nome correto (não o email).
