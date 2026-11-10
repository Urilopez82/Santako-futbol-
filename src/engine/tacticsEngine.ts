import { Club } from '../types/club';
import { Player, Position } from '../types/player';
import { 
  DayTrainingSchedule,
  DEFAULT_TEAM_INSTRUCTIONS, 
  DEFAULT_WEEKLY_TRAINING, 
  FORMATIONS, 
  FormationSlot, 
  OpponentScoutingReport, 
  PlannedSubstitution, 
  PlayerLockerRoomProfile, 
  PlayerTacticalRole, 
  POSITION_ROLES_MAP, 
  PressConference, 
  PressQuestion, 
  SetPieceTakers, 
  TeamTacticalInstructions, 
  WeeklyTrainingPlan 
} from '../types/tactics';

/**
 * Initializes and ensures all tactical, training, and locker-room state structures
 * are fully populated and valid on the club object.
 */
export function ensureClubTacticsState(club: Club, playersMap: Record<string, Player>): Club {
  if (!club) return club;
  let updatedClub = { ...club };

  // 1. Team tactical instructions
  if (!updatedClub.teamInstructions) {
    updatedClub.teamInstructions = { ...DEFAULT_TEAM_INSTRUCTIONS };
  }

  // 2. Custom formation slots
  if (!updatedClub.customFormationSlots || updatedClub.customFormationSlots.length === 0) {
    const preset = FORMATIONS[updatedClub.tacticFormation] || FORMATIONS['4-3-3'];
    updatedClub.customFormationSlots = preset.slots.map((s) => ({ ...s }));
  }

  // 3. Set Piece Takers
  if (!updatedClub.setPieceTakers) {
    const starters = (updatedClub.startingElevenIds || [])
      .map((id) => playersMap[id])
      .filter(Boolean);

    // Pick captain (highest leadership & age)
    const sortedCaptains = [...starters].sort((a, b) => (b.attributes.liderazgo * 1.5 + b.age) - (a.attributes.liderazgo * 1.5 + a.age));
    const captainId = sortedCaptains[0]?.id || starters[0]?.id || '';
    const viceCaptainId = sortedCaptains[1]?.id || starters[1]?.id || '';

    // Penalty takers (highest disparo)
    const sortedShooters = [...starters].sort((a, b) => b.attributes.disparo - a.attributes.disparo);
    const penaltyTakerId = sortedShooters[0]?.id || captainId;
    const secondPenaltyTakerId = sortedShooters[1]?.id || viceCaptainId;

    // Free kick takers (vision + disparo)
    const sortedFK = [...starters].sort((a, b) => (b.attributes.disparo + b.attributes.vision) - (a.attributes.disparo + a.attributes.vision));
    const directFreekickTakerId = sortedFK[0]?.id || penaltyTakerId;
    const longFreekickTakerId = sortedFK[1]?.id || captainId;

    // Corner takers (highest pase)
    const sortedPassers = [...starters].sort((a, b) => b.attributes.pase - a.attributes.pase);
    const leftCornerTakerId = sortedPassers[0]?.id || viceCaptainId;
    const rightCornerTakerId = sortedPassers[1]?.id || directFreekickTakerId;

    updatedClub.setPieceTakers = {
      captainId,
      viceCaptainId,
      penaltyTakerId,
      secondPenaltyTakerId,
      directFreekickTakerId,
      longFreekickTakerId,
      leftCornerTakerId,
      rightCornerTakerId,
    };
  }

  // 4. Individual Player Instructions
  if (!updatedClub.playerInstructions) {
    updatedClub.playerInstructions = {};
  }
  const currentInstructions = { ...updatedClub.playerInstructions };
  const allSquadIds = [...(updatedClub.startingElevenIds || []), ...(updatedClub.benchPlayerIds || []), ...(updatedClub.playerIds || [])];

  allSquadIds.forEach((pid) => {
    if (!currentInstructions[pid] && playersMap[pid]) {
      const p = playersMap[pid];
      const availableRoles = POSITION_ROLES_MAP[p.primaryPosition] || ['Jugador de Equipo'];
      currentInstructions[pid] = {
        playerId: pid,
        role: availableRoles[0] || 'Titular',
        duty: p.primaryPosition === 'POR' || ['DFC', 'LD', 'LI', 'MCD'].includes(p.primaryPosition) ? 'Defensa' : 'Ataque',
        mentalidad: 'Equilibrada',
        libertadMovimiento: 'Ceñirse a la Posición',
        responsabilidadDefensiva: 'Ayudar en Defensa',
        posicionPartida: 'Centrado',
        instruccionesConBalon: p.attributes.disparo > 75 ? 'Disparar en Cuanto Haya Hueco' : 'Asegurar Posesión',
        instruccionesSinBalon: 'Cerrar Líneas',
      };
    }
  });
  updatedClub.playerInstructions = currentInstructions;

  // 5. Weekly Training Plan
  if (!updatedClub.weeklyTraining) {
    updatedClub.weeklyTraining = { ...DEFAULT_WEEKLY_TRAINING, individualFoci: {} };
  }

  // 6. Planned Substitutions
  if (!updatedClub.plannedSubs) {
    updatedClub.plannedSubs = [];
  }

  // 7. Locker Room Dynamics
  if (!updatedClub.lockerRoomDynamics) {
    updatedClub.lockerRoomDynamics = {};
  }
  const currentDynamics = { ...updatedClub.lockerRoomDynamics };
  allSquadIds.forEach((pid) => {
    if (!currentDynamics[pid] && playersMap[pid]) {
      const p = playersMap[pid];
      const isStarter = (updatedClub.startingElevenIds || []).includes(pid);
      const isBench = (updatedClub.benchPlayerIds || []).includes(pid);
      
      currentDynamics[pid] = {
        playerId: pid,
        morale: p.morale || 80,
        confidence: 75,
        ambition: p.overallRating > 78 ? 'Alta' : p.age <= 21 ? 'Desmedida' : 'Media',
        professionalism: p.attributes.liderazgo > 70 ? 'Ejemplar' : 'Alta',
        leadership: p.attributes.liderazgo || 50,
        coachRelationship: 'Buena',
        playingTimeSatisfaction: isStarter ? 'Indispensable' : isBench ? 'Satisfecho' : 'Preocupado',
        concerns: !isStarter && !isBench && p.overallRating >= 70 ? ['Desea disponer de más minutos oficiales'] : [],
      };
    }
  });
  updatedClub.lockerRoomDynamics = currentDynamics;

  return updatedClub;
}

