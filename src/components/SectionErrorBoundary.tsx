import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Section error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 border border-border rounded-lg bg-destructive/5 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Algo deu errado nesta seção
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ocorreu um erro inesperado ao carregar estes dados.
          </p>
          <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
