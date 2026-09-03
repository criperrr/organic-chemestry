import React, { useEffect, useState } from 'react';
import { NavigationRail, TelemetryRail, MobileTopBar, MobileControlSheet } from './components/HUD.js';
import { SpeedrunnerInput } from './components/SpeedrunnerInput.js';
import { SlotBuilder } from './components/SlotBuilder.js';
import { FeedbackCard } from './components/FeedbackCard.js';
import { TheoryHub } from './components/TheoryHub.js';
import { KeyboardShortcuts } from './components/KeyboardShortcuts.js';
import { KeyboardCheatsheetModal } from './components/KeyboardCheatsheetModal.js';
import { AchievementsModal } from './components/AchievementsModal.js';
import { MoleculeZoomModal } from './components/MoleculeZoomModal.js';
import { SmilesCanvas } from '@quimicarush/smiles-renderer';
import { soundSynth } from '@quimicarush/gamification-engine';
import { useGameStore } from './stores/useGameStore.js';
import {
  Sparkles,
  Flame,
  Atom,
  ZoomIn,
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    currentMolecule,
    initSession,
    activeTab,
    inputMode,
    isAnswerSubmitted,
    currentEvaluation,
    difficultyFilter,
    screenShake,
    openMoleculeZoom,
  } = useGameStore();

  const [isMobileScreen, setIsMobileScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    initSession();

    // Unlock Web Audio API context on first user interaction to comply with autoplay policy
    const handleFirstInteraction = () => {
      soundSynth.unlock().catch(() => {});
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [initSession]);

  return (
    <div
      className={`min-h-screen flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] transition-all ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* Global Hotkeys listener, Cheatsheet Modal, Achievements Modal, Zoom Modal & Mobile Control Sheet */}
      <KeyboardShortcuts />
      <KeyboardCheatsheetModal />
      <AchievementsModal />
      <MoleculeZoomModal />
      <MobileControlSheet />

      {/* Mobile Top Bar (< lg only: compact 52px header with telemetry indicators) */}
      <MobileTopBar />

      {/* Distributed 3-Column Workspace (Desktop >= lg) */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-0">
        {/* Left Rail: Navigation & Tools (Desktop) */}
        <NavigationRail />

        {/* Center Stage: 100% Focused on the Molecule & Interactive Input */}
        <main className="flex-1 flex flex-col items-center justify-start lg:justify-center px-2 py-3 sm:px-6 sm:py-8 min-w-0 w-full overflow-y-auto">
          {activeTab === 'theory' ? (
            <div className="w-full max-w-4xl mx-auto">
              <TheoryHub />
            </div>
          ) : (
            <div className="w-full max-w-2xl xl:max-w-3xl mx-auto flex flex-col items-center gap-4 sm:gap-6">
              {/* Molecule Presentation Stage (Material 3 Card - Clean & Serene) */}
              {currentMolecule ? (
                <div className="w-full flex flex-col gap-4 sm:gap-6">
                  <div className="m3-card w-full p-4 sm:p-7 flex flex-col items-center gap-3 sm:gap-4 transition-all duration-200 shadow-sm">
                    {/* Top Context Header */}
                    <div className="w-full flex items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="m3-chip gap-1.5 py-1 px-2.5 sm:px-3 truncate">
                          <Atom className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0" />
                          <span className="text-[10px] sm:text-[11px] text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">Fórmula:</span>
                          <strong className="font-bold text-[var(--md-sys-color-on-surface)]">{currentMolecule.formula}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={openMoleculeZoom}
                          title="Ampliar visualização 2D da molécula"
                          aria-label="Ampliar visualização 2D da molécula"
                          className="m3-chip hover:border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] py-1 px-2 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline text-[10px] font-mono font-bold uppercase">Zoom</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <span className="m3-chip font-mono text-[10px] sm:text-[11px] uppercase tracking-wider py-1 px-2 sm:px-2.5">
                          {currentMolecule.difficulty}
                        </span>
                        {difficultyFilter === 'caos' && (
                          <span className="m3-chip bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--md-sys-color-error)] font-bold font-mono text-[10px] sm:text-[11px] py-1 px-2 sm:px-2.5 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-[var(--md-sys-color-error)]" />
                            CAOS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SmilesCanvas 2D Molecular Depiction (Clickable to Zoom) */}
                    <div
                      className="w-full flex items-center justify-center p-2 sm:p-4 my-0.5 sm:my-1 cursor-zoom-in group relative"
                      onClick={openMoleculeZoom}
                      title="Toque para ampliar a estrutura 2D"
                    >
                      <SmilesCanvas
                        smiles={currentMolecule.smiles}
                        width={isMobileScreen ? 320 : 380}
                        height={isMobileScreen ? 190 : 220}
                        theme="dark"
                        className="max-w-full group-hover:scale-[1.01] transition-transform duration-150"
                      />
                      <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity bg-black/60 text-white/90 text-[10px] font-mono px-2 py-0.5 rounded pointer-events-none flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" />
                        <span>Toque p/ ampliar</span>
                      </div>
                    </div>

                    {/* Question Header */}
                    <div className="text-center max-w-xl mx-auto">
                      <h2 className="text-base sm:text-xl font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">
                        Qual é a nomenclatura IUPAC oficial canônica desta estrutura?
                      </h2>
                      <p className="text-[11px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 sm:mt-1.5">
                        {inputMode === 'speedrunner'
                          ? 'Digite a nomenclatura canônica e pressione Enter para submeter'
                          : 'Monte o nome morfológico selecionando os blocos interativos abaixo'}
                      </p>
                    </div>
                  </div>

                  {/* Input Modality Form (Speedrunner or SlotBuilder) */}
                  <div className="w-full">
                    {inputMode === 'speedrunner' ? (
                      <SpeedrunnerInput />
                    ) : (
                      <SlotBuilder />
                    )}
                  </div>

                  {/* Deconstructive Partial Credit Feedback Card */}
                  {isAnswerSubmitted && currentEvaluation && <FeedbackCard />}
                </div>
              ) : (
                <div className="p-12 text-center text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center gap-3">
                  <Sparkles className="w-8 h-8 text-[var(--md-sys-color-primary)] animate-spin" />
                  <p className="font-mono text-sm">Carregando moléculas canônicas...</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Rail: Telemetry & Filters (Desktop) */}
        <TelemetryRail />
      </div>
    </div>
  );
};