/**
 * Generates an exhaustive scouting and analytical breakdown for the next fixture's rival.
 */
export function generateOpponentReport(
  rivalClub: Club,
  playersMap: Record<string, Player>,
  userClub: Club
): OpponentScoutingReport {
  const rivalStarters = (rivalClub.startingElevenIds || [])
    .map((id) => playersMap[id])
    .filter(Boolean);

  const keyPlayers = rivalStarters
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 3)
    .map((p) => ({
      name: `${p.firstName} ${p.lastName}`,
      position: p.primaryPosition,
      rating: p.overallRating,
      threatSummary: p.primaryPosition === 'DC' || p.primaryPosition === 'ED' || p.primaryPosition === 'EI'
        ? `Goleador implacable con ${p.attributes.disparo} en disparo y gran velocidad.`
        : p.primaryPosition === 'MC' || p.primaryPosition === 'MCO'
        ? `Cerebro creativo con ${p.attributes.vision} en visión de juego y precisión de pase.`
        : `Líder de la zaga, contundente en duelos (${p.attributes.defensa} en defensa).`,
    }));

  const formation = rivalClub.tacticFormation || '4-4-2';
  const mentality = rivalClub.tacticMentality || 'Equilibrada';

  // Determine strengths & weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const avgDef = rivalStarters.filter(p => ['DFC', 'LD', 'LI', 'MCD'].includes(p.primaryPosition));
  const avgAtt = rivalStarters.filter(p => ['DC', 'ED', 'EI', 'MCO'].includes(p.primaryPosition));

  const defScore = avgDef.length > 0 ? avgDef.reduce((acc, p) => acc + p.attributes.defensa, 0) / avgDef.length : 70;
  const attScore = avgAtt.length > 0 ? avgAtt.reduce((acc, p) => acc + p.attributes.disparo, 0) / avgAtt.length : 70;

  if (defScore >= 74) {
    strengths.push('Bloque defensivo muy ordenado y difícil de desarmar por dentro.');
  } else {
    weaknesses.push('Concede espacios en los centros laterales y sufre con balones a la espalda.');
  }

  if (attScore >= 75) {
    strengths.push('Eficacia de cara a puerta y peligro constante en el área rival.');
  } else {
    weaknesses.push('Poca pólvora si se les incomoda en la salida y se les fuerza a disparar desde lejos.');
  }

  if (formation.includes('3-') || formation.includes('5-')) {
    strengths.push('Densidad en carril central y gran despliegue de los carrileros.');
    weaknesses.push('Espacios desprotegidos a las espaldas de los carrileros si se les contragolpea rápido.');
  } else {
    strengths.push('Amplitud natural por bandas y apoyos constantes.');
    weaknesses.push('Puede sufrir inferioridad numérica en mediocampo ante un trivote estructurado.');
  }

  const threatLevel: OpponentScoutingReport['threatLevel'] =
    rivalClub.reputation > userClub.reputation + 8
      ? 'Peligro Máximo'
      : rivalClub.reputation > userClub.reputation + 2
      ? 'Alto'
      : rivalClub.reputation >= userClub.reputation - 5
      ? 'Moderado'
      : 'Bajo';

  // Technical analyst counter-measure advice
  let counterInstruction = 'Presión';
  let counterSetting = 'Media';
  let counterRationale = 'Mantener la disciplina y no precipitarse en las coberturas.';

  if (threatLevel === 'Peligro Máximo' || mentality === 'Al Ataque') {
    counterInstruction = 'Transiciones y Bloque';
    counterSetting = 'Repliegue Intensivo + Contraataque Rápido';
    counterRationale = 'El rival acumulará muchos efectivos en campo contrario; castigar al contragolpe con balones directos al espacio.';
  } else if (weaknesses.some(w => w.includes('espaldas de los carrileros') || w.includes('centros laterales'))) {
    counterInstruction = 'Anchura y Centros';
    counterSetting = 'Muy Abierto + Centros Tensos';
    counterRationale = 'Explotar las bandas con extremos bien abiertos y poner balones agresivos al primer palo.';
  } else {
    counterInstruction = 'Presión tras Pérdida';
    counterSetting = 'Presión Alta + Ritmo Rápido';
    counterRationale = 'Incomodar su salida de balón en campo propio para forzar pérdidas forzadas.';
  }

  return {
    rivalClubId: rivalClub.id,
    rivalClubName: rivalClub.name,
    rivalClubCode: rivalClub.code,
    formation,
    keyPlayers,
    strengths,
    weaknesses,
    playStyle: `${rivalClub.tacticMentality} · ${rivalClub.tacticPassing || 'Mixto'}`,
    recentResults: ['V', 'E', 'V', 'D', 'V'],
    threatLevel,
    analystAdvice: `Informe del Analista: Se prevé un rival ordenado bajo el dibujo ${formation}. Recomiendo cautela en las transiciones y no descuidar los balones a balón parado.`,
    recommendedCounterMeasure: {
      instructionName: counterInstruction,
      setting: counterSetting,
      rationale: counterRationale,
    },
  };
}

