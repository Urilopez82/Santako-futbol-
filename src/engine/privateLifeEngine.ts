import { GameSave, NewsItem } from '../types/game';
import { Club } from '../types/club';
import { Player, Position } from '../types/player';
import { 
  ManagerPrivateLife, 
  VehicleItem, 
  RealEstateItem, 
  PersonalTransaction, 
  ClubFoundationData,
  AircraftItem,
  PilotLicense,
  CriminalWorldState,
  CriminalRecordItem,
  CrimeType
} from '../types/privateLife';
import { simulateOneFullSeasonFast } from './perpetualWorldEngine';


export const VEHICLES_CATALOG: VehicleItem[] = [
  {
    id: 'veh_audi_rs6',
    brand: 'Audi',
    model: 'RS6 Avant Performance',
    year: 2026,
    price: 165000,
    category: 'BERLINA_PREMIUM',
    topSpeed: 305,
    powerHP: 630,
    imageBadge: '🚗',
    description: 'Familiar deportivo de altísimo rendimiento con tracción quattro integral y motor V8 biturbo. Ideal para los desplazamientos diarios a la ciudad deportiva.',
    maintenanceAnnual: 6500,
  },
  {
    id: 'veh_porsche_911',
    brand: 'Porsche',
    model: '911 GT3 RS',
    year: 2026,
    price: 285000,
    category: 'DEPORTIVO',
    topSpeed: 296,
    powerHP: 525,
    imageBadge: '🏎️',
    description: 'El icono de Stuttgart con aerodinámica activa de competición, alerón de carbono y motor bóxer atmosférico que sube hasta 9.000 RPM.',
    maintenanceAnnual: 11000,
  },
  {
    id: 'veh_ferrari_296',
    brand: 'Ferrari',
    model: '296 GTB Assetto Fiorano',
    year: 2026,
    price: 360000,
    category: 'SUPERDEPORTIVO',
    topSpeed: 330,
    powerHP: 830,
    imageBadge: '🐎',
    description: 'Híbrido enchufable de Maranello con chasis aligerado en fibra de carbono y aceleración fulgurante de 0 a 100 km/h en 2,9 segundos.',
    maintenanceAnnual: 15000,
  },
  {
    id: 'veh_aston_db12',
    brand: 'Aston Martin',
    model: 'DB12 Super Tourer',
    year: 2026,
    price: 260000,
    category: 'DEPORTIVO',
    topSpeed: 325,
    powerHP: 680,
    imageBadge: '✨',
    description: 'Elegancia británica pura combinada con la potencia bruta de un V8 twin-turbo. Tapicería de cuero cosido a mano y presencia imponente.',
    maintenanceAnnual: 9500,
  },
  {
    id: 'veh_bugatti_tourbillon',
    brand: 'Bugatti',
    model: 'Tourbillon V16 Híbrido',
    year: 2027,
    price: 3800000,
    category: 'HIPERDEPORTIVO',
    topSpeed: 445,
    powerHP: 1800,
    imageBadge: '👑',
    description: 'La cúspide mundial de la ingeniería automotriz: motor V16 atmosférico desarrollado junto a Cosworth con tres motores eléctricos e instrumentación de relojería suiza.',
    maintenanceAnnual: 85000,
  },
  {
    id: 'veh_range_rover_sv',
    brand: 'Land Rover',
    model: 'Range Rover SV Autobiography',
    year: 2026,
    price: 240000,
    category: 'BERLINA_PREMIUM',
    topSpeed: 260,
    powerHP: 615,
    imageBadge: '🚙',
    description: 'SUV de lujo supremo con butacas traseras de primera clase ejecutiva con masaje de piedras calientes y suspensión neumática inteligente.',
    maintenanceAnnual: 8000,
  },
];

export const REAL_ESTATE_CATALOG: RealEstateItem[] = [
  {
    id: 'prop_madrid_chafiras',
    title: 'Ático Exclusivo en Paseo de la Castellana',
    city: 'Madrid',
    country: 'España',
    price: 1850000,
    category: 'ATICO',
    squareMeters: 320,
    bedrooms: 4,
    bathrooms: 4,
    hasPrivatePitch: false,
    hasPool: true,
    imageBadge: '🏙️',
    description: 'Ático dúplex con terraza perimetral de 120 m², vistas panorámicas de la sierra y el skyline madrileño, piscina privada y acceso directo en ascensor acorazado.',
    propertyTaxAnnual: 12000,
  },
  {
    id: 'prop_barcelona_pedralbes',
    title: 'Chalet de Diseño en Pedralbes',
    city: 'Barcelona',
    country: 'España',
    price: 3400000,
    category: 'CHALET',
    squareMeters: 580,
    bedrooms: 6,
    bathrooms: 6,
    hasPrivatePitch: false,
    hasPool: true,
    imageBadge: '🏡',
    description: 'Arquitectura vanguardista minimalista en la zona alta de Barcelona. Jardín japonés, gimnasio profesional, sala de cine privada y garaje subterráneo para 6 coches.',
    propertyTaxAnnual: 18000,
  },
  {
    id: 'prop_madrid_moraleja',
    title: 'Gran Mansión en La Moraleja con Mini-Campo',
    city: 'Alcobendas (Madrid)',
    country: 'España',
    price: 6900000,
    category: 'MANSION',
    squareMeters: 1100,
    bedrooms: 8,
    bathrooms: 9,
    hasPrivatePitch: true,
    hasPool: true,
    imageBadge: '🏰',
    description: 'Finca residencial de 10.000 m² de parcela privada. Incluye campo de fútbol de hierba natural reglamentario para entrenamientos privados, spa completo y máxima privacidad.',
    propertyTaxAnnual: 35000,
  },
  {
    id: 'prop_londres_kensington',
    title: 'Palacete Victoriano en Kensington',
    city: 'Londres',
    country: 'Inglaterra',
    price: 8500000,
    category: 'FINCA_LUJO',
    squareMeters: 850,
    bedrooms: 7,
    bathrooms: 7,
    hasPrivatePitch: false,
    hasPool: true,
    imageBadge: '🏛️',
    description: 'Residencia histórica protegida de cinco plantas en el corazón diplomático de Londres con techos de moldura original, bodega climatizada y jardín privado.',
    propertyTaxAnnual: 42000,
  },
  {
    id: 'prop_marbella_zagaleta',
    title: 'Villa de Superlujo en La Zagaleta',
    city: 'Benahavís / Marbella',
    country: 'España',
    price: 12500000,
    category: 'MANSION',
    squareMeters: 1600,
    bedrooms: 10,
    bathrooms: 12,
    hasPrivatePitch: true,
    hasPool: true,
    imageBadge: '🌴',
    description: 'La urbanización más segura y privada de Europa. Vistas directas al mar Mediterráneo y Gibraltar, helipuerto privado, pista de pádel y campo de fútbol 7 integrado.',
    propertyTaxAnnual: 55000,
  },
];

