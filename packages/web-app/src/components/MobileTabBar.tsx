import React from 'react';
import { Zap, Crosshair, BookOpen, FlaskConical } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import type { ActiveTab } from '../stores/useGameStore.js';

const TABS: { id: ActiveTab; label: string; hint: string; Icon: typeof Zap }[] = [
  { id: 'arcade', label: 'Treino', hint: 'Treino de nomenclatura [1]', Icon: Zap },
  { id: 'cacar', label: 'Caçada', hint: 'Caça-Funções [2]', Icon: Crosshair },
  { id: 'theory', label: 'Teoria', hint: 'Compêndio [3]', Icon: BookOpen },
  { id: 'sandbox', label: 'Lab', hint: 'Laboratório [4]', Icon: FlaskConical },
];

/**
 * Material 3 navigation bar, phone only.
 *
 * The tabs used to live in the top bar, sharing 52px with five other controls:
 * targets came out at 32-34px, under the 48dp minimum, and sat at the far end
 * of the screen from the thumb. Down here each tab gets a full 56px row within
 * reach, and the top bar keeps only the occasional controls.
 */
export const MobileTabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useGameStore();

  return (
    <nav
      className="flex lg:hidden items-stretch justify-around gap-1 px-1 pt-1 bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)] sticky bottom-0 z-40 safe-bottom"
      aria-label="Navegação principal"
    >
      {TABS.map(({ id, label, hint, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            title={hint}
            aria-label={hint}
            aria-current={isActive ? 'page' : undefined}
            className="flex-1 min-w-0 min-h-[56px] flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors active:scale-95 cursor-pointer"
          >
            {/* The pill behind the icon is what Material 3 uses to mark the
                active destination; it also gives the icon a 32px hit cushion. */}
            <span
              className={`flex items-center justify-center h-8 w-16 rounded-full transition-colors ${
                isActive
                  ? 'bg-[var(--md-sys-color-secondary-container)]'
                  : 'bg-transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? 'text-[var(--md-sys-color-on-secondary-container)]'
                    : 'text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              />
            </span>
            <span
              className={`text-[11px] leading-none font-semibold truncate max-w-full ${
                isActive
                  ? 'text-[var(--md-sys-color-on-surface)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
