
export enum AppState {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  SCANNING = 'SCANNING',
  MAP = 'MAP',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT',
  HELP = 'HELP',
  FEEDBACK = 'FEEDBACK'
}

export interface Obstacle {
  id: string;
  label: string;
  distance: number;
  direction: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  timestamp: number;
}

export interface UserPreferences {
  voiceVolume: number;
  voiceRate: number;
  hapticIntensity: 'off' | 'low' | 'medium' | 'high';
  alertThreshold: number;
  highContrast: boolean;
  environmentalProfile: 'indoor' | 'outdoor' | 'crowded' | 'night';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
