import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Contratos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contratos Assinados</h1>
        <p className="text-muted-foreground mt-2">
          Repositório de contratos finalizados e vigentes.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum contrato recente encontrado.</p>
        </CardContent>
      </Card>
    </div>
  )
}
