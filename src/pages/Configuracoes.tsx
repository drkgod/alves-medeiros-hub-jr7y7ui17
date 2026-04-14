import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Configuracoes() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as preferências da sua conta e do sistema.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuário</CardTitle>
          <CardDescription>Atualize suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Configurações em desenvolvimento.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Preferências do Sistema</CardTitle>
          <CardDescription>Ajuste notificações e temas.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Configurações em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  )
}
