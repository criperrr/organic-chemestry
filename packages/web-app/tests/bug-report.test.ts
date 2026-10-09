import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/stores/useGameStore.js';
import fs from 'node:fs';
import path from 'node:path';

describe('Bug Report System', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeTab: 'arcade',
      isBugReportModalOpen: false,
      bugReportContext: null,
      soundEnabled: false,
      currentMolecule: {
        id: 'test-mol-123',
        smiles: 'CC(C)C',
        formula: 'C4H10',
        iupacName: '2-metilpropano',
        commonNames: ['isobutano'],
        primaryFunction: 'hidrocarboneto',
        secondaryFunctions: [],
        difficulty: 'iniciante',
      },
      userInput: 'metilpropano',
    });
  });

  it('opens bug report modal with auto-captured technical context', () => {
    const { openBugReportModal } = useGameStore.getState();

    openBugReportModal();

    const state = useGameStore.getState();
    expect(state.isBugReportModalOpen).toBe(true);
    expect(state.bugReportContext).not.toBeNull();
    expect(state.bugReportContext?.moleculeId).toBe('test-mol-123');
    expect(state.bugReportContext?.iupacName).toBe('2-metilpropano');
    expect(state.bugReportContext?.formula).toBe('C4H10');
    expect(state.bugReportContext?.smiles).toBe('CC(C)C');
    expect(state.bugReportContext?.userInput).toBe('metilpropano');
    expect(state.bugReportContext?.activeTab).toBe('arcade');
  });

  it('allows overriding or augmenting context when reporting from feedback card', () => {
    const { openBugReportModal } = useGameStore.getState();

    openBugReportModal({
      score: 0.8,
      userInput: 'butano',
      activeTab: 'arcade',
    });

    const state = useGameStore.getState();
    expect(state.isBugReportModalOpen).toBe(true);
    expect(state.bugReportContext?.score).toBe(0.8);
    expect(state.bugReportContext?.userInput).toBe('butano');
    expect(state.bugReportContext?.moleculeId).toBe('test-mol-123');
  });

  it('closes bug report modal and clears context', () => {
    const { openBugReportModal, closeBugReportModal } = useGameStore.getState();

    openBugReportModal();
    expect(useGameStore.getState().isBugReportModalOpen).toBe(true);

    closeBugReportModal();
    expect(useGameStore.getState().isBugReportModalOpen).toBe(false);
    expect(useGameStore.getState().bugReportContext).toBeNull();
  });

  it('writes and structures reports in reports/ directory', () => {
    const reportsDir = path.resolve(__dirname, '../../../reports');
    const screenshotsDir = path.join(reportsDir, 'screenshots');

    expect(fs.existsSync(reportsDir)).toBe(true);
    expect(fs.existsSync(screenshotsDir)).toBe(true);
    expect(fs.existsSync(path.join(reportsDir, 'README.md'))).toBe(true);
  });
});
