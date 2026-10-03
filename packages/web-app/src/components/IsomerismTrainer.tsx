import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  GitFork,
  Check,
  X,
  ArrowRight,
  Lightbulb,
  Atom,
  Flame,
} from 'lucide-react';
import { FluidMolecule } from './FluidMolecule.js';
import {
  ISOMERISM_TYPES_META,
  gradeIsomerPair,
  gradeChiralCount,
  gradeGeometricCondition,
  type IsomerismType,
  type IsomerismCategory,
  type IsomerPairQuestion,
  type ChiralCenterQuestion,
  type GeometricConditionQuestion,
  type IsomerismGradingResult,
} from '@quimicarush/chemistry-core';
import {
  isomerismProvider,
  CANONICAL_ISOMER_PAIRS,
  CANONICAL_CHIRAL_QUESTIONS,
  CANONICAL_GEOMETRIC_QUESTIONS,
} from '@quimicarush/chemistry-dataset';
import { soundSynth } from '@quimicarush/gamification-engine';
import { useGameStore } from '../stores/useGameStore.js';

export type IsomerismGameMode = 'pairs' | 'chiral' | 'geometric' | 'mixed';

const ISOMERISM_ORDER: IsomerismType[] = [
  'funcao',
  'cadeia',
  'posicao',
  'metameria',
  'tautomeria',
  'geometrica',
  'optica',
  'nao_isomeros',
  'mesmo_composto',
];

