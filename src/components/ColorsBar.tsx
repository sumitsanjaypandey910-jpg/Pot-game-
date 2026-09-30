import React from 'react';
import { PaintColor } from '../types/pottery';
import { PRIMARY_COLORS } from '../data/presets';
import { Check } from 'lucide-react';
import { potteryAudio } from '../audio/potteryAudio';

interface ColorsBarProps {
  activeColor: string;
  onSelectColor: (colorHex: string) => void;
}

export const ColorsBar: React.FC<ColorsBarProps> = ({
  activeColor,
  onSelectColor,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none animate-fadeIn">
      {/* "colours" label bar with glassmorphic backing matching Screenshot 1 */}
      <div className="bg-stone-900/85 backdrop-blur-md rounded-2xl border border-white/20 p-2 shadow-2xl flex flex-col items-center gap-1.5">
        <div className="w-full text-left pl-2 text-[11px] font-semibold tracking-wider text-stone-300 uppercase">
          colours
        </div>

        {/* Color swatches in row */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-1">
          {PRIMARY_COLORS.map((item) => {
            const isSelected = item.color.toLowerCase() === activeColor.toLowerCase();
            return (
              <button
                key={item.id}
                onClick={() => {
                  potteryAudio.playClick();
                  onSelectColor(item.color);
                }}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-95 ${
                  isSelected
                    ? 'border-white scale-105 ring-2 ring-white/50 shadow-white/20'
                    : 'border-white/40 hover:border-white/80'
                }`}
                style={{ backgroundColor: item.color }}
                title={item.name}
              >
                {isSelected && (
                  <Check
                    className="w-5 h-5 drop-shadow-md stroke-[3]"
                    style={{ color: item.checkColor || '#ffffff' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
