import React, { useEffect, useState } from 'react';
import { Gift, Coins, Timer, Flame } from 'lucide-react';
import { SPEED_BLITZ_THRESHOLD_MS } from '@quimicarush/gamification-engine';
import { useGameStore } from '../stores/useGameStore.js';

/** How long the speed window stays open before the turbo bonus is gone. */
const WINDOW_MS = SPEED_BLITZ_THRESHOLD_MS;

/**
 * The tension strip that sits above the molecule.
 *
 * Three pressures at once, all readable in a glance:
 *  - a speed window that visibly drains while you think (turbo XP);
 *  - the chest you are N correct answers away from cracking;
 *  - whether this particular molecule is a golden one worth triple.
 */
export const MomentumBar: React.FC = () => {
  const {
    questionStartTime,
    isAnswerSubmitted,
    chestProgress,
    chestGoal,
    isGoldenMolecule,
    isFeverActive,
    streak,
  } = useGameStore();

  const [remaining, setRemaining] = useState(WINDOW_MS);

  useEffect(() => {
    if (isAnswerSubmitted) return undefined;
    setRemaining(WINDOW_MS);

    let frame = 0;
    const tick = () => {
      const left = Math.max(0, WINDOW_MS - (Date.now() - questionStartTime));
      setRemaining(left);
      if (left > 0) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [questionStartTime, isAnswerSubmitted]);

  const turboRatio = remaining / WINDOW_MS;
  const turboOpen = turboRatio > 0 && !isAnswerSubmitted;
  const chestRatio = chestGoal > 0 ? chestProgress / chestGoal : 0;
  const remainingToChest = Math.max(0, chestGoal - chestProgress);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Speed window */}
      <div className="flex items-center gap-2">
        <span
          className={`flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 transition-colors ${
            turboOpen
              ? 'text-[var(--md-sys-color-tertiary)]'
              : 'text-[var(--md-sys-color-on-surface-variant)] opacity-50'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          {turboOpen ? `turbo ${(remaining / 1000).toFixed(1)}s` : 'turbo perdido'}
        </span>

        <div className="flex-1 h-1.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-75 ease-linear"
            style={{
              width: `${turboRatio * 100}%`,
              background: turboOpen
                ? 'linear-gradient(90deg, var(--md-sys-color-tertiary), var(--md-sys-color-primary))'
                : 'var(--md-sys-color-outline-variant)',
            }}
          />
        </div>
      </div>

      {/* Chest + modifiers */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] shrink-0">
          <Gift className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
          {remainingToChest === 0 ? 'baú pronto!' : `${remainingToChest} até o baú`}
        </span>

        <div className="flex-1 min-w-[80px] h-1.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--md-sys-color-primary)] transition-[width] duration-300"
            style={{ width: `${Math.min(100, chestRatio * 100)}%` }}
          />
        </div>

        {isGoldenMolecule && !isAnswerSubmitted && (
          <span className="m3-chip py-0.5 px-2 text-[10px] font-bold gap-1 border-[#d4a017] text-[#d4a017] animate-pulse">
            <Coins className="w-3 h-3" />
            DOURADA · XP x3
          </span>
        )}

        {isFeverActive && (
          <span className="m3-chip py-0.5 px-2 text-[10px] font-bold gap-1 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--md-sys-color-error)]">
            <Flame className="w-3 h-3" />
            FEBRE · {streak}
          </span>
        )}
      </div>
    </div>
  );
};
