import React from 'react';
import { ClayType, SculptTool } from '../types/pottery';
import { CLAY_TYPES } from '../data/presets';
import { 
  Hand, 
  Sparkles, 
  Ruler, 
  Disc, 
  ArrowUpToLine, 
  ArrowDownToLine, 
  RotateCcw, 
  RotateCw, 
  RefreshCw, 
  Gauge, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

interface WheelControlsProps {
  tool: SculptTool;
  onSelectTool: (tool: SculptTool) => void;
  wheelRpm: number;
  onChangeRpm: (rpm: number) => void;
  clay: ClayType;
  onSelectClay: (clay: ClayType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const WheelControls: React.FC<WheelControlsProps> = ({
  tool,
  onSelectTool,
  wheelRpm,
  onChangeRpm,
  clay,
  onSelectClay,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  isMuted,
  onToggleMute,
}) => {
  const tools: { id: SculptTool; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'finger', label: 'Finger', icon: <Hand className="w-4 h-4" />, desc: 'Push / Pull contour' },
    { id: 'sponge', label: 'Sponge', icon: <Sparkles className="w-4 h-4" />, desc: 'Smooth & soften' },
    { id: 'rib', label: 'Wood Rib', icon: <Ruler className="w-4 h-4" />, desc: 'Straighten bevel' },
    { id: 'fluting', label: 'Fluting', icon: <Disc className="w-4 h-4" />, desc: 'Carve concentric rings' },
    { id: 'pull_up', label: 'Stretch', icon: <ArrowUpToLine className="w-4 h-4" />, desc: 'Pull clay taller' },
    { id: 'flatten', label: 'Flatten', icon: <ArrowDownToLine className="w-4 h-4" />, desc: 'Widen into bowl' },
  ];

  const rpmPresets = [
    { label: 'Stop', value: 0 },
    { label: '60', value: 60 },
    { label: '120', value: 120 },
    { label: '240', value: 240 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 py-3 select-none">
      {/* Upper toolbar: Undo/Redo, Clay selector, Wheel RPM pedal */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/80 backdrop-blur-md p-2.5 rounded-2xl border border-stone-800 shadow-xl">
        {/* Undo / Redo / Reset */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo stroke"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo stroke"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            title="Reset clay lump"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-400 hover:text-rose-300 bg-stone-800/80 hover:bg-stone-700 transition-colors ml-1"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Clay Selection pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {CLAY_TYPES.map((c) => {
            const isSelected = c.id === clay.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectClay(c)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-700/80 text-white shadow-md shadow-amber-900/40 ring-1 ring-amber-500'
                    : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-stone-600 shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="whitespace-nowrap">{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Wheel Speed Pedal and Audio */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-950/70 p-1 rounded-xl border border-stone-800">
            <div className="flex items-center gap-1 px-2 text-xs font-semibold text-amber-400/90">
              <Gauge className="w-3.5 h-3.5" />
              <span className="tabular-nums font-mono">{wheelRpm}</span>
              <span className="text-[10px] text-stone-500">RPM</span>
            </div>
            <div className="flex items-center gap-0.5">
              {rpmPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => onChangeRpm(preset.value)}
                  className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                    wheelRpm === preset.value
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Primary Tool Rack: Finger, Sponge, Rib, Fluting, Stretch, Flatten */}
      <div className="grid grid-cols-6 gap-2 bg-stone-900/90 backdrop-blur-md p-2 rounded-2xl border border-stone-800 shadow-xl">
        {tools.map((t) => {
          const isActive = tool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-amber-600 to-amber-700 text-stone-950 font-semibold shadow-lg shadow-amber-900/40 translate-y-[-1px]'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/80'
              }`}
            >
              <div className="mb-1">{t.icon}</div>
              <span className="text-xs whitespace-nowrap">{t.label}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline truncate max-w-full">
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
