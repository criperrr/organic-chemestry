import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanelTop, Info, Keyboard } from 'lucide-react';
import {
  SkeletalCanvas,
  type SkeletalCanvasHandle,
  type SkeletalCanvasState,
  type CanvasTool,
} from '@quimicarush/molecule-canvas';
import {
  analyzeMolecularGraph,
  type MolecularGraphData,
} from '@quimicarush/chemistry-core';
import { FloatingToolbar } from './components/FloatingToolbar.js';
import { InfoBalloon } from './components/InfoBalloon.js';

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

/**
 * Molecule Studio — a dedicated, full-bleed structural editor.
 *
 * The canvas owns the entire viewport. Everything else floats above it and can
 * be dismissed, so the drawing surface is never competing with chrome.
 */
export const App: React.FC = () => {
  const canvasRef = useRef<SkeletalCanvasHandle | null>(null);
  const [graph, setGraph] = useState<MolecularGraphData>(EMPTY_GRAPH);
  const [canvasState, setCanvasState] = useState<SkeletalCanvasState | null>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showInfo, setShowInfo] = useState(true);

  const analysis = useMemo(() => analyzeMolecularGraph(graph), [graph]);

  const handleStateChange = useCallback((next: SkeletalCanvasState) => {
    setCanvasState(next);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();

      if (key === 't') {
        event.preventDefault();
        setShowToolbar(value => !value);
        return;
      }
      if (key === 'i') {
        event.preventDefault();
        setShowInfo(value => !value);
        return;
      }
      if (key === 'h') {
        // One key to clear the screen down to the structure alone.
        event.preventDefault();
        const anyVisible = showToolbar || showInfo;
        setShowToolbar(!anyVisible);
        setShowInfo(!anyVisible);
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
  }, [showToolbar, showInfo]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--md-sys-color-surface)]">
      {/* Drawing surface: the whole screen, no chrome of its own. */}
      <SkeletalCanvas
        ref={canvasRef}
        showToolbar={false}
        height="100%"
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

      {/* Floating, draggable readout */}
      {showInfo && <InfoBalloon analysis={analysis} onHide={() => setShowInfo(false)} />}

      {/* Restore affordances — the only thing that never hides. */}
      <div className="fixed bottom-4 left-4 z-30 flex items-center gap-1.5">
        {!showToolbar && (
          <button
            type="button"
            onClick={() => setShowToolbar(true)}
            title="Mostrar barra [T]"
            className="studio-floating h-9 px-3 rounded-full flex items-center gap-2 text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
          >
            <PanelTop className="w-4 h-4" />
            Ferramentas
          </button>
        )}
        {!showInfo && (
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            title="Mostrar painel [I]"
            className="studio-floating h-9 px-3 rounded-full flex items-center gap-2 text-[12px] font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
          >
            <Info className="w-4 h-4" />
            Nome
          </button>
        )}
        {showToolbar && showInfo && (
          <span
            className="studio-floating h-9 px-3 rounded-full flex items-center gap-2 text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)] select-none"
            title="T oculta a barra · I oculta o painel · H oculta tudo · pinça para zoom · dois dedos para navegar"
          >
            <Keyboard className="w-4 h-4" />
            T · I · H
          </span>
        )}
      </div>
    </div>
  );
};
