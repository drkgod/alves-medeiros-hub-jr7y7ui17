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
import { cn } from '@/lib/utils'
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary'

const statusColors: Record<string, string> = {
  pendente_processamento: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  processado: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  erro: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  rascunho: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  revisado: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  finalizado: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  protocolado: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
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
      <div className="space-y-6 animate-pulse">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 border border-border bg-card">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-5 w-1/2 mt-4" />
              <Skeleton className="h-8 w-1/4 mt-1" />
              <Skeleton className="h-4 w-2/3 mt-1" />
            </Card>
          ))}
        </div>
        <Card className="mt-6 border border-border bg-card">
          <div className="p-6 pb-0 mb-4">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex flex-row items-center gap-3 py-3 px-4 border-b border-border last:border-0"
              >
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24 ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </Card>
        <div>
          <Skeleton className="h-6 w-32 mt-8 mb-4" />
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
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
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center animate-fade-in-up px-4">
        <Card className="w-full max-w-md text-center p-6 border-dashed">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-6">
            <ClipboardCheck className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-xl">Bem-vindo ao Alves Medeiros Hub</CardTitle>
            <CardDescription className="text-sm">
              Comece criando seu primeiro diagnóstico ou aguarde os contratos da ZapSign para ver
              atividades aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <Button asChild className="w-full">
              <Link to="/diagnosticos/novo">Criar Novo Diagnóstico</Link>
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

      <SectionErrorBoundary>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-border bg-card">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <FileSignature className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mt-4">Contratos Pendentes</h3>
            <div className="text-3xl font-bold text-foreground mt-1">
              {stats?.pendingContracts || 0}
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">Aguardando processamento</p>
          </Card>

          <Card className="p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-border bg-card">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mt-4">Petições Geradas</h3>
            <div className="text-3xl font-bold text-foreground mt-1">
              {stats?.totalPetitions || 0}
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">Total de petições</p>
          </Card>

          <Card className="p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-border bg-card">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mt-4">
              Diagnósticos Realizados
            </h3>
            <div className="text-3xl font-bold text-foreground mt-1">
              {stats?.completedDiagnostics || 0}
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">Prefeituras diagnosticadas</p>
          </Card>

          <Card className="p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-border bg-card">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mt-4">
              Videoaulas Assistidas
            </h3>
            <div className="text-3xl font-bold text-foreground mt-1">
              {stats?.courseProgress || 0}%
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">Progresso geral</p>
          </Card>
        </div>
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <Card className="mt-6 border border-border bg-card">
          <div className="p-6 pb-0 mb-4">
            <h2 className="text-lg font-semibold">Atividade Recente</h2>
          </div>
          <div className="flex flex-col">
            {recentActivity.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex flex-row items-center gap-3 py-3 px-4 border-b border-border last:border-0"
              >
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                  {item.type === 'contrato' ? (
                    <FileSignature className="w-4 h-4 text-primary" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full border-transparent hover:opacity-80 shrink-0',
                      statusColors[item.status] || statusColors.rascunho,
                    )}
                  >
                    {statusLabels[item.status] || item.status}
                  </Badge>
                </div>
                <p className="text-[13px] text-muted-foreground ml-auto shrink-0">
                  {formatDistanceToNow(new Date(item.created), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Nenhuma atividade recente.
              </div>
            )}
          </div>
        </Card>
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <div>
          <h2 className="text-lg font-medium mt-8 mb-4">Ações Rápidas</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Link
              to="/diagnosticos/novo"
              className="block p-5 rounded-lg border border-border bg-card transition-all duration-200 ease-out hover:border-primary hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <ClipboardCheck className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold mt-2">Novo Diagnóstico</span>
              </div>
            </Link>

            <Link
              to="/peticoes"
              className="block p-5 rounded-lg border border-border bg-card transition-all duration-200 ease-out hover:border-primary hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <FileText className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold mt-2">Ver Petições</span>
              </div>
            </Link>

            <Link
              to="/drive"
              className="block p-5 rounded-lg border border-border bg-card transition-all duration-200 ease-out hover:border-primary hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <FolderOpen className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold mt-2">Abrir Drive</span>
              </div>
            </Link>
          </div>
        </div>
      </SectionErrorBoundary>
    </div>
  )
}
