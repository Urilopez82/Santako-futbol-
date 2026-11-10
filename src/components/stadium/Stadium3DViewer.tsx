import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Club } from '../../types/club';
import { Camera, Eye, Hammer, Maximize2, RotateCcw, Sparkles } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface Stadium3DViewerProps {
  club: Club;
  previewUpgrade?: boolean;
}

export const Stadium3DViewer: React.FC<Stadium3DViewerProps> = ({ club, previewUpgrade = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showExtension, setShowExtension] = useState<boolean>(previewUpgrade);
  const [cameraView, setCameraView] = useState<'aerial' | 'main' | 'pitch' | 'behindGoal'>('aerial');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitAnglesRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3.5,
    radius: 110,
  });

  const baseCapacity = club.stadium.capacity;
  const expandedCapacity = baseCapacity + 15000;
  const effectiveCapacity = showExtension ? expandedCapacity : baseCapacity;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    scene.fog = new THREE.FogExp2('#090d16', 0.0035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 600);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    dirLight.position.set(60, 90, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Subtle blue fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-60, 50, -40);
    scene.add(fillLight);

    // Primary and Secondary Colors
    const primaryHex = club.primaryColor || '#1e3a8a';
    const secondaryHex = club.secondaryColor || '#dc2626';
    const primaryColor = new THREE.Color(primaryHex);
    const secondaryColor = new THREE.Color(secondaryHex);

    // 5. Pitch & Grass
    const pitchWidth = 68;
    const pitchLength = 105;

    // Main green field
    const fieldGeo = new THREE.PlaneGeometry(pitchLength + 16, pitchWidth + 16);
    const fieldMat = new THREE.MeshStandardMaterial({
      color: 0x155724,
      roughness: 0.8,
      metalness: 0.1,
    });
    const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
    fieldMesh.rotation.x = -Math.PI / 2;
    fieldMesh.receiveShadow = true;
    scene.add(fieldMesh);

    // Mown grass pattern stripes
    const stripeCount = 10;
    const stripeWidth = pitchLength / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const stripeGeo = new THREE.PlaneGeometry(stripeWidth, pitchWidth);
      const isAlt = i % 2 === 0;
      const stripeMat = new THREE.MeshStandardMaterial({
        color: isAlt ? 0x1b682e : 0x155724,
        roughness: 0.75,
        metalness: 0.05,
      });
      const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
      stripeMesh.rotation.x = -Math.PI / 2;
      stripeMesh.position.set(-pitchLength / 2 + stripeWidth * (i + 0.5), 0.01, 0);
      scene.add(stripeMesh);
    }

    // White Pitch Line Markings
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const createLine = (w: number, h: number, x: number, z: number, rotY = 0) => {
      const g = new THREE.PlaneGeometry(w, h);
      const m = new THREE.Mesh(g, lineMat);
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = rotY;
      m.position.set(x, 0.02, z);
      scene.add(m);
    };

    const lw = 0.35;
    // Outer touchlines
    createLine(pitchLength, lw, 0, -pitchWidth / 2);
    createLine(pitchLength, lw, 0, pitchWidth / 2);
    createLine(lw, pitchWidth, -pitchLength / 2, 0);
    createLine(lw, pitchWidth, pitchLength / 2, 0);
    // Halfway line
    createLine(lw, pitchWidth, 0, 0);

    // Center Circle
    const circleGeo = new THREE.RingGeometry(9.15 - lw / 2, 9.15 + lw / 2, 48);
    const circleMesh = new THREE.Mesh(circleGeo, lineMat);
    circleMesh.rotation.x = -Math.PI / 2;
    circleMesh.position.set(0, 0.02, 0);
    scene.add(circleMesh);

    // Center Spot
    const spotGeo = new THREE.CircleGeometry(0.5, 16);
    const spotMesh = new THREE.Mesh(spotGeo, lineMat);
    spotMesh.rotation.x = -Math.PI / 2;
    spotMesh.position.set(0, 0.02, 0);
    scene.add(spotMesh);

    // Penalty Boxes
    const boxW = 16.5;
    const boxH = 40.3;
    // Left penalty box
    createLine(lw, boxH, -pitchLength / 2 + boxW, 0);
    createLine(boxW, lw, -pitchLength / 2 + boxW / 2, -boxH / 2);
    createLine(boxW, lw, -pitchLength / 2 + boxW / 2, boxH / 2);
    // Right penalty box
    createLine(lw, boxH, pitchLength / 2 - boxW, 0);
    createLine(boxW, lw, pitchLength / 2 - boxW / 2, -boxH / 2);
    createLine(boxW, lw, pitchLength / 2 - boxW / 2, boxH / 2);

    // 3D Goalposts
    const goalPostMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.5 });
    const createGoal = (xSide: number) => {
      const postRadius = 0.18;
      const goalW = 7.32;
      const goalH = 2.44;
      const goalD = 2.0;

      const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalH, 16);
      const post1 = new THREE.Mesh(postGeo, goalPostMat);
      post1.position.set(xSide * pitchLength / 2, goalH / 2, -goalW / 2);
      scene.add(post1);

      const post2 = new THREE.Mesh(postGeo, goalPostMat);
      post2.position.set(xSide * pitchLength / 2, goalH / 2, goalW / 2);
      scene.add(post2);

      const crossbarGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalW, 16);
      const crossbar = new THREE.Mesh(crossbarGeo, goalPostMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(xSide * pitchLength / 2, goalH, 0);
      scene.add(crossbar);

      // Simple Net
      const netMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, wireframe: true, transparent: true, opacity: 0.4 });
      const netGeo = new THREE.BoxGeometry(goalD, goalH, goalW);
      const net = new THREE.Mesh(netGeo, netMat);
      net.position.set(xSide * (pitchLength / 2 + goalD / 2), goalH / 2, 0);
      scene.add(net);
    };
    createGoal(-1);
    createGoal(1);

    // 6. Grandstands (Graderíos con asientos en colores del club)
    const standMatPrimary = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.65 });
    const standMatSecondary = new THREE.MeshStandardMaterial({ color: secondaryColor, roughness: 0.65 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.9,
    });

    const hasTier2 = effectiveCapacity >= 20000;
    const hasTier3 = effectiveCapacity >= 50000;
    const hasFullRoof = effectiveCapacity >= 30000 || showExtension;

    // Helper to build a tiered stand
    const buildStand = (length: number, depth: number, height: number, posX: number, posZ: number, rotY: number, hasVIP = false) => {
      const standGroup = new THREE.Group();

      // Tier 1 Base
      const steps = 6;
      for (let s = 0; s < steps; s++) {
        const stepH = (height * 0.45) / steps;
        const stepD = depth / steps;
        const stepGeo = new THREE.BoxGeometry(length, stepH * (s + 1), stepD);
        const mat = s % 2 === 0 ? standMatPrimary : standMatSecondary;
        const stepMesh = new THREE.Mesh(stepGeo, mat);
        stepMesh.position.set(0, (stepH * (s + 1)) / 2, (s - steps / 2) * stepD);
        stepMesh.castShadow = true;
        stepMesh.receiveShadow = true;
        standGroup.add(stepMesh);
      }

      // VIP Boxes (Palcos de cristal)
      if (hasVIP) {
        const vipH = 2.2;
        const vipGeo = new THREE.BoxGeometry(length * 0.9, vipH, depth * 0.5);
        const vipMesh = new THREE.Mesh(vipGeo, glassMat);
        vipMesh.position.set(0, height * 0.45 + vipH / 2, depth * 0.15);
        standGroup.add(vipMesh);
      }

      // Tier 2 (Upper Tier) if capacity warrants
      if (hasTier2) {
        const tier2Steps = 6;
        const tier2H = height * 0.55;
        const tier2OffsetZ = depth * 0.25;
        for (let s = 0; s < tier2Steps; s++) {
          const stepH = tier2H / tier2Steps;
          const stepD = (depth * 1.1) / tier2Steps;
          const stepGeo = new THREE.BoxGeometry(length * 1.05, stepH * (s + 1), stepD);
          const mat = s % 3 === 0 ? standMatSecondary : standMatPrimary;
          const stepMesh = new THREE.Mesh(stepGeo, mat);
          stepMesh.position.set(
            0,
            height * 0.5 + (stepH * (s + 1)) / 2,
            tier2OffsetZ + (s - tier2Steps / 2) * stepD
          );
          stepMesh.castShadow = true;
          stepMesh.receiveShadow = true;
          standGroup.add(stepMesh);
        }
      }

      // Tier 3 (Giant Ring) if 50k+
      if (hasTier3) {
        const tier3Steps = 4;
        const tier3H = height * 0.4;
        for (let s = 0; s < tier3Steps; s++) {
          const stepH = tier3H / tier3Steps;
          const stepD = (depth * 0.9) / tier3Steps;
          const stepGeo = new THREE.BoxGeometry(length * 1.08, stepH * (s + 1), stepD);
          const stepMesh = new THREE.Mesh(stepGeo, standMatPrimary);
          stepMesh.position.set(0, height * 1.05 + (stepH * (s + 1)) / 2, depth * 0.8 + s * stepD);
          standGroup.add(stepMesh);
        }
      }

      // Roof Canopy
      if (hasFullRoof || hasVIP) {
        const roofLen = length * 1.12;
        const roofDepth = depth * 1.35;
        const roofH = hasTier3 ? height * 1.6 : hasTier2 ? height * 1.25 : height * 0.8;
        const roofGeo = new THREE.BoxGeometry(roofLen, 0.6, roofDepth);
        const roofMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.8,
          roughness: 0.3,
        });
        const roofMesh = new THREE.Mesh(roofGeo, roofMat);
        roofMesh.position.set(0, roofH, -depth * 0.1);
        roofMesh.rotation.x = 0.08;
        roofMesh.castShadow = true;
        standGroup.add(roofMesh);

        // Roof support pillars
        const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, roofH, 12);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
        const p1 = new THREE.Mesh(pillarGeo, pillarMat);
        p1.position.set(-roofLen * 0.45, roofH / 2, depth * 0.5);
        standGroup.add(p1);
        const p2 = new THREE.Mesh(pillarGeo, pillarMat);
        p2.position.set(roofLen * 0.45, roofH / 2, depth * 0.5);
        standGroup.add(p2);
      }

      // Concrete back wall
      const totalH = hasTier3 ? height * 1.5 : hasTier2 ? height * 1.1 : height * 0.6;
      const wallGeo = new THREE.BoxGeometry(length * 1.08, totalH, 1);
      const wallMesh = new THREE.Mesh(wallGeo, concreteMat);
      wallMesh.position.set(0, totalH / 2, depth * (hasTier3 ? 1.2 : hasTier2 ? 0.8 : 0.5));
      standGroup.add(wallMesh);

      standGroup.position.set(posX, 0, posZ);
      standGroup.rotation.y = rotY;
      scene.add(standGroup);
    };

    // 4 Grandstands around the pitch
    const sideStandLen = pitchLength + 10;
    const endStandLen = pitchWidth + 14;
    const standDepth = 15;
    const standHeight = 12;

    // South: Tribuna Principal (with VIP boxes and roof)
    buildStand(sideStandLen, standDepth, standHeight, 0, pitchWidth / 2 + standDepth / 2 + 5, 0, true);
    // North: Lateral
    buildStand(sideStandLen, standDepth, standHeight, 0, -(pitchWidth / 2 + standDepth / 2 + 5), Math.PI, false);
    // West: Fondo Norte
    buildStand(endStandLen, standDepth, standHeight, -(pitchLength / 2 + standDepth / 2 + 5), 0, Math.PI / 2, false);
    // East: Fondo Sur
    buildStand(endStandLen, standDepth, standHeight, pitchLength / 2 + standDepth / 2 + 5, 0, -Math.PI / 2, false);

    // 7. Corner Floodlight Towers (4 Torres de Iluminación)
    const createFloodlight = (x: number, z: number) => {
      const towerGroup = new THREE.Group();
      const mastH = 34;
      const mastGeo = new THREE.CylinderGeometry(0.4, 0.9, mastH, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = mastH / 2;
      towerGroup.add(mast);

      // Lamp Head
      const headGeo = new THREE.BoxGeometry(5, 3.5, 0.8);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, mastH, 0);
      head.rotation.y = Math.atan2(-z, -x);
      head.rotation.x = 0.35;
      towerGroup.add(head);

      // Glowing Lamps Face
      const glowGeo = new THREE.PlaneGeometry(4.6, 3.1);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(0, mastH, 0.45);
      glow.rotation.y = Math.atan2(-z, -x);
      glow.rotation.x = 0.35;
      towerGroup.add(glow);

      towerGroup.position.set(x, 0, z);
      scene.add(towerGroup);
    };

    const lightOffsetX = pitchLength * 0.72;
    const lightOffsetZ = pitchWidth * 0.88;
    createFloodlight(-lightOffsetX, -lightOffsetZ);
    createFloodlight(lightOffsetX, -lightOffsetZ);
    createFloodlight(-lightOffsetX, lightOffsetZ);
    createFloodlight(lightOffsetX, lightOffsetZ);

    // 8. Electronic Scoreboard (Videomarcador) on East Stand
    const scoreboardGeo = new THREE.BoxGeometry(16, 6, 0.8);
    const scoreboardMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.2 });
    const scoreboard = new THREE.Mesh(scoreboardGeo, scoreboardMat);
    scoreboard.position.set(pitchLength / 2 + 18, 22, 0);
    scoreboard.rotation.y = -Math.PI / 2;
    scene.add(scoreboard);

    // Screen face with club colors glow
    const screenGeo = new THREE.PlaneGeometry(15, 5.2);
    const screenMat = new THREE.MeshBasicMaterial({ color: primaryColor });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(pitchLength / 2 + 17.55, 22, 0);
    screenMesh.rotation.y = -Math.PI / 2;
    scene.add(screenMesh);

    // 9. Camera setup and Orbit function
    const updateCameraPos = () => {
      const { theta, phi, radius } = orbitAnglesRef.current;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.set(x, Math.max(8, y), z);
      camera.lookAt(0, 4, 0);
    };

    updateCameraPos();

    // 10. Pointer Drag & Orbit Controls
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      orbitAnglesRef.current.theta -= deltaX * 0.007;
      orbitAnglesRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2.1, orbitAnglesRef.current.phi - deltaY * 0.007));
      updateCameraPos();
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitAnglesRef.current.radius = Math.max(35, Math.min(220, orbitAnglesRef.current.radius + e.deltaY * 0.08));
      updateCameraPos();
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 11. Animation Loop
    const animate = () => {
      if (autoRotate && !isDraggingRef.current) {
        orbitAnglesRef.current.theta += 0.0025;
        updateCameraPos();
      }
      renderer.render(scene, camera);
      reqIdRef.current = requestAnimationFrame(animate);
    };
    reqIdRef.current = requestAnimationFrame(animate);

    // 12. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight || 420;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [club.id, club.primaryColor, club.secondaryColor, showExtension, effectiveCapacity, autoRotate]);

  // Quick Camera Presets
  const handleSetPreset = (preset: 'aerial' | 'main' | 'pitch' | 'behindGoal') => {
    playClickSound();
    setCameraView(preset);
    if (!cameraRef.current) return;

    if (preset === 'aerial') {
      orbitAnglesRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 115 };
    } else if (preset === 'main') {
      orbitAnglesRef.current = { theta: 0, phi: Math.PI / 2.7, radius: 80 };
    } else if (preset === 'pitch') {
      orbitAnglesRef.current = { theta: Math.PI / 6, phi: Math.PI / 2.2, radius: 52 };
    } else if (preset === 'behindGoal') {
      orbitAnglesRef.current = { theta: Math.PI / 2, phi: Math.PI / 2.5, radius: 75 };
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-[440px] md:h-[500px] cursor-grab active:cursor-grabbing select-none"
      />

      {/* Top Header Overlay with Stadium Info */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-xl shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
              style={{ backgroundColor: club.primaryColor }}
            />
            <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
              {club.stadium.name}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono-num font-medium">({club.city})</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs font-mono-num">
            <span className="text-slate-300">
              Aforo:{' '}
              <strong className={showExtension ? 'text-amber-400 font-black' : 'text-emerald-400'}>
                {effectiveCapacity.toLocaleString()} espectadores
              </strong>
            </span>
            {showExtension && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold font-sans">
                PROYECTO AMPLIACIÓN +15.000
              </span>
            )}
          </div>
        </div>

        {/* Extensions Toggle Switch */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-lg pointer-events-auto">
          <button
            onClick={() => {
              playClickSound();
              setShowExtension(!showExtension);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-condensed uppercase tracking-wide rounded-lg transition-all ${
              showExtension
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>{showExtension ? 'Obras Activadas' : 'Ver Proyecto Ampliación'}</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setAutoRotate(!autoRotate);
            }}
            title={autoRotate ? 'Pausar rotación automática' : 'Activar rotación automática'}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              autoRotate
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          </button>
        </div>
      </div>

      {/* Bottom Camera Presets & Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Camera Views */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-lg pointer-events-auto text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold px-2 hidden sm:inline">Cámara:</span>
          {[
            { id: 'aerial', label: 'Aérea 360°' },
            { id: 'main', label: 'Tribuna' },
            { id: 'pitch', label: 'A Ras de Césped' },
            { id: 'behindGoal', label: 'Fondo' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSetPreset(preset.id as any)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                cameraView === preset.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* 3D Features Tag */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg text-[11px] text-slate-400 font-sans pointer-events-auto hidden md:flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Arrastra para rotar · Rueda del ratón para zoom</span>
        </div>
      </div>
    </div>
  );
};
