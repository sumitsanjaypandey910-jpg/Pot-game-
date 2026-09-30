import React, { useState, useCallback } from 'react';
import { 
  InteractionMode, 
  ClayType, 
  PotteryProfile, 
  GalleryItem 
} from './types/pottery';
import { 
  CLAY_TYPES, 
  PRIMARY_COLORS, 
  NATURAL_CLAY_COLOR, 
  createDefaultProfile, 
  PROFILE_RESOLUTION 
} from './data/presets';
import { PotteryCanvas } from './components/PotteryCanvas';
import { RightSquareControls } from './components/RightSquareControls';
import { ColorsBar } from './components/ColorsBar';
import { KilnModal } from './components/KilnModal';
import { GalleryModal } from './components/GalleryModal';
import { potteryAudio } from './audio/potteryAudio';
import { ArrowLeft, Sparkles } from 'lucide-react';

const COLOR_SLICES_COUNT = 128;

const createInitialColorSlices = (baseHex: string = NATURAL_CLAY_COLOR): string[] => {
  return new Array(COLOR_SLICES_COUNT).fill(baseHex);
};

// Initial preset gallery collection
const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'art_rainbow',
    title: 'Rainbow Horizon Amphora',
    date: 'Masterpiece Series',
    clay: CLAY_TYPES[0],
    glaze: {
      id: 'rainbow_glaze',
      name: 'Vitrified Gloss',
      color: '#ded6c4',
      roughness: 0.15,
      metalness: 0.08,
      clearcoat: 1.0,
      finish: 'glossy',
    },
    patterns: [],
    profile: createDefaultProfile(),
    appraisalValue: 560,
    curatorNotes: 'Striking concentric spectrum of primary glazes applied in perfect rhythm with wheel centrifugal force.',
  },
  {
    id: 'art_classic',
    title: 'Etruscan Ivory Vase',
    date: 'Classical Series',
    clay: CLAY_TYPES[0],
    glaze: {
      id: 'natural_glaze',
      name: 'Unglazed Bisque',
      color: '#ded6c4',
      roughness: 0.72,
      metalness: 0.03,
      clearcoat: 0,
      finish: 'matte',
    },
    patterns: [],
    profile: createDefaultProfile(),
    appraisalValue: 420,
    curatorNotes: 'Timeless balanced silhouette with fine natural throwing ridges reflecting classical wheel artistry.',
  },
];

