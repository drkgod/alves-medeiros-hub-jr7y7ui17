import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getVideoAulas,
  getProgressoVideos,
  markVideoAsWatched,
  type VideoAula,
  type ProgressoVideo,
} from '@/services/videoaulas'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'

export function useVideoaulas() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [videos, setVideos] = useState<VideoAula[]>([])
  const [progressos, setProgressos] = useState<ProgressoVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      setError(null)
      const [v, p] = await Promise.all([getVideoAulas(), getProgressoVideos(user.id)])
      setVideos(v)
      setProgressos(p)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('progresso_video', () => {
    if (user?.id) {
      getProgressoVideos(user.id).then(setProgressos).catch(console.error)
    }
  })

  const markAsWatched = async (videoId: string) => {
    if (!user?.id) return
    try {
      const progresso = progressos.find((p) => p.video === videoId)
      await markVideoAsWatched(videoId, user.id, progresso?.id)
      toast({ title: 'Aula concluída!', description: 'Seu progresso foi salvo com sucesso.' })
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    }
  }

  const modulos = useMemo(() => {
    const grouped = videos.reduce(
      (acc, video) => {
        if (!acc[video.modulo]) acc[video.modulo] = []
        acc[video.modulo].push(video)
        return acc
      },
      {} as Record<string, VideoAula[]>,
    )
    return Object.entries(grouped).map(([nome, modVideos]) => ({
      nome,
      videos: modVideos.sort((a, b) => a.ordem - b.ordem),
    }))
  }, [videos])

  const globalProgress = useMemo(() => {
    if (videos.length === 0) return { watched: 0, total: 0, percentage: 0 }
    const watched = videos.filter((v) => progressos.find((p) => p.video === v.id)?.assistido).length
    return {
      watched,
      total: videos.length,
      percentage: Math.round((watched / videos.length) * 100),
    }
  }, [videos, progressos])

  const getModuloProgress = useCallback(
    (modulo: string) => {
      const modVideos = videos.filter((v) => v.modulo === modulo)
      if (modVideos.length === 0) return { watched: 0, total: 0, percentage: 0 }
      const watched = modVideos.filter(
        (v) => progressos.find((p) => p.video === v.id)?.assistido,
      ).length
      return {
        watched,
        total: modVideos.length,
        percentage: Math.round((watched / modVideos.length) * 100),
      }
    },
    [videos, progressos],
  )

  const isVideoWatched = useCallback(
    (videoId: string) => {
      return !!progressos.find((p) => p.video === videoId)?.assistido
    },
    [progressos],
  )

  return {
    videos,
    modulos,
    loading,
    error,
    globalProgress,
    getModuloProgress,
    isVideoWatched,
    markAsWatched,
    reload: loadData,
  }
}