export const AIRCRAFT_CATALOG: AircraftItem[] = [
  {
    id: 'air_cessna_172',
    brand: 'Cessna',
    model: '172 Skyhawk SP',
    year: 2024,
    category: 'AVIONETA',
    price: 395000,
    passengerCapacity: 4,
    rangeKm: 1185,
    speedKmh: 226,
    maintenanceAnnual: 14500,
    fuelBurnPerHour: 36,
    mechanicalCondition: 100,
    safetyRating: 4,
    imageBadge: '🛩️',
    description: 'Avioneta monomotor de ala alta, legendaria por su fiabilidad mecánica y nobleza en vuelo. Excelente para escapadas personales de fin de semana y bautismos de aire.',
    ownerType: 'MANAGER_PERSONAL',
  },
  {
    id: 'air_cirrus_sf50',
    brand: 'Cirrus Aircraft',
    model: 'Vision Jet SF50 G2+',
    year: 2025,
    category: 'PRIVADO_LIGERO',
    price: 2850000,
    passengerCapacity: 5,
    rangeKm: 2220,
    speedKmh: 565,
    maintenanceAnnual: 48000,
    fuelBurnPerHour: 195,
    mechanicalCondition: 100,
    safetyRating: 5,
    imageBadge: '✈️',
    description: 'El primer reactor personal monomotor del mundo. Cabina presurizada de fibra de carbono, aviónica táctil Garmin Perspective Touch+ y sistema de paracaídas balístico integral CAPS.',
    ownerType: 'MANAGER_PERSONAL',
  },
  {
    id: 'air_pilatus_pc12',
    brand: 'Pilatus',
    model: 'PC-12 NGX Executive',
    year: 2026,
    category: 'PRIVADO_LIGERO',
    price: 5600000,
    passengerCapacity: 9,
    rangeKm: 3415,
    speedKmh: 537,
    maintenanceAnnual: 68000,
    fuelBurnPerHour: 245,
    mechanicalCondition: 100,
    safetyRating: 5,
    imageBadge: '🛩️',
    description: 'Turbohélice suizo de referencia con cabina ejecutiva diseñada por BMW Designworks. Capaz de operar en pistas no preparadas o de hierba con seguridad absoluta.',
    ownerType: 'MANAGER_PERSONAL',
  },
  {
    id: 'air_cessna_latitude',
    brand: 'Cessna Citation',
    model: 'Latitude Super-Midsize',
    year: 2026,
    category: 'JET_EJECUTIVO',
    price: 18500000,
    passengerCapacity: 9,
    rangeKm: 5000,
    speedKmh: 826,
    maintenanceAnnual: 145000,
    fuelBurnPerHour: 720,
    mechanicalCondition: 100,
    safetyRating: 5,
    imageBadge: '✈️',
    description: 'Jet corporativo de fuselaje ancho con suelo 100% plano, conexión satelital de alta velocidad y alcance para conectar cualquier capital europea sin repostar.',
    ownerType: 'MANAGER_PERSONAL',
  },
  {
    id: 'air_boeing_737_team',
    brand: 'Boeing Commercial',
    model: '737-800 Team Liner Club Edition',
    year: 2026,
    category: 'TRANSPORTE_EQUIPO',
    price: 42000000,
    passengerCapacity: 68,
    rangeKm: 5765,
    speedKmh: 850,
    maintenanceAnnual: 450000,
    fuelBurnPerHour: 2400,
    mechanicalCondition: 100,
    safetyRating: 5,
    imageBadge: '🛫',
    description: 'Aeronave oficial configurada especialmente para plantillas deportivas profesionales. Butacas reclinables 180°, camillas de fisioterapia a bordo y sala de análisis táctico.',
    ownerType: 'CLUB_OFFICIAL',
  },
  {
    id: 'air_gulfstream_g650',
    brand: 'Gulfstream',
    model: 'G650ER Luxury Flagship',
    year: 2026,
    category: 'LUJO_VIP',
    price: 68000000,
    passengerCapacity: 16,
    rangeKm: 13890,
    speedKmh: 982,
    maintenanceAnnual: 380000,
    fuelBurnPerHour: 1450,
    mechanicalCondition: 100,
    safetyRating: 5,
    imageBadge: '✨',
    description: 'La joya de la aviación privada mundial. Vuelo ultrasuave intercontinental a Mach 0.90, cuatro áreas habitables independientes, bodega gourmet y 16 ventanillas elípticas panorámicas.',
    ownerType: 'MANAGER_PERSONAL',
  },
  {
    id: 'air_airbus_a350_vip',
    brand: 'Airbus Corporate Jets',
    model: 'ACJ350 VIP Ultra Presidential',
    year: 2027,
    category: 'LUJO_VIP',
    price: 145000000,
    passengerCapacity: 45,
    rangeKm: 16100,
    speedKmh: 903,
    maintenanceAnnual: 980000,
    fuelBurnPerHour: 4800,
    mechanicalCondition: 100,
    safetyRating: 5,
    imageBadge: '👑',
    description: 'Palacio aéreo de superlujo absoluto con 270 m² de cabina silenciosa. Suite presidencial con cama king-size, ducha de hidromasaje, sala de juntas y quirófano médico equipado.',
    ownerType: 'CLUB_OFFICIAL',
  },
];

export const DEFAULT_PILOT_LICENSE: PilotLicense = {
  hasLicense: false,
  licenseType: 'NINGUNA',
  examsPassed: 0,
  totalFlightHours: 0,
  isClubOfficialPilot: false,
  hasHiredProPilot: false,
  hiredPilotMonthlySalary: 8500,
};

export const DEFAULT_CRIMINAL_STATE: CriminalWorldState = {
  wantedStars: 0,
  isUnderInvestigation: false,
  totalCrimesCommitted: 0,
  records: [],
  inPrison: false,
  prisonSentenceYears: 0,
  activeRefereeBribe: null,
};

export function ensurePrivateLifeState(save: GameSave): GameSave {
  if (save.privateLife) {
    const pl = save.privateLife;
    return {
      ...save,
      privateLife: {
        ...pl,
        ownedAircraft: pl.ownedAircraft || [],
        pilotLicense: pl.pilotLicense || { ...DEFAULT_PILOT_LICENSE },
        criminal: pl.criminal || { ...DEFAULT_CRIMINAL_STATE },
      },
    };
  }

  // Initial calculation based on career wage
  const weekly = save.manager?.contract?.wageWeekly || 4500;
  const initialSavings = Math.max(350000, weekly * 52 * 2);

  const initialTransaction: PersonalTransaction = {
    id: `tx_init_${Date.now()}`,
    date: save.currentDate || '2026-08-15',
    type: 'INGRESO_SALARIO',
    concept: 'Ahorros acumulados de trayectoria profesional e indemnizaciones',
    amount: initialSavings,
    balanceAfter: initialSavings,
  };

  const privateLife: ManagerPrivateLife = {
    personalBankBalance: initialSavings,
    totalEarningsCareer: initialSavings,
    totalExpensesCareer: 0,
    ownedVehicles: [
      {
        id: 'veh_starter',
        brand: 'Audi',
        model: 'A6 S-Line',
        year: 2025,
        price: 68000,
        category: 'BERLINA_PREMIUM',
        topSpeed: 250,
        powerHP: 286,
        imageBadge: '🚗',
        description: 'Vehículo corporativo entregado por el club al asumir el banquillo.',
        maintenanceAnnual: 2500,
      },
    ],
    ownedProperties: [],
    ownedAircraft: [],
    pilotLicense: { ...DEFAULT_PILOT_LICENSE },
    criminal: { ...DEFAULT_CRIMINAL_STATE },
    transactionsHistory: [initialTransaction],
    hasFoundedClub: false,
  };

  return {
    ...save,
    privateLife,
  };
}

