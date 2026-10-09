import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[QuímicaRush ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0b10] text-[var(--md-sys-color-on-surface,#e2e8f0)] select-none">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--md-sys-color-surface-container-high,#1e293b)] border border-[var(--md-sys-color-outline-variant,#334155)] shadow-2xl flex flex-col items-center text-center gap-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-error-container,#7f1d1d)]/40 border border-[var(--md-sys-color-error,#ef4444)] flex items-center justify-center text-[var(--md-sys-color-error,#ef4444)] shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface,#f8fafc)] tracking-tight">
                {this.props.fallbackTitle ?? 'Recuperação do Laboratório'}
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant,#94a3b8)] leading-relaxed">
                Uma oscilação inesperada foi evitada. Seu rascunho molecular está protegido no navegador.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container,#0c4a6e)]/40 border border-[var(--md-sys-color-primary,#38bdf8)]/30 text-[var(--md-sys-color-primary,#38bdf8)] text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rascunho salvo no dispositivo</span>
            </div>

            {this.state.error?.message && (
              <pre className="w-full p-2.5 rounded-xl bg-black/40 text-[10px] font-mono text-left text-red-300/80 overflow-x-auto max-h-24">
                {this.state.error.message}
              </pre>
            )}

            <div className="w-full flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '';
                  this.handleReset();
                }}
                className="flex-1 py-2.5 px-4 rounded-full bg-[var(--md-sys-color-primary,#38bdf8)] text-[var(--md-sys-color-on-primary,#000)] text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recuperar Rascunho</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
                className="py-2.5 px-4 rounded-full bg-[var(--md-sys-color-surface-container-highest,#334155)] text-[var(--md-sys-color-on-surface,#f8fafc)] text-xs font-semibold hover:bg-[var(--md-sys-color-surface-container,#1e293b)] active:scale-95 transition-all cursor-pointer"
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
