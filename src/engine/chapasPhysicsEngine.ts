/**
 * FÚTBOL CHAPAS — MOTOR DE FÍSICAS Y REGLAS 2D
 * Simulación cinemática por impulsos elásticos, colisiones circulares,
 * sub-stepping numérico, cálculo de trayectorias e inteligencia artificial.
 * Exclusivamente capacidades nativas Web (Canvas 2D + Web Audio API).
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface ChapaPlayer {
  id: string;
  name: string;
  number: number;
  position: 'POR' | 'DEF' | 'MED' | 'DEL';
  isGoalkeeper: boolean;
  // Attributes (0 - 100)
  disparo: number;
  fuerza: number;
  precision: number;
  tecnica: number;
}

export interface ChapaBody {
  id: string;
  team: 'home' | 'away';
  player: ChapaPlayer;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  secondaryColor: string;
  textColor: string;
  isGoalkeeper: boolean;
}

export interface ChapaBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
}

export interface GoalPost {
  x: number;
  y: number;
  radius: number;
}

export interface TrainingCone {
  id: string;
  x: number;
  y: number;
  radius: number;
  color?: string;
}

export interface ChapasPitchConfig {
  width: number;
  height: number;
  goalY0: number;
  goalY1: number;
  goalDepth: number;
  penaltyAreaWidth: number;
  penaltyAreaDepth: number;
  centerCircleRadius: number;
  frictionBall: number;
  frictionCap: number;
  restitutionBallCap: number;
  restitutionCapCap: number;
  restitutionWall: number;
  restitutionPost: number;
  restitutionCone: number;
}

export const DEFAULT_PITCH_CONFIG: ChapasPitchConfig = {
  width: 1050,
  height: 680,
  goalY0: 260,
  goalY1: 420,
  goalDepth: 38,
  penaltyAreaWidth: 320,
  penaltyAreaDepth: 130,
  centerCircleRadius: 75,
  frictionBall: 400, // px / s^2
  frictionCap: 640,  // px / s^2
  restitutionBallCap: 0.88,
  restitutionCapCap: 0.82,
  restitutionWall: 0.75,
  restitutionPost: 0.92,
  restitutionCone: 0.85,
};

// Post positions derived from pitch configuration
export function getGoalPosts(config: ChapasPitchConfig = DEFAULT_PITCH_CONFIG): GoalPost[] {
  const r = 6;
  return [
    { x: 0, y: config.goalY0, radius: r },
    { x: 0, y: config.goalY1, radius: r },
    { x: config.width, y: config.goalY0, radius: r },
    { x: config.width, y: config.goalY1, radius: r },
  ];
}

// ---------------------------------------------------------------------------
// AUDIO SYNTHESIZER (NATIVE WEB AUDIO API - ZERO DEPENDENCIES / ZERO LATENCY)
// ---------------------------------------------------------------------------
class ChapasAudioSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playKick(powerRatio: number = 0.7) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const startFreq = 160 + 60 * powerRatio;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

      gain.gain.setValueAtTime(0.4 * powerRatio, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    } catch {
      // Audio fallback silent
    }
  }

  public playCapCollision(intensity: number = 0.5) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

      const vol = Math.min(0.35, 0.15 + intensity * 0.25);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch {}
  }

  public playPostHit() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1150, t);
      osc.frequency.exponentialRampToValueAtTime(450, t + 0.35);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    } catch {}
  }

  public playConeHit() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch {}
  }

  public playWhistle(short: boolean = false) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const dur = short ? 0.22 : 0.65;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(2600, t);
      osc2.frequency.setValueAtTime(2850, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.setValueAtTime(0.28, t + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  public playGoalHorn() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Dual tone triumphant horn
      const freqs = [330, 440, 550, 660];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(0, t + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.08 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + 1.2);
      });
    } catch {}
  }
}

export const chapasAudio = new ChapasAudioSynthesizer();

// ---------------------------------------------------------------------------
// FORMATION TACTICAL COORDINATES GENERATOR
// ---------------------------------------------------------------------------
export type ChapasFormation = '4-4-2' | '4-3-3' | '4-2-3-1' | '3-5-2' | '5-3-2';

export function getFormationCoordinates(
  formation: ChapasFormation,
  side: 'home' | 'away',
  isKickoffTeam: boolean = false,
  config: ChapasPitchConfig = DEFAULT_PITCH_CONFIG
): Vector2D[] {
  const isHome = side === 'home';
  const W = config.width;
  const H = config.height;

  // Percentage grid generator for 11 players [GK (0), 4 Def (1-4), Mid/Att (5-10)]
  // Coordinates are defined in normalized [0..1] for home attacking right (0..0.48)
  let normalized: { x: number; y: number }[] = [];

  switch (formation) {
    case '4-3-3':
      normalized = [
        { x: 0.05, y: 0.50 }, // GK
        { x: 0.17, y: 0.18 }, // LD
        { x: 0.15, y: 0.39 }, // DFC
        { x: 0.15, y: 0.61 }, // DFC
        { x: 0.17, y: 0.82 }, // LI
        { x: 0.28, y: 0.50 }, // MCD
        { x: 0.34, y: 0.28 }, // MC
        { x: 0.34, y: 0.72 }, // MC
        { x: 0.44, y: 0.20 }, // ED
        { x: isKickoffTeam ? 0.485 : 0.42, y: 0.50 }, // DC (striker placed at kickoff circle)
        { x: 0.44, y: 0.80 }, // EI
      ];
      break;

    case '4-2-3-1':
      normalized = [
        { x: 0.05, y: 0.50 }, // GK
        { x: 0.17, y: 0.18 }, // LD
        { x: 0.15, y: 0.39 }, // DFC
        { x: 0.15, y: 0.61 }, // DFC
        { x: 0.17, y: 0.82 }, // LI
        { x: 0.26, y: 0.36 }, // MCD
        { x: 0.26, y: 0.64 }, // MCD
        { x: 0.37, y: 0.22 }, // MD
        { x: 0.36, y: 0.50 }, // MCO
        { x: 0.37, y: 0.78 }, // MI
        { x: isKickoffTeam ? 0.485 : 0.43, y: 0.50 }, // DC
      ];
      break;

    case '3-5-2':
      normalized = [
        { x: 0.05, y: 0.50 }, // GK
        { x: 0.15, y: 0.28 }, // DFC
        { x: 0.14, y: 0.50 }, // DFC
        { x: 0.15, y: 0.72 }, // DFC
        { x: 0.27, y: 0.15 }, // CAD
        { x: 0.27, y: 0.85 }, // CAI
        { x: 0.30, y: 0.50 }, // MC
        { x: 0.35, y: 0.32 }, // MC
        { x: 0.35, y: 0.68 }, // MC
        { x: isKickoffTeam ? 0.485 : 0.43, y: 0.42 }, // DC1
        { x: 0.43, y: 0.58 }, // DC2
      ];
      break;

    case '5-3-2':
      normalized = [
        { x: 0.05, y: 0.50 }, // GK
        { x: 0.16, y: 0.15 }, // LD
        { x: 0.14, y: 0.33 }, // DFC
        { x: 0.13, y: 0.50 }, // DFC
        { x: 0.14, y: 0.67 }, // DFC
        { x: 0.16, y: 0.85 }, // LI
        { x: 0.28, y: 0.30 }, // MC
        { x: 0.29, y: 0.50 }, // MC
        { x: 0.28, y: 0.70 }, // MC
        { x: isKickoffTeam ? 0.485 : 0.43, y: 0.42 }, // DC1
        { x: 0.43, y: 0.58 }, // DC2
      ];
      break;

    case '4-4-2':
    default:
      normalized = [
        { x: 0.05, y: 0.50 }, // GK
        { x: 0.17, y: 0.18 }, // LD
        { x: 0.15, y: 0.39 }, // DFC
        { x: 0.15, y: 0.61 }, // DFC
        { x: 0.17, y: 0.82 }, // LI
        { x: 0.30, y: 0.18 }, // MD
        { x: 0.30, y: 0.38 }, // MC
        { x: 0.30, y: 0.62 }, // MC
        { x: 0.30, y: 0.82 }, // MI
        { x: isKickoffTeam ? 0.485 : 0.43, y: 0.44 }, // DC1
        { x: 0.43, y: 0.56 }, // DC2
      ];
      break;
  }

  return normalized.map((p) => {
    if (isHome) {
      return {
        x: Math.round(p.x * W),
        y: Math.round(p.y * H),
      };
    } else {
      // Mirrored on the away side (attacking left)
      return {
        x: Math.round((1 - p.x) * W),
        y: Math.round(p.y * H),
      };
    }
  });
}

// ---------------------------------------------------------------------------
// FACTORY: BUILD SQUAD BODIES
// ---------------------------------------------------------------------------
export function createChapaSquad(
  team: 'home' | 'away',
  players: ChapaPlayer[],
  primaryColor: string,
  secondaryColor: string,
  textColor: string,
  formation: ChapasFormation = '4-4-2',
  config: ChapasPitchConfig = DEFAULT_PITCH_CONFIG,
  isKickoffTeam: boolean = false
): ChapaBody[] {
  const coords = getFormationCoordinates(formation, team, isKickoffTeam, config);

  // Guarantee 11 players
  const squadPlayers = [...players];
  while (squadPlayers.length < 11) {
    const idx = squadPlayers.length + 1;
    squadPlayers.push({
      id: `${team}_player_${idx}`,
      name: `Jugador ${idx}`,
      number: idx,
      position: idx === 1 ? 'POR' : idx <= 5 ? 'DEF' : idx <= 9 ? 'MED' : 'DEL',
      isGoalkeeper: idx === 1,
      disparo: 72,
      fuerza: 74,
      precision: 73,
      tecnica: 72,
    });
  }

  return squadPlayers.slice(0, 11).map((pl, idx) => {
    const isGK = idx === 0 || pl.isGoalkeeper;
    const pos = coords[idx] || { x: team === 'home' ? 50 : config.width - 50, y: config.height / 2 };

    // Mass adjusted by player's physical strength
    const baseMass = isGK ? 1.35 : 1.0;
    const strengthMultiplier = 0.90 + (pl.fuerza / 100) * 0.25;
    const finalMass = Number((baseMass * strengthMultiplier).toFixed(2));

    return {
      id: pl.id || `${team}_${idx}`,
      team,
      player: { ...pl, isGoalkeeper: isGK },
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      radius: isGK ? 23 : 20,
      mass: finalMass,
      color: primaryColor || (team === 'home' ? '#2563eb' : '#dc2626'),
      secondaryColor: secondaryColor || (team === 'home' ? '#facc15' : '#ffffff'),
      textColor: textColor || '#ffffff',
      isGoalkeeper: isGK,
    };
  });
}

export function createInitialBall(config: ChapasPitchConfig = DEFAULT_PITCH_CONFIG): ChapaBall {
  return {
    x: config.width / 2,
    y: config.height / 2,
    vx: 0,
    vy: 0,
    radius: 10,
    mass: 0.35,
  };
}

/**
 * Creates training obstacles/cones for dedicated free practice mode
 */
