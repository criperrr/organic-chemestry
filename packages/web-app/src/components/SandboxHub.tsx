import React, { useState, useMemo, useCallback } from 'react';
import {
  FlaskConical,
  Pencil,
  LayoutGrid,
  Atom,
  Search,
  Copy,
  Check,
  Flame,
  ArrowRight,
  Shuffle,
  ZoomIn,
  Layers,
  Info,
  BookOpen,
} from 'lucide-react';
import { SmilesCanvas } from '@quimicarush/smiles-renderer';
import {
  parseIUPACName,
  IUPAC_PRIORITY_ORDER,
  type Molecule,
} from '@quimicarush/chemistry-core';
import {
  datasetProvider,
  synthesizeChaosMolecule,
} from '@quimicarush/chemistry-dataset';
import { useGameStore } from '../stores/useGameStore.js';
import { haptics } from '../utils/haptics.js';
import { LiveBuilder } from './sandbox/LiveBuilder.js';

/** The sandbox has two halves: draw your own, or explore the curated acervo. */
export type SandboxMode = 'construtor' | 'presets';

export type SandboxCategory =
  | 'todos'
  | 'hidrocarbonetos'
  | 'oxigenadas'
  | 'nitrogenadas'
  | 'haletos'
  | 'aromaticos'
  | 'caos';

const CATEGORY_CHIPS: { id: SandboxCategory; label: string; icon?: React.FC<{ className?: string }> }[] = [
  { id: 'todos', label: 'Todos os Presets' },
  { id: 'hidrocarbonetos', label: 'Hidrocarbonetos' },
  { id: 'oxigenadas', label: 'Oxigenadas' },
  { id: 'nitrogenadas', label: 'Nitrogenadas' },
  { id: 'haletos', label: 'Haletos & Derivados' },
  { id: 'aromaticos', label: 'Aromáticos' },
  { id: 'caos', label: 'Modo Caos', icon: Flame },
];

