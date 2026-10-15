export type AppStep = 'wheel' | 'glaze' | 'kiln' | 'gallery' | 'challenges';

export type InteractionMode = 'shape' | 'colours' | 'ready' | 'gallery';

export type LightingMode = 'morning' | 'golden' | 'moonlit';

export type SculptTool = 'finger' | 'sponge' | 'rib' | 'fluting' | 'pull_up' | 'flatten';

export interface PotteryProfile {
  height: number;
  points: number[]; // Radii from bottom (index 0) to top (index length - 1)
}

export interface PaintColor {
  id: string;
  name: string;
  color: string;
  checkColor?: string;
}

export interface ClayType {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  bumpScale: number;
  description: string;
}

export interface GlazeColor {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  finish: 'glossy' | 'matte' | 'crackle' | 'metallic' | 'celadon';
}

export interface PatternDecal {
  id: string;
  name: string;
  type: 'greek_meander' | 'sakura' | 'wave' | 'rings' | 'dots' | 'tribal';
  color: string;
  yPosition: number; // 0 (bottom) to 1 (top)
  repeats: number;
  heightRatio: number; // 0.1 to 0.4
}

export interface ChallengePreset {
  id: string;
  name: string;
  culture: string;
  description: string;
  difficulty: 'Apprentice' | 'Artisan' | 'Master';
  targetHeight: number;
  targetPoints: number[];
  recommendedClay: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  clay: ClayType;
  glaze: GlazeColor;
  patterns: PatternDecal[];
  profile: PotteryProfile;
  appraisalValue: number;
  curatorNotes: string;
  thumbnail?: string;
}