export function depositManagerWeeklyWage(save: GameSave): GameSave {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const clubWage = save.manager?.contract?.wageWeekly || 0;
  const nationWage = save.manager?.nationalTeamRole ? Math.floor(clubWage * 0.45) : 0;
  const totalWage = clubWage + nationWage;

  if (totalWage <= 0) return save;

  const newBalance = pl.personalBankBalance + totalWage;
  const tx: PersonalTransaction = {
    id: `tx_wage_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: save.currentDate,
    type: 'INGRESO_SALARIO',
    concept: `Nómina semanal como entrenador (${save.manager.contract.clubName || 'Club'}${nationWage > 0 ? ` + Selección de ${save.manager.nationalTeamRole?.countryName}` : ''})`,
    amount: totalWage,
    balanceAfter: newBalance,
  };

  return {
    ...save,
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      totalEarningsCareer: pl.totalEarningsCareer + totalWage,
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
    },
  };
}

export function rewardManagerTitleBonus(save: GameSave, trophyName: string, amount: number = 250000): GameSave {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const bonus = Math.max(50000, amount);
  const newBalance = pl.personalBankBalance + bonus;

  const tx: PersonalTransaction = {
    id: `tx_title_${Date.now()}`,
    date: save.currentDate,
    type: 'PRIMA_TITULO',
    concept: `🏆 Prima contractual por título: Campeón de ${trophyName}`,
    amount: bonus,
    balanceAfter: newBalance,
  };

  return {
    ...save,
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      totalEarningsCareer: pl.totalEarningsCareer + bonus,
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
    },
  };
}

export function rewardManagerPromotionBonus(save: GameSave, clubName: string, amount: number = 75000): GameSave {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const bonus = Math.max(15000, amount);
  const newBalance = pl.personalBankBalance + bonus;

  const tx: PersonalTransaction = {
    id: `tx_prom_${Date.now()}`,
    date: save.currentDate,
    type: 'PRIMA_OBJETIVO',
    concept: `🏅 Prima contractual por ascenso de categoría con el ${clubName}`,
    amount: bonus,
    balanceAfter: newBalance,
  };

  return {
    ...save,
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      totalEarningsCareer: pl.totalEarningsCareer + bonus,
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
    },
  };
}

export function buyVehicle(save: GameSave, vehicle: VehicleItem): { updatedSave: GameSave; success: boolean; message: string } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  if (pl.personalBankBalance < vehicle.price) {
    return {
      updatedSave: save,
      success: false,
      message: `Fondos insuficientes. Tu saldo bancario personal es de ${pl.personalBankBalance.toLocaleString()} € y el vehículo cuesta ${vehicle.price.toLocaleString()} €.`,
    };
  }

  const newBalance = pl.personalBankBalance - vehicle.price;
  const tx: PersonalTransaction = {
    id: `tx_buy_veh_${Date.now()}`,
    date: save.currentDate,
    type: 'COMPRA_VEHICULO',
    concept: `Adquisición en concesionario oficial: ${vehicle.brand} ${vehicle.model} (${vehicle.powerHP} CV)`,
    amount: -vehicle.price,
    balanceAfter: newBalance,
  };

  const updatedSave: GameSave = {
    ...save,
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      totalExpensesCareer: pl.totalExpensesCareer + vehicle.price,
      ownedVehicles: [...pl.ownedVehicles, vehicle],
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
    },
  };

  return {
    updatedSave,
    success: true,
    message: `¡Enhorabuena! Has adquirido el ${vehicle.brand} ${vehicle.model}. Ya está estacionado en tu garaje personal.`,
  };
}

export function buyRealEstate(save: GameSave, property: RealEstateItem): { updatedSave: GameSave; success: boolean; message: string } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  if (pl.personalBankBalance < property.price) {
    return {
      updatedSave: save,
      success: false,
      message: `Fondos insuficientes. Tu saldo bancario personal es de ${pl.personalBankBalance.toLocaleString()} € y el inmueble cuesta ${property.price.toLocaleString()} €.`,
    };
  }

  const newBalance = pl.personalBankBalance - property.price;
  const tx: PersonalTransaction = {
    id: `tx_buy_prop_${Date.now()}`,
    date: save.currentDate,
    type: 'COMPRA_VIVIENDA',
    concept: `Escritura notarial de propiedad: ${property.title} en ${property.city}`,
    amount: -property.price,
    balanceAfter: newBalance,
  };

  const updatedSave: GameSave = {
    ...save,
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      totalExpensesCareer: pl.totalExpensesCareer + property.price,
      ownedProperties: [...pl.ownedProperties, property],
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
    },
  };

  return {
    updatedSave,
    success: true,
    message: `¡Felicidades! Has firmado la compra de: ${property.title}. Se incorpora a tu patrimonio personal.`,
  };
}

/**
 * FOUND YOUR OWN CLUB
 * Cost: Minimum 4.5M € personal investment.
 * Starts in an Amateur category, with promotion pathway to the official national leagues!
 */
export function foundOwnClub(
  save: GameSave,
  data: ClubFoundationData
): { updatedSave: GameSave; success: boolean; message: string } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  if (pl.personalBankBalance < data.costTotal) {
    return {
      updatedSave: save,
      success: false,
      message: `Patrimonio personal insuficiente para constituir la entidad deportiva. Necesitas ${data.costTotal.toLocaleString()} € y dispones de ${pl.personalBankBalance.toLocaleString()} €.`,
    };
  }

  const newClubId = `club_custom_${Date.now()}`;
  const amateurDivisionId = 'esp_amateur';

  // Create starting players (16 enthusiastic squad members)
  const startingPlayers: Record<string, Player> = {};
  const positions: Position[] = ['POR', 'POR', 'DFC', 'DFC', 'DFC', 'LD', 'LI', 'MCD', 'MC', 'MC', 'MCO', 'ED', 'EI', 'DC', 'DC', 'DC'];

  positions.forEach((pos, idx) => {
    const pid = `ply_found_${newClubId}_${idx + 1}`;
    startingPlayers[pid] = {
      id: pid,
      firstName: `Futbolista`,
      lastName: `${data.shortName} #${idx + 1}`,
      nationality: 'España',
      birthDate: '2005-04-12',
      age: 20 + (idx % 5),
      primaryPosition: pos,
      overallRating: 54 + (idx % 6),
      potential: 66 + (idx % 8),
      clubId: newClubId,
      isTransferListed: false,
      isLoanListed: false,
      marketValue: 45000 + idx * 8000,
      attributes: {
        disparo: 55,
        pase: 56,
        regate: 55,
        defensa: 54,
        velocidad: 60,
        resistencia: 62,
        fuerza: 58,
        vision: 54,
        liderazgo: 50,
      },
      contract: {
        wagePerWeek: 450,
        contractEndYear: 2029,
        releaseClause: 350000,
        squadStatus: 'Titular',
      },
      fitness: 100,
      morale: 95,
      matchReadiness: 90,
      isInjured: false,
      seasonStats: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        averageRating: 6.5,
      },
    };
  });

  const newClub: Club = {
    id: newClubId,
    name: data.clubName,
    shortName: data.shortName,
    code: data.shortName.substring(0, 3).toUpperCase(),
    divisionId: amateurDivisionId,
    countryId: data.countryId || 'ESP',
    city: data.city,
    stadium: {
      name: data.stadiumName,
      city: data.city,
      capacity: data.stadiumCapacity,
      condition: 95,
      ticketPrice: 15,
      seasonTicketHolders: Math.floor(data.stadiumCapacity * 0.45),
      seasonTicketPrice: 120,
      historicName: data.stadiumName,
    },
    facilities: {
      trainingGroundLevel: 2,
      youthAcademyLevel: 2,
      medicalCenterLevel: 2,
      stadiumLevel: 2,
    },
    finances: {
      balance: data.initialTransferBudget + 500000,
      transferBudget: data.initialTransferBudget,
      weeklyWageBudget: 15000,
      sponsorName: `${data.clubName} Founders Group`,
      sponsorAnnualRevenue: 280000,
      seasonTicketRevenue: 150000,
      recentLedger: [
        {
          id: `leg_found_${Date.now()}`,
          date: save.currentDate,
          category: 'patrocinio',
          description: 'Aportación de capital fundacional del propietario y entrenador',
          amount: data.initialTransferBudget + 500000,
        },
      ],
    },
    boardObjective: 'Puestos de Ascenso Directo',
    boardConfidence: 100,
    foundedYear: 2026,
    primaryColor: data.primaryColor,
    secondaryColor: data.secondaryColor,
    textColor: data.textColor,
    playerIds: Object.keys(startingPlayers),
    startingElevenIds: Object.keys(startingPlayers).slice(0, 11),
    benchPlayerIds: Object.keys(startingPlayers).slice(11),
    tacticFormation: '4-3-3',
    tacticMentality: 'Ofensiva',
    tacticTempo: 'Rápido',
    tacticPassing: 'Corto',
    tacticPressing: 'Media',
    reputation: 52,
    coachName: `${save.manager.firstName} ${save.manager.lastName}`,
    historyTitles: [],
  };

  const newBalance = pl.personalBankBalance - data.costTotal;
  const tx: PersonalTransaction = {
    id: `tx_found_${Date.now()}`,
    date: save.currentDate,
    type: 'FUNDACION_CLUB',
    concept: `Constitución legal y fundación de la entidad deportiva: ${data.clubName} (Estadio: ${data.stadiumName})`,
    amount: -data.costTotal,
    balanceAfter: newBalance,
  };

  const news: NewsItem = {
    id: `news_found_${Date.now()}`,
    date: save.currentDate,
    title: `¡HISTÓRICO! ${save.manager.lastName} funda su propio club de fútbol: ${data.clubName}`,
    content: `En un acontecimiento sin precedentes en el fútbol nacional, ${save.manager.firstName} ${save.manager.lastName} ha invertido ${data.costTotal.toLocaleString()} € de su patrimonio personal para fundar oficialmente el ${data.clubName} en la ciudad de ${data.city}. El club disputará la competición amateur con el objetivo inminente de ascender al fútbol nacional profesional. El propio ${save.manager.lastName} asumirá la doble condición de propietario y máximo responsable técnico del banquillo.`,
    category: 'DIRECTIVA',
    read: false,
  };

  // Add amateur competition if not already in competitions
  const updatedComps = { ...(save.competitions || {}) };
  if (!updatedComps[amateurDivisionId]) {
    updatedComps[amateurDivisionId] = {
      id: amateurDivisionId,
      name: 'Liga de Honor Amateur Regional',
      shortName: 'Liga Amateur',
      season: save.currentSeason || '2026/27',
      tier: 6,
      currentMatchday: 1,
      totalMatchdays: 18,
      matches: [],
      clubIds: [newClubId],
      promotionSlots: 1,
      playoffSlots: 0,
      relegationSlots: 0,
      standings: [
        { teamId: newClubId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, recentForm: [] },
      ],
    };
  } else {
    updatedComps[amateurDivisionId].clubIds = Array.from(new Set([...(updatedComps[amateurDivisionId].clubIds || []), newClubId]));
    updatedComps[amateurDivisionId].standings.push({
      teamId: newClubId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, recentForm: []
    });
  }

  const updatedSave: GameSave = {
    ...save,
    userClubId: newClubId,
    clubs: {
      ...save.clubs,
      [newClubId]: newClub,
    },
    players: {
      ...save.players,
      ...startingPlayers,
    },
    competitions: updatedComps,
    news: [news, ...(save.news || [])],
    manager: {
      ...save.manager,
      contract: {
        ...save.manager.contract,
        clubId: newClubId,
        clubName: data.clubName,
        durationYears: 10,
        wageWeekly: 2500,
        wageAnnual: 130000,
        sportingObjective: 'Lograr el ascenso al fútbol nacional oficial',
      },
    },
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      totalExpensesCareer: pl.totalExpensesCareer + data.costTotal,
      hasFoundedClub: true,
      foundedClubId: newClubId,
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
    },
  };

    return {
    updatedSave,
    success: true,
    message: `¡ENHORABUENA! El ${data.clubName} ha sido fundado oficialmente. Ahora eres su propietario y entrenador.`,
  };
}

