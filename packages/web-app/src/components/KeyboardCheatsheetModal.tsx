import React, { useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore.js';
import { Keyboard, X } from 'lucide-react';

const SHORTCUT_CATEGORIES = [
  {
    name: 'Navegação & Modos',
    shortcuts: [
      { key: 'Tab', label: 'Modo de Entrada', desc: 'Alterna Teclado Rápido / Construtor de Slots' },
      { key: 'V', label: 'Alternar Abas', desc: 'Arcade vs Compêndio Teórico' },
      { key: '?', label: 'Guia de Atalhos', desc: 'Abre/fecha este painel cheatsheet' },
      { key: 'M', label: 'Silenciar Som', desc: 'Alterna mudo da Web Audio API' },
      { key: 'Esc', label: 'Fechar / Cancelar', desc: 'Fecha modais ou cancela modo' },
    ],
  },
  {
    name: 'Cadeia Principal (Carbonos)',
    shortcuts: [
      { key: '1', label: 'met (C1)', desc: '1 Carbono' },
      { key: '2', label: 'et (C2)', desc: '2 Carbonos' },
      { key: '3', label: 'prop (C3)', desc: '3 Carbonos' },
      { key: '4', label: 'but (C4)', desc: '4 Carbonos' },
      { key: '5', label: 'pent (C5)', desc: '5 Carbonos' },
      { key: '6', label: 'hex (C6)', desc: '6 Carbonos' },
      { key: '7', label: 'hept (C7)', desc: '7 Carbonos' },
      { key: '8', label: 'oct (C8)', desc: '8 Carbonos' },
      { key: '9', label: 'non (C9)', desc: '9 Carbonos' },
      { key: '0', label: 'dec (C10)', desc: '10 Carbonos' },
    ],
  },
  {
    name: 'Ligações & Infixos',
    shortcuts: [
      { key: 'A', label: '-an-', desc: 'Apenas simples (saturado)' },
      { key: 'E', label: '-en-', desc: '1 ligação dupla (insaturado)' },
      { key: 'I', label: '-in-', desc: '1 ligação tripla' },
      { key: 'D', label: '-dien-', desc: '2 ligações duplas' },
    ],
  },
  {
    name: 'Função & Sufixo Principal',
    shortcuts: [
      { key: 'O', label: '-o', desc: 'Hidrocarboneto' },
      { key: 'L', label: '-ol', desc: 'Álcool' },
      { key: 'H', label: '-al', desc: 'Aldeído' },
      { key: 'K', label: '-ona', desc: 'Cetona' },
      { key: 'C', label: '-oico', desc: 'Ácido Carboxílico' },
      { key: 'T', label: '-oato', desc: 'Éster' },
      { key: 'N', label: '-amina', desc: 'Amina' },
      { key: 'M', label: '-amida', desc: 'Amida' },
      { key: 'U', label: '-nitrila', desc: 'Nitrila' },
      { key: 'F', label: '-fenol', desc: 'Fenol' },
    ],
  },
  {
    name: 'Modo Radical Rápido & Ações',
    shortcuts: [
      { key: 'W', label: 'ciclo-', desc: 'Alterna anel cíclico' },
      { key: 'P', label: 'Ácido / Prefixo', desc: 'Alterna prefixo especial de classe' },
      { key: 'G', label: 'Modo Radical', desc: 'Tecle G -> Carbono [1-9] -> Radical' },
      { key: 'Backspace', label: 'Desfazer', desc: 'Remove último radical montado' },
      { key: 'Z', label: 'Limpar Tudo', desc: 'Zera todos os blocos morfológicos' },
      { key: 'Enter', label: 'Submeter', desc: 'Envia resposta montada instantaneamente' },
      { key: 'Space', label: 'Avançar', desc: 'Avança para a próxima questão' },
    ],
  },
];

export const KeyboardCheatsheetModal: React.FC = () => {
  const { isCheatsheetOpen, closeCheatsheet } = useGameStore();

  useEffect(() => {
    if (!isCheatsheetOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        closeCheatsheet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheatsheetOpen, closeCheatsheet]);

  if (!isCheatsheetOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheatsheet-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={closeCheatsheet}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xl overflow-hidden text-[var(--md-sys-color-on-surface)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
              <Keyboard className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            </div>
            <div>
              <h2 id="cheatsheet-title" className="text-base sm:text-lg font-bold tracking-tight text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <span>Comandos de Teclado Rápidos</span>
                <span className="m3-chip text-[10px] py-0.5 px-2 font-mono">
                  Mouse-Free
                </span>
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Monte moléculas IUPAC completas com extrema velocidade e ergonomia.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCheatsheet}
            className="p-2.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fechar painel de atalhos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Banner: Modo Radical */}
        <div className="mx-4 mt-4 p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] flex items-center gap-3">
          <div className="px-2.5 py-1.5 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-mono text-xs font-bold shrink-0">
            [G]
          </div>
          <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            <strong className="font-bold text-[var(--md-sys-color-primary)] font-mono">Modo Radical Rápido: </strong>
            <span>
              Pressione <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-on-surface)] font-mono text-[11px]">G</kbd>,
              em seguida o carbono <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-on-surface)] font-mono text-[11px]">1-9</kbd>,
              e a tecla do radical (<kbd className="px-1 py-0.5 rounded bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)] font-mono text-[10px]">m</kbd>=metil,
              <kbd className="px-1 py-0.5 rounded bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)] font-mono text-[10px]">e</kbd>=etil,
              <kbd className="px-1 py-0.5 rounded bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)] font-mono text-[10px]">c</kbd>=cloro,
              <kbd className="px-1 py-0.5 rounded bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)] font-mono text-[10px]">h</kbd>=hidróxi,
              <kbd className="px-1 py-0.5 rounded bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)] font-mono text-[10px]">o</kbd>=oxo,
              <kbd className="px-1 py-0.5 rounded bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)] font-mono text-[10px]">a</kbd>=amino,
              <kbd className="px-1 py-0.5 rounded bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)] font-mono text-[10px]">n</kbd>=nitro).
            </span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {SHORTCUT_CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]"
            >
              <span className="text-[11px] font-bold text-[var(--md-sys-color-primary)] tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-primary)]" />
                {cat.name}
              </span>

              <div className="flex flex-col gap-1.5">
                {cat.shortcuts.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]"
                  >
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded-lg bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-primary)] font-mono font-bold text-xs shadow-sm min-w-[28px] text-center">
                        {s.key}
                      </kbd>
                      <span className="text-[var(--md-sys-color-on-surface)] font-semibold">{s.label}</span>
                    </div>
                    {s.desc && (
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-sans truncate max-w-[180px]">
                        {s.desc}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[var(--md-sys-color-surface-container-low)] border-t border-[var(--md-sys-color-outline-variant)] flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-xs text-[var(--md-sys-color-on-surface-variant)] font-sans">
          <span className="text-center sm:text-left">Pressione <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high)] font-mono text-[var(--md-sys-color-on-surface)]">?</kbd> ou <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high)] font-mono text-[var(--md-sys-color-on-surface)]">Esc</kbd> para fechar</span>
          <button
            type="button"
            onClick={closeCheatsheet}
            className="m3-button-filled text-xs py-2.5 px-5 font-bold cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
