import React, { useState } from 'react';
import { GalleryItem } from '../types/pottery';
import { Sparkles, Download, Eye, Award, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { potteryAudio } from '../audio/potteryAudio';

interface GalleryViewProps {
  items: GalleryItem[];
  onSelectPiece: (item: GalleryItem) => void;
  onSaveCurrent: (title: string) => void;
  canSaveCurrent: boolean;
  onBackToStudio: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  items,
  onSelectPiece,
  onSaveCurrent,
  canSaveCurrent,
  onBackToStudio,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onSaveCurrent(newTitle.trim());
    potteryAudio.playChime(880);
    setNewTitle('');
    setHasSaved(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 select-none flex flex-col gap-6">
      {/* Save current piece prompt if coming from fired kiln */}
      {canSaveCurrent && !hasSaved && (
        <div className="bg-stone-900/95 backdrop-blur-md p-5 rounded-2xl border border-amber-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-100">Exhibit Your Fired Vessel</h3>
              <p className="text-xs text-stone-400">Name this piece to receive an art appraisal and add it to your studio collection.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. Kyoto Sunset Vase"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-200 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 w-full sm:w-56"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 transition-colors shrink-0 cursor-pointer shadow-lg shadow-amber-900/30"
            >
              Exhibit Piece
            </button>
          </form>
        </div>
      )}

      {/* Gallery Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-display tracking-wide text-stone-100">Studio Exhibition Gallery</h2>
          <p className="text-xs text-stone-400">Permanent collection of wheel-thrown and vitrified ceramic vessels.</p>
        </div>
        <button
          onClick={onBackToStudio}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors cursor-pointer"
        >
          Return to Wheel
        </button>
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-stone-900/80 backdrop-blur-md rounded-2xl border border-stone-800 hover:border-amber-500/50 transition-all p-4 flex flex-col gap-3 shadow-lg"
          >
            {/* Visual Header with Ceramic Color swatch preview */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-stone-100 group-hover:text-amber-300 transition-colors font-display">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                  <Calendar className="w-3 h-3 text-stone-500" />
                  <span>{item.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-4 h-4 rounded-full border border-stone-600"
                  style={{ backgroundColor: item.glaze.color }}
                  title={item.glaze.name}
                />
                <span
                  className="w-4 h-4 rounded-full border border-stone-600"
                  style={{ backgroundColor: item.clay.color }}
                  title={item.clay.name}
                />
              </div>
            </div>

            {/* Appraisal & Spec Details */}
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-stone-400">
                <span>Clay Body</span>
                <span className="text-stone-200 font-medium">{item.clay.name}</span>
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>Glaze Finish</span>
                <span className="text-stone-200 font-medium">{item.glaze.name}</span>
              </div>
              <div className="flex items-center justify-between text-stone-400 border-t border-stone-800 pt-1.5">
                <span className="flex items-center gap-1 text-amber-400">
                  <DollarSign className="w-3.5 h-3.5" />
                  Appraisal
                </span>
                <span className="font-mono font-bold text-amber-300 tabular-nums">
                  ${item.appraisalValue} USD
                </span>
              </div>
            </div>

            {/* Curator Review */}
            <p className="text-[11px] text-stone-400 italic line-clamp-2 leading-relaxed">
              "{item.curatorNotes}"
            </p>

            {/* Card Action */}
            <button
              onClick={() => {
                potteryAudio.playClick();
                onSelectPiece(item);
              }}
              className="mt-auto w-full py-2 px-3 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect on Wheel</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
