class AudioSirenService {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  public isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  public startSiren() {
    if (this.isMuted || this.isPlaying) return;

    try {
      this.init();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.oscillator = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();

      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.setValueAtTime(850, this.ctx.currentTime);

      this.gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.oscillator.start();
      this.isPlaying = true;

      // Frequency modulation for police/perimeter siren effect (800Hz <-> 1300Hz)
      let high = false;
      this.intervalId = setInterval(() => {
        if (!this.ctx || !this.oscillator || !this.isPlaying) return;
        const targetFreq = high ? 850 : 1250;
        this.oscillator.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.3);
        high = !high;
      }, 400);

    } catch (err) {
      console.warn('Audio siren start failed (requires user gesture):', err);
    }
  }

  public stopSiren() {
    if (!this.isPlaying) return;

    try {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      this.isPlaying = false;
    } catch (err) {
      console.warn('Error stopping siren:', err);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSiren();
    }
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioSiren = new AudioSirenService();
