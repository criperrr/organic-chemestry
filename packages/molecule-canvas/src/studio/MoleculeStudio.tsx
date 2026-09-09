import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanelTop, Tag, Library, Keyboard, X } from 'lucide-react';
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
  /** Renders an exit affordance; omit for the standalone studio app. */
  onExit?: () => void;
  onSendToArcade?: (analysis: MolecularGraphAnalysis, graph: MolecularGraphData) => void;
}

/**
 * Molecule Studio — a dedicated, full-bleed structural editor.
 *
 * The canvas owns the entire viewport. Everything else floats above it and can
 * be dismissed, so the drawing surface is never competing with chrome. Hosted
 * both as its own app and as a full-screen surface inside QuímicaRush.
 */
export const MoleculeStudio: React.FC<MoleculeStudioProps> = ({
  initialGraph,
  onExit,
  onSendToArcade,
}) => {
  const canvasRef = useRef<SkeletalCanvasHandle | null>(null);
  const [graph, setGraph] = useState<MolecularGraphData>(initialGraph ?? EMPTY_GRAPH);
  const [canvasState, setCanvasState] = useState<SkeletalCanvasState | null>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showStarters, setShowStarters] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const analysis = useMemo(() => analyzeMolecularGraph(graph), [graph]);

  const handleStateChange = useCallback((next: SkeletalCanvasState) => {
    setCanvasState(next);
  }, []);

  const loadStarter = useCallback((starter: MolecularGraphData) => {
    canvasRef.current?.loadGraph(starter);
    setGraph(starter);
    // Bring it into view: a starter is built around the origin, not around
    // wherever the student had panned to.
    requestAnimationFrame(() => canvasRef.current?.recenter());
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();

      if (key === 'escape' && onExit) {
        event.preventDefault();
        onExit();
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
        // One key to clear the screen down to the structure alone.
        event.preventDefault();
        const anyVisible = showToolbar || showName || showStarters || showShortcuts;
        setShowToolbar(!anyVisible);
        setShowName(!anyVisible);
        setShowStarters(false);
        setShowShortcuts(false);
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
  }, [showToolbar, showName, showStarters, showShortcuts, onExit]);

  const restoreButtons: { visible: boolean; label: string; icon: React.FC<{ className?: string }>; onClick: () => void; title: string }[] = [
    {
      visible: !showToolbar,
      label: 'Ferramentas',
      icon: PanelTop,
      onClick: () => setShowToolbar(true),
      title: 'Mostrar barra [T]',
    },
    {
      visible: !showName,
      label: 'Nome',
      icon: Tag,
      onClick: () => setShowName(true),
      title: 'Mostrar nomenclatura [I]',
    },
    {
      visible: !showStarters,
      label: 'Esqueletos',
      icon: Library,
      onClick: () => setShowStarters(true),
      title: 'Mostrar esqueletos prontos [L]',
    },
    {
      visible: !showShortcuts,
      label: 'Atalhos',
      icon: Keyboard,
      onClick: () => setShowShortcuts(true),
      title: 'Mostrar atalhos [K]',
    },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[var(--md-sys-color-surface)]">
      {/* Drawing surface: the whole screen, no chrome of its own. */}
      <SkeletalCanvas
        ref={canvasRef}
        showToolbar={false}
        height="100%"
        initialGraph={initialGraph}
        onGraphChange={setGraph}
        onStateChange={handleStateChange}
        className="!rounded-none !border-0 !shadow-none h-full"
      />

      {/* Floating top toolbar */}
      <div
        className="studio-fade fixed top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        data-hidden={!showToolbar}
      >
        <FloatingToolbar
          state={canvasState}
          onSelectTool={tool => canvasRef.current?.setTool(tool)}
          onSelectElement={element => canvasRef.current?.setElement(element)}
          onSelectGroup={group => canvasRef.current?.setGroup(group)}
          onSelectRing={ring => canvasRef.current?.setRing(ring)}
          onUndo={() => canvasRef.current?.undo()}
          onRedo={() => canvasRef.current?.redo()}
          onRecenter={() => canvasRef.current?.recenter()}
          onClear={() => canvasRef.current?.clear()}
          onHide={() => setShowToolbar(false)}
        />
      </div>

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
      {showStarters && (
        <StartersPanel onLoad={loadStarter} onHide={() => setShowStarters(false)} />
      )}
      {showShortcuts && <ShortcutsPanel onHide={() => setShowShortcuts(false)} />}

      {/* Restore affordances — the only chrome that never hides. */}
      <div className="fixed bottom-4 left-4 z-30 flex items-center gap-1.5 flex-wrap max-w-[70vw]">
        {restoreButtons
          .filter(button => button.visible)
          .map(({ label, icon: Icon, onClick, title }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              title={title}
              className="studio-floating h-9 px-3 rounded-full flex items-center gap-2 text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
      </div>

      {onExit && (
        <button
          type="button"
          onClick={onExit}
          title="Sair do estúdio [Esc]"
          className="studio-floating fixed top-3 right-3 z-40 h-9 px-3 rounded-full flex items-center gap-2 text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
        >
          <X className="w-4 h-4" />
          Sair
        </button>
      )}
    </div>
  );
};
