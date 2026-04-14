import { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export function useDiagnosticos() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createDiagnostico = async (data: Record<string, any>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pb.collection('diagnosticos_prefeitura').create({
        ...data,
        user: user?.id,
      })
      return result
    } catch (err: any) {
      setError(err.message || 'Não foi possível salvar o diagnóstico.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createDiagnostico, loading, error }
}
