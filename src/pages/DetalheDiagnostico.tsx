import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDiagnosticos } from '@/hooks/use-diagnosticos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CircularProgress } from '@/components/ui/circular-progress'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronLeft, Calendar, Building, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RecordModel } from 'pocketbase'
import { cn } from '@/lib/utils'

const AREAS = [
  {
    id: 2,
    title: 'Gestão Fiscal e Orçamentária',
    rec: 'Implementar controles orçamentários mais rígidos e aumentar transparência fiscal.',
    fields: [
      { key: 'fiscal_orcamento', label: 'Planejamento Orçamentário' },
      { key: 'fiscal_transparencia', label: 'Transparência Fiscal' },
      { key: 'fiscal_arrecadacao', label: 'Eficiência na Arrecadação' },
      { key: 'fiscal_dividas', label: 'Controle de Dívidas' },
    ],
  },
  {
    id: 3,
    title: 'Gestão de Pessoal',
    rec: 'Revisar plano de cargos e salários e promover capacitação contínua.',
    fields: [
      { key: 'pessoal_folha', label: 'Controle da Folha de Pagamento' },
      { key: 'pessoal_cargos', label: 'Plano de Cargos e Salários' },
      { key: 'pessoal_concursos', label: 'Realização de Concursos' },
      { key: 'pessoal_capacitacao', label: 'Capacitação de Servidores' },
    ],
  },
  {
    id: 4,
    title: 'Licitações e Contratos',
    rec: 'Aperfeiçoar processos licitatórios e fortalecer a fiscalização de contratos.',
    fields: [
      { key: 'licit_processos', label: 'Agilidade nos Processos' },
      { key: 'licit_contratos', label: 'Gestão de Contratos' },
      { key: 'licit_fiscalizacao', label: 'Fiscalização Efetiva' },
      { key: 'licit_registro', label: 'Registro de Preços' },
    ],
  },
  {
    id: 5,
    title: 'Legislação Municipal',
    rec: 'Atualizar legislação orgânica e estatutos municipais.',
    fields: [
      { key: 'legis_organica', label: 'Atualização da Lei Orgânica' },
      { key: 'legis_tributario', label: 'Código Tributário' },
      { key: 'legis_estatuto', label: 'Estatuto dos Servidores' },
      { key: 'legis_complementares', label: 'Leis Complementares' },
    ],
  },
  {
    id: 6,
    title: 'Controle Interno e Compliance',
    rec: 'Estruturar ouvidoria e mecanismos de conformidade e controle de riscos.',
    fields: [
      { key: 'controle_interno', label: 'Estruturação do Controle Interno' },
      { key: 'controle_ouvidoria', label: 'Funcionamento da Ouvidoria' },
      { key: 'controle_conformidade', label: 'Programas de Conformidade' },
      { key: 'controle_riscos', label: 'Gestão de Riscos' },
    ],
  },
]

export default function DetalheDiagnostico() {
  const { id } = useParams<{ id: string }>()
  const { getDiagnostico } = useDiagnosticos()
  const [diag, setDiag] = useState<RecordModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(false)
        const data = await getDiagnostico(id)
        if (mounted) setDiag(data)
      } catch (err) {
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [id, getDiagnostico])

  const getScoreColor = (score: number) => {
    if (score < 4) return 'text-destructive'
    if (score <= 6) return 'text-amber-500'
    return 'text-emerald-500'
  }

  const getProgressColor = (score: number) => {
    if (score < 4) return 'bg-destructive'
    if (score <= 6) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-pulse">
        <div className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <div className="flex flex-col gap-4 bg-card border rounded-xl p-6">
            <Skeleton className="h-8 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !diag) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-xl text-center space-y-6">
          <p className="font-medium text-lg text-destructive">
            Ocorreu um erro ao carregar os dados.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/diagnosticos">Voltar para Diagnósticos</Link>
            </Button>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    )
  }

  const scoreGeral = diag.score_geral || 0
  const scores = diag.scores || {}
  const respostas = diag.respostas || {}
  const recomendacoes = diag.recomendacoes || []
  const pontosCriticosData = AREAS.filter((a) => (scores[a.title] || 0) < 5)

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link to="/diagnosticos">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Detalhes do Diagnóstico</h1>
      </div>

      {/* Header Card */}
      <Card className="bg-card">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {diag.municipio} - {diag.estado}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(diag.created), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
                </div>
                {respostas.tipo_cliente && (
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" />
                    <span>{respostas.tipo_cliente}</span>
                  </div>
                )}
                {respostas.populacao_estimada && (
                  <Badge variant="secondary">População: {respostas.populacao_estimada}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0">
            <span className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              Score Geral
            </span>
            <CircularProgress
              value={scoreGeral * 10}
              size={120}
              strokeWidth={10}
              indicatorColor={getScoreColor(scoreGeral)}
            >
              <span className={cn('text-3xl font-bold', getScoreColor(scoreGeral))}>
                {scoreGeral.toFixed(1)}
              </span>
            </CircularProgress>
          </div>
        </CardContent>
      </Card>

      {/* Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {AREAS.map((area) => {
          const score = scores[area.title] || 0
          return (
            <Card key={area.id} className="overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-semibold text-sm leading-tight">{area.title}</h3>
                  <span className={cn('font-bold text-lg leading-none', getScoreColor(score))}>
                    {score.toFixed(1)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <Progress
                    value={score * 10}
                    className="h-2"
                    indicatorClassName={getProgressColor(score)}
                  />
                  <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                    <span>0</span>
                    <span>10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Pontos Críticos */}
        {pontosCriticosData.length > 0 && (
          <Card className="border-l-4 border-l-destructive shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Atenção Imediata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pontosCriticosData.map((area) => (
                  <div key={area.id} className="bg-destructive/5 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{area.title}</span>
                      <Badge variant="destructive">
                        Score: {(scores[area.title] || 0).toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{area.rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recomendações */}
        {recomendacoes.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recomendacoes.map((rec: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detalhamento Individual */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Área</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {AREAS.map((area) => {
              const areaScore = scores[area.title] || 0
              return (
                <AccordionItem key={area.id} value={`area-${area.id}`}>
                  <AccordionTrigger className="hover:no-underline px-2 hover:bg-muted/50 rounded-md transition-colors">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium text-left">{area.title}</span>
                      <Badge variant="outline" className={cn('ml-2', getScoreColor(areaScore))}>
                        {areaScore.toFixed(1)}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {area.fields.map((field) => {
                        const val = respostas[field.key] || 0
                        return (
                          <div
                            key={field.key}
                            className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{field.label}</span>
                              <span className={cn('font-bold text-sm', getScoreColor(val))}>
                                {val}
                              </span>
                            </div>
                            <Progress
                              value={val * 10}
                              className="h-1.5"
                              indicatorClassName={getProgressColor(val)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button asChild variant="outline" size="lg">
          <Link to="/diagnosticos">Voltar para Diagnósticos</Link>
        </Button>
      </div>
    </div>
  )
}
