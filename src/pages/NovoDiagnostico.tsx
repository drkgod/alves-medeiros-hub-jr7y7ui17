import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDiagnosticos } from '@/hooks/use-diagnosticos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  if (loading)
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )

  if (apiError)
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-6">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg text-center space-y-4">
          <p className="font-medium text-lg">Não foi possível salvar o diagnóstico.</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setApiError(false)}>
              Voltar ao Formulário
            </Button>
            <Button onClick={handleSubmit}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    )

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Diagnóstico</h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados abaixo para iniciar um novo diagnóstico.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Passo {step} de 7</span>
          <span>
            {step === 1 ? 'Dados do Município' : step === 7 ? 'Revisão' : currentArea?.title}
          </span>
        </div>
        <Progress value={(step / 7) * 100} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1
              ? 'Dados Básicos'
              : step === 7
                ? 'Revisão e Confirmação'
                : currentArea?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="municipio">
                  Nome do Município <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="municipio"
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
            <div className="space-y-8">
              {currentArea.fields.map((field) => (
                <div key={field.key} className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-base font-medium">{field.label}</Label>
                    <span className="text-sm font-bold text-primary">{formData[field.key]}</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[formData[field.key]]}
                    onValueChange={(val) => setFormData((p) => ({ ...p, [field.key]: val[0] }))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
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
                <div className="space-y-6 animate-fade-in-up">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(scores).map(([area, avg]) => (
                      <Card
                        key={area}
                        className={avg < 5 ? 'border-destructive/50' : 'bg-muted/50'}
                      >
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-1">{area}</p>
                          <p className={`text-2xl font-bold ${avg < 5 ? 'text-destructive' : ''}`}>
                            {avg.toFixed(1)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="text-lg font-semibold">Score Geral</span>
                      <span className="text-3xl font-bold text-primary">
                        {score_geral.toFixed(1)}
                      </span>
                    </CardContent>
                  </Card>
                  {pontos_criticos.length > 0 && (
                    <div className="space-y-2 p-4 bg-destructive/10 rounded-lg">
                      <h3 className="text-lg font-semibold text-destructive">
                        Pontos Críticos (Abaixo de 5)
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-destructive/80">
                        {pontos_criticos.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })()}

          <div className="flex justify-between pt-6 border-t mt-8">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
              Anterior
            </Button>
            {step < 7 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !isStep1Valid}>
                Próximo
              </Button>
            ) : (
              <Button onClick={handleSubmit}>Confirmar</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