// ============================================================================
// SECCIÓN: AVIACIÓN Y AERONAVES
// ============================================================================

export function buyPrivateAircraft(
  save: GameSave, 
  aircraft: AircraftItem
): { updatedSave: GameSave; success: boolean; message: string } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  if (pl.personalBankBalance < aircraft.price) {
    return {
      updatedSave: save,
      success: false,
      message: `Fondos personales insuficientes. Cuentas con ${pl.personalBankBalance.toLocaleString()} € y el avión cuesta ${aircraft.price.toLocaleString()} €.`,
    };
  }

  const newBalance = pl.personalBankBalance - aircraft.price;
  const purchased: AircraftItem = {
    ...aircraft,
    id: `air_pers_${Date.now()}_${aircraft.id}`,
    ownerType: 'MANAGER_PERSONAL',
    mechanicalCondition: 100,
  };

  const tx: PersonalTransaction = {
    id: `tx_buy_air_${Date.now()}`,
    date: save.currentDate,
    type: 'COMPRA_AERONAVE_PRIVADA',
    concept: `Adquisición de aeronave privada para uso personal: ${aircraft.brand} ${aircraft.model}`,
    amount: -aircraft.price,
    balanceAfter: newBalance,
  };

  const news: NewsItem = {
    id: `news_buy_air_${Date.now()}`,
    date: save.currentDate,
    title: `Aviación de élite: ${save.manager.lastName} adquiere un ${aircraft.brand} ${aircraft.model}`,
    content: `El técnico ${save.manager.firstName} ${save.manager.lastName} ha cerrado la compra privada de una aeronave ${aircraft.brand} ${aircraft.model} por ${aircraft.price.toLocaleString()} € para su uso y desplazamientos exclusivos.`,
    category: 'ENTRENADOR',
    read: false,
  };

  const updatedSave: GameSave = {
    ...save,
    news: [news, ...(save.news || [])],
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      totalExpensesCareer: pl.totalExpensesCareer + aircraft.price,
      ownedAircraft: [...(pl.ownedAircraft || []), purchased],
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
    },
  };

  return {
    updatedSave,
    success: true,
    message: `¡Enhorabuena! Has adquirido el ${aircraft.brand} ${aircraft.model}. Ya está registrado en tu hangar privado.`,
  };
}

export function buyClubOfficialAircraft(
  save: GameSave, 
  aircraft: AircraftItem
): { updatedSave: GameSave; success: boolean; message: string } {
  const userClub = save.clubs[save.userClubId];
  if (!userClub) {
    return { updatedSave: save, success: false, message: 'No estás al mando de ningún club en este momento.' };
  }

  const clubBalance = userClub.finances?.balance || 0;
  if (clubBalance < aircraft.price) {
    return {
      updatedSave: save,
      success: false,
      message: `Presupuesto del club insuficiente. La tesorería del club dispone de ${clubBalance.toLocaleString()} € y el avión oficial cuesta ${aircraft.price.toLocaleString()} €.`,
    };
  }

  const officialAircraft: AircraftItem = {
    ...aircraft,
    id: `air_club_${Date.now()}_${aircraft.id}`,
    ownerType: 'CLUB_OFFICIAL',
    mechanicalCondition: 100,
  };

  const newClubBalance = clubBalance - aircraft.price;
  const updatedUserClub: Club = {
    ...userClub,
    officialAircraft,
    finances: {
      ...userClub.finances,
      balance: newClubBalance,
      recentLedger: [
        {
          id: `ledg_air_${Date.now()}`,
          date: save.currentDate,
          category: 'instalaciones',
          description: `Compra de aeronave oficial del club: ${aircraft.brand} ${aircraft.model}`,
          amount: -aircraft.price,
        },
        ...(userClub.finances.recentLedger || []).slice(0, 39),
      ],
    },
  };

  const news: NewsItem = {
    id: `news_club_air_${Date.now()}`,
    date: save.currentDate,
    title: `OFICIAL: El ${userClub.name} estrena su avión oficial: ${aircraft.brand} ${aircraft.model}`,
    content: `La junta directiva del ${userClub.name} ha anunciado la compra oficial del ${aircraft.brand} ${aircraft.model} por ${aircraft.price.toLocaleString()} € de las arcas del club. La aeronave servirá para los desplazamientos de la primera plantilla en competiciones nacionales y continentales, garantizando el máximo descanso y profesionalidad.`,
    category: 'DIRECTIVA',
    read: false,
  };

  const updatedSave: GameSave = {
    ...save,
    clubs: {
      ...save.clubs,
      [userClub.id]: updatedUserClub,
    },
    news: [news, ...(save.news || [])],
  };

  return {
    updatedSave,
    success: true,
    message: `¡Operación completada! El ${aircraft.brand} ${aircraft.model} es ahora el avión oficial del ${userClub.shortName}.`,
  };
}