export function createTrainingCones(config: ChapasPitchConfig = DEFAULT_PITCH_CONFIG): TrainingCone[] {
  const W = config.width;
  const H = config.height;
  const coneRadius = 14;

  return [
    // Slalom obstacle cones in midfield / attacking half
    { id: 'cone_1', x: Math.round(W * 0.58), y: Math.round(H * 0.30), radius: coneRadius, color: '#f97316' },
    { id: 'cone_2', x: Math.round(W * 0.65), y: Math.round(H * 0.50), radius: coneRadius, color: '#f59e0b' },
    { id: 'cone_3', x: Math.round(W * 0.58), y: Math.round(H * 0.70), radius: coneRadius, color: '#f97316' },
    // Defensive wall cones outside the penalty box
    { id: 'cone_4', x: Math.round(W * 0.78), y: Math.round(H * 0.40), radius: coneRadius, color: '#ea580c' },
    { id: 'cone_5', x: Math.round(W * 0.78), y: Math.round(H * 0.50), radius: coneRadius, color: '#ea580c' },
    { id: 'cone_6', x: Math.round(W * 0.78), y: Math.round(H * 0.60), radius: coneRadius, color: '#ea580c' },
    // Corner precision challenge cones
    { id: 'cone_7', x: Math.round(W * 0.88), y: Math.round(H * 0.22), radius: coneRadius, color: '#f59e0b' },
    { id: 'cone_8', x: Math.round(W * 0.88), y: Math.round(H * 0.78), radius: coneRadius, color: '#f59e0b' },
  ];
}
// ---------------------------------------------------------------------------
// SUB-STEPPING PHYSICS ENGINE WITH ROBUST ANTI-GHOSTING & ELASTIC COLLISIONS
// ---------------------------------------------------------------------------
export interface PhysicsStepResult {
  hasMotion: boolean;
  goalScoredTeam: 'home' | 'away' | null;
  postHit: boolean;
  coneHit: boolean;
  capCollision: boolean;
}

