import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useDebounce } from '@/hooks/use-debounce'
import { usePeticoes } from '@/hooks/use-peticoes'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Search, ExternalLink } from 'lucide-react'
import { RecordModel } from 'pocketbase'

const statusColors: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  revisado: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
  finalizado: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
  protocolado:
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300',
}

const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  revisado: 'Revisado',
  finalizado: 'Finalizado',
  protocolado: 'Protocolado',
}

export default function Peticoes() {
  const navigate = useNavigate()
  const { listPeticoes, listModelos, loading } = usePeticoes()
  const [data, setData] = useState<{
    items: RecordModel[]
    totalItems: number
    totalPages: number
  }>({ items: [], totalItems: 0, totalPages: 0 })
  const [modelos, setModelos] = useState<RecordModel[]>([])

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState('Todos')
  const [tipo, setTipo] = useState('Todos')
  const [page, setPage] = useState(1)

  useEffect(() => {
    listModelos().then(setModelos)
  }, [listModelos])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, tipo])

  useEffect(() => {
    listPeticoes({ search: debouncedSearch, status, modelo: tipo, page }).then((res) => {
      if (res) setData({ items: res.items, totalItems: res.totalItems, totalPages: res.totalPages })
    })
  }, [debouncedSearch, status, tipo, page, listPeticoes])

  const renderContent = () => {
    if (loading && data.items.length === 0) {
      return Array(5)
        .fill(0)
        .map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)
    }
    if (data.items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground animate-fade-in border rounded-md bg-card">
          <FileText className="mx-auto h-12 w-12 opacity-50 mb-4" />
          <p className="text-lg font-medium">Nenhuma petição gerada</p>
          <p className="text-sm">
            As petições serão geradas automaticamente a partir dos contratos assinados.
          </p>
        </div>
      )
    }
    return (
      <>
        <div className="hidden md:block border rounded-md bg-card animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.expand?.contrato?.nome_signatario || '-'}
                  </TableCell>
                  <TableCell>{item.expand?.modelo?.titulo || item.tipo_peticao}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(item.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/peticoes/${item.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" /> Abrir
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="md:hidden space-y-4 animate-fade-in">
          {data.items.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/peticoes/${item.id}`)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="font-medium">{item.expand?.contrato?.nome_signatario || '-'}</div>
                  <Badge variant="outline" className={statusColors[item.status]}>
                    {statusLabels[item.status]}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.expand?.modelo?.titulo || item.tipo_peticao}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(item.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Petições</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhamento de petições e documentos legais.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do cliente..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os Status</SelectItem>
            <SelectItem value="Rascunho">Rascunho</SelectItem>
            <SelectItem value="Revisado">Revisado</SelectItem>
            <SelectItem value="Finalizado">Finalizado</SelectItem>
            <SelectItem value="Protocolado">Protocolado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os Tipos</SelectItem>
            {modelos.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {renderContent()}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Página {page} de {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
