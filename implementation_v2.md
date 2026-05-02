# Implementation V2 — EduFlow Bug Fix Document
**Project:** remix-of-gestaoedu  
**Supabase Project (CANONICAL):** https://ykxoaczhixngtoopzsuo.supabase.co  
**Supabase Project REF:** ykxoaczhixngtoopzsuo  
**Date:** 2026-05-02  
**Prepared for:** Google Antigravity Agent  

---

## AGENT RULES — READ FIRST
1. Execute ALL tasks in order from TASK 1 to TASK 10. Do NOT skip any task.
2. Each task has: FILE → PROBLEM → ACTION → VALIDATION
3. The ONE correct Supabase project for ALL references is: `ykxoaczhixngtoopzsuo`
4. Every occurrence of `xypkudvnkllqpbnuirmj` anywhere in the codebase is WRONG — replace with `ykxoaczhixngtoopzsuo`
5. After all tasks are complete, run `npm run build` — must succeed with zero errors

---

## TASK 1 — Fix build-breaking import in TeacherContent.tsx
**Severity:** 🔴 CRITICAL — App does not compile at all until this is fixed.

**FILE:** `src/components/teacher/TeacherContent.tsx`

**PROBLEM:**  
Line 5 imports `supabase` from `'lib/supabase'` — this path does not exist in the project.  
This breaks the Rollup module graph and prevents `useUploadMaterial` from resolving.  
Build error: `useUploadMaterial is not exported by src/hooks/useDashboardData.ts`

**ACTION 1 — Fix the broken import on line 5:**
```typescript
// ❌ DELETE THIS LINE
import supabase from 'lib/supabase'

// ✅ REPLACE WITH THIS LINE
import { supabase } from '@/integrations/supabase/client'
```

**ACTION 2 — Verify line 4 is correct:**
```typescript
import { useProfile, useTeacherClasses, useMaterials, useUploadMaterial } from '@/hooks/useDashboardData'
```

**ACTION 3 — Open `src/hooks/useDashboardData.ts`. Confirm `useUploadMaterial` is exported. If it is missing or not exported, add this function:**
```typescript
export const useUploadMaterial = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (material: {
      class_id: string
      title: string
      description: string
      material_type: string
      content_url: string
    }) => {
      const { data, error } = await supabase
        .from('materials')
        .insert(material)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials', variables.class_id] })
    },
  })
}
```

**VALIDATION:**  
Run `npm run build` — output must end with `✓ built in X.XXs` and zero errors.

---

## TASK 2 — Remove build logs with exposed credentials from git

**Severity:** 🔴 CRITICAL — Supabase project URLs and keys are publicly visible on GitHub inside committed build log files.

**FILES TO PERMANENTLY DELETE FROM REPO:**
- `buildoutput.txt`
- `builderrordetailed.txt`
- `buildlog.txt`

**ACTION 1 — Run these exact commands in the project root terminal:**
```bash
git rm --cached buildoutput.txt builderrordetailed.txt buildlog.txt

echo "buildoutput.txt" >> .gitignore
echo "builderrordetailed.txt" >> .gitignore
echo "buildlog.txt" >> .gitignore

git add .gitignore
git commit -m "security: remove build logs with exposed env vars from repo"
git push
```

**ACTION 2 — Open `supabase/config.toml`. Find any line with `xypkudvnkllqpbnuirmj`. Replace with `ykxoaczhixngtoopzsuo`.**

**ACTION 3 — Open `.env` or `.env.local`. Make sure it contains exactly these values:**
```env
VITE_SUPABASE_URL=https://ykxoaczhixngtoopzsuo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4a29hY3poaXhuZ3Rvb3B6c3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc2OTYsImV4cCI6MjA4ODI5MzY5Nn0.9VndFM05bCe-K1ZkuBT2Qfv1ENGHgF8SiSPTm0Ju9ys
VITE_SUPABASE_PROJECT_ID=ykxoaczhixngtoopzsuo
```

**ACTION 4 — Search entire codebase for `xypkudvnkllqpbnuirmj`. Replace every single occurrence with `ykxoaczhixngtoopzsuo`.**

**VALIDATION:**  
Visit `https://github.com/Caio1121/remix-of-gestaoedu` — the three `.txt` files must not appear. Search GitHub for `xypkudvnkllqpbnuirmj` in the repo — zero results.

---

## TASK 3 — Add authentication route guards to App.tsx

**Severity:** 🔴 CRITICAL — Any unauthenticated user can visit `/gestor` in the browser and see the full manager dashboard. No protection exists.

