import { Navigate } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { loading: authLoading, mfaLevel } = useAuth();

  if (profileLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">
          Verificando acesso...
        </div>
      </div>
    )
  }

  if (!profile || profile.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  // Enforce MFA for docente and gestor
  if (profile.role !== 'aluno' && mfaLevel !== 'aal2') {
    return <Navigate to="/mfa-challenge" replace />
  }

  return <>{children}</>
}
