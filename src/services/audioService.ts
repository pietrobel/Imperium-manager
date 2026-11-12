import { AncientMusicEngine, type AncientMusicMood } from './ancientMusicEngine';
import { ArenaCrowdEngine } from './arenaCrowdEngine';

class AudioService {
  private ctx: AudioContext | null = null;
  private cachedItalianVoice: SpeechSynthesisVoice | null = null;
  private voicesListenerAttached = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private queuedHigh: { text: string; rate: number; pitch: number } | null = null;
  private speakTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSpeechEndTime = 0;

  private musicEngine = new AncientMusicEngine();
  private crowdEngine = new ArenaCrowdEngine();
  private currentContextMood: AncientMusicMood = 'MENU';
  private musicChangeListeners: Set<() => void> = new Set();

  public enabled: boolean = true;
  public musicEnabled: boolean = true;
  public crowdEnabled: boolean = true;
  public musicVolume: number = 0.45;
  public crowdVolume: number = 0.75;
  public musicMoodPreference: 'AUTO' | AncientMusicMood = 'AUTO';

  public voiceCommentaryEnabled: boolean = true;
  public simModePreference: 'HIGHLIGHTS' | 'FULL' = 'HIGHLIGHTS';
  public simSpeedMultiplier: 1 | 1.5 | 2 = 1;
  public commentaryDetail: 'COMMENTO_ESTESO' | 'SOLO_GOL' = 'COMMENTO_ESTESO';
  public displayScaleMode: 'AUTO' | 'COMPACT' | 'COMFORTABLE' = 'AUTO';

  constructor() {
    this.loadPreferences();
    this.applyDisplayScale();
    this.musicEngine.setVolume(this.musicVolume);
    this.crowdEngine.setVolume(this.crowdVolume);
  }

