import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

export default function Configuracoes() {
  const { user } = useAuth()
  const [googleConnected, setGoogleConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadConfig = async () => {
      try {
        const record = await pb
          .collection('configuracoes_usuario')
          .getFirstListItem(`user="${user.id}"`)
        setGoogleConnected(record.google_connected)
      } catch (err) {
        setGoogleConnected(false)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'google_connected') {
        setGoogleConnected(true)
        toast.success('Google Drive conectado com sucesso!')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [user])

  const handleConnectGoogle = () => {
    if (!user) return
    const url = `${pb.baseUrl}/backend/v1/google-auth?user_id=${user.id}`
    const width = 500
    const height = 650
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    window.open(
      url,
      'GoogleAuth',
      `width=${width},height=${height},left=${left},top=${top},popup=true`,
    )
  }

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
          <CardTitle>Integrações</CardTitle>
          <CardDescription>Conecte serviços externos à sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-base">Google Drive</h3>
              <p className="text-sm text-muted-foreground">
                Conecte seu Google Drive para gerenciar pastas e arquivos de clientes diretamente
                pelo sistema.
              </p>
            </div>
            {loading ? (
              <Button disabled variant="outline">
                Verificando...
              </Button>
            ) : googleConnected ? (
              <div className="flex items-center text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <Check className="w-4 h-4 mr-1.5" />
                Conectado
              </div>
            ) : (
              <Button onClick={handleConnectGoogle} variant="outline">
                Conectar Conta
              </Button>
            )}
          </div>
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
