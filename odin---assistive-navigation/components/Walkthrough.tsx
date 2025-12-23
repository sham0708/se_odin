
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
    title: 'Hands-Free Muninn', 
    description: 'Ask questions by saying "ODIN, ASK MUNINN" or "TELL MUNINN". You can also simply say "CHAT" or "MUNINN" to switch to the assistant view instantly.' 
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
      {/* 
        Clearer Highlight Strategy:
        We remove the full-screen backdrop-blur div entirely to ensure 
        the highlighted feature is 100% sharp. 
      */}
      
      {/* 
        Spotlight Overlay:
        Using a huge ring to dim the rest of the screen while keeping the 
        center (the feature) perfectly clear and un-shadowed.
      */}
      <div 
        className="absolute bg-transparent ring-[4000px] ring-slate-900/60 rounded-[24px] pointer-events-none border-2 border-blue-400/50 shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500 z-[1001]"
        style={{ 
          width: highlightRect.width + 12, 
          height: highlightRect.height + 12, 
          left: highlightRect.left - 6, 
          top: highlightRect.top - 6 
        }}
      />

      {/* 
        Transparent Floating Box (Ultra-Glassmorphism):
        Using higher transparency (white/30) and strong backdrop blur for the box itself 
        without affecting the feature.
      */}
      <div 
        className="absolute z-[1002] p-6 bg-white/30 backdrop-blur-2xl text-slate-900 rounded-[32px] shadow-2xl pointer-events-none w-[280px] border border-white/40 animate-in zoom-in slide-in-from-bottom-4 duration-500"
        style={{ 
          left: Math.max(20, Math.min(window.innerWidth - 300, highlightRect.left - 20)), 
          top: isBottom ? highlightRect.bottom + 40 : highlightRect.top - 260 
        }}
      >
        <div className="relative space-y-4">
          <div className="flex justify-between items-center">
            <div className="px-3 py-1 bg-blue-600/60 backdrop-blur-md text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] w-fit shadow-lg">
              STEP {activeStep + 1} OF {steps.length}
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase leading-tight text-slate-900 tracking-tight">
              {steps[activeStep].title}
            </h3>
            <p className="text-[12px] font-bold leading-relaxed text-slate-800 drop-shadow-sm">
              {steps[activeStep].description}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-900/10 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-blue-700">
            <span className="opacity-60">System Ready</span>
            <span className="animate-pulse">Tap to continue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
