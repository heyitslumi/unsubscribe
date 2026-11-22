class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensure(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
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
    this.tone(520, 0.045, 'triangle', 0.08, 0, 320);
  }

  playScam() {
    // Evil cash-register cha-ching + low corporate buzz
    this.tone(987.77, 0.08, 'square', 0.09, 0);
    this.tone(1318.5, 0.18, 'square', 0.1, 0.065);
    this.tone(155, 0.24, 'sawtooth', 0.09, 0.08, 110);
  }

  playDodge() {
    this.tone(360, 0.09, 'sine', 0.07, 0, 740);
  }

  playSplit() {
    this.tone(290, 0.07, 'triangle', 0.09, 0, 540);
    this.tone(430, 0.09, 'triangle', 0.08, 0.05, 680);
  }

  playStageClear() {
    // Rubber-stamp thud + crisp ascending triad
    this.tone(120, 0.09, 'triangle', 0.16, 0, 58);
    this.tone(523.25, 0.11, 'triangle', 0.11, 0.05);
    this.tone(659.25, 0.11, 'triangle', 0.11, 0.12);
    this.tone(783.99, 0.22, 'triangle', 0.13, 0.19);
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.tone(n, 0.22, 'triangle', 0.12, idx * 0.085);
    });
  }

  playFail() {
    const notes = [392, 349.23, 311.13, 233.08];
    notes.forEach((n, idx) => {
      this.tone(n, 0.24, 'sawtooth', 0.08, idx * 0.11);
    });
  }
}

export const sfx = new SoundEngine();
