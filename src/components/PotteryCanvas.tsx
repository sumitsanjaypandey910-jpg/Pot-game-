import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ClayType, PotteryProfile, SculptTool } from '../types/pottery';
import { potteryAudio } from '../audio/potteryAudio';

interface PotteryCanvasProps {
  mode: 'shape' | 'colours' | 'ready';
  activeColor: string;
  colorSlices: string[];
  onChangeColorSlices: (newSlices: string[]) => void;
  profile: PotteryProfile;
  onProfileChange: (newProfile: PotteryProfile) => void;
  onCommitHistory?: () => void;
  clay: ClayType;
  tool?: SculptTool;
  wheelRpm: number;
  isFired: boolean;
  isKilnFiring?: boolean;
  kilnTemp?: number;
  onFingerTouch?: (isTouching: boolean, heightPercent: number, radius: number) => void;
}

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toH = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

function blendHexColor(baseHex: string, targetHex: string, factor: number): string {
  const [r1, g1, b1] = hexToRgb(baseHex);
  const [r2, g2, b2] = hexToRgb(targetHex);
  const r = r1 + (r2 - r1) * factor;
  const g = g1 + (g2 - g1) * factor;
  const b = b1 + (b2 - b1) * factor;
  return rgbToHex(r, g, b);
}