export function stepPhysics(
  caps: ChapaBody[],
  ball: ChapaBall,
  dt: number,
  config: ChapasPitchConfig = DEFAULT_PITCH_CONFIG,
  cones: TrainingCone[] = []
): PhysicsStepResult {
  let goalScoredTeam: 'home' | 'away' | null = null;
  let postHit = false;
  let coneHit = false;
  let capCollision = false;

  // 8 sub-steps for maximum stability and anti-tunneling
  const SUB_STEPS = 8;
  const subDt = dt / SUB_STEPS;
  const posts = getGoalPosts(config);

  // Velocity threshold below which bodies stop completely (zero ghost motion)
  const CAP_STOP_SPEED = 10.0;  // px / s
  const BALL_STOP_SPEED = 7.0;  // px / s

  for (let step = 0; step < SUB_STEPS; step++) {
    // 1. Position integration & Friction deceleration
    caps.forEach((cap) => {
      if (cap.vx === 0 && cap.vy === 0) return;

      cap.x += cap.vx * subDt;
      cap.y += cap.vy * subDt;

      const speed = Math.hypot(cap.vx, cap.vy);
      if (speed > CAP_STOP_SPEED) {
        // Natural surface friction + slight aerodynamic drag
        const decel = (config.frictionCap + speed * 0.35) * subDt;
        const newSpeed = Math.max(0, speed - decel);
        const factor = newSpeed / speed;
        cap.vx *= factor;
        cap.vy *= factor;
      } else {
        cap.vx = 0;
        cap.vy = 0;
      }
    });

    if (ball.vx !== 0 || ball.vy !== 0) {
      ball.x += ball.vx * subDt;
      ball.y += ball.vy * subDt;

      const ballSpeed = Math.hypot(ball.vx, ball.vy);
      if (ballSpeed > BALL_STOP_SPEED) {
        const decel = (config.frictionBall + ballSpeed * 0.25) * subDt;
        const newSpeed = Math.max(0, ballSpeed - decel);
        const factor = newSpeed / ballSpeed;
        ball.vx *= factor;
        ball.vy *= factor;
      } else {
        ball.vx = 0;
        ball.vy = 0;
      }
    }

    // 2. Cap vs Boundary collisions
    caps.forEach((cap) => {
      const minX = cap.radius;
      const maxX = config.width - cap.radius;
      const minY = cap.radius;
      const maxY = config.height - cap.radius;

      if (cap.x < minX) {
        cap.x = minX;
        cap.vx = -cap.vx * config.restitutionWall;
      } else if (cap.x > maxX) {
        cap.x = maxX;
        cap.vx = -cap.vx * config.restitutionWall;
      }

      if (cap.y < minY) {
        cap.y = minY;
        cap.vy = -cap.vy * config.restitutionWall;
      } else if (cap.y > maxY) {
        cap.y = maxY;
        cap.vy = -cap.vy * config.restitutionWall;
      }

      if (Math.hypot(cap.vx, cap.vy) < CAP_STOP_SPEED) {
        cap.vx = 0;
        cap.vy = 0;
      }
    });

    // 3. Ball vs Goal line / Posts / Boundary
    const inLeftGoalY = ball.y >= config.goalY0 && ball.y <= config.goalY1;
    const inRightGoalY = ball.y >= config.goalY0 && ball.y <= config.goalY1;

    // Check Goal Scoring (Ball fully crosses goal line)
    if (ball.x + ball.radius < 0 && inLeftGoalY) {
      if (!goalScoredTeam) {
        goalScoredTeam = 'away';
      }
      // Trap inside net and slow down rapidly
      if (ball.x < -config.goalDepth + ball.radius) {
        ball.x = -config.goalDepth + ball.radius;
        ball.vx = -ball.vx * 0.15;
      }
      if (ball.y < config.goalY0 + ball.radius) {
        ball.y = config.goalY0 + ball.radius;
        ball.vy = -ball.vy * 0.15;
      } else if (ball.y > config.goalY1 - ball.radius) {
        ball.y = config.goalY1 - ball.radius;
        ball.vy = -ball.vy * 0.15;
      }
    } else if (ball.x - ball.radius > config.width && inRightGoalY) {
      if (!goalScoredTeam) {
        goalScoredTeam = 'home';
      }
      // Trap inside net
      if (ball.x > config.width + config.goalDepth - ball.radius) {
        ball.x = config.width + config.goalDepth - ball.radius;
        ball.vx = -ball.vx * 0.15;
      }
      if (ball.y < config.goalY0 + ball.radius) {
        ball.y = config.goalY0 + ball.radius;
        ball.vy = -ball.vy * 0.15;
      } else if (ball.y > config.goalY1 - ball.radius) {
        ball.y = config.goalY1 - ball.radius;
        ball.vy = -ball.vy * 0.15;
      }
    } else {
      // Normal pitch boundaries for ball
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * config.restitutionWall;
      } else if (ball.y + ball.radius > config.height) {
        ball.y = config.height - ball.radius;
        ball.vy = -ball.vy * config.restitutionWall;
      }

      // Left sideline (outside goal mouth)
      if (ball.x - ball.radius < 0) {
        if (!inLeftGoalY) {
          ball.x = ball.radius;
          ball.vx = -ball.vx * config.restitutionWall;
        }
      }
      // Right sideline (outside goal mouth)
      if (ball.x + ball.radius > config.width) {
        if (!inRightGoalY) {
          ball.x = config.width - ball.radius;
          ball.vx = -ball.vx * config.restitutionWall;
        }
      }
    }

    // 4. Ball vs Goal Posts
    posts.forEach((post) => {
      const dx = ball.x - post.x;
      const dy = ball.y - post.y;
      const dist = Math.hypot(dx, dy);
      const minDist = ball.radius + post.radius;

      if (dist < minDist && dist > 0.0001) {
        postHit = true;
        const nx = dx / dist;
        const ny = dy / dist;

        ball.x = post.x + nx * minDist;
        ball.y = post.y + ny * minDist;

        const vn = ball.vx * nx + ball.vy * ny;
        if (vn < 0) {
          ball.vx -= (1 + config.restitutionPost) * vn * nx;
          ball.vy -= (1 + config.restitutionPost) * vn * ny;
        }
      }
    });

    // 5. Training Cones Collisions (Obstacles)
    if (cones.length > 0) {
      cones.forEach((cone) => {
        // Ball vs Cone
        const bdx = ball.x - cone.x;
        const bdy = ball.y - cone.y;
        const bdist = Math.hypot(bdx, bdy);
        const bMinDist = ball.radius + cone.radius;

        if (bdist < bMinDist && bdist > 0.0001) {
          coneHit = true;
          const bnx = bdx / bdist;
          const bny = bdy / bdist;
          ball.x = cone.x + bnx * bMinDist;
          ball.y = cone.y + bny * bMinDist;
          const bvn = ball.vx * bnx + ball.vy * bny;
          if (bvn < 0) {
            ball.vx -= (1 + config.restitutionCone) * bvn * bnx;
            ball.vy -= (1 + config.restitutionCone) * bvn * bny;
          }
        }

        // Cap vs Cone
        caps.forEach((cap) => {
          const cdx = cap.x - cone.x;
          const cdy = cap.y - cone.y;
          const cdist = Math.hypot(cdx, cdy);
          const cMinDist = cap.radius + cone.radius;

          if (cdist < cMinDist && cdist > 0.0001) {
            coneHit = true;
            const cnx = cdx / cdist;
            const cny = cdy / cdist;
            cap.x = cone.x + cnx * cMinDist;
            cap.y = cone.y + cny * cMinDist;
            const cvn = cap.vx * cnx + cap.vy * cny;
            if (cvn < 0) {
              cap.vx -= (1 + config.restitutionCone) * cvn * cnx;
              cap.vy -= (1 + config.restitutionCone) * cvn * cny;
            }
          }
        });
      });
    }

    // 6. Cap vs Ball Collisions
    caps.forEach((cap) => {
      const dx = ball.x - cap.x;
      const dy = ball.y - cap.y;
      const dist = Math.hypot(dx, dy);
      const minDist = cap.radius + ball.radius;

      if (dist < minDist && dist > 0.0001) {
        capCollision = true;
        const nx = dx / dist;
        const ny = dy / dist;

        // Position separation
        const overlap = minDist - dist;
        const totalMass = cap.mass + ball.mass;
        cap.x -= nx * overlap * (ball.mass / totalMass);
        cap.y -= ny * overlap * (ball.mass / totalMass);
        ball.x += nx * overlap * (cap.mass / totalMass);
        ball.y += ny * overlap * (cap.mass / totalMass);

        // Relative velocity along collision normal
        const rvx = ball.vx - cap.vx;
        const rvy = ball.vy - cap.vy;
        const velAlongNormal = rvx * nx + rvy * ny;

        if (velAlongNormal < -0.5) {
          const techniqueBonus = (cap.player.tecnica / 100) * 0.08;
          const e = Math.min(0.95, config.restitutionBallCap + techniqueBonus);

          const impulseMag = -(1 + e) * velAlongNormal / (1 / cap.mass + 1 / ball.mass);
          const ix = impulseMag * nx;
          const iy = impulseMag * ny;

          cap.vx -= ix / cap.mass;
          cap.vy -= iy / cap.mass;
          ball.vx += ix / ball.mass;
          ball.vy += iy / ball.mass;
        }
      }
    });

    // 7. Cap vs Cap Collisions (Elastic 2D Momentum Conservation)
    for (let i = 0; i < caps.length; i++) {
      for (let j = i + 1; j < caps.length; j++) {
        const c1 = caps[i];
        const c2 = caps[j];

        // CRUCIAL ANTI-GHOST CHECK: If both caps are stationary, NEVER displace them artificially!
        const speed1 = Math.hypot(c1.vx, c1.vy);
        const speed2 = Math.hypot(c2.vx, c2.vy);
        if (speed1 < CAP_STOP_SPEED && speed2 < CAP_STOP_SPEED) {
          continue;
        }

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = c1.radius + c2.radius;

        if (dist < minDist && dist > 0.0001) {
          capCollision = true;
          const nx = dx / dist;
          const ny = dy / dist;

          // Separation (only applied when at least one body has motion)
          const overlap = minDist - dist;
          const totalMass = c1.mass + c2.mass;
          const sep1 = nx * overlap * (c2.mass / totalMass);
          const sep2 = ny * overlap * (c2.mass / totalMass);
          c1.x -= sep1;
          c1.y -= sep2;
          c2.x += nx * overlap * (c1.mass / totalMass);
          c2.y += ny * overlap * (c1.mass / totalMass);

          // Relative velocity along normal
          const rvx = c2.vx - c1.vx;
          const rvy = c2.vy - c1.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          // Only transfer impulse if bodies are moving towards each other
          if (velAlongNormal < -0.1) {
            const e = config.restitutionCapCap;
            const impulseMag = -(1 + e) * velAlongNormal / (1 / c1.mass + 1 / c2.mass);
            const ix = impulseMag * nx;
            const iy = impulseMag * ny;

            c1.vx -= ix / c1.mass;
            c1.vy -= iy / c1.mass;
            c2.vx += ix / c2.mass;
            c2.vy += iy / c2.mass;
          }
        }
      }
    }
  }

  // Active motion check: zero-tolerance for ghost movement
  let anyCapMoving = false;
  caps.forEach((c) => {
    const s = Math.hypot(c.vx, c.vy);
    if (s < CAP_STOP_SPEED) {
      c.vx = 0;
      c.vy = 0;
    } else {
      anyCapMoving = true;
    }
  });

  const bSpeed = Math.hypot(ball.vx, ball.vy);
  let ballInMotion = false;
  if (bSpeed < BALL_STOP_SPEED) {
    ball.vx = 0;
    ball.vy = 0;
  } else {
    ballInMotion = true;
  }

  return {
    hasMotion: anyCapMoving || ballInMotion,
    goalScoredTeam,
    postHit,
    coneHit,
    capCollision,
  };
}

