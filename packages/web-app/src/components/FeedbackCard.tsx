import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Zap,
  RotateCcw,
  Trophy,
  X,
} from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';

export const FeedbackCard: React.FC = () => {
  const {
    currentEvaluation,
    currentMolecule,
    nextQuestion,
    retryQuestion,
    rewardFloaters,
    recentlyUnlockedBadge,
    dismissBadgeToast,
    levelUpNotice,
    dismissLevelUpNotice,
    nearMissNotice,
    lastIsSpeedBlitz,
    lastResponseTimeMs,
  } = useGameStore();

  if (!currentEvaluation || !currentMolecule) return null;

  const scorePct = Math.round(currentEvaluation.score * 100);
  const { partialCreditBreakdown } = currentEvaluation;
  const funcPct = Math.round(partialCreditBreakdown.functionScore * 100);
  const chainPct = Math.round(partialCreditBreakdown.chainScore * 100);
  const bondPct = Math.round(partialCreditBreakdown.bondScore * 100);
  const radPct = Math.round(partialCreditBreakdown.radicalScore * 100);

  const getPillarColor = (score: number) => {
    if (score >= 0.95) return 'bg-emerald-500 text-emerald-300 border-emerald-500/40';
    if (score >= 0.6) return 'bg-amber-500 text-amber-300 border-amber-500/40';
    return 'bg-rose-500 text-rose-300 border-rose-500/40';
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 relative">
      {/* Floating Animated Reward Floaters Pill Bar */}
      {rewardFloaters.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-none mb-1">
          {rewardFloaters.map((floater) => (
            <div
              key={floater.id}
              className="animate-float-pill px-3 py-1 rounded-full text-xs font-black font-mono shadow-xl border backdrop-blur-md"
              style={{
                backgroundColor: `${floater.color}22`,
                borderColor: `${floater.color}88`,
                color: floater.color,
                boxShadow: `0 0 15px ${floater.color}44`,
              }}
            >
              {floater.text}
            </div>
          ))}
        </div>
      )}

      {/* Level Up Celebratory Toast */}
      {levelUpNotice && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-blue-900/90 border border-purple-400 shadow-2xl flex items-center justify-between gap-3 animate-badge-glow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/30 flex items-center justify-center text-2xl ring-2 ring-purple-400">
              {levelUpNotice.badgeEmoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                  🎉 SUBIU DE NÍVEL!
                </span>
                <span className="text-xs font-black text-amber-300">
                  NÍVEL {levelUpNotice.newLevel}
                </span>
              </div>
              <h4 className="text-sm font-black text-white">
                Novo Título: {levelUpNotice.title}
              </h4>
            </div>
          </div>
          <button
            onClick={dismissLevelUpNotice}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Badge Unlocked Celebratory Toast */}
      {recentlyUnlockedBadge && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-yellow-950/90 to-amber-900/90 border border-amber-400 shadow-2xl flex items-center justify-between gap-3 animate-badge-glow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/30 flex items-center justify-center text-2xl ring-2 ring-amber-400">
              {recentlyUnlockedBadge.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  NOVA CONQUISTA DESBLOQUEADA!
                </span>
              </div>
              <h4 className="text-sm font-black text-white">
                {recentlyUnlockedBadge.title}
              </h4>
              <p className="text-xs text-amber-200/80">
                {recentlyUnlockedBadge.description}
              </p>
            </div>
          </div>
          <button
            onClick={dismissBadgeToast}
            className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-800/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Near-miss encouragement banner (70% - 95%) */}
      {nearMissNotice && (
        <div className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 animate-near-miss shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-xs text-amber-300 uppercase tracking-wide">
                Quase lá!
              </span>
              <p className="text-xs text-amber-100/90">{nearMissNotice}</p>
            </div>
          </div>
          <button
            onClick={retryQuestion}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}

      {/* Main Feedback Container */}
      <div className="w-full flex flex-col gap-4 p-5 rounded-2xl bg-[#0e121d]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-juice">
        {/* Top Banner: Score & Status */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xl shadow-lg ring-2 ${
                currentEvaluation.isPerfect
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white ring-emerald-400/50 shadow-emerald-500/20'
                  : scorePct >= 70
                  ? 'bg-gradient-to-br from-amber-500 to-orange-700 text-white ring-amber-400/50 shadow-amber-500/20'
                  : 'bg-gradient-to-br from-rose-600 to-red-800 text-white ring-rose-500/50 shadow-rose-500/20'
              }`}
            >
              {scorePct}%
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                {currentEvaluation.isPerfect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-base sm:text-lg text-emerald-300">
                      Nomenclatura Perfeita!
                    </span>
                  </>
                ) : scorePct >= 70 ? (
                  <>
                    <Award className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-base sm:text-lg text-amber-300">
                      Crédito Parcial Notável!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span className="font-bold text-base sm:text-lg text-rose-300">
                      Revise os Morfemas IUPAC
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>
                  {currentEvaluation.isPerfect
                    ? 'Você dominou a identificação e ordenação sistemática.'
                    : 'Avaliamos cada componente morfológico individualmente.'}
                </span>
                {lastIsSpeedBlitz && (
                  <span className="text-amber-400 font-bold flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {(lastResponseTimeMs / 1000).toFixed(1)}s (BÔNUS VELOCIDADE!)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Retry & Next */}
          <div className="flex items-center gap-2 shrink-0">
            {!currentEvaluation.isPerfect && (
              <button
                onClick={retryQuestion}
                title="Tentar esta molécula novamente"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Repetir</span>
              </button>
            )}

            <button
              onClick={nextQuestion}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Priority Inversion Alert Banner */}
        {currentEvaluation.priorityInversionDetected && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/60 flex items-start gap-2.5 text-xs text-amber-200 shadow-inner">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-amber-300 uppercase tracking-wide">
                ⚠️ Inversão de Prioridade IUPAC Detectada!
              </span>
              <p className="text-amber-100/90 leading-relaxed">
                {currentEvaluation.detectedInversionDetails ??
                  'Você identificou corretamente os grupos funcionais, mas a função de maior prioridade deve governar o sufixo principal, subordinando as demais a radicais.'}
              </p>
            </div>
          </div>
        )}

        {/* 4 Pillars Partial Credit Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Função */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
              <span>Função (35%)</span>
              <span className="font-mono text-xs">{funcPct}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getPillarColor(
                  partialCreditBreakdown.functionScore
                )}`}
                style={{ width: `${funcPct}%` }}
              />
            </div>
          </div>

          {/* 2. Cadeia Principal */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
              <span>Cadeia (25%)</span>
              <span className="font-mono text-xs">{chainPct}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getPillarColor(
                  partialCreditBreakdown.chainScore
                )}`}
                style={{ width: `${chainPct}%` }}
              />
            </div>
          </div>

          {/* 3. Insaturações */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
              <span>Ligações (20%)</span>
              <span className="font-mono text-xs">{bondPct}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getPillarColor(
                  partialCreditBreakdown.bondScore
                )}`}
                style={{ width: `${bondPct}%` }}
              />
            </div>
          </div>

          {/* 4. Radicais */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
              <span>Radicais (20%)</span>
              <span className="font-mono text-xs">{radPct}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getPillarColor(
                  partialCreditBreakdown.radicalScore
                )}`}
                style={{ width: `${radPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Target IUPAC vs User Input Comparison */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">Nome Oficial Canônico (IUPAC):</span>
            <span className="text-cyan-300 font-bold text-sm bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60 select-all">
              {currentMolecule.iupacName}
            </span>
          </div>

          {currentMolecule.commonNames && currentMolecule.commonNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="text-slate-500">Sinônimos e Triviais aceitos:</span>
              {currentMolecule.commonNames.map((syn) => (
                <span
                  key={syn}
                  className="bg-slate-900 px-2 py-0.5 rounded text-amber-300/90 font-mono text-[11px] border border-slate-800"
                >
                  {syn}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Real-World Everyday Story & ENEM Context (from funcoes.pdf) */}
        {(currentMolecule.realWorldStory || currentMolecule.educationalContext) && (
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-900/50 text-xs">
            {currentMolecule.realWorldStory && (
              <div className="flex items-start gap-2 text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-indigo-300 font-semibold">Cotidiano: </strong>
                  {currentMolecule.realWorldStory}
                </p>
              </div>
            )}

            {currentMolecule.educationalContext && (
              <div className="flex items-start gap-2 text-slate-300 pt-1 border-t border-indigo-900/30">
                <BookOpen className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-purple-300 font-semibold">Dica ENEM / Vestibular: </strong>
                  {currentMolecule.educationalContext}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