export function serviceAircraft(
  save: GameSave, 
  aircraftId: string, 
  isClub: boolean
): { updatedSave: GameSave; success: boolean; message: string } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const userClub = save.clubs[save.userClubId];
  const serviceCost = 25000;

  if (isClub) {
    if (!userClub || !userClub.officialAircraft) {
      return { updatedSave: save, success: false, message: 'El club no dispone de avión oficial.' };
    }
    if ((userClub.finances?.balance || 0) < serviceCost) {
      return { updatedSave: save, success: false, message: 'La tesorería del club no tiene fondos para la revisión.' };
    }
    const updatedClub: Club = {
      ...userClub,
      officialAircraft: {
        ...userClub.officialAircraft,
        mechanicalCondition: 100,
      },
      finances: {
        ...userClub.finances,
        balance: userClub.finances.balance - serviceCost,
      },
    };
    return {
      updatedSave: {
        ...save,
        clubs: { ...save.clubs, [userClub.id]: updatedClub },
      },
      success: true,
      message: 'Mantenimiento integral completado. Estado mecánico del avión del club restablecido al 100%.',
    };
  } else {
    if (pl.personalBankBalance < serviceCost) {
      return { updatedSave: save, success: false, message: 'Fondos personales insuficientes para la revisión técnica (25.000 €).' };
    }
    const newBalance = pl.personalBankBalance - serviceCost;
    const tx: PersonalTransaction = {
      id: `tx_serv_${Date.now()}`,
      date: save.currentDate,
      type: 'GASTO_MANTENIMIENTO',
      concept: 'Revisión técnica de aeronave en taller aeronáutico certificado',
      amount: -serviceCost,
      balanceAfter: newBalance,
    };
    const updatedAircraft = (pl.ownedAircraft || []).map((a) =>
      a.id === aircraftId ? { ...a, mechanicalCondition: 100 } : a
    );
    return {
      updatedSave: {
        ...save,
        privateLife: {
          ...pl,
          personalBankBalance: newBalance,
          ownedAircraft: updatedAircraft,
          transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
        },
      },
      success: true,
      message: 'Revisión técnica superada con éxito. Tu avión personal está al 100% de fiabilidad mecánica.',
    };
  }
}

export function obtainPilotLicense(save: GameSave): { updatedSave: GameSave; success: boolean; message: string } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const licenseCost = 35000;

  if (pl.personalBankBalance < licenseCost) {
    return {
      updatedSave: save,
      success: false,
      message: `Fondos personales insuficientes. El curso de piloto oficial cuesta ${licenseCost.toLocaleString()} € y tienes ${pl.personalBankBalance.toLocaleString()} €.`,
    };
  }

  const newBalance = pl.personalBankBalance - licenseCost;
  const tx: PersonalTransaction = {
    id: `tx_pilot_${Date.now()}`,
    date: save.currentDate,
    type: 'CURSO_PILOTO',
    concept: 'Matrícula en Escuela de Vuelo y tasas de Examen Oficial de Piloto Comercial',
    amount: -licenseCost,
    balanceAfter: newBalance,
  };

  const news: NewsItem = {
    id: `news_pilot_${Date.now()}`,
    date: save.currentDate,
    title: `¡${save.manager.lastName} obtiene la Licencia Oficial de Piloto!`,
    content: `El técnico ${save.manager.firstName} ${save.manager.lastName} ha superado con éxito las pruebas de navegación, despegue, crucero y aterrizaje, obteniendo la Licencia de Piloto Comercial Oficial. A partir de ahora podrá pilotar personalmente el avión de la plantilla en los desplazamientos del club.`,
    category: 'ENTRENADOR',
    read: false,
  };

  const updatedLicense: PilotLicense = {
    hasLicense: true,
    licenseType: 'PILOTO_COMERCIAL_OFICIAL',
    examsPassed: 4,
    totalFlightHours: 50,
    isClubOfficialPilot: true,
    hasHiredProPilot: false,
    hiredPilotMonthlySalary: 0,
  };

  return {
    updatedSave: {
      ...save,
      news: [news, ...(save.news || [])],
      privateLife: {
        ...pl,
        personalBankBalance: newBalance,
        pilotLicense: updatedLicense,
        transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
      },
    },
    success: true,
    message: '¡EXAMEN SUPERADO! Ya dispones de tu Licencia de Piloto Oficial y estás habilitado para pilotar el avión del equipo.',
  };
}

export function toggleClubOfficialPilot(
  save: GameSave, 
  isOfficialPilot: boolean
): { updatedSave: GameSave; success: boolean; message: string } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  if (!pl.pilotLicense?.hasLicense && isOfficialPilot) {
    return { updatedSave: save, success: false, message: 'No puedes pilotar sin haber obtenido previamente la licencia de piloto.' };
  }

  const updatedLicense: PilotLicense = {
    ...pl.pilotLicense,
    isClubOfficialPilot: isOfficialPilot,
  };

  return {
    updatedSave: {
      ...save,
      privateLife: {
        ...pl,
        pilotLicense: updatedLicense,
      },
    },
    success: true,
    message: isOfficialPilot 
      ? '¡Activado! Ahora eres el Piloto Oficial del club en todos los desplazamientos.' 
      : 'Has delegado el mando de vuelo a los pilotos auxiliares del club.',
  };
}

export function hireProPilot(save: GameSave): { updatedSave: GameSave; success: boolean; message: string } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const updatedLicense: PilotLicense = {
    ...pl.pilotLicense,
    hasHiredProPilot: !pl.pilotLicense.hasHiredProPilot,
    hiredPilotMonthlySalary: 8500,
    isClubOfficialPilot: false,
  };

  return {
    updatedSave: {
      ...save,
      privateLife: {
        ...pl,
        pilotLicense: updatedLicense,
      },
    },
    success: true,
    message: updatedLicense.hasHiredProPilot 
      ? 'Has contratado a un Comandante Profesional Senior para pilotar todos tus vuelos.' 
      : 'Has rescindido el contrato del piloto profesional privado.',
  };
}

export function simulateTeamFlight(
  save: GameSave, 
  rivalName: string, 
  weather: string = 'Despejado'
): { updatedSave: GameSave; report: string; moraleDelta: number } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const userClub = save.clubs[save.userClubId];
  const aircraft = userClub?.officialAircraft || pl.ownedAircraft?.[0];

  let moraleDelta = 5;
  let report = '';

  if (!aircraft) {
    report = `Desplazamiento ordinario en autobús de línea hacia el feudo de ${rivalName}.`;
    moraleDelta = 0;
  } else if (weather === 'Tormenta') {
    report = `Vuelo accidentado a través de fuertes turbulencias atmosféricas en el ${aircraft.model}. La plantilla sufrió mareos leves pero llegó a tiempo.`;
    moraleDelta = -2;
  } else {
    report = `Vuelo plácido y lujoso a bordo del ${aircraft.model}. La plantilla llega con máxima frescura y moral alta para medirse a ${rivalName}.`;
    moraleDelta = 6;
  }

  // Award flight hours to pilot
  if (pl.pilotLicense?.hasLicense) {
    save = {
      ...save,
      privateLife: {
        ...pl,
        pilotLicense: {
          ...pl.pilotLicense,
          totalFlightHours: (pl.pilotLicense.totalFlightHours || 0) + 2,
        },
      },
    };
  }

  return {
    updatedSave: save,
    report,
    moraleDelta,
  };
}