// ---------------------------------------------------------------------------
// IMPULSE APPLICATION & SLINGSHOT AIMING MATH
// ---------------------------------------------------------------------------
export const MAX_DRAG_DISTANCE = 95; // Agil and responsive drag distance
export const MAX_VELOCITY = 1200;    // px / s

export function calculateImpulse(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  playerDisparo: number = 75
): { vx: number; vy: number; powerRatio: number } {
  // In reverse slingshot: pulling backwards shoots forwards
  const pullDx = startX - currentX;
  const pullDy = startY - currentY;
  const rawDist = Math.hypot(pullDx, pullDy);
  const clampedDist = Math.min(MAX_DRAG_DISTANCE, rawDist);

  if (clampedDist < 6) {
    return { vx: 0, vy: 0, powerRatio: 0 };
  }

  const powerRatio = clampedDist / MAX_DRAG_DISTANCE;
  const angle = Math.atan2(pullDy, pullDx);

  // Player's shooting attribute scales the impulse
  const playerMultiplier = 0.85 + (playerDisparo / 100) * 0.30;
  const finalSpeed = powerRatio * MAX_VELOCITY * playerMultiplier;

  return {
    vx: Math.cos(angle) * finalSpeed,
    vy: Math.sin(angle) * finalSpeed,
    powerRatio,
  };
}

