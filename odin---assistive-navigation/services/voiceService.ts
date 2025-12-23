
export type VoiceCommandCallback = (command: string) => void;
export type SpeechDetectionCallback = () => void;

class VoiceService {
  private recognition: any = null;
  private globalRec: any = null;
  private isProcessing: boolean = false;
  private isListeningForPhrase: boolean = false;
  private onSpeechDetected: SpeechDetectionCallback | null = null;
  private restartTimeout: number | null = null;
  private onCommandCallback: VoiceCommandCallback | null = null;
  private isActive: boolean = false;

  constructor() {
    this.initSingleRec();
  }

  private initSingleRec() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  public setOnSpeechDetected(cb: SpeechDetectionCallback) {
    this.onSpeechDetected = cb;
  }

  public async listenForPhrase(): Promise<string> {
    if (!this.recognition) return Promise.reject('Speech recognition not supported');
    if (this.isProcessing) return Promise.resolve('');

    this.isProcessing = true;
    this.isListeningForPhrase = true;

    // Temporarily pause global listener to avoid collision
    await this.stopGlobalListenerAsync();

    return new Promise((resolve) => {
      this.recognition.onstart = () => console.debug('VoiceService: Capturing individual phrase...');
      this.recognition.onresult = (event: any) => resolve(event.results[0][0].transcript);
      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('VoiceService Single Phrase Error:', event.error);
        }
        resolve('');
      };
      this.recognition.onend = () => {
        this.isListeningForPhrase = false;
        this.isProcessing = false;
        // Resume background sensing
        setTimeout(() => this.resumeGlobalListener(), 400);
      };

      try {
        this.recognition.start();
      } catch (e) {
        this.isListeningForPhrase = false;
        this.isProcessing = false;
        this.resumeGlobalListener();
        resolve('');
      }
    });
  }

  private async stopGlobalListenerAsync(): Promise<void> {
    if (!this.globalRec) return;
    return new Promise((resolve) => {
      const timeout = setTimeout(resolve, 500);
      this.globalRec.onend = () => {
        clearTimeout(timeout);
        resolve();
      };
      try {
        this.globalRec.stop();
      } catch (e) {
        resolve();
      }
    });
  }

  private resumeGlobalListener() {
    if (this.globalRec && !this.isListeningForPhrase && !this.isProcessing && this.isActive) {
      try {
        this.globalRec.start();
      } catch (e) {
        // Recognition might already be running
      }
    }
  }

  public startGlobalListener(onCommand: VoiceCommandCallback) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    // Security check: Web Speech API continuous mode requires HTTPS on most browsers
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn("Voice commands might be restricted over non-HTTPS connections.");
    }

    this.onCommandCallback = onCommand;
    this.isActive = true;

    if (this.globalRec) return;

    this.globalRec = new SpeechRecognition();
    this.globalRec.continuous = true;
    this.globalRec.interimResults = true;
    this.globalRec.lang = 'en-US';

    this.globalRec.onresult = (event: any) => {
      if (this.onSpeechDetected) this.onSpeechDetected();
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          console.debug('ODIN Final Transcript:', transcript);
          if (this.onCommandCallback) this.onCommandCallback(transcript);
        }
      }
    };

    this.globalRec.onend = () => {
      // Auto-restart if we are still supposed to be active
      if (this.isActive && !this.isListeningForPhrase && !this.isProcessing) {
        if (this.restartTimeout) window.clearTimeout(this.restartTimeout);
        this.restartTimeout = window.setTimeout(() => {
          if (this.isActive && !this.isListeningForPhrase && !this.isProcessing) {
            try {
              this.globalRec.start();
            } catch (e) {}
          }
        }, 300);
      }
    };

    this.globalRec.onerror = (event: any) => {
      // Handle common errors like 'network' or 'no-speech' gracefully to prevent service death
      if (event.error === 'aborted' || event.error === 'not-allowed') {
        this.isActive = false;
        return;
      }
      console.debug('ODIN Sensing Error:', event.error);
    };

    try {
      this.globalRec.start();
    } catch (e) {
      console.error('VoiceService: Failed to start global listener.', e);
    }
  }

  public stopGlobalListener() {
    this.isActive = false;
    if (this.globalRec) {
      try {
        this.globalRec.stop();
        this.globalRec = null;
      } catch (e) {}
    }
  }
}

export const voiceService = new VoiceService();