export function executeCatastrophicCrash(
  save: GameSave
): { updatedSave: GameSave; success: boolean; message: string } {
  const userClub = save.clubs[save.userClubId];
  if (!userClub) {
    return { updatedSave: save, success: false, message: 'No tienes un club activo.' };
  }

  // 1. Destroy aircraft
  const updatedClub: Club = {
    ...userClub,
    officialAircraft: undefined,
    finances: {
      ...userClub.finances,
      balance: userClub.finances.balance + 25000000, // Ayuda y fondo solidario de la FIFA
    },
  };

  // 2. Generate 18 emergency solidary replacement players
  const newPlayers: Record<string, Player> = {};
  const newPlayerIds: string[] = [];
  const positions: Position[] = ['POR', 'POR', 'DFC', 'DFC', 'DFC', 'LD', 'LI', 'MCD', 'MC', 'MC', 'MCO', 'ED', 'EI', 'DC', 'DC', 'MC', 'DFC', 'DEL' as any];

  positions.forEach((pos, idx) => {
    const pid = `survivor_relief_${Date.now()}_${idx}`;
    newPlayerIds.push(pid);
    newPlayers[pid] = {
      id: pid,
      firstName: `Promesa`,
      lastName: `Solidaria ${idx + 1}`,
      birthDate: '2007-06-12',
      nationality: 'España',
      age: 18 + (idx % 4),
      primaryPosition: pos,
      overallRating: 64 + (idx % 8),
      potential: 78 + (idx % 10),
      clubId: userClub.id,
      isTransferListed: false,
      isLoanListed: false,
      marketValue: 120000 + idx * 30000,
      attributes: {
        disparo: 62,
        pase: 65,
        regate: 64,
        defensa: 62,
        velocidad: 70,
        resistencia: 72,
        fuerza: 66,
        vision: 64,
        liderazgo: 60,
      },
      contract: {
        wagePerWeek: 800,
        contractEndYear: 2030,
        releaseClause: 1200000,
        squadStatus: 'Titular',
      },
      fitness: 100,
      morale: 100,
      matchReadiness: 100,
      isInjured: false,
      seasonStats: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        averageRating: 6.8,
      },
    };
  });

  updatedClub.playerIds = newPlayerIds;
  updatedClub.startingElevenIds = newPlayerIds.slice(0, 11);
  updatedClub.benchPlayerIds = newPlayerIds.slice(11);

  const disasterNews: NewsItem = {
    id: `news_disaster_${Date.now()}`,
    date: save.currentDate,
    title: `¡LUTO MUNDIAL! Accidente aéreo del ${userClub.name} y heroica reconstrucción`,
    content: `Una tragedia aérea sin precedentes conmociona al fútbol internacional. El avión del ${userClub.name} sufrió un fallo catastrófico en aproximación. La FIFA y la RFEF han decretado tres días de luto oficial y habilitado una partida de ayuda solidaria urgente de 25.000.000 €. Clubes de todo el mundo han cedido jóvenes talentos para permitir que el ${userClub.name} continúe compitiendo con orgullo y memoria eterna.`,
    category: 'DIRECTIVA',
    read: false,
  };

  const updatedSave: GameSave = {
    ...save,
    clubs: {
      ...save.clubs,
      [userClub.id]: updatedClub,
    },
    players: {
      ...save.players,
      ...newPlayers,
    },
    news: [disasterNews, ...(save.news || [])],
  };

  return {
    updatedSave,
    success: true,
    message: `¡Tragedia y renacimiento! El ${userClub.name} ha recibido 25.000.000 € y 18 canteranos solidarios para reconstruir su historia desde las cenizas.`,
  };
}

// ============================================================================
// SECCIÓN: MUNDO CRIMINAL, PODER Y SISTEMA POLICIAL (0 A 12 ESTRELLAS)
// ============================================================================

export function executeHackingOperation(
  save: GameSave, 
  targetClubId: string, 
  puzzleSuccess: boolean
): { updatedSave: GameSave; success: boolean; message: string; starsAdded: number } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const targetClub = save.clubs[targetClubId];
  if (!targetClub) {
    return { updatedSave: save, success: false, message: 'Club objetivo no encontrado.', starsAdded: 0 };
  }

  const starsAdded = puzzleSuccess ? 2 : 4;
  const newStars = Math.min(12, (pl.criminal?.wantedStars || 0) + starsAdded);

  const record: CriminalRecordItem = {
    id: `rec_hack_${Date.now()}`,
    date: save.currentDate,
    crimeType: 'HACKEO',
    targetClubName: targetClub.name,
    cost: 0,
    starsGained: starsAdded,
    detected: !puzzleSuccess,
    outcomeDescription: puzzleSuccess
      ? `Infiltración cibernética con éxito en los servidores del ${targetClub.name}. Filtrada base de datos de ojeo y esquemas tácticos.`
      : `Intento fallido de hackeo al ${targetClub.name}. Cortafuegos detectó la IP de origen y la Fiscalía abre investigación cibernética.`,
  };

  const updatedTargetClub: Club = {
    ...targetClub,
    boardConfidence: Math.max(20, targetClub.boardConfidence - (puzzleSuccess ? 6 : 2)),
  };

  let updatedSave: GameSave = {
    ...save,
    clubs: {
      ...save.clubs,
      [targetClub.id]: updatedTargetClub,
    },
    privateLife: {
      ...pl,
      criminal: {
        ...pl.criminal,
        wantedStars: newStars,
        isUnderInvestigation: newStars >= 4,
        totalCrimesCommitted: (pl.criminal?.totalCrimesCommitted || 0) + 1,
        records: [record, ...(pl.criminal?.records || [])],
      },
    },
  };

  // Check 12 stars auto-arrest
  if (newStars >= 12) {
    return serveTwentyYearsPrisonSentence(updatedSave);
  }

  return {
    updatedSave,
    success: puzzleSuccess,
    starsAdded,
    message: puzzleSuccess
      ? `¡Ciberataque completado con éxito! Has vulnerado los sistemas del ${targetClub.name}. Confianza del rival erosionada (+2 estrellas policiales).`
      : `¡Alarma activada! Los sistemas de seguridad del ${targetClub.name} rastrearon tu intrusión (+4 estrellas policiales).`,
  };
}

