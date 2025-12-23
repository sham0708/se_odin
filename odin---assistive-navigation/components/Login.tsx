
import React, { useState } from 'react';
import { Icons } from '../constants';
import { speechService } from '../services/speechService';

interface Props {
  onLogin: () => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Explicitly speak to unlock the speech synthesis context on user gesture
    speechService.speak("Authenticating neural link...");
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  const handleForgot = () => {
    setShowForgot(true);
    speechService.speak("Recovery link sent. Check your email.");
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 z-[100] overflow-hidden">
      <div className="w-full max-w-[320px] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl border border-slate-100 p-3">
            <Icons.Logo className="w-12 h-12 text-blue-600" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">ODIN</h1>
            <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-[8px] opacity-70">Visual Neural Link</p>
          </div>
        </div>

        {showForgot ? (
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-50 space-y-6 animate-in zoom-in duration-300">
            <h2 className="text-sm font-black text-slate-900 uppercase text-center">Account Recovery</h2>
            <p className="text-slate-500 text-[11px] font-bold leading-relaxed text-center opacity-70">
              A secure link has been dispatched to your verified email address.
            </p>
            <button 
              onClick={() => setShowForgot(false)}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[9px] tracking-widest uppercase active:scale-95"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-3">
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="Username or Email"
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm font-bold text-slate-800 shadow-sm placeholder:text-slate-300"
                />
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  placeholder="Password"
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm font-bold text-slate-800 shadow-sm placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end px-2">
              <button 
                type="button"
                onClick={handleForgot}
                className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-[32px] font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Log In'
              )}
            </button>
          </form>
        )}
      </div>
      
      <div className="absolute bottom-10 text-center w-full">
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">ENCRYPTED TERMINAL v3.1</p>
      </div>
    </div>
  );
};
