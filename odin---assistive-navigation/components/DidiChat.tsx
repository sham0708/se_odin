
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { voiceService } from '../services/voiceService';
import { hapticService } from '../services/hapticService';
import { speechService } from '../services/speechService';

interface DidiChatProps {
  externalChat?: { query: string, timestamp: number } | null;
}

export const DidiChat: React.FC<DidiChatProps> = ({ externalChat }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am Didi, your ODIN assistant.\n\nI am listening. Just say "ODIN, ask Didi..." from any screen to talk to me.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  // Handle voice commands passed down from App.tsx
  useEffect(() => {
    if (externalChat) {
      handleSendInternal(externalChat.query);
    }
  }, [externalChat]);

  const handleSend = async () => {
    if (!input.trim()) return;
    handleSendInternal(input);
  };

  const handleSendInternal = async (text: string) => {
    if (!text.trim()) return;
    const userText = text;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      let lat, lng;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) {
        console.warn("Geolocation denied", e);
      }

      const result = await geminiService.queryLocation(
        `Answer as Didi (ODIN assistant). User query: ${userText}`,
        lat,
        lng
      );
      
      const responseText = result.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      speechService.speak(responseText);
    } catch (e: any) {
      if (e.message === 'QUOTA_EXHAUSTED') {
        const msg = "My neural circuits are a bit busy right now. Please wait a few moments before asking again.";
        setMessages(prev => [...prev, { role: 'model', text: msg }]);
        speechService.speak(msg);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "Connection error. Please try again." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Didi Chat</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hands-Free Active</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[28px] shadow-sm ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
            }`}>
              <div className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {loading && <div className="text-[10px] font-black text-blue-400 uppercase animate-pulse">Processing...</div>}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-[24px] border border-slate-200">
          <input 
            type="text" 
            placeholder="Just say 'ODIN, ask Didi...'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-4 outline-none text-slate-900 font-bold"
          />
          <button onClick={handleSend} className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
