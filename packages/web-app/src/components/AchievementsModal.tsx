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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-juice"
      onClick={closeAchievementsModal}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0f121d] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Conquistas & Troféus</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {unlockedCount} / {totalCount}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Marcos de mestria, velocidade e superação na nomenclatura IUPAC
              </p>
            </div>
          </div>

          <button
            onClick={closeAchievementsModal}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800/60 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Progresso da Coleção</span>
            <span className="text-amber-300 font-bold">{progressPct}% Concluído</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 h-full rounded-full transition-all duration-700"
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
                    ? 'bg-gradient-to-br from-amber-950/25 via-slate-900/90 to-slate-900/60 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500/20 ring-1 ring-amber-400/40 shadow-inner'
                      : 'bg-slate-800/60 grayscale'
                  }`}
                >
                  {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-500" />}
                </div>

                {/* Badge Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className={`text-sm font-bold truncate ${
                        isUnlocked ? 'text-amber-200' : 'text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </h3>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        DESBLOQUEADO
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold uppercase bg-slate-900 px-1.5 py-0.5 rounded shrink-0">
                        BLOQUEADO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-mono text-slate-500 bg-slate-900/80 px-1.5 py-0.2 rounded border border-slate-800">
                      {badge.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Continue jogando para colecionar todos os 10 troféus!</span>
          </div>
          <button
            onClick={closeAchievementsModal}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
