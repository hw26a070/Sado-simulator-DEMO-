/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Sound Generator for ASMR Tea Ceremony Sounds

class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ① すくい (Bamboo scraping/scooping powder)
  // White noise with a lowpass filter and a sweep up/down
  playScoop() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Noise source
      const bufferSize = this.ctx.sampleRate * 0.4; // 0.4s
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 5.0;
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(750, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {
      console.warn('Scoop sound error', e);
    }
  }

  // ② 落とし (Powder falling)
  // Low-frequency noise puff
  playPowderDrop() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {
      console.warn('Powder drop sound error', e);
    }
  }

  // ③ お湯 (Water pouring with pitch drop!)
  private waterPouringSource: AudioWorkletNode | ScriptProcessorNode | null = null;
  private waterFilter: BiquadFilterNode | null = null;
  private waterGain: GainNode | null = null;

  startWaterPour() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Create continuous noise
      const bufferSize = 4096;
      const scriptNode = this.ctx.createScriptProcessor(bufferSize, 0, 1);
      scriptNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      };

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 6.0;
      // Start with a high frequency pitch for thin stream
      filter.frequency.setValueAtTime(1400, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.2); // Fade in

      scriptNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      this.waterPouringSource = scriptNode;
      this.waterFilter = filter;
      this.waterGain = gain;
    } catch (e) {
      console.warn('Water start error', e);
    }
  }

  updateWaterPour(levelPercent: number) {
    if (!this.ctx || !this.waterFilter || !this.waterGain) return;
    const now = this.ctx.currentTime;
    // As the cup fills, resonance frequency drops (from 1400Hz to 600Hz)
    const targetFreq = 1400 - (levelPercent / 100) * 800;
    this.waterFilter.frequency.setTargetAtTime(targetFreq, now, 0.1);

    // Make the sound slightly fuller and softer
    this.waterFilter.Q.setTargetAtTime(6.0 - (levelPercent / 100) * 3, now, 0.1);
  }

  stopWaterPour() {
    try {
      if (!this.ctx || !this.waterPouringSource) return;
      const now = this.ctx.currentTime;
      if (this.waterGain) {
        this.waterGain.gain.setValueAtTime(this.waterGain.gain.value, now);
        this.waterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      }
      const node = this.waterPouringSource;
      setTimeout(() => {
        try {
          node.disconnect();
        } catch (_) {}
      }, 200);
      this.waterPouringSource = null;
      this.waterFilter = null;
      this.waterGain = null;
    } catch (e) {
      console.warn('Water stop error', e);
    }
  }

  // ④ 茶筅シャカシャカ (Whisking brush)
  // Short swish noise
  playWhiskStroke(speedFactor: number = 1.0) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const duration = 0.15 / speedFactor;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 4.0;
      // Sloshing frequency around 500-900Hz
      filter.frequency.setValueAtTime(600 + Math.random() * 200, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06 * Math.min(speedFactor, 1.8), now + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {
      console.warn('Whisk stroke error', e);
    }
  }

  // ⑤ 泡潰し (Bubble popping)
  // Tiny high pitch snap
  playBubblePop() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800 + Math.random() * 600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Bubble pop error', e);
    }
  }

  // ⑥ コトッ (Bowl placement / Rotation)
  // Low gentle thud
  playThud() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.03, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      // Add a bit of friction noise
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);

      const mainGain = this.ctx.createGain();
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(mainGain);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(mainGain);

      mainGain.connect(this.ctx.destination);

      osc.start(now);
      noise.start(now);

      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Thud sound error', e);
    }
  }

  // ⑦ スゥー (Slide / Serve)
  // Soft carpet slide friction sound
  playSlide() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 0.5; // 0.5s slide
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {
      console.warn('Slide sound error', e);
    }
  }

  // Beautiful success chime (for SSS/S rank)
  playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gainNode.gain.setValueAtTime(0, now + idx * 0.08);
        gainNode.gain.linearRampToValueAtTime(0.03, now + idx * 0.08 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);

        osc.connect(gainNode);
        gainNode.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.9);
      });
    } catch (e) {
      console.warn('Chime sound error', e);
    }
  }
}

export const audio = new SoundEngine();
export default audio;
