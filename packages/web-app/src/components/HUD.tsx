import React, { useEffect } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Keyboard,
  Layers,
  Zap,
  BookOpen,
  Trophy,
  Sparkles,
  HelpCircle,
  Sliders,
  X,
  Palette,
  Check,
} from 'lucide-react';
import { useGameStore, MONET_PALETTES } from '../stores/useGameStore.js';
import { ALL_BADGES } from '@quimicarush/gamification-engine';
import type { DifficultyTier, OrganicFunction } from '@quimicarush/chemistry-core';

export const DIFFICULTY_LABELS: Record<DifficultyTier | 'todos', string> = {
  todos: 'Todas as Dificuldades',
  iniciante: 'Iniciante (C1-C4)',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  caos: '🔥 MODO CAOS (Polifuncional)',
};

export const FUNCTION_LABELS: Record<OrganicFunction | 'todos', string> = {
  todos: 'Todas as Funções (16)',
  hidrocarboneto: 'Hidrocarbonetos',
  alcool: 'Álcoois',
  fenol: 'Fenóis',
  enol: 'Enóis',
  eter: 'Éteres',
  aldeido: 'Aldeídos',
  cetona: 'Cetonas',
  acido_carboxilico: 'Ácidos Carboxílicos',
  ester: 'Ésteres',
  amina: 'Aminas',
  amida: 'Amidas',
  nitrila: 'Nitrilas',
  nitrocomposto: 'Nitrocompostos',
  haleto_alquila: 'Haletos de Alquila',
  haleto_acila: 'Haletos de Acila',
  anidrido: 'Anidridos',
};

/**
 * Left Rail: Navigation and quick tool controls (Desktop >= lg)
 * Strictly zero brand logos or chemistry symbols to preserve minimal focus.
 */
export const NavigationRail: React.FC = () => {
  const {
    activeTab,
    inputMode,
    soundEnabled,
    unlockedBadgeIds,
    toggleInputMode,
    setActiveTab,
    toggleSound,
    openAchievementsModal,
    toggleCheatsheet,
  } = useGameStore();

  const unlockedCount = unlockedBadgeIds.length;
  const totalBadges = ALL_BADGES.length;

  return (
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col justify-between shrink-0 p-5 border-r border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] sticky top-0 h-screen overflow-y-auto select-none">
      <div className="flex flex-col gap-6">
        {/* Top: Completely empty placeholder / breathing room */}
        <div className="pt-2">
          {/* Material 3 Segmented Button Navigation */}
          <nav className="m3-segmented-container w-full flex p-1">
            <button
              type="button"
              onClick={() => setActiveTab('arcade')}
              className={`m3-segmented-item flex-1 justify-center py-2 text-xs font-semibold ${
                activeTab === 'arcade' ? 'active' : ''
              }`}
              title="Modo Treino Interativo"
            >
              <Zap className="w-4 h-4" />
              <span>Treino</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theory')}
              className={`m3-segmented-item flex-1 justify-center py-2 text-xs font-semibold ${
                activeTab === 'theory' ? 'active' : ''
              }`}
              title="Compêndio e Teoria IUPAC"
            >
              <BookOpen className="w-4 h-4" />
              <span>Compêndio</span>
            </button>
          </nav>
        </div>

        {/* Action Controls List */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider px-1">
            Ferramentas
          </span>

          {/* Input Mode Toggle (visible during arcade) */}
          {activeTab === 'arcade' && (
            <button
              type="button"
              onClick={toggleInputMode}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                {inputMode === 'speedrunner' ? (
                  <Keyboard className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                ) : (
                  <Layers className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                )}
                <span>
                  {inputMode === 'speedrunner' ? 'Modo Teclado' : 'Modo Slots'}
                </span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                Tab
              </kbd>
            </button>
          )}

          {/* Achievements Modal Trigger */}
          <button
            type="button"
            onClick={openAchievementsModal}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-[var(--md-sys-color-warning)]" />
              <span>Conquistas</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[10px] font-mono font-bold text-[var(--md-sys-color-on-surface)]">
              {unlockedCount}/{totalBadges}
            </span>
          </button>

          {/* Sound Synthesizer Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
              )}
              <span>{soundEnabled ? 'Áudio Ativo' : 'Silenciado'}</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
              M
            </kbd>
          </button>

          {/* Keyboard Cheatsheet Trigger */}
          <button
            type="button"
            onClick={toggleCheatsheet}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              <span>Atalhos Mouse-Free</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
              ?
            </kbd>
          </button>
        </div>
      </div>

      {/* Academic Attribution Footnote */}
      <div className="pt-4 border-t border-[var(--md-sys-color-outline-variant)] text-[11px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
        Base teórica: <span className="font-semibold text-[var(--md-sys-color-on-surface)]">funcoes.pdf</span>
        <br />
        Prof. Anderson Oliveira (Cecierj)
      </div>
    </aside>
  );
};

