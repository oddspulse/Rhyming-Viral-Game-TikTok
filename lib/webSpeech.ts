/**
 * Web Speech API integration for browser-based speech recognition
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class WebSpeechRecognition {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResult?: (result: SpeechRecognitionResult) => void;
  private onEnd?: () => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          const last = event.results.length - 1;
          const result = event.results[last];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          const isFinal = result.isFinal;

          if (this.onResult) {
            this.onResult({ transcript, confidence, isFinal });
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onEnd) {
            this.onEnd();
          }
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          this.isListening = false;
        };
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  start(
    onResult: (result: SpeechRecognitionResult) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      console.warn('Web Speech API not supported');
      return false;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return false;
    }

    this.onResult = onResult;
    this.onEnd = onEnd;

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isActive(): boolean {
    return this.isListening;
  }
}

// Singleton instance
export const webSpeechRecognition = new WebSpeechRecognition();
