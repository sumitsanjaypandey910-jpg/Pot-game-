import React from 'react';
import { AppStep } from '../types/pottery';
import { Smartphone, Monitor, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface TopNavProps {
  currentStep: AppStep;
  onSelectStep: (step: AppStep) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentStep,
  onSelectStep,
  isMobileFrame,
  onToggleMobileFrame,
  isMuted,
  onToggleMute,
}) => {
  const steps: { id: AppStep; label: string }[] = [
    { id: 'wheel', label: 'Wheel' },
    { id: 'glaze', label: 'Glaze' },
    { id: 'kiln', label: 'Kiln' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'challenges', label: 'Challenges' },
  ];

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md z-40 relative select-none">
      {/* Zone 1: Single text element Brand Zone */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tracking-widest text-amber-100 font-display">
          CERAMICA
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-4 sm:gap-6 text-xs font-medium text-stone-400">
        {steps.map((s) => {
          const isActive = currentStep === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectStep(s.id)}
              className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 border-b-2 ${
                isActive
                  ? 'text-amber-400 font-semibold border-amber-400'
                  : 'text-stone-400 hover:text-stone-200 border-transparent'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMobileFrame}
          title={isMobileFrame ? 'Expand to Full Viewport' : 'Switch to React Native Mobile Frame'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl transition-colors cursor-pointer"
        >
          {isMobileFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden md:inline">Full Studio</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Mobile Frame</span>
            </>
          )}
        </button>

        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Zen Sounds' : 'Mute Sounds'}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-amber-300 bg-stone-900 border border-stone-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
