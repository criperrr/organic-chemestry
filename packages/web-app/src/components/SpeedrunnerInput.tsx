import React, { useEffect, useRef } from 'react';
import { Send, Sparkles, CornerDownLeft } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { normalizeIUPACName } from '@quimicarush/chemistry-core';

const COMMON_CHIPS = [
  'ácido',
  'metil',
  'etil',
  'propil',
  'hidróxi',
  'oxo',
  'amino',
  'cloro',
  'ciclo',
  '-ol',
  '-al',
  '-ona',
  '-oico',
  '-amina',
  '-amida',
];

export const SpeedrunnerInput: React.FC = () => {
  const {
    userInput,
    setUserInput,
    submitAnswer,
    isAnswerSubmitted,
    currentEvaluation,
    currentMolecule,
  } = useGameStore();

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on new molecule or on mount
  useEffect(() => {
    if (!isAnswerSubmitted) {
      inputRef.current?.focus();
    }
  }, [currentMolecule?.id, isAnswerSubmitted]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitAnswer();
    }
  };

  const handleChipClick = (token: string) => {
    if (isAnswerSubmitted) return;

    let nextInput = userInput;
    if (token.startsWith('-')) {
      nextInput = nextInput ? `${nextInput}${token}` : token.slice(1);
    } else if (token === 'ácido') {
      nextInput = nextInput ? `ácido ${nextInput}` : 'ácido ';
    } else {
      nextInput = nextInput ? `${nextInput}-${token}` : token;
    }

    setUserInput(nextInput);
    inputRef.current?.focus();
  };

  const normalizedPreview = userInput.trim() ? normalizeIUPACName(userInput) : '';

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {/* Input container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnswerSubmitted}
          placeholder="Digite a nomenclatura IUPAC oficial (ex: butan-2-ol, ácido etanoico)..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className={`w-full bg-slate-900/95 text-slate-100 placeholder-slate-500 font-mono text-base sm:text-lg px-4 py-3.5 pr-28 rounded-2xl border-2 transition-all shadow-xl outline-none ${
            isAnswerSubmitted
              ? currentEvaluation?.isPerfect
                ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-200 ring-2 ring-emerald-500/30'
                : (currentEvaluation?.score ?? 0) >= 0.7
                ? 'border-amber-500/80 bg-amber-950/20 text-amber-200'
                : 'border-rose-500/80 bg-rose-950/20 text-rose-200 animate-shake'
              : 'border-slate-700/80 hover:border-cyan-500/60 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20'
          }`}
        />

        {/* Submit button inside input */}
        <button
          onClick={submitAnswer}
          disabled={isAnswerSubmitted || !userInput.trim()}
          className={`absolute right-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isAnswerSubmitted || !userInput.trim()
              ? 'opacity-40 bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 active:scale-95'
          }`}
        >
          <span>Enviar</span>
          <CornerDownLeft className="w-3.5 h-3.5 hidden sm:inline" />
          <Send className="w-3.5 h-3.5 sm:hidden" />
        </button>
      </div>

      {/* Live Normalized Preview */}
      {normalizedPreview && !isAnswerSubmitted && (
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono px-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Normalização ativa:</span>
          <span className="text-cyan-300 font-semibold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40 truncate">
            {normalizedPreview}
          </span>
        </div>
      )}

      {/* Quick Token Assistance Chips */}
      {!isAnswerSubmitted && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Atalhos:</span>
          {COMMON_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-xs font-mono transition-all active:scale-95 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
