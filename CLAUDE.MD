# CLAUDE.md — Agent System Prompt

## Project Context
**EduFlow** — Plataforma SaaS de gestão educacional para alunos, professores e gestores.

- **Stack**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui.
- **Backend**: Supabase (Auth + Postgres + Storage + Edge Functions).
- **State Management**: TanStack Query v5.
- **Testing**: Vitest.
- **Hooks Architecture**: Domain-separated (ver `src/hooks/`).

---

## Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Test single**: `npm run test -- src/test/example.test.ts`
- **Test all**: `npm run test`
- **Lint**: `npm run lint`
- **Type check**: `npm run build` (tsc via vite build)

---

## Architecture
- `src/hooks/` → Domain hooks (useProfile, useTeacherData, etc.)
- `src/components/teacher/` → TeacherClasses, ClassCard, CreateClassModal
- `src/components/student/` → Student panel components
- `src/components/manager/` → Manager panel components
- `src/pages/` → One page per role dashboard + auth pages
- `src/contexts/` → AuthContext (auth state + role detection)
- `src/types/index.ts` → Shared domain types
- `src/integrations/supabase/client.ts` → Supabase client instance
- `supabase/functions/` → Edge Functions (Deno runtime)
- `supabase/setup/supabase.sql` → Full idempotent schema (v3.3)
- `src/hooks/useDashboardData.ts` → **BARREL RE-EXPORT ONLY**, do not add logic here.

---

## Workflow Orchestration

### 1. Planning & Task Management
- **Plan First**: Write plan to `tasks/todo.md` before touching any file.
- **One Concern per Commit**: Never mix refactor + feature + fix in the same commit.
- **Commit Format**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- **Verify Before Done**: Prove it works. Run tests, check logs.

### 2. Self-Improvement Loop
- **Capture Lessons**: After any correction or critical fix, update `tasks/lessons.md`.
- **Prevention**: Write rules for yourself that prevent the same mistake.

### 3. Subagent Strategy
- Use subagents for research, exploration, and parallel analysis to keep main context clean.

---

## Rules & Constraints
- **No useDashboardData**: Never import from `useDashboardData.ts` in new code — use domain hooks directly.
- **Hook Wrapping**: Always wrap hooks with `() =>` — never call useQuery/useMutation at module level.
- **Invalidation**: All mutations must call `queryClient.invalidateQueries` for affected keys.
- **Security**: RLS enabled on all tables. **NEVER** use service role key on the frontend.
- **Attendance**: `ispresent` is deprecated — always use `status`.
- **Storage**: Use signed URLs for student documents.
- **SQL Integrity**: Never modify `supabase/setup/supabase.sql` without testing first.
- **Out of Scope**: Do not modify `src/components/ui/`, auto-generated types, or `.env` files.

---

## Core Principles
- **Simplicity First**: Minimal impact, maximum clarity.
- **No Laziness**: Find root causes. No temporary hacks.
- **No Silent Failures**: Flag partial output or uncertainty explicitly.