**ACTION 1 — Create new file `src/components/ProtectedRoute.tsx` with this exact content:**
```typescript
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

type UserRole = 'aluno' | 'docente' | 'gestor'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading')

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setStatus('denied')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === requiredRole) {
        setStatus('ok')
      } else {
        setStatus('denied')
      }
    }
    check()
  }, [requiredRole])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">
          Verificando acesso...
        </div>
      </div>
    )
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
```

**ACTION 2 — Replace the entire content of `src/App.tsx` with:**
```typescript
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import MfaSetup from './pages/MfaSetup'
import MfaChallenge from './pages/MfaChallenge'
import NotFound from './pages/NotFound'
import { ProtectedRoute } from './components/ProtectedRoute'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/aluno"
            element={
              <ProtectedRoute requiredRole="aluno">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/docente"
            element={
              <ProtectedRoute requiredRole="docente">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestor"
            element={
              <ProtectedRoute requiredRole="gestor">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/mfa-setup" element={<MfaSetup />} />
          <Route path="/mfa-challenge" element={<MfaChallenge />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
```

**VALIDATION:**  
Open incognito browser. Navigate to `/gestor` → must redirect to `/`. Navigate to `/aluno` → must redirect to `/`. Log in as `docente`, manually type `/gestor` in URL bar → must redirect to `/`.

---

## TASK 4 — Fix hardcoded password in useCreateUser

**Severity:** 🔴 CRITICAL — Every user created by the manager gets the same password `EduFlowTemp123!`. Anyone who knows this can log into any account.

**ACTION 1 — Create new file `supabase/functions/create-user/index.ts`:**
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Não autorizado')

    // Verify the caller is authenticated and is a gestor
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const {
      data: { user: caller },
    } = await userClient.auth.getUser()
    if (!caller) throw new Error('Não autenticado')

    const { data: callerProfile } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.role !== 'gestor') {
      throw new Error('Apenas gestores podem criar usuários')
    }

    // Use service role key to create user without password
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { email, full_name, role } = await req.json()

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name, role },
    })
    if (error) throw error

    // Send password recovery email so user sets their own password
    await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    })

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

**ACTION 2 — Open `src/hooks/useDashboardData.ts`. Find `useCreateUser`. Replace the entire function:**
```typescript
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (user: {
      email: string
      full_name: string
      role: string
    }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada. Faça login novamente.')

      const { data, error } = await supabase.functions.invoke('create-user', {
        body: user,
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-data'] })
      queryClient.invalidateQueries({ queryKey: ['all-students'] })
      queryClient.invalidateQueries({ queryKey: ['all-teachers'] })
    },
  })
}
```

**ACTION 3 — Deploy the edge function:**
```bash
supabase functions deploy create-user --project-ref ykxoaczhixngtoopzsuo
```

**VALIDATION:**  
Log in as gestor. Create a new test user. The new user must receive a password-setup email. Attempting to log in with `EduFlowTemp123!` must fail with invalid credentials.

---

## TASK 5 — Add av1/av2/av3 columns to DB and fix grade calculation

**Severity:** 🟠 HIGH — Final grades calculated incorrectly. Students scoring exactly 0 have their grade silently dropped from the average.

**ACTION 1 — Run this SQL in the Supabase SQL Editor:**
**URL:** `https://supabase.com/dashboard/project/ykxoaczhixngtoopzsuo/sql`

```sql
-- Add assessment sub-grade columns
ALTER TABLE public.grades
  ADD COLUMN IF NOT EXISTS av1 DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS av2 DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS av3 DECIMAL(4,2);

-- Add valid range constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grades_av1_range') THEN
    ALTER TABLE public.grades
      ADD CONSTRAINT grades_av1_range
      CHECK (av1 IS NULL OR (av1 >= 0 AND av1 <= 10));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grades_av2_range') THEN
    ALTER TABLE public.grades
      ADD CONSTRAINT grades_av2_range
      CHECK (av2 IS NULL OR (av2 >= 0 AND av2 <= 10));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grades_av3_range') THEN
    ALTER TABLE public.grades
      ADD CONSTRAINT grades_av3_range
      CHECK (av3 IS NULL OR (av3 >= 0 AND av3 <= 10));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grades_value_range') THEN
    ALTER TABLE public.grades
      ADD CONSTRAINT grades_value_range
      CHECK (grade_value IS NULL OR (grade_value >= 0 AND grade_value <= 10));
  END IF;
END $$;
```

