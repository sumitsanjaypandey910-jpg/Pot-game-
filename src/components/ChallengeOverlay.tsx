import React, { useMemo } from 'react';
import { ChallengePreset, PotteryProfile } from '../types/pottery';
import { CHALLENGE_PRESETS } from '../data/presets';
import { Trophy, Target, Star, CheckCircle, Sparkles, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { potteryAudio } from '../audio/potteryAudio';

interface ChallengeOverlayProps {
  currentChallenge: ChallengePreset | null;
  onSelectChallenge: (preset: ChallengePreset | null) => void;
  playerProfile: PotteryProfile;
  showGhostOutline: boolean;
  onToggleGhost: () => void;
}

export const ChallengeOverlay: React.FC<ChallengeOverlayProps> = ({
  currentChallenge,
  onSelectChallenge,
  playerProfile,
  showGhostOutline,
  onToggleGhost,
}) => {
  // Real-time calculation of shape accuracy match
  const matchAccuracy = useMemo(() => {
    if (!currentChallenge) return 0;
    const target = currentChallenge.targetPoints;
    const player = playerProfile.points;
    const len = Math.min(target.length, player.length);

    let totalDiff = 0;
    for (let i = 0; i < len; i++) {
      totalDiff += Math.abs(target[i] - player[i]);
    }
    const avgDiff = totalDiff / len;

    // Height ratio penalty
    const heightDiff = Math.abs(currentChallenge.targetHeight - playerProfile.height) / currentChallenge.targetHeight;

    const penalty = avgDiff * 70 + heightDiff * 25;
    const score = Math.max(10, Math.min(99, Math.round(100 - penalty)));
    return score;
  }, [currentChallenge, playerProfile]);

  const stars = matchAccuracy >= 90 ? 3 : matchAccuracy >= 75 ? 2 : matchAccuracy >= 60 ? 1 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 select-none flex flex-col gap-3">
      {/* If a challenge is active: show the HUD Match Bar */}
      {currentChallenge ? (
        <div className="bg-stone-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-stone-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-stone-100 font-display">{currentChallenge.name}</h3>
                <span className="text-[10px] text-stone-400">({currentChallenge.culture})</span>
              </div>
              <p className="text-xs text-stone-400 line-clamp-1">{currentChallenge.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Live Accuracy Metric */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= stars ? 'text-amber-400 fill-amber-400' : 'text-stone-700'
                      }`}
                    />
                  ))}
                  <span className="font-mono text-sm font-bold text-amber-400 tabular-nums ml-1">
                    {matchAccuracy}%
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">
                  {matchAccuracy >= 90 ? 'Mastery Achieved!' : matchAccuracy >= 75 ? 'Very Close' : 'Forming Shape'}
                </span>
              </div>
            </div>

            {/* Ghost outline toggle */}
            <button
              onClick={onToggleGhost}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                showGhostOutline
                  ? 'bg-sky-950/60 border-sky-600/60 text-sky-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title="Toggle target ghost outline"
            >
              {showGhostOutline ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-[11px] hidden sm:inline">Guide</span>
            </button>

            {/* Exit challenge button */}
            <button
              onClick={() => onSelectChallenge(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-100 bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer"
            >
              Exit Task
            </button>
          </div>
        </div>
      ) : (
        /* Challenge Selection Drawer */
        <div className="bg-stone-900/90 backdrop-blur-md p-4 rounded-2xl border border-stone-800 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-stone-100">Historical Ceramic Forms Challenge</h3>
            </div>
            <span className="text-[11px] text-stone-400">Match the silhouette on the rotating wheel</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {CHALLENGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  potteryAudio.playClick();
                  onSelectChallenge(preset);
                }}
                className="p-3 rounded-xl bg-stone-950/60 hover:bg-stone-800/80 border border-stone-800/80 hover:border-amber-500/50 text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 font-display">
                      {preset.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                      {preset.difficulty}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 mb-1">{preset.culture}</div>
                  <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-stone-800/60 text-[11px] text-amber-400">
                  <span>Start Challenge</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
