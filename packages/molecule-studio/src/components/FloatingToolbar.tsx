import React from 'react';
import {
  PenLine,
  Atom,
  Sparkles,
  Hexagon,
  Eraser,
  Hand,
  Undo2,
  Redo2,
  Crosshair,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CanvasTool,
  AtomElement,
  FunctionalGroupType,
  RingTemplateType,
  SkeletalCanvasState,
} from '@quimicarush/molecule-canvas';

const TOOLS: { id: CanvasTool; label: string; icon: React.FC<{ className?: string }>; key: string }[] = [
  { id: 'bond', label: 'Ligação', icon: PenLine, key: 'B' },
  { id: 'element', label: 'Elemento', icon: Atom, key: 'E' },
  { id: 'functional_group', label: 'Grupo', icon: Sparkles, key: 'G' },
  { id: 'ring', label: 'Anel', icon: Hexagon, key: 'A' },
  { id: 'eraser', label: 'Borracha', icon: Eraser, key: 'X' },
  { id: 'pan', label: 'Mover', icon: Hand, key: 'V' },
];

const ELEMENTS: AtomElement[] = ['C', 'O', 'N', 'S', 'P', 'F', 'Cl', 'Br', 'I'];

const GROUPS: { id: FunctionalGroupType; label: string }[] = [
  { id: '-OH', label: '−OH' },
  { id: '=O', label: '=O' },
  { id: '-COOH', label: '−COOH' },
  { id: '-NH2', label: '−NH₂' },
  { id: '-NO2', label: '−NO₂' },
  { id: '-OCH3', label: '−OCH₃' },
  { id: '-C#N', label: '−C≡N' },
  { id: '-CH3', label: '−CH₃' },
  { id: '-CH2CH3', label: '−C₂H₅' },
  { id: '-CH(CH3)2', label: 'isopropil' },
  { id: '-C(CH3)3', label: 'terc-butil' },
  { id: '-C6H5', label: 'fenil' },
];

const RINGS: { id: RingTemplateType; label: string }[] = [
  { id: 'benzene', label: 'Benzeno' },
  { id: 'cyclohexane', label: 'Ciclo-hexano' },
  { id: 'cyclopentane', label: 'Ciclopentano' },
  { id: 'cyclobutane', label: 'Ciclobutano' },
  { id: 'cyclopropane', label: 'Ciclopropano' },
];

interface FloatingToolbarProps {
  state: SkeletalCanvasState | null;
  onSelectTool: (tool: CanvasTool) => void;
  onSelectElement: (element: AtomElement) => void;
  onSelectGroup: (group: FunctionalGroupType) => void;
  onSelectRing: (ring: RingTemplateType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRecenter: () => void;
  onClear: () => void;
  onHide: () => void;
}

/**
 * The only chrome pinned to the top of the screen: six tools, four actions, and
 * a contextual second row that appears solely for the tools that need a choice.
 */
export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  state,
  onSelectTool,
  onSelectElement,
  onSelectGroup,
  onSelectRing,
  onUndo,
  onRedo,
  onRecenter,
  onClear,
  onHide,
}) => {
  const tool = state?.tool ?? 'bond';

  const options: { label: string; active: boolean; onClick: () => void }[] =
    tool === 'element'
      ? ELEMENTS.map(element => ({
          label: element,
          active: state?.element === element,
          onClick: () => onSelectElement(element),
        }))
      : tool === 'functional_group'
      ? GROUPS.map(group => ({
          label: group.label,
          active: state?.group === group.id,
          onClick: () => onSelectGroup(group.id),
        }))
      : tool === 'ring'
      ? RINGS.map(ring => ({
          label: ring.label,
          active: state?.ring === ring.id,
          onClick: () => onSelectRing(ring.id),
        }))
      : [];

  return (
    <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
      <div className="studio-floating rounded-full px-1.5 py-1.5 flex items-center gap-1">
        {TOOLS.map(({ id, label, icon: Icon, key }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectTool(id)}
            title={`${label} [${key}]`}
            aria-pressed={tool === id}
            className={`h-9 px-3 rounded-full flex items-center gap-2 text-[13px] font-semibold transition-colors ${
              tool === id
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}

        <span className="w-px h-6 mx-1 bg-[var(--md-sys-color-outline-variant)]" />

        {(
          [
            { icon: Undo2, label: 'Desfazer', onClick: onUndo, disabled: !state?.canUndo },
            { icon: Redo2, label: 'Refazer', onClick: onRedo, disabled: !state?.canRedo },
            { icon: Crosshair, label: 'Centralizar', onClick: onRecenter, disabled: false },
            { icon: Trash2, label: 'Limpar tudo', onClick: onClear, disabled: !state?.atomCount },
          ] as const
        ).map(({ icon: Icon, label, onClick, disabled }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-on-surface)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        <span className="w-px h-6 mx-1 bg-[var(--md-sys-color-outline-variant)]" />

        <button
          type="button"
          onClick={onHide}
          title="Ocultar barra [T]"
          className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {options.length > 0 && (
        <div className="studio-floating rounded-full px-1.5 py-1 flex items-center gap-1 flex-wrap justify-center max-w-[92vw]">
          {options.map(option => (
            <button
              key={option.label}
              type="button"
              onClick={option.onClick}
              className={`h-7 px-2.5 rounded-full text-[12px] font-mono font-semibold transition-colors ${
                option.active
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
