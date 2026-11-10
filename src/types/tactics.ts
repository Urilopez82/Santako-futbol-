import { Position } from './player';

export interface FormationSlot {
  slotIndex: number;          // 0 to 10 (0 = POR)
  position: Position;
  label: string;
  x: number;                  // 0-100% en el campo (horizontal)
  y: number;                  // 0-100% en el campo (vertical: 0 portería propia, 100 delantera)
}

export interface FormationPreset {
  name: string;               // '4-3-3', '4-4-2', etc.
  description: string;
  slots: FormationSlot[];
}

export const FORMATIONS: Record<string, FormationPreset> = {
  '4-3-3': {
    name: '4-3-3',
    description: 'Alineación ofensiva con extremos abiertos y control del mediocampo.',
    slots: [
      { slotIndex: 0, position: 'POR', label: 'POR', x: 50, y: 10 },
      { slotIndex: 1, position: 'LD', label: 'LD', x: 86, y: 30 },
      { slotIndex: 2, position: 'DFC', label: 'DFC', x: 62, y: 25 },
      { slotIndex: 3, position: 'DFC', label: 'DFC', x: 38, y: 25 },
      { slotIndex: 4, position: 'LI', label: 'LI', x: 14, y: 30 },
      { slotIndex: 5, position: 'MCD', label: 'MCD', x: 50, y: 46 },
      { slotIndex: 6, position: 'MC', label: 'MC', x: 70, y: 58 },
      { slotIndex: 7, position: 'MC', label: 'MC', x: 30, y: 58 },
      { slotIndex: 8, position: 'ED', label: 'ED', x: 82, y: 80 },
      { slotIndex: 9, position: 'EI', label: 'EI', x: 18, y: 80 },
      { slotIndex: 10, position: 'DC', label: 'DC', x: 50, y: 86 },
    ],
  },
  '4-4-2': {
    name: '4-4-2',
    description: 'Esquema clásico equilibrado con dos puntas de referencia y bandas activas.',
    slots: [
      { slotIndex: 0, position: 'POR', label: 'POR', x: 50, y: 10 },
      { slotIndex: 1, position: 'LD', label: 'LD', x: 86, y: 28 },
      { slotIndex: 2, position: 'DFC', label: 'DFC', x: 62, y: 24 },
      { slotIndex: 3, position: 'DFC', label: 'DFC', x: 38, y: 24 },
      { slotIndex: 4, position: 'LI', label: 'LI', x: 14, y: 28 },
      { slotIndex: 5, position: 'ED', label: 'MD', x: 84, y: 54 },
      { slotIndex: 6, position: 'MC', label: 'MC', x: 62, y: 52 },
      { slotIndex: 7, position: 'MC', label: 'MC', x: 38, y: 52 },
      { slotIndex: 8, position: 'EI', label: 'MI', x: 16, y: 54 },
      { slotIndex: 9, position: 'DC', label: 'DC', x: 62, y: 84 },
      { slotIndex: 10, position: 'DC', label: 'DC', x: 38, y: 84 },
    ],
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    description: 'Doble pivote protector, mediapunta creador y delanteros incisivos.',
    slots: [
      { slotIndex: 0, position: 'POR', label: 'POR', x: 50, y: 10 },
      { slotIndex: 1, position: 'LD', label: 'LD', x: 86, y: 28 },
      { slotIndex: 2, position: 'DFC', label: 'DFC', x: 62, y: 24 },
      { slotIndex: 3, position: 'DFC', label: 'DFC', x: 38, y: 24 },
      { slotIndex: 4, position: 'LI', label: 'LI', x: 14, y: 28 },
      { slotIndex: 5, position: 'MCD', label: 'MCD', x: 64, y: 44 },
      { slotIndex: 6, position: 'MCD', label: 'MCD', x: 36, y: 44 },
      { slotIndex: 7, position: 'ED', label: 'ED', x: 82, y: 68 },
      { slotIndex: 8, position: 'MCO', label: 'MCO', x: 50, y: 66 },
      { slotIndex: 9, position: 'EI', label: 'EI', x: 18, y: 68 },
      { slotIndex: 10, position: 'DC', label: 'DC', x: 50, y: 86 },
    ],
  },
  '3-5-2': {
    name: '3-5-2',
    description: 'Superioridad numérica en el centro del campo y carrileros de largo recorrido.',
    slots: [
      { slotIndex: 0, position: 'POR', label: 'POR', x: 50, y: 10 },
      { slotIndex: 1, position: 'DFC', label: 'DFC', x: 74, y: 26 },
      { slotIndex: 2, position: 'DFC', label: 'LIB', x: 50, y: 22 },
      { slotIndex: 3, position: 'DFC', label: 'DFC', x: 26, y: 26 },
      { slotIndex: 4, position: 'LD', label: 'CAD', x: 88, y: 50 },
      { slotIndex: 5, position: 'MCD', label: 'MCD', x: 50, y: 42 },
      { slotIndex: 6, position: 'MC', label: 'MC', x: 68, y: 58 },
      { slotIndex: 7, position: 'MC', label: 'MC', x: 32, y: 58 },
      { slotIndex: 8, position: 'LI', label: 'CAI', x: 12, y: 50 },
      { slotIndex: 9, position: 'DC', label: 'DC', x: 62, y: 84 },
      { slotIndex: 10, position: 'DC', label: 'DC', x: 38, y: 84 },
    ],
  },
  '5-3-2': {
    name: '5-3-2',
    description: 'Bloque defensivo muy sólido con contragolpe rápido.',
    slots: [
      { slotIndex: 0, position: 'POR', label: 'POR', x: 50, y: 10 },
      { slotIndex: 1, position: 'LD', label: 'CAD', x: 90, y: 32 },
      { slotIndex: 2, position: 'DFC', label: 'DFC', x: 70, y: 24 },
      { slotIndex: 3, position: 'DFC', label: 'LIB', x: 50, y: 20 },
      { slotIndex: 4, position: 'DFC', label: 'DFC', x: 30, y: 24 },
      { slotIndex: 5, position: 'LI', label: 'CAI', x: 10, y: 32 },
      { slotIndex: 6, position: 'MC', label: 'MC', x: 70, y: 52 },
      { slotIndex: 7, position: 'MCD', label: 'MCD', x: 50, y: 46 },
      { slotIndex: 8, position: 'MC', label: 'MC', x: 30, y: 52 },
      { slotIndex: 9, position: 'DC', label: 'DC', x: 62, y: 82 },
      { slotIndex: 10, position: 'DC', label: 'DC', x: 38, y: 82 },
    ],
  },
  '3-4-3': {
    name: '3-4-3',
    description: 'Sistema ofensivo total con presión alta y tres atacantes punzantes.',
    slots: [
      { slotIndex: 0, position: 'POR', label: 'POR', x: 50, y: 10 },
      { slotIndex: 1, position: 'DFC', label: 'DFC', x: 74, y: 25 },
      { slotIndex: 2, position: 'DFC', label: 'DFC', x: 50, y: 22 },
      { slotIndex: 3, position: 'DFC', label: 'DFC', x: 26, y: 25 },
      { slotIndex: 4, position: 'ED', label: 'MD', x: 86, y: 52 },
      { slotIndex: 5, position: 'MC', label: 'MC', x: 62, y: 50 },
      { slotIndex: 6, position: 'MC', label: 'MC', x: 38, y: 50 },
      { slotIndex: 7, position: 'EI', label: 'MI', x: 14, y: 52 },
      { slotIndex: 8, position: 'ED', label: 'ED', x: 82, y: 80 },
      { slotIndex: 9, position: 'DC', label: 'DC', x: 50, y: 86 },
      { slotIndex: 10, position: 'EI', label: 'EI', x: 18, y: 80 },
    ],
  },
  '4-1-4-1': {
    name: '4-1-4-1',
    description: 'Equilibrio defensivo con pivote ancla y llegada masiva desde segunda línea.',
    slots: [
      { slotIndex: 0, position: 'POR', label: 'POR', x: 50, y: 10 },
      { slotIndex: 1, position: 'LD', label: 'LD', x: 86, y: 28 },
      { slotIndex: 2, position: 'DFC', label: 'DFC', x: 62, y: 24 },
      { slotIndex: 3, position: 'DFC', label: 'DFC', x: 38, y: 24 },
      { slotIndex: 4, position: 'LI', label: 'LI', x: 14, y: 28 },
      { slotIndex: 5, position: 'MCD', label: 'MCD', x: 50, y: 42 },
      { slotIndex: 6, position: 'ED', label: 'MD', x: 84, y: 62 },
      { slotIndex: 7, position: 'MC', label: 'MC', x: 62, y: 60 },
      { slotIndex: 8, position: 'MC', label: 'MC', x: 38, y: 60 },
      { slotIndex: 9, position: 'EI', label: 'MI', x: 16, y: 62 },
      { slotIndex: 10, position: 'DC', label: 'DC', x: 50, y: 86 },
    ],
  },
  '4-3-2-1': {
    name: '4-3-2-1',
    description: 'El célebre "Árbol de Navidad", con dos mediapuntas detrás del delantero referencia.',
    slots: [
      { slotIndex: 0, position: 'POR', label: 'POR', x: 50, y: 10 },
      { slotIndex: 1, position: 'LD', label: 'LD', x: 86, y: 28 },
      { slotIndex: 2, position: 'DFC', label: 'DFC', x: 62, y: 24 },
      { slotIndex: 3, position: 'DFC', label: 'DFC', x: 38, y: 24 },
      { slotIndex: 4, position: 'LI', label: 'LI', x: 14, y: 28 },
      { slotIndex: 5, position: 'MC', label: 'MC', x: 72, y: 48 },
      { slotIndex: 6, position: 'MCD', label: 'MCD', x: 50, y: 44 },
      { slotIndex: 7, position: 'MC', label: 'MC', x: 28, y: 48 },
      { slotIndex: 8, position: 'MCO', label: 'MCO', x: 65, y: 68 },
      { slotIndex: 9, position: 'MCO', label: 'MCO', x: 35, y: 68 },
      { slotIndex: 10, position: 'DC', label: 'DC', x: 50, y: 86 },
    ],
  },
  'Personalizada': {
    name: 'Personalizada',
    description: 'Pizarra táctica de libre colocación para ubicar a cada jugador en coordenadas personalizadas.',
    slots: [
      { slotIndex: 0, position: 'POR', label: 'POR', x: 50, y: 10 },
      { slotIndex: 1, position: 'LD', label: 'LD', x: 86, y: 28 },
      { slotIndex: 2, position: 'DFC', label: 'DFC', x: 62, y: 24 },
      { slotIndex: 3, position: 'DFC', label: 'DFC', x: 38, y: 24 },
      { slotIndex: 4, position: 'LI', label: 'LI', x: 14, y: 28 },
      { slotIndex: 5, position: 'MCD', label: 'MCD', x: 50, y: 46 },
      { slotIndex: 6, position: 'MC', label: 'MC', x: 70, y: 58 },
      { slotIndex: 7, position: 'MC', label: 'MC', x: 30, y: 58 },
      { slotIndex: 8, position: 'ED', label: 'ED', x: 82, y: 80 },
      { slotIndex: 9, position: 'EI', label: 'EI', x: 18, y: 80 },
      { slotIndex: 10, position: 'DC', label: 'DC', x: 50, y: 86 },
    ],
  },
};