/**
 * Right Rail: Gamification Telemetry, Streak, Score, Level, and Filters (Desktop >= lg)
 */
export const TelemetryRail: React.FC = () => {
  const {
    streak,
    multiplier,
    score,
    level,
    levelProgress,
    activeTab,
    difficultyFilter,
    functionFilter,
    setDifficultyFilter,
    setFunctionFilter,
  } = useGameStore();

  const isOnFire = multiplier >= 2.5 || streak >= 7;

  return (
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col gap-5 shrink-0 p-5 border-l border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] sticky top-0 h-screen overflow-y-auto select-none">
      {/* Telemetry Header */}
      <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider px-1 pt-2">
        Telemetria & Desempenho
      </span>

      {/* Combo & Multiplier Card */}
      <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
            <Flame
              className={`w-4 h-4 ${
                isOnFire ? 'text-[var(--md-sys-color-warning)] animate-pulse' : 'text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            />
            <span className={isOnFire ? 'text-[var(--md-sys-color-warning)]' : 'text-[var(--md-sys-color-on-surface)]'}>
              {streak} {streak === 1 ? 'COMBO' : 'COMBOS'}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full font-mono font-bold text-xs bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline-variant)]">
            {multiplier.toFixed(1)}x MULT
          </span>
        </div>

        {/* Score Readout */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)] text-xs font-mono">
          <span className="text-[var(--md-sys-color-on-surface-variant)]">Pontuação:</span>
          <strong className="text-[var(--md-sys-color-on-surface)] font-bold text-sm">
            {score.toLocaleString('pt-BR')} pts
          </strong>
        </div>
      </div>

      {/* Level & XP Card */}
      <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-[var(--md-sys-color-primary)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NV. {level}</span>
          </div>
          <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] truncate max-w-[130px]">
            {levelProgress.title}
          </span>
        </div>

        {/* M3 Linear Progress Bar */}
        <div className="w-full bg-[var(--md-sys-color-surface-container-highest)] rounded-full h-2 overflow-hidden">
          <div
            className="bg-[var(--md-sys-color-primary)] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, levelProgress.progressPercent))}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
          <span>{levelProgress.currentLevelXP} XP</span>
          <span>{levelProgress.xpForNextLevel} XP</span>
        </div>
      </div>

      {/* Filters (Active in Arcade Mode) */}
      {activeTab === 'arcade' && (
        <div className="flex flex-col gap-3 pt-2">
          <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider px-1">
            Filtros do Treino
          </span>

          {/* Difficulty Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)] px-1">
              Dificuldade:
            </label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as DifficultyTier | 'todos')}
              className="w-full bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] text-xs rounded-xl px-3 py-2 outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                <option key={key} value={key} className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]">
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Organic Function Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)] px-1">
              Função Química:
            </label>
            <select
              value={functionFilter}
              onChange={(e) => setFunctionFilter(e.target.value as OrganicFunction | 'todos')}
              className="w-full bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] text-xs rounded-xl px-3 py-2 outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
            >
              {Object.entries(FUNCTION_LABELS).map(([key, label]) => (
                <option key={key} value={key} className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </aside>
  );
};

/**
 * Mobile Top Bar (< lg): Compact, ergonomically padded 52px bar with zero brand logos.
 * Features quick tab switcher, streak readout, active filter badge, and control sheet trigger.
 */
export const MobileTopBar: React.FC = () => {
  const {
    streak,
    multiplier,
    activeTab,
    inputMode,
    soundEnabled,
    level,
    difficultyFilter,
    functionFilter,
    setActiveTab,
    toggleInputMode,
    toggleSound,
    openAchievementsModal,
    openMobileControlSheet,
  } = useGameStore();

  const isFilterActive = difficultyFilter !== 'todos' || functionFilter !== 'todos';

  return (
    <header className="flex lg:hidden items-center justify-between h-13 px-2.5 sm:px-3.5 bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] sticky top-0 z-40 safe-top">
      {/* Tab Segmented Switcher */}
      <nav className="m3-segmented-container shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('arcade')}
          className={`m3-segmented-item px-2.5 sm:px-3 py-1 text-xs font-semibold min-h-[34px] ${
            activeTab === 'arcade' ? 'active' : ''
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Treino</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('theory')}
          className={`m3-segmented-item px-2.5 sm:px-3 py-1 text-xs font-semibold min-h-[34px] ${
            activeTab === 'theory' ? 'active' : ''
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Teoria</span>
        </button>
      </nav>

      {/* Quick Action Icons, Streak & Control Sheet Trigger */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {streak > 0 && (
          <span className="px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-warning)] border border-[var(--md-sys-color-outline-variant)] flex items-center gap-1">
            <Flame className="w-3 h-3" />
            <span>{streak}</span>
            {multiplier > 1.0 && (
              <span className="text-[10px] text-[var(--md-sys-color-primary)] font-bold">
                {multiplier.toFixed(1)}x
              </span>
            )}
          </span>
        )}

        {/* Mobile Control Sheet & Telemetry Trigger (Level + Filter Settings) */}
        <button
          type="button"
          onClick={openMobileControlSheet}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer min-h-[36px] border active:scale-95 ${
            isFilterActive
              ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)] ring-1 ring-[var(--md-sys-color-primary)]'
              : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]'
          }`}
          title="Filtros e Telemetria do Treino"
          aria-label="Abrir filtros e telemetria"
        >
          <Sliders className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
          <span>Nv.{level}</span>
          {isFilterActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-warning)] animate-pulse" />
          )}
        </button>

        {/* Achievements Modal Trigger */}
        <button
          type="button"
          onClick={openAchievementsModal}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] active:scale-95"
          aria-label="Conquistas"
        >
          <Trophy className="w-4 h-4 text-[var(--md-sys-color-warning)]" />
        </button>

        {/* Input Mode Switcher (only in Arcade mode) */}
        {activeTab === 'arcade' && (
          <button
            type="button"
            onClick={toggleInputMode}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] active:scale-95"
            aria-label="Alternar Modo de Entrada"
            title={inputMode === 'speedrunner' ? 'Alternar para Modo Slots' : 'Alternar para Modo Teclado'}
          >
            {inputMode === 'speedrunner' ? (
              <Keyboard className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
            ) : (
              <Layers className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
            )}
          </button>
        )}

        {/* Audio Synthesizer Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] active:scale-95"
          aria-label="Alternar Áudio"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
          )}
        </button>
      </div>
    </header>
  );
};

/**
 * Mobile Control Sheet: Full-featured Material 3 Bottom Sheet providing mobile users
 * with complete access to Training Filters, Spaced Telemetry, Level progression, and Visual Themes.
 */
export const MobileControlSheet: React.FC = () => {
  const {
    isMobileControlSheetOpen,
    closeMobileControlSheet,
    level,
    levelProgress,
    score,
    streak,
    multiplier,
    difficultyFilter,
    functionFilter,
    setDifficultyFilter,
    setFunctionFilter,
    monetTheme,
    setMonetTheme,
    openAchievementsModal,
  } = useGameStore();

  useEffect(() => {
    if (!isMobileControlSheetOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileControlSheet();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileControlSheetOpen, closeMobileControlSheet]);

  if (!isMobileControlSheetOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-sheet-title"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={closeMobileControlSheet}
    >
      <div
        className="w-full max-h-[88dvh] flex flex-col bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)] rounded-t-3xl shadow-2xl overflow-hidden text-[var(--md-sys-color-on-surface)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Drag Handle Pill */}
        <div className="w-full flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-[var(--md-sys-color-outline-variant)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            <h3 id="mobile-sheet-title" className="text-base font-bold">
              Controle & Filtros do Treino
            </h3>
          </div>
          <button
            type="button"
            onClick={closeMobileControlSheet}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
            aria-label="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* Telemetry Card */}
          <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-[var(--md-sys-color-primary)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NÍVEL {level}</span>
                <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] truncate max-w-[130px]">
                  {levelProgress.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Pontos:</span>
                <strong className="text-[var(--md-sys-color-on-surface)] font-bold">
                  {score.toLocaleString('pt-BR')}
                </strong>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="w-full bg-[var(--md-sys-color-surface-container-highest)] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[var(--md-sys-color-primary)] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, levelProgress.progressPercent))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
              <span>{levelProgress.currentLevelXP} XP</span>
              <span>Próximo nível: {levelProgress.xpForNextLevel} XP</span>
            </div>

            {/* Streak & Multiplier Telemetry */}
            <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-[var(--md-sys-color-outline-variant)]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[var(--md-sys-color-error)]" />
                <span className="text-[var(--md-sys-color-on-surface-variant)] text-[11px]">Sequência:</span>
                <strong className="text-[var(--md-sys-color-on-surface)] font-bold">{streak} 🔥</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--md-sys-color-on-surface-variant)] text-[11px]">Multiplicador:</span>
                <strong className="text-[var(--md-sys-color-primary)] font-bold">{multiplier}x</strong>
              </div>
            </div>
          </div>

          {/* Conquistas & Troféus Button */}
          <button
            type="button"
            onClick={() => {
              closeMobileControlSheet();
              openAchievementsModal();
            }}
            className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs font-bold cursor-pointer hover:border-[var(--md-sys-color-warning)] transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
              <Trophy className="w-4 h-4 text-[var(--md-sys-color-warning)]" />
              <span>Conquistas & Troféus Desbloqueados</span>
            </div>
            <span className="text-xs text-[var(--md-sys-color-primary)] font-mono">Abrir →</span>
          </button>

          {/* Dificuldade Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider">
              1. Dificuldade das Moléculas:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => {
                const isSelected = difficultyFilter === key;
                const isChaos = key === 'caos';
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDifficultyFilter(key as DifficultyTier | 'todos')}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer min-h-[44px] ${
                      isSelected
                        ? isChaos
                          ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--md-sys-color-error)] font-bold shadow-sm'
                          : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)] font-bold shadow-sm'
                        : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]'
                    }`}
                  >
                    {isChaos && <Flame className="w-3.5 h-3.5 text-[var(--md-sys-color-error)] shrink-0" />}
                    <span className="truncate">{label.replace('🔥 ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Função Química Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider">
              2. Função Química Específica:
            </span>
            <select
              value={functionFilter}
              onChange={(e) => setFunctionFilter(e.target.value as OrganicFunction | 'todos')}
              className="w-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] text-sm rounded-xl px-3 py-3 outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer min-h-[46px]"
            >
              {Object.entries(FUNCTION_LABELS).map(([key, label]) => (
                <option
                  key={key}
                  value={key}
                  className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]"
                >
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Tema Visual Monet */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
              <span>3. Paleta Visual de Cores:</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {MONET_PALETTES.map((pal) => {
                const isSelected = monetTheme === pal.id;
                return (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => setMonetTheme(pal.id)}
                    className={`py-2 px-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer min-h-[42px] ${
                      isSelected
                        ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold shadow-sm'
                        : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-white/20"
                      style={{ backgroundColor: pal.seedHex }}
                    />
                    <span className="truncate">{pal.name}</span>
                    {isSelected && <Check className="w-3 h-3 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] safe-bottom">
          <button
            type="button"
            onClick={closeMobileControlSheet}
            className="m3-button-filled w-full py-3 font-bold text-sm tracking-wider uppercase cursor-pointer"
          >
            Concluir & Voltar ao Treino
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Composite HUD export for backwards compatibility
 */
export const HUD: React.FC = () => {
  return (
    <>
      <MobileTopBar />
      <MobileControlSheet />
    </>
  );
};

