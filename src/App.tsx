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
import { AuthProvider } from './contexts/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </AuthProvider>
  </QueryClientProvider>
)

export default App