// ============================================================================
// 2. INSTRUCCIONES TÁCTICAS COLECTIVAS (EQUIPO)
// ============================================================================
export interface TeamTacticalInstructions {
  estiloJuego: 'Tiki-Taka' | 'Contraataque' | 'Juego Directo' | 'Gegenpressing' | 'Bloque Bajo' | 'Equilibrado';
  presion: 'Asfixiante' | 'Alta' | 'Media' | 'Baja';
  alturaDefensiva: 'Muy Adelantada' | 'Adelantada' | 'Media' | 'Repliegue Intensivo';
  anchura: 'Muy Abierto' | 'Abierto' | 'Estándar' | 'Estrecho' | 'Por el Centro';
  ritmo: 'Frenético' | 'Rápido' | 'Pausado' | 'Control del Tiempo';
  posesion: 'Control Absoluto' | 'Dominio' | 'Equilibrada' | 'Vertical';
  salidaBalon: 'En Corto desde Atrás' | 'Apoyo en Mediocentros' | 'Balón Largo al Punta' | 'Salida Mixta';
  contraataque: 'Inmediato y Vertical' | 'Transición Organizada' | 'Mantener Posesión';
  centros: 'Al Primer Palo' | 'Al Segundo Palo' | 'Centros Tensos' | 'Centros Flotados' | 'Rasos a la Llegada';
  juegoDirecto: 'Balón al Pie' | 'Pase al Espacio' | 'Directo a la Referencia';
  construccion: 'Por Banda Izquierda' | 'Por Banda Derecha' | 'Por el Centro' | 'Ambas Bandas' | 'Variada';
  marcaje: 'Zonal' | 'Al Hombre' | 'Mixto con Coberturas';
  intensidad: 'Al Límite' | 'Fuerte' | 'Controlada' | 'Precavida';
  transiciones: 'Presión tras Pérdida' | 'Repliegue Inmediato' | 'Reorganización Táctica';
  fueraDeJuego: 'Tirar el Fuera de Juego' | 'Línea Prudente';
  gestionResultado: 'Perder Tiempo' | 'Buscar Sentenciar' | 'Enfriar el Partido' | 'Normal';
}

