import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Crosshair,
  Check,
  X,
  ArrowRight,
  Lightbulb,
  Zap,
  RotateCcw,
  Keyboard,
  Trophy,
} from 'lucide-react';
import { SmilesCanvas } from '@quimicarush/smiles-renderer';
import {
  FUNCTIONS_BY_PRIORITY,
  FUNCTION_GUIDE,
  gradeFunctionHunt,
  checkNomenclatureAnswer,
  analyzeMolecularGraph,
  createGraphFromSMILES,
  type OrganicFunction,
  type Molecule,
} from '@quimicarush/chemistry-core';
import { datasetProvider } from '@quimicarush/chemistry-dataset';
import { soundSynth } from '@quimicarush/gamification-engine';
import { useGameStore } from '../stores/useGameStore.js';
import { haptics } from '../utils/haptics.js';

/** Single-key shortcut for each function, so the round can be played mouse-free. */
const FUNCTION_HOTKEYS: Record<OrganicFunction, string> = {
  acido_carboxilico: 'q',
  anidrido: 'w',
  ester: 'e',
  haleto_acila: 'r',
  amida: 't',
  nitrila: 'y',
  aldeido: 'a',
  cetona: 's',
  alcool: 'd',
  enol: 'j',
  fenol: 'g',
  amina: 'h',
  eter: 'z',
  haleto_alquila: 'x',
  nitrocomposto: 'c',
  hidrocarboneto: 'b',
};

type Phase = 'hunting' | 'graded' | 'naming';

interface RoundTruth {
  molecule: Molecule;
  functions: OrganicFunction[];
}

/**
 * Builds the question pool. A molecule only qualifies when the graph engine and
 * the curated dataset agree on the principal function — that way the answer key
 * is never wrong.
 */
function buildPool(): RoundTruth[] {
  const pool: RoundTruth[] = [];
  for (const molecule of datasetProvider.getAllMolecules()) {
    try {
      const analysis = analyzeMolecularGraph(createGraphFromSMILES(molecule.smiles));
      if (!analysis.isNameable) continue;
      if (analysis.primaryFunction !== molecule.primaryFunction) continue;
      const functions = Array.from(
        new Set<OrganicFunction>([analysis.primaryFunction, ...analysis.secondaryFunctions])
      );
      pool.push({ molecule, functions });
    } catch {
      // A molecule the engine cannot parse is simply never asked.
    }
  }
  return pool;
}

