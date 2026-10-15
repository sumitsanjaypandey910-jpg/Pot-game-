import React from 'react';
import { 
  RotateCcw, 
  Palette, 
  Flame, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Layers, 
  Home, 
  Check, 
  Hand,
  Trophy,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { potteryAudio } from '../audio/potteryAudio';
import { LightingMode } from '../types/pottery';

interface RightSquareControlsProps {
  mode: 'shape' | 'colours' | 'ready';
  onChangeMode: (mode: 'shape' | 'colours') => void;
  onReset: () => void;
  onReadyToFire: () => void;
  onOpenGallery: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  lightingMode: LightingMode;
  onToggleLighting: () => void;
}

export const RightSquareControls: React.FC<RightSquareControlsProps> = ({
  mode,
  onChangeMode,
  onReset,
  onReadyToFire,
  onOpenGallery,
  isMuted,
  onToggleMute,
  lightingMode = 'morning',
  onToggleLighting,
}) => {
  return (
    <aside aria-label="Pottery controls" className="absolute top-4 right-4 z-40 flex flex-col items-center gap-3 select-none pointer-events-auto">
      {/* Reset Button */}
      <button
        onClick={() => {
          potteryAudio.playClick();
          onReset();
        }}
        className="flex flex-col items-center justify-center group cursor-pointer"
        title="Reset"
      >
        <div className="w-12 h-12 rounded-xl bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-white/50 shadow-lg flex items-center justify-center text-white transition-all group-active:scale-95">
          <RotateCcw className="w-5 h-5 text-white" />
        </div>
        <span className="text-[11px] font-medium text-white/90 drop-shadow-md mt-1">
          reset
        </span>
      </button>

      {/* Mode Switch: Shape vs Colours */}
      {mode === 'shape' ? (
        <button
          onClick={() => {
            potteryAudio.playClick();
            onChangeMode('colours');
          }}
          className="flex flex-col items-center justify-center group cursor-pointer"
          title="Colours / Paint"
        >
          <div className="w-12 h-12 rounded-xl bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-yellow-400/80 shadow-lg flex items-center justify-center text-white transition-all group-active:scale-95">
            <Palette className="w-5 h-5 text-yellow-300" />
          </div>
          <span className="text-[11px] font-medium text-white/90 drop-shadow-md mt-1">
            colours
          </span>
        </button>
      ) : (
        <button
          onClick={() => {
            potteryAudio.playClick();
            onChangeMode('shape');
          }}
          className="flex flex-col items-center justify-center group cursor-pointer"
          title="Shape / Sculpt"
        >
          <div className="w-12 h-12 rounded-xl bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-blue-400/80 shadow-lg flex items-center justify-center text-white transition-all group-active:scale-95">
            <Hand className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[11px] font-medium text-white/90 drop-shadow-md mt-1">
            shape
          </span>
        </button>
      )}

      {/* Ready / Fire Kiln */}
      <button
        onClick={() => {
          potteryAudio.playClick();
          onReadyToFire();
        }}
        className="flex flex-col items-center justify-center group cursor-pointer"
        title="Fire / Ready"
      >
        <div className="w-12 h-12 rounded-xl bg-black/65 hover:bg-red-600/80 backdrop-blur-md border border-white/20 hover:border-red-500 shadow-lg flex items-center justify-center text-white transition-all group-active:scale-95">
          <Flame className="w-5 h-5 text-red-500 group-hover:text-white" />
        </div>
        <span className="text-[11px] font-medium text-white/90 drop-shadow-md mt-1">
          ready
        </span>
      </button>

      {/* Menu / Gallery */}
      <button
        onClick={() => {
          potteryAudio.playClick();
          onOpenGallery();
        }}
        className="flex flex-col items-center justify-center group cursor-pointer"
        title="Gallery / Collection"
      >
        <div className="w-12 h-12 rounded-xl bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-white/50 shadow-lg flex items-center justify-center text-white transition-all group-active:scale-95">
          <Home className="w-5 h-5 text-white" />
        </div>
        <span className="text-[11px] font-medium text-white/90 drop-shadow-md mt-1">
          menu
        </span>
      </button>

      {/* Lighting Mode Toggle (Morning Light, Golden Hour, Moonlit Studio) */}
      <button
        onClick={() => {
          potteryAudio.playClick();
          onToggleLighting();
        }}
        className="flex flex-col items-center justify-center group cursor-pointer"
        title={`Environment: ${
          lightingMode === 'morning'
            ? 'Morning Light'
            : lightingMode === 'golden'
            ? 'Golden Hour'
            : 'Moonlit Studio'
        }`}
      >
        <div className={`w-12 h-12 rounded-xl backdrop-blur-md border shadow-lg flex items-center justify-center text-white transition-all group-active:scale-95 ${
          lightingMode === 'morning'
            ? 'bg-black/65 hover:bg-black/85 border-amber-200/40 hover:border-amber-200/80 shadow-amber-900/20'
            : lightingMode === 'golden'
            ? 'bg-amber-950/70 hover:bg-amber-900/80 border-amber-400/50 hover:border-amber-400/90 shadow-amber-500/20'
            : 'bg-indigo-950/70 hover:bg-indigo-900/80 border-sky-400/50 hover:border-sky-400/90 shadow-sky-500/20'
        }`}>
          {lightingMode === 'morning' && <Sun className="w-5 h-5 text-amber-200" />}
          {lightingMode === 'golden' && <Sunset className="w-5 h-5 text-amber-400" />}
          {lightingMode === 'moonlit' && <Moon className="w-5 h-5 text-sky-300" />}
        </div>
        <span className="text-[10px] font-medium text-white/90 drop-shadow-md mt-1 truncate max-w-[56px] text-center">
          {lightingMode === 'morning' ? 'morning' : lightingMode === 'golden' ? 'golden' : 'moonlit'}
        </span>
      </button>

      {/* Sound Toggle */}
      <button
        onClick={() => {
          onToggleMute();
        }}
        className="flex flex-col items-center justify-center group cursor-pointer"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <div className="w-12 h-12 rounded-xl bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-white/50 shadow-lg flex items-center justify-center text-white transition-all group-active:scale-95">
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-stone-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        <span className="text-[11px] font-medium text-white/90 drop-shadow-md mt-1">
          sound
        </span>
      </button>
    </aside>
  );
};
