import React from 'react';
import { Keyboard } from 'lucide-react';
import { Balloon } from './Balloon.js';

const SECTIONS: { title: string; rows: [string, string][] }[] = [
  {
    title: 'Ferramentas',
    rows: [
      ['B', 'Desenhar ligação'],
      ['E', 'Trocar elemento'],
      ['G', 'Grupos e radicais'],
      ['A', 'Anéis e aromáticos'],
      ['X', 'Borracha'],
      ['V', 'Mover / navegar'],
      ['O', 'Auto-alinhar e organizar'],
    ],
  },
  {
    title: 'Painéis',
    rows: [
      ['T', 'Barra de ferramentas'],
      ['I', 'Nomenclatura'],
      ['L', 'Esqueletos prontos'],
      ['K', 'Este painel'],
      ['H', 'Ocultar tudo (Modo Zen)'],
      ['F', 'Tela cheia'],
      ['1 / Esc', 'Voltar ao Treino'],
    ],
  },
  {
    title: 'Canvas',
    rows: [
      ['Ctrl+Z / Ctrl+Y', 'Desfazer / refazer'],
      ['Delete', 'Apagar átomo selecionado'],
      ['R', 'Enquadrar a molécula'],
      ['Espaço + arrastar', 'Navegar'],
      ['Roda / pinça', 'Zoom'],
    ],
  },
];

export const ShortcutsPanel: React.FC<{ onHide: () => void }> = ({ onHide }) => (
  <Balloon
    title="Atalhos do Teclado"
    icon={<Keyboard className="w-4 h-4" />}
    initialPosition={{ top: 72, right: 16 }}
    width={290}
    onHide={onHide}
    hideKey="K"
  >
    {SECTIONS.map(section => (
      <div key={section.title} className="flex flex-col gap-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--md-sys-color-primary)]">
          {section.title}
        </span>
        {section.rows.map(([key, description]) => (
          <div key={key} className="flex items-center justify-between gap-3 text-[12px]">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">{description}</span>
            <kbd className="px-1.5 py-0.5 rounded-md border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] font-mono text-[10px] text-[var(--md-sys-color-on-surface)] shrink-0">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    ))}
  </Balloon>
);