export function hireSicarioContract(
  save: GameSave, 
  targetClubId: string, 
  targetPlayerId?: string
): { updatedSave: GameSave; success: boolean; message: string; starsAdded: number } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const cost = 220000;

  if (pl.personalBankBalance < cost) {
    return {
      updatedSave: save,
      success: false,
      message: `Fondos personales insuficientes. El contrato clandestino cuesta ${cost.toLocaleString()} € y dispones de ${pl.personalBankBalance.toLocaleString()} €.`,
      starsAdded: 0,
    };
  }

  const targetClub = save.clubs[targetClubId];
  if (!targetClub) {
    return { updatedSave: save, success: false, message: 'Club objetivo no encontrado.', starsAdded: 0 };
  }

  // Find target star player
  const chosenPlayerId = targetPlayerId || targetClub.startingElevenIds?.[0] || targetClub.playerIds?.[0];
  const targetPlayer = chosenPlayerId ? save.players[chosenPlayerId] : undefined;

  const starsAdded = 5;
  const newStars = Math.min(12, (pl.criminal?.wantedStars || 0) + starsAdded);
  const newBalance = pl.personalBankBalance - cost;

  const tx: PersonalTransaction = {
    id: `tx_sicario_${Date.now()}`,
    date: save.currentDate,
    type: 'OPERACION_CLANDESTINA',
    concept: `Operación confidencial de neutralización deportiva contra el ${targetClub.name}`,
    amount: -cost,
    balanceAfter: newBalance,
  };

  const record: CriminalRecordItem = {
    id: `rec_sicario_${Date.now()}`,
    date: save.currentDate,
    crimeType: 'SICARIO',
    targetClubName: targetClub.name,
    targetPersonName: targetPlayer ? `${targetPlayer.firstName} ${targetPlayer.lastName}` : 'Cuerpo Técnico',
    cost,
    starsGained: starsAdded,
    detected: true,
    outcomeDescription: `Neutralización de ${targetPlayer ? `${targetPlayer.firstName} ${targetPlayer.lastName}` : 'figura rival'}. Baja deportiva durante 6 meses.`,
  };

  // Injure rival star player for 180 days
  const updatedPlayers = { ...save.players };
  if (targetPlayer) {
    updatedPlayers[targetPlayer.id] = {
      ...targetPlayer,
      isInjured: true,
      injuryWeeksLeft: 24,
      injuryName: 'Lesión traumática en incidente extradeportivo grave',
      fitness: 15,
      morale: 30,
    };
  }

  const news: NewsItem = {
    id: `news_sicario_${Date.now()}`,
    date: save.currentDate,
    title: `GRAVE: Misterioso ataque deja fuera de combate a ${targetPlayer ? targetPlayer.lastName : 'la estrella'} del ${targetClub.name}`,
    content: `La Policía Nacional investiga un violento incidente en el domicilio de ${targetPlayer ? `${targetPlayer.firstName} ${targetPlayer.lastName}` : 'una figura del rival'}. Estará de baja al menos 6 meses. La directiva del ${targetClub.name} denuncia un presunto sabotaje orquestado.`,
    category: 'LESIÓN',
    read: false,
  };

  let updatedSave: GameSave = {
    ...save,
    players: updatedPlayers,
    news: [news, ...(save.news || [])],
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
      criminal: {
        ...pl.criminal,
        wantedStars: newStars,
        isUnderInvestigation: true,
        totalCrimesCommitted: (pl.criminal?.totalCrimesCommitted || 0) + 1,
        records: [record, ...(pl.criminal?.records || [])],
      },
    },
  };

  if (newStars >= 12) {
    return serveTwentyYearsPrisonSentence(updatedSave);
  }

  return {
    updatedSave,
    success: true,
    starsAdded,
    message: `¡Operación ejecutada! ${targetPlayer ? `${targetPlayer.firstName} ${targetPlayer.lastName}` : 'El rival'} queda neutralizado durante 6 meses (+5 estrellas policiales).`,
  };
}

export function bribeRefereeForMatch(
  save: GameSave, 
  rivalClubId: string, 
  amount: number = 85000
): { updatedSave: GameSave; success: boolean; message: string; starsAdded: number } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  if (pl.personalBankBalance < amount) {
    return {
      updatedSave: save,
      success: false,
      message: `Fondos personales insuficientes. El soborno arbitral exige ${amount.toLocaleString()} € en efectivo.`,
      starsAdded: 0,
    };
  }

  const rivalClub = save.clubs[rivalClubId];
  const rivalName = rivalClub ? rivalClub.name : 'Rival de la jornada';

  const starsAdded = 3;
  const newStars = Math.min(12, (pl.criminal?.wantedStars || 0) + starsAdded);
  const newBalance = pl.personalBankBalance - amount;

  const tx: PersonalTransaction = {
    id: `tx_bribe_${Date.now()}`,
    date: save.currentDate,
    type: 'SOBORNO_ARBITRAL',
    concept: `Pago opaco a emisarios del colegio arbitral para el partido vs ${rivalName}`,
    amount: -amount,
    balanceAfter: newBalance,
  };

  const record: CriminalRecordItem = {
    id: `rec_bribe_${Date.now()}`,
    date: save.currentDate,
    crimeType: 'SOBORNO_ARBITRO',
    targetClubName: rivalName,
    cost: amount,
    starsGained: starsAdded,
    detected: false,
    outcomeDescription: `Soborno arbitral acordado. El colegiado pitará penaltis a favor y será implacable con el rival.`,
  };

  let updatedSave: GameSave = {
    ...save,
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
      criminal: {
        ...pl.criminal,
        wantedStars: newStars,
        isUnderInvestigation: newStars >= 4,
        totalCrimesCommitted: (pl.criminal?.totalCrimesCommitted || 0) + 1,
        records: [record, ...(pl.criminal?.records || [])],
        activeRefereeBribe: {
          rivalClubId,
          bribedAmount: amount,
          benefitedTeam: 'home',
        },
      },
    },
  };

  if (newStars >= 12) {
    return serveTwentyYearsPrisonSentence(updatedSave);
  }

  return {
    updatedSave,
    success: true,
    starsAdded,
    message: `¡Pacto arbitral cerrado! El árbitro favorecerá decisivamente a tu equipo en el próximo encuentro (+3 estrellas policiales).`,
  };
}

export function executeSabotageAttack(
  save: GameSave, 
  targetClubId: string, 
  sabotageType: 'CESPED' | 'TORRETAS' | 'ESTRUCTURAL' = 'CESPED'
): { updatedSave: GameSave; success: boolean; message: string; starsAdded: number; clubExtinct?: boolean } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const cost = 75000;

  if (pl.personalBankBalance < cost) {
    return {
      updatedSave: save,
      success: false,
      message: `Fondos personales insuficientes. La operación de sabotaje cuesta ${cost.toLocaleString()} €.`,
      starsAdded: 0,
    };
  }

  const targetClub = save.clubs[targetClubId];
  if (!targetClub) {
    return { updatedSave: save, success: false, message: 'Club objetivo no encontrado.', starsAdded: 0 };
  }

  const starsAdded = 4;
  const newStars = Math.min(12, (pl.criminal?.wantedStars || 0) + starsAdded);
  const newBalance = pl.personalBankBalance - cost;

  const tx: PersonalTransaction = {
    id: `tx_sab_${Date.now()}`,
    date: save.currentDate,
    type: 'OPERACION_CLANDESTINA',
    concept: `Sabotaje encubierto a instalaciones del ${targetClub.name}`,
    amount: -cost,
    balanceAfter: newBalance,
  };

  const record: CriminalRecordItem = {
    id: `rec_sab_${Date.now()}`,
    date: save.currentDate,
    crimeType: 'SABOTAJE_ESTADIO',
    targetClubName: targetClub.name,
    cost,
    starsGained: starsAdded,
    detected: true,
    outcomeDescription: `Sabotaje a ${targetClub.stadium?.name || 'estadio rival'}. Clausura forzada y daños millonarios.`,
  };

  // Check if rival collapses economically into extinction
  const willExtinguish = (targetClub.finances?.balance || 0) < 150000 && (targetClub.reputation || 50) < 60;
  let updatedTargetClub: Club = {
    ...targetClub,
    stadiumDamagedMatches: 4,
    stadium: {
      ...targetClub.stadium,
      condition: 15,
    },
    finances: {
      ...targetClub.finances,
      balance: targetClub.finances.balance - 500000,
    },
  };

  let updatedClubs = { ...save.clubs, [targetClub.id]: updatedTargetClub };
  let newsList = [...(save.news || [])];

  if (willExtinguish) {
    const emergingResult = generateEmergingReplacementClub(save, targetClub);
    updatedClubs = emergingResult.updatedClubs;
    newsList = [emergingResult.extinctionNews, ...newsList];
  } else {
    newsList.unshift({
      id: `news_sab_${Date.now()}`,
      date: save.currentDate,
      title: `ESCÁNDALO: Ataque nocturno inutiliza el estadio del ${targetClub.name}`,
      content: `El estadio del ${targetClub.name} ha amanecido con graves destrozos intencionados en el césped y cuadros eléctricos. El club se ve forzado a disputar sus próximos 4 partidos a puerta cerrada o en campo neutral con pérdidas millonarias.`,
      category: 'INSTALACIONES',
      read: false,
    });
  }

  let updatedSave: GameSave = {
    ...save,
    clubs: updatedClubs,
    news: newsList,
    privateLife: {
      ...pl,
      personalBankBalance: newBalance,
      transactionsHistory: [tx, ...pl.transactionsHistory.slice(0, 49)],
      criminal: {
        ...pl.criminal,
        wantedStars: newStars,
        isUnderInvestigation: true,
        totalCrimesCommitted: (pl.criminal?.totalCrimesCommitted || 0) + 1,
        records: [record, ...(pl.criminal?.records || [])],
      },
    },
  };

  if (newStars >= 12) {
    return serveTwentyYearsPrisonSentence(updatedSave);
  }

  return {
    updatedSave,
    success: true,
    starsAdded,
    clubExtinct: willExtinguish,
    message: willExtinguish
      ? `¡DEVASTADOR! El sabotaje ha provocado la quiebra y extinción del ${targetClub.name}. Ha nacido un nuevo club emergente para ocupar su plaza (+4 estrellas).`
      : `¡Sabotaje consumado! El estadio del ${targetClub.name} queda clausurado durante 4 partidos (+4 estrellas policiales).`,
  };
}

