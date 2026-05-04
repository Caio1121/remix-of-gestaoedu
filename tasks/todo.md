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

## [ ] PHASE 2 — Novos Recursos & UX
- [ ] Implementar sistema de chat por turmas (Supabase Realtime)
- [ ] Adicionar exportação de boletim em PDF
- [ ] Melhorar feedback visual em formulários de edição
- [ ] Implementar Rate Limiting nas Edge Functions (Segurança)