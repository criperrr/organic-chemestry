import React, { useEffect, useRef } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { normalizeIUPACName } from '@quimicarush/chemistry-core';
import { haptics } from '../utils/haptics.js';

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    submitAnswer();
  };

  const handleChipClick = (token: string) => {
    if (isAnswerSubmitted) return;
    haptics.tap();

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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {/* Material 3 Filled Text Field */}
      <div
        className={`relative flex items-center bg-[var(--md-sys-color-surface-container-high)] rounded-2xl border transition-all duration-150 p-1 ${
          isAnswerSubmitted
            ? currentEvaluation?.isPerfect
              ? 'border-[var(--md-sys-color-primary)] ring-2 ring-[var(--md-sys-color-primary-container)]'
              : (currentEvaluation?.score ?? 0) >= 0.7
              ? 'border-[var(--md-sys-color-warning)] ring-2 ring-[var(--md-sys-color-warning-container)]'
              : 'border-[var(--md-sys-color-error)] ring-2 ring-[var(--md-sys-color-error-container)] animate-shake'
            : 'border-[var(--md-sys-color-outline-variant)] focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary-container)]'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={isAnswerSubmitted}
          placeholder="Digite a nomenclatura IUPAC..."
          inputMode="text"
          enterKeyHint="go"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          style={{ fontVariantLigatures: 'none' }}
          className={`w-full bg-transparent text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/60 font-mono text-base sm:text-lg px-3.5 sm:px-4 py-3 pr-24 sm:pr-36 outline-none transition-colors ${
            isAnswerSubmitted
              ? currentEvaluation?.isPerfect
                ? 'text-[var(--md-sys-color-primary)] font-bold'
                : (currentEvaluation?.score ?? 0) >= 0.7
                ? 'text-[var(--md-sys-color-warning)] font-bold'
                : 'text-[var(--md-sys-color-error)] font-bold'
              : ''
          }`}
        />

        {/* Integrated Material Filled Submit Button */}
        <button
          type="submit"
          disabled={isAnswerSubmitted || !userInput.trim()}
          className="m3-button-filled absolute right-1.5 sm:right-2 py-2 px-3 sm:px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 disabled:opacity-40 min-h-[40px]"
          aria-label="Confirmar resposta"
        >
          <span>Confirmar</span>
          <Send className="w-3.5 h-3.5 sm:hidden" />
          <kbd className="hidden sm:inline bg-black/20 text-current font-mono font-bold text-xs px-1 py-0.5 rounded">↵</kbd>
        </button>
      </div>

      {/* Live Technical Normalization Preview */}
      {normalizedPreview && !isAnswerSubmitted && (
        <div className="flex items-center gap-2 text-xs font-mono px-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0" />
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium shrink-0">
            Forma Canônica:
          </span>
          <span className="m3-chip py-0.5 px-2.5 text-[var(--md-sys-color-primary)] font-bold truncate">
            {normalizedPreview}
          </span>
        </div>
      )}

      {/* Quick Token Morpheme Assistance Chips (Swipeable Horizontal Rail on Mobile) */}
      {!isAnswerSubmitted && (
        <div className="flex flex-col gap-1 px-1">
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-medium uppercase tracking-wider">
            Morfemas Rápidos:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 touch-pan-x sm:flex-wrap">
            {COMMON_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleChipClick(chip)}
                className="m3-chip text-xs py-1.5 px-3 font-mono shrink-0 min-h-[36px] active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};