export function generateEmergingReplacementClub(
  save: GameSave, 
  defunctClub: Club
): { updatedClubs: Record<string, Club>; extinctionNews: NewsItem; newClubId: string } {
  const newClubId = `emerging_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const emergingNames = [
    { name: 'C.D. Nueva Esperanza', short: 'Nueva Esperanza', code: 'NES' },
    { name: 'Unión Popular Resurgimiento', short: 'Resurgimiento', code: 'UPR' },
    { name: 'Atlético Renacer F.C.', short: 'Renacer', code: 'REN' },
    { name: 'F.C. Fénix Deportivo', short: 'Fénix', code: 'FNX' },
  ];
  const chosen = emergingNames[Math.floor(Math.random() * emergingNames.length)];

  const newClub: Club = {
    ...defunctClub,
    id: newClubId,
    name: chosen.name,
    shortName: chosen.short,
    code: chosen.code,
    foundedYear: parseInt((save.currentSeason || '2026').slice(0, 4), 10),
    reputation: Math.max(45, defunctClub.reputation - 5),
    stadium: {
      ...defunctClub.stadium,
      condition: 85,
    },
    finances: {
      ...defunctClub.finances,
      balance: 1500000,
      transferBudget: 500000,
    },
    historyTitles: [],
  };

  const updatedClubs = { ...save.clubs };
  delete updatedClubs[defunctClub.id];
  updatedClubs[newClubId] = newClub;

  const extinctionNews: NewsItem = {
    id: `news_extinct_${Date.now()}`,
    date: save.currentDate,
    title: `HISTÓRICO: Desaparición del ${defunctClub.name} y nacimiento del ${newClub.name}`,
    content: `La asamblea general ha certificado la disolución judicial y quiebra económica del legendario ${defunctClub.name}. Inmediatamente, la afición y empresarios locales han refundado la entidad bajo la denominación de ${newClub.name}, que asumirá su plaza competitiva con ilusión y apoyo popular unánime.`,
    category: 'DIRECTIVA',
    read: false,
  };

  return {
    updatedClubs,
    extinctionNews,
    newClubId,
  };
}

export function serveTwentyYearsPrisonSentence(
  save: GameSave
): { updatedSave: GameSave; success: boolean; message: string; starsAdded: number } {
  const pl = save.privateLife || ensurePrivateLifeState(save).privateLife!;
  const currentSeasonYear = parseInt((save.currentSeason || '2026').slice(0, 4), 10);
  const releaseYear = currentSeasonYear + 20;
  const releaseSeason = `${releaseYear}/${String(releaseYear + 1).slice(2)}`;

  // 1. Arrest news & contract termination
  const formerClubName = save.manager.contract.clubName || 'su club';
  const arrestNews: NewsItem = {
    id: `news_arrest_${Date.now()}`,
    date: save.currentDate,
    title: `¡DETENCIÓN POLICIAL! ${save.manager.lastName} condenado a 20 años de prisión`,
    content: `En una operación conjunta de la Interpol y la UDEF, el entrenador ${save.manager.firstName} ${save.manager.lastName} ha sido detenido en el campo de entrenamiento tras acumular 12 estrellas de búsqueda policial por delitos de espionaje informático, sabotaje y corrupción deportiva. El Tribunal Supremo le condena a 20 años de reclusión en Centro Penitenciario. Queda suspendida de inmediato su licencia federativa.`,
    category: 'DIRECTIVA',
    read: false,
  };

  let workingSave: GameSave = {
    ...save,
    userClubId: '',
    news: [arrestNews, ...(save.news || [])],
    manager: {
      ...save.manager,
      contract: {
        ...save.manager.contract,
        clubId: '',
        clubName: 'Sin equipo (Condena de prisión)',
        wageWeekly: 0,
        wageAnnual: 0,
      },
    },
    privateLife: {
      ...pl,
      criminal: {
        ...pl.criminal,
        wantedStars: 12,
        inPrison: true,
        prisonSentenceYears: 20,
        prisonReleaseSeason: releaseSeason,
      },
    },
  };

  // 2. Fast-simulate 20 seasons into world history in loop!
  try {
    for (let i = 0; i < 20; i++) {
      workingSave = simulateOneFullSeasonFast(workingSave);
    }
  } catch (err) {
    console.error('Error during 20 years prison simulation loop:', err);
  }

  // 3. Manager is released after 20 years
  const freedomNewsText = `Tras cumplir íntegramente su condena de 20 años en prisión, ${save.manager.firstName} ${save.manager.lastName} sale a la calle en la temporada ${releaseSeason}. El fútbol mundial ha evolucionado dos décadas: nuevas leyendas reinan en Europa, antiguos rivales se han retirado y el técnico tiene la oportunidad de redimirse y reconstruir su carrera desde abajo.`;

  const freedomNews: NewsItem = {
    id: `news_freedom_${Date.now()}`,
    date: workingSave.currentDate,
    title: `¡EN LIBERTAD TRAS 20 AÑOS! ${save.manager.lastName} regresa al mundo del fútbol`,
    content: freedomNewsText,
    category: 'ENTRENADOR',
    read: false,
  };

  const finalSave: GameSave = {
    ...workingSave,
    currentSeason: releaseSeason,
    news: [freedomNews, ...(workingSave.news || [])],
    privateLife: {
      ...(workingSave.privateLife || pl),
      personalBankBalance: Math.max(50000, (workingSave.privateLife?.personalBankBalance || 0) * 0.4), // Fondos remanentes
      criminal: {
        ...(workingSave.privateLife?.criminal || pl.criminal),
        wantedStars: 0, // Antecedentes saldados
        isUnderInvestigation: false,
        inPrison: false,
        prisonSentenceYears: 0,
        prisonReleaseSeason: releaseSeason,
        prisonReleaseNews: freedomNewsText,
      },
    },
  };

  return {
    updatedSave: finalSave,
    success: true,
    starsAdded: 0,
    message: `¡CONDENA CUMPLIDA! Has pasado 20 años en prisión. El mundo del fútbol ha avanzado 20 temporadas completas hasta el año ${releaseYear}. Ya eres libre.`,
  };
}

