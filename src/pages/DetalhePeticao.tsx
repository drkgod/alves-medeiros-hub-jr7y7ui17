import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function DetalhePeticao() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalhe da Petição</h1>
          <p className="text-muted-foreground mt-2">Visualizando registro #{id}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informações do Processo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Conteúdo detalhado da petição será exibido aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
