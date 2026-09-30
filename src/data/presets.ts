import { ClayType, GlazeColor, ChallengePreset, PotteryProfile, PaintColor } from '../types/pottery';

export const PROFILE_RESOLUTION = 64;
export const NATURAL_CLAY_COLOR = '#ded6c4';

export const PRIMARY_COLORS: PaintColor[] = [
  { id: 'blue', name: 'Blue', color: '#0038ff', checkColor: '#ffffff' },
  { id: 'purple', name: 'Purple', color: '#7e00f5', checkColor: '#ffffff' },
  { id: 'pink', name: 'Pink', color: '#ff007f', checkColor: '#ffffff' },
  { id: 'red', name: 'Red', color: '#e60000', checkColor: '#ffffff' },
  { id: 'yellow', name: 'Yellow', color: '#ffcc00', checkColor: '#1a1a1a' },
  { id: 'green', name: 'Green', color: '#00b828', checkColor: '#ffffff' },
];

// Default elegant ceramic vase matching the reference screenshot
export const createDefaultProfile = (): PotteryProfile => {
  const points: number[] = [];
  const count = PROFILE_RESOLUTION;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    let r: number;
    if (t < 0.08) {
      // Foot base on turntable
      const localT = t / 0.08;
      r = 0.36 + localT * 0.12;
    } else if (t < 0.40) {
      // Graceful swelling belly
      const localT = (t - 0.08) / 0.32;
      const curve = Math.sin(localT * Math.PI * 0.5);
      r = 0.48 + curve * 0.58; // peaks gracefully at ~1.06
    } else if (t < 0.72) {
      // Long gentle inward taper towards neck
      const localT = (t - 0.40) / 0.32;
      const smooth = localT * localT * (3 - 2 * localT);
      r = 1.06 - smooth * 0.66; // tapers to ~0.40
    } else if (t < 0.86) {
      // Slender neck throat
      const localT = (t - 0.72) / 0.14;
      r = 0.40 + localT * 0.03; // ~0.40 - 0.43
    } else {
      // Flaring trumpet rim and rounded lip
      const localT = (t - 0.86) / 0.14;
      const flare = localT * localT;
      r = 0.43 + flare * 0.24; // flares to ~0.67
    }
    points.push(r);
  }
  return {
    height: 3.1,
    points,
  };
};

export const CLAY_TYPES: ClayType[] = [
  {
    id: 'natural_stoneware',
    name: 'Natural Stoneware',
    color: '#ded6c4',
    roughness: 0.75,
    metalness: 0.04,
    bumpScale: 0.03,
    description: 'Silky smooth natural studio clay shown in the original pottery workshop.',
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    color: '#b85d38',
    roughness: 0.82,
    metalness: 0.05,
    bumpScale: 0.04,
    description: 'Earthy porous red clay with warmth and rich iron oxide tones.',
  },
  {
    id: 'stoneware',
    name: 'Speckled Buff',
    color: '#d6c1a8',
    roughness: 0.78,
    metalness: 0.03,
    bumpScale: 0.05,
    description: 'Durable, naturally speckled sandy clay ideal for functional vessels.',
  },
  {
    id: 'porcelain',
    name: 'Imperial Porcelain',
    color: '#f4ede4',
    roughness: 0.65,
    metalness: 0.02,
    bumpScale: 0.02,
    description: 'Refined pure kaolin clay capable of delicate, translucent walls.',
  },
  {
    id: 'basalt',
    name: 'Black Basalt',
    color: '#2a2826',
    roughness: 0.86,
    metalness: 0.12,
    bumpScale: 0.06,
    description: 'Dark volcanic stoneware with deep matte mineral textures.',
  },
  {
    id: 'raku',
    name: 'Smoked Raku',
    color: '#4a3b32',
    roughness: 0.9,
    metalness: 0.18,
    bumpScale: 0.08,
    description: 'Traditional wood-fired Japanese clay with dramatic reduction marks.',
  },
];

export const GLAZE_COLORS: GlazeColor[] = [
  {
    id: 'celadon',
    name: 'Song Celadon',
    color: '#7fa99b',
    roughness: 0.22,
    metalness: 0.05,
    clearcoat: 0.9,
    finish: 'celadon',
  },
  {
    id: 'cobalt',
    name: 'Ming Cobalt',
    color: '#1a4480',
    roughness: 0.18,
    metalness: 0.1,
    clearcoat: 0.95,
    finish: 'glossy',
  },
  {
    id: 'ochre',
    name: 'Sunken Ochre',
    color: '#d48c3b',
    roughness: 0.35,
    metalness: 0.08,
    clearcoat: 0.75,
    finish: 'glossy',
  },
  {
    id: 'crimson',
    name: 'Oxblood Crimson',
    color: '#8b263e',
    roughness: 0.2,
    metalness: 0.08,
    clearcoat: 0.9,
    finish: 'glossy',
  },
  {
    id: 'matte_slate',
    name: 'Kuro Charcoal',
    color: '#1f2421',
    roughness: 0.85,
    metalness: 0.05,
    clearcoat: 0.1,
    finish: 'matte',
  },
  {
    id: 'turquoise',
    name: 'Persian Turquoise',
    color: '#2e9389',
    roughness: 0.25,
    metalness: 0.06,
    clearcoat: 0.88,
    finish: 'crackle',
  },
  {
    id: 'gold_luster',
    name: '24K Gold Kintsugi',
    color: '#dfa637',
    roughness: 0.12,
    metalness: 0.92,
    clearcoat: 0.7,
    finish: 'metallic',
  },
  {
    id: 'ivory_crackle',
    name: 'Ivory Crackle',
    color: '#ebe5d8',
    roughness: 0.3,
    metalness: 0.04,
    clearcoat: 0.85,
    finish: 'crackle',
  },
];

