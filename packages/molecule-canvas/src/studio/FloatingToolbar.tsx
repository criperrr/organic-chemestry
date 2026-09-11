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
  Wand2,
} from 'lucide-react';
import type {
  CanvasTool,
  AtomElement,
  FunctionalGroupType,
  RingTemplateType,
  SkeletalCanvasState,
} from '../types.js';
import { ELEMENT_OPTIONS, FUNCTIONAL_GROUPS, RING_TEMPLATES, groupPalette } from '../catalog.js';
import { FragmentPreview, previewGroup, previewRing } from '../FragmentPreview.js';
import { ELEMENT_COLORS } from '../valence.js';

const TOOLS: { id: CanvasTool; label: string; icon: React.FC<{ className?: string }>; key: string }[] = [
  { id: 'bond', label: 'Ligação', icon: PenLine, key: 'B' },
  { id: 'element', label: 'Elemento', icon: Atom, key: 'E' },
  { id: 'functional_group', label: 'Grupo', icon: Sparkles, key: 'G' },
  { id: 'ring', label: 'Anel', icon: Hexagon, key: 'A' },
  { id: 'eraser', label: 'Borracha', icon: Eraser, key: 'X' },
  { id: 'pan', label: 'Mover', icon: Hand, key: 'V' },
];

export interface FloatingToolbarProps {
  state: SkeletalCanvasState | null;
  onSelectTool: (tool: CanvasTool) => void;
  onSelectElement: (element: AtomElement) => void;
  onSelectGroup: (group: FunctionalGroupType) => void;
  onSelectRing: (ring: RingTemplateType) => void;
  onAutoAlign?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRecenter: () => void;
  onClear: () => void;
  onHide: () => void;
}

/**
 * The only chrome pinned to the top of the screen: six tools, four actions, and
 * a contextual palette that appears solely for the tools that need a choice.
 *
 * Groups and rings show the fragment they stamp, drawn by the same geometry the
 * canvas uses — you pick "furano" by recognising the ring, not by trusting a
 * label.
 */
export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  state,
  onSelectTool,
  onSelectElement,
  onSelectGroup,
  onSelectRing,
  onAutoAlign,
  onUndo,
  onRedo,
  onRecenter,
  onClear,
  onHide,
}) => {
  const tool = state?.tool ?? 'bond';

  const palette =
    tool === 'functional_group'
      ? groupPalette(FUNCTIONAL_GROUPS).map(bucket => ({
          group: bucket.group,
          items: bucket.items.map(item => ({
            key: item.type as string,
            label: item.label,
            title: item.name,
            active: state?.group === item.type,
            onClick: () => onSelectGroup(item.type),
            preview: <FragmentPreview {...previewGroup(item.type)} size={26} />,
          })),
        }))
      : tool === 'ring'
      ? groupPalette(RING_TEMPLATES).map(bucket => ({
          group: bucket.group,
          items: bucket.items.map(item => ({
            key: item.type as string,
            label: item.label,
            title: item.name,
            active: state?.ring === item.type,
            onClick: () => onSelectRing(item.type),
            preview: <FragmentPreview {...previewRing(item.type)} size={26} />,
          })),
        }))
      : tool === 'element'
      ? [
          {
            group: 'Elemento',
            items: ELEMENT_OPTIONS.map(option => ({
              key: option.element,
              label: option.label,
              title: option.desc,
              active: state?.element === option.element,
              onClick: () => onSelectElement(option.element),
              preview: (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: ELEMENT_COLORS[option.element] }}
                />
              ),
            })),
          },
        ]
      : [];

  return (
    <div className="flex flex-col items-center gap-1.5 pointer-events-auto max-w-[96vw]">
      <div className="studio-floating rounded-full px-1.5 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
        {TOOLS.map(({ id, label, icon: Icon, key }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectTool(id)}
            title={`${label} [${key}]`}
            aria-pressed={tool === id}
            className={`h-9 px-3 rounded-full flex items-center gap-2 text-[13px] font-semibold shrink-0 transition-colors ${
              tool === id
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}

        <span className="w-px h-6 mx-1 bg-[var(--md-sys-color-outline-variant)] shrink-0" />

        {onAutoAlign && (
          <button
            type="button"
            onClick={onAutoAlign}
            disabled={!state?.canAutoAlign}
            title="Auto-organizar e alinhar molécula [O]"
            className="h-9 px-3 rounded-full flex items-center gap-1.5 text-[13px] font-semibold shrink-0 transition-colors text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-primary)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Wand2 className="w-4 h-4 shrink-0 text-[var(--md-sys-color-tertiary)]" />
            <span className="hidden lg:inline">Alinhar</span>
          </button>
        )}

        <span className="w-px h-6 mx-1 bg-[var(--md-sys-color-outline-variant)] shrink-0" />

        {(
          [
            { icon: Undo2, label: 'Desfazer', onClick: onUndo, disabled: !state?.canUndo },
            { icon: Redo2, label: 'Refazer', onClick: onRedo, disabled: !state?.canRedo },
            { icon: Crosshair, label: 'Centralizar [R]', onClick: onRecenter, disabled: false },
            { icon: Trash2, label: 'Limpar tudo', onClick: onClear, disabled: !state?.atomCount },
          ] as const
        ).map(({ icon: Icon, label, onClick, disabled }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-on-surface)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        <span className="w-px h-6 mx-1 bg-[var(--md-sys-color-outline-variant)] shrink-0" />

        <button
          type="button"
          onClick={onHide}
          title="Ocultar barra [T]"
          className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {palette.length > 0 && (
        <div className="studio-floating rounded-3xl px-2 py-2 flex flex-col gap-1.5 max-w-[96vw] max-h-[46vh] overflow-y-auto">
          {palette.map(bucket => (
            <div key={bucket.group} className="flex flex-col gap-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] px-1.5">
                {bucket.group}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {bucket.items.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={item.onClick}
                    title={item.title}
                    aria-pressed={item.active}
                    className={`h-9 pl-1.5 pr-2.5 rounded-full flex items-center gap-1.5 text-[12px] font-mono font-semibold transition-colors ${
                      item.active
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                        : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                    }`}
                  >
                    {item.preview}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
