import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

export interface ActivityItem {
  id: string
  type: 'contrato' | 'peticao'
  title: string
  status: string
  created: string
}

export interface DashboardStats {
  pendingContracts: number
  totalPetitions: number
  completedDiagnostics: number
  courseProgress: number
}

export function useDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    setError(null)

    try {
      const [
        pendingContractsRes,
        totalPetitionsRes,
        completedDiagnosticsRes,
        completedVideosRes,
        totalVideosRes,
        recentContractsRes,
        recentPetitionsRes,
      ] = await Promise.all([
        pb
          .collection('contratos_assinados')
          .getList(1, 1, { filter: `status = 'pendente_processamento'` }),
        pb.collection('peticoes').getList(1, 1),
        pb.collection('diagnosticos_prefeitura').getList(1, 1, { filter: `user = '${user.id}'` }),
        pb
          .collection('progresso_video')
          .getList(1, 1, { filter: `user = '${user.id}' && assistido = true` }),
        pb.collection('video_aulas').getList(1, 1),
        pb.collection('contratos_assinados').getList(1, 10, { sort: '-created' }),
        pb.collection('peticoes').getList(1, 10, { sort: '-created' }),
      ])

      const progress =
        totalVideosRes.totalItems > 0
          ? Math.round((completedVideosRes.totalItems / totalVideosRes.totalItems) * 100)
          : 0

      setStats({
        pendingContracts: pendingContractsRes.totalItems,
        totalPetitions: totalPetitionsRes.totalItems,
        completedDiagnostics: completedDiagnosticsRes.totalItems,
        courseProgress: progress,
      })

      const activities: ActivityItem[] = [
        ...recentContractsRes.items.map((item) => ({
          id: item.id,
          type: 'contrato' as const,
          title: item.nome_signatario || 'Sem Nome',
          status: item.status,
          created: item.created,
        })),
        ...recentPetitionsRes.items.map((item) => ({
          id: item.id,
          type: 'peticao' as const,
          title: item.tipo_peticao || 'Petição sem tipo',
          status: item.status,
          created: item.created,
        })),
      ]

      activities.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      setRecentActivity(activities.slice(0, 10))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useRealtime('contratos_assinados', () => fetchData())
  useRealtime('peticoes', () => fetchData())
  useRealtime('diagnosticos_prefeitura', () => fetchData())
  useRealtime('progresso_video', () => fetchData())

  const isEmpty =
    stats &&
    stats.pendingContracts === 0 &&
    stats.totalPetitions === 0 &&
    stats.completedDiagnostics === 0 &&
    recentActivity.length === 0

  return { stats, recentActivity, loading, error, refetch: fetchData, isEmpty: !!isEmpty }
}