export const PotteryCanvas: React.FC<PotteryCanvasProps> = ({
  mode,
  activeColor,
  colorSlices,
  onChangeColorSlices,
  profile,
  onProfileChange,
  onCommitHistory,
  clay,
  wheelRpm,
  isFired,
  isKilnFiring = false,
  kilnTemp = 20,
  onFingerTouch,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Performance Optimization: Decouple high-frequency touch events from React re-renders
  const profileRef = useRef<PotteryProfile>(profile);
  useEffect(() => {
    profileRef.current = profile;
    isDirtyGeoRef.current = true;
  }, [profile]);

  const colorSlicesRef = useRef<string[]>(colorSlices);
  useEffect(() => {
    colorSlicesRef.current = [...colorSlices];
    isDirtyTexRef.current = true;
  }, [colorSlices]);

  const activeColorRef = useRef<string>(activeColor);
  useEffect(() => {
    activeColorRef.current = activeColor;
  }, [activeColor]);

  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Dirty flags for rAF rendering
  const isDirtyGeoRef = useRef<boolean>(true);
  const isDirtyTexRef = useRef<boolean>(true);
  const lastTexDrawTimeRef = useRef<number>(0);

  // Pre-allocated math objects to avoid GC pauses
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());

  // Interaction tracking state
  const isPointerDownRef = useRef(false);
  const lastPointerYRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const [touchEffect, setTouchEffect] = useState<{ active: boolean; x: number; y: number } | null>(null);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const potMeshRef = useRef<THREE.Mesh | null>(null);
  const wheelMeshRef = useRef<THREE.Group | null>(null);
  const turntableHeadMeshRef = useRef<THREE.Mesh | null>(null);
  const contactRingRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const particleVelocitiesRef = useRef<THREE.Vector3[]>([]);

  // Textures
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dynamicTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const turntableCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const turntableTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const potMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Wheel rotation angle
  const rotationAngleRef = useRef(0);

  // Helper to draw realistic pottery turntable texture
  const updateTurntableTexture = useCallback((withSplatters: boolean) => {
    if (!turntableCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      turntableCanvasRef.current = c;
      turntableTextureRef.current = new THREE.CanvasTexture(c);
    }
    const canvas = turntableCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Base ceramic / stone wheel head color
    const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 250);
    bgGrad.addColorStop(0, '#d1c7b8');
    bgGrad.addColorStop(0.7, '#b2a694');
    bgGrad.addColorStop(1, '#8f8372');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Concentric throwing alignment grooves
    ctx.lineWidth = 2.0;
    for (let r = 40; r < 240; r += 35) {
      ctx.strokeStyle = 'rgba(60, 50, 40, 0.40)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
      ctx.stroke();
    }

    // If in paint mode or painted: draw vibrant paint splatters
    if (withSplatters) {
      const splatterColors = ['#00bb28', '#ff007f', '#ffcc00', '#0038ff', '#e60000', '#7e00f5'];
      for (let i = 0; i < 65; i++) {
        const seedAngle = i * 0.47 * Math.PI * 2;
        const seedDist = 60 + ((i * 19) % 170);
        const px = cx + Math.cos(seedAngle) * seedDist;
        const py = cy + Math.sin(seedAngle) * seedDist;
        const radius = 3 + ((i * 7) % 18);
        const col = splatterColors[i % splatterColors.length];

        ctx.fillStyle = col;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();

        for (let d = 0; d < 3; d++) {
          const dx = px + Math.cos(seedAngle + d) * (radius * 1.6);
          const dy = py + Math.sin(seedAngle + d) * (radius * 1.6);
          ctx.beginPath();
          ctx.arc(dx, dy, radius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;
    }

    if (turntableTextureRef.current) {
      turntableTextureRef.current.needsUpdate = true;
    }
  }, []);

  // Helper to draw realistic ceramic texture with soft throwing ridges and micro-surface detail
  const renderPotTextureCanvas = useCallback(() => {
    if (!textureCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = 512; // 512x512 is 4x faster than 1024x1024 and completely lag-free
      c.height = 512;
      textureCanvasRef.current = c;
      dynamicTextureRef.current = new THREE.CanvasTexture(c);
      dynamicTextureRef.current.wrapS = THREE.RepeatWrapping;
      dynamicTextureRef.current.wrapT = THREE.ClampToEdgeWrapping;
    }

    const canvas = textureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const slices = colorSlicesRef.current;
    const slicesCount = slices.length;

    // 1. Draw smooth vertical color gradient based on colorSlices
    const grad = ctx.createLinearGradient(0, canvas.height, 0, 0); // 0 (bottom) to height (top)
    for (let i = 0; i < slicesCount; i++) {
      const pos = i / (slicesCount - 1);
      grad.addColorStop(pos, slices[i]);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Fine authentic horizontal pottery throwing ridges
    ctx.save();
    const ridgeSpacing = 4.2;
    for (let y = 0; y < canvas.height; y += ridgeSpacing) {
      // Subtle crevice shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();

      // Soft crest ridge highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(0, y + 1.6);
      ctx.lineTo(canvas.width, y + 1.6);
      ctx.stroke();
    }

    // Micro-surface ceramic mineral grain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
    for (let s = 0; s < 180; s++) {
      const sx = (s * 37) % canvas.width;
      const sy = (s * 71) % canvas.height;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }
    ctx.restore();

    if (dynamicTextureRef.current) {
      dynamicTextureRef.current.needsUpdate = true;
    }
  }, []);

  // Construct 3D Pot Geometry with outer and inner wall cavity (visible from the top opening)
  const buildPotGeometry = useCallback(() => {
    if (!potMeshRef.current) return;

    const { height, points } = profileRef.current;
    const radialSegments = 48; // Optimized for smooth 60fps
    const heightSegments = points.length - 1;

    const wallThickness = 0.065;
    const outerPoints: THREE.Vector2[] = [];
    const innerPoints: THREE.Vector2[] = [];

    // Outer wall base center
    outerPoints.push(new THREE.Vector2(0, 0));

    // Outer wall profile from bottom foot up to top rim
    for (let i = 0; i < points.length; i++) {
      const t = i / heightSegments;
      const y = t * height;
      const r = Math.max(0.18, points[i]);
      outerPoints.push(new THREE.Vector2(r, y));
    }

    // Top flared rim rounded lip peak
    const topOuterRadius = points[points.length - 1];
    const topInnerRadius = Math.max(0.14, topOuterRadius - wallThickness);
    outerPoints.push(new THREE.Vector2((topOuterRadius + topInnerRadius) / 2, height + 0.015));

    // Inner wall profile descending back down inside the cavity
    // This makes the inside of the vase visible through the top opening with realistic hollow depth
    for (let i = points.length - 1; i >= 0; i--) {
      const t = i / heightSegments;
      const y = Math.max(0.08, t * height);
      const r = Math.max(0.12, points[i] - wallThickness);
      innerPoints.push(new THREE.Vector2(r, y));
    }
    // Inner floor center
    innerPoints.push(new THREE.Vector2(0, 0.08));

    const combinedPoints = [...outerPoints, ...innerPoints];
    const newGeometry = new THREE.LatheGeometry(combinedPoints, radialSegments);
    newGeometry.computeVertexNormals();

    const oldGeo = potMeshRef.current.geometry;
    potMeshRef.current.geometry = newGeometry;
    oldGeo.dispose();
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup - positioned so the centered pot occupies ~30% of the screen height
    // Elevated angle (y: 3.8, lookAt: 1.4) allows clear view into the inside of the vase from the top opening
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 13.5);
    camera.lookAt(0, 1.4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current || undefined,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Atmospheric Natural Sunlight
    const ambientLight = new THREE.AmbientLight(0xfffdf7, 1.4);
    scene.add(ambientLight);

    // Warm sun key light creating soft highlights
    const sunKeyLight = new THREE.DirectionalLight(0xfffaec, 2.5);
    sunKeyLight.position.set(2.5, 5.0, 3.5);
    sunKeyLight.castShadow = true;
    scene.add(sunKeyLight);

    // Soft skylight fill
    const softFillLight = new THREE.DirectionalLight(0xd4f4dd, 0.9);
    softFillLight.position.set(-3.0, 3.5, -2.0);
    scene.add(softFillLight);

    // Downward angled opening light to softly illuminate inside the vase cavity
    const topInsideLight = new THREE.DirectionalLight(0xfff6ea, 1.1);
    topInsideLight.position.set(0, 6.0, 2.0);
    scene.add(topInsideLight);

    // 3D Potter's Wheel / Turntable Platform
    const wheelGroup = new THREE.Group();
    wheelMeshRef.current = wheelGroup;
    scene.add(wheelGroup);

    // Turntable head disc (top plate)
    const wheelHeadGeo = new THREE.CylinderGeometry(1.52, 1.56, 0.08, 64);
    updateTurntableTexture(mode === 'colours');

    const wheelHeadMat = new THREE.MeshStandardMaterial({
      map: turntableTextureRef.current || undefined,
      roughness: 0.55,
      metalness: 0.12,
    });
    const wheelHeadMesh = new THREE.Mesh(wheelHeadGeo, wheelHeadMat);
    wheelHeadMesh.position.y = 0;
    wheelHeadMesh.receiveShadow = true;
    wheelGroup.add(wheelHeadMesh);
    turntableHeadMeshRef.current = wheelHeadMesh;

    // Turntable lower beveled stone rim
    const wheelBevelGeo = new THREE.CylinderGeometry(1.56, 1.48, 0.04, 64);
    const wheelBevelMat = new THREE.MeshStandardMaterial({
      color: 0x82786a,
      roughness: 0.65,
      metalness: 0.15,
    });
    const wheelBevelMesh = new THREE.Mesh(wheelBevelGeo, wheelBevelMat);
    wheelBevelMesh.position.y = -0.06;
    wheelGroup.add(wheelBevelMesh);

    // Realistic soft drop shadow disc under the turntable
    const shadowGeo = new THREE.RingGeometry(0.05, 1.68, 64);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = Math.PI / 2;
    shadowMesh.position.y = -0.085;
    scene.add(shadowMesh);

    // Create Initial Clay Pot Mesh
    renderPotTextureCanvas();
    const potMaterial = new THREE.MeshStandardMaterial({
      map: dynamicTextureRef.current || undefined,
      roughness: isFired ? 0.12 : 0.58,
      metalness: isFired ? 0.06 : 0.03,
      side: THREE.DoubleSide,
    });
    potMaterialRef.current = potMaterial;

    const potMesh = new THREE.Mesh(new THREE.BufferGeometry(), potMaterial);
    potMesh.position.y = 0.045;
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    wheelGroup.add(potMesh);
    potMeshRef.current = potMesh;

    // Contact visual ring
    const ringGeo = new THREE.TorusGeometry(1.0, 0.015, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0044ff,
      transparent: true,
      opacity: 0,
    });
    const contactRing = new THREE.Mesh(ringGeo, ringMat);
    contactRing.rotation.x = Math.PI / 2;
    contactRing.position.y = 1.0;
    scene.add(contactRing);
    contactRingRef.current = contactRing;

    // Particle system for clay slip
    const particleCount = 20;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = 0;
      particlePositions[p * 3 + 1] = -100;
      particlePositions[p * 3 + 2] = 0;
      velocities.push(new THREE.Vector3(0, 0, 0));
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleVelocitiesRef.current = velocities;

    const particleMat = new THREE.PointsMaterial({
      color: 0xe5dfd3,
      size: 0.03,
      transparent: true,
      opacity: 0.65,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);
    particlesRef.current = particlePoints;

    // Build initial geometry
    buildPotGeometry();

    // 60FPS Lag-Free Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Rotate Wheel and Pot continuously
      if (wheelGroup && wheelRpm > 0) {
        const radPerSec = (wheelRpm / 60) * Math.PI * 2;
        rotationAngleRef.current += radPerSec * delta;
        wheelGroup.rotation.y = rotationAngleRef.current;
      }

      // Lag-Free Geometry Update: Only rebuild geometry when dirty, once per frame
      if (isDirtyGeoRef.current) {
        buildPotGeometry();
        isDirtyGeoRef.current = false;
      }

      // Lag-Free Texture Update: Throttled to max 40FPS uploads during drag
      if (isDirtyTexRef.current && currentTime - lastTexDrawTimeRef.current > 24) {
        renderPotTextureCanvas();
        isDirtyTexRef.current = false;
        lastTexDrawTimeRef.current = currentTime;
      }

      // Update particles
      if (particlesRef.current && isPointerDownRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;
        for (let p = 0; p < particleCount; p++) {
          const v = particleVelocitiesRef.current[p];
          if (posArr[p * 3 + 1] > -50) {
            posArr[p * 3] += v.x * delta;
            posArr[p * 3 + 1] += v.y * delta;
            posArr[p * 3 + 2] += v.z * delta;
            v.y -= 1.6 * delta;
            if (posArr[p * 3 + 1] < 0.05) {
              posArr[p * 3 + 1] = -100;
            }
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, [buildPotGeometry, renderPotTextureCanvas, updateTurntableTexture, wheelRpm]);

  // Update turntable texture when mode changes (paint splatters)
  useEffect(() => {
    updateTurntableTexture(mode === 'colours');
    if (turntableHeadMeshRef.current && turntableTextureRef.current) {
      (turntableHeadMeshRef.current.material as THREE.MeshStandardMaterial).map = turntableTextureRef.current;
      (turntableHeadMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
  }, [mode, updateTurntableTexture]);

  // Material update for kiln firing
  useEffect(() => {
    if (potMaterialRef.current) {
      potMaterialRef.current.roughness = isFired ? 0.12 : 0.58;
      potMaterialRef.current.metalness = isFired ? 0.06 : 0.03;

      if (isKilnFiring && kilnTemp) {
        const heatNorm = Math.min(1, Math.max(0, (kilnTemp - 200) / 1000));
        potMaterialRef.current.emissive = new THREE.Color(0xff2200).multiplyScalar(heatNorm * 1.6);
      } else {
        potMaterialRef.current.emissive = new THREE.Color(0x000000);
      }
      potMaterialRef.current.needsUpdate = true;
    }
  }, [isFired, isKilnFiring, kilnTemp]);

  useEffect(() => {
    potteryAudio.setWheelSpeed(wheelRpm);
  }, [wheelRpm]);

  const spawnContactParticles = (touchY: number, touchRadius: number) => {
    if (!particlesRef.current) return;
    const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const count = posArr.length / 3;

    for (let k = 0; k < 2; k++) {
      const idx = Math.floor(Math.random() * count);
      const angle = rotationAngleRef.current;
      posArr[idx * 3] = touchRadius * Math.cos(angle);
      posArr[idx * 3 + 1] = touchY + 0.045;
      posArr[idx * 3 + 2] = touchRadius * Math.sin(angle);

      const speed = (wheelRpm / 60) * 1.5;
      particleVelocitiesRef.current[idx].set(
        -Math.sin(angle) * speed + (Math.random() - 0.5) * 0.3,
        Math.random() * 0.4 + 0.1,
        Math.cos(angle) * speed + (Math.random() - 0.5) * 0.3
      );
    }
    posAttr.needsUpdate = true;
  };

  // Convert client pointer into heightNorm using reused Raycaster and projected bounds
  const calculateHeightNorm = (clientX: number, clientY: number, rect: DOMRect): number => {
    if (!cameraRef.current) return 0.5;

    // 1. Raycast against 3D pot mesh
    if (potMeshRef.current) {
      mouseVecRef.current.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
      const hits = raycasterRef.current.intersectObject(potMeshRef.current, false);
      if (hits.length > 0) {
        const hitY = hits[0].point.y;
        return Math.min(1, Math.max(0, (hitY - 0.045) / profileRef.current.height));
      }
    }

    // 2. Projected 3D bounds when dragging slightly outside
    const camera = cameraRef.current;
    const baseWorld = new THREE.Vector3(0, 0.045, 0).project(camera);
    const topWorld = new THREE.Vector3(0, profileRef.current.height + 0.045, 0).project(camera);

    const baseScreenY = (1 - baseWorld.y) / 2;
    const topScreenY = (1 - topWorld.y) / 2;
    const relY = (clientY - rect.top) / rect.height;

    const span = baseScreenY - topScreenY;
    if (span <= 0) return 0.5;

    const norm = (baseScreenY - relY) / span;
    return Math.min(1, Math.max(0, norm));
  };

  // Fast in-place color blending on mutable slices
  const applyPaintAtHeightFast = (heightNorm: number, blendPower: number = 0.7) => {
    const slices = colorSlicesRef.current;
    const total = slices.length;
    const centerIdx = Math.floor(heightNorm * (total - 1));
    const brushRadius = 5.0;

    for (let i = 0; i < total; i++) {
      const dist = Math.abs(i - centerIdx);
      if (dist <= brushRadius * 2) {
        const falloff = Math.exp(-(dist * dist) / (2 * brushRadius * brushRadius));
        const factor = falloff * blendPower;
        if (factor > 0.01) {
          slices[i] = blendHexColor(slices[i], activeColorRef.current, factor);
        }
      }
    }
    isDirtyTexRef.current = true;
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isFired) return;
    const container = containerRef.current;
    if (!container) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isPointerDownRef.current = true;
    lastPointerXRef.current = e.clientX;
    lastPointerYRef.current = e.clientY;

    const rect = container.getBoundingClientRect();
    const heightNorm = calculateHeightNorm(e.clientX, e.clientY, rect);
    const sliceIdx = Math.floor(heightNorm * (profileRef.current.points.length - 1));
    const currentRadius = profileRef.current.points[sliceIdx] || 0.8;

    if (contactRingRef.current) {
      contactRingRef.current.position.y = heightNorm * profileRef.current.height + 0.045;
      contactRingRef.current.scale.set(currentRadius, currentRadius, 1);
      (contactRingRef.current.material as THREE.MeshBasicMaterial).color.set(
        modeRef.current === 'colours' ? activeColorRef.current : 0x0044ff
      );
      (contactRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0.75;
    }

    setTouchEffect({
      active: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    if (modeRef.current === 'colours') {
      applyPaintAtHeightFast(heightNorm, 0.85);
      potteryAudio.playSpongeSound();
    } else {
      potteryAudio.startClayFriction(0.6);
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }

    onFingerTouch?.(true, heightNorm, currentRadius);
  };

  // Pointer Move (Zero GC, Zero React re-renders = completely lag-free)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || isFired) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const heightNorm = calculateHeightNorm(e.clientX, e.clientY, rect);
    const deltaX = (e.clientX - lastPointerXRef.current) / rect.width;
    lastPointerXRef.current = e.clientX;
    lastPointerYRef.current = e.clientY;

    const currentPoints = profileRef.current.points;
    const sliceIdx = Math.min(
      currentPoints.length - 1,
      Math.max(0, Math.floor(heightNorm * (currentPoints.length - 1)))
    );

    if (modeRef.current === 'colours') {
      applyPaintAtHeightFast(heightNorm, 0.40);
      potteryAudio.updateClayFriction(0.35);
    } else {
      // In-place sculpting
      const sigma = 4.2;
      const radiusShift = deltaX * 8.5;

      for (let i = 0; i < currentPoints.length; i++) {
        const dist = Math.abs(i - sliceIdx);
        const weight = Math.exp(-(dist * dist) / (2 * sigma * sigma));
        if (weight > 0.01) {
          const updatedRadius = currentPoints[i] + radiusShift * weight;
          currentPoints[i] = Math.min(1.60, Math.max(0.35, updatedRadius));
        }
      }
      isDirtyGeoRef.current = true;
      potteryAudio.updateClayFriction(Math.min(1, 0.4 + Math.abs(deltaX) * 14));
    }

    const currentRadius = currentPoints[sliceIdx] || 0.8;
    if (contactRingRef.current) {
      contactRingRef.current.position.y = heightNorm * profileRef.current.height + 0.045;
      contactRingRef.current.scale.set(currentRadius, currentRadius, 1);
    }

    spawnContactParticles(heightNorm * profileRef.current.height, currentRadius);

    setTouchEffect({
      active: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    onFingerTouch?.(true, heightNorm, currentRadius);
  };

  // Pointer Up: Flush state to React and audio
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Safe release
    }
    isPointerDownRef.current = false;

    if (contactRingRef.current) {
      (contactRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    setTouchEffect(null);
    potteryAudio.stopClayFriction();
    onFingerTouch?.(false, 0, 0);

    // Commit changes to parent React state
    onProfileChange({
      height: profileRef.current.height,
      points: [...profileRef.current.points],
    });
    onChangeColorSlices([...colorSlicesRef.current]);
    onCommitHistory?.();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
      style={{ touchAction: 'none' }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Tactile finger touch ripple */}
      {touchEffect && touchEffect.active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
          style={{ left: touchEffect.x, top: touchEffect.y }}
        >
          <div
            className="w-12 h-12 rounded-full border-2 animate-ping absolute"
            style={{ borderColor: mode === 'colours' ? activeColor : '#0044ff' }}
          />
          <div
            className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center border"
            style={{
              backgroundColor: mode === 'colours' ? `${activeColor}40` : 'rgba(0, 68, 255, 0.25)',
              borderColor: mode === 'colours' ? activeColor : '#0044ff',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: mode === 'colours' ? activeColor : '#ffffff' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
