
class SpeechService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private volume: number = 1.0;
  private rate: number = 1.0;
  private lastText: string = "";
  private lastTime: number = 0;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    const voices = this.synth.getVoices();
    // Prioritize natural sounding high-quality voices for better comprehension while moving
    const preferredVoices = [
      'google us english', 
      'en-us-x-sfg-local', 
      'samantha', 
      'victoria', 
      'karen', 
      'natural'
    ];
    
    this.voice = voices.find(v => 
      preferredVoices.some(pv => v.name.toLowerCase().includes(pv))
    ) || voices[0];
  }

  public speak(text: string, priority: boolean = false) {
    const now = Date.now();
    
    // In motion, we prioritize recent info. If new audio comes in, cancel pending queue to keep it real-time.
    // However, we still avoid identical repeats within 2 seconds unless priority.
    if (!priority && text === this.lastText && now - this.lastTime < 2000) {
      return;
    }

    // Always cancel current speech if priority (danger) or if it's been a while (update lag prevention)
    if (priority || now - this.lastTime > 1000) {
      this.synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.volume = this.volume;
    utterance.rate = priority ? Math.min(this.rate * 1.2, 2.0) : this.rate; // Speak faster if priority
    
    this.synth.speak(utterance);
    
    this.lastText = text;
    this.lastTime = now;
  }

  public setConfig(volume: number, rate: number) {
    this.volume = volume;
    this.rate = rate;
  }
}

export const speechService = new SpeechService();
