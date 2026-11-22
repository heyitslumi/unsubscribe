class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensure(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private jitter(baseFreq: number, pct = 0.045): number {
    return baseFreq * (1 + (Math.random() * 2 - 1) * pct);
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.12,
    delay = 0,
    slideTo?: number
  ) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + duration);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(gainPeak, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  playClick() {
    this.tone(this.jitter(540), 0.042, 'triangle', 0.08, 0, 320);
  }

  playUrgentTick() {
    this.tone(this.jitter(880, 0.02), 0.038, 'sine', 0.045, 0, 660);
  }

  playScam() {
    // Evil cash-register cha-ching + low corporate buzz
    this.tone(this.jitter(987.77, 0.02), 0.075, 'square', 0.095, 0);
    this.tone(this.jitter(1318.5, 0.02), 0.17, 'square', 0.105, 0.06);
    this.tone(148, 0.25, 'sawtooth', 0.1, 0.08, 92);
  }

  playDodge() {
    this.tone(this.jitter(370, 0.08), 0.085, 'sine', 0.075, 0, this.jitter(780, 0.08));
  }

  playSplit() {
    this.tone(this.jitter(290), 0.07, 'triangle', 0.09, 0, 540);
    this.tone(this.jitter(440), 0.09, 'triangle', 0.085, 0.05, 700);
  }

  playStageClear() {
    // Heavy rubber-stamp thud + crisp ascending triad
    this.tone(115, 0.1, 'triangle', 0.19, 0, 48);
    this.tone(523.25, 0.11, 'triangle', 0.11, 0.045);
    this.tone(659.25, 0.11, 'triangle', 0.115, 0.115);
    this.tone(783.99, 0.22, 'triangle', 0.135, 0.185);
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.tone(n, 0.24, 'triangle', 0.125, idx * 0.085);
    });
  }

  playFail() {
    const notes = [392, 349.23, 311.13, 233.08];
    notes.forEach((n, idx) => {
      this.tone(n, 0.25, 'sawtooth', 0.085, idx * 0.11);
    });
  }
}

export const sfx = new SoundEngine();
