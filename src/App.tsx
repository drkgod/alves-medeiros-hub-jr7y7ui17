import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { ThemeProvider } from './components/ThemeProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalLoader } from './components/GlobalLoader'
import { AuthProvider } from './hooks/use-auth'
import { ProtectedRoute } from './components/ProtectedRoute'

// Lazy loaded components
const AppLayout = lazy(() => import('./components/AppLayout'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Diagnosticos = lazy(() => import('./pages/Diagnosticos'))
const NovoDiagnostico = lazy(() => import('./pages/NovoDiagnostico'))
const DetalheDiagnostico = lazy(() => import('./pages/DetalheDiagnostico'))
const Peticoes = lazy(() => import('./pages/Peticoes'))
const DetalhePeticao = lazy(() => import('./pages/DetalhePeticao'))
const Contratos = lazy(() => import('./pages/Contratos'))
const Drive = lazy(() => import('./pages/Drive'))
const Videoaulas = lazy(() => import('./pages/Videoaulas'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))
const NotFound = lazy(() => import('./pages/NotFound'))

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="theme">
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <Suspense fallback={<GlobalLoader />}>
              <Routes>
                {/* Independent Route */}
                <Route path="/login" element={<Login />} />

                {/* Authenticated Layout Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/diagnosticos" element={<Diagnosticos />} />
                    <Route path="/diagnosticos/novo" element={<NovoDiagnostico />} />
                    <Route path="/diagnosticos/:id" element={<DetalheDiagnostico />} />
                    <Route path="/peticoes" element={<Peticoes />} />
                    <Route path="/peticoes/:id" element={<DetalhePeticao />} />
                    <Route path="/contratos" element={<Contratos />} />
                    <Route path="/drive" element={<Drive />} />
                    <Route path="/videoaulas" element={<Videoaulas />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                  </Route>
                </Route>

                {/* Redirects and 404 */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
