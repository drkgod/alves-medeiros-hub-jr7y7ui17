import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlayCircle } from 'lucide-react'

export default function Videoaulas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Videoaulas</h1>
        <p className="text-muted-foreground mt-2">Treinamentos e capacitação para a equipe.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="overflow-hidden group cursor-pointer">
            <div className="aspect-video bg-muted relative flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Módulo de Treinamento {item}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Duração: 45 min</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
