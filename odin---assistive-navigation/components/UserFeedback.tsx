
import React, { useState } from 'react';
import { speechService } from '../services/speechService';
import { voiceService } from '../services/voiceService';
import { hapticService } from '../services/hapticService';

interface Props {
  onBack: () => void;
}

export const UserFeedback: React.FC<Props> = ({ onBack }) => {
  const [feedback, setFeedback] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ratings, setRatings] = useState({
    satisfaction: 3,
    accuracy: 3,
    ease: 3
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitted(true);
    speechService.speak("Feedback transmitted. Calibration updated. Thank you for your contribution.");
    setTimeout(() => {
      setFeedback('');
      setRatings({ satisfaction: 3, accuracy: 3, ease: 3 });
      setSubmitted(false);
    }, 3000);
  };

  const handleVoiceFeedback = async () => {
    try {
      setIsListening(true);
      hapticService.vibrate('low');
      speechService.speak("Listening for rating or feedback.");
      const text = await voiceService.listenForPhrase();
      const cmd = text.toLowerCase();
      
      if (cmd.includes('submit') || cmd.includes('send') || cmd.includes('transmit')) {
        handleSubmit();
      } else if (cmd.includes('rating') || cmd.includes('set')) {
        // Simple logic for setting ratings via voice e.g. "set satisfaction to five"
        if (cmd.includes('satisfaction')) {
          const match = cmd.match(/\d/);
          if (match) setRatings(r => ({ ...r, satisfaction: parseInt(match[0]) }));
          speechService.speak("Satisfaction updated.");
        }
      } else {
        setFeedback(prev => prev + " " + text);
        speechService.speak("Feedback text updated.");
      }
      setIsListening(false);
    } catch (e) {
      setIsListening(false);
      speechService.speak("Sorry, I didn't catch that.");
    }
  };

  const RatingField = ({ label, value, field }: { label: string, value: number, field: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <span className="text-xs font-black text-blue-600">{value}/5</span>
      </div>
      <input 
        type="range" min="1" max="5" step="1"
        value={value}
        onChange={(e) => setRatings({ ...ratings, [field]: parseInt(e.target.value) })}
        className="w-full h-1.5 accent-blue-600 bg-slate-200 rounded-full appearance-none outline-none cursor-pointer"
      />
      <div className="flex justify-between px-1 text-[8px] font-bold text-slate-300 uppercase">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-slate-50 p-6 flex flex-col overflow-y-auto pb-32">
      <div className="relative pt-4">
        <button onClick={onBack} className="absolute left-0 top-6 p-3 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 active:scale-90 transition-all z-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-100 rounded-[24px] mx-auto flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5h2M11 9h2M11 13h2M11 17h2M7 5h2M7 9h2M7 13h2M7 17h2M15 5h2M15 9h2M15 13h2M15 17h2" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">User Feedback</h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Calibration & Quality Metrics</p>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button 
          onClick={handleVoiceFeedback}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${isListening ? 'bg-red-600 animate-pulse text-white' : 'bg-white text-blue-600 border border-blue-100'}`}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      {submitted ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-[40px] text-center w-full max-w-sm shadow-xl border border-green-100 space-y-4 animate-bounce">
            <div className="w-12 h-12 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="block font-black uppercase tracking-widest text-sm text-slate-800">Transmitted</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-10">
          <div className="space-y-8 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <RatingField label="Overall Satisfaction" value={ratings.satisfaction} field="satisfaction" />
            <RatingField label="Detection Accuracy" value={ratings.accuracy} field="accuracy" />
            <RatingField label="Ease of Navigation" value={ratings.ease} field="ease" />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase px-4 tracking-widest">Observations</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Report specific environmental challenges or neural hallucinations..."
              className="w-full h-32 bg-white border border-slate-100 rounded-[24px] p-6 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all"
          >
            Submit Transmission
          </button>
        </form>
      )}
    </div>
  );
};