export const DEFAULT_TEAM_INSTRUCTIONS: TeamTacticalInstructions = {
  estiloJuego: 'Equilibrado',
  presion: 'Media',
  alturaDefensiva: 'Media',
  anchura: 'Estándar',
  ritmo: 'Rápido',
  posesion: 'Equilibrada',
  salidaBalon: 'En Corto desde Atrás',
  contraataque: 'Inmediato y Vertical',
  centros: 'Centros Tensos',
  juegoDirecto: 'Pase al Espacio',
  construccion: 'Variada',
  marcaje: 'Zonal',
  intensidad: 'Controlada',
  transiciones: 'Presión tras Pérdida',
  fueraDeJuego: 'Línea Prudente',
  gestionResultado: 'Normal',
};

// ============================================================================
// 3. INSTRUCCIONES INDIVIDUALES POR JUGADOR
// ============================================================================
export interface PlayerTacticalRole {
  playerId: string;
  role: string;
  duty: 'Defensa' | 'Apoyo' | 'Ataque' | 'Automática';
  mentalidad: 'Defensiva' | 'Equilibrada' | 'Ofensiva';
  libertadMovimiento: 'Ceñirse a la Posición' | 'Libertad Relativa' | 'Libertad Total';
  responsabilidadDefensiva: 'Ayudar en Defensa' | 'Bajar en Córners' | 'Descolgarse para la Contra';
  posicionPartida: 'Pegado a Banda' | 'Pasillo Interior' | 'Centrado';
  instruccionesConBalon: 'Arriesgar en el Pase' | 'Asegurar Posesión' | 'Disparar en Cuanto Haya Hueco' | 'Centrar a Menudo' | 'Conducir y Desbordar';
  instruccionesSinBalon: 'Presión Feroz' | 'Cerrar Líneas' | 'Desmarques de Ruptura' | 'Ofrecer Apoyo';
  assignedMarkerId?: string;
  customX?: number;
  customY?: number;
}

