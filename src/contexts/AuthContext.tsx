import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { UserProfile } from '@/types'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  mfaLevel: 'aal1' | 'aal2' | 'aal3' | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  mfaLevel: null,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mfaLevel, setMfaLevel] = useState<'aal1' | 'aal2' | 'aal3' | null>(null)
  const navigate = useNavigate()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, fullname, role, studentcardid, cpf')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const checkMfa = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!error && data) {
      setMfaLevel(data.currentLevel as any);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setMfaLevel(null);
    navigate('/');
  };

  useEffect(() => {
    // Carregamento inicial da sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id);
        checkMfa();
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setMfaLevel(null);
        setLoading(false);
        return;
      }

      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
          await checkMfa();
        }
      }

      if (event === 'USER_UPDATED' && !session) {
        toast.error("Sessão expirada. Faça login novamente.");
        navigate('/');
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, profile, loading, mfaLevel, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
