import React, { useState } from 'react';
import { Flame, Check, Sparkles, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { potteryAudio } from '../audio/potteryAudio';

interface KilnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFiringFinished: () => void;
  kilnTemp: number;
  onSetKilnTemp: (t: number) => void;
  isFired: boolean;
  onSaveToGallery: (title: string) => void;
}

export const KilnModal: React.FC<KilnModalProps> = ({
  isOpen,
  onClose,
  onFiringFinished,
  kilnTemp,
  onSetKilnTemp,
  isFired,
  onSaveToGallery,
}) => {
  const [firingState, setFiringState] = useState<'idle' | 'firing' | 'finished'>(isFired ? 'finished' : 'idle');
  const [progress, setProgress] = useState(isFired ? 1 : 0);
  const [title, setTitle] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  if (!isOpen) return null;

  const handleStartFiring = () => {
    setFiringState('firing');
    potteryAudio.playKilnRoar();

    const duration = 4000;
    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const ratio = Math.min(1, elapsed / duration);
      setProgress(ratio);

      // Temperature curve: 25C up to 1250C
      const currentT = Math.floor(25 + ratio * 1225);
      onSetKilnTemp(currentT);

      if (ratio >= 1) {
        clearInterval(interval);
        setFiringState('finished');
        onFiringFinished();
        potteryAudio.playChime(1046);
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0038ff', '#ff007f', '#ffcc00', '#e60000', '#00b828'],
        });
      }
    }, 40);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSaveToGallery(title.trim());
    setHasSaved(true);
    potteryAudio.playChime(880);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-md bg-stone-900/95 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Kiln Firing Chamber</h2>
            <p className="text-xs text-stone-400">Vitrify ceramic clay and bright glazes at 1250°C</p>
          </div>
        </div>

        {/* Temperature and progress */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-300 font-medium">Temperature</span>
            <span className="font-mono text-base font-bold text-yellow-400 tabular-nums">
              {kilnTemp}°C
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-stone-800 overflow-hidden relative border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-red-600 via-yellow-400 to-amber-300 shadow-lg shadow-red-500/40"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="text-[11px] text-stone-400 text-center">
            {firingState === 'idle' && 'Ready to fire and vitrify the colors.'}
            {firingState === 'firing' && 'Vitrifying glaze into crystal glass...'}
            {firingState === 'finished' && 'Vessel is fired and fully vitrified!'}
          </div>
        </div>

        {/* Actions */}
        {firingState === 'idle' && (
          <button
            onClick={handleStartFiring}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Flame className="w-5 h-5 fill-current" />
            <span>Ignite Kiln</span>
          </button>
        )}

        {firingState === 'finished' && (
          <div className="flex flex-col gap-3">
            {!hasSaved ? (
              <form onSubmit={handleSave} className="flex flex-col gap-2">
                <span className="text-xs text-stone-300">Name your vase for the gallery:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Rainbow Garden Vase"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-yellow-400"
                  />
                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black cursor-pointer shadow-md transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Exhibited in Studio Gallery!</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              Continue Inspecting
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
