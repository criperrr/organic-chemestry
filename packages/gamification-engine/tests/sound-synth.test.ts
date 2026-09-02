import { describe, it, expect, vi } from 'vitest';
import {
  SoundSynthesizer,
  soundSynth,
  PENTATONIC_C_MAJOR_SCALE,
} from '../src/sound-synth.js';

describe('SoundSynthesizer in Node/SSR Environment', () => {
  it('should initialize gracefully without window/AudioContext', () => {
    const synth = new SoundSynthesizer();
    expect(synth).toBeInstanceOf(SoundSynthesizer);
    expect(synth.getContext()).toBeNull();
    expect(synth.isSupported()).toBe(false);
    expect(synth.isFeverActive()).toBe(false);
  });

  it('should provide default volume and mute state', () => {
    const synth = new SoundSynthesizer({ initialVolume: 0.5, initialMuted: false });
    expect(synth.getVolume()).toBe(0.5);
    expect(synth.isMuted()).toBe(false);

    synth.setVolume(1.5); // Should clamp to 1.0
    expect(synth.getVolume()).toBe(1.0);

    synth.setVolume(-0.5); // Should clamp to 0.0
    expect(synth.getVolume()).toBe(0.0);

    synth.setMuted(true);
    expect(synth.isMuted()).toBe(true);

    const toggled = synth.toggleMute();
    expect(toggled).toBe(false);
    expect(synth.isMuted()).toBe(false);
  });

  it('should calculate correct pentatonic frequencies for streaks', () => {
    const synth = new SoundSynthesizer();

    // Streak 1 -> C4 (261.63)
    expect(synth.getStreakFrequency(1)).toBeCloseTo(261.63, 1);

    // Streak 2 -> D4 (293.66)
    expect(synth.getStreakFrequency(2)).toBeCloseTo(293.66, 1);

    // Streak 3 -> E4 (329.63)
    expect(synth.getStreakFrequency(3)).toBeCloseTo(329.63, 1);

    // Streak 4 -> G4 (392.00)
    expect(synth.getStreakFrequency(4)).toBeCloseTo(392.0, 1);

    // Streak 5 -> A4 (440.00)
    expect(synth.getStreakFrequency(5)).toBeCloseTo(440.0, 1);

    // Streak 6 -> C5 (523.25)
    expect(synth.getStreakFrequency(6)).toBeCloseTo(523.25, 1);

    // Streak 7 -> D5 (587.33)
    expect(synth.getStreakFrequency(7)).toBeCloseTo(587.33, 1);

    // Streak 8 -> E5 (659.25)
    expect(synth.getStreakFrequency(8)).toBeCloseTo(659.25, 1);

    // Scaling past array length (wraps with 1 octave higher)
    const scaleLen = PENTATONIC_C_MAJOR_SCALE.length;
    const freqAtWrap = synth.getStreakFrequency(scaleLen + 1);
    expect(freqAtWrap).toBeCloseTo(PENTATONIC_C_MAJOR_SCALE[0] * 2, 1);
  });

  it('should safely no-op audio play calls when AudioContext is absent', async () => {
    const synth = new SoundSynthesizer();

    // None of these should throw in Node
    expect(() => synth.playStreak(3)).not.toThrow();
    expect(() => synth.playError()).not.toThrow();
    expect(() => synth.playSnap()).not.toThrow();
    expect(() => synth.playClick()).not.toThrow();
    expect(() => synth.playMechanicalSwitch()).not.toThrow();
    expect(() => synth.playSpeedBonus()).not.toThrow();
    expect(() => synth.playMilestone(5)).not.toThrow();
    expect(() => synth.playMilestone(10)).not.toThrow();
    expect(() => synth.playMilestone(20)).not.toThrow();
    expect(() => synth.playLevelUp()).not.toThrow();
    expect(() => synth.playBadgeUnlock()).not.toThrow();
    expect(() => synth.startFeverLoop()).not.toThrow();
    expect(() => synth.stopFeverLoop()).not.toThrow();
    expect(() => synth.playAnswerFeedback(true, 5, true)).not.toThrow();
    expect(() => synth.playAnswerFeedback(false, 0)).not.toThrow();

    const unlocked = await synth.unlock();
    expect(unlocked).toBe(false);

    await expect(synth.close()).resolves.toBeUndefined();
  });

  it('should export singleton soundSynth instance', () => {
    expect(soundSynth).toBeDefined();
    expect(soundSynth).toBeInstanceOf(SoundSynthesizer);
  });
});

describe('SoundSynthesizer with Mocked Web Audio API', () => {
  it('should interact with Web Audio nodes properly', async () => {
    const mockOscillator = {
      type: 'sine' as OscillatorType,
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockGain = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockDestination = {};

    const mockCtx = {
      currentTime: 10.0,
      state: 'running' as AudioContextState,
      destination: mockDestination as AudioDestinationNode,
      createOscillator: vi.fn(() => ({ ...mockOscillator, frequency: { ...mockOscillator.frequency } })),
      createGain: vi.fn(() => ({ ...mockGain, gain: { ...mockGain.gain } })),
      resume: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
    } as unknown as AudioContext;

    const synth = new SoundSynthesizer({ audioContext: mockCtx, initialVolume: 0.8 });
    expect(synth.isSupported()).toBe(true);
    expect(mockCtx.createGain).toHaveBeenCalled();

    // Play streak
    synth.playStreak(2);
    expect(mockCtx.createOscillator).toHaveBeenCalled();

    // Play error
    synth.playError();
    expect(mockCtx.createOscillator).toHaveBeenCalled();

    // Play snap & click
    synth.playSnap();
    synth.playClick();
    expect(mockCtx.createOscillator).toHaveBeenCalled();

    // Play speed bonus
    synth.playSpeedBonus();
    expect(mockCtx.createOscillator).toHaveBeenCalled();

    // Play level up & milestone
    synth.playLevelUp();
    synth.playMilestone(20);
    synth.playBadgeUnlock();

    // Fever Loop start & stop
    synth.startFeverLoop();
    expect(synth.isFeverActive()).toBe(true);
    synth.stopFeverLoop();
    expect(synth.isFeverActive()).toBe(false);

    // When muted, audio methods should not trigger oscillator
    synth.setMuted(true);
    vi.clearAllMocks();
    synth.playStreak(5);
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();

    // [FINDING-02] Rapid start/stop/start fever loop race condition check
    synth.setMuted(false);
    synth.startFeverLoop();
    synth.stopFeverLoop();
    synth.startFeverLoop();
    expect(synth.isFeverActive()).toBe(true);
    await synth.close();
    expect(synth.isFeverActive()).toBe(false);
  });
});
