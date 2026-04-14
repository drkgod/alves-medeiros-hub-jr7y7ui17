import pb from '@/lib/pocketbase/client'

export interface VideoAula {
  id: string
  modulo: string
  titulo: string
  url_video: string
  duracao_minutos: number
  ordem: number
}

export interface ProgressoVideo {
  id: string
  video: string
  user: string
  assistido: boolean
  progresso_percentual: number
}

export const getVideoAulas = async () => {
  return pb.collection('video_aulas').getFullList<VideoAula>({
    sort: 'ordem',
  })
}

export const getProgressoVideos = async (userId: string) => {
  return pb.collection('progresso_video').getFullList<ProgressoVideo>({
    filter: `user = "${userId}"`,
  })
}

export const markVideoAsWatched = async (videoId: string, userId: string, progressoId?: string) => {
  const data = {
    video: videoId,
    user: userId,
    assistido: true,
    progresso_percentual: 100,
  }

  if (progressoId) {
    return pb.collection('progresso_video').update<ProgressoVideo>(progressoId, data)
  } else {
    return pb.collection('progresso_video').create<ProgressoVideo>(data)
  }
}
