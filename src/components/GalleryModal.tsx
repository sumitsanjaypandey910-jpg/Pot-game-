import React from 'react';
import { GalleryItem } from '../types/pottery';
import { X, Eye, Calendar, Sparkles, Award } from 'lucide-react';
import { potteryAudio } from '../audio/potteryAudio';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  onLoadItem: (item: GalleryItem) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  items,
  onLoadItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-stone-900/95 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Studio Ceramic Gallery</h2>
              <p className="text-xs text-stone-400">Exhibition of hand-sculpted and fired pottery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery items grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-black/45 border border-white/15 hover:border-yellow-400/70 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all hover:bg-black/60 shadow-lg group"
            >
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-1">
                  <Calendar className="w-3 h-3 text-stone-500" />
                  <span>{item.date}</span>
                </div>
                <div className="mt-2 text-xs font-mono font-bold text-yellow-400">
                  Valuation: ${item.appraisalValue} USD
                </div>
                <p className="text-[11px] text-stone-400 mt-2 line-clamp-2 italic">
                  "{item.curatorNotes}"
                </p>
              </div>

              <button
                onClick={() => {
                  potteryAudio.playClick();
                  onLoadItem(item);
                  onClose();
                }}
                className="w-full py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-blue-600 hover:text-white text-stone-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Place on Wheel</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
