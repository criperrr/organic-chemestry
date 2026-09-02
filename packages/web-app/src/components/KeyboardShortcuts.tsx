import React, { useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore.js';

const STEM_DIGIT_MAP: Record<string, string> = {
  '1': 'met',
  '2': 'et',
  '3': 'prop',
  '4': 'but',
  '5': 'pent',
  '6': 'hex',
  '7': 'hept',
  '8': 'oct',
  '9': 'non',
  '0': 'dec',
};

const RADICAL_LETTER_MAP: Record<string, string> = {
  m: 'metil',
  e: 'etil',
  p: 'propil',
  i: 'isopropil',
  c: 'cloro',
  b: 'bromo',
  h: 'hidróxi',
  o: 'oxo',
  a: 'amino',
  n: 'nitro',
};

export const KeyboardShortcuts: React.FC = () => {
  const {
    toggleInputMode,
    isAnswerSubmitted,
    nextQuestion,
    setUserInput,
    clearSlotState,
    inputMode,
    toggleSound,
    activeTab,
    setActiveTab,
    submitAnswer,
    slotState,
    setSlotState,
    addRadicalChip,
    popLastRadicalChip,
    quickRadicalMode,
    setQuickRadicalMode,
    toggleCheatsheet,
    closeCheatsheet,
    isCheatsheetOpen,
    isAchievementsModalOpen,
    closeAchievementsModal,
    playMechanicalKeySound,
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      // 1. Cheatsheet toggle with '?'
      if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        toggleCheatsheet();
        return;
      }

      // 2. Escape: Closes open modals or clears state
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isCheatsheetOpen) {
          closeCheatsheet();
          return;
        }
        if (isAchievementsModalOpen) {
          closeAchievementsModal();
          return;
        }
        if (quickRadicalMode.active) {
          setQuickRadicalMode({ active: false });
          return;
        }
        if (inputMode === 'speedrunner') {
          setUserInput('');
        } else {
          clearSlotState();
        }
        return;
      }

      // If modal is open, do not handle game actions
      if (isCheatsheetOpen || isAchievementsModalOpen) {
        return;
      }

      // 3. Tab: Toggle between Speedrunner and SlotBuilder (only in arcade tab)
      if (e.key === 'Tab' && activeTab === 'arcade' && !isInputFocused) {
        e.preventDefault();
        toggleInputMode();
        return;
      }

      // 4. Space or Enter when feedback is shown: advance to next question
      if (isAnswerSubmitted && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        nextQuestion();
        return;
      }

      // 5. 'V' or 'v': Toggle between Arcade and Theory Hub (when not typing in an input)
      if ((e.key === 'v' || e.key === 'V') && !isInputFocused) {
        e.preventDefault();
        playMechanicalKeySound();
        setActiveTab(activeTab === 'arcade' ? 'theory' : 'arcade');
        return;
      }

      // If user is actively typing in a standard text field / textarea / select, don't hijack keys
      if (isInputFocused) {
        return;
      }

      // 6. Enter key in SlotBuilder mode to submit answer
      if (e.key === 'Enter' && inputMode === 'slotBuilder' && !isAnswerSubmitted && activeTab === 'arcade') {
        e.preventDefault();
        submitAnswer();
        return;
      }

      // =========================================================================
      // KEYBOARD-FIRST MORPHOLOGICAL BUILDER (SlotBuilder Neovim-Style Hotkeys)
      // =========================================================================
      if (inputMode === 'slotBuilder' && !isAnswerSubmitted && activeTab === 'arcade') {
        const keyLower = e.key.toLowerCase();

        // A. Quick Radical Mode Sub-machine
        if (quickRadicalMode.active) {
          // If digit pressed, update radical locant
          if (/^[1-9]$/.test(e.key)) {
            e.preventDefault();
            playMechanicalKeySound();
            setQuickRadicalMode({ active: true, locant: e.key });
            return;
          }

          // If radical letter pressed, add the radical and exit quick mode
          if (RADICAL_LETTER_MAP[keyLower]) {
            e.preventDefault();
            const radicalName = RADICAL_LETTER_MAP[keyLower];
            const locant = quickRadicalMode.locant || '2';
            addRadicalChip(radicalName, locant);
            setQuickRadicalMode({ active: false });
            return;
          }
        }

        // B. Activate Quick Radical Mode with 'g' or 'G'
        if (keyLower === 'g') {
          e.preventDefault();
          playMechanicalKeySound();
          setQuickRadicalMode({ active: true, locant: '2' });
          return;
        }

        // C. Remove last radical chip with Backspace or 'x'
        if (e.key === 'Backspace' || keyLower === 'x') {
          e.preventDefault();
          popLastRadicalChip();
          return;
        }

        // D. Clear all slots with 'z'
        if (keyLower === 'z') {
          e.preventDefault();
          playMechanicalKeySound();
          clearSlotState();
          return;
        }

        // E. Carbon Stem Digits: 1 -> met, 2 -> et, 3 -> prop ... 0 -> dec
        if (STEM_DIGIT_MAP[e.key]) {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ chainPrefix: STEM_DIGIT_MAP[e.key] });
          return;
        }

        // F. Infixes (Saturation): a -> an, e -> en, i -> in, d -> dien
        if (keyLower === 'a') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ bondInfix: 'an' });
          return;
        }
        if (keyLower === 'e') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ bondInfix: 'en' });
          return;
        }
        if (keyLower === 'i') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ bondInfix: 'in' });
          return;
        }
        if (keyLower === 'd') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ bondInfix: 'dien' });
          return;
        }

        // G. Suffixes (Functional Classes):
        // o -> -o, l -> -ol, h -> -al, k -> -ona, c -> -oico, t -> -oato, n -> -amina, m -> -amida, u -> -nitrila, f -> -fenol
        if (keyLower === 'o') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'o' });
          return;
        }
        if (keyLower === 'l') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'ol' });
          return;
        }
        if (keyLower === 'h') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'al' });
          return;
        }
        if (keyLower === 'k') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'ona' });
          return;
        }
        if (keyLower === 'c') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'oico' });
          return;
        }
        if (keyLower === 't') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'oato' });
          return;
        }
        if (keyLower === 'n') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'amina' });
          return;
        }
        if (keyLower === 'm') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'amida' });
          return;
        }
        if (keyLower === 'u') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'nitrila' });
          return;
        }
        if (keyLower === 'f') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ functionSuffix: 'fenol' });
          return;
        }

        // H. Ring Toggle: 'w' toggles ciclo-
        if (keyLower === 'w') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({ isRing: !slotState.isRing });
          return;
        }

        // I. Class Special Prefix: 'p' toggles Ácido
        if (keyLower === 'p') {
          e.preventDefault();
          playMechanicalKeySound();
          setSlotState({
            classPrefix: slotState.classPrefix === 'Ácido' ? '' : 'Ácido',
          });
          return;
        }
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
    toggleSound,
    activeTab,
    setActiveTab,
    submitAnswer,
    slotState,
    setSlotState,
    addRadicalChip,
    popLastRadicalChip,
    quickRadicalMode,
    setQuickRadicalMode,
    toggleCheatsheet,
    closeCheatsheet,
    isCheatsheetOpen,
    isAchievementsModalOpen,
    closeAchievementsModal,
    playMechanicalKeySound,
  ]);

  return null;
};
