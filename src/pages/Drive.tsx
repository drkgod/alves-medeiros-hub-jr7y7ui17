import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FolderOpen,
  ChevronRight,
  FolderPlus,
  ArrowLeft,
  RefreshCw,
  MoreVertical,
  Pencil,
  Settings,
} from 'lucide-react'
import {
  listDriveFiles,
  createDriveFolder,
  createClientStructure,
  renameDriveFile,
  type DriveFile,
} from '@/services/google_drive'
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
import { useNavigate } from 'react-router-dom'

type FolderStackItem = { id: string; name: string }

export default function Drive() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [folderStack, setFolderStack] = useState<FolderStackItem[]>([
    { id: 'root', name: 'Meu Drive' },
  ])
  const [error, setError] = useState<string | null>(null)

  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [clientStructureOpen, setClientStructureOpen] = useState(false)
  const [clientName, setClientName] = useState('')

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameFileId, setRenameFileId] = useState('')
  const [renameName, setRenameName] = useState('')

  const currentFolder = folderStack[folderStack.length - 1]

  const fetchFiles = useCallback(async (folderId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await listDriveFiles(folderId)
      setFiles(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar arquivos')
      if (err.status === 401) {
        toast.error('Conta do Google não conectada ou sessão expirada. Conecte nas Configurações.')
      } else {
        toast.error('Não foi possível carregar os arquivos do Drive.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles(currentFolder.id)
  }, [currentFolder.id, fetchFiles])

  const handleFolderClick = (folder: DriveFile) => {
    if (folder.isFolder) {
      setFolderStack([...folderStack, { id: folder.id, name: folder.name }])
    } else if (folder.webViewLink) {
      window.open(folder.webViewLink, '_blank')
    }
  }

  const handleBack = () => {
    if (folderStack.length > 1) {
      setFolderStack(folderStack.slice(0, -1))
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await createDriveFolder(newFolderName.trim(), currentFolder.id)
      toast.success('Pasta criada com sucesso')
      setNewFolderOpen(false)
      setNewFolderName('')
      fetchFiles(currentFolder.id)
    } catch (err: any) {
      toast.error('Erro ao criar pasta no Drive')
    }
  }

  const handleCreateClientStructure = async () => {
    if (!clientName.trim()) return
    try {
      await createClientStructure(clientName.trim(), currentFolder.id)
      toast.success('Estrutura de pastas do cliente criada')
      setClientStructureOpen(false)
      setClientName('')
      fetchFiles(currentFolder.id)
    } catch (err: any) {
      toast.error('Erro ao criar estrutura de pastas')
    }
  }

  const handleRename = async () => {
    if (!renameName.trim() || !renameFileId) return
    try {
      await renameDriveFile(renameFileId, renameName.trim())
      toast.success('Renomeado com sucesso')
      setRenameOpen(false)
      fetchFiles(currentFolder.id)
    } catch (err: any) {
      toast.error('Erro ao renomear arquivo/pasta')
    }
  }

  const openRename = (file: DriveFile) => {
    setRenameFileId(file.id)
    setRenameName(file.name)
    setRenameOpen(true)
  }

  const formatSize = (size?: string) => {
    if (!size) return '--'
    const bytes = parseInt(size, 10)
    if (isNaN(bytes)) return '--'
    const mb = bytes / (1024 * 1024)
    return mb < 1 ? '< 1 MB' : `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6 h-full flex flex-col pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Google Drive</h1>
          <p className="text-muted-foreground mt-2">
            Organize e acesse os documentos dos seus clientes diretamente na nuvem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setClientStructureOpen(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Estrutura Cliente
          </Button>
          <Button onClick={() => setNewFolderOpen(true)}>Nova Pasta</Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-[500px]">
        <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {folderStack.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-2 shrink-0"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center text-sm font-medium">
              {folderStack.map((f, i) => (
                <div key={f.id} className="flex items-center">
                  {i > 0 && (
                    <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={`cursor-pointer hover:underline ${i === folderStack.length - 1 ? 'text-foreground' : 'text-muted-foreground'}`}
                    onClick={() => setFolderStack(folderStack.slice(0, i + 1))}
                  >
                    {f.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => fetchFiles(currentFolder.id)}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                <FolderOpen className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Conexão Necessária</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Para visualizar seus arquivos, você precisa conectar sua conta do Google Drive nas
                configurações do sistema.
              </p>
              <Button onClick={() => navigate('/configuracoes')}>
                <Settings className="w-4 h-4 mr-2" />
                Ir para Configurações
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
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-5 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <FolderOpen className="h-16 w-16 mb-6 opacity-20" />
              <p className="text-lg">Esta pasta está vazia.</p>
              <p className="text-sm mt-2 opacity-70">
                Arraste arquivos para o Google Drive para vê-los aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                    onClick={() => handleFolderClick(file)}
                  >
                    {file.isFolder ? (
                      <FolderOpen className="h-6 w-6 text-blue-500 fill-blue-100/50 shrink-0" />
                    ) : (
                      <img
                        src={file.iconLink}
                        alt=""
                        className="h-6 w-6 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <span className="font-medium text-sm truncate text-foreground/90">
                      {file.name}
                    </span>
                  </div>
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
                          <DropdownMenuItem onClick={() => window.open(file.webViewLink, '_blank')}>
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

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Digite o nome da pasta"
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
            <DialogTitle>Gerar Estrutura de Cliente</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Será criada uma pasta principal com o nome do cliente e as seguintes subpastas
              organizacionais:
              <br />
              <span className="font-medium mt-2 block">
                • 01-Procuracao
                <br />• 02-Documentos
                <br />• 03-Peticoes
                <br />• 04-Comprovantes
              </span>
            </p>
            <Input
              placeholder="Nome completo do cliente"
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