export const SandboxHub: React.FC = () => {
  const {
    currentMolecule: storeMolecule,
    setCurrentMolecule,
    setActiveTab,
    openMoleculeZoom,
    playClickSound,
    playSnapSound,
  } = useGameStore();

  // Curated list of all canonical molecules
  const allMolecules = useMemo(() => datasetProvider.getAllMolecules(), []);

  // Currently inspected molecule in sandbox
  const [inspectedMolecule, setInspectedMolecule] = useState<Molecule>(
    () => storeMolecule ?? allMolecules[0] ?? {
      id: 'sandbox-default',
      iupacName: 'etanol',
      smiles: 'CCO',
      formula: 'C2H6O',
      primaryFunction: 'alcool',
      difficulty: 'iniciante',
      commonNames: ['álcool etílico'],
    }
  );

  // Draw-your-own vs. browse-the-acervo
  const [sandboxMode, setSandboxMode] = useState<SandboxMode>('construtor');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SandboxCategory>('todos');
  const [copiedField, setCopiedField] = useState<'iupac' | 'smiles' | null>(null);

  // Filtered presets
  const filteredPresets = useMemo(() => {
    let list = allMolecules;

    if (selectedCategory !== 'todos') {
      if (selectedCategory === 'hidrocarbonetos') {
        list = list.filter((m) => m.primaryFunction === 'hidrocarboneto');
      } else if (selectedCategory === 'oxigenadas') {
        list = list.filter((m) =>
          ['alcool', 'fenol', 'enol', 'eter', 'aldeido', 'cetona', 'acido_carboxilico', 'ester', 'anidrido'].includes(
            m.primaryFunction
          )
        );
      } else if (selectedCategory === 'nitrogenadas') {
        list = list.filter((m) =>
          ['amina', 'amida', 'nitrila', 'nitrocomposto'].includes(m.primaryFunction)
        );
      } else if (selectedCategory === 'haletos') {
        list = list.filter((m) =>
          ['haleto_alquila', 'haleto_acila'].includes(m.primaryFunction)
        );
      } else if (selectedCategory === 'aromaticos') {
        list = list.filter((m) =>
          m.iupacName.includes('benzen') ||
          m.iupacName.includes('fenil') ||
          m.primaryFunction === 'fenol' ||
          (m.commonNames && m.commonNames.some((n) => n.includes('benzen') || n.includes('tolueno')))
        );
      } else if (selectedCategory === 'caos') {
        list = list.filter((m) => m.difficulty === 'caos');
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.iupacName.toLowerCase().includes(q) ||
          m.formula.toLowerCase().includes(q) ||
          m.smiles.toLowerCase().includes(q) ||
          (m.commonNames && m.commonNames.some((c) => c.toLowerCase().includes(q)))
      );
    }

    return list.slice(0, 48);
  }, [allMolecules, selectedCategory, searchQuery]);

  // Real-time AST Morphology Parsing
  const parsedAST = useMemo(() => {
    try {
      return parseIUPACName(inspectedMolecule.iupacName);
    } catch {
      return null;
    }
  }, [inspectedMolecule.iupacName]);

  // Handler: Select a molecule
  const handleSelectMolecule = useCallback(
    (mol: Molecule) => {
      playClickSound();
      haptics.tap();
      setInspectedMolecule(mol);
    },
    [playClickSound]
  );

  // Handler: Random molecule
  const handleRandomMolecule = useCallback(() => {
    playSnapSound();
    haptics.tap();
    const randomIndex = Math.floor(Math.random() * allMolecules.length);
    const mol = allMolecules[randomIndex];
    if (mol) {
      handleSelectMolecule(mol);
    }
  }, [allMolecules, handleSelectMolecule, playSnapSound]);

  // Handler: Synthesize Chaos Molecule
  const handleChaosMolecule = useCallback(() => {
    playSnapSound();
    haptics.tap();
    const chaos = synthesizeChaosMolecule({ targetFunctionCount: 3 });
    handleSelectMolecule(chaos);
  }, [handleSelectMolecule, playSnapSound]);

  // Handler: Copy to clipboard
  const handleCopy = useCallback((text: string, field: 'iupac' | 'smiles') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1600);
      });
    }
  }, []);

  // Handler: Transfer molecule to Arcade training mode
  const handleSendToArcade = useCallback(() => {
    playClickSound();
    haptics.success();
    setCurrentMolecule(inspectedMolecule);
    setActiveTab('arcade');
  }, [inspectedMolecule, setCurrentMolecule, setActiveTab, playClickSound]);

  // Priority ranking label
  const priorityRank = IUPAC_PRIORITY_ORDER[inspectedMolecule.primaryFunction] ?? 0;

  return (
    <div id="sandbox-root" className="w-full flex flex-col gap-6 py-2 animate-fadeIn">
      {/* Sandbox Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shrink-0 shadow-sm">
            <FlaskConical className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                Laboratório Molecular
              </h1>
              <span className="m3-chip text-[10px] py-0.5 px-2 font-mono uppercase bg-[var(--md-sys-color-surface-container-highest)]">
                Sandbox IUPAC
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              {sandboxMode === 'construtor'
                ? 'Desenhe a molécula no diagrama de linhas — o nome IUPAC é montado enquanto você desenha.'
                : 'Explore o acervo curado e deconstrua a morfologia de cada nomenclatura.'}
            </p>
          </div>
        </div>

        {/* Global Sandbox Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode switcher: build vs. browse */}
          <div className="flex items-center p-1 rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]">
            {(
              [
                { id: 'construtor' as const, label: 'Construtor', icon: Pencil },
                { id: 'presets' as const, label: 'Acervo', icon: LayoutGrid },
              ]
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  playClickSound();
                  haptics.tap();
                  setSandboxMode(id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  sandboxMode === id
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {sandboxMode === 'presets' && (
          <>
          <button
            type="button"
            onClick={handleRandomMolecule}
            className="m3-button-tonal text-xs py-2 px-3 flex items-center gap-1.5"
            title="Escolher molécula aleatória do acervo"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Aleatória</span>
          </button>

          <button
            type="button"
            onClick={handleChaosMolecule}
            className="m3-button-tonal text-xs py-2 px-3 flex items-center gap-1.5 border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] hover:text-[var(--md-sys-color-on-error-container)]"
            title="Sintetizar molécula polifuncional extrema (Modo Caos)"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Sintetizar Caos</span>
          </button>

          <button
            type="button"
            onClick={handleSendToArcade}
            className="m3-button-filled text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
            title="Praticar esta molécula no Treino Arcade [1]"
          >
            <span>Treinar no Arcade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          </>
          )}
        </div>
      </div>

      {sandboxMode === 'construtor' && <LiveBuilder />}

      {/* Main Sandbox Layout: 2-Column Responsive Split */}
      <div
        className={`${
          sandboxMode === 'presets' ? 'grid' : 'hidden'
        } grid-cols-1 lg:grid-cols-12 gap-6 items-start`}
      >
        {/* ========================================================================= */}
        {/* Left / Center Column: Molecular Presentation & Live Inspection (7 cols)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Card 1: 2D Canvas & Quick Meta */}
          <div className="m3-card p-4 sm:p-6 flex flex-col items-center gap-4 shadow-sm relative overflow-hidden">
            {/* Top Bar inside Card */}
            <div className="w-full flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="m3-chip gap-1.5 py-1 px-3">
                  <Atom className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                  <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase">Fórmula:</span>
                  <strong className="text-[var(--md-sys-color-on-surface)]">{inspectedMolecule.formula}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentMolecule(inspectedMolecule);
                    openMoleculeZoom();
                  }}
                  className="m3-chip hover:border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] py-1 px-2.5 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Ampliar visualização 2D"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Zoom</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="m3-chip text-[10px] uppercase tracking-wider py-1 px-2.5">
                  {inspectedMolecule.difficulty}
                </span>
                {inspectedMolecule.difficulty === 'caos' && (
                  <span className="m3-chip bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--md-sys-color-error)] font-bold text-[10px] py-1 px-2 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[var(--md-sys-color-error)]" />
                    CAOS
                  </span>
                )}
              </div>
            </div>

            {/* SmilesCanvas 2D Rendering */}
            <div
              className="w-full flex items-center justify-center p-3 sm:p-5 my-1 cursor-zoom-in group relative rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]"
              onClick={() => {
                setCurrentMolecule(inspectedMolecule);
                openMoleculeZoom();
              }}
              title="Clique para ampliar a projeção 2D"
            >
              <SmilesCanvas
                smiles={inspectedMolecule.smiles}
                width={360}
                height={200}
                theme="dark"
                className="max-w-full group-hover:scale-[1.01] transition-transform duration-150"
              />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white/90 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                <ZoomIn className="w-3 h-3" />
                <span>Toque para Zoom</span>
              </div>
            </div>

            {/* IUPAC Name Banner */}
            <div className="w-full flex flex-col items-center gap-1 text-center">
              <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-[var(--md-sys-color-primary)]">
                Nomenclatura Canônica IUPAC (pt-BR)
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold text-[var(--md-sys-color-on-surface)] tracking-tight select-all">
                {inspectedMolecule.iupacName}
              </h2>
              {inspectedMolecule.commonNames && inspectedMolecule.commonNames.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap justify-center mt-0.5">
                  <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Sinônimos:</span>
                  {inspectedMolecule.commonNames.map((name) => (
                    <span
                      key={name}
                      className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* SMILES and Copy Toolbar */}
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase font-semibold shrink-0">
                  SMILES:
                </span>
                <span className="truncate text-[var(--md-sys-color-on-surface)] font-bold select-all">
                  {inspectedMolecule.smiles}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => handleCopy(inspectedMolecule.iupacName, 'iupac')}
                  className="m3-button-tonal py-1 px-2.5 text-[11px] flex items-center gap-1"
                  title="Copiar nome IUPAC"
                >
                  {copiedField === 'iupac' ? (
                    <>
                      <Check className="w-3 h-3 text-[var(--md-sys-color-success)]" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar IUPAC</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(inspectedMolecule.smiles, 'smiles')}
                  className="m3-button-tonal py-1 px-2.5 text-[11px] flex items-center gap-1"
                  title="Copiar código SMILES"
                >
                  {copiedField === 'smiles' ? (
                    <>
                      <Check className="w-3 h-3 text-[var(--md-sys-color-success)]" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar SMILES</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Real-time IUPAC Nomenclature Morphology Inspection Card */}
          <div className="m3-card p-4 sm:p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-3">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
                  Deconstrução Morfológica IUPAC
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                Prioridade: {priorityRank}/16
              </span>
            </div>

            {/* Morphological Blocks Breakdown */}
            {parsedAST ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Prefixo / Radicais */}
                <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--md-sys-color-primary)] font-mono">
                    1. Radicais / Prefixo
                  </span>
                  <div className="text-sm font-bold font-mono text-[var(--md-sys-color-on-surface)]">
                    {parsedAST.substituents.length > 0 ? (
                      parsedAST.substituents.map((s, idx) => (
                        <span key={idx} className="block truncate">
                          {s.locants && s.locants.length > 0 ? `${s.locants.join(',')}-` : ''}
                          {s.name}
                        </span>
                      ))
                    ) : parsedAST.isRing ? (
                      <span className="text-[var(--md-sys-color-primary)]">ciclo-</span>
                    ) : (
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-normal italic">
                        Sem radicais
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Cadeia Principal (Carbonos) */}
                <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--md-sys-color-primary)] font-mono">
                    2. Cadeia Principal
                  </span>
                  <div className="text-sm font-bold font-mono text-[var(--md-sys-color-on-surface)] flex items-baseline gap-1">
                    <span>{parsedAST.mainChainPrefix || '—'}</span>
                    {parsedAST.carbonCount > 0 && (
                      <span className="text-[10px] font-normal text-[var(--md-sys-color-on-surface-variant)]">
                        (C{parsedAST.carbonCount})
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Infixo de Ligação */}
                <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--md-sys-color-primary)] font-mono">
                    3. Infixo / Ligação
                  </span>
                  <div className="text-sm font-bold font-mono text-[var(--md-sys-color-on-surface)]">
                    {parsedAST.bonds && parsedAST.bonds.length > 0 ? (
                      parsedAST.bonds.map((b, idx) => (
                        <span key={idx} className="block">
                          {b.locants && b.locants.length > 0 ? `${b.locants.join(',')}-` : ''}
                          {b.type}
                        </span>
                      ))
                    ) : (
                      <span>-an-</span>
                    )}
                  </div>
                </div>

                {/* 4. Sufixo Funcional */}
                <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--md-sys-color-primary)] font-mono">
                    4. Sufixo Funcional
                  </span>
                  <div className="text-sm font-bold font-mono text-[var(--md-sys-color-primary)]">
                    -{parsedAST.functionSuffix || 'o'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Estrutura IUPAC polifuncional analisada diretamente.
              </div>
            )}

            {/* Chemical Details Summary */}
            <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Função Química Principal:</span>
                <strong className="text-[var(--md-sys-color-on-surface)] uppercase font-mono font-bold">
                  {inspectedMolecule.primaryFunction}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Ordem de Prioridade IUPAC:</span>
                <span className="m3-chip text-[10px] py-0.5 px-2 font-mono">
                  Posto {priorityRank} de 16
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Right Column: Preset Molecule Library & Search (5 cols)                   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="m3-card p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
            {/* Library Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
                  Biblioteca de Moléculas
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
                {filteredPresets.length} modelos
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, fórmula ou SMILES..."
                className="m3-text-field w-full pl-9 pr-3 py-2 text-xs outline-none"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORY_CHIPS.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedCategory(cat.id);
                    }}
                    className={`m3-chip text-[11px] py-1 px-2.5 ${isSelected ? 'active' : ''}`}
                  >
                    {IconComp && <IconComp className="w-3 h-3 text-[var(--md-sys-color-error)]" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Preset List */}
            <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredPresets.length > 0 ? (
                filteredPresets.map((mol) => {
                  const isCurrent = inspectedMolecule.id === mol.id || inspectedMolecule.iupacName === mol.iupacName;
                  return (
                    <button
                      key={mol.id || mol.iupacName}
                      type="button"
                      onClick={() => handleSelectMolecule(mol)}
                      className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary-container)] shadow-sm'
                          : 'bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold text-xs truncate">{mol.iupacName}</span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                          <span>{mol.formula}</span>
                          <span>•</span>
                          <span className="capitalize">{mol.primaryFunction}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)]">
                          {mol.difficulty}
                        </span>
                        {isCurrent && (
                          <div className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center gap-2">
                  <Info className="w-5 h-5 text-[var(--md-sys-color-outline)]" />
                  <span>Nenhuma molécula encontrada para este filtro.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
