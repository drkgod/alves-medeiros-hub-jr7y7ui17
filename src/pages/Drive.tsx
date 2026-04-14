import { useEffect, useState, useMemo, Fragment } from 'react'
import { format } from 'date-fns'
import { useGoogleDrive, DriveFile } from '@/hooks/use-google-drive'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  FolderOpen,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File as FileIcon,
  Folder,
  MoreVertical,
  Pencil,
  FolderPlus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary'

type FolderStackItem = { id: string; name: string }

export default function Drive() {
  const {
    isChecking,
    isConnected,
    loading,
    error,
    files,
    listFiles,
    createFolder,
    renameItem,
    createClientStructure,
    connectGoogle,
  } = useGoogleDrive()

  const [folderStack, setFolderStack] = useState<FolderStackItem[]>([
    { id: 'root', name: 'Meu Drive' },
  ])
  const currentFolder = folderStack[folderStack.length - 1]

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (isConnected && !isChecking) {
      listFiles(currentFolder.id)
    }
  }, [isConnected, isChecking, currentFolder.id, listFiles])

  const filteredFiles = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase()
    return files
      .filter((f) => f.name.toLowerCase().includes(searchLower))
      .sort((a, b) => {
        if (a.isFolder === b.isFolder) {
          return a.name.localeCompare(b.name)
        }
        return a.isFolder ? -1 : 1
      })
  }, [files, debouncedSearch])

  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const [clientStructureOpen, setClientStructureOpen] = useState(false)
  const [clientName, setClientName] = useState('')

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameFileId, setRenameFileId] = useState('')
  const [renameName, setRenameName] = useState('')

  const handleFolderClick = (folder: DriveFile) => {
    if (folder.isFolder) {
      setFolderStack([...folderStack, { id: folder.id, name: folder.name }])
      setSearchTerm('')
    } else if (folder.webViewLink) {
      window.open(folder.webViewLink, '_blank')
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await createFolder(newFolderName.trim(), currentFolder.id)
      toast.success('Pasta criada!')
      setNewFolderOpen(false)
      setNewFolderName('')
      listFiles(currentFolder.id)
    } catch (err) {
      toast.error('Erro ao criar pasta no Drive')
    }
  }

  const handleCreateClientStructure = async () => {
    if (!clientName.trim()) return
    try {
      await createClientStructure(clientName.trim(), currentFolder.id)
      toast.success('Estrutura criada com 4 pastas!')
      setClientStructureOpen(false)
      setClientName('')
      listFiles(currentFolder.id)
    } catch (err) {
      toast.error('Erro ao criar estrutura de pastas')
    }
  }

  const handleRename = async () => {
    if (!renameName.trim() || !renameFileId) return
    try {
      await renameItem(renameFileId, renameName.trim())
      toast.success('Renomeado!')
      setRenameOpen(false)
      listFiles(currentFolder.id)
    } catch (err) {
      toast.error('Erro ao renomear arquivo/pasta')
    }
  }

  const openRename = (file: DriveFile) => {
    setRenameFileId(file.id)
    setRenameName(file.name)
    setRenameOpen(true)
  }

  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return '--'
    const bytes = parseInt(bytesStr, 10)
    if (isNaN(bytes)) return '--'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (file: DriveFile) => {
    if (file.isFolder) return <Folder className="h-5 w-5 text-blue-500 fill-blue-100/50 shrink-0" />
    if (file.mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500 shrink-0" />
    if (file.mimeType.includes('image'))
      return <ImageIcon className="h-5 w-5 text-green-500 shrink-0" />
    if (file.mimeType.includes('spreadsheet') || file.mimeType.includes('excel'))
      return <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
    if (file.mimeType.includes('document') || file.mimeType.includes('word'))
      return <FileText className="h-5 w-5 text-blue-600 shrink-0" />
    return <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
  }

  if (isChecking) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="h-full flex flex-col p-6 animate-in fade-in duration-300">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Google Drive</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os arquivos dos seus clientes diretamente na nuvem.
          </p>
        </div>
        <Card className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/30">
          <FolderOpen className="w-24 h-24 text-muted-foreground/30 mb-6" />
          <h2 className="text-2xl font-semibold mb-2">Google Drive nao conectado</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Conecte sua conta Google para visualizar e organizar suas pastas diretamente pelo Hub.
          </p>
          <Button onClick={connectGoogle} size="lg">
            Conectar Google Drive
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col pb-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Google Drive</h1>
          <p className="text-muted-foreground mt-2">
            Organize e acesse os documentos dos seus clientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setClientStructureOpen(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Estrutura de Cliente
          </Button>
          <Button onClick={() => setNewFolderOpen(true)}>Nova Pasta</Button>
        </div>
      </div>

      <SectionErrorBoundary>
        <Card className="flex-1 flex flex-col min-h-[500px] overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center flex-1 min-w-0">
              <Breadcrumb>
                <BreadcrumbList>
                  {folderStack.map((f, i) => {
                    const isLast = i === folderStack.length - 1
                    return (
                      <Fragment key={f.id}>
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage>{f.name}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <button
                                className="cursor-pointer"
                                onClick={() => setFolderStack(folderStack.slice(0, i + 1))}
                              >
                                {f.name}
                              </button>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                      </Fragment>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <div className="relative w-full sm:w-64 flex-1">
                <label htmlFor="search-drive" className="sr-only">
                  Buscar nesta pasta
                </label>
                <Search
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="search-drive"
                  placeholder="Buscar nesta pasta..."
                  className="pl-9 h-11 sm:h-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 sm:h-9 sm:w-9 shrink-0"
                onClick={() => listFiles(currentFolder.id)}
                disabled={loading}
                aria-label="Recarregar arquivos"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-auto bg-background">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-300">
                <AlertCircle className="w-16 h-16 text-destructive/50 mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Nao foi possivel carregar os arquivos.
                </h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => listFiles(currentFolder.id)} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            ) : loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-2 border-b border-muted/30 last:border-0"
                  >
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-5 w-1/3" />
                    <div className="ml-auto flex gap-4">
                      <Skeleton className="h-5 w-24 hidden sm:block" />
                      <Skeleton className="h-5 w-16 hidden sm:block" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground animate-in fade-in duration-300">
                <FolderOpen className="h-16 w-16 mb-6 opacity-20" />
                {searchTerm ? (
                  <p className="text-lg">Nenhum arquivo encontrado para a busca.</p>
                ) : (
                  <>
                    <p className="text-lg font-medium text-foreground mb-1">Pasta vazia</p>
                    <p className="text-sm mb-6">Esta pasta nao contem arquivos ou subpastas.</p>
                    <Button
                      onClick={() => setNewFolderOpen(true)}
                      variant="outline"
                      className="min-h-[44px]"
                    >
                      Criar Nova Pasta
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y animate-in fade-in duration-300">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors group"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                      onClick={() => handleFolderClick(file)}
                    >
                      {getFileIcon(file)}
                      <span className="font-medium text-sm truncate text-foreground/90">
                        {file.name}
                      </span>
                    </div>

                    {file.modifiedTime && (
                      <div className="text-xs text-muted-foreground w-24 text-right hidden md:block shrink-0">
                        {format(new Date(file.modifiedTime), 'dd/MM/yyyy')}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground w-20 text-right hidden sm:block shrink-0">
                      {formatSize(file.size)}
                    </div>

                    <div className="shrink-0 pl-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRename(file)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Renomear
                          </DropdownMenuItem>
                          {file.webViewLink && (
                            <DropdownMenuItem
                              onClick={() => window.open(file.webViewLink, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Abrir no Google Drive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </SectionErrorBoundary>

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nome da pasta"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder}>Criar Pasta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Novo nome"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRename}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clientStructureOpen} onOpenChange={setClientStructureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estrutura de Cliente</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Será criada uma pasta principal com o nome do cliente e subpastas para Procuração,
              Documentos, Petições e Comprovantes.
            </p>
            <Input
              placeholder="Nome do cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateClientStructure()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientStructureOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClientStructure}>Criar Estrutura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
