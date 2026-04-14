import { useState, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export function useDiagnosticos() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getDiagnosticos = useCallback(
    async (page: number = 1, search: string = '') => {
      setLoading(true)
      setError(null)
      try {
        let filter = `user = "${user?.id}"`
        if (search) {
          filter += ` && municipio ~ "${search}"`
        }
        const result = await pb.collection('diagnosticos_prefeitura').getList(page, 20, {
          filter,
          sort: '-created',
        })
        return result
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao carregar os dados.')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user?.id],
  )

  const getDiagnostico = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pb.collection('diagnosticos_prefeitura').getOne(id)
      return result
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao carregar os dados.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

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

  return { createDiagnostico, getDiagnosticos, getDiagnostico, loading, error }
}