export default function App() {
  const [mode, setMode] = useState<InteractionMode>('shape');
  const [activeColor, setActiveColor] = useState<string>(PRIMARY_COLORS[2].color); // Pink as checked in screenshot
  const [colorSlices, setColorSlices] = useState<string[]>(() => createInitialColorSlices(NATURAL_CLAY_COLOR));
  const [wheelRpm, setWheelRpm] = useState<number>(120);
  const [isFired, setIsFired] = useState<boolean>(false);
  const [isKilnModalOpen, setIsKilnModalOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [kilnTemp, setKilnTemp] = useState<number>(25);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Undo / Redo shape profile history stack
  const [history, setHistory] = useState<PotteryProfile[]>([createDefaultProfile()]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const profile = history[historyIndex];

  // Gallery items
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);

  // Touching state for subtle guidance badge
  const [isTouchingPot, setIsTouchingPot] = useState<boolean>(false);

  // Handle shape change
  const handleProfileChange = useCallback((newProfile: PotteryProfile) => {
    setHistory((prev) => {
      const next = [...prev.slice(0, historyIndex), newProfile];
      return next;
    });
  }, [historyIndex]);

  // Commit history on pointer up
  const handleCommitHistory = useCallback(() => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      if (trimmed.length > 25) trimmed.shift();
      return trimmed;
    });
    setHistoryIndex((prev) => prev);
  }, [historyIndex]);

  // Reset to default shape or clear colors
  const handleReset = () => {
    if (mode === 'colours') {
      // Clear paint back to natural clay
      setColorSlices(createInitialColorSlices(NATURAL_CLAY_COLOR));
    } else {
      // Reset shape profile
      const def = createDefaultProfile();
      setHistory([def]);
      setHistoryIndex(0);
      setIsFired(false);
    }
  };

  // Back button handler (like in the screenshots)
  const handleBack = () => {
    potteryAudio.playClick();
    if (mode === 'colours') {
      setMode('shape');
    } else {
      setIsGalleryOpen(true);
    }
  };

  // Firing completion
  const handleFiringFinished = () => {
    setIsFired(true);
  };

  // Save to collection
  const handleSaveToGallery = (title: string) => {
    const valuation = Math.floor(350 + Math.random() * 320);
    const newItem: GalleryItem = {
      id: `art_${Date.now()}`,
      title,
      date: 'Just Now',
      clay: CLAY_TYPES[0],
      glaze: {
        id: 'fired_glaze',
        name: 'Vitrified Gloss',
        color: NATURAL_CLAY_COLOR,
        roughness: 0.15,
        metalness: 0.08,
        clearcoat: 1.0,
        finish: 'glossy',
      },
      patterns: [],
      profile: { ...profile },
      appraisalValue: valuation,
      curatorNotes: 'Excellently centered vessel with vibrant concentric mineral color vitrification.',
    };
    setGalleryItems((prev) => [newItem, ...prev]);
  };

  // Load an existing piece onto wheel
  const handleLoadItem = (item: GalleryItem) => {
    setHistory([item.profile]);
    setHistoryIndex(0);
    setIsFired(true);
    setMode('shape');
  };

  // Toggle sound
  const handleToggleMute = () => {
    const muted = potteryAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-stone-950 font-sans">
      {/* 1. Lush Green Outdoor Bokeh Background with deep foliage, circular bokeh, and cinematic blur */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
        style={{ backgroundImage: `url('/src/assets/images/cinematic_green_bokeh_1790462207717.jpg')` }}
      />
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/35 pointer-events-none z-0" />

      {/* 2. Full-Screen 3D Potter's Wheel & Vase */}
      <div className="absolute inset-0 w-full h-full z-10">
        <PotteryCanvas
          mode={mode === 'colours' ? 'colours' : 'shape'}
          activeColor={activeColor}
          colorSlices={colorSlices}
          onChangeColorSlices={setColorSlices}
          profile={profile}
          onProfileChange={handleProfileChange}
          onCommitHistory={handleCommitHistory}
          clay={CLAY_TYPES[0]}
          wheelRpm={wheelRpm}
          isFired={isFired}
          isKilnFiring={isKilnModalOpen}
          kilnTemp={kilnTemp}
          onFingerTouch={(touching) => setIsTouchingPot(touching)}
        />
      </div>

      {/* 3. Top Left: Classic Back Arrow (as in both screenshots) */}
      <div className="absolute top-4 left-4 z-40 pointer-events-auto">
        <button
          onClick={handleBack}
          className="w-12 h-12 rounded-xl bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-white/50 shadow-lg flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
          title={mode === 'colours' ? 'Back to Shape' : 'Open Menu'}
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Top Center: Horizontal "colours" Bar (matching Screenshot 1) */}
      {mode === 'colours' && (
        <div className="absolute top-4 left-20 right-20 sm:left-24 sm:right-24 z-30 flex justify-center pointer-events-auto">
          <ColorsBar
            activeColor={activeColor}
            onSelectColor={setActiveColor}
          />
        </div>
      )}

      {/* 5. Top Right: Small Square Boxes (matching Screenshot 2) */}
      <RightSquareControls
        mode={mode === 'colours' ? 'colours' : 'shape'}
        onChangeMode={(newMode) => setMode(newMode)}
        onReset={handleReset}
        onReadyToFire={() => setIsKilnModalOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* 6. Subtle On-Screen Guidance Hint */}
      {!isTouchingPot && !isKilnModalOpen && !isGalleryOpen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-medium text-white/90 shadow-xl flex items-center gap-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>
              {mode === 'colours'
                ? 'Slide finger on rotating pot to paint color rings'
                : 'Put finger on rotating pot and drag to shape'}
            </span>
          </div>
        </div>
      )}

      {/* 7. Kiln Firing Chamber Modal */}
      <KilnModal
        isOpen={isKilnModalOpen}
        onClose={() => setIsKilnModalOpen(false)}
        onFiringFinished={handleFiringFinished}
        kilnTemp={kilnTemp}
        onSetKilnTemp={setKilnTemp}
        isFired={isFired}
        onSaveToGallery={handleSaveToGallery}
      />

      {/* 8. Studio Gallery Exhibition Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        items={galleryItems}
        onLoadItem={handleLoadItem}
      />
    </div>
  );
}
