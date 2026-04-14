import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  FileText,
  AlertCircle,
  FileCheck,
  ExternalLink,
  RefreshCcw,
  FileSignature,
} from 'lucide-react'
import { useContratos } from '@/hooks/use-contratos'
import { format } from 'date-fns'
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary'

function formatCPF(cpf: string) {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pendente_processamento':
      return (
        <Badge
          variant="outline"
          className="text-amber-500 border-amber-500 bg-amber-500/10 whitespace-nowrap"
        >
          Pendente
        </Badge>
      )
    case 'processado':
      return (
        <Badge
          variant="outline"
          className="text-primary border-primary bg-primary/10 whitespace-nowrap"
        >
          Processado
        </Badge>
      )
    case 'erro':
      return (
        <Badge
          variant="outline"
          className="text-destructive border-destructive bg-destructive/10 whitespace-nowrap"
        >
          Erro
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="whitespace-nowrap">
          {status}
        </Badge>
      )
  }
}

export default function Contratos() {
  const {
    data,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    totalPages,
    stats,
    refetch,
  } = useContratos()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contratos Assinados</h1>
        <p className="text-muted-foreground mt-2">
          Repositório de contratos finalizados e vigentes.
        </p>
      </div>

      <SectionErrorBoundary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.pendentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processados</CardTitle>
            <FileCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.processados}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <label htmlFor="status-filter" className="sr-only">Filtrar por status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status-filter" className="w-full h-11">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente_processamento">Pendentes</SelectItem>
              <SelectItem value="processado">Processados</SelectItem>
              <SelectItem value="erro">Erros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SectionErrorBoundary>
        <Card>
          <CardContent className="p-0 sm:p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Erro ao carregar contratos</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={refetch} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-4 p-4 sm:p-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="bg-muted p-4 rounded-full">
                <FileSignature className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Nenhum contrato assinado</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Os contratos assinados na ZapSign aparecerão aqui automaticamente.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Signatário</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => {
                      const peticaoId = item.expand?.peticoes_via_contrato?.[0]?.id
                      const peticaoHref = peticaoId
                        ? `/peticoes/${peticaoId}`
                        : `/peticoes?contrato=${item.id}`
                      return (
                        <TableRow key={item.id} className="animate-fade-in">
                          <TableCell className="font-medium">{item.nome_signatario}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatCPF(item.cpf)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.email || '-'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {item.data_assinatura
                              ? format(new Date(item.data_assinatura), 'dd/MM/yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {item.url_pdf && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={item.url_pdf} target="_blank" rel="noopener noreferrer">
                                    Ver PDF
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {item.status === 'processado' && (
                                <Button size="sm" asChild variant="secondary">
                                  <Link to={peticaoHref}>Ver Petição</Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="sm:hidden flex flex-col gap-4 p-4">
                {data.map((item) => {
                  const peticaoId = item.expand?.peticoes_via_contrato?.[0]?.id
                  const peticaoHref = peticaoId
                    ? `/peticoes/${peticaoId}`
                    : `/peticoes?contrato=${item.id}`
                  return (
                    <Card key={item.id} className="animate-fade-in">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{item.nome_signatario}</CardTitle>
                            <CardDescription className="mt-1">
                              {formatCPF(item.cpf)}
                            </CardDescription>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4 space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Data:</span>
                          <span>
                            {item.data_assinatura
                              ? format(new Date(item.data_assinatura), 'dd/MM/yyyy')
                              : '-'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                          {item.url_pdf && (
                            <Button variant="outline" className="w-full" asChild>
                              <a href={item.url_pdf} target="_blank" rel="noopener noreferrer">
                                Ver PDF
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {item.status === 'processado' && (
                            <Button className="w-full" asChild variant="secondary">
                              <Link to={peticaoHref}>Ver Petição</Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 p-4 sm:p-0">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Próximo
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </SectionErrorBoundary>
    </div>
  )
}
