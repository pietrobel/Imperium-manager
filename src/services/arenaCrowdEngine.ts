/**
 * ARENA CROWD & STADIUM CHANT ENGINE (50 a.C.)
 * Offline Web Audio API amphitheatre crowd simulation:
 * - Multi-band pink-noise stadium roar + formant-filtered choral chant waves
 * - Dynamic intensity scaling (ambient -> scoring approach build-up -> explosive Meta roar)
 * - Rhythmic Roman shield-stomp / vocal "OOOH-AAAH" arena chants speeding up under high tension
 */

export class ArenaCrowdEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private duckGain: GainNode | null = null;

  private isRunning = false;
  private intensity = 0.2; // 0.0 .. 1.0
  private volume = 0.72;

  // Continuous bed nodes
  private noiseSource: AudioBufferSourceNode | null = null;
  private rumbleGain: GainNode | null = null;
  private choirGain: GainNode | null = null;
  private shimmerGain: GainNode | null = null;
  private shimmerFilter: BiquadFilterNode | null = null;
  private choirFilterA: BiquadFilterNode | null = null;
  private choirFilterB: BiquadFilterNode | null = null;
  private lfoOsc: OscillatorNode | null = null;

  private chantTimer: ReturnType<typeof setInterval> | null = null;
  private chantStep = 0;

  private createPinkNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const len = Math.floor(sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, sampleRate);
    const out = buf.getChannelData(0);

    // Paul Kellet pink-noise approximation for natural warm crowd bed
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      out[i] = Math.max(-0.95, Math.min(0.95, (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11));
      b6 = white * 0.115926;
    }

    // Crossfade start & end 400 samples for clickless looping
    const fade = Math.min(400, Math.floor(len / 8));
    for (let i = 0; i < fade; i++) {
      const ratio = i / fade;
      const tailIdx = len - fade + i;
      const blended = out[i] * ratio + out[tailIdx] * (1 - ratio);
      out[i] = blended;
      out[tailIdx] = blended;
    }
    return buf;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.08);
    }
  }

  public setDucked(ducked: boolean) {
    if (!this.duckGain || !this.ctx) return;
    // Never silence the stadium during commentary—just keep it warm behind the announcer
    this.duckGain.gain.setTargetAtTime(ducked ? 0.52 : 1.0, this.ctx.currentTime, 0.15);
  }

  public start(ctx: AudioContext) {
    if (this.isRunning && this.ctx === ctx) return;
    this.stop();
    this.ctx = ctx;

    this.duckGain = ctx.createGain();
    this.duckGain.gain.value = 1.0;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.volume;

    this.duckGain.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    const noiseBuffer = this.createPinkNoiseBuffer(ctx, 3.5);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    // Layer 1: Amphitheatre Stone Sub-Rumble
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 210;
    this.rumbleGain = ctx.createGain();
    this.rumbleGain.gain.value = 0.16;

    // Layer 2: Formant-Filtered Crowd Choir ("OOOH-AAAH" vowel bands)
    this.choirFilterA = ctx.createBiquadFilter();
    this.choirFilterA.type = 'bandpass';
    this.choirFilterA.frequency.value = 460;
    this.choirFilterA.Q.value = 2.4;

    this.choirFilterB = ctx.createBiquadFilter();
    this.choirFilterB.type = 'bandpass';
    this.choirFilterB.frequency.value = 920;
    this.choirFilterB.Q.value = 2.8;

    this.choirGain = ctx.createGain();
    this.choirGain.gain.value = 0.22;

    // Subtle slow breathing LFO modulating choir formant pitch to feel organic
    this.lfoOsc = ctx.createOscillator();
    this.lfoOsc.type = 'sine';
    this.lfoOsc.frequency.value = 0.65;
    const lfoMod = ctx.createGain();
    lfoMod.gain.value = 65;
    this.lfoOsc.connect(lfoMod);
    lfoMod.connect(this.choirFilterA.frequency);
    lfoMod.connect(this.choirFilterB.frequency);

    // Layer 3: Upper applause & cheer air shimmer
    this.shimmerFilter = ctx.createBiquadFilter();
    this.shimmerFilter.type = 'bandpass';
    this.shimmerFilter.frequency.value = 2100;
    this.shimmerFilter.Q.value = 0.9;
    this.shimmerGain = ctx.createGain();
    this.shimmerGain.gain.value = 0.05;

    src.connect(rumbleFilter);
    rumbleFilter.connect(this.rumbleGain);
    this.rumbleGain.connect(this.duckGain);

    src.connect(this.choirFilterA);
    src.connect(this.choirFilterB);
    this.choirFilterA.connect(this.choirGain);
    this.choirFilterB.connect(this.choirGain);
    this.choirGain.connect(this.duckGain);

    src.connect(this.shimmerFilter);
    this.shimmerFilter.connect(this.shimmerGain);
    this.shimmerGain.connect(this.duckGain);

    src.start();
    this.lfoOsc.start();

    this.noiseSource = src;
    this.isRunning = true;
    this.setIntensity(0.22);

    // Periodic stadium chant & drum cadence reactive to intensity
    this.chantTimer = setInterval(() => {
      this.tickChantPulse();
    }, 550);
  }

  public stop() {
    this.isRunning = false;
    if (this.chantTimer) {
      clearInterval(this.chantTimer);
      this.chantTimer = null;
    }
    try {
      this.noiseSource?.stop();
    } catch {
      // Ignore already stopped
    }
    try {
      this.lfoOsc?.stop();
    } catch {
      // Ignore already stopped
    }
    this.noiseSource = null;
    this.lfoOsc = null;
    this.rumbleGain = null;
    this.choirGain = null;
    this.shimmerGain = null;
    this.masterGain = null;
    this.duckGain = null;
  }

  /**
   * Smoothly scales stadium crowd volume, brightness, and chant density.
   * 0.15 = calm background, 0.60+ = team advancing into scoring zone, 0.95+ = imminent meta!
   */
  public setIntensity(rawLevel: number) {
    const level = Math.max(0.08, Math.min(1, rawLevel));
    this.intensity = level;
    if (!this.isRunning || !this.ctx || !this.rumbleGain || !this.choirGain || !this.shimmerGain) return;

    const t = this.ctx.currentTime;
    this.rumbleGain.gain.setTargetAtTime(0.11 + level * 0.24, t, 0.22);
    this.choirGain.gain.setTargetAtTime(0.14 + level * 0.42, t, 0.2);
    this.shimmerGain.gain.setTargetAtTime(0.03 + level * level * 0.22, t, 0.2);

    if (this.choirFilterA && this.choirFilterB) {
      this.choirFilterA.frequency.setTargetAtTime(410 + level * 220, t, 0.25);
      this.choirFilterB.frequency.setTargetAtTime(840 + level * 420, t, 0.25);
    }
  }

  private tickChantPulse() {
    if (!this.isRunning || !this.ctx || !this.duckGain || this.ctx.state === 'suspended') return;
    this.chantStep++;

    // At low intensity only occasional distant drum/chant; at high intensity rapid thrilling stadium chants!
    const shouldPulse =
      this.intensity >= 0.72 ||
      (this.intensity >= 0.44 && this.chantStep % 2 === 0) ||
      this.chantStep % 4 === 0;

    if (!shouldPulse) return;

    const now = this.ctx.currentTime;
    // Stadium shield-stomp / drum thud
    const drumOsc = this.ctx.createOscillator();
    const drumGain = this.ctx.createGain();
    drumOsc.type = 'sine';
    drumOsc.frequency.setValueAtTime(98 + this.intensity * 18, now);
    drumOsc.frequency.exponentialRampToValueAtTime(42, now + 0.15);
    const drumVol = 0.08 + this.intensity * 0.16;
    drumGain.gain.setValueAtTime(drumVol, now);
    drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    drumOsc.connect(drumGain);
    drumGain.connect(this.duckGain);
    drumOsc.start(now);
    drumOsc.stop(now + 0.2);

    // Choral stadium chant swell ("OOOH-AAAH") when team pushes into scoring zone
    if (this.intensity >= 0.42) {
      this.triggerChoralSwell(now, 0.48, 0.06 + this.intensity * 0.11, 145 + this.intensity * 45);
    }
  }

  private triggerChoralSwell(startTime: number, duration: number, peakGain: number, basePitch: number) {
    if (!this.ctx || !this.duckGain) return;
    // Layered male/female stadium voices slightly detuned for crowd chorus body
    const ratios = [1.0, 1.007, 1.498, 2.005];
    const formant = this.ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(480, startTime);
    formant.frequency.linearRampToValueAtTime(880, startTime + duration * 0.55);
    formant.frequency.linearRampToValueAtTime(620, startTime + duration);
    formant.Q.value = 2.0;

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.001, startTime);
    swellGain.gain.linearRampToValueAtTime(peakGain, startTime + duration * 0.35);
    swellGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    formant.connect(swellGain);
    swellGain.connect(this.duckGain);

    ratios.forEach(r => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(basePitch * r, startTime);
      osc.frequency.linearRampToValueAtTime(basePitch * r * 1.06, startTime + duration * 0.7);
      osc.connect(formant);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.03);
    });
  }

  /**
   * Massive amphitheatre eruption when an athlete crosses the Linea di Fondo (META!)
   */
  public triggerGoalRoar(ctx: AudioContext) {
    if (!this.isRunning) {
      this.start(ctx);
    }
    const audioCtx = this.ctx || ctx;
    const targetOut = this.masterGain || audioCtx.destination;
    const now = audioCtx.currentTime;

    // 1. Temporarily surge crowd roar bed to maximum excitement
    this.setIntensity(1.0);
    setTimeout(() => {
      if (this.isRunning) this.setIntensity(0.45);
    }, 2400);

    // 2. Massive cheering roar noise burst
    const roarBuf = this.createPinkNoiseBuffer(audioCtx, 2.6);
    const roarSrc = audioCtx.createBufferSource();
    roarSrc.buffer = roarBuf;

    const roarFilter = audioCtx.createBiquadFilter();
    roarFilter.type = 'bandpass';
    roarFilter.frequency.setValueAtTime(650, now);
    roarFilter.frequency.linearRampToValueAtTime(1450, now + 0.65);
    roarFilter.frequency.linearRampToValueAtTime(820, now + 2.5);
    roarFilter.Q.value = 0.75;

    const roarGain = audioCtx.createGain();
    roarGain.gain.setValueAtTime(0.01, now);
    roarGain.gain.linearRampToValueAtTime(0.55 * this.volume, now + 0.18);
    roarGain.gain.setValueAtTime(0.44 * this.volume, now + 1.1);
    roarGain.gain.exponentialRampToValueAtTime(0.001, now + 2.55);

    roarSrc.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(targetOut);
    roarSrc.start(now);
    roarSrc.stop(now + 2.6);

    // 3. Stadium Chorus Triumph Shout
    this.triggerChoralSwell(now + 0.05, 1.5, 0.24 * this.volume, 220);

    // 4. Imperial Cornu Brass Fanfare (replaces sharp retro square wave with authentic Roman bronze horn!)
    const hornNotes = [220, 277.18, 329.63, 440];
    hornNotes.forEach((hz, idx) => {
      const start = now + idx * 0.09;
      const osc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const g = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(hz, start);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1450, start);
      filter.frequency.exponentialRampToValueAtTime(750, start + 0.65);

      g.gain.setValueAtTime(0.001, start);
      g.gain.linearRampToValueAtTime(0.11 * this.volume, start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.75);

      osc.connect(filter);
      filter.connect(g);
      g.connect(targetOut);
      osc.start(start);
      osc.stop(start + 0.78);
    });
  }

  /**
   * Dramatic crowd gasp & shield-impact reaction when a tackle/intercept stops an attack
   */
  public triggerTackleOrIntercept(ctx: AudioContext, type: 'PLACCAGGIO' | 'INTERCETTO') {
    if (!this.isRunning) {
      this.start(ctx);
    }
    const audioCtx = this.ctx || ctx;
    const targetOut = this.masterGain || audioCtx.destination;
    const now = audioCtx.currentTime;

    // Impact body thud in sand
    const thud = audioCtx.createOscillator();
    const thudGain = audioCtx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(type === 'PLACCAGGIO' ? 140 : 190, now);
    thud.frequency.exponentialRampToValueAtTime(38, now + 0.16);
    thudGain.gain.setValueAtTime(0.32 * this.volume, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    thud.connect(thudGain);
    thudGain.connect(targetOut);
    thud.start(now);
    thud.stop(now + 0.22);

    // Crowd gasp + applause wave
    this.triggerChoralSwell(now + 0.04, 0.75, 0.18 * this.volume, type === 'INTERCETTO' ? 196 : 165);
    this.setIntensity(0.74);
    setTimeout(() => {
      if (this.isRunning) this.setIntensity(0.28);
    }, 1100);
  }
}