export const POSITION_ROLES_MAP: Record<Position, string[]> = {
  POR: ['Portero Clásico', 'Portero Líbero'],
  DFC: ['Defensa Central Clásico', 'Central con Salida', 'Marcador al Hombre', 'Líbero Stopper'],
  LD: ['Lateral Defensivo', 'Lateral Clásico', 'Carrilero Ofensivo', 'Lateral Invertido'],
  LI: ['Lateral Defensivo', 'Lateral Clásico', 'Carrilero Ofensivo', 'Lateral Invertido'],
  MCD: ['Pivote Destructor', 'Mediocentro Organizador', 'Medio Cierre', 'Ancla Defensiva'],
  MC: ['Box-to-Box', 'Organizador Avanzado', 'Volante de Trabajo', 'Mezzala'],
  MCO: ['Mediapunta Creador', 'Segundo Delantero', 'Enganche Clásico', 'Trequartista'],
  ED: ['Extremo Clásico', 'Extremo Invertido', 'Delantero Interior', 'Puñal al Espacio'],
  EI: ['Extremo Clásico', 'Extremo Invertido', 'Delantero Interior', 'Puñal al Espacio'],
  DC: ['Hombre Objetivo', 'Cazagoles de Área', 'Falso Nueve', 'Ariete de Presión'],
};

// ============================================================================
// 4. ENTRENAMIENTO SEMANAL
// ============================================================================
export type TrainingCategory = 'FISICO' | 'TECNICA' | 'DEFENSA' | 'TACTICA' | 'RECUPERACION';

export type TrainingSessionType =
  | 'FISICO_RESISTENCIA'
  | 'FISICO_VELOCIDAD'
  | 'FISICO_FUERZA'
  | 'TECNICA_PASE'
  | 'TECNICA_REGATE'
  | 'TECNICA_REMATE'
  | 'DEFENSA_MARCAJE'
  | 'DEFENSA_JUEGO_AEREO'
  | 'DEFENSA_ENTRADAS'
  | 'TACTICA_AUTOMATISMOS'
  | 'TACTICA_ESTRATEGIA'
  | 'TACTICA_BALON_PARADO'
  | 'TACTICA_PREPARACION_RIVAL'
  | 'RECUPERACION_FISIOTERAPIA'
  | 'DESCANSO_TOTAL';

export interface DayTrainingSchedule {
  dayName: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  morning: TrainingSessionType;
  afternoon: TrainingSessionType;
}

