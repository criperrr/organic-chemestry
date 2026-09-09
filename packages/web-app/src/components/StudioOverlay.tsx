import React, { useCallback, useEffect } from 'react';
import { MoleculeStudio } from '@quimicarush/molecule-canvas';
import type { MolecularGraphAnalysis } from '@quimicarush/chemistry-core';
import { useGameStore } from '../stores/useGameStore.js';

/**
 * The Molecule Studio, mounted over the whole app.
 *
 * The builder embedded in the Laboratório tab has to share the page with the
 * nav rails, the tab bar and its own cards, which leaves a drawing area too
 * small to work in. Here the canvas gets the entire viewport and everything
 * else floats above it.
 */
export const StudioOverlay: React.FC = () => {
  const { isStudioOpen, setStudioOpen, setCurrentMolecule, setActiveTab } = useGameStore();

  // The page behind must not scroll while the studio is up.
  useEffect(() => {
    if (!isStudioOpen || typeof document === 'undefined') return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isStudioOpen]);

  const handleSendToArcade = useCallback(
    (analysis: MolecularGraphAnalysis) => {
      setCurrentMolecule({
        id: `studio-${Date.now()}`,
        smiles: analysis.smiles,
        iupacName: analysis.iupacName2013,
        commonNames: [],
        primaryFunction: analysis.primaryFunction,
        secondaryFunctions: analysis.secondaryFunctions,
        difficulty: 'avancado',
        formula: analysis.formula,
        realWorldStory: 'Molécula desenhada por você no Estúdio.',
        educationalContext: 'Construção livre no canvas esquelético.',
      });
      setStudioOpen(false);
      setActiveTab('arcade');
    },
    [setCurrentMolecule, setActiveTab, setStudioOpen]
  );

  if (!isStudioOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[var(--md-sys-color-surface)]">
      <MoleculeStudio onExit={() => setStudioOpen(false)} onSendToArcade={handleSendToArcade} />
    </div>
  );
};
