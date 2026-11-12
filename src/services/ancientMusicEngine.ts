/**
 * MUSICA ANTIQUA PROCEDURAL ENGINE (50 a.C.)
 * Offline Web Audio API synthesis modeling Greco-Roman instruments & ancient harmoniai modes:
 * - Cithara / Lyra (plucked gut strings with harmonic overtone & warm damping)
 * - Aulos / Tibia (dual-reed wind voice with subtle vibrato & breath envelope)
 * - Tympanum & Scabellum (ceremonial amphitheatre frame drums & bronze/wood clappers)
 * - Cornu Drone (resonant low brass fifths)
 */

export type AncientMusicMood = 'MENU' | 'ARENA' | 'TRIUMPH';

interface StepNote {
  kithara?: number[]; // Hz
  aulos?: number;     // Hz
  aulosDurSteps?: number;
  tympanum?: 'LOW' | 'ACCENT';
  scabellum?: boolean;
  drone?: number;     // Hz
}

// Frequencies anchored on A3=220 Hz, ancient Dorian/Phrygian/Mixolydian intervals
const NOTE = {
  A2: 110.0,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  Cs4: 277.18,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25
};

// 1. "Hymnus Olympiacus" — Contemplative Dorian / Aeolian Lyra & Aulos (Menu & Tabularium)
const MENU_PATTERN: StepNote[] = [
  { kithara: [NOTE.A3, NOTE.E4], aulos: NOTE.A4, aulosDurSteps: 3, tympanum: 'LOW', drone: NOTE.A2 },
  { kithara: [NOTE.C4] },
  { kithara: [NOTE.E4] },
  { kithara: [NOTE.D4], aulos: NOTE.G4, aulosDurSteps: 2, tympanum: 'ACCENT' },
  { kithara: [NOTE.B3] },
  { kithara: [NOTE.G3, NOTE.D4], aulos: NOTE.E4, aulosDurSteps: 3, scabellum: true },

  { kithara: [NOTE.F3, NOTE.C4], tympanum: 'LOW', drone: NOTE.F3 },
  { kithara: [NOTE.A3] },
  { kithara: [NOTE.C4], aulos: NOTE.F4, aulosDurSteps: 2 },
  { kithara: [NOTE.E4] },
  { kithara: [NOTE.D4], aulos: NOTE.E4, aulosDurSteps: 2, tympanum: 'ACCENT' },
  { kithara: [NOTE.C4], scabellum: true },

  { kithara: [NOTE.D3, NOTE.A3], aulos: NOTE.D4, aulosDurSteps: 3, tympanum: 'LOW', drone: NOTE.D3 },
  { kithara: [NOTE.F4] },
  { kithara: [NOTE.E4] },
  { kithara: [NOTE.D4], aulos: NOTE.F4, aulosDurSteps: 2, tympanum: 'ACCENT' },
  { kithara: [NOTE.C4] },
  { kithara: [NOTE.B3], aulos: NOTE.E4, aulosDurSteps: 2, scabellum: true },

  { kithara: [NOTE.E3, NOTE.B3], tympanum: 'LOW', drone: NOTE.E3 },
  { kithara: [NOTE.G4] },
  { kithara: [NOTE.E4], aulos: NOTE.G4, aulosDurSteps: 2 },
  { kithara: [NOTE.D4] },
  { kithara: [NOTE.C4, NOTE.E4], aulos: NOTE.B3, aulosDurSteps: 2, tympanum: 'ACCENT' },
  { kithara: [NOTE.A3], scabellum: true }
];

