import React, { useEffect } from 'react';
import { X, ZoomIn, Atom, Flame, Layers } from 'lucide-react';
import { SmilesCanvas } from '@quimicarush/smiles-renderer';
import { useGameStore } from '../stores/useGameStore.js';
import { FUNCTION_LABELS } from './HUD.js';

export const MoleculeZoomModal: React.FC = () => {
  const { isMoleculeZoomOpen, closeMoleculeZoom, currentMolecule, difficultyFilter } = useGameStore();

  useEffect(() => {
    if (!isMoleculeZoomOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMoleculeZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoleculeZoomOpen, closeMoleculeZoom]);

  if (!isMoleculeZoomOpen || !currentMolecule) return null;

  const functionLabel =
    currentMolecule.primaryFunction in FUNCTION_LABELS
      ? FUNCTION_LABELS[currentMolecule.primaryFunction]
      : currentMolecule.primaryFunction;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="zoom-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={closeMoleculeZoom}
    >
      <div
        className="w-full max-w-lg max-h-[92dvh] flex flex-col bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-3xl shadow-2xl overflow-hidden text-[var(--md-sys-color-on-surface)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-sm">
              <ZoomIn className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            </div>
            <div>
              <h3 id="zoom-modal-title" className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
                Estrutura Molecular Ampliada
              </h3>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Alta resolução com fidelidade de átomos e ligações
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMoleculeZoom}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] transition-all cursor-pointer"
            aria-label="Fechar ampliação"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Molecular Depiction Canvas (Large & Crisp) */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--md-sys-color-surface-container-lowest)] overflow-hidden min-h-[260px] sm:min-h-[320px]">
          <div className="w-full max-w-sm flex items-center justify-center p-2 rounded-2xl bg-black/40 border border-[var(--md-sys-color-outline-variant)] shadow-inner">
            <SmilesCanvas
              smiles={currentMolecule.smiles}
              width={420}
              height={260}
              theme="dark"
              className="max-w-full"
            />
          </div>
        </div>

        {/* Molecular Chemical Details Chips */}
        <div className="p-4 sm:p-5 bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)] flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="m3-chip gap-1.5 py-1 px-3">
              <Atom className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0" />
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] uppercase font-medium">
                Fórmula:
              </span>
              <strong className="font-mono font-bold text-xs text-[var(--md-sys-color-on-surface)]">
                {currentMolecule.formula}
              </strong>
            </div>

            <div className="m3-chip gap-1.5 py-1 px-3">
              <Layers className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0" />
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] uppercase font-medium">
                Função:
              </span>
              <span className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                {functionLabel}
              </span>
            </div>

            <span className="m3-chip font-mono text-xs uppercase py-1 px-2.5">
              {currentMolecule.difficulty}
            </span>

            {difficultyFilter === 'caos' && (
              <span className="m3-chip bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--md-sys-color-error)] font-bold font-mono text-xs py-1 px-2.5 flex items-center gap-1">
                <Flame className="w-3 h-3 text-[var(--md-sys-color-error)]" />
                CAOS
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={closeMoleculeZoom}
            className="m3-button-filled w-full py-2.5 font-bold text-xs tracking-wider uppercase cursor-pointer"
          >
            Voltar ao Treino
          </button>
        </div>
      </div>
    </div>
  );
};
