import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { SubscriptionPlan, User } from '@/types/models'
import { Session, AuthError } from '@supabase/supabase-js'

interface ProfileUpdate {
  name: string
  phone?: string
}

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: (email: string) => Promise<{ error: AuthError | null }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  initialize: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (data: ProfileUpdate) => Promise<{ error: string | null }>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  error: null,
  isAuthenticated: false,

  signIn: async (email: string) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithOtp({ email })
    
    if (error) {
      set({ 
        loading: false, 
        error: error.message || 'Error al enviar el enlace de autenticación' 
      })
      return { error }
    }
    
    set({ loading: false })
    return { error: null }
  },

  signInWithPassword: async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      set({ 
        loading: false, 
        error: error.message || 'Error al cerrar sesión' 
      })
      return { error }
    }
    
    set({ user: null, session: null, loading: false, isAuthenticated: false })
    return { error: null }
  },

  refreshProfile: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from('users')
      .select('id, email, username, phone, plan, created_at, name')
      .eq('id', session.user.id)
      .single()

    const plan = (profile?.plan as SubscriptionPlan) ?? SubscriptionPlan.FREE

    set({
      user: {
        id: session.user.id,
        name: profile?.name || profile?.username || session.user.email?.split('@')[0] || 'Usuario',
        email: session.user.email || '',
        plan,
        createdAt: new Date(),
      },
      isAuthenticated: true,
    });
  },

  updateProfile: async (data: ProfileUpdate) => {
    try {
      set({ loading: true, error: null })

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        set({ loading: false })
        return { error: 'No hay sesión activa' }
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ name: data.name, phone: data.phone ?? null })
        .eq('id', session.user.id)

      if (updateError) {
        set({ loading: false, error: updateError.message })
        return { error: updateError.message }
      }

      set({
        user: get().user ? { ...get().user!, name: data.name, phone: data.phone } : null,
        loading: false,
      })

      return { error: null }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el perfil'
      set({ loading: false, error: message })
      return { error: message }
    }
  },

  clearError: () => set({ error: null }),

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ 
        session, 
        loading: false,
        isAuthenticated: !!session,
      })

      if (session) {
        await get().refreshProfile()
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ 
          session, 
          loading: false,
          isAuthenticated: !!session,
        })
        if (session) {
          await get().refreshProfile()
        } else {
          set({ user: null, isAuthenticated: false })
        }
        set({ initialized: true })
      })
    } catch (error) {
      set({ 
        loading: false, 
        initialized: true,
        error: 'Error al inicializar la autenticación' 
      })
    }
  }
}))