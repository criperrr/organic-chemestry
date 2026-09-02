import React, { useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore.js';

export const KeyboardShortcuts: React.FC = () => {
  const {
    toggleInputMode,
    isAnswerSubmitted,
    nextQuestion,
    setUserInput,
    clearSlotState,
    inputMode,
    setDifficultyFilter,
    toggleSound,
    activeTab,
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      // 1. Tab: Toggle between Speedrunner and SlotBuilder (only in arcade tab)
      if (e.key === 'Tab' && activeTab === 'arcade') {
        e.preventDefault();
        toggleInputMode();
        return;
      }

      // 2. Escape: Clear user input or slots
      if (e.key === 'Escape') {
        e.preventDefault();
        if (inputMode === 'speedrunner') {
          setUserInput('');
        } else {
          clearSlotState();
        }
        return;
      }

      // 3. Space or Enter when feedback is shown: advance to next question
      if (isAnswerSubmitted && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        nextQuestion();
        return;
      }

      // If user is actively typing in an input field, do not hijack letter/number hotkeys
      if (isInputFocused) {
        return;
      }

      // 4. Hotkeys 1-4 for quick difficulty filtering
      if (e.key === '1') {
        e.preventDefault();
        setDifficultyFilter('iniciante');
      } else if (e.key === '2') {
        e.preventDefault();
        setDifficultyFilter('intermediario');
      } else if (e.key === '3') {
        e.preventDefault();
        setDifficultyFilter('avancado');
      } else if (e.key === '4') {
        e.preventDefault();
        setDifficultyFilter('caos');
      }

      // 5. 'M' to toggle sound
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    toggleInputMode,
    isAnswerSubmitted,
    nextQuestion,
    setUserInput,
    clearSlotState,
    inputMode,
    setDifficultyFilter,
    toggleSound,
    activeTab,
  ]);

  return null;
};