/**
 * Generates an immersive, context-driven press conference (pre or post-match).
 */
export function generatePressConference(
  club: Club,
  rivalClub: Club | null,
  context: {
    type: 'PRE_PARTIDO' | 'POST_PARTIDO';
    matchResult?: {
      userScore: number;
      rivalScore: number;
      isDerby?: boolean;
      matchday: number;
    };
  }
): PressConference {
  const isPre = context.type === 'PRE_PARTIDO';
  const rivalName = rivalClub?.name || 'el próximo rival';

  const questions: PressQuestion[] = [];

  if (isPre) {
    // Pre-match press conference questions
    questions.push({
      id: 'q_pre_approach',
      journalistName: 'Carlos Martínez',
      mediaOutlet: 'Diario Marca',
      question: `Míster, se miden al ${rivalName}. ¿Cuál va a ser la seña de identidad del equipo sobre el terreno de juego?`,
      options: [
        {
          text: 'Saldremos a mandar, ser protagonistas con el balón y buscar la victoria desde el minuto uno.',
          tone: 'CONFIADO',
          moraleDelta: +3,
          boardConfidenceDelta: +2,
          fanApprovalDelta: +4,
          playerPressureDelta: +2,
          reactionSummary: 'La afición celebra la ambición del técnico y la plantilla asume el reto.',
        },
        {
          text: 'Será un choque muy disputado; debemos ser inteligentes, conceder poco atrás y aprovechar nuestras oportunidades.',
          tone: 'PRUDENTE',
          moraleDelta: +1,
          boardConfidenceDelta: +1,
          fanApprovalDelta: +1,
          playerPressureDelta: -2,
          reactionSummary: 'Un mensaje cauto que rebaja los nervios de los futbolistas de cara al encuentro.',
        },
        {
          text: 'No me vale otra cosa que el 100% de intensidad. Si alguien se relaja se irá al banquillo.',
          tone: 'EXIGENTE',
          moraleDelta: -1,
          boardConfidenceDelta: +3,
          fanApprovalDelta: +3,
          playerPressureDelta: +5,
          reactionSummary: 'La plantilla siente la alta exigencia del técnico antes de saltar al césped.',
        },
        {
          text: 'Confío ciegamente en mis jugadores. Han trabajado magnífico toda la semana y merecen triunfar.',
          tone: 'PROTECTOR',
          moraleDelta: +4,
          boardConfidenceDelta: +1,
          fanApprovalDelta: +2,
          playerPressureDelta: -3,
          reactionSummary: 'El vestuario agradece el respaldo incondicional de su entrenador.',
        },
      ],
    });

    questions.push({
      id: 'q_pre_rival',
      journalistName: 'Laura Domínguez',
      mediaOutlet: 'Cadena SER (El Larguero)',
      question: `El ${rivalName} llega con un bloque muy sólido. ¿Teme que puedan sorprenderles en jugadas a balón parado o al contraataque?`,
      options: [
        {
          text: 'Los hemos analizado al detalle; sabemos perfectamente dónde hacerles daño y cómo contrarrestar sus virtudes.',
          tone: 'CONFIADO',
          moraleDelta: +3,
          boardConfidenceDelta: +2,
          fanApprovalDelta: +2,
          playerPressureDelta: +1,
          reactionSummary: 'Demuestra seguridad en la preparación y el plan de partido.',
        },
        {
          text: 'Cualquier detalle puede decantar la balanza en esta categoría. La concentración debe ser máxima.',
          tone: 'PRUDENTE',
          moraleDelta: +1,
          boardConfidenceDelta: +1,
          fanApprovalDelta: +1,
          playerPressureDelta: 0,
          reactionSummary: 'Palabras sensatas que destacan el respeto al oponente.',
        },
        {
          text: 'Si nosotros estamos a nuestro nivel, el rival tendrá que preocuparse mucho más por nosotros que nosotros por ellos.',
          tone: 'CONFIADO',
          moraleDelta: +4,
          boardConfidenceDelta: 0,
          fanApprovalDelta: +4,
          playerPressureDelta: +3,
          reactionSummary: 'Declaraciones que encienden a la grada y motivan a los atacantes.',
        },
        {
          text: 'Cualquier error se paga caro. He pedido a los futbolistas responsabilidad individual en cada marca.',
          tone: 'EXIGENTE',
          moraleDelta: 0,
          boardConfidenceDelta: +2,
          fanApprovalDelta: +2,
          playerPressureDelta: +4,
          reactionSummary: 'La defensa toma nota de la rigurosidad pedida por el míster.',
        },
      ],
    });
  } else {
    // Post-match press conference questions
    const res = context.matchResult || { userScore: 1, rivalScore: 0, matchday: 1 };
    const won = res.userScore > res.rivalScore;
    const drew = res.userScore === res.rivalScore;
    const scoreStr = `${res.userScore}-${res.rivalScore}`;

    questions.push({
      id: 'q_post_verdict',
      journalistName: 'Álvaro Montero',
      mediaOutlet: 'Mundo Deportivo',
      question: won
        ? `Enhorabuena míster por la victoria (${scoreStr}). ¿Siente que el plan trazado en la pizarra se ha cumplido a rajatabla?`
        : drew
        ? `Empate (${scoreStr}) tras 90 minutos de enorme desgaste. ¿Le sabe a poco el punto o lo considera valioso?`
        : `Dura derrota (${scoreStr}) frente al ${rivalName}. ¿Qué lectura hace de lo ocurrido hoy sobre el verde?`,
      options: won
        ? [
            {
              text: 'Ha sido un triunfo de equipo. Los chicos han interpretado el partido de forma impecable.',
              tone: 'PROTECTOR',
              moraleDelta: +5,
              boardConfidenceDelta: +3,
              fanApprovalDelta: +5,
              playerPressureDelta: -2,
              reactionSummary: 'El vestuario sale fortalecido y la afición festeja los 3 puntos.',
            },
            {
              text: 'Contento con el resultado, pero aún tenemos margen de mejora. No podemos permitirnos desconexiones.',
              tone: 'EXIGENTE',
              moraleDelta: +2,
              boardConfidenceDelta: +4,
              fanApprovalDelta: +3,
              playerPressureDelta: +2,
              reactionSummary: 'La directiva valora que el técnico mantenga los pies en el suelo.',
            },
            {
              text: 'Demostramos que somos candidatos a todo si jugamos con esta fe y entrega.',
              tone: 'CONFIADO',
              moraleDelta: +4,
              boardConfidenceDelta: +2,
              fanApprovalDelta: +6,
              playerPressureDelta: +2,
              reactionSummary: 'Euforia en la sala de prensa y alta comunión con los aficionados.',
            },
            {
              text: 'Tres puntos de oro que dan tranquilidad para seguir trabajando día a día con humildad.',
              tone: 'PRUDENTE',
              moraleDelta: +2,
              boardConfidenceDelta: +2,
              fanApprovalDelta: +2,
              playerPressureDelta: -3,
              reactionSummary: 'Mensaje sereno que ayuda a digerir el triunfo con profesionalidad.',
            },
          ]
        : [
            {
              text: 'Asumo toda la responsabilidad de la derrota. El planteamiento no funcionó y el culpable soy yo.',
              tone: 'PROTECTOR',
              moraleDelta: +3,
              boardConfidenceDelta: -1,
              fanApprovalDelta: +1,
              playerPressureDelta: -5,
              reactionSummary: 'El vestuario valora enormemente que el entrenador ejerza de paraguas ante las críticas.',
            },
            {
              text: 'No podemos conceder lo que hemos concedido hoy. Habrá consecuencias y cambios en la alineación.',
              tone: 'EXIGENTE',
              moraleDelta: -4,
              boardConfidenceDelta: +2,
              fanApprovalDelta: +2,
              playerPressureDelta: +6,
              reactionSummary: 'Tensión en el vestuario; los futbolistas se sienten señalados.',
            },
            {
              text: 'El fútbol a veces es injusto. Hicimos méritos para más y este tropiezo nos hará más fuertes.',
              tone: 'CONFIADO',
              moraleDelta: +2,
              boardConfidenceDelta: 0,
              fanApprovalDelta: +1,
              playerPressureDelta: -1,
              reactionSummary: 'Ánimo constructivo para pasar página cuanto antes.',
            },
            {
              text: 'Hay que tener calma. La temporada es muy larga y todos los equipos pasan por baches.',
              tone: 'PRUDENTE',
              moraleDelta: +1,
              boardConfidenceDelta: +1,
              fanApprovalDelta: -1,
              playerPressureDelta: -2,
              reactionSummary: 'Paciencia solicitada a la grada y al entorno del club.',
            },
          ],
    });
  }

  return {
    id: `press_${context.type}_${Date.now()}`,
    type: context.type,
    date: new Date().toISOString().slice(0, 10),
    matchId: 'current_match',
    rivalClubName: rivalName,
    headline: isPre
      ? `Rueda de Prensa Previa: ${club.name} vs ${rivalName}`
      : `Comparecencia Oficial Post-Partido: ${club.name}`,
    questions,
    completed: false,
  };
}