// ---------------------------------------------------------------------------
// KIT COLOR CONFLICT DETECTION & RESOLUTION
// ---------------------------------------------------------------------------
export function resolveKitClash(
  homePrimary: string,
  awayPrimary: string,
  awaySecondary?: string
): { awayColor: string; isClashing: boolean; badgeColor: string } {
  const parseHex = (hex: string): [number, number, number] => {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return isNaN(num) ? [37, 99, 235] : [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const [r1, g1, b1] = parseHex(homePrimary);
  const [r2, g2, b2] = parseHex(awayPrimary);

  // Euclidean color distance in RGB space
  const dist = Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));

  // If distance < 115, colors clash
  if (dist < 115) {
    // Check away secondary color
    if (awaySecondary) {
      const [rSec, gSec, bSec] = parseHex(awaySecondary);
      const distSec = Math.sqrt(Math.pow(r1 - rSec, 2) + Math.pow(g1 - gSec, 2) + Math.pow(b1 - bSec, 2));
      if (distSec >= 120) {
        return { awayColor: awaySecondary, isClashing: true, badgeColor: awaySecondary };
      }
    }
    // High-contrast fallback away colors: crisp white or golden yellow
    const luminance1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
    const fallback = luminance1 > 128 ? '#1e293b' : '#f8fafc';
    return { awayColor: fallback, isClashing: true, badgeColor: fallback };
  }

  return { awayColor: awayPrimary, isClashing: false, badgeColor: awayPrimary };
}

