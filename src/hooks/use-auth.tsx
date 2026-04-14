import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import type { AuthModel } from 'pocketbase'

interface AuthContextType {
  user: AuthModel | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, pass: string) => Promise<{ error: any }>
  signUp: (data: any) => Promise<{ error: any }>
  signOut: () => void
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthModel | null>(pb.authStore.record)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load check
    setUser(pb.authStore.record)
    setIsLoading(false)

    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser(model)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, pass: string) => {
    try {
      await pb.collection('users').authWithPassword(email, pass)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (data: any) => {
    try {
      await pb.collection('users').create({
        ...data,
        passwordConfirm: data.passwordConfirm || data.password,
      })
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const resetPassword = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
