import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Login() {
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login redirect
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-fade-in">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-elevation">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Entrar</CardTitle>
          <CardDescription>Acesse a plataforma Alves Medeiros Hub</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required />
              </div>
            </div>
            <Button type="submit" className="w-full transition-transform active:scale-[0.98]">
              Acessar Plataforma
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
