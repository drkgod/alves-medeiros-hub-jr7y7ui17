import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Search, MapPin, Calendar, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDiagnosticos } from '@/hooks/use-diagnosticos'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { CircularProgress } from '@/components/ui/circular-progress'
import { RecordModel } from 'pocketbase'
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary'

export default function Diagnosticos() {
  const navigate = useNavigate()
  const { getDiagnosticos, loading, error } = useDiagnosticos()
  const [diagnosticos, setDiagnosticos] = useState<RecordModel[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchDiagnosticos = useCallback(
    async (currentPage: number, currentSearch: string, isLoadMore: boolean = false) => {
      try {
        const result = await getDiagnosticos(currentPage, currentSearch)
        if (isLoadMore) {
          setDiagnosticos((prev) => [...prev, ...result.items])
        } else {
          setDiagnosticos(result.items)
        }
        setTotalPages(result.totalPages)
      } catch (err) {
        console.error(err)
      } finally {
        setInitialLoad(false)
      }
    },
    [getDiagnosticos],
  )

  useEffect(() => {
    setPage(1)
    fetchDiagnosticos(1, debouncedSearch, false)
  }, [debouncedSearch, fetchDiagnosticos])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchDiagnosticos(nextPage, debouncedSearch, true)
  }

  const getScoreColor = (score: number) => {
    if (score < 4) return 'text-destructive'
    if (score <= 6) return 'text-amber-500'
    return 'text-emerald-500'
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnósticos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e visualize resultados dos diagnósticos.
          </p>
        </div>
        <Button asChild className="transition-transform active:scale-[0.98] w-full sm:w-auto">
          <Link to="/diagnosticos/novo">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Novo Diagnóstico
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md w-full">
        <label htmlFor="search-diagnosticos" className="sr-only">
          Buscar por município
        </label>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="search-diagnosticos"
          placeholder="Buscar por município..."
          className="pl-9 w-full h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl text-center space-y-4">
          <p className="font-medium text-destructive">Ocorreu um erro ao carregar os dados.</p>
          <Button variant="outline" onClick={() => fetchDiagnosticos(1, debouncedSearch)}>
            Tentar novamente
          </Button>
        </div>
      )}

      <SectionErrorBoundary>
        {initialLoad && !error ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="pb-4 flex justify-between items-center">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !error && diagnosticos.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <CardContent>
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum diagnóstico realizado</h3>
              <p className="text-muted-foreground mb-6">
                Crie seu primeiro diagnóstico para avaliar um município.
              </p>
              <Button asChild>
                <Link to="/diagnosticos/novo">Criar Diagnóstico</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagnosticos.map((diag) => {
                const pontosCriticos = diag.pontos_criticos?.length || 0
                const score = diag.score_geral || 0

                return (
                  <Card
                    key={diag.id}
                    className="hover:border-primary/50 transition-colors cursor-pointer animate-fade-in group flex flex-col"
                    onClick={() => navigate(`/diagnosticos/${diag.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {diag.municipio} - {diag.estado}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground pt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(diag.created), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 py-4 flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                          Score Geral
                        </span>
                        <CircularProgress
                          value={score * 10}
                          size={68}
                          strokeWidth={6}
                          indicatorColor={getScoreColor(score)}
                        >
                          <span className="text-lg font-bold">{score.toFixed(1)}</span>
                        </CircularProgress>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {pontosCriticos > 0 ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {pontosCriticos}{' '}
                            {pontosCriticos === 1 ? 'ponto crítico' : 'pontos críticos'}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                          >
                            Sem pontos críticos
                          </Badge>
                        )}
                        {diag.respostas?.tipo_cliente && (
                          <Badge variant="secondary">{diag.respostas.tipo_cliente}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {page < totalPages && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Carregando...' : 'Carregar mais'}
                </Button>
              </div>
            )}
          </div>
        )}
      </SectionErrorBoundary>
    </div>
  )
}
