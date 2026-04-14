import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Diagnosticos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnósticos</h1>
          <p className="text-muted-foreground mt-2">Gerencie e crie novos diagnósticos.</p>
        </div>
        <Button asChild className="transition-transform active:scale-[0.98]">
          <Link to="/diagnosticos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Diagnóstico
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Últimos Diagnósticos</CardTitle>
          <CardDescription>Lista de diagnósticos recentes gerados no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum diagnóstico encontrado.</p>
        </CardContent>
      </Card>
    </div>
  )
}