export const IsomerismTrainer: React.FC = () => {
  const { awardModeResult, streak, multiplier } = useGameStore();

  // Mode and filter states
  const [activeMode, setActiveMode] = useState<IsomerismGameMode>('pairs');
  const [categoryFilter, setCategoryFilter] = useState<IsomerismCategory | 'todas'>('todas');
  const [roundSeed, setRoundSeed] = useState(() => Math.floor(Math.random() * 1000));

  // Round lifecycle state
  const [isGraded, setIsGraded] = useState(false);
  const [selectedPairAnswer, setSelectedPairAnswer] = useState<IsomerismType | null>(null);
  const [selectedChiralAnswer, setSelectedChiralAnswer] = useState<number | null>(null);
  const [selectedGeomAnswer, setSelectedGeomAnswer] = useState<boolean | null>(null);
  const [pairGrading, setPairGrading] = useState<IsomerismGradingResult | null>(null);

  const startTimeRef = useRef(Date.now());

  // Questions pools
  const pairPool = useMemo(() => {
    return isomerismProvider.getPairQuestions({
      category: categoryFilter,
    });
  }, [categoryFilter]);

  const chiralPool = useMemo(() => {
    return isomerismProvider.getChiralQuestions();
  }, []);

  const geomPool = useMemo(() => {
    return isomerismProvider.getGeometricQuestions();
  }, []);

  // Effective mode when 'mixed' is picked
  const effectiveMode = useMemo((): 'pairs' | 'chiral' | 'geometric' => {
    if (activeMode !== 'mixed') return activeMode;
    const modes: ('pairs' | 'chiral' | 'geometric')[] = ['pairs', 'pairs', 'chiral', 'geometric'];
    return modes[roundSeed % modes.length];
  }, [activeMode, roundSeed]);

  // Current questions
  const currentPair: IsomerPairQuestion = useMemo(() => {
    const list = pairPool.length > 0 ? pairPool : CANONICAL_ISOMER_PAIRS;
    return list[roundSeed % list.length];
  }, [pairPool, roundSeed]);

  const currentChiral: ChiralCenterQuestion = useMemo(() => {
    const list = chiralPool.length > 0 ? chiralPool : CANONICAL_CHIRAL_QUESTIONS;
    return list[roundSeed % list.length];
  }, [chiralPool, roundSeed]);

  const currentGeom: GeometricConditionQuestion = useMemo(() => {
    const list = geomPool.length > 0 ? geomPool : CANONICAL_GEOMETRIC_QUESTIONS;
    return list[roundSeed % list.length];
  }, [geomPool, roundSeed]);

  // Reset timer on new question
  useEffect(() => {
    startTimeRef.current = Date.now();
    setIsGraded(false);
    setSelectedPairAnswer(null);
    setSelectedChiralAnswer(null);
    setSelectedGeomAnswer(null);
    setPairGrading(null);
  }, [roundSeed, activeMode, categoryFilter]);

  // Handlers for Submissions
  const handleSelectPairAnswer = useCallback(
    (type: IsomerismType) => {
      if (isGraded) return;
      soundSynth.playClick();
      setSelectedPairAnswer(type);

      const elapsed = Date.now() - startTimeRef.current;
      const result = gradeIsomerPair(type, currentPair.relation);
      setPairGrading(result);
      setIsGraded(true);

      awardModeResult({
        score: result.score,
        isPerfect: result.correct,
        responseTimeMs: elapsed,
        label: result.correct ? 'Isomeria Correta' : 'Isomeria Errada',
      });
    },
    [isGraded, currentPair, awardModeResult]
  );

  const handleSelectChiralAnswer = useCallback(
    (count: number) => {
      if (isGraded) return;
      soundSynth.playClick();
      setSelectedChiralAnswer(count);

      const elapsed = Date.now() - startTimeRef.current;
      const result = gradeChiralCount(count, currentChiral.chiralCarbonCount);
      setIsGraded(true);

      awardModeResult({
        score: result.score,
        isPerfect: result.correct,
        responseTimeMs: elapsed,
        label: result.correct ? 'Detetive Quiral' : 'Quiralidade Errada',
      });
    },
    [isGraded, currentChiral, awardModeResult]
  );

  const handleSelectGeomAnswer = useCallback(
    (answer: boolean) => {
      if (isGraded) return;
      soundSynth.playClick();
      setSelectedGeomAnswer(answer);

      const elapsed = Date.now() - startTimeRef.current;
      const result = gradeGeometricCondition(
        answer,
        currentGeom.hasGeometricIsomerism,
        currentGeom.reason
      );
      setIsGraded(true);

      awardModeResult({
        score: result.score,
        isPerfect: result.correct,
        responseTimeMs: elapsed,
        label: result.correct ? 'Radar Cis-Trans' : 'Geométrica Errada',
      });
    },
    [isGraded, currentGeom, awardModeResult]
  );

  const handleNextRound = useCallback(() => {
    soundSynth.playClick();
    setRoundSeed(prev => prev + 1);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      if (isGraded && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        handleNextRound();
        return;
      }

      if (!isGraded) {
        if (effectiveMode === 'pairs') {
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= ISOMERISM_ORDER.length) {
            e.preventDefault();
            handleSelectPairAnswer(ISOMERISM_ORDER[num - 1]);
          }
        } else if (effectiveMode === 'chiral') {
          const num = parseInt(e.key, 10);
          if (num >= 0 && num <= 5) {
            e.preventDefault();
            handleSelectChiralAnswer(num);
          }
        } else if (effectiveMode === 'geometric') {
          if (e.key === 's' || e.key === 'S' || e.key === '1') {
            e.preventDefault();
            handleSelectGeomAnswer(true);
          } else if (e.key === 'n' || e.key === 'N' || e.key === '2') {
            e.preventDefault();
            handleSelectGeomAnswer(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isGraded,
    effectiveMode,
    handleNextRound,
    handleSelectPairAnswer,
    handleSelectChiralAnswer,
    handleSelectGeomAnswer,
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 py-3 px-2 sm:px-4 select-none">
      {/* Top Controls & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
            <GitFork className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
              <span>Praticar Isomeria</span>
              {streak >= 3 && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  {streak}x · {multiplier.toFixed(1)}x XP
                </span>
              )}
            </h1>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Treine todos os tipos de isomeria plana e espacial com feedback deconstrutivo
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'pairs' as const, label: 'Pares' },
              { id: 'chiral' as const, label: 'Quiralidade' },
              { id: 'geometric' as const, label: 'Cis-Trans' },
              { id: 'mixed' as const, label: 'Misto' },
            ] as const
          ).map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                soundSynth.playClick();
                setActiveMode(m.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeMode === m.id
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills (Only relevant in pairs mode) */}
      {effectiveMode === 'pairs' && (
        <div className="flex items-center gap-2 px-1 text-xs">
          <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">Filtrar:</span>
          {(
            [
              { id: 'todas' as const, label: 'Todas as Isomerias' },
              { id: 'plana' as const, label: 'Isomeria Plana' },
              { id: 'espacial' as const, label: 'Isomeria Espacial' },
            ] as const
          ).map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                soundSynth.playClick();
                setCategoryFilter(f.id);
                setRoundSeed(prev => prev + 1);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border ${
                categoryFilter === f.id
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-[var(--md-sys-color-primary)]'
                  : 'bg-transparent text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: CLASSIFICAÇÃO DE PARES DE ISÔMEROS */}
      {/* ========================================================================= */}
      {effectiveMode === 'pairs' && currentPair && (
        <div className="w-full flex flex-col gap-4 animate-fadeIn">
          {/* Question Banner */}
          <div className="text-center py-1">
            <h2 className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)]">
              Qual é a relação isomérica entre estas duas moléculas?
            </h2>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Analise as fórmulas moleculares, conectividade e disposição espacial
            </p>
          </div>

          {/* Molecule Comparison Stage (Side-by-side or stacked on small mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Molecule A */}
            <div className="m3-card p-4 flex flex-col items-center gap-3 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl relative">
              <div className="w-full flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-[11px]">
                  Estrutura A
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-highest)] font-semibold text-[11px]">
                  {currentPair.moleculeA.formula}
                </span>
              </div>

              <div className="w-full h-36 sm:h-44 flex items-center justify-center p-1 sm:p-2">
                <FluidMolecule smiles={currentPair.moleculeA.smiles} maxWidth={320} aspect={0.52} />
              </div>

              <div className="w-full text-center border-t border-[var(--md-sys-color-outline-variant)] pt-2 sm:pt-2.5">
                <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] truncate">
                  {currentPair.moleculeA.name}
                </h3>
              </div>
            </div>

            {/* Molecule B */}
            <div className="m3-card p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl relative">
              <div className="w-full flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold text-[11px]">
                  Estrutura B
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-highest)] font-semibold text-[11px]">
                  {currentPair.moleculeB.formula}
                </span>
              </div>

              <div className="w-full h-36 sm:h-44 flex items-center justify-center p-1 sm:p-2">
                <FluidMolecule smiles={currentPair.moleculeB.smiles} maxWidth={320} aspect={0.52} />
              </div>

              <div className="w-full text-center border-t border-[var(--md-sys-color-outline-variant)] pt-2.5">
                <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] truncate">
                  {currentPair.moleculeB.name}
                </h3>
              </div>
            </div>
          </div>

          {/* Interactive Option Grid */}
          <div className="w-full flex flex-col gap-2 mt-1">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider px-1">
              Selecione o Tipo de Isomeria (ou use as teclas 1-9):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ISOMERISM_ORDER.map((type, idx) => {
                const meta = ISOMERISM_TYPES_META[type];
                const isSelected = selectedPairAnswer === type;
                const isCorrect = currentPair.relation === type;

                let buttonStyle =
                  'bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]';

                if (isGraded) {
                  if (isCorrect) {
                    buttonStyle =
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/40';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle =
                      'bg-rose-500/20 text-rose-300 border-rose-500/60 ring-2 ring-rose-500/40';
                  } else {
                    buttonStyle = 'opacity-40 bg-slate-900/40 border-slate-800 text-slate-500';
                  }
                } else if (isSelected) {
                  buttonStyle =
                    'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]';
                }

                return (
                  <button
                    key={type}
                    type="button"
                    disabled={isGraded}
                    onClick={() => handleSelectPairAnswer(type)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${buttonStyle}`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-bold truncate">{meta.name}</span>
                      <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                        {meta.category === 'plana'
                          ? 'Isomeria Plana'
                          : meta.category === 'espacial'
                            ? 'Isomeria Espacial'
                            : 'Checagem'}
                      </span>
                    </div>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-[10px] font-mono shrink-0">
                      {idx + 1}
                    </kbd>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Deconstructive Feedback Card */}
          {isGraded && pairGrading && (
            <div
              className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col gap-3.5 transition-all animate-fadeIn ${
                pairGrading.correct
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {pairGrading.correct ? (
                    <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">
                      <X className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm sm:text-base font-bold">
                      {pairGrading.correct ? 'Acerto Perfeito!' : 'Resposta Incorreta'}
                    </h4>
                    <p className="text-xs opacity-80">{pairGrading.feedback}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-4 py-2 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <span>Próximo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Chemical Comparison Breakdown */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300">
                  <Atom className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Fórmula A: <strong>{currentPair.comparison.formulaA}</strong> · Fórmula B:{' '}
                    <strong>{currentPair.comparison.formulaB}</strong>
                  </span>
                  {currentPair.comparison.sameFormula ? (
                    <span className="text-emerald-400 ml-auto font-sans font-semibold">
                      ✓ Fórmulas Idênticas (Isômeros)
                    </span>
                  ) : (
                    <span className="text-rose-400 ml-auto font-sans font-semibold">
                      ✗ Fórmulas Diferentes (Não Isômeros)
                    </span>
                  )}
                </div>

                <p className="text-slate-300 leading-relaxed">{currentPair.explanation}</p>

                <div className="flex items-start gap-1.5 mt-1 pt-2 border-t border-white/10 text-amber-300 text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>Dica ENEM / Vestibular:</strong>{' '}
                    {ISOMERISM_TYPES_META[currentPair.relation].enemTip}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: DETETIVE QUIRAL & ISOMERIA ÓPTICA */}
      {/* ========================================================================= */}
      {effectiveMode === 'chiral' && currentChiral && (
        <div className="w-full flex flex-col gap-4 animate-fadeIn">
          <div className="text-center py-1">
            <h2 className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)]">
              Quantos carbonos assimétricos / quirais (C*) existem nesta molécula?
            </h2>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Identifique os carbonos sp³ ligados a 4 grupos químicos totalmente distintos
            </p>
          </div>

          {/* Molecule Card */}
          <div className="m3-card p-5 flex flex-col items-center gap-3 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl relative">
            <div className="w-full flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-[11px]">
                  {currentChiral.molecule.name}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-highest)] font-semibold text-[11px]">
                {currentChiral.molecule.formula}
              </span>
            </div>

            <div className="w-full h-52 flex items-center justify-center p-3">
              <FluidMolecule smiles={currentChiral.molecule.smiles} maxWidth={360} aspect={0.55} />
            </div>

            {currentChiral.molecule.realWorldStory && (
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center italic max-w-xl">
                "{currentChiral.molecule.realWorldStory}"
              </p>
            )}
          </div>

          {/* Numeric Option Buttons */}
          <div className="w-full flex flex-col items-center gap-2 mt-1">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Número de Carbonos Quirais (C*):
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-md">
              {[0, 1, 2, 3, 4, 8].map(count => {
                const isSelected = selectedChiralAnswer === count;
                const isCorrect = currentChiral.chiralCarbonCount === count;

                let style =
                  'bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-highest)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]';

                if (isGraded) {
                  if (isCorrect) {
                    style =
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/40';
                  } else if (isSelected && !isCorrect) {
                    style =
                      'bg-rose-500/20 text-rose-300 border-rose-500 ring-2 ring-rose-500/40';
                  } else {
                    style = 'opacity-40 bg-slate-900/40 border-slate-800 text-slate-500';
                  }
                }

                return (
                  <button
                    key={count}
                    type="button"
                    disabled={isGraded}
                    onClick={() => handleSelectChiralAnswer(count)}
                    className={`w-14 h-14 rounded-2xl border font-mono font-black text-lg flex flex-col items-center justify-center transition-all cursor-pointer ${style}`}
                  >
                    <span>{count}</span>
                    <span className="text-[9px] opacity-60 font-sans font-normal">
                      {count === 0 ? 'Aquiral' : 'C*'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deconstructive Feedback Card */}
          {isGraded && (
            <div
              className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col gap-3.5 transition-all animate-fadeIn ${
                selectedChiralAnswer === currentChiral.chiralCarbonCount
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selectedChiralAnswer === currentChiral.chiralCarbonCount ? (
                    <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">
                      <X className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm sm:text-base font-bold">
                      {selectedChiralAnswer === currentChiral.chiralCarbonCount
                        ? 'Excelente Detetive Quiral!'
                        : 'Contagem Incorreta'}
                    </h4>
                    <p className="text-xs opacity-80">
                      A molécula possui <strong>{currentChiral.chiralCarbonCount}</strong> carbono(s)
                      quiral(is) assimétrico(s).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-4 py-2 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <span>Próximo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Chiral Centers Breakdown & van 't Hoff Formula */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2.5 text-xs">
                {currentChiral.chiralCarbonDescriptions.length > 0 && (
                  <div>
                    <span className="font-bold text-cyan-300 block mb-1">
                      Localização dos Centros Assimétricos:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {currentChiral.chiralCarbonDescriptions.map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-slate-300 leading-relaxed">{currentChiral.explanation}</p>

                {/* van 't Hoff Formula Math Box */}
                {currentChiral.chiralCarbonCount > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 pt-2 border-t border-white/10 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-200">
                      <span className="font-bold block text-indigo-300">
                        Isômeros Opticamente Ativos:
                      </span>
                      {currentChiral.hasMesoForm
                        ? `${currentChiral.opticallyActiveCount} ativos (forma Meso inativa)`
                        : `2ⁿ = 2^${currentChiral.chiralCarbonCount} = ${currentChiral.opticallyActiveCount} isômeros ativos (d e l)`}
                    </div>

                    <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-200">
                      <span className="font-bold block text-purple-300">
                        Misturas Racêmicas Inativas:
                      </span>
                      {`2ⁿ⁻¹ = 2^${Math.max(0, currentChiral.chiralCarbonCount - 1)} = ${
                        currentChiral.racemicMixCount
                      } mistura(s) racêmica(s)`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: RADAR CIS-TRANS & ISOMERIA GEOMÉTRICA */}
      {/* ========================================================================= */}
      {effectiveMode === 'geometric' && currentGeom && (
        <div className="w-full flex flex-col gap-4 animate-fadeIn">
          <div className="text-center py-1">
            <h2 className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)]">
              Esta molécula apresenta Isomeria Geométrica (Cis-Trans / Z-E)?
            </h2>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Verifique se cada carbono da ligação dupla ou do anel rígido possui ligantes distintos (R1 ≠ R2 e R3 ≠ R4)
            </p>
          </div>

          {/* Molecule Card */}
          <div className="m3-card p-5 flex flex-col items-center gap-3 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl relative">
            <div className="w-full flex items-center justify-between text-xs font-mono">
              <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-[11px]">
                {currentGeom.molecule.name}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-highest)] font-semibold text-[11px]">
                {currentGeom.molecule.formula}
              </span>
            </div>

            <div className="w-full h-52 flex items-center justify-center p-3">
              <FluidMolecule smiles={currentGeom.molecule.smiles} maxWidth={360} aspect={0.55} />
            </div>

            <div className="w-full flex items-center justify-center gap-2 text-xs font-mono">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Sistema Rígido:</span>
              <span className="font-bold text-[var(--md-sys-color-on-surface)] capitalize">
                {currentGeom.systemType === 'alqueno' ? 'Dupla Ligação C=C' : 'Cadeia Cíclica (Anel)'}
              </span>
            </div>
          </div>

          {/* Yes / No Buttons */}
          <div className="w-full flex items-center justify-center gap-4 mt-2">
            <button
              type="button"
              disabled={isGraded}
              onClick={() => handleSelectGeomAnswer(true)}
              className={`flex-1 max-w-xs py-4 px-6 rounded-2xl border font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isGraded
                  ? currentGeom.hasGeometricIsomerism
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/40'
                    : selectedGeomAnswer === true
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'opacity-40 bg-slate-900/40 border-slate-800 text-slate-500'
                  : 'bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-highest)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Check className="w-5 h-5 text-emerald-400" />
              <span>SIM, apresenta [S/1]</span>
            </button>

            <button
              type="button"
              disabled={isGraded}
              onClick={() => handleSelectGeomAnswer(false)}
              className={`flex-1 max-w-xs py-4 px-6 rounded-2xl border font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isGraded
                  ? !currentGeom.hasGeometricIsomerism
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/40'
                    : selectedGeomAnswer === false
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'opacity-40 bg-slate-900/40 border-slate-800 text-slate-500'
                  : 'bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-highest)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <X className="w-5 h-5 text-rose-400" />
              <span>NÃO apresenta [N/2]</span>
            </button>
          </div>

          {/* Deconstructive Feedback Card */}
          {isGraded && (
            <div
              className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col gap-3.5 transition-all animate-fadeIn ${
                selectedGeomAnswer === currentGeom.hasGeometricIsomerism
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selectedGeomAnswer === currentGeom.hasGeometricIsomerism ? (
                    <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">
                      <X className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm sm:text-base font-bold">
                      {selectedGeomAnswer === currentGeom.hasGeometricIsomerism
                        ? 'Radar Calibrado com Sucesso!'
                        : 'Identificação Incorreta'}
                    </h4>
                    <p className="text-xs opacity-80">
                      {currentGeom.hasGeometricIsomerism
                        ? 'A molécula APRESENTA isomeria geométrica cis-trans.'
                        : 'A molécula NÃO APRESENTA isomeria geométrica cis-trans.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-4 py-2 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <span>Próximo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2 text-xs">
                <p className="text-slate-300 leading-relaxed font-semibold">
                  {currentGeom.reason}
                </p>
                <p className="text-slate-300 leading-relaxed">{currentGeom.explanation}</p>
                <div className="flex items-start gap-1.5 mt-1 pt-2 border-t border-white/10 text-amber-300 text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>Condição Necessária:</strong> Em alcenos rígidos, cada átomo de carbono da dupla deve possuir ligantes distintos entre si: R₁ ≠ R₂ e R₃ ≠ R₄.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
