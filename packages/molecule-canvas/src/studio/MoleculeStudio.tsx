import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PanelTop,
  Tag,
  Library,
  Keyboard,
  X,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  analyzeMolecularGraph,
  type MolecularGraphAnalysis,
  type MolecularGraphData,
} from '@quimicarush/chemistry-core';
import { SkeletalCanvas } from '../SkeletalCanvas.js';
import type { CanvasTool, SkeletalCanvasHandle, SkeletalCanvasState } from '../types.js';
import { FloatingToolbar } from './FloatingToolbar.js';
import { NamePanel } from './NamePanel.js';
import { StartersPanel } from './StartersPanel.js';
import { ShortcutsPanel } from './ShortcutsPanel.js';

const EMPTY_GRAPH: MolecularGraphData = { atoms: [], bonds: [] };

/** Single-key tool shortcuts, chosen not to collide with the panel toggles. */
const TOOL_KEYS: Record<string, CanvasTool> = {
  b: 'bond',
  e: 'element',
  g: 'functional_group',
  a: 'ring',
  x: 'eraser',
  v: 'pan',
};

export interface MoleculeStudioProps {
  initialGraph?: MolecularGraphData;
  /** Renders an exit affordance / back to previous tab; omit for the standalone studio app. */
  onExit?: () => void;
  onNavigateTab?: (tab: 'arcade' | 'cacar' | 'theory') => void;
  onSendToArcade?: (analysis: MolecularGraphAnalysis, graph: MolecularGraphData) => void;
}

/**
 * Molecule Studio — a dedicated, full-bleed structural editor.
 *
 * The canvas owns the entire viewport like Excalidraw. Everything else floats above it in bubble
 * islands and can be dismissed individually or all at once (Zen Mode).
 */
