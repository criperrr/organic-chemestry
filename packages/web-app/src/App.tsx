import React, { useEffect } from 'react';
import { HUD } from './components/HUD.js';
import { SpeedrunnerInput } from './components/SpeedrunnerInput.js';
import { SlotBuilder } from './components/SlotBuilder.js';
import { FeedbackCard } from './components/FeedbackCard.js';
import { TheoryHub } from './components/TheoryHub.js';
import { KeyboardShortcuts } from './components/KeyboardShortcuts.js';
import { SmilesCanvas } from '@quimicarush/smiles-renderer';
import { soundSynth } from '@quimicarush/gamification-engine';
import { useGameStore } from './stores/useGameStore.js';
import {
  Sparkles,
  Flame,
  Atom,
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
    streak,
    multiplier,
    isFeverActive,
  } = useGameStore();

  const isOnFire = isFeverActive || streak >= 10 || multiplier >= 3.0;

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
      className={`min-h-screen flex flex-col bg-[#0a0b10] text-slate-100 selection:bg-cyan-500 selection:text-black transition-all ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* Global Hotkeys listener */}
      <KeyboardShortcuts />

      {/* Arcade High-Contrast HUD Header */}
      <HUD />

      {/* Main App Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 flex flex-col">
        {activeTab === 'theory' ? (
          <TheoryHub />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-4xl mx-auto w-full">
            {/* Molecule Presentation Card */}
            {currentMolecule ? (
              <div
                className={`w-full flex flex-col items-center gap-3 p-4 sm:p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md relative overflow-hidden transition-all duration-300 ${
                  isOnFire
                    ? 'border-2 border-orange-500/80 animate-fiery-aura shadow-2xl shadow-orange-950/60'
                    : 'border border-slate-800 shadow-2xl'
                }`}
              >
                {/* Ambient glow background */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Badge Strip */}
                <div className="w-full flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
                    <Atom className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      Fórmula: <strong className="text-white">{currentMolecule.formula}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-amber-300 capitalize">
                      {currentMolecule.difficulty}
                    </span>
                    {difficultyFilter === 'caos' && (
                      <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" />
                        CAOS
                      </span>
                    )}
                  </div>
                </div>

                {/* SmilesCanvas 2D Molecular Depiction */}
                <div className="w-full flex items-center justify-center p-2 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner my-1">
                  <SmilesCanvas
                    smiles={currentMolecule.smiles}
                    width={360}
                    height={220}
                    theme="dark"
                    className="max-w-full"
                  />
                </div>

                {/* Question Prompt */}
                <div className="text-center">
                  <h2 className="text-base sm:text-lg font-bold text-slate-200">
                    Qual é a nomenclatura IUPAC oficial canônica desta estrutura?
                  </h2>
                  <p className="text-xs text-slate-400">
                    {inputMode === 'speedrunner'
                      ? 'Digite rapidamente e tecle Enter para submeter'
                      : 'Monte a cadeia escolhendo os blocos morfológicos abaixo'}
                  </p>
                </div>

                {/* Input Modality Form (Speedrunner or SlotBuilder) */}
                <div className="w-full mt-1">
                  {inputMode === 'speedrunner' ? (
                    <SpeedrunnerInput />
                  ) : (
                    <SlotBuilder />
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
                <p>Carregando moléculas canônicas...</p>
              </div>
            )}

            {/* Deconstructive Partial Credit Feedback Card */}
            {isAnswerSubmitted && currentEvaluation && <FeedbackCard />}
          </div>
        )}
      </main>

      {/* Footer Hotkeys and Academic Attribution */}
      <footer className="w-full border-t border-slate-800/60 bg-[#0d101a]/80 py-3 px-4 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          {/* Keyboard Hotkeys Bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-mono">
            <span className="text-slate-400">Atalhos Globais:</span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
              [Tab] Modo
            </span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
              [Enter] Submeter / Avançar
            </span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
              [Esc] Limpar
            </span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
              [1-4] Dificuldade
            </span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
              [M] Áudio
            </span>
          </div>

          {/* Academic Source */}
          <div className="text-slate-400">
            Base teórica: <span className="text-slate-300 font-medium">funcoes.pdf</span> (Prof. Anderson Oliveira, CEASM/Cecierj)
          </div>
        </div>
      </footer>
    </div>
  );
};
