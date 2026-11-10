import { Club } from '../types/club';
import { GameSave, NewsItem } from '../types/game';
import { Player, Position } from '../types/player';
import { Competition } from '../types/competition';
import { KnockoutTournamentState, CupMatch, initializeCopaIntergalactica } from './internationalCompetitionsEngine';

// ============================================================================
// MOTOR DE EVOLUCIÓN HISTÓRICA A LARGO PLAZO (50, 100 Y 200 AÑOS)
// ============================================================================

export interface EvolutionMilestonesRecord {
  fiftyYearsTriggered?: boolean;
  hundredYearsTriggered?: boolean;
  twoHundredYearsTriggered?: boolean;
  activatedAlienClubs?: number;
  emergedNations?: string[];
}

export const ALIEN_FIRST_NAMES = [
  'Zor-El', 'Kry-Vok', 'Xylar', "T'Kalon", 'Zeph-Kryon', 'Balth-Zor', 'Qrix-9', 'Vokk-Raa', 'Sol-Ark', 'Nex-Tyron',
  'Aethel-6', 'Drak-Nor', 'Vael-Khor', 'Thok-Ra', 'Zal-Tor', 'Vor-Kesh', 'Elor-Vex', 'Kael-Zir', 'Orin-Psi', 'Zen-Dax'
];

export const ALIEN_LAST_NAMES = [
  'Prime', 'Centauri', 'Kepler', 'Vortex', 'Starlight', 'Nova', 'Pulsar', 'Cosmos', 'Zenith', 'Andromeda',
  'Hyperion', 'Solaris', 'Quantum', 'Orbital', 'Nebula', 'Eclipse', 'Supernova', 'Singularity', 'Photon', 'Tachyon'
];

export const ALIEN_CIVILIZATIONS = [
  { planet: 'Kepler-452b', flag: '🪐', prefix: 'Kepler', style: 'Fútbol Gravitacional de Alta Frecuencia' },
  { planet: 'Proxima Centauri b', flag: '☄️', prefix: 'Centauri', style: 'Transiciones a Velocidad Subluz' },
  { planet: 'Trappist-1e', flag: '🌌', prefix: 'Trappist', style: 'Tiki-Taka Telepático Multidimensional' },
  { planet: 'Andrómeda Prime', flag: '🛸', prefix: 'Andromeda', style: 'Presión de Agujero Negro' },
  { planet: 'Sirio IV', flag: '✨', prefix: 'Sirius', style: 'Defensa de Escudos Cuánticos' },
  { planet: 'Aldebarán', flag: '🔴', prefix: 'Aldebaran', style: 'Ataque de Gigantes Rojos' },
  { planet: 'Vega Prime', flag: '⚡', prefix: 'Vega', style: 'Velocidad Hiperbólica' },
  { planet: 'Rigel B', flag: '🔷', prefix: 'Rigel', style: 'Algoritmos Sintéticos de Precisión' },
  { planet: 'Gliese 667Cc', flag: '🌊', prefix: 'Gliese', style: 'Fútbol Hidrodinámico de Marea' },
  { planet: 'HD 40307g', flag: '🪐', prefix: 'SuperTierra', style: 'Fuerza Muscular Aumentada x3' },
  { planet: 'K2-18b', flag: '💎', prefix: 'Hygiea', style: 'Posesión Molecular Flotante' },
  { planet: 'Wolf 1061c', flag: '🐺', prefix: 'Wolf', style: 'Contraataque de Caza Estelar' },
];

export const ALIEN_CLUB_SUFFIXES = [
  'Supernova SC', 'Cosmic Pulsars', 'Quantum FC', 'Starlight Dynamo', 'Zenith Athletic',
  'Galactic Wanderers', 'Nebula United', 'Astro Cybernetic', 'Solaris Sporting',
  'Interstellar City', 'Vortex Prime', 'Hyperion CF', 'Stargate Athletic', 'Orbital Rovers'
];

/**
 * Checks elapsed career years and triggers authentic world evolutions
 */
