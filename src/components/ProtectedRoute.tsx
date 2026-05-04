import { Navigate } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
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

  return <>{children}</>
}
