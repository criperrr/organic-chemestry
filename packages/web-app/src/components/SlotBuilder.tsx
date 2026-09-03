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
import { haptics } from '../utils/haptics.js';

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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 m3-card p-3.5 sm:p-6">
      {/* Live Assembled Preview Bar (Anchored safely below mobile top bar) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] sticky top-13 lg:top-2 z-20 shadow-sm backdrop-blur-sm">
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-mono mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
              Sequenciador IUPAC:
            </span>
          </div>
          <div className="text-base sm:text-xl font-bold font-mono text-[var(--md-sys-color-primary)] truncate">
            {assembledName || '(Selecione blocos abaixo)'}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 self-stretch sm:self-center shrink-0 justify-end flex-wrap">
          {/* Quick Cheatsheet Button (hidden on tiny screens, icon on mobile) */}
          <button
            type="button"
            onClick={toggleCheatsheet}
            title="Ver todos os atalhos de teclado (?)"
            className="m3-chip text-xs py-1 px-2.5 sm:py-1.5 sm:px-3 flex items-center gap-1 min-h-[38px] active:scale-95"
          >
            <Keyboard className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            <span className="hidden sm:inline">Atalhos</span>
            <kbd className="text-[10px] px-1 py-0.2 rounded bg-[var(--md-sys-color-surface-container-highest)] font-mono">?</kbd>
          </button>

          {/* Undo Radical Chip */}
          {slotState.radicals.length > 0 && (
            <button
              type="button"
              onClick={() => {
                haptics.tap();
                popLastRadicalChip();
              }}
              title="Desfazer último radical adicionado (Backspace)"
              className="m3-chip text-xs py-1 px-2.5 sm:py-1.5 sm:px-3 flex items-center gap-1 min-h-[38px] active:scale-95"
            >
              <Undo2 className="w-3.5 h-3.5 text-[var(--md-sys-color-warning)]" />
              <span className="hidden sm:inline">Desfazer</span>
              <kbd className="hidden sm:inline text-[10px] px-1 py-0.2 rounded bg-[var(--md-sys-color-surface-container-highest)] font-mono">⌫</kbd>
            </button>
          )}

          {/* Clear All */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isAnswerSubmitted}
            title="Limpar todos os blocos (Z)"
            className="m3-chip text-xs py-1 px-2.5 sm:py-1.5 sm:px-3 flex items-center gap-1 min-h-[38px] active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
            <kbd className="hidden sm:inline text-[10px] px-1 py-0.2 rounded bg-[var(--md-sys-color-surface-container-highest)] font-mono">Z</kbd>
          </button>

          {/* Submit */}
          <button
            type="button"
            onClick={submitAnswer}
            disabled={isAnswerSubmitted || !assembledName.trim()}
            title="Submeter resposta (Enter)"
            className="m3-button-filled text-xs sm:text-sm py-2 px-3.5 sm:px-4 font-bold flex items-center gap-1.5 disabled:opacity-40 min-h-[38px] active:scale-95"
          >
            <span>Confirmar</span>
            <Send className="w-3.5 h-3.5" />
            <kbd className="hidden sm:inline bg-black/20 text-current font-mono font-bold text-xs px-1 rounded">↵</kbd>
          </button>
        </div>
      </div>

      {/* Quick Radical Mode Active Indicator Banner */}
      {quickRadicalMode.active && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border border-[var(--md-sys-color-secondary)] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
            <span className="font-bold">MODO RADICAL ATIVO:</span>
            <span>
              Posição: <strong className="font-bold">[{quickRadicalMode.locant || '2'}]</strong> (digite 1-9) + tecle radical (m, e, p, c, b, h, o, a, n)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setQuickRadicalMode({ active: false })}
            className="m3-chip text-[10px] py-0.5 px-2"
          >
            ESC para sair
          </button>
        </div>
      )}

      {/* Builder Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Prefixo Especial de Classe & Anel */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
          <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
            1. Prefixo de Classe & Anel
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            {CLASS_PREFIXES.map((item) => {
              const isSelected = slotState.classPrefix === item.prefix;
              return (
                <button
                  key={item.prefix}
                  type="button"
                  onClick={() => handlePrefixToggle(item.prefix)}
                  className={`m3-chip text-xs py-2 px-3 flex items-center gap-1.5 min-h-[40px] active:scale-95 ${
                    isSelected ? 'active' : ''
                  }`}
                >
                  <span>{item.prefix}</span>
                  {item.key && <kbd className="hidden sm:inline text-[10px] opacity-75 font-mono">[{item.key}]</kbd>}
                </button>
              );
            })}

            {/* Ciclo toggle */}
            <button
              type="button"
              onClick={handleRingToggle}
              className={`m3-chip text-xs py-2 px-3 flex items-center gap-1.5 min-h-[40px] active:scale-95 ${
                slotState.isRing ? 'active' : ''
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>ciclo-</span>
              <kbd className="hidden sm:inline text-[10px] opacity-75 font-mono">[W]</kbd>
            </button>
          </div>
        </div>

        {/* Section 2: Radicais & Funções Subordinadas */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
              2. Radicais & Substituintes
              <span className="hidden sm:inline text-[10px] font-normal text-[var(--md-sys-color-on-surface-variant)] ml-1">
                (tecle <kbd className="px-1 rounded bg-[var(--md-sys-color-surface-container-high)] font-mono">G</kbd>)
              </span>
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[var(--md-sys-color-on-surface-variant)] font-mono">Posição:</span>
              <select
                value={radicalLocant}
                onChange={(e) => setRadicalLocant(e.target.value)}
                className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-mono text-base sm:text-xs rounded-full px-3 py-1.5 border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer min-h-[38px]"
              >
                {LOCANT_OPTIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]">
                    {loc || 's/n'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Added Radicals */}
          {slotState.radicals.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] min-h-[38px]">
              {slotState.radicals.map((rad) => (
                <span
                  key={rad.id}
                  className="m3-chip active text-xs font-mono gap-1.5 py-1 px-2.5"
                >
                  <span>{rad.locant ? `${rad.locant}-${rad.radical}` : rad.radical}</span>
                  <button
                    type="button"
                    onClick={() => removeRadicalChip(rad.id)}
                    className="hover:opacity-75 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Radical Pickers */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono uppercase font-semibold">Alquilas:</span>
            <div className="flex flex-wrap gap-1.5">
              {SIMPLE_RADICALS.map((item) => (
                <button
                  key={item.radical}
                  type="button"
                  onClick={() => handleAddRadical(item.radical)}
                  className="m3-chip text-xs py-1.5 px-2.5 flex items-center gap-1 min-h-[36px] active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>{item.radical}</span>
                  {item.key && <kbd className="hidden sm:inline text-[10px] opacity-75 font-mono">[{item.key}]</kbd>}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono uppercase font-semibold mt-1">
              Funções como Radicais (Subordinadas):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUBORDINATED_FUNCTIONAL_RADICALS.map((item) => (
                <button
                  key={item.radical}
                  type="button"
                  onClick={() => handleAddRadical(item.radical)}
                  className="m3-chip text-xs py-1.5 px-2.5 flex items-center gap-1 min-h-[36px] active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>{item.radical}</span>
                  {item.key && <kbd className="hidden sm:inline text-[10px] opacity-75 font-mono">[{item.key}]</kbd>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Prefixo da Cadeia Principal (Carbonos) */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
          <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
            3. Cadeia Principal (Carbonos)
          </span>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {CHAIN_PREFIXES.map((item) => {
              const isSelected = slotState.chainPrefix === item.prefix;
              return (
                <button
                  key={item.prefix}
                  type="button"
                  onClick={() => handleChainPrefixSelect(item.prefix)}
                  className={`m3-chip rounded-2xl py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-xs min-h-[46px] active:scale-95 ${
                    isSelected ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center gap-0.5 font-bold">
                    <span>{item.prefix}</span>
                    <kbd className="hidden sm:inline text-[9px] opacity-75 font-mono">[{item.key}]</kbd>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono">C{item.carbons}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Infixo de Saturação (Ligações) */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
              4. Infixo / Saturação
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[var(--md-sys-color-on-surface-variant)] font-mono">Posição:</span>
              <select
                value={slotState.bondLocant}
                onChange={(e) => setSlotState({ bondLocant: e.target.value })}
                className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-mono text-base sm:text-xs rounded-full px-3 py-1.5 border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer min-h-[38px]"
              >
                {LOCANT_OPTIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]">
                    {loc || 's/n'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BOND_INFIXES.map((item) => {
              const isSelected = slotState.bondInfix === item.infix;
              return (
                <button
                  key={item.infix}
                  type="button"
                  onClick={() => handleInfixSelect(item.infix)}
                  className={`m3-chip rounded-2xl py-2 px-3 flex items-center justify-between text-xs min-h-[44px] active:scale-95 ${
                    isSelected ? 'active' : ''
                  }`}
                >
                  <span className="font-semibold">{item.label}</span>
                  <kbd className="hidden sm:inline text-[10px] opacity-75 font-mono">[{item.key}]</kbd>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Sufixo Funcional Principal */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] md:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
              5. Sufixo Funcional Principal
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[var(--md-sys-color-on-surface-variant)] font-mono">Posição Grupo:</span>
              <select
                value={slotState.suffixLocant}
                onChange={(e) => setSlotState({ suffixLocant: e.target.value })}
                className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-mono text-base sm:text-xs rounded-full px-3 py-1.5 border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer min-h-[38px]"
              >
                {LOCANT_OPTIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]">
                    {loc || 's/n'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2">
            {FUNCTION_SUFFIXES.map((item) => {
              const isSelected = slotState.functionSuffix === item.suffix;
              return (
                <button
                  key={item.suffix}
                  type="button"
                  onClick={() => handleSuffixSelect(item.suffix)}
                  className={`m3-chip rounded-2xl py-2 px-2.5 flex items-center justify-between text-xs min-h-[44px] active:scale-95 ${
                    isSelected ? 'active' : ''
                  }`}
                >
                  <span className="truncate font-semibold">{item.label}</span>
                  {item.key && <kbd className="hidden sm:inline text-[10px] opacity-75 font-mono">[{item.key}]</kbd>}
                </button>
              );
            })}
          </div>

          {/* Éster alkyl tail drawer if -oato is chosen */}
          {slotState.functionSuffix === 'oato' && (
            <div className="flex flex-col gap-2 pt-3 border-t border-[var(--md-sys-color-outline-variant)] mt-1">
              <span className="text-[11px] text-[var(--md-sys-color-primary)] font-mono uppercase font-semibold">
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
                      className={`m3-chip text-xs py-1 px-3 ${
                        isSelected ? 'active' : ''
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