export const FunctionHunt: React.FC = () => {
  const { awardModeResult, setCurrentMolecule, streak, multiplier } = useGameStore();

  const pool = useMemo(buildPool, []);
  const [roundIndex, setRoundIndex] = useState(() => Math.floor(Math.random() * 1000));
  const [selected, setSelected] = useState<Set<OrganicFunction>>(new Set());
  const [phase, setPhase] = useState<Phase>('hunting');
  const [namingAnswers, setNamingAnswers] = useState<Record<string, string>>({});
  const [namingResults, setNamingResults] = useState<
    Record<string, { correct: boolean; expected: string; isNearMiss: boolean }>
  >({});
  const startedAt = useRef(Date.now());

  const round: RoundTruth | null = pool.length > 0 ? pool[roundIndex % pool.length] : null;

  const grade = useMemo(
    () => (round ? gradeFunctionHunt([...selected], round.functions) : null),
    [selected, round]
  );

  useEffect(() => {
    if (round) setCurrentMolecule(round.molecule);
  }, [round, setCurrentMolecule]);

  const toggle = useCallback(
    (fn: OrganicFunction) => {
      if (phase !== 'hunting') return;
      soundSynth.playMechanicalSwitch();
      haptics.tap();
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(fn)) next.delete(fn);
        else next.add(fn);
        return next;
      });
    },
    [phase]
  );

  const handleSubmit = useCallback(() => {
    if (phase !== 'hunting' || !round || selected.size === 0 || !grade) return;
    const elapsed = Date.now() - startedAt.current;
    awardModeResult({
      score: grade.score,
      isPerfect: grade.isPerfect,
      responseTimeMs: elapsed,
      label: 'Caça-Funções',
    });
    setPhase('graded');
  }, [phase, round, selected, grade, awardModeResult]);

  const handleNext = useCallback(() => {
    soundSynth.playClick();
    haptics.tap();
    setSelected(new Set());
    setNamingAnswers({});
    setNamingResults({});
    setPhase('hunting');
    setRoundIndex(i => i + 1 + Math.floor(Math.random() * 3));
    startedAt.current = Date.now();
  }, []);

  const handleCheckNaming = useCallback(
    (fn: OrganicFunction) => {
      const answer = namingAnswers[fn] ?? '';
      const result = checkNomenclatureAnswer(fn, answer);
      setNamingResults(prev => ({ ...prev, [fn]: result }));
      if (result.correct) {
        soundSynth.playSpeedBonus();
        haptics.success();
        awardModeResult({
          score: 1,
          isPerfect: true,
          responseTimeMs: 4000,
          label: `sufixo ${result.expected}`,
        });
      } else {
        soundSynth.playError();
        haptics.error();
      }
    },
    [namingAnswers, awardModeResult]
  );

  // Keyboard: hotkeys to toggle, Enter to submit, Space for next round.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (phase === 'hunting') handleSubmit();
        else handleNext();
        return;
      }
      if (event.key === ' ' && phase !== 'hunting') {
        event.preventDefault();
        handleNext();
        return;
      }
      if (phase !== 'hunting') return;

      const key = event.key.toLowerCase();
      const match = (Object.keys(FUNCTION_HOTKEYS) as OrganicFunction[]).find(
        fn => FUNCTION_HOTKEYS[fn] === key
      );
      if (match) {
        event.preventDefault();
        toggle(match);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleSubmit, handleNext, toggle]);

  if (!round || !grade) {
    return (
      <div className="m3-card p-6 text-center text-[var(--md-sys-color-on-surface-variant)]">
        Carregando o acervo de moléculas…
      </div>
    );
  }

  const truth = new Set(round.functions);

  return (
    <div className="w-full flex flex-col gap-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
              Caça-Funções
            </h1>
            <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              Só identifique as funções. Sem escrever o nome inteiro.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {streak > 0 && (
            <span className="m3-chip py-1 px-2.5 font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
              <Zap className="w-3.5 h-3.5" />
              {streak} seguidas · x{multiplier.toFixed(1)}
            </span>
          )}
          <span className="m3-chip py-1 px-2.5 gap-1.5" title="Atalhos de teclado">
            <Keyboard className="w-3.5 h-3.5" />
            Enter confere
          </span>
        </div>
      </div>

      {/* Molecule stage */}
      <div className="m3-card p-4 sm:p-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="m3-chip py-1 px-2.5">
            <strong>{round.molecule.formula}</strong>
          </span>
          <span className="m3-chip py-1 px-2.5 uppercase tracking-wider">
            {round.molecule.difficulty}
          </span>
          {phase !== 'hunting' && (
            <span className="m3-chip py-1 px-2.5 text-[var(--md-sys-color-primary)] font-bold">
              {round.molecule.iupacName}
            </span>
          )}
        </div>

        <div className="w-full max-w-md">
          <SmilesCanvas smiles={round.molecule.smiles} width={420} height={240} />
        </div>

        <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] text-center">
          {phase === 'hunting'
            ? 'Quais funções orgânicas aparecem nesta molécula? Marque todas.'
            : grade.isPerfect
            ? '🎯 Caçada perfeita — você viu todas e não inventou nenhuma.'
            : 'Confira abaixo o que passou batido.'}
        </p>
      </div>

      {/* Function chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {FUNCTIONS_BY_PRIORITY.map(guide => {
          const isSelected = selected.has(guide.id);
          const isTruth = truth.has(guide.id);
          const graded = phase !== 'hunting';

          let tone = 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)]';
          if (graded && isTruth && isSelected) {
            tone = 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]';
          } else if (graded && isTruth && !isSelected) {
            tone = 'border-[var(--md-sys-color-tertiary)] bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]';
          } else if (graded && !isTruth && isSelected) {
            tone = 'border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]';
          } else if (isSelected) {
            tone = 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]';
          }

          return (
            <button
              key={guide.id}
              type="button"
              onClick={() => toggle(guide.id)}
              disabled={graded}
              title={guide.recognition}
              className={`text-left px-3 py-2.5 rounded-2xl border transition-all duration-150 flex flex-col gap-0.5 ${tone} ${
                graded ? 'cursor-default' : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <span className="flex items-center justify-between gap-1">
                <span className="text-[13px] font-bold leading-tight">{guide.label}</span>
                {graded ? (
                  isTruth && isSelected ? (
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  ) : isTruth ? (
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                  ) : isSelected ? (
                    <X className="w-3.5 h-3.5 shrink-0" />
                  ) : null
                ) : (
                  <kbd className="text-[9px] font-mono px-1 py-px rounded border border-current opacity-40 uppercase">
                    {FUNCTION_HOTKEYS[guide.id]}
                  </kbd>
                )}
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {guide.groupSymbol} · {guide.suffix}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action bar */}
      {phase === 'hunting' ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected.size === 0}
          className="m3-button-filled w-full py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Conferir caçada
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20">Enter</kbd>
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Score summary */}
          <div className="m3-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap text-[12px]">
              <span
                className={`m3-chip py-1 px-2.5 font-bold ${
                  grade.isPerfect
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                    : ''
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                {Math.round(grade.score * 100)}% de acerto
              </span>
              {grade.missed.length > 0 && (
                <span className="text-[var(--md-sys-color-on-surface-variant)]">
                  Faltou: <strong>{grade.missed.map(f => FUNCTION_GUIDE[f].label).join(', ')}</strong>
                </span>
              )}
              {grade.wrongPicks.length > 0 && (
                <span className="text-[var(--md-sys-color-error)]">
                  Não tinha: <strong>{grade.wrongPicks.map(f => FUNCTION_GUIDE[f].label).join(', ')}</strong>
                </span>
              )}
            </div>

            {/* Why each function is there */}
            <ul className="flex flex-col gap-2">
              {round.functions.map(fn => {
                const guide = FUNCTION_GUIDE[fn];
                return (
                  <li key={fn} className="flex flex-col gap-0.5 pl-3 border-l-2 border-[var(--md-sys-color-primary)]/40">
                    <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface)]">
                      {guide.label} <span className="font-mono opacity-60">{guide.groupSymbol}</span>
                    </span>
                    <span className="text-[12px] leading-snug text-[var(--md-sys-color-on-surface-variant)]">
                      {guide.recognition}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Optional bonus: state how each function is named */}
          <div className="m3-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--md-sys-color-on-surface)]">
              <Lightbulb className="w-4 h-4 text-[var(--md-sys-color-tertiary)]" />
              Rodada bônus — como se nomeia cada uma?
              <span className="text-[10px] font-mono font-normal uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
                opcional
              </span>
            </div>

            {round.functions.map(fn => {
              const guide = FUNCTION_GUIDE[fn];
              const result = namingResults[fn];
              return (
                <div key={fn} className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                    <strong className="text-[var(--md-sys-color-on-surface)]">{guide.label}</strong> — o
                    nome termina em / usa o quê?
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={namingAnswers[fn] ?? ''}
                      disabled={result?.correct}
                      onChange={event =>
                        setNamingAnswers(prev => ({ ...prev, [fn]: event.target.value }))
                      }
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleCheckNaming(fn);
                        }
                      }}
                      placeholder="ex.: -al"
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-sm font-mono text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)] disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => handleCheckNaming(fn)}
                      disabled={result?.correct}
                      className="m3-button-tonal text-xs py-2 px-3 shrink-0 disabled:opacity-50"
                    >
                      Checar
                    </button>
                  </div>

                  {result && (
                    <p
                      className={`text-[12px] flex items-center gap-1.5 ${
                        result.correct
                          ? 'text-[var(--md-sys-color-primary)]'
                          : 'text-[var(--md-sys-color-error)]'
                      }`}
                    >
                      {result.correct ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Isso! {guide.mnemonic}
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          {result.isNearMiss ? 'Quase — confira a grafia. ' : ''}
                          É <strong className="font-mono">{result.expected}</strong>. {guide.mnemonic}
                        </>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNext}
              className="m3-button-filled flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              Próxima molécula
              <ArrowRight className="w-4 h-4" />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20">Espaço</kbd>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelected(new Set());
                setPhase('hunting');
                startedAt.current = Date.now();
              }}
              className="m3-button-tonal py-3 px-4 text-sm flex items-center gap-1.5"
              title="Tentar a mesma molécula de novo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
