import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  Lightbulb,
  Send,
  Eye,
  EyeOff,
  Target,
  Beaker,
  Maximize2,
} from 'lucide-react';
import {
  analyzeMolecularGraph,
  functionLabelPtBR,
  FUNCTION_GUIDE,
  type MolecularGraphAnalysis,
  type MolecularGraphData,
  type OrganicFunction,
} from '@quimicarush/chemistry-core';
import { soundSynth } from '@quimicarush/gamification-engine';
import { SkeletalCanvas } from '@quimicarush/molecule-canvas';
import { useGameStore } from '../../stores/useGameStore.js';
import { haptics } from '../../utils/haptics.js';

const EMPTY_GRAPH: MolecularGraphData = { atoms: [], bonds: [] };

/**
 * Interactive molecule builder with live IUPAC naming.
 *
 * Everything the student draws on the skeletal canvas is re-analysed on every
 * edit: canonical name (2013 and 1993), molecular formula, SMILES, the functions
 * present, and a step-by-step derivation of *why* the name is what it is.
 */
export const LiveBuilder: React.FC = () => {
  const { setCurrentMolecule, setActiveTab, openMoleculeZoom, setStudioOpen } = useGameStore();

  const [graph, setGraph] = useState<MolecularGraphData>(EMPTY_GRAPH);
  const [showSteps, setShowSteps] = useState(true);
  const [blindMode, setBlindMode] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const analysis: MolecularGraphAnalysis = useMemo(
    () => analyzeMolecularGraph(graph),
    [graph]
  );

  // --- Reward feedback: celebrate when a *new* function class appears --------
  const previousFunctions = useRef<string>('');
  const [flashName, setFlashName] = useState(false);

  useEffect(() => {
    if (!analysis.isNameable) return;
    const signature = [...analysis.detectedFunctions].sort().join('|');
    if (signature && signature !== previousFunctions.current) {
      const isFirstRender = previousFunctions.current === '';
      previousFunctions.current = signature;
      if (!isFirstRender) {
        soundSynth.playSpeedBonus();
        haptics.success();
        setFlashName(true);
        const timer = setTimeout(() => setFlashName(false), 620);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [analysis.detectedFunctions, analysis.isNameable]);

  // Re-hide the answer whenever the structure changes in blind mode.
  useEffect(() => {
    if (blindMode) setRevealed(false);
  }, [graph, blindMode]);

  const handleCopy = useCallback((text: string, field: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      soundSynth.playClick();
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  }, []);

  const handleSendToArcade = useCallback(() => {
    if (!analysis.isNameable || !analysis.iupacName2013) return;
    soundSynth.playBadgeUnlock();
    haptics.success();
    setCurrentMolecule({
      id: `sandbox-${Date.now()}`,
      smiles: analysis.smiles,
      iupacName: analysis.iupacName2013,
      commonNames: [],
      primaryFunction: analysis.primaryFunction,
      secondaryFunctions: analysis.secondaryFunctions,
      difficulty: 'avancado',
      formula: analysis.formula,
      realWorldStory: 'Molécula desenhada por você no Laboratório.',
      educationalContext: 'Construção livre no canvas esquelético.',
    });
    setActiveTab('arcade');
  }, [analysis, setCurrentMolecule, setActiveTab]);

  const nameHidden = blindMode && !revealed;
  const allFunctions: OrganicFunction[] = analysis.isNameable
    ? [analysis.primaryFunction, ...analysis.secondaryFunctions]
    : [];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ------------------------------------------------------------------ */}
      {/* Live name readout — the whole point of the builder                  */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={`m3-card p-4 sm:p-5 flex flex-col gap-3 transition-transform duration-300 ${
          flashName ? 'scale-[1.015]' : 'scale-100'
        }`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
            <Sparkles
              className={`w-4 h-4 ${
                flashName
                  ? 'text-[var(--md-sys-color-tertiary)] animate-pulse'
                  : 'text-[var(--md-sys-color-primary)]'
              }`}
            />
            Nome IUPAC em tempo real
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundSynth.playClick();
                setBlindMode(v => !v);
                setRevealed(false);
              }}
              className={`m3-chip py-1 px-2.5 text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                blindMode
                  ? 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] border-[var(--md-sys-color-tertiary)]'
                  : ''
              }`}
              title="Esconde o nome enquanto você desenha: tente adivinhar antes de revelar"
            >
              <Target className="w-3.5 h-3.5" />
              Modo desafio
            </button>
            {analysis.isNameable && (
              <button
                type="button"
                onClick={() => handleCopy(analysis.iupacName2013, 'iupac')}
                className="m3-chip py-1 px-2 text-[11px]"
                title="Copiar nome"
              >
                {copiedField === 'iupac' ? (
                  <Check className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {analysis.problems.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {analysis.problems.map((problem, i) => (
              <div
                key={`${problem.code}-${i}`}
                className="flex items-start gap-2 text-[12px] px-3 py-2 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
                <span>{problem.message}</span>
              </div>
            ))}
          </div>
        )}

        {analysis.isNameable && (
          <>
            {nameHidden ? (
              <button
                type="button"
                onClick={() => {
                  soundSynth.playStreak(3);
                  haptics.tap();
                  setRevealed(true);
                }}
                className="w-full py-6 rounded-2xl border-2 border-dashed border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface-variant)] hover:border-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-primary)] transition-colors flex flex-col items-center gap-1.5"
              >
                <EyeOff className="w-5 h-5" />
                <span className="font-bold text-sm">Diga o nome em voz alta e revele</span>
                <span className="text-[11px] font-mono">
                  {analysis.formula} · {analysis.parentSize} carbono(s) na cadeia principal
                </span>
              </button>
            ) : (
              <div className="flex flex-col gap-1">
                <h2
                  className={`text-2xl sm:text-3xl font-bold tracking-tight leading-tight break-words ${
                    flashName
                      ? 'text-[var(--md-sys-color-tertiary)]'
                      : 'text-[var(--md-sys-color-primary)]'
                  } transition-colors duration-300`}
                >
                  {analysis.iupacName2013}
                </h2>
                {analysis.iupacName1993 !== analysis.iupacName2013 && (
                  <p className="text-[12px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                    notação antiga (1993): <strong>{analysis.iupacName1993}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Identity chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
              <span className="m3-chip py-1 px-2.5">
                <strong>{analysis.formula}</strong>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(analysis.smiles, 'smiles')}
                className="m3-chip py-1 px-2.5 hover:border-[var(--md-sys-color-primary)] transition-colors"
                title="Copiar SMILES"
              >
                {copiedField === 'smiles' ? (
                  <Check className="w-3 h-3 text-[var(--md-sys-color-primary)]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span className="truncate max-w-[200px]">{analysis.smiles}</span>
              </button>
              <span className="m3-chip py-1 px-2.5">
                {analysis.parentType === 'ring' ? 'anel' : 'cadeia'} de {analysis.parentSize} C
              </span>
            </div>

            {/* Functions present */}
            {!nameHidden && allFunctions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {allFunctions.map((fn, index) => {
                  const guide = FUNCTION_GUIDE[fn];
                  const isPrincipal = index === 0;
                  return (
                    <span
                      key={fn}
                      title={`${guide.recognition} — sufixo ${guide.suffix}`}
                      className={`m3-chip py-1 px-2.5 text-[11px] font-bold gap-1.5 ${
                        isPrincipal
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]'
                          : ''
                      }`}
                    >
                      {functionLabelPtBR(fn)}
                      <span className="font-mono opacity-70">{guide.suffix}</span>
                      {isPrincipal && allFunctions.length > 1 && (
                        <span className="text-[9px] uppercase tracking-wider opacity-80">
                          manda no sufixo
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                type="button"
                onClick={handleSendToArcade}
                className="m3-chip py-1.5 px-3 text-[11px] font-bold gap-1.5 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:border-[var(--md-sys-color-primary)] transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Treinar esta molécula no Arcade
              </button>
              <button
                type="button"
                onClick={() => {
                  soundSynth.playClick();
                  openMoleculeZoom();
                }}
                className="m3-chip py-1.5 px-3 text-[11px] font-bold gap-1.5"
              >
                <Beaker className="w-3.5 h-3.5" />
                Ver renderizado
              </button>
            </div>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* The drawing surface                                                 */}
      {/* ------------------------------------------------------------------ */}
      <button
        type="button"
        onClick={() => setStudioOpen(true)}
        className="m3-button-filled w-full py-2.5 text-sm justify-center gap-2"
        title="Abrir o Estúdio: a tela inteira para desenhar, com painéis flutuantes"
      >
        <Maximize2 className="w-4 h-4" />
        Abrir Estúdio em tela cheia
      </button>

      <SkeletalCanvas onGraphChange={setGraph} height={520} />

      {/* ------------------------------------------------------------------ */}
      {/* Derivation of the name, step by step                                */}
      {/* ------------------------------------------------------------------ */}
      {analysis.isNameable && analysis.steps.length > 0 && !nameHidden && (
        <div className="m3-card overflow-hidden">
          <button
            type="button"
            onClick={() => {
              soundSynth.playClick();
              setShowSteps(v => !v);
            }}
            className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-[var(--md-sys-color-on-surface)]">
              <Lightbulb className="w-4 h-4 text-[var(--md-sys-color-tertiary)]" />
              Por que esse nome?
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] transition-transform ${
                showSteps ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showSteps && (
            <ol className="px-4 pb-4 flex flex-col gap-2.5">
              {analysis.steps.map(step => (
                <li
                  key={step.title}
                  className="flex flex-col gap-0.5 pl-3 border-l-2 border-[var(--md-sys-color-primary)]/40"
                >
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                    {step.title}
                  </span>
                  <span className="text-[13px] leading-snug text-[var(--md-sys-color-on-surface-variant)]">
                    {step.detail}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {blindMode && analysis.isNameable && !revealed && (
        <p className="text-center text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          Modo desafio ligado: desenhe, tente nomear de cabeça e só então revele.
        </p>
      )}
    </div>
  );
};
