import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  Trash2,
  Send,
  Sparkles,
  CircleDot,
  Keyboard,
  Undo2,
} from 'lucide-react';
import {
  useGameStore,
  assembleIUPACFromSlots,
} from '../stores/useGameStore.js';

// Predefined Token Categories
const CLASS_PREFIXES = [
  { prefix: 'ácido', key: 'P' },
  { prefix: 'anidrido', key: '' },
  { prefix: 'cloreto de', key: '' },
  { prefix: 'brometo de', key: '' },
];

const SIMPLE_RADICALS = [
  { radical: 'metil', key: 'm' },
  { radical: 'etil', key: 'e' },
  { radical: 'propil', key: 'p' },
  { radical: 'isopropil', key: 'i' },
  { radical: 'butil', key: '' },
  { radical: 'isobutil', key: '' },
  { radical: 'sec-butil', key: '' },
  { radical: 'terc-butil', key: '' },
  { radical: 'fenil', key: '' },
  { radical: 'benzil', key: '' },
];

const SUBORDINATED_FUNCTIONAL_RADICALS = [
  { radical: 'hidróxi', key: 'h' },
  { radical: 'oxo', key: 'o' },
  { radical: 'amino', key: 'a' },
  { radical: 'cloro', key: 'c' },
  { radical: 'bromo', key: 'b' },
  { radical: 'flúor', key: '' },
  { radical: 'iodo', key: '' },
  { radical: 'nitro', key: 'n' },
  { radical: 'ciano', key: '' },
  { radical: 'metóxi', key: '' },
  { radical: 'etóxi', key: '' },
];

const CHAIN_PREFIXES = [
  { prefix: 'met', carbons: 1, key: '1' },
  { prefix: 'et', carbons: 2, key: '2' },
  { prefix: 'prop', carbons: 3, key: '3' },
  { prefix: 'but', carbons: 4, key: '4' },
  { prefix: 'pent', carbons: 5, key: '5' },
  { prefix: 'hex', carbons: 6, key: '6' },
  { prefix: 'hept', carbons: 7, key: '7' },
  { prefix: 'oct', carbons: 8, key: '8' },
  { prefix: 'non', carbons: 9, key: '9' },
  { prefix: 'dec', carbons: 10, key: '0' },
];

const BOND_INFIXES = [
  { infix: 'an', label: 'an (simples)', key: 'A' },
  { infix: 'en', label: 'en (dupla)', key: 'E' },
  { infix: 'in', label: 'in (tripla)', key: 'I' },
  { infix: 'dien', label: 'dien (2 duplas)', key: 'D' },
];

const FUNCTION_SUFFIXES = [
  { suffix: 'o', label: '-o (Hidrocarboneto)', key: 'O' },
  { suffix: 'ol', label: '-ol (Álcool / Fenol / Enol)', key: 'L' },
  { suffix: 'al', label: '-al (Aldeído)', key: 'H' },
  { suffix: 'ona', label: '-ona (Cetona)', key: 'K' },
  { suffix: 'oico', label: '-oico (Ácido Carboxílico)', key: 'C' },
  { suffix: 'oato', label: '-oato (Éster)', key: 'T' },
  { suffix: 'amina', label: '-amina (Amina)', key: 'N' },
  { suffix: 'amida', label: '-amida (Amida)', key: 'M' },
  { suffix: 'nitrila', label: '-nitrila (Nitrila)', key: 'U' },
  { suffix: 'oíla', label: '-oíla (Haleto Acila)', key: '' },
];

const ESTER_ALKYL_PARTS = [
  'de metila',
  'de etila',
  'de propila',
  'de isopropila',
  'de butila',
  'de fenila',
];

const LOCANT_OPTIONS = ['', '1', '2', '3', '4', '5', '6', '7', 'N'];