// 2. "Cantus Ludorum" — Driving Martial Phrygian Rhythm for the Sand Arena
const ARENA_PATTERN: StepNote[] = [
  { kithara: [NOTE.A3, NOTE.E4], aulos: NOTE.A4, aulosDurSteps: 2, tympanum: 'LOW', drone: NOTE.A2 },
  { kithara: [NOTE.Bb3], scabellum: true },
  { kithara: [NOTE.E4], tympanum: 'ACCENT', aulos: NOTE.Bb4, aulosDurSteps: 2 },
  { kithara: [NOTE.C4] },
  { kithara: [NOTE.A3, NOTE.E4], tympanum: 'LOW', aulos: NOTE.A4, aulosDurSteps: 2 },
  { kithara: [NOTE.G4], scabellum: true },
  { kithara: [NOTE.F4], tympanum: 'ACCENT', aulos: NOTE.E4, aulosDurSteps: 2 },
  { kithara: [NOTE.E4], scabellum: true },

  { kithara: [NOTE.D3, NOTE.A3], tympanum: 'LOW', drone: NOTE.D3, aulos: NOTE.F4, aulosDurSteps: 2 },
  { kithara: [NOTE.F4], scabellum: true },
  { kithara: [NOTE.E4], tympanum: 'ACCENT', aulos: NOTE.G4, aulosDurSteps: 2 },
  { kithara: [NOTE.D4] },
  { kithara: [NOTE.E3, NOTE.B3], tympanum: 'LOW', aulos: NOTE.E4, aulosDurSteps: 2 },
  { kithara: [NOTE.Bb3], scabellum: true },
  { kithara: [NOTE.C4, NOTE.E4], tympanum: 'ACCENT', aulos: NOTE.D4, aulosDurSteps: 2 },
  { kithara: [NOTE.A3], scabellum: true }
];

// 3. "Triumphus Senatus" — Stately Lydian Processional for Victories & Season-End Fasti
const TRIUMPH_PATTERN: StepNote[] = [
  { kithara: [NOTE.D4, NOTE.A4], aulos: NOTE.D5, aulosDurSteps: 3, tympanum: 'LOW', drone: NOTE.D3 },
  { kithara: [NOTE.Fs4] },
  { kithara: [NOTE.A4], tympanum: 'ACCENT', scabellum: true },
  { kithara: [NOTE.C5], aulos: NOTE.E5, aulosDurSteps: 3 },
  { kithara: [NOTE.A4] },
  { kithara: [NOTE.Fs4, NOTE.D5], tympanum: 'ACCENT' },

  { kithara: [NOTE.G3, NOTE.D4], aulos: NOTE.B3, aulosDurSteps: 2, tympanum: 'LOW', drone: NOTE.G3 },
  { kithara: [NOTE.B3] },
  { kithara: [NOTE.D4], scabellum: true, aulos: NOTE.D5, aulosDurSteps: 2 },
  { kithara: [NOTE.A3, NOTE.E4], tympanum: 'ACCENT' },
  { kithara: [NOTE.Cs4], aulos: NOTE.Cs4, aulosDurSteps: 2 },
  { kithara: [NOTE.D4, NOTE.A4], tympanum: 'LOW' }
];

