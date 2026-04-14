import { useState } from 'react'
import { useVideoaulas } from '@/hooks/use-videoaulas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { type VideoAula } from '@/services/videoaulas'
import { cn } from '@/lib/utils'

export default function Videoaulas() {
  const {
    modulos,
    loading,
    error,
    globalProgress,
    getModuloProgress,
    isVideoWatched,
    markAsWatched,
    reload,
  } = useVideoaulas()
  const [selectedVideo, setSelectedVideo] = useState<VideoAula | null>(null)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Erro ao carregar videoaulas</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={reload}>Tentar Novamente</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (modulos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fade-in-up">
        <PlayCircle className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold tracking-tight">Nenhuma videoaula disponível</h2>
        <p className="text-muted-foreground">As videoaulas serão adicionadas em breve.</p>
      </div>
    )
  }

  const handleVideoClick = (video: VideoAula) => {
    setSelectedVideo(video)
  }

  const handleMarkAsWatched = async () => {
    if (!selectedVideo) return
    await markAsWatched(selectedVideo.id)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Videoaulas</h1>
        <p className="text-muted-foreground mt-2">Treinamentos e capacitação para a equipe.</p>
      </div>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm text-muted-foreground">
              {globalProgress.watched} de {globalProgress.total} aulas concluídas (
              {globalProgress.percentage}%)
            </span>
          </div>
          <Progress value={globalProgress.percentage} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {modulos.map((modulo) => {
          const progress = getModuloProgress(modulo.nome)
          return (
            <Card key={modulo.nome} className="flex flex-col">
              <CardHeader>
                <CardTitle>{modulo.nome}</CardTitle>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-muted-foreground">
                      {progress.watched} de {progress.total} concluídas
                    </span>
                    <span className="font-medium">{progress.percentage}%</span>
                  </div>
                  <Progress value={progress.percentage} className="h-1.5" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {modulo.videos.map((video) => {
                  const watched = isVideoWatched(video.id)
                  return (
                    <div
                      key={video.id}
                      onClick={() => handleVideoClick(video)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors group',
                        watched ? 'bg-muted/50 hover:bg-muted' : 'hover:bg-accent',
                      )}
                    >
                      {watched ? (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            watched && 'text-muted-foreground line-through',
                          )}
                        >
                          {video.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground">{video.duracao_minutos}min</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.titulo}</DialogTitle>
            <DialogDescription>{selectedVideo?.modulo}</DialogDescription>
          </DialogHeader>

          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <iframe
                  src={selectedVideo.url_video}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="flex justify-end">
                {isVideoWatched(selectedVideo.id) ? (
                  <Button variant="secondary" disabled className="gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Concluída
                  </Button>
                ) : (
                  <Button onClick={handleMarkAsWatched} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Marcar como assistida
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
