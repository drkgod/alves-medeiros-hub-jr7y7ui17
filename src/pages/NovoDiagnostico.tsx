import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDiagnosticos } from '@/hooks/use-diagnosticos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary'

const ESTADOS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

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

const defaultFormData: Record<string, any> = {
  municipio: '',
  estado: 'RN',
  populacao_estimada: '',
  tipo_cliente: '',
}
AREAS.forEach((a) => a.fields.forEach((f) => (defaultFormData[f.key] = 5)))

const getScoreColor = (score: number) => {
  if (score < 4) return 'text-destructive'
  if (score <= 6) return 'text-amber-500'
  return 'text-primary'
}

export default function NovoDiagnostico() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { createDiagnostico, loading } = useDiagnosticos()

  const [step, setStep] = useState(1)
  const [apiError, setApiError] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('diagnostico_rascunho')
    return saved ? JSON.parse(saved) : defaultFormData
  })

  useEffect(() => {
    localStorage.setItem('diagnostico_rascunho', JSON.stringify(formData))
  }, [formData])

  const currentArea = AREAS.find((a) => a.id === step)
  const isStep1Valid = !!(formData.municipio && formData.estado && formData.tipo_cliente)

  const getAverages = () => {
    const scores: Record<string, number> = {}
    AREAS.forEach((area) => {
      scores[area.title] = area.fields.reduce((acc, f) => acc + Number(formData[f.key]), 0) / 4
    })
    const score_geral = Object.values(scores).reduce((a, b) => a + b, 0) / AREAS.length
    const pontos_criticos = AREAS.filter((a) => scores[a.title] < 5).map((a) => a.title)
    const recomendacoes = AREAS.filter((a) => scores[a.title] < 5).map((a) => a.rec)
    return { scores, score_geral, pontos_criticos, recomendacoes }
  }

  const handleSubmit = async () => {
    const { scores, score_geral, pontos_criticos, recomendacoes } = getAverages()
    try {
      setApiError(false)
      await createDiagnostico({
        municipio: formData.municipio,
        estado: formData.estado,
        respostas: formData,
        scores,
        score_geral,
        pontos_criticos,
        recomendacoes,
      })
      localStorage.removeItem('diagnostico_rascunho')
      toast({ title: 'Diagnóstico salvo com sucesso!' })
      navigate('/diagnosticos')
    } catch {
      setApiError(true)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[720px] mx-auto py-12 px-4">
        <Skeleton className="h-10 w-1/3 mx-auto mb-4" />
        <Skeleton className="h-4 w-1/2 mx-auto mb-12" />
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-1/4 mb-4" />
                <Skeleton className="h-[8px] w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="max-w-[720px] mx-auto py-12 px-4">
        <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-xl text-center space-y-6">
          <p className="font-medium text-lg text-destructive">
            Não foi possível salvar o diagnóstico.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" className="h-[44px]" onClick={() => setApiError(false)}>
              Voltar ao Formulário
            </Button>
            <Button className="h-[44px]" onClick={handleSubmit}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[720px] mx-auto py-8 px-4 md:px-0">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Novo Diagnóstico</h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados abaixo para iniciar um novo diagnóstico.
        </p>
      </div>

      <div className="mb-8">
        <Progress value={(step / 7) * 100} className="h-[4px]" />
        <div className="text-center text-[13px] text-muted-foreground mt-3 font-medium">
          Passo {step} de 7:{' '}
          {step === 1 ? 'Dados do Município' : step === 7 ? 'Revisão' : currentArea?.title}
        </div>
      </div>

      <SectionErrorBoundary>
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
          <h2 className="text-[20px] font-bold mb-6">
            {step === 1
              ? 'Dados Básicos'
              : step === 7
                ? 'Revisão e Confirmação'
                : currentArea?.title}
          </h2>

          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="municipio">
                    Nome do Município <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="municipio"
                    className="h-11"
                    placeholder="Ex: Natal"
                    value={formData.municipio}
                    onChange={(e) => setFormData((p) => ({ ...p, municipio: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">
                    Estado <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(v) => setFormData((p) => ({ ...p, estado: v }))}
                  >
                    <SelectTrigger id="estado" className="h-11">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="populacao">População Estimada</Label>
                  <Input
                    id="populacao"
                    type="number"
                    className="h-11"
                    placeholder="Ex: 50000"
                    value={formData.populacao_estimada}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, populacao_estimada: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.tipo_cliente}
                    onValueChange={(v) => setFormData((p) => ({ ...p, tipo_cliente: v }))}
                  >
                    <SelectTrigger id="tipo" className="h-11">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prefeitura">Prefeitura</SelectItem>
                      <SelectItem value="Câmara Municipal">Câmara Municipal</SelectItem>
                      <SelectItem value="Autarquia">Autarquia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentArea && (
              <div className="space-y-8 animate-fade-in">
                {currentArea.fields.map((field) => (
                  <div key={field.key} className="mb-6">
                    <div className="flex justify-between items-end mb-4">
                      <Label className="text-base font-medium">{field.label}</Label>
                      <span className="text-2xl font-bold text-primary leading-none">
                        {formData[field.key]}
                      </span>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[formData[field.key]]}
                      onValueChange={(val) => setFormData((p) => ({ ...p, [field.key]: val[0] }))}
                      className="mb-3"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                      <span>Crítico</span>
                      <span>Excelente</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 7 &&
              (() => {
                const { scores, score_geral, pontos_criticos } = getAverages()
                return (
                  <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(scores).map(([area, avg]) => (
                        <div
                          key={area}
                          className="p-4 rounded-lg border bg-muted/30 flex flex-col justify-between"
                        >
                          <p className="text-sm text-muted-foreground mb-2">{area}</p>
                          <p className={cn('text-2xl font-bold', getScoreColor(avg))}>
                            {avg.toFixed(1)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-center justify-center p-8 bg-primary/5 border border-primary/20 rounded-xl">
                      <span className="text-lg font-semibold text-muted-foreground mb-2">
                        Score Geral
                      </span>
                      <span className="text-[48px] font-bold text-primary leading-none">
                        {score_geral.toFixed(1)}
                      </span>
                    </div>

                    {pontos_criticos.length > 0 && (
                      <div className="space-y-3 p-6 bg-red-50 dark:bg-red-950 rounded-xl border border-red-100 dark:border-red-900">
                        <h3 className="text-lg font-semibold text-destructive">
                          Pontos Críticos (Abaixo de 5)
                        </h3>
                        <ul className="space-y-2 text-sm text-destructive/90">
                          {pontos_criticos.map((p) => (
                            <li key={p} className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })()}
          </div>

          <div className="flex flex-col-reverse md:flex-row md:justify-between pt-6 border-t mt-8 gap-4">
            <Button
              variant="outline"
              className="h-[44px] w-full md:w-auto px-8"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
            >
              Anterior
            </Button>
            {step < 7 ? (
              <Button
                className="h-[44px] w-full md:w-auto px-8"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !isStep1Valid}
              >
                Próximo
              </Button>
            ) : (
              <Button className="h-[44px] w-full md:w-auto px-8" onClick={handleSubmit}>
                Confirmar
              </Button>
            )}
          </div>
        </div>
      </SectionErrorBoundary>
    </div>
  )
}
