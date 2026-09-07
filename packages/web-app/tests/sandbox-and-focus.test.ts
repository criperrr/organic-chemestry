import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../src/stores/useGameStore.js';
import { parseIUPACName } from '@quimicarush/chemistry-core';
import { datasetProvider } from '@quimicarush/chemistry-dataset';

describe('useGameStore - Fullscreen & Sandbox Tab Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      isFullscreen: false,
      activeTab: 'arcade',
      soundEnabled: false,
    });
  });

  it('initializes with isFullscreen false and activeTab arcade', () => {
    const state = useGameStore.getState();
    expect(state.isFullscreen).toBe(false);
    expect(state.activeTab).toBe('arcade');
  });

  it('supports activeTab = "sandbox"', () => {
    const { setActiveTab } = useGameStore.getState();
    setActiveTab('sandbox');
    expect(useGameStore.getState().activeTab).toBe('sandbox');

    setActiveTab('theory');
    expect(useGameStore.getState().activeTab).toBe('theory');

    setActiveTab('arcade');
    expect(useGameStore.getState().activeTab).toBe('arcade');
  });

  it('toggles fullscreen state smoothly', () => {
    const { toggleFullscreen } = useGameStore.getState();

    expect(useGameStore.getState().isFullscreen).toBe(false);

    toggleFullscreen();
    expect(useGameStore.getState().isFullscreen).toBe(true);

    toggleFullscreen();
    expect(useGameStore.getState().isFullscreen).toBe(false);
  });

  it('sets fullscreen explicitly with setFullscreen', () => {
    const { setFullscreen } = useGameStore.getState();

    setFullscreen(true);
    expect(useGameStore.getState().isFullscreen).toBe(true);

    setFullscreen(false);
    expect(useGameStore.getState().isFullscreen).toBe(false);
  });

  it('sets custom molecule via setCurrentMolecule', () => {
    const { setCurrentMolecule } = useGameStore.getState();
    const testMol = {
      id: 'test-sandbox-mol',
      iupacName: 'propano',
      smiles: 'CCC',
      formula: 'C3H8',
      primaryFunction: 'hidrocarboneto' as const,
      difficulty: 'iniciante' as const,
    };

    setCurrentMolecule(testMol);
    expect(useGameStore.getState().currentMolecule).toEqual(testMol);
    expect(useGameStore.getState().userInput).toBe('');
    expect(useGameStore.getState().isAnswerSubmitted).toBe(false);
  });
});

describe('SandboxHub IUPAC Morphology Inspection Logic', () => {
  it('parses ethanol (etanol) into distinct morphological blocks', () => {
    const ast = parseIUPACName('etanol');
    expect(ast).toBeDefined();
    expect(ast.mainChainPrefix).toBe('et');
    expect(ast.carbonCount).toBe(2);
    expect(ast.functionSuffix).toBe('ol');
    expect(ast.primaryFunction).toBe('alcool');
  });

  it('parses branched molecules with radicals correctly', () => {
    const ast = parseIUPACName('2-metilpropano');
    expect(ast).toBeDefined();
    expect(ast.mainChainPrefix).toBe('prop');
    expect(ast.carbonCount).toBe(3);
    expect(ast.substituents.length).toBe(1);
    expect(ast.substituents[0].name).toBe('metil');
    expect(ast.substituents[0].locants).toEqual([2]);
  });

  it('parses cyclic molecules correctly', () => {
    const ast = parseIUPACName('ciclopentano');
    expect(ast).toBeDefined();
    expect(ast.isRing).toBe(true);
    expect(ast.mainChainPrefix).toBe('pent');
    expect(ast.carbonCount).toBe(5);
    expect(ast.functionSuffix).toBe('o');
  });

  it('provides rich preset molecule library from datasetProvider', () => {
    const all = datasetProvider.getAllMolecules();
    expect(all.length).toBeGreaterThan(50);

    const hydrocarbons = all.filter((m) => m.primaryFunction === 'hidrocarboneto');
    const alcohols = all.filter((m) => m.primaryFunction === 'alcool');

    expect(hydrocarbons.length).toBeGreaterThan(5);
    expect(alcohols.length).toBeGreaterThan(5);
  });
});
