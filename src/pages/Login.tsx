import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signUp, resetPassword } = useAuth()
  const [activeTab, setActiveTab] = useState('login')

  // Login State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showReset, setShowReset] = useState(false)

  // Signup State
  const [signName, setSignName] = useState('')
  const [signEmail, setSignEmail] = useState('')
  const [signPass, setSignPass] = useState('')
  const [signPassConfirm, setSignPassConfirm] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signErrors, setSignErrors] = useState<Record<string, string>>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    const { error } = await signIn(loginEmail, loginPass)
    setIsLoggingIn(false)
    if (error) {
      toast.error('Erro ao entrar', {
        description: getErrorMessage(error) || 'Verifique suas credenciais e tente novamente.',
        action: { label: 'Tentar novamente', onClick: () => handleLogin(e) },
      })
    } else {
      toast.success('Bem-vindo de volta!')
      navigate('/dashboard')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignErrors({})
    if (signPass !== signPassConfirm) {
      setSignErrors({ passwordConfirm: 'As senhas não coincidem.' })
      return
    }

    setIsSigningUp(true)
    const { error } = await signUp({
      name: signName,
      email: signEmail,
      password: signPass,
      passwordConfirm: signPassConfirm,
    })
    setIsSigningUp(false)

    if (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        setSignErrors(fieldErrors)
      } else {
        toast.error('Erro ao criar conta', {
          description: getErrorMessage(error) || 'Ocorreu um erro inesperado.',
          action: { label: 'Tentar novamente', onClick: () => handleSignup(e) },
        })
      }
    } else {
      toast.success('Conta criada com sucesso!')
      setActiveTab('login')
      setLoginEmail(signEmail)
      setSignName('')
      setSignEmail('')
      setSignPass('')
      setSignPassConfirm('')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail) {
      toast.error('Informe seu email acima para recuperar a senha.')
      return
    }
    setIsLoggingIn(true)
    const { error } = await resetPassword(loginEmail)
    setIsLoggingIn(false)
    if (error) {
      toast.error('Erro ao recuperar senha', {
        description: getErrorMessage(error),
      })
    } else {
      toast.success('Link enviado! Verifique seu email.')
      setShowReset(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-fade-in">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-elevation">
        <CardHeader className="space-y-2 text-center pb-4">
          <CardTitle className="text-3xl font-bold">Alves Medeiros Hub</CardTitle>
          <CardDescription>Acesse a plataforma exclusiva</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowReset(!showReset)}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {showReset && (
                <form
                  onSubmit={handleResetPassword}
                  className="pt-2 pb-2 space-y-3 animate-fade-in-down border-t mt-4"
                >
                  <p className="text-sm text-muted-foreground text-center">
                    Enviaremos um link de recuperação para o seu email.
                  </p>
                  <Button type="submit" variant="outline" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar link
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signName">Nome completo</Label>
                  <Input
                    id="signName"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    required
                  />
                  {signErrors.name && <p className="text-xs text-destructive">{signErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signEmail">Email</Label>
                  <Input
                    id="signEmail"
                    type="email"
                    value={signEmail}
                    onChange={(e) => setSignEmail(e.target.value)}
                    required
                  />
                  {signErrors.email && (
                    <p className="text-xs text-destructive">{signErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signPass">Senha</Label>
                  <Input
                    id="signPass"
                    type="password"
                    value={signPass}
                    onChange={(e) => setSignPass(e.target.value)}
                    required
                    minLength={8}
                  />
                  {signErrors.password && (
                    <p className="text-xs text-destructive">{signErrors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signPassConfirm">Confirmar senha</Label>
                  <Input
                    id="signPassConfirm"
                    type="password"
                    value={signPassConfirm}
                    onChange={(e) => setSignPassConfirm(e.target.value)}
                    required
                    minLength={8}
                  />
                  {signErrors.passwordConfirm && (
                    <p className="text-xs text-destructive">{signErrors.passwordConfirm}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSigningUp}>
                  {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
