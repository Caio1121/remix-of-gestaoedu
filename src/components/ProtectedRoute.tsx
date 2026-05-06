import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { profile, loading, mfaLevel } = useAuth();

  if (loading) {
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
