import { Link } from 'react-router-dom'
import {
  FileSignature,
  FileText,
  ClipboardCheck,
  PlayCircle,
  FolderOpen,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useDashboard } from '@/hooks/use-dashboard'

const statusColors: Record<string, string> = {
  pendente_processamento: 'bg-yellow-500 text-white hover:bg-yellow-600',
  processado: 'bg-green-500 text-white hover:bg-green-600',
  erro: 'bg-red-500 text-white hover:bg-red-600',
  rascunho: 'bg-gray-500 text-white hover:bg-gray-600',
  revisado: 'bg-blue-500 text-white hover:bg-blue-600',
  finalizado: 'bg-green-500 text-white hover:bg-green-600',
  protocolado: 'bg-purple-500 text-white hover:bg-purple-600',
}

const statusLabels: Record<string, string> = {
  pendente_processamento: 'Pendente',
  processado: 'Processado',
  erro: 'Erro',
  rascunho: 'Rascunho',
  revisado: 'Revisado',
  finalizado: 'Finalizado',
  protocolado: 'Protocolado',
}

export default function Dashboard() {
  const { stats, recentActivity, loading, error, refetch, isEmpty } = useDashboard()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-6">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold tracking-tight">
            Não foi possível carregar o dashboard.
          </h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center animate-fade-in-up">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Bem-vindo ao Alves Medeiros Hub</CardTitle>
            <CardDescription>
              Comece criando seu primeiro diagnóstico ou aguarde os contratos da ZapSign.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/diagnosticos/novo">Criar Diagnóstico</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao Alves Medeiros Hub. Visão geral das suas atividades.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Pendentes</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingContracts || 0}</div>
            <p className="text-xs text-muted-foreground">Aguardando processamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Petições Geradas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPetitions || 0}</div>
            <p className="text-xs text-muted-foreground">Total de petições</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diagnósticos Realizados</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedDiagnostics || 0}</div>
            <p className="text-xs text-muted-foreground">Prefeituras diagnosticadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videoaulas Assistidas</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.courseProgress || 0}%</div>
            <p className="text-xs text-muted-foreground">Progresso geral</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  {item.type === 'contrato' ? (
                    <FileSignature className="h-5 w-5 text-primary" />
                  ) : (
                    <FileText className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.created), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <Badge className={statusColors[item.status] || 'bg-gray-500 text-white'}>
                  {statusLabels[item.status] || item.status}
                </Badge>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma atividade recente.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-medium mt-8 mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Link
            to="/diagnosticos/novo"
            className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
          >
            <Card className="hover:bg-muted/50 transition-colors h-full flex items-center justify-center">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-2 text-center w-full">
                <ClipboardCheck className="h-8 w-8 text-primary mb-2" />
                <span className="font-medium">Novo Diagnóstico</span>
              </CardContent>
            </Card>
          </Link>

          <Link
            to="/peticoes"
            className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
          >
            <Card className="hover:bg-muted/50 transition-colors h-full flex items-center justify-center">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-2 text-center w-full">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <span className="font-medium">Ver Petições</span>
              </CardContent>
            </Card>
          </Link>

          <Link
            to="/drive"
            className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
          >
            <Card className="hover:bg-muted/50 transition-colors h-full flex items-center justify-center">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-2 text-center w-full">
                <FolderOpen className="h-8 w-8 text-primary mb-2" />
                <span className="font-medium">Abrir Drive</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