**ACTION 2 — Open `src/components/teacher/TeacherGrades.tsx`. Replace the `getFinal` function:**
```typescript
// ❌ REMOVE THIS ENTIRE FUNCTION
const getFinal = (sid: string) => {
  const vals = [grades[sid]?.av1, grades[sid]?.av2, grades[sid]?.av3]
    .map(v => parseFloat(v || '0'))
    .filter(v => !isNaN(v) && v > 0)
  if (!vals.length) return null
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

// ✅ REPLACE WITH THIS
const getFinal = (sid: string) => {
  const raw = [grades[sid]?.av1, grades[sid]?.av2, grades[sid]?.av3]
  // Only include fields that were explicitly filled in
  const entered = raw.filter((v) => v !== '' && v !== undefined && v !== null)
  if (entered.length === 0) return null // nothing entered yet — show as pending
  const vals = entered.map((v) => parseFloat(v as string))
  if (vals.some((v) => isNaN(v))) return 'Inválido'
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}
```

**ACTION 3 — Open `src/hooks/useDashboardData.ts`. Find `useCoursePerformance`. Update the Supabase query and calculation:**
```typescript
// ❌ WRONG QUERY — columns did not exist before this task
.select('grade_value, av1, av2, av3, student_id, classes(name)')

// ✅ CORRECT QUERY
.select('grade_value, av1, av2, av3, student_id, class_id, classes!inner(name)')
```

Also replace the average calculation inside `useCoursePerformance`:
```typescript
data?.forEach((g: any) => {
  const className = g.classes?.name || 'Geral'
  if (!groupedByClass[className]) {
    groupedByClass[className] = { sum: 0, count: 0, students: new Set<string>() }
  }
  // Use av1/av2/av3 if available, fall back to grade_value
  const avgs = [g.av1, g.av2, g.av3].filter((v) => v !== null && v !== undefined)
  const gradeVal =
    avgs.length > 0
      ? avgs.reduce((s: number, v: any) => s + Number(v), 0) / avgs.length
      : Number(g.grade_value) || 0

  groupedByClass[className].sum += gradeVal
  groupedByClass[className].count += 1
  groupedByClass[className].students.add(g.student_id)
})
```

**VALIDATION:**  
Enter AV1=0 → final must show `0.0`.  
Enter AV1=8, leave AV2 empty → final must show `8.0` (not `4.0`).  
Enter AV1=8, AV2=6 → final must show `7.0`.  
Manager reports → course performance chart must show real averages, not all zeros.

---

## TASK 6 — Fix Realtime chat: remove polling conflict and fix message filter

**Severity:** 🟠 HIGH — Sent messages not received in real time. Memory leak every time chat component mounts.

**FILE:** `src/hooks/useDashboardData.ts`

**ACTION — Find the entire `useChatMessages` function and replace it completely:**
```typescript
export const useChatMessages = (receiverId: string | null) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!receiverId) return

    let currentUserId: string | null = null
    supabase.auth.getUser().then(({ data: { user } }) => {
      currentUserId = user?.id ?? null
    })

    const channel = supabase
      .channel(`chat-${receiverId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload: any) => {
          const msg = payload.new
          // Only refresh if message belongs to this exact conversation
          const isRelevant =
            (msg.sender_id === currentUserId && msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId && msg.receiver_id === currentUserId)
          if (isRelevant) {
            queryClient.invalidateQueries({ queryKey: ['chat', receiverId] })
          }
        }
      )
      .subscribe()

    // Critical: clean up subscription on unmount to prevent memory leaks
    return () => {
      supabase.removeChannel(channel)
    }
  }, [receiverId, queryClient])

  return useQuery({
    queryKey: ['chat', receiverId],
    queryFn: async () => {
      if (!receiverId) return []
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),` +
            `and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      if (error) throw error
      return data ?? []
    },
    enabled: !!receiverId,
    // NO refetchInterval — Realtime handles all live updates
  })
}
```

**VALIDATION:**  
Open two browser tabs with different users logged in. Send a message in tab 1 → must appear in tab 2 within 1 second without any page refresh. Open DevTools → Network tab — no repeated HTTP requests to Supabase every 5 seconds.

---

## TASK 7 — Fix attendance percentage to read `status` field

**Severity:** 🟠 HIGH — Attendance percentages are wrong because the code reads `is_present` (old boolean) instead of `status` (canonical field after SQL v3.2).

**FILE:** `src/hooks/useDashboardData.ts`

**ACTION — Search the ENTIRE file for `a.is_present` and replace every single occurrence:**
```typescript
// ❌ FIND ALL OCCURRENCES OF THIS PATTERN:
studentAtts.filter(a => a.is_present)
// OR
.filter(a => a.is_present)

// ✅ REPLACE EVERY OCCURRENCE WITH:
studentAtts.filter(a => a.status === 'presente')
// OR
.filter(a => a.status === 'presente')
```

**ACTION — Specifically in `