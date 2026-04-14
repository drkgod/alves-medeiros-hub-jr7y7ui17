import { useState, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useToast } from '@/hooks/use-toast'

export interface PeticaoFilters {
  status?: string
  modelo?: string
  search?: string
  page?: number
  perPage?: number
}

export function usePeticoes() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const listPeticoes = useCallback(
    async (filters: PeticaoFilters) => {
      setLoading(true)
      try {
        const { status, modelo, search, page = 1, perPage = 10 } = filters

        const filterParts: string[] = []
        if (status && status !== 'Todos') filterParts.push(`status = '${status.toLowerCase()}'`)
        if (modelo && modelo !== 'Todos') filterParts.push(`modelo = '${modelo}'`)
        if (search) filterParts.push(`contrato.nome_signatario ~ '${search}'`)

        const filterString = filterParts.join(' && ')

        const result = await pb.collection('peticoes').getList(page, perPage, {
          filter: filterString,
          sort: '-created',
          expand: 'contrato,modelo',
        })
        return result
      } catch (err) {
        toast({
          title: 'Erro ao buscar petições',
          description: getErrorMessage(err),
          variant: 'destructive',
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const getPeticao = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        return await pb.collection('peticoes').getOne(id, { expand: 'contrato,modelo' })
      } catch (err) {
        toast({
          title: 'Erro ao buscar petição',
          description: getErrorMessage(err),
          variant: 'destructive',
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const listModelos = useCallback(async () => {
    try {
      return await pb.collection('modelos_peticao').getFullList({ sort: 'titulo' })
    } catch (err) {
      return []
    }
  }, [])

  const updateStatus = useCallback(
    async (id: string, newStatus: string) => {
      setLoading(true)
      try {
        const result = await pb.collection('peticoes').update(id, { status: newStatus })
        toast({
          title: 'Status atualizado!',
          description: `A petição foi movida para ${newStatus}.`,
        })
        return result
      } catch (err) {
        toast({
          title: 'Erro ao atualizar status',
          description: getErrorMessage(err),
          variant: 'destructive',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateConteudo = useCallback(
    async (id: string, conteudo_gerado: string) => {
      setLoading(true)
      try {
        const result = await pb.collection('peticoes').update(id, { conteudo_gerado })
        toast({
          title: 'Petição atualizada!',
          description: 'As alterações foram salvas com sucesso.',
        })
        return result
      } catch (err) {
        toast({
          title: 'Erro ao salvar conteúdo',
          description: getErrorMessage(err),
          variant: 'destructive',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  return {
    loading,
    listPeticoes,
    getPeticao,
    listModelos,
    updateStatus,
    updateConteudo,
  }
}
