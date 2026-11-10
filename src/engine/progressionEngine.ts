import { Club } from '../types/club';
import { Manager } from '../types/game';
import { Player, Position } from '../types/player';

const FIRST_NAMES = [
  'Pol', 'Marc', 'Adrià', 'Gerard', 'Nil', 'Arnau', 'Pau', 'Oriol', 'Eloi', 'Jan',
  'Aleix', 'Ferran', 'David', 'Carlos', 'Sergio', 'Dani', 'Iker', 'Lucas', 'Hugo', 'Mateo'
];

const LAST_NAMES = [
  'García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'González', 'Rodríguez', 'Fernández',
  'Valls', 'Navarro', 'Torres', 'Domènech', 'Serra', 'Mas', 'Pujol', 'Roca', 'Vidal', 'Castillo'
];

const POSITIONS: Position[] = ['POR', 'DFC', 'LD', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC'];

export function generateYouthProspect(club: Club, year: number): Player {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const pos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  const age = 16 + Math.floor(Math.random() * 2); // 16 or 17

  // Youth quality depends on club academy level
  const baseRating = 48 + club.facilities.youthAcademyLevel * 3 + Math.floor(Math.random() * 6);
  const potential = Math.min(94, baseRating + 18 + club.facilities.youthAcademyLevel * 2 + Math.floor(Math.random() * 10));

  const id = `youth_${club.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const isGk = pos === 'POR';

  return {
    id,
    firstName,
    lastName,
    nationality: 'España',
    birthDate: `${year - age}-05-10`,
    age,
    primaryPosition: pos,
    overallRating: baseRating,
    potential,
    clubId: club.id,
    isTransferListed: false,
    isLoanListed: false,
    marketValue: baseRating * baseRating * 120,
    attributes: {
      disparo: isGk ? 15 : Math.round(baseRating * (pos === 'DC' ? 1.05 : 0.8)),
      pase: isGk ? 40 : Math.round(baseRating * (pos === 'MC' || pos === 'MCO' ? 1.05 : 0.85)),
      regate: isGk ? 15 : Math.round(baseRating * (pos === 'ED' || pos === 'EI' ? 1.05 : 0.8)),
      defensa: isGk ? 20 : Math.round(baseRating * (['DFC', 'LD', 'LI', 'MCD'].includes(pos) ? 1.05 : 0.6)),
      velocidad: Math.round(baseRating * 1.05),
      resistencia: Math.round(baseRating * 0.95),
      fuerza: Math.round(baseRating * 0.9),
      vision: Math.round(baseRating * 0.85),
      liderazgo: 45,
      reflejos: isGk ? baseRating : undefined,
      paradas: isGk ? baseRating : undefined,
    },
    contract: {
      wagePerWeek: 150,
      contractEndYear: year + 3,
      releaseClause: Math.round(baseRating * baseRating * 500),
      squadStatus: 'Juvenil',
    },
    fitness: 100,
    morale: 95,
    matchReadiness: 70,
    isInjured: false,
    seasonStats: {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
      averageRating: 0,
      cleanSheets: isGk ? 0 : undefined,
    },
  };
}

export function progressPlayersForNewSeason(
  players: Record<string, Player>,
  clubs: Record<string, Club>
): Record<string, Player> {
  const updated = { ...players };

  Object.keys(updated).forEach((id) => {
    const p = updated[id];
    const newAge = p.age + 1;
    let newOvr = p.overallRating;

    const club = p.clubId ? clubs[p.clubId] : null;
    const trainingBonus = club ? club.facilities.trainingGroundLevel * 0.4 : 0;

    // Young players grow towards potential
    if (newAge <= 23 && newOvr < p.potential) {
      const growth = Math.round((Math.random() * 2 + 1 + trainingBonus));
      newOvr = Math.min(p.potential, newOvr + growth);
    } else if (newAge >= 33) {
      // Veterans decline physically
      const decline = Math.round(Math.random() * 2 + 1);
      newOvr = Math.max(40, newOvr - decline);
    }

    updated[id] = {
      ...p,
      age: newAge,
      overallRating: newOvr,
      fitness: 100,
      morale: 85,
      isInjured: false,
      injuryWeeksLeft: undefined,
      injuryName: undefined,
      seasonStats: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        averageRating: 0,
        cleanSheets: p.primaryPosition === 'POR' ? 0 : undefined,
      },
    };
  });

  return updated;
}

export function evaluateManagerPerformance(
  manager: Manager,
  club: Club,
  leaguePosition: number,
  totalTeams: number
): { updatedManager: Manager; updatedClub: Club } {
  let repDelta = 0;
  let confidenceDelta = 0;

  if (leaguePosition === 1) {
    repDelta = +6;
    confidenceDelta = +20;
  } else if (leaguePosition <= 5) {
    repDelta = +3;
    confidenceDelta = +12;
  } else if (leaguePosition <= totalTeams - 3) {
    repDelta = +1;
    confidenceDelta = +5;
  } else {
    repDelta = -4;
    confidenceDelta = -25;
  }

  const updatedManager: Manager = {
    ...manager,
    reputation: Math.max(1, Math.min(100, manager.reputation + repDelta)),
  };

  const updatedClub: Club = {
    ...club,
    boardConfidence: Math.max(10, Math.min(100, club.boardConfidence + confidenceDelta)),
  };

  return { updatedManager, updatedClub };
}
