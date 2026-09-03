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

  const getPillarFillClass = (score: number) => {
    if (score >= 0.95) return 'telemetry-fill-perfect';
    if (score >= 0.6) return 'telemetry-fill-partial';
    return 'telemetry-fill-error';
  };

  const getPillarTextClass = (score: number) => {
    if (score >= 0.95) return 'text-[var(--md-sys-color-primary)] font-bold';
    if (score >= 0.6) return 'text-[var(--md-sys-color-warning)] font-bold';
    return 'text-[var(--md-sys-color-error)] font-bold';
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 relative">
      {/* Floating Animated Reward Floaters Pill Bar */}
      {rewardFloaters.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-none mb-1">
          {rewardFloaters.map((floater) => (
            <div
              key={floater.id}
              className="animate-float-pill px-3 py-1 rounded-full text-xs font-black font-mono shadow-md border"
              style={{
                backgroundColor: `${floater.color}22`,
                borderColor: `${floater.color}88`,
                color: floater.color,
              }}
            >
              {floater.text}
            </div>
          ))}
        </div>
      )}

      {/* Level Up Celebratory Toast */}
      {levelUpNotice && (
        <div className="p-4 rounded-3xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)] shadow-lg flex items-center justify-between gap-3 animate-badge-glow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center text-2xl shadow-sm">
              {levelUpNotice.badgeEmoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">
                  🎉 SUBIU DE NÍVEL!
                </span>
                <span className="text-xs font-black">
                  NÍVEL {levelUpNotice.newLevel}
                </span>
              </div>
              <h4 className="text-sm font-black">
                Novo Título: {levelUpNotice.title}
              </h4>
            </div>
          </div>
          <button
            onClick={dismissLevelUpNotice}
            className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Badge Unlocked Celebratory Toast */}
      {recentlyUnlockedBadge && (
        <div className="p-4 rounded-3xl bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border border-[var(--md-sys-color-secondary)] shadow-lg flex items-center justify-between gap-3 animate-badge-glow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center text-2xl shadow-sm">
              {recentlyUnlockedBadge.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[var(--md-sys-color-warning)]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">
                  NOVA CONQUISTA DESBLOQUEADA!
                </span>
              </div>
              <h4 className="text-sm font-black">
                {recentlyUnlockedBadge.title}
              </h4>
              <p className="text-xs opacity-80">
                {recentlyUnlockedBadge.description}
              </p>
            </div>
          </div>
          <button
            onClick={dismissBadgeToast}
            className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Near-miss encouragement banner (70% - 95%) */}
      {nearMissNotice && (
        <div className="p-4 rounded-3xl bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)] border border-[var(--md-sys-color-warning)] flex items-center justify-between gap-3 animate-near-miss shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[var(--md-sys-color-warning)] shrink-0" />
            <div>
              <span className="font-bold font-mono text-xs uppercase tracking-wide">
                Quase lá!
              </span>
              <p className="text-xs opacity-90">{nearMissNotice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={retryQuestion}
            className="m3-chip text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}

      {/* Main Diagnostic Feedback Card */}
      <div className="w-full flex flex-col gap-4 p-5 sm:p-6 m3-card animate-juice">
        {/* Top Banner: Score & Status */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--md-sys-color-outline-variant)] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-xl shadow-sm border transition-all ${
                currentEvaluation.isPerfect
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]'
                  : scorePct >= 70
                  ? 'bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)] border-[var(--md-sys-color-warning)]'
                  : 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--md-sys-color-error)]'
              }`}
            >
              {scorePct}%
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                {currentEvaluation.isPerfect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                    <span className="font-bold text-base sm:text-lg text-[var(--md-sys-color-on-surface)]">
                      Nomenclatura Perfeita!
                    </span>
                  </>
                ) : scorePct >= 70 ? (
                  <>
                    <Award className="w-5 h-5 text-[var(--md-sys-color-warning)]" />
                    <span className="font-bold text-base sm:text-lg text-[var(--md-sys-color-on-surface)]">
                      Crédito Parcial Notável!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-[var(--md-sys-color-error)]" />
                    <span className="font-bold text-base sm:text-lg text-[var(--md-sys-color-on-surface)]">
                      Revise os Morfemas IUPAC
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                <span>
                  {currentEvaluation.isPerfect
                    ? 'Você dominou a identificação e ordenação sistemática.'
                    : 'Avaliamos cada componente morfológico individualmente.'}
                </span>
                {lastIsSpeedBlitz && (
                  <span className="text-[var(--md-sys-color-warning)] font-bold font-mono flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-[var(--md-sys-color-warning)]" />
                    {(lastResponseTimeMs / 1000).toFixed(1)}s (BÔNUS!)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Retry & Next */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end mt-1 sm:mt-0">
            {!currentEvaluation.isPerfect && (
              <button
                type="button"
                onClick={retryQuestion}
                title="Tentar esta molécula novamente"
                className="m3-chip text-xs py-2.5 px-3.5 flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer flex-1 sm:flex-initial"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repetir</span>
              </button>
            )}

            <button
              type="button"
              onClick={nextQuestion}
              className="m3-button-filled text-xs sm:text-sm font-bold py-2.5 px-4 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer flex-1 sm:flex-initial"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
              <kbd className="hidden sm:inline-block bg-black/20 text-current font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">Espaço</kbd>
            </button>
          </div>
        </div>

        {/* Priority Inversion Alert Banner */}
        {currentEvaluation.priorityInversionDetected && (
          <div className="p-4 rounded-2xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border border-[var(--md-sys-color-error)] flex items-start gap-2.5 text-xs shadow-sm">
            <AlertTriangle className="w-5 h-5 text-[var(--md-sys-color-error)] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold font-mono uppercase tracking-wide">
                ⚠️ Inversão de Prioridade IUPAC Detectada!
              </span>
              <p className="opacity-90 leading-relaxed">
                {currentEvaluation.detectedInversionDetails ??
                  'Você identificou corretamente os grupos funcionais, mas a função de maior prioridade deve governar o sufixo principal, subordinando as demais a radicais.'}
              </p>
            </div>
          </div>
        )}

        {/* 4 Partial Credit Telemetry Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {/* 1. Função */}
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1.5 sm:gap-2">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              <span>Função (35%)</span>
              <span className={getPillarTextClass(partialCreditBreakdown.functionScore)}>
                {funcPct}%
              </span>
            </div>
            <div className="m3-progress-track">
              <div
                className={`m3-progress-fill ${getPillarFillClass(partialCreditBreakdown.functionScore)}`}
                style={{ width: `${funcPct}%` }}
              />
            </div>
          </div>

          {/* 2. Cadeia Principal */}
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1.5 sm:gap-2">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              <span>Cadeia (25%)</span>
              <span className={getPillarTextClass(partialCreditBreakdown.chainScore)}>
                {chainPct}%
              </span>
            </div>
            <div className="m3-progress-track">
              <div
                className={`m3-progress-fill ${getPillarFillClass(partialCreditBreakdown.chainScore)}`}
                style={{ width: `${chainPct}%` }}
              />
            </div>
          </div>

          {/* 3. Insaturações */}
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1.5 sm:gap-2">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              <span>Ligações (20%)</span>
              <span className={getPillarTextClass(partialCreditBreakdown.bondScore)}>
                {bondPct}%
              </span>
            </div>
            <div className="m3-progress-track">
              <div
                className={`m3-progress-fill ${getPillarFillClass(partialCreditBreakdown.bondScore)}`}
                style={{ width: `${bondPct}%` }}
              />
            </div>
          </div>

          {/* 4. Radicais */}
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1.5 sm:gap-2">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              <span>Radicais (20%)</span>
              <span className={getPillarTextClass(partialCreditBreakdown.radicalScore)}>
                {radPct}%
              </span>
            </div>
            <div className="m3-progress-track">
              <div
                className={`m3-progress-fill ${getPillarFillClass(partialCreditBreakdown.radicalScore)}`}
                style={{ width: `${radPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Target IUPAC vs User Input Comparison */}
        <div className="flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 text-xs font-mono">
            <span className="text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider text-[10px] sm:text-[11px] font-medium">
              Nome Oficial Canônico (IUPAC):
            </span>
            <span className="m3-chip active text-xs sm:text-sm font-bold font-mono py-1 px-3 select-all break-all sm:break-normal max-w-full text-center">
              {currentMolecule.iupacName}
            </span>
          </div>

          {currentMolecule.commonNames && currentMolecule.commonNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--md-sys-color-on-surface-variant)] pt-2.5 border-t border-[var(--md-sys-color-outline-variant)] font-mono">
              <span className="text-[11px] uppercase tracking-wider mr-1">Sinônimos aceitos:</span>
              {currentMolecule.commonNames.map((syn) => (
                <span
                  key={syn}
                  className="m3-chip font-mono text-xs py-0.5 px-2"
                >
                  {syn}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Real-World Everyday Story & ENEM Context (from funcoes.pdf) */}
        {(currentMolecule.realWorldStory || currentMolecule.educationalContext) && (
          <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs">
            {currentMolecule.realWorldStory && (
              <div className="flex items-start gap-2.5 text-[var(--md-sys-color-on-surface)] font-mono">
                <Sparkles className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[var(--md-sys-color-primary)] font-semibold uppercase tracking-wider text-[11px]">
                    Cotidiano:{' '}
                  </strong>
                  {currentMolecule.realWorldStory}
                </p>
              </div>
            )}

            {currentMolecule.educationalContext && (
              <div className="flex items-start gap-2.5 text-[var(--md-sys-color-on-surface-variant)] pt-2 border-t border-[var(--md-sys-color-outline-variant)] font-mono">
                <BookOpen className="w-4 h-4 text-[var(--md-sys-color-secondary)] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[var(--md-sys-color-secondary)] font-semibold uppercase tracking-wider text-[11px]">
                    Dica ENEM / Vestibular:{' '}
                  </strong>
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
