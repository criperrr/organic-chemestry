import React, { useCallback, useRef, useState } from 'react';
import {
  GripHorizontal,
  X,
  ChevronDown,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import {
  FUNCTION_GUIDE,
  functionLabelPtBR,
  type MolecularGraphAnalysis,
  type OrganicFunction,
} from '@quimicarush/chemistry-core';

interface InfoBalloonProps {
  analysis: MolecularGraphAnalysis;
  onHide: () => void;
}

interface Position {
  x: number;
  y: number;
}

/**
 * Free-floating readout. Draggable by its handle so it never sits on top of the
 * part of the structure you are working on, and collapsible down to just the
 * name when the derivation is in the way.
 */
export const InfoBalloon: React.FC<InfoBalloonProps> = ({ analysis, onHide }) => {
  const [position, setPosition] = useState<Position>({ x: -1, y: -1 });
  const [collapsed, setCollapsed] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null
  );
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((event: React.PointerEvent) => {
    const node = nodeRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
    };
    (event.target as Element).setPointerCapture?.(event.pointerId);
  }, []);

  const handleDragMove = useCallback((event: React.PointerEvent) => {
    const drag = dragRef.current;
    const node = nodeRef.current;
    if (!drag || !node) return;
    const width = node.offsetWidth;
    // Keep the balloon on screen whatever the window size.
    const nextX = Math.min(
      Math.max(8, drag.originX + (event.clientX - drag.startX)),
      window.innerWidth - width - 8
    );
    const nextY = Math.min(
      Math.max(8, drag.originY + (event.clientY - drag.startY)),
      window.innerHeight - 48
    );
    setPosition({ x: nextX, y: nextY });
  }, []);

  const handleDragEnd = useCallback((event: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (event.target as Element).releasePointerCapture?.(event.pointerId);
    } catch {
      /* pointer already released */
    }
  }, []);

  const copy = useCallback((value: string, field: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard || !value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 1400);
    });
  }, []);

  const functions: OrganicFunction[] = analysis.isNameable
    ? [analysis.primaryFunction, ...analysis.secondaryFunctions]
    : [];

  const placement =
    position.x < 0
      ? { right: 16, top: 84 }
      : { left: position.x, top: position.y, right: 'auto' as const };

  return (
    <div
      ref={nodeRef}
      style={{ position: 'fixed', width: 'min(360px, calc(100vw - 32px))', ...placement }}
      className="studio-floating rounded-3xl overflow-hidden pointer-events-auto z-30"
    >
      {/* Drag handle */}
      <div
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        className="flex items-center justify-between gap-2 px-3 py-2 cursor-grab active:cursor-grabbing touch-none border-b border-[var(--md-sys-color-outline-variant)]"
      >
        <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] select-none">
          <GripHorizontal className="w-4 h-4" />
          Nomenclatura
        </span>
        <span className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setCollapsed(value => !value)}
            title={collapsed ? 'Expandir' : 'Recolher'}
            className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onHide}
            title="Ocultar painel [I]"
            className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]"
          >
            <X className="w-4 h-4" />
          </button>
        </span>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2.5 max-h-[70vh] overflow-y-auto">
        {analysis.problems.map((problem, index) => (
          <p
            key={`${problem.code}-${index}`}
            className="flex items-start gap-2 text-[12px] leading-snug px-2.5 py-2 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
            {problem.message}
          </p>
        ))}

        {analysis.isNameable && (
          <>
            <button
              type="button"
              onClick={() => copy(analysis.iupacName2013, 'name')}
              title="Copiar nome"
              className="text-left"
            >
              <h1 className="text-xl font-bold leading-tight break-words text-[var(--md-sys-color-primary)]">
                {analysis.iupacName2013}
                {copied === 'name' && <Check className="inline w-4 h-4 ml-1.5" />}
              </h1>
            </button>

            {analysis.iupacName1993 !== analysis.iupacName2013 && (
              <p className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                1993: <strong>{analysis.iupacName1993}</strong>
              </p>
            )}

            {!collapsed && (
              <>
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
                  <span className="m3-chip py-0.5 px-2">
                    <strong>{analysis.formula}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(analysis.smiles, 'smiles')}
                    className="m3-chip py-0.5 px-2 gap-1"
                    title="Copiar SMILES"
                  >
                    {copied === 'smiles' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span className="truncate max-w-[170px]">{analysis.smiles}</span>
                  </button>
                  <span className="m3-chip py-0.5 px-2">
                    {analysis.parentType === 'ring' ? 'anel' : 'cadeia'} · {analysis.parentSize} C
                  </span>
                </div>

                {functions.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {functions.map((fn, index) => (
                      <span
                        key={fn}
                        title={FUNCTION_GUIDE[fn].recognition}
                        className={`m3-chip py-0.5 px-2 text-[11px] font-semibold gap-1 ${
                          index === 0
                            ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]'
                            : ''
                        }`}
                      >
                        {functionLabelPtBR(fn)}
                        <span className="font-mono opacity-60">{FUNCTION_GUIDE[fn].suffix}</span>
                      </span>
                    ))}
                  </div>
                )}

                {analysis.steps.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSteps(value => !value)}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--md-sys-color-tertiary)] hover:underline self-start"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Por que esse nome?
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
                    </button>

                    {showSteps && (
                      <ol className="flex flex-col gap-2">
                        {analysis.steps.map(step => (
                          <li
                            key={step.title}
                            className="pl-2.5 border-l-2 border-[var(--md-sys-color-primary)]/40 flex flex-col gap-0.5"
                          >
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                              {step.title}
                            </span>
                            <span className="text-[12px] leading-snug text-[var(--md-sys-color-on-surface-variant)]">
                              {step.detail}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
