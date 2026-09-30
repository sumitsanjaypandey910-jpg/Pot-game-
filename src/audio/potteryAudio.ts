class PotteryAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  
  // Wheel sound nodes
  private wheelOsc: OscillatorNode | null = null;
  private wheelGain: GainNode | null = null;
  
  // Clay friction nodes
  private frictionNoise: AudioBufferSourceNode | null = null;
  private frictionGain: GainNode | null = null;
  private frictionFilter: BiquadFilterNode | null = null;
  private isFrictionPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      if (this.wheelGain) this.wheelGain.gain.value = 0;
      if (this.frictionGain) this.frictionGain.gain.value = 0;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Wheel hum sound adjusted by RPM
  public setWheelSpeed(rpm: number) {
    if (this.isMuted || rpm <= 0) {
      if (this.wheelGain && this.ctx) {
        this.wheelGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
      }
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    if (!this.wheelOsc) {
      this.wheelOsc = this.ctx.createOscillator();
      this.wheelOsc.type = 'triangle';
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;

      this.wheelGain = this.ctx.createGain();
      this.wheelGain.gain.value = 0.04;

      this.wheelOsc.connect(filter);
      filter.connect(this.wheelGain);
      this.wheelGain.connect(this.ctx.destination);
      this.wheelOsc.start();
    }

    // Map RPM (e.g. 60 - 240) to frequency (e.g. 45Hz - 85Hz)
    const targetFreq = 35 + (rpm / 240) * 45;
    const targetVol = 0.02 + (rpm / 240) * 0.05;

    this.wheelOsc.frequency.cancelScheduledValues(this.ctx.currentTime);
    this.wheelOsc.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.15);

    if (this.wheelGain) {
      this.wheelGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.wheelGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.15);
    }
  }

  // Friction sound when finger touches wet rotating clay
  public startClayFriction(intensity: number = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (!this.isFrictionPlaying) {
      // Create continuous noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink-ish noise filter
        lastOut = (lastOut + 0.03 * white) / 1.03;
        data[i] = lastOut * 3.5;
      }

      this.frictionNoise = this.ctx.createBufferSource();
      this.frictionNoise.buffer = buffer;
      this.frictionNoise.loop = true;

      this.frictionFilter = this.ctx.createBiquadFilter();
      this.frictionFilter.type = 'bandpass';
      this.frictionFilter.frequency.value = 450;
      this.frictionFilter.Q.value = 2.2;

      this.frictionGain = this.ctx.createGain();
      this.frictionGain.gain.value = 0;

      this.frictionNoise.connect(this.frictionFilter);
      this.frictionFilter.connect(this.frictionGain);
      this.frictionGain.connect(this.ctx.destination);

      this.frictionNoise.start();
      this.isFrictionPlaying = true;
    }

    if (this.frictionGain && this.frictionFilter && this.ctx) {
      const vol = Math.min(0.14, 0.04 + intensity * 0.08);
      const freq = 320 + intensity * 380;
      this.frictionGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.08);
      this.frictionFilter.frequency.linearRampToValueAtTime(freq, this.ctx.currentTime + 0.08);
    }
  }

  public updateClayFriction(intensity: number) {
    if (this.isMuted || !this.isFrictionPlaying || !this.frictionGain || !this.frictionFilter || !this.ctx) return;
    const vol = Math.min(0.14, 0.04 + intensity * 0.08);
    const freq = 320 + intensity * 380;
    this.frictionGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.frictionGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.05);
    this.frictionFilter.frequency.linearRampToValueAtTime(freq, this.ctx.currentTime + 0.05);
  }

  public stopClayFriction() {
    if (this.frictionGain && this.ctx) {
      this.frictionGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.frictionGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    }
  }

  // Play sponge water squish sound
  public playSpongeSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // Play ceramic bell / chime on milestone
  public playChime(note: number = 880) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.8);
  }

  // Kiln crackle sound during firing
  public playKilnRoar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(450, this.ctx.currentTime + 1.2);
    filter.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 2.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 1.0);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 2.5);
  }

  // Gentle tactile click for buttons
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

export const potteryAudio = new PotteryAudioManager();
