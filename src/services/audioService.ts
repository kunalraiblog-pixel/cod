import { SoundPreset } from '../types';

class AlarmAudioService {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private gainNode: GainNode | null = null;
  private volume: number = 0.7;
  private currentPreset: SoundPreset = 'urgent-pulse';
  private onAutoplayBlockedCallback: ((blocked: boolean) => void) | null = null;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public setAutoplayCallback(cb: (blocked: boolean) => void) {
    this.onAutoplayBlockedCallback = cb;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return null;
      this.ctx = new AudioCtxClass();
    }
    return this.ctx;
  }

  public async resumeAudio(): Promise<boolean> {
    const ctx = this.initContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        if (this.onAutoplayBlockedCallback) {
          this.onAutoplayBlockedCallback(false);
        }
        return true;
      } catch (e) {
        console.warn('AudioContext resume failed:', e);
        return false;
      }
    }
    return true;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch {
        // Ignore timing error
      }
    }
  }

  public startAlarm(preset: SoundPreset = 'urgent-pulse', volume: number = 0.7) {
    this.stopAlarm(); // Guarantee no overlapping instances

    this.currentPreset = preset;
    this.volume = Math.max(0, Math.min(1, volume));

    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      if (this.onAutoplayBlockedCallback) {
        this.onAutoplayBlockedCallback(true);
      }
      // Attempt resume once in case permitted
      ctx.resume().then(() => {
        if (ctx.state === 'running' && this.onAutoplayBlockedCallback) {
          this.onAutoplayBlockedCallback(false);
        }
      }).catch(() => {
        // Autoplay policy prevented immediate playback
      });
    }

    this.isPlaying = true;
    this.scheduleAlarmLoop();
  }

  private scheduleAlarmLoop() {
    if (!this.isPlaying) return;

    const playCycle = () => {
      if (!this.isPlaying || !this.ctx) return;

      if (this.ctx.state === 'running') {
        if (this.onAutoplayBlockedCallback) {
          this.onAutoplayBlockedCallback(false);
        }
        this.playPresetBurst(this.currentPreset);
      } else {
        if (this.onAutoplayBlockedCallback) {
          this.onAutoplayBlockedCallback(true);
        }
      }

      // Schedule next pulse cycle based on preset
      const interval = this.currentPreset === 'urgent-pulse' ? 650 : this.currentPreset === 'radar-siren' ? 950 : 800;
      this.timerId = window.setTimeout(playCycle, interval);
    };

    playCycle();
  }

  private playPresetBurst(preset: SoundPreset) {
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.8, now);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      if (preset === 'urgent-pulse') {
        // High urgency alternating dual-tone pulse
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const burstGain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square';

        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(700, now + 0.25);

        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.exponentialRampToValueAtTime(350, now + 0.25);

        burstGain.gain.setValueAtTime(0, now);
        burstGain.gain.linearRampToValueAtTime(1, now + 0.03);
        burstGain.gain.setValueAtTime(1, now + 0.35);
        burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(burstGain);
        osc2.connect(burstGain);
        burstGain.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.52);
        osc2.stop(now + 0.52);
      } else if (preset === 'radar-siren') {
        // Modulated pitch siren
        const osc = this.ctx.createOscillator();
        const sirenGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.linearRampToValueAtTime(1150, now + 0.4);
        osc.frequency.linearRampToValueAtTime(580, now + 0.8);

        sirenGain.gain.setValueAtTime(0.1, now);
        sirenGain.gain.linearRampToValueAtTime(1, now + 0.1);
        sirenGain.gain.setValueAtTime(1, now + 0.7);
        sirenGain.gain.linearRampToValueAtTime(0.01, now + 0.85);

        osc.connect(sirenGain);
        sirenGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.88);
      } else {
        // Chime Beep: Staccato triple-beep
        for (let i = 0; i < 3; i++) {
          const osc = this.ctx.createOscillator();
          const beepGain = this.ctx.createGain();
          const t = now + i * 0.16;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, t); // B5 note

          beepGain.gain.setValueAtTime(0, t);
          beepGain.gain.linearRampToValueAtTime(1, t + 0.02);
          beepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

          osc.connect(beepGain);
          beepGain.connect(masterGain);

          osc.start(t);
          osc.stop(t + 0.12);
        }
      }
    } catch (e) {
      console.warn('Audio playback burst error:', e);
    }
  }

  public playSuccessChime() {
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopAlarm();

    const doPlay = () => {
      try {
        const now = ctx.currentTime;
        const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major arpeggio
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.11;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(this.volume * 0.45, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.75);
        });
      } catch (e) {
        console.warn('Success chime error:', e);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(doPlay).catch(() => {});
    } else {
      doPlay();
    }
  }

  public previewPreset(preset: SoundPreset, volume = 0.7) {
    this.stopAlarm();
    this.currentPreset = preset;
    this.volume = volume;
    const ctx = this.initContext();
    if (!ctx) return;

    ctx.resume().then(() => {
      this.playPresetBurst(preset);
    }).catch(() => {});
  }

  public stopAlarm() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {
        // Ignore
      }
      this.gainNode = null;
    }
    if (this.onAutoplayBlockedCallback) {
      this.onAutoplayBlockedCallback(false);
    }
  }

  public isAlarmPlaying(): boolean {
    return this.isPlaying;
  }

  public cleanup() {
    this.stopAlarm();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // Ignore
      }
      this.ctx = null;
    }
  }
}

export const audioService = new AlarmAudioService();
