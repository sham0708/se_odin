
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { speechService } from '../services/speechService';
import { hapticService } from '../services/hapticService';
import { voiceService } from '../services/voiceService';
import { Obstacle } from '../types';
import { Icons } from '../constants';

interface ScannerProps {
  isScanning: boolean;
  setIsScanning: (s: boolean) => void;
  onObstacle: (o: Obstacle) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ isScanning, setIsScanning, onObstacle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [sessionStats, setSessionStats] = useState({
    distance: 0.0,
    obstacleCount: 0,
    startTime: Date.now(),
    activeSeconds: 0
  });
  const lastProcessTimeRef = useRef(0);
  const lastSpeakTextRef = useRef<string | null>(null);
  const lastSpeakTimeRef = useRef(0);
  const lastDistanceRef = useRef(0);

  useEffect(() => {
    if (isScanning) {
      setSessionStats(prev => ({ ...prev, startTime: Date.now(), activeSeconds: 0 }));
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        } 
      })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera Access Failed:", err));
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setObstacles([]);
    }
  }, [isScanning]);

  useEffect(() => {
    let interval: number;
    if (isScanning) {
      interval = window.setInterval(() => {
        setSessionStats(prev => ({
          ...prev,
          activeSeconds: prev.activeSeconds + 1,
          distance: prev.distance + (Math.random() * 0.0015)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const processFrame = useCallback(async () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const now = Date.now();
    if (now - lastProcessTimeRef.current < 1000) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = 640;
    canvasRef.current.height = 480;
    context.drawImage(videoRef.current, 0, 0, 640, 480);

    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.4).split(',')[1];
    lastProcessTimeRef.current = now;

    const detected = await geminiService.analyzeFrame(base64);
    
    if (detected && detected.length > 0) {
      setObstacles(detected);
      const top = detected[0];
      
      // Clean up direction string: ensure it's just the number then append o'clock
      const dirNumber = top.direction.replace(/[^0-9]/g, '');
      const message = `${top.label}, ${top.distance} meters, ${dirNumber} o'clock`;
      
      const isNewObject = lastSpeakTextRef.current !== top.label;
      const significantDistanceChange = Math.abs(lastDistanceRef.current - top.distance) > 0.5;
      const timeSinceLastSpeak = now - lastSpeakTimeRef.current;

      if (isNewObject || significantDistanceChange || timeSinceLastSpeak > 3000) {
        speechService.speak(message, top.severity === 'high');
        lastSpeakTextRef.current = top.label;
        lastSpeakTimeRef.current = now;
        lastDistanceRef.current = top.distance;
        
        if (top.severity === 'high') {
          hapticService.triggerDanger();
        } else {
          hapticService.vibrate(top.severity === 'medium' ? 'medium' : 'low');
        }
      }

      setSessionStats(prev => ({ ...prev, obstacleCount: prev.obstacleCount + detected.length }));
      detected.forEach((d: any) => onObstacle({ 
        ...d, 
        direction: dirNumber, // normalize for history
        id: Math.random().toString(), 
        timestamp: Date.now(), 
        confidence: 0.95 
      }));
    } else {
      setObstacles([]);
    }
  }, [isScanning, onObstacle]);

  useEffect(() => {
    const interval = setInterval(processFrame, 500);
    return () => clearInterval(interval);
  }, [processFrame]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-50 grayscale contrast-150" />
        
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute top-4 left-4 right-4 z-30 flex justify-between gap-2">
          {[
            { label: 'DIST', val: `${sessionStats.distance.toFixed(2)}km` },
            { label: 'HZRD', val: sessionStats.obstacleCount },
            { label: 'TIME', val: formatTime(sessionStats.activeSeconds) }
          ].map(s => (
            <div key={s.label} className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex flex-col items-center min-w-[70px]">
              <span className="text-[6px] font-black text-white/40 uppercase tracking-[0.2em]">{s.label}</span>
              <span className="text-[10px] font-black text-white uppercase mt-0.5">{s.val}</span>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none p-4">
          {obstacles.map((obs, idx) => {
            const dirNumber = obs.direction.replace(/[^0-9]/g, '');
            return (
              <div key={idx} className="absolute flex flex-col items-center transition-all duration-700 ease-out" 
                   style={{ 
                     top: `${20 + (idx * 12)}%`, 
                     left: `${10 + (idx * 30) % 80}%`,
                     transform: `scale(${Math.max(0.7, 1 - (obs.distance / 10))})`
                   }}>
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${obs.severity === 'high' ? 'bg-red-500 border-white shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce' : 'bg-blue-600 border-white shadow-lg'} `}>
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>
                <div className="mt-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex flex-col items-center">
                  <span className="text-white font-black text-[10px] uppercase">{obs.label}</span>
                  <span className="text-blue-400 font-black text-[7px] uppercase tracking-widest">{obs.distance}m • {dirNumber} o'clock</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-20 left-0 right-0 px-8 z-20 pb-4 flex flex-col items-center gap-4">
        <button
          id="scan-button"
          onClick={() => {
            setIsScanning(!isScanning);
            hapticService.vibrate('medium');
            speechService.speak(isScanning ? "Vision off." : "Vision active.");
          }}
          className={`w-full py-6 rounded-full font-black text-lg uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-2xl flex items-center justify-center gap-4 ${
            isScanning ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-white text-blue-600'
          }`}
        >
          {isScanning ? 'TERMINATE' : 'INITIALIZE'}
        </button>

        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em]">Start with "ODIN"</span>
        </div>
      </div>
    </div>
  );
};
