import { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  FileSignature,
  FolderOpen,
  PlayCircle,
  Settings,
  Menu,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Diagnósticos', href: '/diagnosticos', icon: ClipboardCheck },
  { name: 'Petições', href: '/peticoes', icon: FileText },
  { name: 'Contratos', href: '/contratos', icon: FileSignature },
  { name: 'Google Drive', href: '/drive', icon: FolderOpen },
  { name: 'Videoaulas', href: '/videoaulas', icon: PlayCircle },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export default function AppLayout() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const NavItems = () => (
    <div className="flex flex-col gap-1 w-full mt-4">
      {navigation.map((item) => {
        const isActive = location.pathname.startsWith(item.href)
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]',
              isActive ? 'nav-item-active' : 'nav-item-inactive',
            )}
          >
            <item.icon
              className={cn(
                'h-5 w-5',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground',
              )}
            />
            {item.name}
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass-header">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-4">
                <SheetTitle className="text-lg font-bold">Alves Medeiros Hub</SheetTitle>
                <nav className="mt-4 flex flex-col gap-2">
                  <NavItems />
                </nav>
              </SheetContent>
            </Sheet>
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">
                Alves Medeiros Hub
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground sm:hidden">
                AM Hub
              </span>
            </Link>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-[260px] flex-col border-r bg-card px-4 py-6">
          <nav className="flex-1">
            <NavItems />
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* The key prop forces a re-mount on route change, triggering the animation */}
            <div key={location.pathname} className="animate-fade-in-up">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
