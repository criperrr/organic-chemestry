import React from 'react';
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
} from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { AchievementsModal } from './AchievementsModal.js';
import { ALL_BADGES } from '@quimicarush/gamification-engine';
import type { DifficultyTier, OrganicFunction } from '@quimicarush/chemistry-core';

const DIFFICULTY_LABELS: Record<DifficultyTier | 'todos', string> = {
  todos: 'Todas as Dificuldades',
  iniciante: 'Iniciante (C1-C4)',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  caos: '🔥 MODO CAOS (Polifuncional)',
};

const FUNCTION_LABELS: Record<OrganicFunction | 'todos', string> = {
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

export const HUD: React.FC = () => {
  const {
    streak,
    multiplier,
    score,
    level,
    levelProgress,
    inputMode,
    activeTab,
    soundEnabled,
    difficultyFilter,
    functionFilter,
    unlockedBadgeIds,
    toggleInputMode,
    setActiveTab,
    toggleSound,
    setDifficultyFilter,
    setFunctionFilter,
    openAchievementsModal,
  } = useGameStore();

  const isOnFire = multiplier >= 3.0 || streak >= 10;
  const isExtremeFire = multiplier >= 5.0 || streak >= 15;
  const unlockedCount = unlockedBadgeIds.length;
  const totalBadges = ALL_BADGES.length;

  return (
    <>
      <header
        className={`w-full bg-[#0d101a]/95 backdrop-blur-md border-b sticky top-0 z-40 px-3 py-2.5 sm:px-6 sm:py-3 transition-all ${
          isOnFire
            ? 'border-orange-500/70 animate-fiery-aura shadow-2xl shadow-orange-950/40'
            : 'border-slate-800/80 shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          {/* Top Row: Brand, Tabs, Achievements Button, Quick Toggles */}
          <div className="flex items-center justify-between gap-2">
            {/* Logo & Title */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              onClick={() => setActiveTab('arcade')}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                  isOnFire
                    ? 'bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 shadow-orange-500/40 animate-flame ring-2 ring-orange-300'
                    : 'bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                }`}
              >
                {isOnFire ? (
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                ) : (
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 to-indigo-400">
                    QuímicaRush
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                    v2.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Treinamento Sistemático IUPAC pt-BR
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setActiveTab('arcade')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'arcade'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>MODO ARCADE</span>
              </button>

              <button
                onClick={() => setActiveTab('theory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'theory'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>COMPÊNDIO TEÓRICO</span>
              </button>
            </nav>

            {/* Quick Achievements, Sound & Mode Actions */}
            <div className="flex items-center gap-2">
              {/* Achievements Modal Trigger */}
              <button
                onClick={openAchievementsModal}
                title="Ver Troféus e Conquistas"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Conquistas</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 font-mono text-[10px]">
                  {unlockedCount}/{totalBadges}
                </span>
              </button>

              {/* Input Mode Switcher (visible in arcade tab) */}
              {activeTab === 'arcade' && (
                <button
                  onClick={toggleInputMode}
                  title={
                    inputMode === 'speedrunner'
                      ? 'Alternar para Modo Construtor de Slots (Tab)'
                      : 'Alternar para Modo Teclado Rápido (Tab)'
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
                >
                  {inputMode === 'speedrunner' ? (
                    <>
                      <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden md:inline">Teclado</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden md:inline">Slots</span>
                    </>
                  )}
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1 py-0.2 rounded border border-slate-700 font-mono hidden lg:inline">
                    Tab
                  </span>
                </button>
              )}

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Silenciar Áudio Procedural (M)' : 'Ativar Áudio Procedural (M)'}
                className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                  soundEnabled
                    ? 'bg-slate-900 border-slate-700/80 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800'
                    : 'bg-slate-950 border-red-900/50 text-slate-500 hover:text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bottom Row: Gamification Bar (Streaks, Multiplier, XP, Level Title, Filters) */}
          {activeTab === 'arcade' && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5 border-t border-slate-800/50 text-xs">
              {/* Left: Streak & Multiplier Status */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* Streak Badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                    isExtremeFire
                      ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-white animate-fire shadow-lg shadow-red-500/40 ring-1 ring-amber-300'
                      : isOnFire
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black animate-fire shadow-md shadow-orange-500/30'
                      : streak > 0
                      ? 'bg-slate-800/90 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Flame
                    className={`w-4 h-4 ${
                      isOnFire ? 'animate-flame text-yellow-200' : 'text-orange-400'
                    }`}
                  />
                  <span className="font-mono text-xs sm:text-sm">
                    {streak} {streak === 1 ? 'COMBO' : 'COMBOS'}
                  </span>
                  {isOnFire && (
                    <span className="text-[10px] tracking-wider font-extrabold uppercase ml-0.5">
                      {isExtremeFire ? 'AROMÁTICO ON FIRE! 🔥' : 'ON FIRE! 🔥'}
                    </span>
                  )}
                </div>

                {/* Multiplier Badge */}
                <div
                  className={`px-2.5 py-0.5 rounded-md font-mono font-black text-xs sm:text-sm border transition-all ${
                    multiplier >= 5.0
                      ? 'bg-red-950/80 text-red-300 border-red-500/60 shadow-md shadow-red-500/20 animate-pulse'
                      : multiplier >= 3.0
                      ? 'bg-orange-950/80 text-orange-300 border-orange-500/60'
                      : multiplier >= 2.0
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                      : multiplier >= 1.5
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {multiplier.toFixed(1)}x MULT
                </div>

                {/* Score Display */}
                <div className="flex items-center gap-1 text-slate-300 font-mono font-medium">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{score.toLocaleString('pt-BR')} pts</span>
                </div>
              </div>

              {/* Center / Right: Dynamic Level Title & Smooth XP Bar */}
              <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md ml-auto">
                <div className="flex flex-col items-start gap-0.5 shrink-0">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>NV. {level}</span>
                  </div>
                  {/* Dynamic Title Badge */}
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-500/40 truncate max-w-[150px] sm:max-w-[170px]">
                    <span>{levelProgress.titleBadgeEmoji}</span>
                    <span className="truncate">{levelProgress.title}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, levelProgress.progressPercent))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>
                      {levelProgress.currentLevelXP} / {levelProgress.xpForNextLevel} XP
                    </span>
                    <span>{Math.round(levelProgress.progressPercent)}%</span>
                  </div>
                </div>
              </div>

              {/* Filter selectors */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Difficulty filter */}
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value as DifficultyTier | 'todos')}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                    <option key={key} value={key} className="bg-slate-900 text-slate-200">
                      {label}
                    </option>
                  ))}
                </select>

                {/* Function filter */}
                <select
                  value={functionFilter}
                  onChange={(e) => setFunctionFilter(e.target.value as OrganicFunction | 'todos')}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer max-w-[150px] sm:max-w-[180px] truncate"
                >
                  {Object.entries(FUNCTION_LABELS).map(([key, label]) => (
                    <option key={key} value={key} className="bg-slate-900 text-slate-200">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Global Achievements Modal */}
      <AchievementsModal />
    </>
  );
};
