# Project Todo List - EduFlow

## [x] PHASE 1 — Hardening & Performance (V5)
- [x] TASK 1 — Unificar convenção de nomes (fullname, studentcardid)
- [x] TASK 2 — Consolidar UserRole em fonte única
- [x] TASK 3 — Eliminar busca duplicada de perfil (AuthContext -> useProfile)
- [x] TASK 4 — Otimizar performance O(n) em useClassStudents (Map indexing)
- [x] TASK 5 — Implementar staleTime para cache inteligente
- [x] TASK 6 — Migrar credenciais hardcoded para .env (Demo Mode)
- [x] TASK 7 — Extrair constantes (PASSING_GRADE) e limpar .temp do Git
- [x] TASK 8 — Refatorar Index.tsx God Component (Quebrado em hooks e componentes)
- [x] TASK 9 — Substituir select('*') por campos explícitos em hooks principais

- [ ] ## [ ] PHASE 3 — Consistência de Nomes (V5 SQL)

Contexto: A V5 padronizou todos os nomes de colunas do banco removendo underscores.
Os hooks principais foram atualizados, mas 4 componentes ainda referenciam nomes antigos.
Após corrigir esses arquivos, o script setup_supabase.sql V5 pode ser executado com segurança.

### Regra geral de substituição:
- `full_name` → `fullname`
- `student_card_id` → `studentcardid`
- `grade_value` → `gradevalue`
- `student_id` → `studentid`
- `class_id` → `classid`
- `updated_at` → `updatedat`
- `is_paid` → `ispaid`
- `due_date` → `duedate`
- `invoice_url` → `invoiceurl`

---

- [ ] TASK 10 — Corrigir ManagerUsers.tsx

  Arquivo: `src/components/manager/ManagerUsers.tsx`

  Substituições necessárias:
  - `s.full_name` → `s.fullname` (linha de render dos alunos)
  - `s.student_card_id` → `s.studentcardid` (linha de render dos alunos)
  - `t.full_name` → `t.fullname` (linha de render dos professores)
  - `s.full_name?.toLowerCase()` → `s.fullname?.toLowerCase()` (filtro de busca)
  - `t.full_name?.toLowerCase()` → `t.fullname?.toLowerCase()` (filtro de busca)

  Verificar: nenhuma outra referência a `full_name` ou `student_card_id` deve existir no arquivo.

- [ ] TASK 11 — Corrigir StudentGrades.tsx

  Arquivo: `src/components/student/StudentGrades.tsx`

  Substituições necessárias:
  - `g.grade_value` → `g.gradevalue` (todas as ocorrências — filter, reduce, comparações)

  Verificar: nenhuma outra referência a `grade_value` deve existir no arquivo.

- [ ] TASK 12 — Corrigir StudentFinancial.tsx

  Arquivo: `src/components/student/StudentFinancial.tsx`

  A interface local `PaymentRecord` ainda usa nomes antigos. Substituições necessárias:
  - Interface local: `due_date: string` → `duedate: string`
  - Interface local: `is_paid: boolean` → `ispaid: boolean`
  - Interface local: `invoice_url?: string` → `invoiceurl?: string`
  - Todas as referências a `p.is_paid` → `p.ispaid`
  - Todas as referências a `p.due_date` → `p.duedate`
  - Todas as referências a `p.invoice_url` → `p.invoiceurl`

  Verificar: nenhuma outra referência aos nomes antigos deve existir no arquivo.

- [ ] TASK 13 — Corrigir TeacherGrades.tsx

  Arquivo: `src/components/teacher/TeacherGrades.tsx`

  Este componente faz upsert direto no Supabase (fora dos hooks). Substituições necessárias:
  - No objeto `upsertData`: `student_id: s.id` → `studentid: s.id`
  - No objeto `upsertData`: `class_id: selectedClass` → `classid: selectedClass`
  - No objeto `upsertData`: `grade_value: finalVal` → `gradevalue: finalVal`
  - No objeto `upsertData`: `updated_at: new Date().toISOString()` → `updatedat: new Date().toISOString()`
  - No upsert: `onConflict: 'student_id,class_id'` → `onConflict: 'studentid,classid'`

  Verificar: nenhuma outra referência aos nomes antigos deve existir no arquivo.

- [ ] TASK 14 — Executar setup_supabase.sql V5 no Supabase

  PRE-REQUISITO: Tasks 10, 11, 12 e 13 devem estar concluídas antes de executar este passo.

  O script limpo V5 faz DROP de todas as tabelas e recria do zero com os novos nomes.
  Os logins demo precisam ser recriados manualmente no painel Auth do Supabase após a execução.

  Passos:
  1. Acessar Supabase Dashboard → SQL Editor
  2. Colar o conteúdo do arquivo `supabase/setup_supabase.sql` (versão V5)
  3. Executar
  4. Verificar que todas as tabelas foram criadas corretamente na aba Table Editor
  5. Recriar os usuários demo pelo painel Auth

## [ ] PHASE 2 — Novos Recursos & UX
- [ ] Implementar sistema de chat por turmas (Supabase Realtime)
- [ ] Adicionar exportação de boletim em PDF
- [ ] Melhorar feedback visual em formulários de edição
- [ ] Implementar Rate Limiting nas Edge Functions (Segurança)