// Helper to generate target curves
function generateSmoothCurve(anchors: [number, number][]): number[] {
  const count = PROFILE_RESOLUTION;
  const result: number[] = [];
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    // Find surrounding anchors
    let lower = anchors[0];
    let upper = anchors[anchors.length - 1];
    
    for (let a = 0; a < anchors.length - 1; a++) {
      if (t >= anchors[a][0] && t <= anchors[a + 1][0]) {
        lower = anchors[a];
        upper = anchors[a + 1];
        break;
      }
    }
    
    const segmentT = upper[0] === lower[0] ? 0 : (t - lower[0]) / (upper[0] - lower[0]);
    // Smooth step interpolation
    const smoothT = segmentT * segmentT * (3 - 2 * segmentT);
    const radius = lower[1] + (upper[1] - lower[1]) * smoothT;
    result.push(radius);
  }
  
  return result;
}

export const CHALLENGE_PRESETS: ChallengePreset[] = [
  {
    id: 'amphora',
    name: 'Athenian Amphora',
    culture: 'Classical Greece (c. 520 BCE)',
    description: 'A stately vessel with a narrow foot, voluptuous belly, tapered neck, and flared rim.',
    difficulty: 'Artisan',
    targetHeight: 2.6,
    recommendedClay: 'terracotta',
    targetPoints: generateSmoothCurve([
      [0.0, 0.45],  // narrow foot
      [0.12, 0.55],
      [0.42, 1.25], // wide belly
      [0.68, 0.75], // shoulder
      [0.82, 0.48], // slim neck
      [0.94, 0.55],
      [1.0, 0.72],  // flared lip
    ]),
  },
  {
    id: 'chawan',
    name: 'Wabi-Sabi Chawan',
    culture: 'Momoyama Japan (c. 1580)',
    description: 'An organic, contemplative matcha tea bowl with grounded foot, generous bowl, and softly undulating rim.',
    difficulty: 'Apprentice',
    targetHeight: 1.4,
    recommendedClay: 'raku',
    targetPoints: generateSmoothCurve([
      [0.0, 0.65],  // stable foot
      [0.15, 0.72],
      [0.45, 1.15], // comforting bowl belly
      [0.8, 1.22],  // gentle flare
      [1.0, 1.18],  // quiet rim
    ]),
  },
  {
    id: 'lekythos',
    name: 'Roman Lekythos Flask',
    culture: 'Ancient Rome (c. 100 CE)',
    description: 'An oil flask designed with a cylindrical body, defined angular shoulder, and slender pipette neck.',
    difficulty: 'Master',
    targetHeight: 2.8,
    recommendedClay: 'stoneware',
    targetPoints: generateSmoothCurve([
      [0.0, 0.5],
      [0.1, 0.78],
      [0.6, 0.82],  // cylindrical body
      [0.72, 0.78], // shoulder turn
      [0.82, 0.35], // very narrow neck
      [0.92, 0.38],
      [1.0, 0.58],  // cup-like flared rim
    ]),
  },
  {
    id: 'bauhaus',
    name: 'Bauhaus Modernist Vase',
    culture: 'Weimar Germany (c. 1923)',
    description: 'Clean rationalist geometry featuring a sphere transitioning into an unadorned architectural cylinder.',
    difficulty: 'Artisan',
    targetHeight: 2.3,
    recommendedClay: 'porcelain',
    targetPoints: generateSmoothCurve([
      [0.0, 0.48],
      [0.32, 1.18], // bulbous lower sphere
      [0.62, 0.62], // neck transition
      [0.85, 0.62], // pure straight cylinder
      [1.0, 0.62],
    ]),
  },
  {
    id: 'tagine',
    name: 'Berber Tagine Base',
    culture: 'Atlas Mountains, Morocco',
    description: 'A shallow, wide ceramic dish with thick thermal walls and an inner groove designed for slow steaming.',
    difficulty: 'Apprentice',
    targetHeight: 1.2,
    recommendedClay: 'terracotta',
    targetPoints: generateSmoothCurve([
      [0.0, 1.1],
      [0.3, 1.4],
      [0.7, 1.48],
      [0.9, 1.35],
      [1.0, 1.25],
    ]),
  },
];