export const SlotBuilder: React.FC = () => {
  const {
    slotState,
    setSlotState,
    addRadicalChip,
    removeRadicalChip,
    popLastRadicalChip,
    clearSlotState,
    submitAnswer,
    isAnswerSubmitted,
    toggleCheatsheet,
    quickRadicalMode,
    setQuickRadicalMode,
    playMechanicalKeySound,
    playClickSound,
  } = useGameStore();

  const [radicalLocant, setRadicalLocant] = useState('2');

  const assembledName = assembleIUPACFromSlots(slotState);

  const handleAddRadical = (rad: string) => {
    playMechanicalKeySound();
    addRadicalChip(rad, radicalLocant);
  };

  const handleClear = () => {
    playClickSound();
    clearSlotState();
  };

  const handlePrefixToggle = (pref: string) => {
    playMechanicalKeySound();
    setSlotState({
      classPrefix: slotState.classPrefix === pref ? '' : pref,
    });
  };

  const handleRingToggle = () => {
    playMechanicalKeySound();
    setSlotState({ isRing: !slotState.isRing });
  };

  const handleChainPrefixSelect = (pref: string) => {
    playMechanicalKeySound();
    setSlotState({ chainPrefix: pref });
  };

  const handleInfixSelect = (infix: string) => {
    playMechanicalKeySound();
    setSlotState({ bondInfix: infix });
  };

  const handleSuffixSelect = (suffix: string) => {
    playMechanicalKeySound();
    setSlotState({ functionSuffix: suffix });
  };

  const handleEsterSelect = (alkyl: string) => {
    playMechanicalKeySound();
    setSlotState({
      esterAlkyl: slotState.esterAlkyl === alkyl ? '' : alkyl,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
      {/* Live Assembled Preview Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 sticky top-2 z-10 shadow-lg shadow-black/40">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nome IUPAC Montado Dinamicamente:</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 truncate">
            {assembledName || '(Selecione blocos ou use atalhos do teclado)'}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
          {/* Quick Cheatsheet Button */}
          <button
            type="button"
            onClick={toggleCheatsheet}
            title="Ver todos os atalhos de teclado (?)"
            className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Atalhos</span>
            <kbd className="px-1 py-0.2 rounded bg-slate-900 border border-cyan-500/50 text-[10px] font-mono font-bold">
              ?
            </kbd>
          </button>

          {/* Undo Radical Chip */}
          {slotState.radicals.length > 0 && (
            <button
              type="button"
              onClick={popLastRadicalChip}
              title="Desfazer último radical adicionado (Backspace)"
              className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Desfazer</span>
              <kbd className="px-1 py-0.2 rounded bg-slate-900 border border-amber-500/50 text-[10px] font-mono font-bold">
                ⌫
              </kbd>
            </button>
          )}

          {/* Clear All */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isAnswerSubmitted}
            title="Limpar todos os blocos (Z)"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
            <kbd className="px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono">
              Z
            </kbd>
          </button>

          {/* Submit */}
          <button
            type="button"
            onClick={submitAnswer}
            disabled={isAnswerSubmitted || !assembledName.trim()}
            title="Submeter resposta (Enter)"
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isAnswerSubmitted || !assembledName.trim()
                ? 'opacity-40 bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 text-black shadow-amber-500/20 hover:brightness-110 font-black'
            }`}
          >
            <span>Submeter</span>
            <Send className="w-3 h-3" />
            <kbd className="px-1.5 py-0.2 rounded bg-black/20 text-black text-[10px] font-mono font-black ml-0.5">
              ↵
            </kbd>
          </button>
        </div>
      </div>

      {/* Quick Radical Mode Active Indicator Banner */}
      {quickRadicalMode.active && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-cyan-500/20 border border-amber-400/60 shadow-lg shadow-amber-500/10 text-xs font-mono animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-amber-300">MODO RADICAL ATIVO:</span>
            <span className="text-slate-200">
              Posição: <strong className="text-cyan-300 font-bold">[{quickRadicalMode.locant || '2'}]</strong> (digite 1-9) + tecle radical (<span className="text-amber-300 font-bold">m, e, p, c, b, h, o, a, n</span>)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setQuickRadicalMode({ active: false })}
            className="px-2 py-0.5 rounded bg-slate-900 border border-amber-500/40 text-amber-300 hover:text-white text-[10px] cursor-pointer"
          >
            ESC para sair
          </button>
        </div>
      )}

      {/* Builder Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Prefixo Especial de Classe & Anel */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            1. Prefixo de Classe & Anel
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {CLASS_PREFIXES.map((item) => {
              const isSelected = slotState.classPrefix === item.prefix;
              return (
                <button
                  key={item.prefix}
                  type="button"
                  onClick={() => handlePrefixToggle(item.prefix)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span>{item.prefix}</span>
                  {item.key && (
                    <kbd className="px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-rose-300 text-[10px] font-mono">
                      {item.key}
                    </kbd>
                  )}
                </button>
              );
            })}

            {/* Ciclo toggle */}
            <button
              type="button"
              onClick={handleRingToggle}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                slotState.isRing
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-800/60'
              }`}
            >
              <CircleDot className="w-3 h-3" />
              <span>ciclo-</span>
              <kbd className="px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[10px] font-mono">
                W
              </kbd>
            </button>
          </div>
        </div>

        {/* Section 2: Radicais & Funções Subordinadas */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              2. Radicais & Substituintes
              <span className="text-[10px] font-normal text-amber-400/80 font-mono ml-1">
                (tecle <kbd className="px-1 rounded bg-slate-800 border border-slate-700 text-amber-300">G</kbd>)
              </span>
            </span>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-mono">Posição:</span>
              <select
                value={radicalLocant}
                onChange={(e) => setRadicalLocant(e.target.value)}
                className="bg-slate-800 text-amber-300 font-mono text-xs rounded px-1.5 py-0.5 border border-slate-700"
              >
                {LOCANT_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc || 's/n'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Added Radicals */}
          {slotState.radicals.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-900 border border-amber-900/40 min-h-[36px]">
              {slotState.radicals.map((rad) => (
                <span
                  key={rad.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-mono"
                >
                  <span>{rad.locant ? `${rad.locant}-${rad.radical}` : rad.radical}</span>
                  <button
                    type="button"
                    onClick={() => removeRadicalChip(rad.id)}
                    className="text-amber-400 hover:text-rose-400 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Radical Pickers */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Alquilas Simples:</span>
            <div className="flex flex-wrap gap-1">
              {SIMPLE_RADICALS.map((item) => (
                <button
                  key={item.radical}
                  type="button"
                  onClick={() => handleAddRadical(item.radical)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs font-mono transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{item.radical}</span>
                  {item.key && (
                    <kbd className="px-1 py-0.1 rounded bg-slate-900 border border-slate-700 text-amber-400 text-[9px]">
                      {item.key}
                    </kbd>
                  )}
                </button>
              ))}
            </div>

            <span className="text-[10px] text-orange-400 font-semibold uppercase mt-1">
              Funções como Radicais (Subordinadas):
            </span>
            <div className="flex flex-wrap gap-1">
              {SUBORDINATED_FUNCTIONAL_RADICALS.map((item) => (
                <button
                  key={item.radical}
                  type="button"
                  onClick={() => handleAddRadical(item.radical)}
                  className="px-2 py-0.5 rounded bg-orange-950/30 hover:bg-orange-900/50 text-orange-300 hover:text-orange-200 border border-orange-800/40 text-xs font-mono transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{item.radical}</span>
                  {item.key && (
                    <kbd className="px-1 py-0.1 rounded bg-slate-900 border border-orange-800/60 text-orange-400 text-[9px]">
                      {item.key}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Prefixo da Cadeia Principal (Carbonos) */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            3. Cadeia Principal (Nº de Carbonos)
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {CHAIN_PREFIXES.map((item) => {
              const isSelected = slotState.chainPrefix === item.prefix;
              return (
                <button
                  key={item.prefix}
                  type="button"
                  onClick={() => handleChainPrefixSelect(item.prefix)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex flex-col items-center transition-all active:scale-95 cursor-pointer relative ${
                    isSelected
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{item.prefix}</span>
                    <kbd className={`px-1 py-0.1 rounded text-[9px] font-mono ${
                      isSelected ? 'bg-black/30 text-black font-black' : 'bg-slate-900 text-cyan-400 border border-slate-700'
                    }`}>
                      {item.key}
                    </kbd>
                  </div>
                  <span className="text-[9px] opacity-70">C{item.carbons}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Infixo de Saturação (Ligações) */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              4. Infixo / Grau de Saturação
            </span>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-mono">Posição:</span>
              <select
                value={slotState.bondLocant}
                onChange={(e) => setSlotState({ bondLocant: e.target.value })}
                className="bg-slate-800 text-purple-300 font-mono text-xs rounded px-1.5 py-0.5 border border-slate-700"
              >
                {LOCANT_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc || 's/n'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {BOND_INFIXES.map((item) => {
              const isSelected = slotState.bondInfix === item.infix;
              return (
                <button
                  key={item.infix}
                  type="button"
                  onClick={() => handleInfixSelect(item.infix)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all active:scale-95 cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <kbd className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isSelected ? 'bg-black/30 text-white font-bold' : 'bg-slate-900 text-purple-300 border border-slate-700'
                  }`}>
                    {item.key}
                  </kbd>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Sufixo Funcional Principal */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 md:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              5. Sufixo Funcional Principal
            </span>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-mono">Posição Grupo:</span>
              <select
                value={slotState.suffixLocant}
                onChange={(e) => setSlotState({ suffixLocant: e.target.value })}
                className="bg-slate-800 text-emerald-300 font-mono text-xs rounded px-1.5 py-0.5 border border-slate-700"
              >
                {LOCANT_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc || 's/n'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
            {FUNCTION_SUFFIXES.map((item) => {
              const isSelected = slotState.functionSuffix === item.suffix;
              return (
                <button
                  key={item.suffix}
                  type="button"
                  onClick={() => handleSuffixSelect(item.suffix)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all active:scale-95 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.key && (
                    <kbd className={`px-1.5 py-0.2 rounded text-[10px] font-mono shrink-0 ml-1 ${
                      isSelected ? 'bg-black/30 text-white font-bold' : 'bg-slate-900 text-emerald-300 border border-slate-700'
                    }`}>
                      {item.key}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>

          {/* Éster alkyl tail drawer if -oato is chosen */}
          {slotState.functionSuffix === 'oato' && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800 mt-1">
              <span className="text-[11px] text-emerald-400 font-semibold uppercase">
                Terminação de Éster (...oato de alquila):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ESTER_ALKYL_PARTS.map((alk) => {
                  const isSelected = slotState.esterAlkyl === alk;
                  return (
                    <button
                      key={alk}
                      type="button"
                      onClick={() => handleEsterSelect(alk)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-900/60'
                      }`}
                    >
                      {alk}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