// ---------------------------------------------------------------------------
// ARTIFICIAL INTELLIGENCE (AI OPPONENT)
// Fast, robust, with guaranteed fallback shot so it NEVER hangs
// ---------------------------------------------------------------------------
export type AiDifficulty = 'facil' | 'normal' | 'dificil' | 'experto';

export interface AiMoveResult {
  capId: string;
  vx: number;
  vy: number;
  powerRatio: number;
}

export function aiPickMove(
  aiTeam: 'home' | 'away',
  caps: ChapaBody[],
  ball: ChapaBall,
  difficulty: AiDifficulty = 'normal',
  config: ChapasPitchConfig = DEFAULT_PITCH_CONFIG
): AiMoveResult {
  const myCaps = caps.filter((c) => c.team === aiTeam);
  if (myCaps.length === 0) {
    // Fallback emergency move
    return { capId: caps[0]?.id || '', vx: 350, vy: 0, powerRatio: 0.6 };
  }

  const opponentGoalX = aiTeam === 'away' ? 0 : config.width;
  const goalCenterY = (config.goalY0 + config.goalY1) / 2;

  let candidatePoolSize = 4;
  let noiseAngle = 0.10;
  let powerNoise = 0.08;
  let willTryBankShot = true;

  switch (difficulty) {
    case 'facil':
      candidatePoolSize = 3;
      noiseAngle = 0.25;
      powerNoise = 0.20;
      willTryBankShot = false;
      break;
    case 'normal':
      candidatePoolSize = 5;
      noiseAngle = 0.08;
      powerNoise = 0.08;
      willTryBankShot = true;
      break;
    case 'dificil':
      candidatePoolSize = 7;
      noiseAngle = 0.03;
      powerNoise = 0.04;
      willTryBankShot = true;
      break;
    case 'experto':
      candidatePoolSize = 9;
      noiseAngle = 0.01;
      powerNoise = 0.02;
      willTryBankShot = true;
      break;
  }

  // Sort caps by distance to ball (GK penalized if ball is far)
  const sortedCaps = [...myCaps].sort((a, b) => {
    const da = Math.hypot(a.x - ball.x, a.y - ball.y);
    const db = Math.hypot(b.x - ball.x, b.y - ball.y);
    const penA = a.isGoalkeeper && da > 220 ? 600 : 0;
    const penB = b.isGoalkeeper && db > 220 ? 600 : 0;
    return (da + penA) - (db + penB);
  });

  const bestCandidates = sortedCaps.slice(0, candidatePoolSize);

  let bestMove: AiMoveResult | null = null;
  let bestScore = -Infinity;

  bestCandidates.forEach((cap) => {
    const targetYSpots = [goalCenterY - 45, goalCenterY, goalCenterY + 45];

    targetYSpots.forEach((targetY) => {
      const ballToGoalDx = opponentGoalX - ball.x;
      const ballToGoalDy = targetY - ball.y;
      const ballToGoalDist = Math.hypot(ballToGoalDx, ballToGoalDy);
      if (ballToGoalDist < 1) return;

      const normBx = ballToGoalDx / ballToGoalDist;
      const normBy = ballToGoalDy / ballToGoalDist;

      // Desired impact position behind the ball
      const impactX = ball.x - normBx * (ball.radius + cap.radius);
      const impactY = ball.y - normBy * (ball.radius + cap.radius);

      const pushDx = impactX - cap.x;
      const pushDy = impactY - cap.y;
      let pushAngle = Math.atan2(pushDy, pushDx);

      // Player precision scales AI accuracy
      const precisionBonus = (cap.player.precision / 100) * 0.4;
      const finalNoise = noiseAngle * (1 - precisionBonus);
      pushAngle += (Math.random() - 0.5) * 2 * finalNoise;

      const distToGoal = Math.abs(opponentGoalX - ball.x);
      let powerRatio = 0.60 + (distToGoal / config.width) * 0.40;
      powerRatio = Math.min(1.0, Math.max(0.35, powerRatio + (Math.random() - 0.5) * powerNoise));

      const finalSpeed = powerRatio * MAX_VELOCITY * (0.85 + (cap.player.disparo / 100) * 0.30);
      const vx = Math.cos(pushAngle) * finalSpeed;
      const vy = Math.sin(pushAngle) * finalSpeed;

      const distToBall = Math.hypot(ball.x - cap.x, ball.y - cap.y);
      let score = 1000 - distToBall;

      const isGoingForward = aiTeam === 'home' ? vx > 0 : vx < 0;
      if (isGoingForward) score += 250;
      if (distToGoal < config.width * 0.45) score += 400;

      if (score > bestScore) {
        bestScore = score;
        bestMove = { capId: cap.id, vx, vy, powerRatio };
      }
    });

    // Bank shot off sideline
    if (willTryBankShot && (ball.y < 120 || ball.y > config.height - 120)) {
      const bounceWallY = ball.y < 120 ? 0 : config.height;
      const reflectedTargetY = bounceWallY + (bounceWallY - goalCenterY);
      const bankDx = opponentGoalX - ball.x;
      const bankDy = reflectedTargetY - ball.y;
      const bankDist = Math.hypot(bankDx, bankDy);

      if (bankDist > 10) {
        const normBx = bankDx / bankDist;
        const normBy = bankDy / bankDist;
        const impactX = ball.x - normBx * (ball.radius + cap.radius);
        const impactY = ball.y - normBy * (ball.radius + cap.radius);
        const pushDx = impactX - cap.x;
        const pushDy = impactY - cap.y;
        const pushAngle = Math.atan2(pushDy, pushDx);

        const powerRatio = 0.85;
        const finalSpeed = powerRatio * MAX_VELOCITY;
        const distToBall = Math.hypot(ball.x - cap.x, ball.y - cap.y);
        const score = 880 - distToBall;

        if (score > bestScore) {
          bestScore = score;
          bestMove = {
            capId: cap.id,
            vx: Math.cos(pushAngle) * finalSpeed,
            vy: Math.sin(pushAngle) * finalSpeed,
            powerRatio,
          };
        }
      }
    }
  });

  // GUARANTEED FAIL-SAFE: If no optimal angle was scored, shoot closest cap directly at ball
  if (!bestMove) {
    const closest = sortedCaps[0] || myCaps[0];
    const dx = ball.x - closest.x;
    const dy = ball.y - closest.y;
    const dist = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);
    const powerRatio = 0.75;
    const speed = powerRatio * MAX_VELOCITY;

    bestMove = {
      capId: closest.id,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      powerRatio,
    };
  }

  return bestMove;
}

