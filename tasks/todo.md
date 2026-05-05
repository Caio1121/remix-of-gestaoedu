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

## [ ] PHASE 2 — Consistência de Nomes V5 (PRE-REQUISITO DO BANCO) — CONCLUÍDA (FRONTEND)

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

  Arquivo: src/components/manager/ManagerUsers.tsx

  Substituições necessárias:
  - s.full_name -> s.fullname (render dos alunos)
  - s.student_card_id -> s.studentcardid (render dos alunos)
  - t.full_name -> t.fullname (render dos professores)
  - s.full_name?.toLowerCase() -> s.fullname?.toLowerCase() (filtro de busca alunos)
  - t.full_name?.toLowerCase() -> t.fullname?.toLowerCase() (filtro de busca professores)

  Verificar: grep no arquivo não deve encontrar nenhum full_name ou student_card_id após a correção.

- [x] TASK 11 — Corrigir StudentGrades.tsx

  Arquivo: src/components/student/StudentGrades.tsx

  Substituições necessárias:
  - g.grade_value -> g.gradevalue (todas as ocorrências: filter, reduce, comparações)

  Verificar: grep no arquivo não deve encontrar nenhum grade_value após a correção.

- [x] TASK 12 — Corrigir StudentFinancial.tsx

  Arquivo: src/components/student/StudentFinancial.tsx

  A interface local PaymentRecord ainda usa nomes antigos. Substituições necessárias:
  - Interface: due_date: string -> duedate: string
  - Interface: is_paid: boolean -> ispaid: boolean
  - Interface: invoice_url?: string -> invoiceurl?: string
  - p.is_paid -> p.ispaid (todas as ocorrências)
  - p.due_date -> p.duedate (todas as ocorrências)
  - p.invoice_url -> p.invoiceurl (todas as ocorrências)

  Verificar: grep no arquivo não deve encontrar is_paid, due_date ou invoice_url após a correção.

- [x] TASK 13 — Corrigir TeacherGrades.tsx

  Arquivo: src/components/teacher/TeacherGrades.tsx

  Este componente faz upsert DIRETO no Supabase (fora dos hooks). Substituições necessárias:
  - No objeto upsertData: student_id: s.id -> studentid: s.id
  - No objeto upsertData: class_id: selectedClass -> classid: selectedClass
  - No objeto upsertData: grade_value: finalVal -> gradevalue: finalVal
  - No objeto upsertData: updated_at: new Date().toISOString() -> updatedat: new Date().toISOString()
  - No upsert: onConflict: 'student_id,class_id' -> onConflict: 'studentid,classid'

  Verificar: grep no arquivo não deve encontrar student_id, class_id, grade_value ou updated_at após a correção.

- [ ] TASK 14 — Executar setup_supabase.sql V5 no Supabase

  PRE-REQUISITO OBRIGATORIO: Tasks 10, 11, 12 e 13 devem estar CONCLUIDAS antes deste passo.

  O script faz DROP completo de todas as tabelas e recria do zero com os novos nomes sem underscores.
  Os dados existentes serão perdidos (apenas logins demo no banco atual — recriar manualmente).

  Passos:
  1. Acessar Supabase Dashboard -> SQL Editor
  2. Colar o conteúdo do arquivo supabase/setup_supabase.sql (versão V5 limpa)
  3. Executar o script
  4. Verificar na aba Table Editor que todas as tabelas foram criadas com os nomes corretos:
     profiles, classes, enrollments, materials, grades, attendance,
     financialrecords, announcements, chat_messages, audit_log
  5. Recriar os usuários demo no painel Auth do Supabase
  6. Testar login com cada role (aluno, docente, gestor) e confirmar que o sistema funciona

---

## [ ] PHASE 3 — Novos Recursos & UX

Contexto: Features novas. Só iniciar após a PHASE 2 estar 100% concluída e o banco V5 no ar.

- [ ] TASK 15 — Implementar sistema de chat por turmas (Supabase Realtime)
- [ ] TASK 16 — Adicionar exportação de boletim em PDF
- [ ] TASK 17 — Melhorar feedback visual em formulários de edição
- [ ] TASK 18 — Implementar Rate Limiting nas Edge Functions (Segurança)
