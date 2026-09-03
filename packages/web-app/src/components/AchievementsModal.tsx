import React from 'react';
import { X, Trophy, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { ALL_BADGES, type Badge } from '@quimicarush/gamification-engine';
import { useGameStore } from '../stores/useGameStore.js';

export const AchievementsModal: React.FC = () => {
  const { isAchievementsModalOpen, closeAchievementsModal, unlockedBadgeIds } = useGameStore();

  if (!isAchievementsModalOpen) return null;

  const unlockedSet = new Set(unlockedBadgeIds);
  const unlockedCount = ALL_BADGES.filter((b) => unlockedSet.has(b.id)).length;
  const totalCount = ALL_BADGES.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-juice"
      onClick={closeAchievementsModal}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-3xl shadow-2xl overflow-hidden text-[var(--md-sys-color-on-surface)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)] flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-[var(--md-sys-color-warning)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <span>Conquistas & Troféus</span>
                <span className="m3-chip text-xs py-0.5 px-2 font-mono">
                  {unlockedCount} / {totalCount}
                </span>
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Marcos de mestria, velocidade e superação na nomenclatura IUPAC
              </p>
            </div>
          </div>

          <button
            onClick={closeAchievementsModal}
            className="p-2.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fechar conquistas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="px-5 py-3.5 bg-[var(--md-sys-color-surface-container-lowest)] border-b border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
            <span>Progresso da Coleção</span>
            <span className="text-[var(--md-sys-color-primary)] font-bold">{progressPct}% Concluído</span>
          </div>
          <div className="m3-progress-track">
            <div
              className="m3-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ALL_BADGES.map((badge: Badge) => {
            const isUnlocked = unlockedSet.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-[var(--md-sys-color-surface-container-high)] border-[var(--md-sys-color-primary)] shadow-sm'
                    : 'bg-[var(--md-sys-color-surface-container-low)] border-[var(--md-sys-color-outline-variant)] opacity-60'
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-sm'
                      : 'bg-[var(--md-sys-color-surface-container-highest)] grayscale'
                  }`}
                >
                  {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)]" />}
                </div>

                {/* Badge Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className={`text-sm font-bold truncate ${
                        isUnlocked ? 'text-[var(--md-sys-color-on-surface)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
                      }`}
                    >
                      {badge.title}
                    </h3>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--md-sys-color-primary)] font-bold bg-[var(--md-sys-color-primary-container)] px-1.5 py-0.5 rounded-full border border-[var(--md-sys-color-primary)] shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        DESBLOQUEADO
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-semibold uppercase bg-[var(--md-sys-color-surface-container-highest)] px-1.5 py-0.5 rounded-full shrink-0">
                        BLOQUEADO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-mono text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-1.5 py-0.2 rounded border border-[var(--md-sys-color-outline-variant)]">
                      {badge.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-0 text-xs text-[var(--md-sys-color-on-surface-variant)]">
          <div className="flex items-center gap-1.5 text-[var(--md-sys-color-primary)] font-medium text-center sm:text-left">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Continue jogando para colecionar todos os 10 troféus!</span>
          </div>
          <button
            onClick={closeAchievementsModal}
            className="m3-button-tonal text-xs py-2 px-4 font-semibold cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