export function checkAndTriggerWorldEvolutionMilestones(
  save: GameSave,
  currentSeason: string
): { updatedSave: GameSave; milestoneNews: NewsItem[] } {
  let updatedClubs = { ...save.clubs };
  const milestoneNews: NewsItem[] = [];
  const milestones: EvolutionMilestonesRecord = (save as any).worldMilestones || {};

  // Extract starting year (default 2024) and current year
  const startYear = 2024;
  const currentYear = parseInt(currentSeason.slice(0, 4), 10);
  const yearsElapsed = Math.max(0, currentYear - startYear);

  // --------------------------------------------------------------------------
  // HITO 1: 50 AÑOS (Refundación de clubes, reestructuración categorías bajas)
  // --------------------------------------------------------------------------
  if (yearsElapsed >= 50 && !milestones.fiftyYearsTriggered) {
    milestones.fiftyYearsTriggered = true;

    // Refundación de clubes en apuros: reinyectar salud financiera a entidades históricas
    Object.keys(updatedClubs).forEach((cid) => {
      const c = updatedClubs[cid];
      if (c.finances.balance < 2000000 || c.reputation < 55) {
        updatedClubs[cid] = {
          ...c,
          reputation: Math.min(85, c.reputation + 6),
          finances: {
            ...c.finances,
            balance: Math.max(10000000, c.finances.balance + 15000000),
            transferBudget: Math.max(5000000, c.finances.transferBudget + 8000000),
          },
        };
      }
    });

    const news50: NewsItem = {
      id: `news_milestone_50_${Date.now()}`,
      date: save.currentDate,
      title: `🏛️ HITO HISTÓRICO: 50 Años de Santako Fútbol — Refundación y Renacimiento de Clubes`,
      content: `El fútbol mundial cumple medio siglo ininterrumpido en la carrera. La Federación Internacional aprueba el Pacto de Estabilidad Financiera: los clubes históricos en apuros han completado su refundación institucional con saneamiento de deudas y expansión de canteras. La pirámide divisional se moderniza con nuevas entidades emergentes.`,
      category: 'DIRECTIVA',
      read: false,
    };
    milestoneNews.push(news50);
  }

  // --------------------------------------------------------------------------
  // HITO 2: 100 AÑOS (Aparición y desaparición de clubes + refundaciones históricas)
  // --------------------------------------------------------------------------
  let updatedDefunctClubs = { ...((save as any).defunctClubs || {}) };

  if (yearsElapsed >= 100 && !milestones.hundredYearsTriggered) {
    milestones.hundredYearsTriggered = true;
    milestones.emergedNations = ['Japón', 'Senegal', 'Marruecos', 'Corea del Sur', 'EE.UU.', 'Nigeria'];

    // Simular refundaciones de clubes en apuros (conservando siempre su historia en el palmarés)
    const lowerTierClubs = Object.values(updatedClubs).filter(
      (c) => c.id !== save.userClubId && (c.divisionId.includes('tier4') || c.divisionId.includes('tier5'))
    );

    if (lowerTierClubs.length > 0) {
      const bankruptClub = lowerTierClubs[0];
      // Guardar el club extinto para preservar su historia y palmarés acumulado
      updatedDefunctClubs[bankruptClub.id] = {
        ...bankruptClub,
        defunctYear: currentYear,
        defunctReason: 'Disolución y refundación institucional por quiebra financiera',
      };

      // Crear el club sucesor emergente
      const newClubId = `emergent_club_${currentYear}_1`;
      const successorClub: Club = {
        ...bankruptClub,
        id: newClubId,
        name: `Unió Esportiva ${bankruptClub.city}`,
        shortName: `UE ${bankruptClub.city.slice(0, 8)}`,
        code: `UE${bankruptClub.city.slice(0, 2).toUpperCase()}`,
        foundedYear: currentYear,
        reputation: 52,
        primaryColor: '#0ea5e9',
        secondaryColor: '#f59e0b',
        textColor: '#ffffff',
        stadium: {
          ...bankruptClub.stadium,
          name: `Nou Estadi Municipal de ${bankruptClub.city}`,
        },
        finances: {
          ...bankruptClub.finances,
          balance: 8000000,
          transferBudget: 3500000,
          recentLedger: [],
        },
      };

      updatedClubs[newClubId] = successorClub;
      delete updatedClubs[bankruptClub.id];

      // Reemplazar id en la competición
      if (save.competitions[bankruptClub.divisionId]) {
        const comp = save.competitions[bankruptClub.divisionId];
        comp.clubIds = comp.clubIds.map((id) => (id === bankruptClub.id ? newClubId : id));
        if (comp.standings) {
          comp.standings = comp.standings.map((r) => (r.teamId === bankruptClub.id ? { ...r, teamId: newClubId } : r));
        }
      }
    }

    const news100: NewsItem = {
      id: `news_milestone_100_${Date.now()}`,
      date: save.currentDate,
      title: `🌍 CENTENARIO: 100 Años de Carrera — Refundaciones y Emergencia de Nuevas Potencias`,
      content: `¡Un siglo de historia deportiva completado! El fútbol vive una era de renovación: la Federación registra las primeras refundaciones de entidades con quiebra técnica, conservando intacto su palmarés y trofeos históricos. Al mismo tiempo, selecciones como Senegal, Japón, Marruecos y Corea del Sur consolidan hegemonía permanente en el Top 10 mundial.`,
      category: 'DIRECTIVA',
      read: false,
    };
    milestoneNews.push(news100);
  }

  // --------------------------------------------------------------------------
  // HITO 3: 200 AÑOS (Universo Intergaláctico Completo: 3 Divisiones, 64 Clubes y Jugadores Alien)
  // --------------------------------------------------------------------------
  let updatedCups = { ...(save.cupTournaments || {}) };
  let updatedCompetitions = { ...(save.competitions || {}) };
  let updatedPlayers = { ...(save.players || {}) };

  if (yearsElapsed >= 200) {
    const hasGalacticClubs = Object.keys(updatedClubs).some((id) => id.startsWith('alien_'));
    const needsGalacticInit = !milestones.twoHundredYearsTriggered || !updatedCompetitions['gal_tier1'] || !hasGalacticClubs;

    if (needsGalacticInit) {
      milestones.twoHundredYearsTriggered = true;
      milestones.activatedAlienClubs = 48;

      // 1. Crear 48 Clubes Alienígenas con identidades y planetas
      const alienClubs: Club[] = [];
      let alienCounter = 1;

    for (let i = 0; i < 48; i++) {
      const civ = ALIEN_CIVILIZATIONS[i % ALIEN_CIVILIZATIONS.length];
      const suffix = ALIEN_CLUB_SUFFIXES[i % ALIEN_CLUB_SUFFIXES.length];
      const alienId = `alien_club_${alienCounter}`;
      const divTier = i < 16 ? 'gal_tier1' : i < 32 ? 'gal_tier2' : 'gal_tier3';

      const alienClub: Club = {
        id: alienId,
        name: `${civ.prefix} ${suffix}`,
        shortName: `${civ.flag} ${civ.prefix.slice(0, 3).toUpperCase()}`,
        code: `AL${String(alienCounter).padStart(2, '0')}`.slice(0, 4),
        divisionId: divTier,
        countryId: civ.planet,
        reputation: 80 + Math.floor(Math.random() * 18),
        stadium: {
          name: `Estadio Orbital ${civ.planet} Zenith`,
          capacity: 80000 + Math.floor(Math.random() * 40000),
          city: civ.planet,
          condition: 98,
          ticketPrice: 65,
          seasonTicketHolders: 60000,
          seasonTicketPrice: 650,
        },
        finances: {
          balance: 200000000,
          transferBudget: 110000000,
          weeklyWageBudget: 2200000,
          sponsorName: `Galactic Federation of ${civ.planet}`,
          sponsorAnnualRevenue: 60000000,
          seasonTicketRevenue: 39000000,
          recentLedger: [],
        },
        primaryColor: i % 2 === 0 ? '#9333ea' : '#06b6d4',
        secondaryColor: i % 2 === 0 ? '#38bdf8' : '#e11d48',
        textColor: '#ffffff',
        coachName: `Comandante ${civ.prefix} Prime`,
        city: civ.planet,
        foundedYear: 2226,
        facilities: {
          trainingGroundLevel: 5,
          youthAcademyLevel: 5,
          medicalCenterLevel: 5,
          stadiumLevel: 5,
        },
        boardObjective: 'Campeón de Liga',
        boardConfidence: 90,
        tacticFormation: '3-4-3',
        tacticMentality: 'Ofensiva',
        tacticTempo: 'Rápido',
        tacticPassing: 'Corto',
        tacticPressing: 'Intensa',
        playerIds: [],
        startingElevenIds: [],
        benchPlayerIds: [],
        historyTitles: [],
      };

      // Generar plantilla de 18 futbolistas alienígenas para cada club
      const positions: Position[] = ['POR', 'DFC', 'DFC', 'LD', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC', 'POR', 'DFC', 'MC', 'DC', 'ED', 'MCO', 'MCD'];
      positions.forEach((pos, pIdx) => {
        const fn = ALIEN_FIRST_NAMES[(alienCounter * 3 + pIdx) % ALIEN_FIRST_NAMES.length];
        const ln = ALIEN_LAST_NAMES[(alienCounter * 2 + pIdx) % ALIEN_LAST_NAMES.length];
        const ovr = 78 + Math.floor(Math.random() * 18);
        const pid = `alien_pl_${alienCounter}_${pIdx}`;

        const alienPl: Player = {
          id: pid,
          firstName: fn,
          lastName: ln,
          age: 20 + (pIdx % 10),
          birthDate: `${2226 - (20 + (pIdx % 10))}-04-18`,
          nationality: `${civ.flag} ${civ.planet}`,
          primaryPosition: pos,
          overallRating: ovr,
          potential: Math.min(99, ovr + Math.floor(Math.random() * 8)),
          clubId: alienId,
          marketValue: ovr * 1200000,
          squadNumber: pIdx + 1,
          attributes: {
            velocidad: Math.min(99, ovr + 4),
            resistencia: 95,
            fuerza: Math.min(99, ovr + 5),
            pase: ovr,
            regate: Math.min(99, ovr + 2),
            defensa: pos === 'POR' || pos === 'DFC' ? Math.min(99, ovr + 4) : 60,
            paradas: pos === 'POR' ? ovr : 20,
            reflejos: pos === 'POR' ? ovr + 2 : 25,
            vision: ovr,
            liderazgo: 80,
            disparo: ovr,
          },
          contract: {
            wagePerWeek: 45000 + ovr * 600,
            contractEndYear: 2232,
            releaseClause: ovr * 3000000,
            squadStatus: pIdx < 11 ? 'Indispensable' : 'Rotación',
          },
          fitness: 100,
          morale: 95,
          matchReadiness: 100,
          isInjured: false,
          isTransferListed: false,
          isLoanListed: false,
          seasonStats: {
            matchesPlayed: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0,
            averageRating: 8.5,
          },
        };

        updatedPlayers[pid] = alienPl;
        alienClub.playerIds.push(pid);
        if (pIdx < 11) alienClub.startingElevenIds.push(pid);
        else alienClub.benchPlayerIds.push(pid);
      });

      alienClubs.push(alienClub);
      updatedClubs[alienId] = alienClub;
      alienCounter++;
    }

    // 2. Crear las 3 Divisiones Galácticas Oficiales
    const galTiersConfig = [
      { id: 'gal_tier1', name: 'División Galáctica 1', shortName: 'Galáctica 1', startIdx: 0, endIdx: 16 },
      { id: 'gal_tier2', name: 'División Galáctica 2', shortName: 'Galáctica 2', startIdx: 16, endIdx: 32 },
      { id: 'gal_tier3', name: 'División Galáctica 3', shortName: 'Galáctica 3', startIdx: 32, endIdx: 48 },
    ];

    galTiersConfig.forEach((gt) => {
      const clubsInTier = alienClubs.slice(gt.startIdx, gt.endIdx);
      const tierComp: Competition = {
        id: gt.id,
        name: gt.name,
        shortName: gt.shortName,
        tier: 1,
        season: currentSeason,
        totalMatchdays: 30,
        promotionSlots: 2,
        playoffSlots: 2,
        relegationSlots: 2,
        clubIds: clubsInTier.map((c) => c.id),
        currentMatchday: 1,
        matches: [],
        standings: clubsInTier.map((c) => ({
          teamId: c.id,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          recentForm: [],
        })),
      };
      updatedCompetitions[gt.id] = tierComp;
    });

    // 3. Crear la Copa Intergaláctica de 64 Equipos (20 de la Tierra + 44 de las Divisiones Galácticas en 16 grupos de 4)
    updatedCups['copa_intergalactica'] = initializeCopaIntergalactica(updatedClubs, currentSeason);

    // 4. Inyectar 12 Jugadores Alienígenas Agentes Libres en el Mercado de Traspasos
    for (let fa = 0; fa < 12; fa++) {
      const civ = ALIEN_CIVILIZATIONS[fa % ALIEN_CIVILIZATIONS.length];
      const fn = ALIEN_FIRST_NAMES[(fa * 4 + 7) % ALIEN_FIRST_NAMES.length];
      const ln = ALIEN_LAST_NAMES[(fa * 3 + 2) % ALIEN_LAST_NAMES.length];
      const posList: Position[] = ['DC', 'MC', 'MCO', 'ED', 'EI', 'DFC', 'LD', 'LI'];
      const pos = posList[fa % posList.length];
      const ovr = 82 + Math.floor(Math.random() * 15);
      const pid = `alien_free_agent_${fa + 1}`;

      updatedPlayers[pid] = {
        id: pid,
        firstName: fn,
        lastName: ln,
        age: 22 + (fa % 6),
        birthDate: `${2226 - (22 + (fa % 6))}-07-14`,
        nationality: `${civ.flag} ${civ.planet}`,
        primaryPosition: pos,
        overallRating: ovr,
        potential: Math.min(99, ovr + 6),
        clubId: null, // Agente libre
        marketValue: ovr * 1500000,
        squadNumber: 99,
        attributes: {
          velocidad: Math.min(99, ovr + 5),
          resistencia: 99,
          fuerza: Math.min(99, ovr + 6),
          pase: ovr,
          regate: Math.min(99, ovr + 3),
          defensa: pos === 'DFC' ? ovr : 55,
          paradas: 20,
          reflejos: 25,
          vision: Math.min(99, ovr + 4),
          liderazgo: 85,
          disparo: ovr + 3,
        },
        contract: {
          wagePerWeek: 55000,
          contractEndYear: 2227,
          releaseClause: ovr * 4000000,
          squadStatus: 'Rotación',
        },
        fitness: 100,
        morale: 99,
        matchReadiness: 100,
        isInjured: false,
        isTransferListed: false,
        isLoanListed: false,
        seasonStats: {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          minutesPlayed: 0,
          averageRating: 9.0,
        },
      };
    }

    const news200: NewsItem = {
      id: `news_milestone_200_${Date.now()}`,
      date: save.currentDate,
      title: `🌌 ERA CÓSMICA (200 Años): Se inauguran las 3 Divisiones Galácticas y la Copa Intergaláctica de 64 Clubes`,
      content: `¡Acontecimiento histórico para la eternidad! El fútbol alcanza dos siglos ininterrumpidos y la Federación Cósmica aprueba la adhesión de los mundos habitados. Se crean la División Galáctica 1, 2 y 3 (con 48 clubes alienígenas y jugadores de Kepler, Próxima Centauri, Trappist-1, Andrómeda y Rigel), la Copa Intergaláctica de 64 clubes y la apertura del mercado de fichajes con futbolistas extraterrestres.`,
      category: 'DIRECTIVA',
      read: false,
    };
    milestoneNews.push(news200);
    }
  }

  const finalSave: GameSave = {
    ...save,
    clubs: updatedClubs,
    players: updatedPlayers,
    competitions: updatedCompetitions,
    cupTournaments: updatedCups,
    news: [...milestoneNews, ...(save.news || [])],
  };

  (finalSave as any).defunctClubs = updatedDefunctClubs;
  (finalSave as any).worldMilestones = milestones;
  return { updatedSave: finalSave, milestoneNews };
}
