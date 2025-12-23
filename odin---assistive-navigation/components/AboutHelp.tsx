
import React, { useEffect, useState } from 'react';
import { voiceService } from '../services/voiceService';
import { speechService } from '../services/speechService';
import { hapticService } from '../services/hapticService';

interface SubPageProps {
  onBack?: () => void;
  onRevisitGuide?: () => void;
}

const COMMAND_LIST = [
  { cat: 'Sensing', cmds: ['Initialize', 'Start Scan', 'Vision', 'Stop', 'Terminate'] },
  { cat: 'Assistant', cmds: ['Ask', 'Tell Didi', 'Chat', 'Didi'] },
  { cat: 'Navigation', cmds: ['Search for...', 'Go to...', 'Maps', 'Navigation'] },
  { cat: 'System', cmds: ['Louder', 'Quieter', 'Faster', 'Slower', 'Settings', 'Feedback', 'Help', 'Support'] }
];

export const AboutUs: React.FC<SubPageProps> = ({ onBack }) => {
  return (
    <div className="h-full bg-white p-6 space-y-6 overflow-y-auto pb-32">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project ODIN</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Neural Obstacle Engine v3.1</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
             </svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-5 bg-slate-50 rounded-[28px] space-y-2 border border-slate-100">
          <h3 className="text-sm font-black text-blue-600 uppercase">Vision Array</h3>
          <p className="text-slate-600 font-bold text-[11px] leading-relaxed">
            Utilizes mobile-optimized computer vision with 92-96% accuracy for barrier detection, stairs, and overhead hazards.
          </p>
        </div>
        <div className="p-5 bg-slate-50 rounded-[28px] space-y-2 border border-slate-100">
          <h3 className="text-sm font-black text-blue-600 uppercase">Sensor Fusion</h3>
          <p className="text-slate-600 font-bold text-[11px] leading-relaxed">
            Cross-validates visual inputs with sound sensing and ultrasonic data to navigate transparent surfaces and low-light zones.
          </p>
        </div>
        <div className="p-5 bg-slate-50 rounded-[28px] space-y-2 border border-slate-100">
          <h3 className="text-sm font-black text-blue-600 uppercase">Priority Logic</h3>
          <p className="text-slate-600 font-bold text-[11px] leading-relaxed">
            Multi-modal feedback system uses spatial audio and adaptive haptics to signal urgency (&lt;1m danger).
          </p>
        </div>
      </div>
    </div>
  );
};

export const HelpCenter: React.FC<SubPageProps> = ({ onBack, onRevisitGuide }) => {
  const [isListening, setIsListening] = useState(false);

  // Read contents on mount
  useEffect(() => {
    let message = "Help Center opened. You can use the following voice commands by saying ODIN followed by the keyword. ";
    COMMAND_LIST.forEach(cat => {
      message += `${cat.cat} keywords are: ${cat.cmds.join(", ")}. `;
    });
    message += "You can also say CALL EMERGENCY or EMAIL SUPPORT.";
    speechService.speak(message);
  }, []);

  const handleVoiceHelp = async () => {
    try {
      setIsListening(true);
      hapticService.vibrate('low');
      speechService.speak("Listening for support command.");
      const text = await voiceService.listenForPhrase();
      const cmd = text.toLowerCase();
      
      if (cmd.includes('guide') || cmd.includes('tutorial') || cmd.includes('walkthrough')) {
        onRevisitGuide?.();
      } else if (cmd.includes('call') || cmd.includes('emergency')) {
        window.location.href = 'tel:+18006346243';
      } else if (cmd.includes('email') || cmd.includes('support')) {
        window.location.href = 'mailto:support@odin-assist.ai';
      } else if (cmd.includes('back')) {
        onBack?.();
      } else {
        speechService.speak(`Command not recognized.`);
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Help Center</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Support & Resources</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
             </svg>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleVoiceHelp}
          className={`w-16 h-16 rounded-[22px] shadow-xl flex items-center justify-center transition-all active:scale-90 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-blue-600 border border-blue-50'}`}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase px-2 tracking-[0.2em]">Voice Commands (Say "ODIN...")</h2>
        <div className="grid grid-cols-1 gap-3">
          {COMMAND_LIST.map(cat => (
            <div key={cat.cat} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm space-y-2">
              <span className="text-[7px] font-black uppercase text-blue-600 tracking-widest">{cat.cat}</span>
              <div className="flex flex-wrap gap-2">
                {cat.cmds.map(c => (
                  <span key={c} className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase px-2 tracking-[0.2em]">Training</h2>
        <button 
          onClick={onRevisitGuide}
          className="w-full p-6 bg-white border border-slate-100 rounded-[32px] flex items-center justify-between shadow-sm active:scale-95 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Tutorial</div>
              <div className="text-sm font-black uppercase tracking-tight text-slate-900">Revisit Guide</div>
            </div>
          </div>
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase px-2 tracking-[0.2em]">Immediate Links</h2>
        <a href="mailto:support@odin-assist.ai" className="p-5 bg-white border border-slate-100 rounded-[32px] flex items-center gap-5 active:scale-95 transition-all shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Electronic Mail</div>
            <div className="text-[12px] font-black text-slate-900 uppercase">support@odin-assist.ai</div>
          </div>
        </a>

        <a href="tel:+18006346243" className="p-5 bg-white border border-slate-100 rounded-[32px] flex items-center gap-5 active:scale-95 transition-all shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Hotline</div>
            <div className="text-[12px] font-black text-slate-900 uppercase">+1 (800) ODIN-AID</div>
          </div>
        </a>
      </div>

      <div className="text-center pt-6">
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">ODIN NEURAL SUPPORT LINK</p>
      </div>
    </div>
  );
};
