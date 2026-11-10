import { Club } from '../types/club';
import { Player, Position } from '../types/player';
import { FIRST_NAMES_EXPANDED, LAST_NAMES_EXPANDED, COUNTRY_NAMES_ES } from './perpetualWorldEngine';
import { calculateRealisticPlayerMarketValue } from './transferPricingEngine';
import { ALIEN_FIRST_NAMES, ALIEN_LAST_NAMES, ALIEN_CIVILIZATIONS } from './worldEvolutionMilestonesEngine';

export interface SquadCompletenessResult {
  updatedClub: Club;
  newPlayers: Player[];
  addedCount: number;
}

/**
 * Ensures that every club, regardless of division or how many seasons have passed,
 * always maintains a complete, balanced squad with realistic depth:
 * - Minimum 2 Goalkeepers (POR)
 * - Minimum 6 Defenders (DFC, LD, LI)
 * - Minimum 6 Midfielders (MC, MCD, MCO)
 * - Minimum 4 Attackers (DC, ED, EI)
 * - Total squad >= 22 players
 * - Valid startingElevenIds (11 players) and benchPlayerIds (7-9 players)
 */
export function ensureClubSquadCompleteness(
  club: Club,
  players: Record<string, Player>,
  seasonYear: number
): SquadCompletenessResult {
  const currentClubPlayerIds = (club.playerIds || []).filter((pid) => Boolean(players[pid]));

  // Categorize existing squad
  const currentPlayers = currentClubPlayerIds.map((pid) => players[pid]);
  const por = currentPlayers.filter((p) => p.primaryPosition === 'POR');
  const def = currentPlayers.filter((p) => ['DFC', 'LD', 'LI'].includes(p.primaryPosition));
  const med = currentPlayers.filter((p) => ['MC', 'MCD', 'MCO'].includes(p.primaryPosition));
  const del = currentPlayers.filter((p) => ['DC', 'ED', 'EI'].includes(p.primaryPosition));

  const neededPos: Position[] = [];

  // Minimum positional requirements
  if (por.length < 2) {
    for (let i = por.length; i < 2; i++) neededPos.push('POR');
  }
  if (def.length < 6) {
    const defTypes: Position[] = ['DFC', 'DFC', 'LD', 'LI', 'DFC', 'LD'];
    for (let i = def.length; i < 6; i++) {
      neededPos.push(defTypes[i % defTypes.length]);
    }
  }
  if (med.length < 6) {
    const medTypes: Position[] = ['MC', 'MCD', 'MC', 'MCO', 'MC', 'MCD'];
    for (let i = med.length; i < 6; i++) {
      neededPos.push(medTypes[i % medTypes.length]);
    }
  }
  if (del.length < 4) {
    const delTypes: Position[] = ['DC', 'ED', 'EI', 'DC'];
    for (let i = del.length; i < 4; i++) {
      neededPos.push(delTypes[i % delTypes.length]);
    }
  }

  // Ensure overall squad reaches at least 22 players
  const totalAfterPos = currentClubPlayerIds.length + neededPos.length;
  if (totalAfterPos < 22) {
    const fillerTypes: Position[] = ['MC', 'DFC', 'DC', 'LD', 'LI', 'EI', 'ED'];
    for (let i = totalAfterPos; i < 22; i++) {
      neededPos.push(fillerTypes[i % fillerTypes.length]);
    }
  }

  // Fast-path: if squad already has all quotas and valid lineup, return immediately
  if (
    neededPos.length === 0 &&
    club.startingElevenIds &&
    club.startingElevenIds.length === 11 &&
    club.startingElevenIds.every((pid) => Boolean(players[pid])) &&
    club.benchPlayerIds &&
    club.benchPlayerIds.length >= 7 &&
    club.benchPlayerIds.every((pid) => Boolean(players[pid]))
  ) {
    return {
      updatedClub: club,
      newPlayers: [],
      addedCount: 0,
    };
  }

  const allCountries = Object.keys(FIRST_NAMES_EXPANDED);

  // Base overall rating calibrated to division and club reputation
  let baseRating = Math.max(54, Math.min(88, Math.round(club.reputation * 0.95)));
  if (club.divisionId === 'esp_tier1') baseRating = Math.max(76, Math.min(88, baseRating));
  else if (club.divisionId === 'esp_tier2') baseRating = Math.max(68, Math.min(78, baseRating));
  else if (club.divisionId.startsWith('esp_tier3')) baseRating = Math.max(62, Math.min(71, baseRating));
  else if (club.divisionId.startsWith('esp_tier4')) baseRating = Math.max(58, Math.min(66, baseRating));
  else if (club.divisionId.startsWith('esp_tier5')) baseRating = Math.max(54, Math.min(62, baseRating));

  const newPlayers: Player[] = [];
  const newPlayerIds: string[] = [];

  const isGalacticClub =
    Boolean(club.divisionId?.startsWith('gal_')) ||
    Boolean(club.id.startsWith('alien_')) ||
    ALIEN_CIVILIZATIONS.some((c) => c.planet === club.countryId);

  neededPos.forEach((pos, idx) => {
    let fn: string;
    let ln: string;
    let nationality: string;

    if (isGalacticClub) {
      // 96% alien extraterrestrial names, rare 4% Earth scout
      const isEarthScout = Math.random() < 0.04;
      if (isEarthScout) {
        const playerCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
        const firstNames = FIRST_NAMES_EXPANDED[playerCountry] || FIRST_NAMES_EXPANDED['ENG'];
        const lastNames = LAST_NAMES_EXPANDED[playerCountry] || LAST_NAMES_EXPANDED['ENG'];
        fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        nationality = COUNTRY_NAMES_ES[playerCountry] || playerCountry;
      } else {
        const civ = ALIEN_CIVILIZATIONS[Math.floor(Math.random() * ALIEN_CIVILIZATIONS.length)];
        fn = ALIEN_FIRST_NAMES[Math.floor(Math.random() * ALIEN_FIRST_NAMES.length)];
        ln = ALIEN_LAST_NAMES[Math.floor(Math.random() * ALIEN_LAST_NAMES.length)];
        nationality = `${civ.flag} ${civ.planet}`;
      }
    } else {
      // Earth Club: after 2226, 8% chance to scout an alien player
      const isAlienScout = seasonYear >= 2226 && Math.random() < 0.08;
      if (isAlienScout) {
        const civ = ALIEN_CIVILIZATIONS[Math.floor(Math.random() * ALIEN_CIVILIZATIONS.length)];
        fn = ALIEN_FIRST_NAMES[Math.floor(Math.random() * ALIEN_FIRST_NAMES.length)];
        ln = ALIEN_LAST_NAMES[Math.floor(Math.random() * ALIEN_LAST_NAMES.length)];
        nationality = `${civ.flag} ${civ.planet}`;
      } else {
        const isForeign = Math.random() < 0.35;
        const playerCountry = isForeign
          ? allCountries[Math.floor(Math.random() * allCountries.length)]
          : (club.countryId || 'ESP');
        const firstNames = FIRST_NAMES_EXPANDED[playerCountry] || FIRST_NAMES_EXPANDED['ESP'];
        const lastNames = LAST_NAMES_EXPANDED[playerCountry] || LAST_NAMES_EXPANDED['ESP'];
        fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        nationality = COUNTRY_NAMES_ES[playerCountry] || playerCountry;
      }
    }

    const age = 19 + Math.floor(Math.random() * 8); // 19 to 26 years old
    const ovrDelta = Math.floor(Math.random() * 5) - 2;
    const ovr = Math.max(50, Math.min(84, baseRating + ovrDelta));
    const pot = Math.min(88, ovr + (age <= 23 ? Math.floor(Math.random() * 6) + 2 : Math.floor(Math.random() * 2)));

    const pid = `squad_gen_${club.id}_${Date.now().toString(36)}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
    const isGK = pos === 'POR';

    const playerObj: Player = {
      id: pid,
      firstName: fn,
      lastName: ln,
      nationality,
      birthDate: `${seasonYear - age}-04-12`,
      age,
      primaryPosition: pos,
      secondaryPosition: pos === 'MC' ? 'MCD' : pos === 'EI' ? 'ED' : undefined,
      overallRating: ovr,
      potential: pot,
      marketValue: 100000,
      isTransferListed: false,
      isLoanListed: false,
      squadNumber: Math.min(99, 15 + currentClubPlayerIds.length + idx),
      squadCategory: idx < 2 ? 'PRIMER_EQUIPO' : 'FILIAL_B',
      fitness: 100,
      matchReadiness: 90,
      morale: 90,
      isInjured: false,
      injuryWeeksLeft: 0,
      clubId: club.id,
      attributes: {
        velocidad: Math.min(99, Math.round(ovr * 0.98)),
        disparo: isGK ? 15 : Math.min(99, Math.round(ovr * (pos === 'DC' ? 1.05 : 0.85))),
        pase: isGK ? 45 : Math.min(99, Math.round(ovr * (['MC', 'MCO'].includes(pos) ? 1.05 : 0.9))),
        regate: isGK ? 20 : Math.min(99, Math.round(ovr * (['EI', 'ED', 'MCO'].includes(pos) ? 1.08 : 0.85))),
        defensa: isGK ? 25 : Math.min(99, Math.round(ovr * (['DFC', 'MCD', 'LD', 'LI'].includes(pos) ? 1.08 : 0.65))),
        fuerza: Math.min(99, Math.round(ovr * (['DFC', 'DC'].includes(pos) ? 1.05 : 0.9))),
        resistencia: Math.min(99, Math.round(ovr * 0.98)),
        vision: Math.min(99, Math.round(ovr * (['MC', 'MCO'].includes(pos) ? 1.05 : 0.88))),
        liderazgo: Math.min(99, 45 + Math.floor(Math.random() * 30)),
        reflejos: isGK ? ovr : undefined,
        paradas: isGK ? ovr : undefined,
      },
      contract: {
        wagePerWeek: Math.max(300, Math.round(ovr * 45 * (ovr >= 78 ? 3 : 1))),
        contractEndYear: seasonYear + 3,
        releaseClause: Math.round(ovr * ovr * 1500),
        squadStatus: idx < 2 ? 'Rotación' : 'Juvenil',
      },
      seasonStats: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        averageRating: 0,
        cleanSheets: isGK ? 0 : undefined,
      },
    };

    playerObj.marketValue = calculateRealisticPlayerMarketValue(playerObj, club);

    newPlayers.push(playerObj);
    newPlayerIds.push(pid);
  });

  const fullSquadIds = [...currentClubPlayerIds, ...newPlayerIds];
  const newMap: Record<string, Player> = {};
  newPlayers.forEach((p) => { newMap[p.id] = p; });
  const getP = (pid: string) => players[pid] || newMap[pid];

  // Guarantee starting 11 and bench are fully populated and valid
  const sortedByOvr = [...fullSquadIds].sort(
    (a, b) => (getP(b)?.overallRating || 0) - (getP(a)?.overallRating || 0)
  );

  // Best GK
  const gks = sortedByOvr.filter((pid) => getP(pid)?.primaryPosition === 'POR');
  const outfield = sortedByOvr.filter((pid) => getP(pid)?.primaryPosition !== 'POR');

  const starters: string[] = [];
  if (gks[0]) starters.push(gks[0]);
  starters.push(...outfield.slice(0, 10));

  const remaining = sortedByOvr.filter((pid) => !starters.includes(pid));
  const bench = remaining.slice(0, 9);

  // Ensure first team has at least 18 players
  starters.forEach((pid) => {
    const p = getP(pid);
    if (p) p.squadCategory = 'PRIMER_EQUIPO';
  });
  bench.forEach((pid) => {
    const p = getP(pid);
    if (p) p.squadCategory = 'PRIMER_EQUIPO';
  });

  const updatedClub: Club = {
    ...club,
    playerIds: fullSquadIds,
    startingElevenIds: starters,
    benchPlayerIds: bench,
  };

  return {
    updatedClub,
    newPlayers,
    addedCount: newPlayers.length,
  };
}
