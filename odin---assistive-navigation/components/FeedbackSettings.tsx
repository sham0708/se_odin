
import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { hapticService } from '../services/hapticService';
import { voiceService } from '../services/voiceService';
import { speechService } from '../services/speechService';

interface Props {
  prefs: UserPreferences;
  setPrefs: (p: UserPreferences) => void;
  onRevisitGuide: () => void;
  onBack: () => void;
}

export const FeedbackSettings: React.FC<Props> = ({ prefs, setPrefs, onRevisitGuide, onBack }) => {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceConfig = async () => {
    try {
      setIsListening(true);
      hapticService.vibrate('low');
      speechService.speak("Listening for configuration command.");
      const text = await voiceService.listenForPhrase();
      const cmd = text.toLowerCase();
      
      if (cmd.includes('increase volume')) {
        setPrefs({ ...prefs, voiceVolume: Math.min(1, prefs.voiceVolume + 0.2) });
        speechService.speak("Increasing volume.");
      } else if (cmd.includes('decrease volume')) {
        setPrefs({ ...prefs, voiceVolume: Math.max(0, prefs.voiceVolume - 0.2) });
        speechService.speak("Decreasing volume.");
      } else if (cmd.includes('faster') || cmd.includes('increase speed')) {
        setPrefs({ ...prefs, voiceRate: Math.min(2, prefs.voiceRate + 0.2) });
        speechService.speak("Increasing pace.");
      } else if (cmd.includes('slower') || cmd.includes('decrease speed')) {
        setPrefs({ ...prefs, voiceRate: Math.max(0.5, prefs.voiceRate - 0.2) });
        speechService.speak("Decreasing pace.");
      } else if (cmd.includes('high') || cmd.includes('medium') || cmd.includes('low')) {
         if (cmd.includes('vibration')) {
            const level = cmd.includes('high') ? 'high' : cmd.includes('medium') ? 'medium' : 'low';
            setPrefs({ ...prefs, hapticIntensity: level as any });
            speechService.speak(`Vibration set to ${level}.`);
         }
      } else {
        speechService.speak(`Command ${text} not recognized for settings.`);
      }
      setIsListening(false);
    } catch (e) {
      setIsListening(false);
      speechService.speak("Sorry, I didn't catch that.");
    }
  };

  return (
    <div className="h-full bg-slate-50 p-6 space-y-8 overflow-y-auto pb-32">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Adjust assistant parameters</p>
        </div>
        <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 active:scale-90 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleVoiceConfig}
          className={`w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-90 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-blue-600 border border-blue-100'}`}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      <section className="bg-white rounded-[32px] p-8 space-y-8 shadow-sm border border-slate-100">
        <h2 className="text-sm font-black uppercase text-blue-600 tracking-widest flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          Speech Engine
        </h2>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Volume</span>
              <span className="text-lg font-black text-slate-900">{Math.round(prefs.voiceVolume * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.1" value={prefs.voiceVolume}
              onChange={(e) => setPrefs({ ...prefs, voiceVolume: parseFloat(e.target.value) })}
              className="w-full h-2 accent-blue-600 bg-slate-100 rounded-full appearance-none outline-none"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pace</span>
              <span className="text-lg font-black text-slate-900">{prefs.voiceRate}x</span>
            </div>
            <input 
              type="range" min="0.5" max="2" step="0.1" value={prefs.voiceRate}
              onChange={(e) => setPrefs({ ...prefs, voiceRate: parseFloat(e.target.value) })}
              className="w-full h-2 accent-blue-600 bg-slate-100 rounded-full appearance-none outline-none"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest px-2">Vibration Feedback</h2>
        <div className="grid grid-cols-2 gap-3">
          {(['off', 'low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              onClick={() => { setPrefs({ ...prefs, hapticIntensity: level }); hapticService.vibrate(level); }}
              className={`py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${
                prefs.hapticIntensity === level 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                : 'bg-white text-slate-400 border border-slate-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      <div className="text-center pt-6">
        <button onClick={onBack} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
