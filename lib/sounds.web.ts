/**
 * Web-compatible sound manager using Web Audio API
 */

class SoundManager {
  private isEnabled: boolean = true;
  private audioContext: AudioContext | null = null;

  async init() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private playBeep(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  async playTick() {
    this.playBeep(800, 0.05, 0.2);
  }

  async playSuccess() {
    this.playBeep(1200, 0.15, 0.3);
    setTimeout(() => this.playBeep(1600, 0.15, 0.3), 100);
  }

  async playTap() {
    this.playBeep(600, 0.03, 0.15);
  }

  async cleanup() {
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const soundManager = new SoundManager();
