
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, UserPreferences, Obstacle } from './types';
import { Scanner } from './components/Scanner';
import { FeedbackSettings } from './components/FeedbackSettings';
import { MapNav } from './components/MapNav';
import { DidiChat } from './components/DidiChat';
import { AboutUs, HelpCenter } from './components/AboutHelp';
import { UserFeedback } from './components/UserFeedback';
import { Login } from './components/Login';
import { Walkthrough } from './components/Walkthrough';
import { Icons, COLORS } from './constants';
import { speechService } from './services/speechService';
import { hapticService } from './services/hapticService';
import { voiceService } from './services/voiceService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SPLASH);
  const [currentTab, setCurrentTab] = useState<AppState>(AppState.SCANNING);
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState<Obstacle[]>([]);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  const [isVoiceDetecting, setIsVoiceDetecting] = useState(false);
  
  const [externalSearch, setExternalSearch] = useState<{query: string, timestamp: number} | null>(null);
  const [externalChat, setExternalChat] = useState<{query: string, timestamp: number} | null>(null);

  const [prefs, setPrefs] = useState<UserPreferences>({
    voiceVolume: 1.0,
    voiceRate: 1.0,
    hapticIntensity: 'medium',
    alertThreshold: 2.0,
    highContrast: false,
    environmentalProfile: 'indoor'
  });

  const currentTabRef = useRef(currentTab);
  const isScanningRef = useRef(isScanning);

  useEffect(() => {
    currentTabRef.current = currentTab;
    isScanningRef.current = isScanning;
  }, [currentTab, isScanning]);

  useEffect(() => {
    if (appState === AppState.SPLASH) {
      const timer = setTimeout(() => {
        setAppState(AppState.LOGIN);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  useEffect(() => {
    speechService.setConfig(prefs.voiceVolume, prefs.voiceRate);
  }, [prefs]);

  // Voice command logic centralized
  const handleVoiceCommand = useCallback((command: string) => {
    const cmd = command.trim().toLowerCase();
    const hasWakeWord = cmd.includes('odin');
    
    if (hasWakeWord) {
      // Home / Back / Go to home page commands
      if (cmd.includes('back') || cmd.includes('return') || cmd.includes('home') || cmd.includes('go to home page')) {
        setCurrentTab(AppState.SCANNING);
        speechService.speak("Returning home.");
        hapticService.vibrate('low');
        return;
      }

      if (cmd.includes('search for') || cmd.includes('go to')) {
        const parts = cmd.includes('search for') ? cmd.split('search for') : cmd.split('go to');
        const target = parts[parts.length - 1].trim();
        if (target) {
          setCurrentTab(AppState.MAP);
          setExternalSearch({ query: target, timestamp: Date.now() });
          speechService.speak(`Searching for ${target}.`);
          hapticService.vibrate('low');
          return;
        }
      }

      if (cmd.includes('maps') || cmd.includes('navigation') || cmd.includes('directions')) {
        setCurrentTab(AppState.MAP);
        speechService.speak("Opening maps.");
        hapticService.vibrate('low');
        return;
      } 

      if (cmd.includes('ask') || cmd.includes('tell muninn')) {
        const parts = cmd.includes('ask') ? cmd.split('ask') : cmd.split('tell muninn');
        const query = parts[parts.length - 1].trim();
        if (query) {
          setCurrentTab(AppState.CHAT);
          setExternalChat({ query, timestamp: Date.now() });
          hapticService.vibrate('low');
          return;
        } else {
          setCurrentTab(AppState.CHAT);
          speechService.speak("Muninn is listening.");
          return;
        }
      }

      if (cmd.includes('chat') || cmd.includes('muninn')) {
        setCurrentTab(AppState.CHAT);
        speechService.speak("Muninn initialized.");
        hapticService.vibrate('low');
        return;
      }

      if (cmd.includes('initialize') || cmd.includes('start scan') || cmd.includes('vision')) {
        setCurrentTab(AppState.SCANNING);
        setIsScanning(true);
        speechService.speak("Vision engine active.");
        hapticService.vibrate('low');
        return;
      } 

      if (cmd.includes('stop') || cmd.includes('terminate')) {
        if (isScanningRef.current) {
          setIsScanning(false);
          speechService.speak("Scanner stopped.");
        }
        hapticService.vibrate('low');
        return;
      }

      if (cmd.includes('personalize') || cmd.includes('settings')) {
        setCurrentTab(AppState.SETTINGS);
        speechService.speak("Opening configuration.");
        return;
      }
      
      if (cmd.includes('help') || cmd.includes('support')) {
        setCurrentTab(AppState.HELP);
        speechService.speak("Help center active.");
        return;
      }
      
      if (cmd.includes('feedback') || cmd.includes('report')) {
        setCurrentTab(AppState.FEEDBACK);
        speechService.speak("Opening feedback.");
        return;
      }

      if (cmd.includes('louder') || cmd.includes('increase volume')) {
        setPrefs(p => ({ ...p, voiceVolume: Math.min(1, p.voiceVolume + 0.2) }));
        speechService.speak("Volume increased.");
      } else if (cmd.includes('quieter') || cmd.includes('decrease volume')) {
        setPrefs(p => ({ ...p, voiceVolume: Math.max(0, p.voiceVolume - 0.2) }));
        speechService.speak("Volume decreased.");
      }
    }
  }, []);

  useEffect(() => {
    if (appState !== AppState.SPLASH && appState !== AppState.LOGIN) {
      voiceService.setOnSpeechDetected(() => {
        setIsVoiceDetecting(true);
        setTimeout(() => setIsVoiceDetecting(false), 800);
      });
      voiceService.startGlobalListener(handleVoiceCommand);
    }
    return () => {
      voiceService.stopGlobalListener();
    };
  }, [appState, handleVoiceCommand]);

  const triggerNotification = useCallback((title: string, message: string) => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleLogin = () => {
    setAppState(AppState.SCANNING);
    setShowWalkthrough(true);
    speechService.speak("Connection established. ODIN sensing active.");
  };

  const revisitGuide = () => {
    setShowWalkthrough(true);
    setCurrentTab(AppState.SCANNING);
    speechService.speak("Revisiting interactive guide.");
  };

  if (appState === AppState.SPLASH) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 z-[200]">
        <div className="relative">
          <div className="absolute inset-0 -m-16 border-4 border-blue-50 rounded-full animate-ping opacity-20" />
          <Icons.Logo className="w-48 h-48 text-blue-600 relative z-10" />
        </div>
        <div className="mt-16 text-center space-y-2">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">ODIN</h1>
          <p className="text-blue-600 font-black uppercase tracking-[0.5em] text-xs">Visual Intellect</p>
        </div>
        <div className="absolute bottom-24 w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
           <div className="h-full bg-blue-600 animate-[loading_1.5s_infinite_ease-in-out]" />
        </div>
      </div>
    );
  }

  if (appState === AppState.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case AppState.SCANNING:
        return (
          <Scanner 
            isScanning={isScanning} 
            setIsScanning={setIsScanning} 
            onObstacle={(o) => {
              setHistory(prev => [...prev, o]);
              if (o.severity === 'high') {
                triggerNotification('DANGER DETECTED', `${o.label} at ${o.distance}m`);
              }
            }} 
          />
        );
      case AppState.MAP:
        return <MapNav externalSearch={externalSearch} />;
      case AppState.CHAT:
        return <DidiChat externalChat={externalChat} />;
      case AppState.SETTINGS:
        return <FeedbackSettings prefs={prefs} setPrefs={setPrefs} onRevisitGuide={revisitGuide} onBack={() => setCurrentTab(AppState.SCANNING)} />;
      case AppState.ABOUT:
        return <AboutUs onBack={() => setCurrentTab(AppState.SCANNING)} />;
      case AppState.HELP:
        return <HelpCenter onBack={() => setCurrentTab(AppState.SCANNING)} onRevisitGuide={revisitGuide} />;
      case AppState.FEEDBACK:
        return <UserFeedback onBack={() => setCurrentTab(AppState.SCANNING)} />;
      default:
        return <Scanner isScanning={isScanning} setIsScanning={setIsScanning} onObstacle={(o) => setHistory(prev => [...prev, o])} />;
    }
  };

  const navItems = [
    { id: AppState.MAP, icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', targetId: 'nav-map' },
    { id: AppState.SCANNING, icon: 'Icons.Logo', isSpecial: true },
    { id: AppState.CHAT, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', targetId: 'nav-chat' }
  ];

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-white text-slate-900">
      {showWalkthrough && <Walkthrough onClose={() => setShowWalkthrough(false)} />}

      {notification && (
        <div className="fixed top-20 left-4 right-4 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{notification.title}</p>
              <p className="text-sm font-black uppercase tracking-tight">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl flex items-center justify-between px-6 z-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {currentTab !== AppState.SCANNING && (
            <button 
              onClick={() => setCurrentTab(AppState.SCANNING)}
              className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center active:scale-90 transition-all mr-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <button onClick={() => setCurrentTab(AppState.ABOUT)} className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-blue-100/50">
            <Icons.Logo className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h2 className="font-black text-slate-900 tracking-tighter text-[16px] uppercase leading-none">ODIN</h2>
            <h2 className="font-black text-blue-600 tracking-tighter text-[7px] uppercase leading-none mt-1">Neural</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full transition-all duration-300 ${isVoiceDetecting ? 'ring-2 ring-blue-300 scale-105' : ''}`}>
            <div className={`w-1.5 h-1.5 bg-blue-500 rounded-full ${isVoiceDetecting ? 'animate-ping' : 'animate-pulse'}`} />
            <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest">
              {isVoiceDetecting ? 'Sensing' : 'Listening'}
            </span>
          </div>

          <button id="nav-help" onClick={() => setCurrentTab(AppState.HELP)} className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center active:scale-90 transition-all">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </button>

          <button id="nav-settings" onClick={() => setCurrentTab(AppState.SETTINGS)} className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center active:scale-90">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="absolute inset-0 pt-16 pb-24">
        <div className="h-full w-full overflow-hidden relative">
          {renderContent()}
        </div>
      </main>

      <nav className="fixed bottom-6 left-6 right-6 z-[60]">
        <div className="bg-white/90 backdrop-blur-3xl rounded-full border border-slate-100/50 p-1.5 flex items-center justify-around shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={item.targetId}
              onClick={() => { setCurrentTab(item.id); hapticService.vibrate('low'); }}
              className={`flex items-center justify-center transition-all duration-300 active:scale-90 ${
                item.isSpecial 
                  ? `w-14 h-14 rounded-full ${currentTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-300' : 'bg-slate-100 text-slate-400'}`
                  : `w-11 h-11 rounded-full ${currentTab === item.id ? 'bg-blue-100 text-blue-600' : 'text-slate-300'}`
              }`}
            >
              {item.isSpecial ? (
                <Icons.Logo className="w-8 h-8" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} />
                </svg>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