export interface IndividualTrainingFocus {
  playerId: string;
  attributeFocus: 'disparo' | 'pase' | 'regate' | 'defensa' | 'velocidad' | 'resistencia' | 'fuerza' | 'vision' | 'liderazgo';
  intensity: 'Normal' | 'Intensa' | 'Suave';
}

export interface WeeklyTrainingPlan {
  schedule: DayTrainingSchedule[];
  collectiveIntensity: 'Baja' | 'Media' | 'Alta';
  individualFoci: Record<string, IndividualTrainingFocus>;
}

export const DEFAULT_WEEKLY_TRAINING: WeeklyTrainingPlan = {
  collectiveIntensity: 'Media',
  schedule: [
    { dayName: 'Lunes', morning: 'RECUPERACION_FISIOTERAPIA', afternoon: 'DESCANSO_TOTAL' },
    { dayName: 'Martes', morning: 'FISICO_RESISTENCIA', afternoon: 'TECNICA_PASE' },
    { dayName: 'Miércoles', morning: 'DEFENSA_MARCAJE', afternoon: 'TECNICA_REMATE' },
    { dayName: 'Jueves', morning: 'TACTICA_AUTOMATISMOS', afternoon: 'FISICO_VELOCIDAD' },
    { dayName: 'Viernes', morning: 'TACTICA_BALON_PARADO', afternoon: 'TACTICA_PREPARACION_RIVAL' },
    { dayName: 'Sábado', morning: 'TECNICA_REGATE', afternoon: 'RECUPERACION_FISIOTERAPIA' },
    { dayName: 'Domingo', morning: 'TACTICA_ESTRATEGIA', afternoon: 'DESCANSO_TOTAL' },
  ],
  individualFoci: {},
};

// ============================================================================
// 5. PREPARACIÓN DE PARTIDOS & ANÁLISIS DEL RIVAL
// ============================================================================
export interface OpponentScoutingReport {
  rivalClubId: string;
  rivalClubName: string;
  rivalClubCode: string;
  formation: string;
  keyPlayers: {
    name: string;
    position: string;
    rating: number;
    threatSummary: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  playStyle: string;
  recentResults: string[];
  threatLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Peligro Máximo';
  analystAdvice: string;
  recommendedCounterMeasure: {
    instructionName: string;
    setting: string;
    rationale: string;
  };
}

// ============================================================================
// 6. ESPECIALISTAS A BALÓN PARADO & SUSTITUCIONES PLANIFICADAS
// ============================================================================
export interface SetPieceTakers {
  captainId: string;
  viceCaptainId: string;
  penaltyTakerId: string;
  secondPenaltyTakerId: string;
  directFreekickTakerId: string;
  longFreekickTakerId: string;
  leftCornerTakerId: string;
  rightCornerTakerId: string;
}

export interface PlannedSubstitution {
  id: string;
  minute: number;
  outPlayerId: string;
  inPlayerId: string;
  condition: 'SIEMPRE' | 'SI_PERDIENDO' | 'SI_GANANDO' | 'SI_EMPATANDO';
  reason: string;
}

// ============================================================================
// 7. RUEDAS DE PRENSA
// ============================================================================
export interface PressResponseOption {
  text: string;
  tone: 'CONFIADO' | 'EXIGENTE' | 'PRUDENTE' | 'PROTECTOR';
  moraleDelta: number;
  boardConfidenceDelta: number;
  fanApprovalDelta: number;
  playerPressureDelta: number;
  reactionSummary: string;
}

export interface PressQuestion {
  id: string;
  journalistName: string;
  mediaOutlet: string;
  question: string;
  options: PressResponseOption[];
  selectedOptionIndex?: number;
}

export interface PressConference {
  id: string;
  type: 'PRE_PARTIDO' | 'POST_PARTIDO';
  date: string;
  matchId: string;
  rivalClubName: string;
  headline: string;
  questions: PressQuestion[];
  completed: boolean;
}

// ============================================================================
// 8. RELACIONES Y DINÁMICAS DE VESTUARIO
// ============================================================================
export interface PlayerLockerRoomProfile {
  playerId: string;
  morale: number;              // 0-100%
  confidence: number;          // 0-100%
  ambition: 'Baja' | 'Media' | 'Alta' | 'Desmedida';
  professionalism: 'Ejemplar' | 'Alta' | 'Regular' | 'Problemático';
  leadership: number;          // 0-100%
  coachRelationship: 'Excelente' | 'Buena' | 'Correcta' | 'Distante' | 'Tensa' | 'Rota';
  playingTimeSatisfaction: 'Indispensable' | 'Muy Satisfecho' | 'Satisfecho' | 'Preocupado' | 'Rebelado';
  concerns: string[];
}

