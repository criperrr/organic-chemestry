/**
 * @quimicarush/gamification-engine
 * Comprehensive gamification engine for QuímicaRush:
 * - Native procedural Web Audio API synthesizer (combo streaks, pentatonic chimes, token click, error hum)
 * - Streak tracking, multipliers (1x to 5x ON FIRE), XP calculation, and progressive levels 1-50
 * - FSRS spaced repetition micro-queue with auto-reinsertion at current_index + 3
 */

export * from './sound-synth.js';
export * from './combo-manager.js';
export * from './fsrs-queue.js';