export const MoleculeStudio: React.FC<MoleculeStudioProps> = ({
  initialGraph,
  onExit,
  onNavigateTab,
  onSendToArcade,
}) => {
  const canvasRef = useRef<SkeletalCanvasHandle | null>(null);
  const [graph, setGraph] = useState<MolecularGraphData>(initialGraph ?? EMPTY_GRAPH);
  const [canvasState, setCanvasState] = useState<SkeletalCanvasState | null>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showStarters, setShowStarters] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const analysis = useMemo(() => analyzeMolecularGraph(graph), [graph]);
  const isZenMode = !showToolbar && !showName && !showStarters && !showShortcuts;

  const handleStateChange = useCallback((next: SkeletalCanvasState) => {
    setCanvasState(next);
  }, []);

  const loadStarter = useCallback((starter: MolecularGraphData) => {
    canvasRef.current?.loadGraph(starter);
    setGraph(starter);
    requestAnimationFrame(() => canvasRef.current?.recenter());
  }, []);

  // Synchronize native fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // restricted sandbox fallback
    }
  }, []);

  const toggleZenMode = useCallback(() => {
    if (isZenMode) {
      setShowToolbar(true);
      setShowName(true);
    } else {
      setShowToolbar(false);
      setShowName(false);
      setShowStarters(false);
      setShowShortcuts(false);
    }
  }, [isZenMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();

      if (key === 'escape') {
        if (onExit) {
          event.preventDefault();
          onExit();
          return;
        }
      }
      if (key === '1') {
        event.preventDefault();
        if (onNavigateTab) {
          onNavigateTab('arcade');
        } else if (onExit) {
          onExit();
        }
        return;
      }
      if (key === '2' && onNavigateTab) {
        event.preventDefault();
        onNavigateTab('cacar');
        return;
      }
      if (key === '3' && onNavigateTab) {
        event.preventDefault();
        onNavigateTab('theory');
        return;
      }
      if (key === 'o') {
        event.preventDefault();
        canvasRef.current?.autoAlign();
        return;
      }
      if (key === 'f') {
        event.preventDefault();
        toggleFullscreen();
        return;
      }
      if (key === 't') {
        event.preventDefault();
        setShowToolbar(value => !value);
        return;
      }
      if (key === 'i') {
        event.preventDefault();
        setShowName(value => !value);
        return;
      }
      if (key === 'l') {
        event.preventDefault();
        setShowStarters(value => !value);
        return;
      }
      if (key === 'k') {
        event.preventDefault();
        setShowShortcuts(value => !value);
        return;
      }
      if (key === 'h') {
        event.preventDefault();
        toggleZenMode();
        return;
      }

      const tool = TOOL_KEYS[key];
      if (tool) {
        event.preventDefault();
        canvasRef.current?.setTool(tool);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleZenMode, toggleFullscreen, onExit, onNavigateTab]);

  const individualRestoreButtons = [
    {
      visible: !showToolbar,
      label: 'Ferramentas',
      icon: PanelTop,
      onClick: () => setShowToolbar(true),
      title: 'Mostrar barra superior [T]',
    },
    {
      visible: !showName,
      label: 'Nomenclatura',
      icon: Tag,
      onClick: () => setShowName(true),
      title: 'Mostrar painel de nomenclatura [I]',
    },
    {
      visible: !showStarters,
      label: 'Acervo',
      icon: Library,
      onClick: () => setShowStarters(true),
      title: 'Mostrar esqueletos prontos [L]',
    },
    {
      visible: !showShortcuts,
      label: 'Atalhos',
      icon: Keyboard,
      onClick: () => setShowShortcuts(true),
      title: 'Mostrar atalhos de teclado [K]',
    },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[var(--md-sys-color-surface)] select-none">
      {/* Drawing surface: full viewport like Excalidraw, dot-grid background */}
      <SkeletalCanvas
        ref={canvasRef}
        showToolbar={false}
        height="100%"
        initialGraph={initialGraph}
        onGraphChange={setGraph}
        onStateChange={handleStateChange}
        className="!rounded-none !border-0 !shadow-none h-full w-full"
      />

      {/* Top Header Bar across viewport: Left Island, Centered Toolbar, Right Island */}
      <header
        className="fixed top-3 inset-x-0 z-50 flex items-start justify-between px-3 sm:px-4 pointer-events-none"
        style={{ pointerEvents: 'none' }}
      >
        {/* Left Island: Treino [1], Acervo [L], Atalhos [K] */}
        <div
          className={`studio-floating h-10 px-2 rounded-full flex items-center gap-1 shadow-lg pointer-events-auto transition-all duration-200 ${
            isZenMode ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
          }`}
          style={{ pointerEvents: isZenMode ? 'none' : 'auto' }}
        >
          {(onExit || onNavigateTab) && (
            <button
              type="button"
              onClick={() => (onNavigateTab ? onNavigateTab('arcade') : onExit?.())}
              title="Voltar ao Treino Arcade [1] ou [Esc]"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              className="h-7 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
              <span className="hidden sm:inline">Treino</span>
              <kbd className="text-[10px] font-mono opacity-60">1</kbd>
            </button>
          )}

          <div className="w-px h-4 bg-[var(--md-sys-color-outline-variant)] my-auto" />

          <button
            type="button"
            onClick={() => setShowStarters(v => !v)}
            title="Abrir acervo de moléculas [L]"
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            className={`h-7 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              showStarters
                ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Acervo</span>
            <kbd className="text-[10px] font-mono opacity-60">L</kbd>
          </button>

          <button
            type="button"
            onClick={() => setShowShortcuts(v => !v)}
            title="Ver atalhos rápidos [K]"
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            className={`h-7 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              showShortcuts
                ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Atalhos</span>
            <kbd className="text-[10px] font-mono opacity-60">K</kbd>
          </button>
        </div>

        {/* Center Island: FloatingToolbar */}
        <div
          className="studio-fade pointer-events-auto"
          style={{ pointerEvents: showToolbar ? 'auto' : 'none' }}
          data-hidden={!showToolbar}
        >
          <FloatingToolbar
            state={canvasState}
            onSelectTool={tool => canvasRef.current?.setTool(tool)}
            onSelectElement={element => canvasRef.current?.setElement(element)}
            onSelectGroup={group => canvasRef.current?.setGroup(group)}
            onSelectRing={ring => canvasRef.current?.setRing(ring)}
            onAutoAlign={() => canvasRef.current?.autoAlign()}
            onUndo={() => canvasRef.current?.undo()}
            onRedo={() => canvasRef.current?.redo()}
            onRecenter={() => canvasRef.current?.recenter()}
            onClear={() => canvasRef.current?.clear()}
            onHide={() => setShowToolbar(false)}
          />
        </div>

        {/* Right Island: Zen, Fullscreen, Sair */}
        <div
          className="studio-floating h-10 px-2 rounded-full flex items-center gap-1 shadow-lg pointer-events-auto"
          style={{ pointerEvents: 'auto' }}
        >
          <button
            type="button"
            onClick={toggleZenMode}
            title={isZenMode ? 'Restaurar painéis [H]' : 'Ocultar tudo / Modo Zen [H]'}
            aria-label={isZenMode ? 'Restaurar painéis' : 'Ocultar tudo'}
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            className="h-7 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
          >
            {isZenMode ? (
              <Eye className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">{isZenMode ? 'Mostrar' : 'Ocultar tudo'}</span>
            <kbd className="text-[10px] font-mono opacity-60">H</kbd>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da tela cheia [F]' : 'Tela cheia [F]'}
            aria-label="Alternar tela cheia"
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            className="h-7 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isFullscreen ? 'Janela' : 'Tela cheia'}</span>
            <kbd className="text-[10px] font-mono opacity-60">F</kbd>
          </button>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              title="Sair do laboratório [Esc]"
              aria-label="Sair"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              className="h-7 px-2 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Nomenclature / Analysis Floating Island (Left) */}
      {showName && (
        <NamePanel
          analysis={analysis}
          onHide={() => setShowName(false)}
          onSendToArcade={
            onSendToArcade && analysis.isNameable
              ? () => onSendToArcade(analysis, graph)
              : undefined
          }
        />
      )}

      {/* Starters Library Panel */}
      {showStarters && (
        <StartersPanel onLoad={loadStarter} onHide={() => setShowStarters(false)} />
      )}

      {/* Shortcuts Help Panel */}
      {showShortcuts && <ShortcutsPanel onHide={() => setShowShortcuts(false)} />}

      {/* Restore Dock — Bottom Left for individually dismissed panels */}
      <div
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 flex-wrap max-w-[80vw]"
        style={{ pointerEvents: 'auto' }}
      >
        {isZenMode ? (
          <button
            type="button"
            onClick={toggleZenMode}
            title="Restaurar painéis [H]"
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            className="studio-floating h-9 px-3.5 rounded-full flex items-center gap-2 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-highest)] shadow-lg transition-colors cursor-pointer animate-fadeIn"
          >
            <Eye className="w-4 h-4" />
            <span>Restaurar Painéis</span>
            <kbd className="text-[10px] font-mono opacity-60">H</kbd>
          </button>
        ) : (
          individualRestoreButtons
            .filter(button => button.visible)
            .map(({ label, icon: Icon, onClick, title }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                title={title}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                className="studio-floating h-8 px-3 rounded-full flex items-center gap-1.5 text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] shadow-md transition-colors cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                <span>+ {label}</span>
              </button>
            ))
        )}
      </div>
    </div>
  );
};
