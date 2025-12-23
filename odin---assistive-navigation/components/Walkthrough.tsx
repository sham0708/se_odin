
import React, { useState, useEffect } from 'react';
import { speechService } from '../services/speechService';

interface GuideStep {
  targetId: string;
  title: string;
  description: string;
}

const steps: GuideStep[] = [
  { 
    targetId: 'scan-button', 
    title: 'Always Listening', 
    description: 'Use the word ODIN followed by "INITIALIZE", "START SCAN", or "VISION" to begin monitoring. Say "STOP" or "TERMINATE" to end your session. I am always sensing for your voice.' 
  },
  { 
    targetId: 'nav-map', 
    title: 'Smart Search', 
    description: 'Trigger navigation by saying "ODIN, SEARCH FOR" or "GO TO" followed by your destination. You can also say "MAPS", "NAVIGATION", or "DIRECTIONS" to open this view.' 
  },
  { 
    targetId: 'nav-chat', 
    title: 'Hands-Free Didi', 
    description: 'Ask questions by saying "ODIN, ASK DIDI" or "TELL DIDI". You can also simply say "CHAT" or "DIDI" to switch to the assistant view instantly.' 
  },
  { 
    targetId: 'nav-settings', 
    title: 'System Control', 
    description: 'Adjust your experience with commands like "ODIN, LOUDER", "QUIETER", "FASTER", or "SLOWER". Say "SETTINGS" or "PERSONALIZE" to open the configuration dashboard.' 
  },
  { 
    targetId: 'nav-help', 
    title: 'Help Center', 
    description: 'Need assistance? Say "ODIN, HELP" or "SUPPORT" to open this menu and hear the list of commands again.' 
  }
];

interface Props {
  onClose: () => void;
}

export const Walkthrough: React.FC<Props> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState<number | null>(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (activeStep !== null) {
      const step = steps[activeStep];
      const element = document.getElementById(step.targetId);
      if (element) {
        setHighlightRect(element.getBoundingClientRect());
      }
      speechService.speak(`${step.title}. ${step.description}`, true);
    }
  }, [activeStep]);

  const next = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeStep === null) return;
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setActiveStep(null);
      speechService.speak("Guide complete. Say ODIN to begin.");
      onClose();
    }
  };

  if (activeStep === null || !highlightRect) return null;

  const isBottom = highlightRect.top < window.innerHeight / 2;

  return (
    <div className="fixed inset-0 z-[1000] cursor-pointer" onClick={() => next()}>
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] transition-all duration-500" />
      <div 
        className="absolute bg-transparent ring-[4000px] ring-slate-950/80 rounded-[32px] pointer-events-none border-2 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.4)] transition-all duration-500"
        style={{ width: highlightRect.width + 12, height: highlightRect.height + 12, left: highlightRect.left - 6, top: highlightRect.top - 6 }}
      />
      <div 
        className="absolute z-[1001] p-6 bg-white text-slate-900 rounded-[28px] shadow-2xl pointer-events-none w-[260px] border border-blue-100 animate-in zoom-in slide-in-from-bottom-4 duration-300"
        style={{ 
          left: Math.max(20, Math.min(window.innerWidth - 280, highlightRect.left - 20)), 
          top: isBottom ? highlightRect.bottom + 24 : highlightRect.top - 200 
        }}
      >
        <div className="relative space-y-4">
          <div className={`absolute ${isBottom ? '-top-8' : '-bottom-8'} left-8 w-4 h-4 bg-white rotate-45 border-t border-l border-blue-100 hidden sm:block`} />
          <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[7px] font-black uppercase tracking-widest w-fit">STEP {activeStep + 1} / {steps.length}</div>
          <div className="space-y-2">
            <h3 className="text-lg font-black uppercase leading-tight text-blue-600 tracking-tight">{steps[activeStep].title}</h3>
            <p className="text-[11px] font-bold leading-relaxed text-slate-500">{steps[activeStep].description}</p>
          </div>
          <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-slate-300">
            <span>Progressing</span>
            <span className="animate-pulse">Tap to continue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
