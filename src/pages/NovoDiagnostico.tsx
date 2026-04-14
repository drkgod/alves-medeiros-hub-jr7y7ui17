import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavigate } from 'react-router-dom'

export default function NovoDiagnostico() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Diagnóstico</h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados abaixo para iniciar um novo diagnóstico.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/diagnosticos')
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="cliente">Nome do Cliente</Label>
              <Input id="cliente" placeholder="Digite o nome do cliente" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto Principal</Label>
              <Input id="assunto" placeholder="Ex: Revisão Tributária" required />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Diagnóstico</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
