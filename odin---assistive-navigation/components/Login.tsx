
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
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  const handleForgot = () => {
    setShowForgot(true);
    speechService.speak("Recovery link sent. Check identity mail.");
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 z-[100] overflow-hidden">
      <div className="w-full max-w-[280px] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100 p-2">
            <Icons.Logo className="w-10 h-10 text-blue-600" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">ODIN</h1>
            <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-[7px] opacity-60">Visual Neural Link</p>
          </div>
        </div>

        {showForgot ? (
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-50 space-y-6 animate-in zoom-in duration-300">
            <h2 className="text-sm font-black text-slate-900 uppercase text-center">Identity Recovery</h2>
            <p className="text-slate-500 text-[10px] font-bold leading-relaxed text-center opacity-70">
              A secure link has been dispatched to your verified identity mail.
            </p>
            <button 
              onClick={() => setShowForgot(false)}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[9px] tracking-widest uppercase active:scale-95"
            >
              Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="IDENTITY"
                  className="w-full px-6 py-4 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-[11px] font-black text-slate-800 shadow-sm placeholder:text-slate-300 placeholder:tracking-widest"
                />
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  placeholder="CREDENTIALS"
                  className="w-full px-6 py-4 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-[11px] font-black text-slate-800 shadow-sm placeholder:text-slate-300 placeholder:tracking-widest"
                />
              </div>
            </div>

            <div className="flex justify-end px-2">
              <button 
                type="button"
                onClick={handleForgot}
                className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                Reset Access
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-[32px] font-black text-[10px] tracking-[0.2em] uppercase shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'CONNECT LINK'
              )}
            </button>
          </form>
        )}
      </div>
      
      <div className="absolute bottom-10 text-center w-full">
         <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">SECURED BY ODIN v3.1</p>
      </div>
    </div>
  );
};
