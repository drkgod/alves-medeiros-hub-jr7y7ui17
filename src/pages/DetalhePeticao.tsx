import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePeticoes } from '@/hooks/use-peticoes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ArrowLeft, ChevronDown, ChevronRight, Save, Edit3, X, FileCheck } from 'lucide-react'
import { RecordModel } from 'pocketbase'

const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  revisado: 'Revisado',
  finalizado: 'Finalizado',
  protocolado: 'Protocolado',
}
const nextStatusMap: Record<string, { label: string; status: string; color: string }> = {
  rascunho: {
    label: 'Marcar como Revisado',
    status: 'revisado',
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  revisado: {
    label: 'Marcar como Finalizado',
    status: 'finalizado',
    color: 'bg-green-600 hover:bg-green-700 text-white',
  },
  finalizado: {
    label: 'Marcar como Protocolado',
    status: 'protocolado',
    color: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
}

export default function DetalhePeticao() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPeticao, updateStatus, updateConteudo, loading } = usePeticoes()
  const [peticao, setPeticao] = useState<RecordModel | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [isDataOpen, setIsDataOpen] = useState(false)

  const loadData = useCallback(() => {
    if (id) {
      getPeticao(id).then((res) => {
        if (res) {
          setPeticao(res)
          setContent(res.conteudo_gerado)
        }
      })
    }
  }, [id, getPeticao])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    if (!id) return
    await updateConteudo(id, content)
    setIsEditing(false)
    loadData()
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return
    await updateStatus(id, newStatus)
    loadData()
  }

  if (loading && !peticao) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-[500px]" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!peticao) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">Petição não encontrada.</p>
        <Button className="mt-4" onClick={() => navigate('/peticoes')}>
          Voltar
        </Button>
      </div>
    )
  }

  const action = nextStatusMap[peticao.status]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/peticoes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {peticao.expand?.modelo?.titulo || peticao.tipo_peticao}
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span>{peticao.expand?.contrato?.nome_signatario || 'Sem cliente'}</span>
              <span>•</span>
              <Badge variant="outline">{statusLabels[peticao.status]}</Badge>
            </p>
          </div>
        </div>
        {action && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className={action.color}>{action.label}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a alterar o status desta petição para{' '}
                  {statusLabels[action.status]}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusUpdate(action.status)}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="flex-1">
            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-4">
              <CardTitle>Conteúdo da Petição</CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={peticao.status === 'protocolado'}
                >
                  <Edit3 className="mr-2 h-4 w-4" /> Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setContent(peticao.conteudo_gerado)
                    }}
                  >
                    <X className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Salvar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div
                  className="prose dark:prose-invert max-w-none border rounded-md p-6 bg-background shadow-sm min-h-[400px]"
                  dangerouslySetInnerHTML={{
                    __html: peticao.conteudo_gerado || 'Nenhum conteúdo gerado.',
                  }}
                />
              ) : (
                <Textarea
                  className="min-h-[400px] font-mono text-sm leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          <Collapsible
            open={isDataOpen}
            onOpenChange={setIsDataOpen}
            className="border rounded-md p-4 bg-muted/30"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-2 rounded-md transition-colors">
              <span className="font-semibold">Dados Extraídos</span>
              {isDataOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              {Object.entries(peticao.dados_extraidos || {}).map(([key, value]) => (
                <div key={key}>
                  <div className="text-xs text-muted-foreground uppercase mb-1">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="font-medium text-sm">{String(value)}</div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <FileCheck className="h-4 w-4" /> Contrato Vinculado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium">Signatário</div>
                <div className="text-sm text-muted-foreground">
                  {peticao.expand?.contrato?.nome_signatario || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">CPF</div>
                <div className="text-sm text-muted-foreground">
                  {peticao.expand?.contrato?.cpf || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Data da Assinatura</div>
                <div className="text-sm text-muted-foreground">
                  {peticao.expand?.contrato?.data_assinatura
                    ? format(new Date(peticao.expand.contrato.data_assinatura), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })
                    : 'Não informada'}
                </div>
              </div>
              {peticao.expand?.contrato?.url_pdf && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={peticao.expand.contrato.url_pdf} target="_blank" rel="noreferrer">
                    Ver PDF Original
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