  private loadPreferences() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem('magister_ludorum_prefs');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.enabled === 'boolean') this.enabled = parsed.enabled;
      if (typeof parsed.musicEnabled === 'boolean') this.musicEnabled = parsed.musicEnabled;
      if (typeof parsed.crowdEnabled === 'boolean') this.crowdEnabled = parsed.crowdEnabled;
      if (typeof parsed.musicVolume === 'number') {
        this.musicVolume = Math.max(0, Math.min(1, parsed.musicVolume));
      }
      if (typeof parsed.crowdVolume === 'number') {
        this.crowdVolume = Math.max(0, Math.min(1, parsed.crowdVolume));
      }
      if (
        parsed.musicMoodPreference === 'AUTO' ||
        parsed.musicMoodPreference === 'MENU' ||
        parsed.musicMoodPreference === 'ARENA' ||
        parsed.musicMoodPreference === 'TRIUMPH'
      ) {
        this.musicMoodPreference = parsed.musicMoodPreference;
      }
      if (typeof parsed.voiceCommentaryEnabled === 'boolean') {
        this.voiceCommentaryEnabled = parsed.voiceCommentaryEnabled;
      }
      if (parsed.simModePreference === 'HIGHLIGHTS' || parsed.simModePreference === 'FULL') {
        this.simModePreference = parsed.simModePreference;
      }
      if (parsed.simSpeedMultiplier === 1 || parsed.simSpeedMultiplier === 1.5 || parsed.simSpeedMultiplier === 2) {
        this.simSpeedMultiplier = parsed.simSpeedMultiplier;
      }
      if (parsed.commentaryDetail === 'COMMENTO_ESTESO' || parsed.commentaryDetail === 'SOLO_GOL') {
        this.commentaryDetail = parsed.commentaryDetail;
      }
      if (
        parsed.displayScaleMode === 'AUTO' ||
        parsed.displayScaleMode === 'COMPACT' ||
        parsed.displayScaleMode === 'COMFORTABLE'
      ) {
        this.displayScaleMode = parsed.displayScaleMode;
      }
    } catch {
      // Ignore storage errors
    }
  }

  public applyDisplayScale(modeOverride?: 'AUTO' | 'COMPACT' | 'COMFORTABLE') {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const mode = modeOverride || this.displayScaleMode;
    this.displayScaleMode = mode;

    let rootFontPx = 15;
    if (mode === 'COMPACT') {
      rootFontPx = 13;
    } else if (mode === 'COMFORTABLE') {
      rootFontPx = 16;
    } else {
      const h = window.innerHeight;
      if (h <= 600) rootFontPx = 12.5;
      else if (h <= 700) rootFontPx = 13.5;
      else if (h <= 820) rootFontPx = 14.5;
      else if (h <= 960) rootFontPx = 15.5;
      else rootFontPx = 16;
    }

    document.documentElement.style.fontSize = `${rootFontPx}px`;
  }

  public savePreferences() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(
        'magister_ludorum_prefs',
        JSON.stringify({
          enabled: this.enabled,
          musicEnabled: this.musicEnabled,
          crowdEnabled: this.crowdEnabled,
          musicVolume: this.musicVolume,
          crowdVolume: this.crowdVolume,
          musicMoodPreference: this.musicMoodPreference,
          voiceCommentaryEnabled: this.voiceCommentaryEnabled,
          simModePreference: this.simModePreference,
          simSpeedMultiplier: this.simSpeedMultiplier,
          commentaryDetail: this.commentaryDetail,
          displayScaleMode: this.displayScaleMode
        })
      );
    } catch {
      // Ignore storage errors
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public subscribeMusicState(fn: () => void): () => void {
    this.musicChangeListeners.add(fn);
    return () => {
      this.musicChangeListeners.delete(fn);
    };
  }

  private notifyMusicListeners() {
    this.musicChangeListeners.forEach(fn => {
      try {
        fn();
      } catch {
        // Ignore
      }
    });
  }

  private resolveEffectiveMood(): AncientMusicMood {
    return this.musicMoodPreference === 'AUTO' ? this.currentContextMood : this.musicMoodPreference;
  }

  public ensureAudioStarted() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    if (this.musicEnabled && !this.musicEngine.isActive()) {
      this.musicEngine.setVolume(this.musicVolume);
      this.musicEngine.start(ctx, this.resolveEffectiveMood());
    }
  }

  public setGlobalEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopSpeech();
      this.musicEngine.stop();
      this.crowdEngine.stop();
    } else {
      this.ensureAudioStarted();
    }
    this.savePreferences();
    this.notifyMusicListeners();
  }

  public setMusicEnabled(val: boolean) {
    this.musicEnabled = val;
    if (!val || !this.enabled) {
      this.musicEngine.stop();
    } else {
      const ctx = this.initCtx();
      if (ctx) {
        this.musicEngine.setVolume(this.musicVolume);
        this.musicEngine.start(ctx, this.resolveEffectiveMood());
      }
    }
    this.savePreferences();
    this.notifyMusicListeners();
  }

  public setCrowdEnabled(val: boolean) {
    this.crowdEnabled = val;
    if (!val || !this.enabled) {
      this.crowdEngine.stop();
    }
    this.savePreferences();
    this.notifyMusicListeners();
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.musicEngine.setVolume(this.musicVolume);
    this.savePreferences();
    this.notifyMusicListeners();
  }

  public setCrowdVolume(vol: number) {
    this.crowdVolume = Math.max(0, Math.min(1, vol));
    this.crowdEngine.setVolume(this.crowdVolume);
    this.savePreferences();
    this.notifyMusicListeners();
  }

  public setMusicContext(mood: AncientMusicMood) {
    this.currentContextMood = mood;
    const effective = this.resolveEffectiveMood();
    this.musicEngine.setMood(effective);
    if (this.enabled && this.musicEnabled && this.ctx && !this.musicEngine.isActive()) {
      this.musicEngine.start(this.ctx, effective);
    }
    this.notifyMusicListeners();
  }

  public setMusicMoodPreference(pref: 'AUTO' | AncientMusicMood) {
    this.musicMoodPreference = pref;
    const effective = this.resolveEffectiveMood();
    this.musicEngine.setMood(effective);
    if (this.enabled && this.musicEnabled) {
      const ctx = this.initCtx();
      if (ctx) {
        this.musicEngine.start(ctx, effective);
      }
    }
    this.savePreferences();
    this.notifyMusicListeners();
  }

  public startArenaCrowd() {
    if (!this.enabled || !this.crowdEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    this.crowdEngine.setVolume(this.crowdVolume);
    this.crowdEngine.start(ctx);
    this.setMusicContext('ARENA');
  }

  public stopArenaCrowd() {
    this.crowdEngine.stop();
    this.setMusicContext('MENU');
  }

  public updateArenaCrowdIntensity(level: number) {
    if (!this.enabled || !this.crowdEnabled) return;
    this.crowdEngine.setIntensity(level);
  }

  public playTackleOrIntercept(type: 'PLACCAGGIO' | 'INTERCETTO') {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    if (this.crowdEnabled) {
      this.crowdEngine.triggerTackleOrIntercept(ctx, type);
    } else {
      this.playTone(type === 'PLACCAGGIO' ? 140 : 280, 0.12);
    }
  }

  public isSpeechSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    );
  }

  private resolveItalianVoice(): SpeechSynthesisVoice | null {
    if (!this.isSpeechSupported()) return null;
    try {
      const synth = window.speechSynthesis;
      if (!this.voicesListenerAttached && typeof synth.addEventListener === 'function') {
        this.voicesListenerAttached = true;
        synth.addEventListener('voiceschanged', () => {
          this.cachedItalianVoice = null;
          this.resolveItalianVoice();
        });
      }

      if (this.cachedItalianVoice) return this.cachedItalianVoice;

      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return null;

      const picked =
        voices.find(v => v.lang.toLowerCase() === 'it-it' && v.name.toLowerCase().includes('google')) ||
        voices.find(v => v.lang.toLowerCase() === 'it-it' && v.localService) ||
        voices.find(v => v.lang.toLowerCase() === 'it-it') ||
        voices.find(v => v.lang.toLowerCase().startsWith('it')) ||
        null;

      this.cachedItalianVoice = picked;
      return picked;
    } catch {
      return null;
    }
  }

  public stopSpeech() {
    this.queuedHigh = null;
    if (this.speakTimer) {
      clearTimeout(this.speakTimer);
      this.speakTimer = null;
    }
    this.currentUtterance = null;
    this.musicEngine.setDucked(false);
    this.crowdEngine.setDucked(false);
    if (!this.isSpeechSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore silent
    }
  }

  private dispatchUtterance(text: string, rate: number, pitch: number) {
    if (!this.enabled || !this.voiceCommentaryEnabled || !this.isSpeechSupported()) return;
    try {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      const voice = this.resolveItalianVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = Math.min(0.98, Math.max(0.8, rate));
      utterance.pitch = Math.min(1.15, Math.max(0.85, pitch));
      utterance.volume = 1.0;

      this.currentUtterance = utterance;

      utterance.onstart = () => {
        this.musicEngine.setDucked(true);
        this.crowdEngine.setDucked(true);
      };

      utterance.onend = () => {
        if (this.currentUtterance === utterance) {
          this.currentUtterance = null;
        }
        this.lastSpeechEndTime = Date.now();
        if (this.queuedHigh && this.enabled && this.voiceCommentaryEnabled) {
          const next = this.queuedHigh;
          this.queuedHigh = null;
          this.speakTimer = setTimeout(() => {
            this.dispatchUtterance(next.text, next.rate, next.pitch);
          }, 180);
        } else {
          this.musicEngine.setDucked(false);
          this.crowdEngine.setDucked(false);
        }
      };

      utterance.onerror = () => {
        if (this.currentUtterance === utterance) {
          this.currentUtterance = null;
        }
        this.lastSpeechEndTime = Date.now();
        this.musicEngine.setDucked(false);
        this.crowdEngine.setDucked(false);
      };

      synth.speak(utterance);
    } catch {
      // Speech fallback silent
    }
  }

  public speakCommentary(
    rawText: string,
    options?: { priority?: 'HIGH' | 'NORMAL'; interrupt?: boolean; rate?: number; pitch?: number }
  ) {
    if (!this.enabled || !this.voiceCommentaryEnabled || !this.isSpeechSupported()) return;
    try {
      const synth = window.speechSynthesis;
      const priority = options?.priority || 'NORMAL';
      const interrupt = options?.interrupt ?? false;
      const rate = options?.rate ?? 0.9;
      const pitch = options?.pitch ?? 1.0;

      const cleanText = rawText
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/[⭐🔄🔁⚠️💧💥]/g, '')
        .replace(/\s*[·:]\s*/g, ', ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const isBusy = synth.speaking || synth.pending || Boolean(this.currentUtterance);

      if (priority === 'NORMAL') {
        if (isBusy || Date.now() - this.lastSpeechEndTime < 1400) {
          return;
        }
        this.dispatchUtterance(cleanText, rate, pitch);
        return;
      }

      if (isBusy && !interrupt) {
        this.queuedHigh = { text: cleanText, rate, pitch };
        return;
      }

      if (interrupt) {
        this.queuedHigh = null;
        if (this.speakTimer) {
          clearTimeout(this.speakTimer);
          this.speakTimer = null;
        }
        synth.cancel();
        this.speakTimer = setTimeout(() => {
          this.dispatchUtterance(cleanText, rate, pitch);
        }, 90);
        return;
      }

      this.dispatchUtterance(cleanText, rate, pitch);
    } catch {
      // Speech fallback silent
    }
  }

  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      this.ensureAudioStarted();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.11, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio fallback silent
    }
  }

  playWhistle() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      // Roman Bucina / Arbitrator double signal
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1950, ctx.currentTime);
      osc.frequency.setValueAtTime(2200, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(1950, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Silent
    }
  }

  playGoal() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      if (this.crowdEnabled) {
        this.crowdEngine.triggerGoalRoar(ctx);
      } else {
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = ctx.currentTime + idx * 0.08;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.26);
        });
      }
    } catch {
      // Silent
    }
  }

  playTone(freq: number, duration: number = 0.1) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Silent
    }
  }
}

export const audio = new AudioService();