export class AncientMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private isPlaying = false;
  private mood: AncientMusicMood = 'MENU';
  private volume = 0.42;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextStepTime = 0;
  private stepIndex = 0;

  public bindContext(ctx: AudioContext) {
    if (this.ctx === ctx && this.masterGain) return;
    this.ctx = ctx;

    this.duckGain = ctx.createGain();
    this.duckGain.gain.value = 1.0;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.volume * 0.42;

    this.duckGain.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    // Precompute short noise buffer for scabellum & tympanum transients
    const sampleRate = ctx.sampleRate;
    const len = Math.floor(sampleRate * 0.25);
    const buffer = ctx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.42, this.ctx.currentTime, 0.08);
    }
  }

  public setDucked(ducked: boolean) {
    if (!this.duckGain || !this.ctx) return;
    this.duckGain.gain.setTargetAtTime(ducked ? 0.34 : 1.0, this.ctx.currentTime, 0.14);
  }

  public setMood(mood: AncientMusicMood) {
    if (this.mood === mood) return;
    this.mood = mood;
    this.stepIndex = 0;
  }

  public start(ctx: AudioContext, mood?: AncientMusicMood) {
    this.bindContext(ctx);
    if (mood) this.mood = mood;
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.nextStepTime = ctx.currentTime + 0.08;

    this.schedulerTimer = setInterval(() => {
      this.scheduleLookahead();
    }, 110);
  }

  public stop() {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  public isActive(): boolean {
    return this.isPlaying;
  }

  private getStepDurationSec(): number {
    if (this.mood === 'ARENA') return 0.24;   // Energetic ~125 BPM 8ths
    if (this.mood === 'TRIUMPH') return 0.29; // Regal ~104 BPM
    return 0.33;                              // Calm contemplative ~91 BPM
  }

  private scheduleLookahead() {
    if (!this.isPlaying || !this.ctx || !this.duckGain) return;
    if (this.ctx.state === 'suspended') return;

    const horizon = this.ctx.currentTime + 0.28;
    const pattern =
      this.mood === 'ARENA'
        ? ARENA_PATTERN
        : this.mood === 'TRIUMPH'
        ? TRIUMPH_PATTERN
        : MENU_PATTERN;
    const stepDur = this.getStepDurationSec();

    // Prevent runaway scheduling if tab slept
    if (this.nextStepTime < this.ctx.currentTime - 0.5) {
      this.nextStepTime = this.ctx.currentTime + 0.05;
    }

    while (this.nextStepTime < horizon) {
      const note = pattern[this.stepIndex % pattern.length];
      this.triggerStep(note, this.nextStepTime, stepDur);
      this.nextStepTime += stepDur;
      this.stepIndex++;
    }
  }

  private triggerStep(step: StepNote, time: number, stepDur: number) {
    if (!this.ctx || !this.duckGain) return;

    if (step.kithara && step.kithara.length > 0) {
      step.kithara.forEach((freq, idx) => {
        // Gentle roll for dyads/chords like plucking across lyre strings
        this.playKitharaNote(freq, time + idx * 0.022, 0.78);
      });
    }

    if (step.aulos) {
      const dur = stepDur * (step.aulosDurSteps || 2) * 0.92;
      this.playAulosNote(step.aulos, time, dur);
    }

    if (step.tympanum) {
      this.playTympanum(time, step.tympanum === 'LOW');
    }

    if (step.scabellum) {
      this.playScabellum(time);
    }

    if (step.drone) {
      this.playCornuDrone(step.drone, time, stepDur * 5.2);
    }
  }

  private playKitharaNote(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.duckGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, time);
    filter.frequency.exponentialRampToValueAtTime(480, time + 0.22);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.16, time + 0.009);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.value = 0.25;

    osc1.connect(filter);
    osc2.connect(harmonicGain);
    harmonicGain.connect(filter);
    filter.connect(gain);
    gain.connect(this.duckGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur + 0.02);
    osc2.stop(time + dur + 0.02);
  }

  private playAulosNote(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.duckGain) return;
    // Dual slightly detuned reeds simulating double-pipe ancient aulos/tibia
    const oscA = this.ctx.createOscillator();
    const oscB = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    oscA.type = 'triangle';
    oscA.frequency.setValueAtTime(freq, time);
    oscB.type = 'sine';
    oscB.frequency.setValueAtTime(freq * 1.003, time);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.2, time);
    lfoGain.gain.setValueAtTime(4.5, time);
    lfo.connect(lfoGain);
    lfoGain.connect(oscA.frequency);
    lfoGain.connect(oscB.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(Math.min(2200, freq * 2.2), time);
    filter.Q.setValueAtTime(1.4, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.11, time + 0.045);
    gain.gain.setValueAtTime(0.095, Math.max(time + 0.05, time + dur - 0.08));
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(gain);
    gain.connect(this.duckGain);

    oscA.start(time);
    oscB.start(time);
    lfo.start(time);
    oscA.stop(time + dur + 0.03);
    oscB.stop(time + dur + 0.03);
    lfo.stop(time + dur + 0.03);
  }

  private playTympanum(time: number, isDeep: boolean) {
    if (!this.ctx || !this.duckGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startHz = isDeep ? 115 : 148;
    const endHz = isDeep ? 52 : 76;
    osc.frequency.setValueAtTime(startHz, time);
    osc.frequency.exponentialRampToValueAtTime(endHz, time + 0.14);

    gain.gain.setValueAtTime(isDeep ? 0.22 : 0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.19);

    osc.connect(gain);
    gain.connect(this.duckGain);
    osc.start(time);
    osc.stop(time + 0.21);
  }

  private playScabellum(time: number) {
    if (!this.ctx || !this.duckGain || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1750, time);
    filter.Q.setValueAtTime(3.2, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.075, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.duckGain);
    src.start(time);
    src.stop(time + 0.05);
  }

  private playCornuDrone(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.duckGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.065, time + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.duckGain);

    osc.start(time);
    osc.stop(time + dur + 0.03);
  }
}
