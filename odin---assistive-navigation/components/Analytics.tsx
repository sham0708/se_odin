
import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Obstacle } from '../types';

interface Props {
  history: Obstacle[];
}

export const Analytics: React.FC<Props> = ({ history }) => {
  const data = [
    { name: 'M', value: 12 },
    { name: 'T', value: 18 },
    { name: 'W', value: 5 },
    { name: 'T', value: 25 },
    { name: 'F', value: 14 },
    { name: 'S', value: 8 },
    { name: 'S', value: 2 }
  ];

  return (
    <div className="h-full bg-black/20 p-6 space-y-6 overflow-y-auto pb-32">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Activity</h1>
        <p className="text-neutral-500 font-bold text-xs uppercase tracking-widest">Historical navigation insights</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-800/40 border border-white/5 p-5 rounded-[28px] space-y-1 shadow-lg">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Obstacles</span>
          <div className="text-3xl font-black text-yellow-400 tracking-tighter">{history.length}</div>
        </div>
        <div className="bg-neutral-800/40 border border-white/5 p-5 rounded-[28px] space-y-1 shadow-lg">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Safety</span>
          <div className="text-3xl font-black text-green-400 tracking-tighter">98%</div>
        </div>
      </div>

      <div className="bg-neutral-800/40 border border-white/5 p-6 rounded-[32px] space-y-4 shadow-lg">
        <h2 className="text-xs font-black uppercase text-white/40 tracking-widest">Weekly Trends</h2>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#555', fontWeight: 'bold', fontSize: 10}} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{backgroundColor: '#111', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px'}}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 20 ? '#EF4444' : '#FACC15'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase text-white/40 tracking-widest">Timeline</h2>
        {history.length === 0 ? (
          <div className="py-12 text-center text-neutral-600 font-bold text-sm italic">
            No obstacles logged yet. Start scanning to populate your timeline.
          </div>
        ) : (
          history.slice(-10).reverse().map((o, idx) => (
            <div key={idx} className="bg-neutral-800/20 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${o.severity === 'high' ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`} />
                <div className="space-y-0.5">
                  <div className="font-black text-sm uppercase text-white tracking-tight">{o.label}</div>
                  <div className="text-[10px] font-bold text-neutral-500">{new Date(o.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
              <div className="text-xs font-black text-white/40 tracking-tighter">{o.distance}m</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
