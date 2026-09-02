/**
 * Native procedural Web Audio API sound synthesizer for QuímicaRush.
 * Zero external audio files / MP3s. Safe in both browser and Node/SSR environments.
 */

export const PENTATONIC_C_MAJOR_SCALE: readonly number[] = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0,  // G4
  440.0,  // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0,  // A5
  1046.5, // C6
  1174.66,// D6
  1318.51,// E6
  1567.98,// G6
  1760.0, // A6
];

export interface SoundSynthOptions {
  initialVolume?: number;
  initialMuted?: boolean;
  audioContext?: AudioContext | null;
}

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.7;
  private muted: boolean = false;
  private customContextProvided: boolean = false;

  // Fever Mode Audio Nodes
  private feverGain: GainNode | null = null;
  private feverOsc1: OscillatorNode | null = null;
  private feverOsc2: OscillatorNode | null = null;
  private feverLfo: OscillatorNode | null = null;
  private feverLfoGain: GainNode | null = null;
  private feverStopTimeout: ReturnType<typeof setTimeout> | null = null;
  private isFeverRunning: boolean = false;

  constructor(options: SoundSynthOptions = {}) {
    if (options.initialVolume !== undefined) {
      this.volume = Math.max(0, Math.min(1, options.initialVolume));
    }
    if (options.initialMuted !== undefined) {
      this.muted = options.initialMuted;
    }
    if (options.audioContext !== undefined) {
      this.ctx = options.audioContext;
      this.customContextProvided = true;
      if (this.ctx) {
        this.initMasterGain();
      }
    }
  }

  /**
   * Checks whether Web Audio API is supported in the current runtime environment.
   */
  public isSupported(): boolean {
    if (this.ctx !== null) return true;
    return (
      typeof window !== 'undefined' &&
      (Boolean(window.AudioContext) ||
        Boolean(
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        ))
    );
  }

  /**
   * Lazily initializes and returns the AudioContext.
   * Safe to call in any environment; returns null if AudioContext is unavailable.
   */
  public getContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return null;

      this.ctx = new AudioContextClass();
      this.initMasterGain();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private initMasterGain(): void {
    if (!this.ctx) return;
    try {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime
      );
      this.masterGain.connect(this.ctx.destination);
    } catch {
      this.masterGain = null;
    }
  }

  /**
   * Unlocks the AudioContext following user gesture requirement.
   * Safe to call repeatedly.
   */
  public async unlock(): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        return (ctx.state as AudioContextState) === 'running';
      } catch {
        return false;
      }
    }
    return ctx.state === 'running';
  }

  /**
   * Gets current volume level (0.0 to 1.0).
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Sets master volume between 0.0 and 1.0.
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateMasterGain();
  }

  /**
   * Checks if audio is muted.
   */
  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Sets mute state.
   */
  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.muted) {
      this.stopFeverLoop();
    }
    this.updateMasterGain();
  }

  /**
   * Toggles mute state and returns the new muted state.
   */
  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private updateMasterGain(): void {
    if (!this.masterGain || !this.ctx) return;
    try {
      const targetGain = this.muted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    } catch {
      // Audio context might be closing or unready
    }
  }

  /**
   * Returns the pentatonic pitch frequency for a given combo streak count (1-based).
   * Pentatonic C-major sequence with smooth octave progression.
   */
  public getStreakFrequency(streak: number): number {
    const effectiveStreak = Math.max(1, Math.floor(streak));
    const scaleLength = PENTATONIC_C_MAJOR_SCALE.length;
    const baseIndex = (effectiveStreak - 1) % scaleLength;
    const octaveMultiplier = Math.floor((effectiveStreak - 1) / scaleLength);
    const baseFreq = PENTATONIC_C_MAJOR_SCALE[baseIndex];
    return baseFreq * Math.pow(2, octaveMultiplier);
  }

  /**
   * Plays an ascending pentatonic chime for correct answers during a combo streak.
   * Sine fundamental + triangle harmonic + octave shimmer for a rich marimba/bell feel.
   */
  public playStreak(streak: number = 1): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const freq = this.getStreakFrequency(streak);
      // Resonance and brilliance increase subtly with higher streaks
      const brillianceGain = Math.min(0.2, 0.08 + (streak * 0.008));

      // 1. Primary tone (fundamental sine)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Bell envelope: instant micro-attack, smooth exponential decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.33);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      // 2. Harmonic shimmer overtone (1 octave higher, warm triangle)
      const harmonicOsc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();

      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(freq * 2, now);

      harmonicGain.gain.setValueAtTime(0.0001, now);
      harmonicGain.gain.linearRampToValueAtTime(0.12 + brillianceGain, now + 0.005);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(this.masterGain);

      harmonicOsc.start(now);
      harmonicOsc.stop(now + 0.23);

      harmonicOsc.onended = () => {
        try {
          harmonicOsc.disconnect();
          harmonicGain.disconnect();
        } catch {}
      };

      // 3. Subtle resonant fifth harmonic (freq * 1.5) for streaks >= 3
      if (streak >= 3) {
        const fifthOsc = ctx.createOscillator();
        const fifthGain = ctx.createGain();

        fifthOsc.type = 'sine';
        fifthOsc.frequency.setValueAtTime(freq * 1.5, now);

        fifthGain.gain.setValueAtTime(0.0001, now);
        fifthGain.gain.linearRampToValueAtTime(0.06, now + 0.007);
        fifthGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        fifthOsc.connect(fifthGain);
        fifthGain.connect(this.masterGain);

        fifthOsc.start(now);
        fifthOsc.stop(now + 0.17);

        fifthOsc.onended = () => {
          try {
            fifthOsc.disconnect();
            fifthGain.disconnect();
          } catch {}
        };
      }
    } catch {
      // Graceful fallback if AudioContext error
    }
  }

  /**
   * Plays soft error sound: damped low-frequency triangle/sine wave
   * (130Hz decaying over 250ms), friendly and inviting instant retry.
   */
  public playError(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.26);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * Plays crisp token snap click: ultra-short high-frequency click
   * (1800Hz with fast envelope) for SlotBuilder chips.
   */
  public playSnap(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.01);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.012);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * Plays a crisp tactile click sound for UI buttons, toggles, and selectors.
   */
  public playClick(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.008);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.01);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * Plays a bright, sparkling speed bonus chime when answer is submitted in < 4s.
   * Fast 4-note ascending bell chime (E6 -> G#6 -> B6 -> E7).
   */
  public playSpeedBonus(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const notes = [1318.51, 1661.22, 1975.53, 2637.02];
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteStart);
        osc.stop(noteStart + 0.22);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
      });
    } catch {}
  }

  /**
   * Plays combo milestone fanfare for 5x, 10x, 20x streaks.
   */
  public playMilestone(tier: number = 5): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      let notes: number[];
      let noteGap: number;

      if (tier >= 20) {
        // Epic 20x Immortal Fanfare
        notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
        noteGap = 0.055;
      } else if (tier >= 10) {
        // Mega 10x Fire Fanfare
        notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
        noteGap = 0.065;
      } else {
        // Standard 5x Milestone
        notes = [523.25, 659.25, 783.99, 1046.5];
        noteGap = 0.08;
      }

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * noteGap;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        const duration = idx === notes.length - 1 ? 0.6 : 0.35;
        const peakGain = idx === notes.length - 1 ? 0.35 : 0.22;

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(peakGain, noteStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.02);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
      });
    } catch {}
  }

  /**
   * Plays a triumphant 4-chord fanfare on Level Up!
   */
  public playLevelUp(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const chords: Array<{ time: number; notes: number[]; duration: number }> = [
        { time: 0, notes: [261.63, 329.63, 392.0], duration: 0.18 },
        { time: 0.16, notes: [349.23, 440.0, 523.25], duration: 0.18 },
        { time: 0.32, notes: [392.0, 493.88, 587.33], duration: 0.22 },
        { time: 0.52, notes: [261.63, 523.25, 659.25, 783.99, 1046.5], duration: 0.8 },
      ];

      chords.forEach(({ time, notes, duration }) => {
        const chordStart = now + time;
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, chordStart);

          gain.gain.setValueAtTime(0.0001, chordStart);
          gain.gain.linearRampToValueAtTime(0.18 / Math.sqrt(notes.length), chordStart + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, chordStart + duration);

          osc.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(chordStart);
          osc.stop(chordStart + duration + 0.02);

          osc.onended = () => {
            try {
              osc.disconnect();
              gain.disconnect();
            } catch {}
          };
        });
      });
    } catch {}
  }

  /**
   * Plays an ethereal, magical chime when an Achievement / Badge is unlocked.
   */
  public playBadgeUnlock(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const notes = [783.99, 987.77, 1174.66, 1567.98, 1975.53];
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.38);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteStart);
        osc.stop(noteStart + 0.4);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
      });
    } catch {}
  }

  /**
   * Starts continuous background audio pulse/bassline for Fever Mode ("AROMÁTICO ON FIRE", streak >= 10).
   * Safe and non-intrusive rhythmic heartbeat / engine hum pulse.
   */
  public startFeverLoop(): void {
    if (this.muted || this.isFeverRunning) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    if (this.feverStopTimeout !== null) {
      clearTimeout(this.feverStopTimeout);
      this.feverStopTimeout = null;
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;

      // Master fever gain
      const feverGain = ctx.createGain();
      feverGain.gain.setValueAtTime(0.0001, now);
      feverGain.gain.linearRampToValueAtTime(0.1, now + 0.4);

      // Deep sub-bass pulse: warm triangle wave at 65.41 Hz (C2)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(65.41, now);

      // Harmonic fifth above: sine at 98.00 Hz (G2)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(98.0, now);

      // LFO to create a pulsing heartbeat (2.0 Hz = 120 bpm)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(2.0, now);
      lfoGain.gain.setValueAtTime(0.04, now);

      lfo.connect(lfoGain);
      lfoGain.connect(feverGain.gain);

      osc1.connect(feverGain);
      osc2.connect(feverGain);
      feverGain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);

      this.feverOsc1 = osc1;
      this.feverOsc2 = osc2;
      this.feverLfo = lfo;
      this.feverLfoGain = lfoGain;
      this.feverGain = feverGain;
      this.isFeverRunning = true;
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Checks if fever loop is currently active.
   */
  public isFeverActive(): boolean {
    return this.isFeverRunning;
  }

  /**
   * Stops the Fever Mode background audio loop with smooth exponential fadeout.
   */
  public stopFeverLoop(): void {
    if (!this.isFeverRunning && this.feverStopTimeout === null) return;
    this.isFeverRunning = false;

    if (this.feverStopTimeout !== null) {
      clearTimeout(this.feverStopTimeout);
      this.feverStopTimeout = null;
    }

    const ctx = this.ctx;
    const now = ctx ? ctx.currentTime : 0;

    const osc1 = this.feverOsc1;
    const osc2 = this.feverOsc2;
    const lfo = this.feverLfo;
    const lfoGain = this.feverLfoGain;
    const feverGain = this.feverGain;

    this.feverOsc1 = null;
    this.feverOsc2 = null;
    this.feverLfo = null;
    this.feverLfoGain = null;
    this.feverGain = null;

    if (feverGain && ctx) {
      try {
        feverGain.gain.setValueAtTime(feverGain.gain.value, now);
        feverGain.gain.linearRampToValueAtTime(0.0001, now + 0.12);
      } catch {}
    }

    const cleanup = () => {
      try {
        osc1?.stop();
        osc2?.stop();
        lfo?.stop();
        osc1?.disconnect();
        osc2?.disconnect();
        lfo?.disconnect();
        lfoGain?.disconnect();
        feverGain?.disconnect();
      } catch {}
      this.feverStopTimeout = null;
    };

    if (ctx && typeof setTimeout !== 'undefined') {
      this.feverStopTimeout = setTimeout(cleanup, 140);
    } else {
      cleanup();
    }
  }

  /**
   * Helper to play appropriate sound based on correctness, streak, and speed.
   */
  public playAnswerFeedback(
    isCorrect: boolean,
    currentStreak: number = 0,
    isSpeedBlitz: boolean = false
  ): void {
    if (!isCorrect) {
      this.stopFeverLoop();
      this.playError();
    } else {
      if (isSpeedBlitz) {
        this.playSpeedBonus();
      }

      if (
        currentStreak === 5 ||
        currentStreak === 10 ||
        currentStreak === 15 ||
        currentStreak === 20 ||
        (currentStreak > 20 && currentStreak % 5 === 0)
      ) {
        this.playMilestone(currentStreak);
      } else if (!isSpeedBlitz) {
        this.playStreak(currentStreak);
      }

      if (currentStreak >= 10) {
        this.startFeverLoop();
      } else {
        this.stopFeverLoop();
      }
    }
  }

  /**
   * Closes AudioContext when tearing down.
   */
  public async close(): Promise<void> {
    if (this.feverStopTimeout !== null) {
      clearTimeout(this.feverStopTimeout);
      this.feverStopTimeout = null;
    }
    this.stopFeverLoop();
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }
    if (this.ctx && !this.customContextProvided) {
      try {
        await this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }
}

/**
 * Singleton instance for shared app-wide sound synthesizer.
 */
export const soundSynth: SoundSynthesizer = new SoundSynthesizer();
