import React, { useEffect, useRef, useState, useCallback } from 'react';
import SmilesDrawer from 'smiles-drawer';
import {
  createDrawerOptions,
  ThemeName,
  DrawerOptions,
} from './theme';
import {
  HighlightGroup,
  cloneParseTree,
  tagFunctionalGroup,
  SmilesParseNode,
} from './highlight';

export interface SmilesCanvasProps {
  /**
   * SMILES representation of the molecule to render.
   */
  smiles: string;

  /**
   * Canvas width in pixels.
   * @default 320
   */
  width?: number;

  /**
   * Canvas height in pixels.
   * @default 240
   */
  height?: number;

  /**
   * Color theme ('dark' or 'light').
   * @default 'dark'
   */
  theme?: ThemeName;

  /**
   * Optional functional group to highlight with educational visual halos.
   * @default 'none'
   */
  highlightGroup?: HighlightGroup;

  /**
   * Optional CSS classes applied to the root container.
   */
  className?: string;

  /**
   * Optional style overrides applied to the root container.
   */
  style?: React.CSSProperties;

  /**
   * Performance metric callback reporting render latency in milliseconds.
   */
  onRender?: (renderTimeMs: number) => void;

  /**
   * Custom fallback React node rendered when SMILES is invalid or malformed.
   */
  fallback?: React.ReactNode;
}

// Module-level drawer cache to avoid repeatedly compiling options regexes
const drawerCache = new Map<string, InstanceType<typeof SmilesDrawer.Drawer>>();

// Module-level AST parse cache to avoid re-parsing identical SMILES [FINDING-11]
const parseCache = new Map<string, unknown>();

function getOrCreateDrawer(width: number, height: number, customOptions?: Partial<DrawerOptions>): InstanceType<typeof SmilesDrawer.Drawer> {
  const cacheKey = `${width}x${height}`;
  let drawer = drawerCache.get(cacheKey);
  if (!drawer) {
    const opts = createDrawerOptions({
      width,
      height,
      ...customOptions,
    });
    drawer = new SmilesDrawer.Drawer(opts);
    drawerCache.set(cacheKey, drawer);
  }
  return drawer;
}

function parseSmiles(
  smiles: string,
  onSuccess: (tree: unknown) => void,
  onError: (err: unknown) => void
): void {
  if (parseCache.has(smiles)) {
    onSuccess(parseCache.get(smiles));
    return;
  }
  SmilesDrawer.parse(
    smiles,
    (tree: unknown) => {
      parseCache.set(smiles, tree);
      onSuccess(tree);
    },
    onError
  );
}

/**
 * High-performance 2D Canvas SMILES renderer for QuímicaRush.
 * Wraps SmilesDrawer 2.x with organic chemistry high-contrast palettes,
 * functional group highlighting, responsive scaling, High-DPI support, and resilient error states.
 */
export const SmilesCanvas: React.FC<SmilesCanvasProps> = React.memo(({
  smiles,
  width = 320,
  height = 240,
  theme = 'dark',
  highlightGroup = 'none',
  className = '',
  style,
  onRender,
  fallback,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const actualWidth = Math.round(width * dpr);
  const actualHeight = Math.round(height * dpr);

  useEffect(() => {
    let isCancelled = false;

    // Guard against server-side rendering environments
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const trimmed = (smiles ?? '').trim();
    if (!trimmed) {
      setError('Molécula não especificada');
      clearCanvas();
      return;
    }

    const startTime = performance.now();

    try {
      parseSmiles(
        trimmed,
        (rawTree: unknown) => {
          if (isCancelled) return;

          try {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const tree = cloneParseTree(rawTree as SmilesParseNode);

            // Apply functional group halo highlighting if requested
            let highlightAtoms: [number, string][] = [];
            if (highlightGroup && highlightGroup !== 'none') {
              const highlight = tagFunctionalGroup(tree, highlightGroup);
              if (highlight && highlight.count > 0) {
                highlightAtoms = [[highlight.classId, highlight.color]];
              }
            }

            const drawer = getOrCreateDrawer(actualWidth, actualHeight);

            // Draw to canvas with chosen theme and highlights
            drawer.draw(
              tree as unknown as Parameters<typeof drawer.draw>[0],
              canvas,
              theme,
              false,
              highlightAtoms
            );

            const renderTimeMs = performance.now() - startTime;
            setError(null);
            onRender?.(renderTimeMs);
          } catch (drawErr: unknown) {
            if (isCancelled) return;
            const message =
              drawErr instanceof Error ? drawErr.message : 'Falha na renderização gráfica';
            setError(message);
            clearCanvas();
          }
        },
        (parseErr: unknown) => {
          if (isCancelled) return;
          const message =
            parseErr instanceof Error ? parseErr.message : 'Sintaxe SMILES inválida';
          setError(message);
          clearCanvas();
        }
      );
    } catch (parseException: unknown) {
      if (!isCancelled) {
        const message =
          parseException instanceof Error
            ? parseException.message
            : 'Erro ao processar SMILES';
        setError(message);
        clearCanvas();
      }
    }

    // Cleanup on unmount or prior to re-render [FINDING-07]
    // Do NOT clearCanvas synchronously here to prevent white flicker between questions.
    return () => {
      isCancelled = true;
    };
  }, [smiles, actualWidth, actualHeight, theme, highlightGroup, onRender, clearCanvas]);

  return (
    <div
      ref={containerRef}
      className={`smiles-canvas-container relative inline-flex items-center justify-center select-none overflow-hidden ${className}`}
      style={{
        width,
        height,
        maxWidth: '100%',
        aspectRatio: `${width} / ${height}`,
        ...style,
      }}
      data-theme={theme}
      data-smiles={smiles}
      data-highlight={highlightGroup}
    >
      {error ? (
        fallback ?? (
          <div
            role="alert"
            aria-label={`Erro ao exibir molécula: ${error}`}
            className="smiles-error-badge flex flex-col items-center justify-center p-3 text-center rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 w-full h-full"
          >
            <span className="text-xl mb-1" aria-hidden="true">
              ⚠️
            </span>
            <span className="font-semibold text-xs tracking-wide text-red-200">
              Estrutura Inválida
            </span>
            <span
              className="text-[11px] text-red-400/80 font-mono truncate max-w-full px-2 mt-0.5"
              title={smiles}
            >
              {smiles || '(vazio)'}
            </span>
          </div>
        )
      ) : (
        <canvas
          ref={canvasRef}
          width={actualWidth}
          height={actualHeight}
          className="smiles-canvas-element block"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
          role="img"
          aria-label={`Estrutura molecular 2D para ${smiles}`}
        />
      )}
    </div>
  );
});

SmilesCanvas.displayName = 'SmilesCanvas';

export default SmilesCanvas;
