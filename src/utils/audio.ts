// Clean, safe Web Audio API synthesizer for ambient Buddhist temple atmospheres and wind chimes.
class AmbientSynth {
  private ctx: AudioContext | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private chimeTimer: any = null;
  private isSynthesizing: boolean = false;

  constructor() {
    // Lazy loaded on user interaction to comply with browser safety rules
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass filter for warm temple drone
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(350, this.ctx.currentTime);
      this.filter.connect(this.masterGain);
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  public start() {
    this.init();
    if (!this.ctx || this.isSynthesizing) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      this.isSynthesizing = true;
      const t = this.ctx.currentTime;

      // Master fade in
      this.masterGain!.gain.cancelScheduledValues(t);
      this.masterGain!.gain.setValueAtTime(0, t);
      this.masterGain!.gain.linearRampToValueAtTime(0.35, t + 2.0);

      // 1. Create a warm twin-oscillator donor drone (C2 + G2 chords)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'triangle';
      this.droneOsc1.frequency.setValueAtTime(65.41, t); // C2

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(98.00, t); // G2 (Fifth chord)

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.08, t);

      this.droneOsc1.connect(this.droneGain);
      this.droneOsc2.connect(this.droneGain);
      this.droneGain.connect(this.filter!);

      this.droneOsc1.start(t);
      this.droneOsc2.start(t);

      // 2. Start periodic random wind chimes
      this.scheduleNextChime();
    } catch (err) {
      console.error("Failed to start sound synthesizer", err);
    }
  }

  public stop() {
    if (!this.ctx || !this.isSynthesizing) return;
    
    try {
      const t = this.ctx.currentTime;
      this.masterGain!.gain.cancelScheduledValues(t);
      this.masterGain!.gain.setValueAtTime(this.masterGain!.gain.value, t);
      this.masterGain!.gain.linearRampToValueAtTime(0, t + 1.2);

      setTimeout(() => {
        if (!this.isSynthesizing) {
          this.cleanup();
        }
      }, 1300);

      if (this.chimeTimer) {
        clearTimeout(this.chimeTimer);
        this.chimeTimer = null;
      }
      this.isSynthesizing = false;
    } catch (e) {
      this.cleanup();
      this.isSynthesizing = false;
    }
  }

  private cleanup() {
    try {
      if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); this.droneOsc1 = null; }
      if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); this.droneOsc2 = null; }
      if (this.droneGain) { this.droneGain.disconnect(); this.droneGain = null; }
    } catch (e) {}
  }

  private scheduleNextChime() {
    if (!this.isSynthesizing) return;
    const delay = 4000 + Math.random() * 5000; // between 4 and 9 seconds
    this.chimeTimer = setTimeout(() => {
      this.playWindChime();
      this.scheduleNextChime();
    }, delay);
  }

  public playWindChime() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const t = this.ctx.currentTime;
      // Synthesize a chime: cluster of high metallic sine frequencies
      // Bell/chime harmonics: Fundamental + multiples
      // Pick a random base pitch for variation
      const baseFreq = 800 + Math.random() * 600; 
      const frequencies = [baseFreq, baseFreq * 1.2, baseFreq * 1.5, baseFreq * 1.9, baseFreq * 2.3];
      
      frequencies.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        
        // Slightly detune to give a sparkling, rich metallic beating chime sound
        osc.detune.setValueAtTime((Math.random() * 15) - 7.5, t);

        const volume = (0.02 / (idx + 1)) * (0.8 + Math.random() * 0.4);
        gain.gain.setValueAtTime(0, t);
        // Instant strike, slow metallic ring decay
        gain.gain.linearRampToValueAtTime(volume, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.00001, t + 2.5 + Math.random() * 1.5);

        osc.connect(gain);
        // Connect chimes to master path
        gain.connect(this.masterGain || this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 4.5);
      });
    } catch (e) {
      console.warn("Could not play chime", e);
    }
  }
}

export const ambientSynth = new AmbientSynth();
