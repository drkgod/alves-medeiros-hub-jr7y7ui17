import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Peticoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Petições</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhamento de petições e documentos legais.
        </p>
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map((item) => (
          <Link key={item} to={`/peticoes/${item}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Petição #{item}000</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Clique para visualizar os detalhes desta petição.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
