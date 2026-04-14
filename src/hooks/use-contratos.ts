import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useDebounce } from './use-debounce'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { RecordModel } from 'pocketbase'

export interface Stats {
  total: number
  pendentes: number
  processados: number
  erros: number
}

export function useContratos() {
  const [data, setData] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [status, setStatus] = useState<string>('todos')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [stats, setStats] = useState<Stats>({ total: 0, pendentes: 0, processados: 0, erros: 0 })

  useEffect(() => {
    setPage(1)
  }, [status, debouncedSearch])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filters: string[] = []

      if (status && status !== 'todos') {
        filters.push(`status = "${status}"`)
      }

      if (debouncedSearch) {
        filters.push(`(nome_signatario ~ "${debouncedSearch}" || cpf ~ "${debouncedSearch}")`)
      }

      const filterStr = filters.length > 0 ? filters.join(' && ') : ''

      const [result, all, pendentes, processados, erros] = await Promise.all([
        pb.collection('contratos_assinados').getList(page, 20, {
          filter: filterStr,
          sort: '-created',
          expand: 'peticoes_via_contrato',
        }),
        pb.collection('contratos_assinados').getList(1, 1),
        pb
          .collection('contratos_assinados')
          .getList(1, 1, { filter: `status = "pendente_processamento"` }),
        pb.collection('contratos_assinados').getList(1, 1, { filter: `status = "processado"` }),
        pb.collection('contratos_assinados').getList(1, 1, { filter: `status = "erro"` }),
      ])

      setData(result.items)
      setTotalPages(result.totalPages || 1)
      setStats({
        total: all.totalItems,
        pendentes: pendentes.totalItems,
        processados: processados.totalItems,
        erros: erros.totalItems,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [page, status, debouncedSearch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useRealtime('contratos_assinados', () => {
    fetchData()
  })

  const getContrato = useCallback(async (id: string) => {
    return await pb.collection('contratos_assinados').getOne(id, {
      expand: 'peticoes_via_contrato',
    })
  }, [])

  return {
    data,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    totalPages,
    stats,
    refetch: fetchData,
    getContrato,
  }
}
