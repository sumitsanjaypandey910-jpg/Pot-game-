import React from 'react';
import { GlazeColor, PatternDecal } from '../types/pottery';
import { GLAZE_COLORS } from '../data/presets';
import { Palette, Sparkles, Sliders, Trash2, ArrowRight } from 'lucide-react';

interface GlazeStudioProps {
  currentGlaze: GlazeColor;
  onSelectGlaze: (glaze: GlazeColor) => void;
  patterns: PatternDecal[];
  onAddPattern: (pattern: PatternDecal) => void;
  onRemovePattern: (id: string) => void;
  onUpdatePattern: (id: string, updates: Partial<PatternDecal>) => void;
  onClearPatterns: () => void;
  onProceedToKiln: () => void;
}

export const GlazeStudio: React.FC<GlazeStudioProps> = ({
  currentGlaze,
  onSelectGlaze,
  patterns,
  onAddPattern,
  onRemovePattern,
  onUpdatePattern,
  onClearPatterns,
  onProceedToKiln,
}) => {
  const patternTemplates = [
    { type: 'greek_meander' as const, name: 'Greek Meander', defaultColor: '#dfa637', repeats: 12, heightRatio: 0.16 },
    { type: 'sakura' as const, name: 'Sakura Petals', defaultColor: '#ffffff', repeats: 14, heightRatio: 0.18 },
    { type: 'wave' as const, name: 'Ocean Waves', defaultColor: '#1a4480', repeats: 16, heightRatio: 0.15 },
    { type: 'rings' as const, name: 'Fillet Rings', defaultColor: '#ffffff', repeats: 1, heightRatio: 0.2 },
    { type: 'dots' as const, name: 'Polka Dots', defaultColor: '#ffffff', repeats: 18, heightRatio: 0.12 },
  ];

  const handleApplyTemplate = (tpl: typeof patternTemplates[0]) => {
    const newDecal: PatternDecal = {
      id: `pat_${Date.now()}`,
      name: tpl.name,
      type: tpl.type,
      color: tpl.defaultColor,
      yPosition: 0.65, // upper shoulder
      repeats: tpl.repeats,
      heightRatio: tpl.heightRatio,
    };
    onAddPattern(newDecal);
  };

  const patternColors = ['#ffffff', '#dfa637', '#1a4480', '#8b263e', '#1f2421', '#2e9389'];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 px-4 py-3 select-none">
      <div className="bg-stone-900/90 backdrop-blur-md p-4 rounded-2xl border border-stone-800 shadow-2xl flex flex-col gap-4">
        {/* Step Header */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-stone-100">Glaze & Ceramic Decoration</h2>
          </div>
          <button
            onClick={onProceedToKiln}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
          >
            <span>Proceed to Kiln</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Glaze Color Selection Grid */}
        <div>
          <span className="text-xs font-medium text-stone-400 block mb-2">1. Select Mineral Glaze Dip</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GLAZE_COLORS.map((g) => {
              const isSelected = currentGlaze.id === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => onSelectGlaze(g)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-stone-950/50 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg border border-stone-600/60 shadow-inner shrink-0"
                    style={{ backgroundColor: g.color }}
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-stone-200 truncate">{g.name}</div>
                    <div className="text-[10px] text-stone-500 capitalize">{g.finish}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Decorative Motif Bands */}
        <div className="border-t border-stone-800/80 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Paint Decorative Motif Bands (Wraps 360° on Wheel)</span>
            </div>
            {patterns.length > 0 && (
              <button
                onClick={onClearPatterns}
                className="text-[11px] text-stone-400 hover:text-rose-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All Bands</span>
              </button>
            )}
          </div>

          {/* Quick Apply Pattern Presets */}
          <div className="flex flex-wrap gap-2 mb-3">
            {patternTemplates.map((tpl) => (
              <button
                key={tpl.type}
                onClick={() => handleApplyTemplate(tpl)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>+ {tpl.name}</span>
              </button>
            ))}
          </div>

          {/* Active Pattern Layer Controls */}
          {patterns.length > 0 && (
            <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
              {patterns.map((pat, idx) => (
                <div
                  key={pat.id}
                  className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 font-medium text-stone-300 shrink-0">
                    <span className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] text-stone-400">
                      {idx + 1}
                    </span>
                    <span>{pat.name}</span>
                  </div>

                  {/* Height Slider */}
                  <div className="flex items-center gap-2 w-full sm:w-48">
                    <Sliders className="w-3 h-3 text-stone-500 shrink-0" />
                    <span className="text-[10px] text-stone-500 shrink-0">Height:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.02"
                      value={pat.yPosition}
                      onChange={(e) => onUpdatePattern(pat.id, { yPosition: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                    />
                  </div>

                  {/* Pattern Color Choices */}
                  <div className="flex items-center gap-1 shrink-0">
                    {patternColors.map((col) => (
                      <button
                        key={col}
                        onClick={() => onUpdatePattern(pat.id, { color: col })}
                        className={`w-4 h-4 rounded-full border transition-transform ${
                          pat.color === col ? 'scale-125 border-amber-400 ring-1 ring-amber-400' : 'border-stone-700'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemovePattern(pat.id)}
                    className="text-stone-500 hover:text-rose-400 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
