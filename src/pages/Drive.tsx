import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen } from 'lucide-react'

export default function Drive() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Google Drive</h1>
        <p className="text-muted-foreground mt-2">
          Acesso direto aos arquivos e pastas compartilhadas.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Integração Ativa</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            O navegador de arquivos será montado aqui em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