/**
 * Checks all squad players for suspensions, injury restrictions, and position conflicts.
 */
export function checkSquadEligibility(
  club: Club,
  playersMap: Record<string, Player>
): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const starters = (club.startingElevenIds || []).map((id) => playersMap[id]).filter(Boolean);
  const bench = (club.benchPlayerIds || []).map((id) => playersMap[id]).filter(Boolean);

  if (starters.length < 11) {
    errors.push(`El once titular está incompleto (${starters.length}/11 jugadores seleccionados).`);
  }

  // Goalkeeper check
  const hasStarterGK = starters.some((p) => p.primaryPosition === 'POR');
  if (!hasStarterGK) {
    errors.push('No hay ningún portero (POR) alineado en el once titular.');
  }

  // Check injuries in squad
  starters.forEach((p) => {
    if (p.isInjured) {
      errors.push(`El titular ${p.firstName} ${p.lastName} está lesionado (${p.injuryName || 'lesión'}) y no puede jugar.`);
    }
    if (p.isSuspended) {
      errors.push(`El titular ${p.firstName} ${p.lastName} está sancionado (${p.suspensionMatchesLeft || 1} partido restante).`);
    }
    if (p.fitness < 70) {
      warnings.push(`${p.firstName} ${p.lastName} presenta baja condición física (${p.fitness}%), riesgo elevado de lesión.`);
    }
  });

  bench.forEach((p) => {
    if (p.isInjured) {
      errors.push(`El suplente ${p.firstName} ${p.lastName} está lesionado y no puede estar en la convocatoria.`);
    }
    if (p.isSuspended) {
      errors.push(`El suplente ${p.firstName} ${p.lastName} está sancionado.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Simulates daily training schedule execution, physical recovery/fatigue,
 * and attribute progression for players with individual focus.
 */
export function processDailyTraining(
  club: Club,
  playersMap: Record<string, Player>,
  currentDate: string
): {
  updatedClub: Club;
  updatedPlayers: Record<string, Player>;
  trainingAlerts: string[];
} {
  const assuredClub = ensureClubTacticsState(club, playersMap);
  const updatedPlayers = { ...playersMap };
  const trainingAlerts: string[] = [];

  const dateObj = new Date(currentDate);
  // 0: Domingo, 1: Lunes, 2: Martes, 3: Miercoles, 4: Jueves, 5: Viernes, 6: Sabado
  const dayIndex = dateObj.getDay();
  // Schedule array index: 0 is Lunes, 1 is Martes, ..., 6 is Domingo
  const schedIdx = dayIndex === 0 ? 6 : dayIndex - 1;
  const scheduleForToday: DayTrainingSchedule = assuredClub.weeklyTraining?.schedule?.[schedIdx] || {
    dayName: 'Lunes',
    morning: 'TACTICA_AUTOMATISMOS',
    afternoon: 'TECNICA_PASE',
  };

  const isRestOrFisio =
    (scheduleForToday.morning === 'DESCANSO_TOTAL' || scheduleForToday.morning === 'RECUPERACION_FISIOTERAPIA') &&
    (scheduleForToday.afternoon === 'DESCANSO_TOTAL' || scheduleForToday.afternoon === 'RECUPERACION_FISIOTERAPIA');

  const facilityLevel = assuredClub.facilities?.trainingGroundLevel || 2;
  const load = assuredClub.weeklyTraining?.collectiveIntensity || 'Media';
  const loadFitnessCost = load === 'Alta' ? 4 : load === 'Baja' ? 1 : 2;
  const loadProgressMult = load === 'Alta' ? 1.4 : load === 'Baja' ? 0.75 : 1.0;

  // Process all club players
  const playerIds = assuredClub.playerIds || [];
  playerIds.forEach((pid) => {
    const p = updatedPlayers[pid];
    if (!p) return;

    let newFitness = p.fitness;
    let newMorale = p.morale;

    if (p.isInjured) {
      // Injured players do not train, they recover
      return;
    }

    if (isRestOrFisio) {
      // Enhanced recovery
      newFitness = Math.min(100, newFitness + 8);
      newMorale = Math.min(100, newMorale + 1);
    } else {
      // Normal training day
      if (newFitness < 85) {
        // Natural gradual recovery if resting or low load
        newFitness = Math.min(100, newFitness + 2);
      } else {
        newFitness = Math.max(50, newFitness - loadFitnessCost);
      }
    }

    // Check individual training focus
    const indFocus = assuredClub.weeklyTraining?.individualFoci?.[pid];
    let attributesUpdated = false;
    const newAttributes = { ...p.attributes };

    if (indFocus) {
      const extraIntensity = indFocus.intensity === 'Intensa';
      if (extraIntensity) {
        newFitness = Math.max(45, newFitness - 2);
      }

      // Progression chance: scaled by facility (1-5), youth factor, and load
      const youthFactor = p.age <= 21 ? 1.6 : p.age <= 25 ? 1.2 : p.age >= 31 ? 0.4 : 0.8;
      const baseChance = (0.015 * (facilityLevel / 2) * youthFactor * loadProgressMult * (extraIntensity ? 1.4 : 1.0));

      if (Math.random() < baseChance) {
        const attrKey = indFocus.attributeFocus;
        if (attrKey in newAttributes && typeof newAttributes[attrKey] === 'number') {
          const currentVal = newAttributes[attrKey] as number;
          if (currentVal < 99 && currentVal < p.potential) {
            newAttributes[attrKey] = currentVal + 1;
            attributesUpdated = true;
            trainingAlerts.push(
              `¡Progresión! ${p.firstName} ${p.lastName} ha mejorado su atributo de ${indFocus.attributeFocus} (+1 -> ${newAttributes[attrKey]}).`
            );
          }
        }
      }
    }

    // Recalculate OVR if attributes changed
    let newOvr = p.overallRating;
    if (attributesUpdated) {
      if (p.primaryPosition === 'POR') {
        newOvr = Math.round(
          ((newAttributes.reflejos || 60) * 0.4 +
            (newAttributes.paradas || 60) * 0.4 +
            newAttributes.defensa * 0.1 +
            newAttributes.pase * 0.1)
        );
      } else if (p.primaryPosition === 'DC') {
        newOvr = Math.round(
          newAttributes.disparo * 0.4 +
            newAttributes.regate * 0.2 +
            newAttributes.velocidad * 0.2 +
            newAttributes.fuerza * 0.1 +
            newAttributes.pase * 0.1
        );
      } else if (['MC', 'MCO', 'MCD'].includes(p.primaryPosition)) {
        newOvr = Math.round(
          newAttributes.pase * 0.35 +
            newAttributes.vision * 0.25 +
            newAttributes.regate * 0.15 +
            newAttributes.defensa * 0.15 +
            newAttributes.resistencia * 0.1
        );
      } else {
        newOvr = Math.round(
          newAttributes.defensa * 0.4 +
            newAttributes.fuerza * 0.2 +
            newAttributes.velocidad * 0.2 +
            newAttributes.resistencia * 0.1 +
            newAttributes.pase * 0.1
        );
      }
      newOvr = Math.max(40, Math.min(99, newOvr));
    }

    updatedPlayers[pid] = {
      ...p,
      fitness: newFitness,
      morale: newMorale,
      attributes: newAttributes,
      overallRating: newOvr,
    };
  });

  // Monday injury recovery step: decrement injuryWeeksLeft
  if (dayIndex === 1) {
    playerIds.forEach((pid) => {
      const p = updatedPlayers[pid];
      if (p && p.isInjured && p.injuryWeeksLeft !== undefined) {
        const nextWeeks = p.injuryWeeksLeft - 1;
        if (nextWeeks <= 0) {
          updatedPlayers[pid] = {
            ...p,
            isInjured: false,
            injuryWeeksLeft: 0,
            injuryName: undefined,
            fitness: 75,
          };
          trainingAlerts.push(
            `¡Alta médica! ${p.firstName} ${p.lastName} se ha recuperado completamente de su lesión y se reincorpora al grupo.`
          );
        } else {
          updatedPlayers[pid] = {
            ...p,
            injuryWeeksLeft: nextWeeks,
          };
        }
      }
    });
  }

  return {
    updatedClub: assuredClub,
    updatedPlayers,
    trainingAlerts,
  };
}
