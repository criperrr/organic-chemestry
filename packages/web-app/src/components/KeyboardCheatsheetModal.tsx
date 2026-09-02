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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={closeCheatsheet}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cheatsheet-title" className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 font-mono">
                <span>COMANDOS DE TECLADO ULTRA-RÁPIDOS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-sans">
                  Mouse-Free
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Monte moléculas IUPAC completas com a velocidade e precisão do Neovim.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCheatsheet}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
            aria-label="Fechar painel de atalhos"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlight Banner: Modo Radical */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold shrink-0">
            [G]
          </div>
          <div className="text-xs">
            <span className="font-bold text-cyan-300 font-mono">Modo Radical Rápido: </span>
            <span className="text-slate-300">
              Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono text-[11px]">G</kbd>,
              em seguida o carbono <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono text-[11px]">1-9</kbd>,
              e o radical (<kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[10px]">m</kbd>=metil,
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[10px]">e</kbd>=etil,
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[10px]">c</kbd>=cloro,
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[10px]">h</kbd>=hidróxi,
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[10px]">o</kbd>=oxo,
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[10px]">a</kbd>=amino,
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[10px]">n</kbd>=nitro).
            </span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {SHORTCUT_CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80"
            >
              <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {cat.name}
              </span>

              <div className="flex flex-col gap-1.5">
                {cat.shortcuts.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono font-bold text-xs shadow-sm shadow-black min-w-[28px] text-center">
                        {s.key}
                      </kbd>
                      <span className="text-slate-200 font-semibold">{s.label}</span>
                    </div>
                    {s.desc && (
                      <span className="text-[11px] text-slate-400 font-sans truncate max-w-[180px]">
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
        <div className="p-3 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-sans">
          <span>Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">?</kbd> ou <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">Esc</kbd> para fechar</span>
          <button
            type="button"
            onClick={closeCheatsheet}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono transition-all active:scale-95 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
