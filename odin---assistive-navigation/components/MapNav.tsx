
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { speechService } from '../services/speechService';
import { hapticService } from '../services/hapticService';
import { voiceService } from '../services/voiceService';

interface NavStep {
  instruction: string;
  distance: number;
  icon: 'straight' | 'left' | 'right' | 'arrival' | 'bus' | 'car' | 'motor';
  targetLat?: number;
  targetLng?: number;
}

type NavState = 'IDLE' | 'PREVIEW' | 'NAVIGATING' | 'ARRIVED';
type TransportMode = 'walking' | 'driving' | 'motor' | 'bus';

interface MapNavProps {
  externalSearch?: { query: string, timestamp: number } | null;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const MapNav: React.FC<MapNavProps> = ({ externalSearch }) => {
  const [origin, setOrigin] = useState('My Location');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<TransportMode>('walking');
  const [navState, setNavState] = useState<NavState>('IDLE');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<NavStep[]>([]);
  const [distanceToNext, setDistanceToNext] = useState(0);
  const [mapUrl, setMapUrl] = useState('');
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const watchId = useRef<number | null>(null);
  const lastSpokenDistance = useRef<number>(Infinity);

  useEffect(() => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn(err),
        { enableHighAccuracy: true }
      );
    }
    setMapUrl(`https://www.google.com/maps/embed/v1/search?key=UNSET&q=accessible+locations+near+me`);
    return () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  // Act on external voice-triggered searches
  useEffect(() => {
    if (externalSearch) {
      setDestination(externalSearch.query);
      handleSearchInternal(origin, externalSearch.query, mode);
    }
  }, [externalSearch]);

  useEffect(() => {
    if (navState === 'NAVIGATING' && currentCoords && steps[currentStepIndex]) {
      const step = steps[currentStepIndex];
      if (step.targetLat && step.targetLng) {
        const dist = getDistance(currentCoords.lat, currentCoords.lng, step.targetLat, step.targetLng);
        setDistanceToNext(Math.max(0, dist));
        if (dist < 5) moveToNextStep();
        if (Math.abs(lastSpokenDistance.current - dist) > 50 && dist > 10) {
          speechService.speak(`${Math.round(dist)} meters remaining.`);
          lastSpokenDistance.current = dist;
        }
      }
    }
  }, [currentCoords, navState, currentStepIndex]);

  const handleSearchInternal = async (start: string, end: string, transportMode: TransportMode) => {
    if (!end.trim()) return;
    setLoading(true);
    setNavState('IDLE');
    try {
      const encodedOrigin = encodeURIComponent(start === 'My Location' ? (currentCoords ? `${currentCoords.lat},${currentCoords.lng}` : 'current+location') : start);
      const encodedDest = encodeURIComponent(end);
      let dirFlag = transportMode === 'bus' ? 'r' : (transportMode === 'walking' ? 'w' : 'd');
      setMapUrl(`https://www.google.com/maps?saddr=${encodedOrigin}&daddr=${encodedDest}&dirflg=${dirFlag}&output=embed`);
      
      const baseLat = currentCoords?.lat || 37.7749;
      const baseLng = currentCoords?.lng || -122.4194;
      const generatedSteps: NavStep[] = [
        { instruction: `Head straight from ${start}`, distance: 120, icon: transportMode === 'walking' ? 'straight' : 'car', targetLat: baseLat + 0.001, targetLng: baseLng + 0.001 },
        { instruction: "Turn right onto the main boulevard", distance: 250, icon: 'right', targetLat: baseLat + 0.002, targetLng: baseLng + 0.002 },
        { instruction: `Approaching ${end}`, distance: 0, icon: 'arrival', targetLat: baseLat + 0.0025, targetLng: baseLng + 0.0025 }
      ];
      setSteps(generatedSteps);
      setNavState('PREVIEW');
      speechService.speak("Path calculated. Tap start or say ODIN, start navigation.");
    } catch (err) {
      speechService.speak("Path calculation error.");
    } finally {
      setLoading(false);
    }
  };

  const startNavigation = () => {
    if (!currentCoords) return;
    setNavState('NAVIGATING');
    setCurrentStepIndex(0);
    lastSpokenDistance.current = Infinity;
    speechService.speak(`Initializing ${mode} guidance.`);
  };

  const moveToNextStep = () => {
    setCurrentStepIndex(prev => {
      if (prev + 1 >= steps.length) {
        setNavState('ARRIVED');
        speechService.speak("Arrived.", true);
        return prev;
      }
      speechService.speak(steps[prev + 1].instruction);
      return prev + 1;
    });
  };

  const stopNavigation = () => {
    setNavState('IDLE');
    setSteps([]);
    setDestination('');
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col relative overflow-hidden">
      {(navState === 'IDLE' || navState === 'PREVIEW') && (
        <div className="absolute top-3 left-3 right-3 z-[40] space-y-2">
          <div className="bg-white/95 backdrop-blur-md rounded-[24px] shadow-2xl border border-slate-200 p-2 space-y-1">
            <div className="flex items-center px-4 py-2 gap-3 border-b border-slate-100">
               <div className="w-2 h-2 rounded-full border-2 border-blue-600 bg-white" />
               <input type="text" placeholder="Starting Point" value={origin} onChange={(e) => setOrigin(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-800" />
            </div>
            <div className="flex items-center px-4 py-2 gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-600" />
               <input type="text" placeholder="Enter Destination" value={destination} onChange={(e) => setDestination(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-black text-slate-900" />
            </div>
          </div>
          <div className="flex bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-100 shadow-lg justify-around">
            {(['walking', 'driving', 'motor', 'bus'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all ${mode === m ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
                <span className="text-[7px] font-black uppercase tracking-widest">{m}</span>
              </button>
            ))}
          </div>
          <button onClick={() => handleSearchInternal(origin, destination, mode)} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">CALCULATE</button>
        </div>
      )}
      <div className="flex-1 relative z-0">
        <iframe className="w-full h-full border-none" src={mapUrl} allowFullScreen loading="lazy" />
        {navState === 'NAVIGATING' && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-[45]">
            <div className="bg-blue-600 rounded-[28px] p-5 shadow-2xl pointer-events-auto border-2 border-white/20">
              <div className="flex items-center gap-4 text-white">
                <div className="flex-1 overflow-hidden">
                  <h2 className="text-xl font-black uppercase truncate">{steps[currentStepIndex].instruction}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-black text-base">{Math.round(distanceToNext)}m</span>
                    <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white" style={{ width: `${Math.min(100, (1 - distanceToNext / 150) * 100)}%` }} /></div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={stopNavigation} className="bg-white rounded-[32px] p-5 shadow-2xl pointer-events-auto border border-slate-100 w-full text-red-600 font-black uppercase">Stop Navigation</button>
          </div>
        )}
        {navState === 'PREVIEW' && (
          <div className="absolute inset-x-0 bottom-3 p-3 z-[45]">
            <div className="bg-white rounded-[32px] p-6 shadow-2xl border border-blue-50 space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase truncate">{destination}</h2>
              <button onClick={startNavigation} className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em]">Start Guidance</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
