import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Trophy, ArrowRight, ShieldCheck, Thermometer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { potteryAudio } from '../audio/potteryAudio';

interface KilnViewProps {
  onFiringComplete: () => void;
  onSetKilnTemp: (temp: number) => void;
  kilnTemp: number;
}

export const KilnView: React.FC<KilnViewProps> = ({
  onFiringComplete,
  onSetKilnTemp,
  kilnTemp,
}) => {
  const [firingState, setFiringState] = useState<'idle' | 'firing' | 'cooling' | 'finished'>('idle');
  const [progress, setProgress] = useState(0);

  const startFiring = () => {
    setFiringState('firing');
    potteryAudio.playKilnRoar();

    const duration = 5000; // 5 seconds firing cycle
    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const ratio = Math.min(1, elapsed / duration);
      setProgress(ratio);

      // Temperature curve: 25C up to 1250C (Cone 6 vitrification)
      const currentT = Math.floor(25 + ratio * 1225);
      onSetKilnTemp(currentT);

      if (ratio >= 1) {
        clearInterval(interval);
        setFiringState('cooling');
        setTimeout(() => {
          setFiringState('finished');
          onFiringComplete();
          potteryAudio.playChime(1046); // High C crystalline ceramic chime
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#dfa637', '#f59e0b', '#38bdf8', '#ffffff'],
          });
        }, 1200);
      }
    }, 50);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 select-none">
      <div className="bg-stone-900/90 backdrop-blur-md p-5 rounded-2xl border border-stone-800 shadow-2xl flex flex-col gap-4">
        {/* Title & Stage */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${firingState === 'firing' ? 'text-orange-500 animate-pulse' : 'text-stone-400'}`} />
            <div>
              <h2 className="text-sm font-semibold text-stone-100">Ceramic Kiln Firing Chamber</h2>
              <span className="text-[11px] text-stone-500">Cone 6 Stoneware Vitrification</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs font-semibold text-amber-400 tabular-nums">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>{kilnTemp}°C</span>
          </div>
        </div>

        {/* Firing Progress Gauge */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-stone-400">
            <span>
              {firingState === 'idle' && 'Waiting for ignition'}
              {firingState === 'firing' && 'Vitrifying glaze & bonding clay crystals...'}
              {firingState === 'cooling' && 'Cooling down slowly to prevent thermal shock...'}
              {firingState === 'finished' && 'Firing Complete! Vessel is fully vitrified.'}
            </span>
            <span className="font-mono tabular-nums">{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-stone-950 border border-stone-800 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-300 shadow-lg shadow-orange-500/50"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Firing Stages breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className={`p-2 rounded-xl border ${kilnTemp >= 400 ? 'bg-amber-950/30 border-amber-800/80 text-amber-300' : 'bg-stone-950/40 border-stone-800 text-stone-500'}`}>
            <div className="font-semibold">Water Smoke</div>
            <div className="text-[10px] opacity-75">100°C – 450°C</div>
          </div>
          <div className={`p-2 rounded-xl border ${kilnTemp >= 900 ? 'bg-orange-950/40 border-orange-800/80 text-orange-300' : 'bg-stone-950/40 border-stone-800 text-stone-500'}`}>
            <div className="font-semibold">Bisque Sintering</div>
            <div className="text-[10px] opacity-75">450°C – 950°C</div>
          </div>
          <div className={`p-2 rounded-xl border ${kilnTemp >= 1200 ? 'bg-yellow-950/40 border-yellow-700/80 text-yellow-300' : 'bg-stone-950/40 border-stone-800 text-stone-500'}`}>
            <div className="font-semibold">Glaze Vitrification</div>
            <div className="text-[10px] opacity-75">1200°C+</div>
          </div>
        </div>

        {/* Action Button */}
        {firingState === 'idle' && (
          <button
            onClick={startFiring}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-stone-950 shadow-xl shadow-orange-900/40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 fill-stone-950" />
            <span>Ignite Kiln Burners</span>
          </button>
        )}

        {firingState === 'finished' && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Firing successful! Your ceramic glaze has vitrified into a durable glass surface.</span>
          </div>
        )}
      </div>
    </div>
  );
};
