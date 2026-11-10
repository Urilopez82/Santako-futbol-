import { Club } from '../types/club';
import { Competition, Match, StandingsRow } from '../types/competition';
import { GameSave, NewsItem, SeasonHistory } from '../types/game';
import { Player, PlayerContract } from '../types/player';
import { rewardManagerTitleBonus, rewardManagerPromotionBonus } from './privateLifeEngine';
import { 
  CompetitionSeasonArchive, 
  GlobalHistoricalRecord, 
  HistoricTransferRecord, 
  HistoricalTeamStanding, 
  HistoricalTopScorer, 
  HistoricalZamora 
} from '../types/history';
import { 
  HISTORIC_CLUB_FATES, 
  MANAGER_LEGENDS, 
  REAL_HISTORIC_TRANSFERS, 
  REAL_HISTORICAL_ARCHIVES_EXPANDED 
} from '../db/worldData/realHistoricalSeasons';
import { 
  OFFICIAL_COMPETITION_REGULATIONS, 
  resolveCompetitionStandings 
} from './regulationEngine';
import { HISTORICAL_TROPHY_ARCHIVE, awardTrophyToWinner } from './palmaresEngine';
import { TrophyRecord } from '../types/regulations';
import { 
  initializeAllTournaments, 
  simulateCupMatch, 
  progressCupTournament, 
  getCupMatchWinner, 
  getCupMatchLoser,
  KnockoutTournamentState,
  resolveContinentalQualification 
} from './internationalCompetitionsEngine';
import { 
  createWorldCupTournament, 
  simulateEntireWorldCupTournament, 
  WorldCupTournamentState 
} from './worldCupTournamentEngine';
import { NATIONAL_TEAMS_MAP } from '../db/worldData/nationalTeams80';
import { ensureClubSquadCompleteness } from './squadCompletenessEngine';
import { checkAndTriggerWorldEvolutionMilestones } from './worldEvolutionMilestonesEngine';

// Comprehensive World Records Book
export const INITIAL_REAL_WORLD_RECORDS: GlobalHistoricalRecord[] = [
  {
    id: 'rec_points_100',
    title: 'Récord Histórico de Puntos en una Sola Temporada',
    category: 'PUNTOS',
    holder: 'Real Madrid CF (2011/12) y FC Barcelona (2012/13)',
    details: '100 puntos cosechados en 38 jornadas de Primera División de España.',
    seasonOrDate: '2011/12',
    isRealHistorical: true,
    valueNumeric: 100,
    unitLabel: 'puntos',
  },
  {
    id: 'rec_goals_messi_season',
    title: 'Récord de Goles en una Sola Temporada de Liga',
    category: 'GOLES',
    holder: 'Lionel Messi (FC Barcelona)',
    details: '50 goles anotados en 37 partidos disputados en LaLiga.',
    seasonOrDate: '2011/12',
    isRealHistorical: true,
    valueNumeric: 50,
    unitLabel: 'goles',
  },
  {
    id: 'rec_goals_messi_year',
    title: 'Récord Mundial de Goles en un Año Natural',
    category: 'GOLES',
    holder: 'Lionel Messi (FC Barcelona & Argentina)',
    details: '91 goles oficiales marcados en el año 2012, superando los 85 de Gerd Müller (1972).',
    seasonOrDate: '2012',
    isRealHistorical: true,
    valueNumeric: 91,
    unitLabel: 'goles',
  },
  {
    id: 'rec_streak_16',
    title: 'Récord de Victorias Consecutivas en Liga',
    category: 'RACHA',
    holder: 'FC Barcelona (2010/11) y Real Madrid CF (2015/16)',
    details: '16 victorias seguidas en la máxima categoría del fútbol español.',
    seasonOrDate: '2010/11',
    isRealHistorical: true,
    valueNumeric: 16,
    unitLabel: 'victorias',
  },
  {
    id: 'rec_streak_invictus_arsenal',
    title: 'Mayor Racha Invicto en una Gran Liga Europea',
    category: 'RACHA',
    holder: 'Arsenal FC (The Invincibles)',
    details: '49 partidos oficiales consecutivos sin conocer la derrota en la Premier League (2003-2004).',
    seasonOrDate: '2003 - 2004',
    isRealHistorical: true,
    valueNumeric: 49,
    unitLabel: 'partidos invicto',
  },
  {
    id: 'rec_transfer_neymar',
    title: 'Fichaje Más Caro de la Historia del Fútbol Mundial',
    category: 'TRASPASO',
    holder: 'Neymar Jr (del FC Barcelona al Paris Saint-Germain)',
    details: 'Pago íntegro de la cláusula de rescisión histórica por 222.000.000 €.',
    seasonOrDate: '2017/18',
    isRealHistorical: true,
    valueNumeric: 222000000,
    unitLabel: '€',
  },
  {
    id: 'rec_transfer_highest_sale',
    title: 'Mayor Venta Realizada por un Club en la Historia',
    category: 'TRASPASO',
    holder: 'FC Barcelona (Venta de Neymar Jr al PSG)',
    details: 'Ingreso récord absoluto de 222.000.000 € en una sola operación de traspaso.',
    seasonOrDate: '2017/18',
    isRealHistorical: true,
    valueNumeric: 222000000,
    unitLabel: '€',
  },
  {
    id: 'rec_transfer_highest_buy',
    title: 'Mayor Compra Realizada por un Club en la Historia',
    category: 'TRASPASO',
    holder: 'Paris Saint-Germain (Fichaje de Neymar Jr)',
    details: 'Desembolso récord de 222.000.000 € para incorporar a una estrella mundial.',
    seasonOrDate: '2017/18',
    isRealHistorical: true,
    valueNumeric: 222000000,
    unitLabel: '€',
  },
  {
    id: 'rec_transfer_domestic',
    title: 'Mayor Traspaso entre Clubes de una Misma Liga',
    category: 'TRASPASO',
    holder: 'Kylian Mbappé (del AS Monaco al Paris Saint-Germain)',
    details: 'Traspaso doméstico histórico dentro de la Ligue 1 por 180.000.000 €.',
    seasonOrDate: '2018/19',
    isRealHistorical: true,
    valueNumeric: 180000000,
    unitLabel: '€',
  },
  {
    id: 'rec_transfer_international',
    title: 'Mayor Traspaso Internacional entre Diferentes Países',
    category: 'TRASPASO',
    holder: 'Neymar Jr (de España a Francia)',
    details: 'Operación transfronteriza récord mundial por 222.000.000 €.',
    seasonOrDate: '2017/18',
    isRealHistorical: true,
    valueNumeric: 222000000,
    unitLabel: '€',
  },
  {
    id: 'rec_transfer_biggest_spender',
    title: 'Club con Mayor Gasto en Fichajes en una Sola Temporada',
    category: 'TRASPASO',
    holder: 'Chelsea FC',
    details: 'Inversión récord en adquisiciones por 611.000.000 € en un solo curso.',
    seasonOrDate: '2022/23',
    isRealHistorical: true,
    valueNumeric: 611000000,
    unitLabel: '€',
  },
  {
    id: 'rec_transfer_biggest_earner',
    title: 'Club con Mayores Ingresos por Ventas en una Sola Temporada',
    category: 'TRASPASO',
    holder: 'SL Benfica',
    details: 'Recaudación histórica de 241.000.000 € por traspasos de futbolistas.',
    seasonOrDate: '2019/20',
    isRealHistorical: true,
    valueNumeric: 241000000,
    unitLabel: '€',
  },
  {
    id: 'rec_clean_sheet_abel',
    title: 'Récord Histórico de Imbatibilidad de un Guardameta',
    category: 'IMBATIBILIDAD',
    holder: 'Abel Resino (Club Atlético de Madrid)',
    details: '1.275 minutos consecutivos (14 jornadas completas) sin encajar un solo gol en Primera División.',
    seasonOrDate: '1990/91',
    isRealHistorical: true,
    valueNumeric: 1275,
    unitLabel: 'minutos',
  },
  {
    id: 'rec_manager_ferguson_titles',
    title: 'Entrenador con Más Títulos Oficiales de la Historia',
    category: 'TITULOS',
    holder: 'Sir Alex Ferguson (Aberdeen & Manchester United)',
    details: '49 títulos oficiales conquistados a lo largo de 39 años de carrera en los banquillos.',
    seasonOrDate: '1974 - 2013',
    isRealHistorical: true,
    valueNumeric: 49,
    unitLabel: 'títulos',
  },
  {
    id: 'rec_assists_record',
    title: 'Récord de Asistencias en una Sola Temporada de Liga',
    category: 'ASISTENCIA',
    holder: 'Lionel Messi (2019/20) y Thomas Müller (2019/20)',
    details: '21 pases de gol repartidos en una sola temporada de liga europea.',
    seasonOrDate: '2019/20',
    isRealHistorical: true,
    valueNumeric: 21,
    unitLabel: 'asistencias',
  },
];

/**
 * Initializes and guarantees game save has all official and accumulated historical archives.
 */
export function ensureWorldHistory(save: GameSave): GameSave {
  if (!save) return save;
  const currentArchives = save.historicalArchives && save.historicalArchives.length > 0
    ? save.historicalArchives
    : REAL_HISTORICAL_ARCHIVES_EXPANDED;

  const currentRecords = save.worldRecords && save.worldRecords.length > 0
    ? save.worldRecords
    : INITIAL_REAL_WORLD_RECORDS;

  const cupTournaments = save.cupTournaments && Object.keys(save.cupTournaments).length > 0
    ? save.cupTournaments
    : initializeAllTournaments(save.clubs || {}, save.currentSeason || '2024/25');

  // Deduplicate and sanitize existing news items to heal saves that accumulated duplicate trophy news
  const seenNews = new Set<string>();
  const sanitizedNews = (save.news || []).filter((item, idx) => {
    const key = item.id || `${item.date}_${item.title}_${idx}`;
    if (seenNews.has(key)) return false;
    seenNews.add(key);
    return true;
  });

  return {
    ...save,
    historicalArchives: currentArchives,
    worldRecords: currentRecords,
    cupTournaments,
    difficultyLevel: save.difficultyLevel || 'NORMAL',
    news: sanitizedNews,
  };
}

/**
 * Archives a completed season in the dynamic world history encyclopedia.
 */
export function archiveSeasonResults(
  save: GameSave,
  competition: Competition,
  seasonId: string
): GameSave {
  const table = [...competition.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffB = b.goalsFor - b.goalsAgainst;
    const diffA = a.goalsFor - a.goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.goalsFor - a.goalsFor;
  });

  if (table.length === 0) return save;

  const champRow = table[0];
  const runnerUpRow = table[1] || champRow;
  const thirdRow = table[2];

  const champClub = save.clubs[champRow.teamId];
  const runnerClub = save.clubs[runnerUpRow.teamId];

  // Relegated teams based on competition rules
  const relegationSlots = competition.relegationSlots || 3;
  const relegatedRows = relegationSlots > 0 ? table.slice(table.length - relegationSlots) : [];
  const relegatedTeams = relegatedRows.map((r) => save.clubs[r.teamId]?.name || r.teamId);

  // Promoted & playoff teams
  const promotionSlots = competition.promotionSlots || 0;
  const playoffSlots = competition.playoffSlots || 0;
  const promotedTeams = promotionSlots > 0 
    ? table.slice(0, promotionSlots).map((r) => save.clubs[r.teamId]?.name || r.teamId)
    : [champClub?.name || 'Campeón'];

  const playoffTeams = playoffSlots > 0
    ? table.slice(promotionSlots, promotionSlots + playoffSlots).map((r) => save.clubs[r.teamId]?.name || r.teamId)
    : [];

  // Scorer & Assister calculations
  const scorerMap: Record<string, HistoricalTopScorer> = {};
  const assisterMap: Record<string, { name: string; club: string; assists: number }> = {};
  const concededMap: Record<string, { name: string; club: string; conceded: number; matches: number }> = {};

  competition.matches.forEach((m) => {
    if (m.played) {
      if (m.events) {
        m.events.forEach((ev) => {
          if ((ev.type === 'GOL' || ev.type === 'GOL_PENALTI') && ev.playerId) {
            const p = save.players[ev.playerId];
            const clubName = save.clubs[ev.teamId]?.name || 'Club';
            if (!scorerMap[ev.playerId]) {
              scorerMap[ev.playerId] = {
                playerName: p ? `${p.firstName} ${p.lastName}` : 'Goleador',
                clubName: clubName,
                goals: 0,
                matchesPlayed: 0,
              };
            }
            scorerMap[ev.playerId].goals += 1;
          }
        });
      }

      // Track goalkeepers conceded
      const homeClub = save.clubs[m.homeTeamId];
      const awayClub = save.clubs[m.awayTeamId];
      const homeScore = m.homeScore ?? 0;
      const awayScore = m.awayScore ?? 0;

      if (homeClub) {
        const homeGKId = homeClub.startingElevenIds[0];
        const homeGK = save.players[homeGKId];
        if (homeGK) {
          if (!concededMap[homeGKId]) {
            concededMap[homeGKId] = {
              name: `${homeGK.firstName} ${homeGK.lastName}`,
              club: homeClub.name,
              conceded: 0,
              matches: 0,
            };
          }
          concededMap[homeGKId].conceded += awayScore;
          concededMap[homeGKId].matches += 1;
        }
      }

      if (awayClub) {
        const awayGKId = awayClub.startingElevenIds[0];
        const awayGK = save.players[awayGKId];
        if (awayGK) {
          if (!concededMap[awayGKId]) {
            concededMap[awayGKId] = {
              name: `${awayGK.firstName} ${awayGK.lastName}`,
              club: awayClub.name,
              conceded: 0,
              matches: 0,
            };
          }
          concededMap[awayGKId].conceded += homeScore;
          concededMap[awayGKId].matches += 1;
        }
      }
    }
  });

  const sortedScorers = Object.values(scorerMap).sort((a, b) => b.goals - a.goals);
  const bestScorer: HistoricalTopScorer = sortedScorers[0] || {
    playerName: 'Máximo Goleador',
    clubName: champClub?.name || 'Club Campeón',
    goals: Math.max(16, Math.round(table[0].played * 0.6)),
    matchesPlayed: table[0].played || 38,
  };

  const sortedKeepers = Object.values(concededMap)
    .filter((k) => k.matches >= Math.floor(table[0].played * 0.6))
    .sort((a, b) => (a.conceded / a.matches) - (b.conceded / b.matches));

  const bestKeeper: HistoricalZamora | undefined = sortedKeepers[0]
    ? {
        goalkeeperName: sortedKeepers[0].name,
        clubName: sortedKeepers[0].club,
        goalsConceded: sortedKeepers[0].conceded,
        matchesPlayed: sortedKeepers[0].matches,
        coefficient: parseFloat((sortedKeepers[0].conceded / sortedKeepers[0].matches).toFixed(2)),
      }
    : undefined;

  const formattedStandings: HistoricalTeamStanding[] = table.map((r, idx) => ({
    position: idx + 1,
    teamName: save.clubs[r.teamId]?.name || r.teamId,
    played: r.played,
    won: r.won,
    drawn: r.drawn,
    lost: r.lost,
    goalsFor: r.goalsFor,
    goalsAgainst: r.goalsAgainst,
    points: r.points,
  }));

  const isUserChampion = champRow.teamId === save.userClubId;
  const championManager = isUserChampion
    ? `${save.manager.firstName} ${save.manager.lastName}`
    : 'Entrenador Campeón';

  // Find revelation and disappointment clubs
  let revelationClub: { clubName: string; reason: string } | undefined;
  let disappointmentClub: { clubName: string; reason: string } | undefined;

  // Revelation: lowest reputation in top 4
  const top4Clubs = table.slice(0, Math.min(4, table.length)).map((r) => save.clubs[r.teamId]).filter(Boolean);
  const surpriseClub = [...top4Clubs].sort((a, b) => (a.reputation || 70) - (b.reputation || 70))[0];
  if (surpriseClub && surpriseClub.reputation < 75) {
    revelationClub = {
      clubName: surpriseClub.name,
      reason: `Asombroso ${table.findIndex((r) => r.teamId === surpriseClub.id) + 1}º puesto superando con creces su modesto presupuesto inicial.`,
    };
  }

  // Disappointment: highest reputation in bottom 4 or relegated
  const bottomClubs = table.slice(Math.max(0, table.length - 4)).map((r) => save.clubs[r.teamId]).filter(Boolean);
  const fallenGiant = [...bottomClubs].sort((a, b) => (b.reputation || 70) - (a.reputation || 70))[0];
  if (fallenGiant && fallenGiant.reputation >= 76) {
    disappointmentClub = {
      clubName: fallenGiant.name,
      reason: `Doloroso tropiezo para un club de gran caché (${fallenGiant.reputation} Rep.), cayendo al fondo de la clasificación.`,
    };
  }

  // Find biggest transfer of the season
  const seasonTransfers: HistoricTransferRecord[] = (save.transferOffers || [])
    .filter((to) => to.status === 'COMPLETADA' && to.transferFee >= 25000000)
    .map((to) => {
      const pl = save.players[to.playerId];
      return {
        id: `tr_${to.id}`,
        playerName: pl ? `${pl.firstName} ${pl.lastName}` : 'Jugador Estrella',
        fromClub: save.clubs[to.sellingClubId]?.name || 'Club Vendedor',
        toClub: save.clubs[to.buyingClubId]?.name || 'Club Comprador',
        fee: to.transferFee,
        season: seasonId,
        isRealHistorical: false,
      };
    });

  const newArchive: CompetitionSeasonArchive = {
    seasonId,
    competitionId: competition.id,
    competitionName: competition.name,
    countryId: save.clubs[champRow.teamId]?.countryId,
    isRealPreGameHistory: false, // In-game simulated history!
    championTeam: champClub?.name || 'Campeón de Liga',
    runnerUpTeam: runnerClub?.name || 'Subcampeón',
    thirdTeam: thirdRow ? save.clubs[thirdRow.teamId]?.name : undefined,
    relegatedTeams,
    promotedTeams,
    playoffTeams,
    topScorer: bestScorer,
    bestGoalkeeper: bestKeeper,
    championManager,
    standingsTable: formattedStandings,
    revelationClub,
    disappointmentClub,
    historicTransfers: seasonTransfers.length > 0 ? seasonTransfers : undefined,
    notableEvent: isUserChampion
      ? `¡Proeza legendaria! ${save.manager.firstName} ${save.manager.lastName} guía al ${champClub?.name} a coronarse campeón de ${competition.shortName}.`
      : `El ${champClub?.name} culmina una campaña espectacular alzando el trofeo de ${competition.shortName} tras ${table[0].played} jornadas.`,
  };

  const currentArchives = save.historicalArchives && save.historicalArchives.length > 0
    ? save.historicalArchives
    : REAL_HISTORICAL_ARCHIVES_EXPANDED;

  // Check World Records
  let currentRecords = [...(save.worldRecords && save.worldRecords.length > 0 ? save.worldRecords : INITIAL_REAL_WORLD_RECORDS)];
  
  // 1. Points Record
  const pointsRecord = currentRecords.find((r) => r.id === 'rec_points_100');
  if (pointsRecord && champRow.points > pointsRecord.valueNumeric) {
    currentRecords = currentRecords.map((r) =>
      r.id === 'rec_points_100'
        ? {
            ...r,
            holder: `${champClub?.name} (${seasonId})`,
            details: `Nuevo récord histórico batido en partida: ¡${champRow.points} puntos conquistados!`,
            seasonOrDate: seasonId,
            isRealHistorical: false,
            valueNumeric: champRow.points,
          }
        : r
    );
  }

  // 2. Goals in a single season Record
  const goalsRecord = currentRecords.find((r) => r.id === 'rec_goals_messi_season');
  if (goalsRecord && bestScorer.goals > goalsRecord.valueNumeric) {
    currentRecords = currentRecords.map((r) =>
      r.id === 'rec_goals_messi_season'
        ? {
            ...r,
            holder: `${bestScorer.playerName} (${bestScorer.clubName})`,
            details: `¡Récord mundial pulverizado en partida con ${bestScorer.goals} goles en una sola temporada!`,
            seasonOrDate: seasonId,
            isRealHistorical: false,
            valueNumeric: bestScorer.goals,
          }
        : r
    );
  }

  // 3. Transfer record
  const transferRecord = currentRecords.find((r) => r.id === 'rec_transfer_neymar');
  if (seasonTransfers.length > 0 && transferRecord) {
    const highestTransfer = [...seasonTransfers].sort((a, b) => b.fee - a.fee)[0];
    if (highestTransfer && highestTransfer.fee > transferRecord.valueNumeric) {
      currentRecords = currentRecords.map((r) =>
        r.id === 'rec_transfer_neymar'
          ? {
              ...r,
              holder: `${highestTransfer.playerName} (${highestTransfer.fromClub} al ${highestTransfer.toClub})`,
              details: `Fichaje récord de todos los tiempos por ${highestTransfer.fee.toLocaleString()} €.`,
              seasonOrDate: seasonId,
              isRealHistorical: false,
              valueNumeric: highestTransfer.fee,
            }
          : r
      );
    }
  }

  // Form intermediate save for trophy awarding
  let workingSave = {
    ...save,
    historicalArchives: [newArchive, ...currentArchives],
    worldRecords: currentRecords,
  };

  // Award official League trophy into trophyArchive and champion palmarés
  if (champClub) {
    const trophyRes = awardTrophyToWinner(workingSave, {
      competitionId: competition.id,
      competitionName: competition.name,
      trophyName: `Trofeo de ${competition.shortName || competition.name}`,
      competitionType: 'LIGA',
      season: seasonId,
      championId: champClub.id,
      runnerUpId: runnerClub?.id,
      scoreOrSummary: `${champRow.points} pts (${champRow.won}V ${champRow.drawn}E ${champRow.lost}D)`,
      topScorer: bestScorer ? {
        playerName: bestScorer.playerName,
        clubName: bestScorer.clubName,
        goals: bestScorer.goals,
      } : undefined,
    });
    workingSave = trophyRes.updatedSave;
  }

  return workingSave;
}

/**
 * Evaluates and records any broken transfer world records from authentic in-game transfer operations.
 */
export function updateWorldTransferRecords(
  save: GameSave,
  player: Player,
  buyerClub: Club,
  sellerClub: Club | null,
  fee: number,
  season: string
): { updatedRecords: GlobalHistoricalRecord[]; brokenRecordNews: NewsItem[] } {
  let records = [...(save.worldRecords && save.worldRecords.length > 0 ? save.worldRecords : INITIAL_REAL_WORLD_RECORDS)];
  const news: NewsItem[] = [];
  const playerName = `${player.firstName} ${player.lastName}`;
  const fromName = sellerClub?.name || 'Agente Libre';
  const toName = buyerClub.name;

  if (fee <= 0) return { updatedRecords: records, brokenRecordNews: news };

  // 1. All-time most expensive transfer
  const allTimeRec = records.find((r) => r.id === 'rec_transfer_neymar');
  if (allTimeRec && fee > allTimeRec.valueNumeric) {
    records = records.map((r) =>
      r.id === 'rec_transfer_neymar'
        ? {
            ...r,
            holder: `${playerName} (${fromName} al ${toName})`,
            details: `¡Nuevo fichaje récord mundial absoluto de la historia por ${fee.toLocaleString()} €!`,
            seasonOrDate: season,
            isRealHistorical: false,
            valueNumeric: fee,
          }
        : r
    );
    news.push({
      id: `record_transfer_${Date.now()}_1`,
      date: save.currentDate,
      title: `¡RÉCORD MUNDIAL: Fichaje Más Caro de la Historia!`,
      content: `El traspaso de ${playerName} del ${fromName} al ${toName} por ${fee.toLocaleString()} € establece el nuevo récord planetario de todos los tiempos en el fútbol mundial.`,
      category: 'FICHAJE',
      read: false,
    });
  }

  // 2. Highest sale by a club
  if (sellerClub) {
    const saleRec = records.find((r) => r.id === 'rec_transfer_highest_sale');
    if (saleRec && fee > saleRec.valueNumeric) {
      records = records.map((r) =>
        r.id === 'rec_transfer_highest_sale'
          ? {
              ...r,
              holder: `${sellerClub.name} (Venta de ${playerName})`,
              details: `Traspaso récord de venta por ${fee.toLocaleString()} € al ${toName}.`,
              seasonOrDate: season,
              isRealHistorical: false,
              valueNumeric: fee,
            }
          : r
      );
    }
  }

  // 3. Highest purchase by a club
  const buyRec = records.find((r) => r.id === 'rec_transfer_highest_buy');
  if (buyRec && fee > buyRec.valueNumeric) {
    records = records.map((r) =>
      r.id === 'rec_transfer_highest_buy'
        ? {
            ...r,
            holder: `${buyerClub.name} (Fichaje de ${playerName})`,
            details: `Desembolso récord de compra por ${fee.toLocaleString()} € al ${fromName}.`,
            seasonOrDate: season,
            isRealHistorical: false,
            valueNumeric: fee,
          }
        : r
    );
  }

  // 4. Domestic vs International record
  const isDomestic = sellerClub && sellerClub.countryId === buyerClub.countryId;
  if (isDomestic) {
    const domRec = records.find((r) => r.id === 'rec_transfer_domestic');
    if (domRec && fee > domRec.valueNumeric) {
      records = records.map((r) =>
        r.id === 'rec_transfer_domestic'
          ? {
              ...r,
              holder: `${playerName} (${fromName} al ${toName})`,
              details: `Traspaso récord nacional en una misma liga por ${fee.toLocaleString()} €.`,
              seasonOrDate: season,
              isRealHistorical: false,
              valueNumeric: fee,
            }
          : r
      );
    }
  } else if (sellerClub) {
    const intRec = records.find((r) => r.id === 'rec_transfer_international');
    if (intRec && fee > intRec.valueNumeric) {
      records = records.map((r) =>
        r.id === 'rec_transfer_international'
          ? {
              ...r,
              holder: `${playerName} (${fromName} al ${toName})`,
              details: `Traspaso internacional récord por ${fee.toLocaleString()} €.`,
              seasonOrDate: season,
              isRealHistorical: false,
              valueNumeric: fee,
            }
          : r
      );
    }
  }

  return { updatedRecords: records, brokenRecordNews: news };
}

/**
 * Calculates the next season label (e.g. "2026/27" -> "2027/28")
 */
export function getNextSeasonString(currentSeason: string): string {
  const parts = currentSeason.split('/');
  const startYear = parseInt(parts[0], 10);
  if (!isNaN(startYear)) {
    const nextStart = startYear + 1;
    const nextEnd = (nextStart + 1).toString().slice(2);
    return `${nextStart}/${nextEnd}`;
  }
  return '2027/28';
}

/**
 * Advances the entire football world to the next season, executing:
 * 1. Multi-tier promotions & relegations.
 * 2. Player ages and attribute evolution.
 * 3. Fresh round-robin calendar generation.
 * 4. Financial budget renewal (season tickets, sponsors).
 */
export function advanceWorldToNextSeason(save: GameSave): GameSave {
  const nextSeason = getNextSeasonString(save.currentSeason);
  const updatedClubs = { ...save.clubs };
  const updatedPlayers = { ...save.players };
  const updatedCompetitions = { ...save.competitions };
  const newTrophies: TrophyRecord[] = [];
  const newArchives: CompetitionSeasonArchive[] = [];
  const contractExpiredNews: NewsItem[] = [];
  let userSeasonHistoryEntry: any = null;
  let userMatchesManagedDelta = 0;
  let userWonDelta = 0;
  let userDrawnDelta = 0;
  let userLostDelta = 0;
  let userGoalsForDelta = 0;
  let userGoalsAgainstDelta = 0;
  let userTitlesDelta = 0;
  let userPromotionsDelta = 0;
  let userRelegationsDelta = 0;
  let userTrophyWonTitle = '';

  // 0. Ensure all unplayed matches in all competitions are simulated realistically one by one
  Object.keys(updatedCompetitions).forEach((compId) => {
    const comp = updatedCompetitions[compId];
    const regulation = OFFICIAL_COMPETITION_REGULATIONS[compId];
    const standingsMap: Record<string, StandingsRow> = {};
    (comp.standings || []).forEach((row) => {
      standingsMap[row.teamId] = { ...row, recentForm: [...row.recentForm] };
    });

    // Simulate unplayed matches probabilistically
    if (comp.matches) {
      comp.matches = comp.matches.map((m) => {
        if (!m.played) {
          const homeClub = updatedClubs[m.homeTeamId];
          const awayClub = updatedClubs[m.awayTeamId];
          const homeRep = homeClub?.reputation || 65;
          const awayRep = awayClub?.reputation || 65;
          const diff = (homeRep - awayRep) / 20;

          const homeGoals = Math.max(0, Math.round(1.5 + diff * 0.6 + (Math.random() * 2 - 1)));
          const awayGoals = Math.max(0, Math.round(1.1 - diff * 0.5 + (Math.random() * 2 - 1)));

          const hRow = standingsMap[m.homeTeamId];
          const aRow = standingsMap[m.awayTeamId];

          if (hRow && aRow) {
            hRow.played += 1;
            aRow.played += 1;
            hRow.goalsFor += homeGoals;
            hRow.goalsAgainst += awayGoals;
            aRow.goalsFor += awayGoals;
            aRow.goalsAgainst += homeGoals;
            hRow.goalDifference = hRow.goalsFor - hRow.goalsAgainst;
            aRow.goalDifference = aRow.goalsFor - aRow.goalsAgainst;

            if (homeGoals > awayGoals) {
              hRow.won += 1;
              hRow.points += 3;
              hRow.recentForm.unshift('V');
              aRow.lost += 1;
              aRow.recentForm.unshift('D');
            } else if (homeGoals === awayGoals) {
              hRow.drawn += 1;
              aRow.drawn += 1;
              hRow.points += 1;
              aRow.points += 1;
              hRow.recentForm.unshift('E');
              aRow.recentForm.unshift('E');
            } else {
              aRow.won += 1;
              aRow.points += 3;
              aRow.recentForm.unshift('V');
              hRow.lost += 1;
              hRow.recentForm.unshift('D');
            }
            if (hRow.recentForm.length > 5) hRow.recentForm.pop();
            if (aRow.recentForm.length > 5) aRow.recentForm.pop();
          }

          return {
            ...m,
            played: true,
            homeScore: homeGoals,
            awayScore: awayGoals,
          };
        }
        return m;
      });
    }

    let finalStandings = Object.values(standingsMap);
    if (regulation) {
      finalStandings = resolveCompetitionStandings(finalStandings, comp.matches || [], regulation);
    } else {
      finalStandings.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    }
    comp.standings = finalStandings;

    const championRow = comp.standings[0];
    const runnerUpRow = comp.standings[1];
    const thirdRow = comp.standings[2];

    if (championRow) {
      const champClub = updatedClubs[championRow.teamId];
      const runnerClub = runnerUpRow ? updatedClubs[runnerUpRow.teamId] : undefined;
      const isUserClub = champClub?.id === save.userClubId;
      const managerName = isUserClub 
        ? `${save.manager.firstName} ${save.manager.lastName}`
        : (champClub?.coachName || 'Entrenador Titulado');

      newTrophies.push({
        id: `trophy_${compId}_${save.currentSeason.replace('/', '-')}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        season: save.currentSeason,
        competitionId: compId,
        competitionName: regulation?.name || comp.name,
        competitionType: comp.tier === 1 ? 'LIGA' : 'COPA',
        tier: comp.tier === 1 ? 'NACIONAL_PRIMERA' : 'CATEGORIA_INFERIOR',
        championId: championRow.teamId,
        championName: champClub?.name || championRow.teamId,
        runnerUpId: runnerUpRow?.teamId,
        runnerUpName: runnerClub?.name,
        scoreOrSummary: `${championRow.points} pts (${championRow.won}V ${championRow.drawn}E ${championRow.lost}D, Dif. ${championRow.goalDifference > 0 ? '+' : ''}${championRow.goalDifference})`,
        winningManagerName: managerName,
        isPreGameHistory: false,
      });

      // Archive complete league season in historical archives
      const relCount = comp.relegationSlots || (comp.id.includes('tier1') ? 3 : 2);
      const promCount = comp.promotionSlots || (comp.id.includes('tier2') ? 3 : 0);
      const playCount = comp.playoffSlots || 0;

      const relTeams = relCount > 0 ? comp.standings.slice(Math.max(0, comp.standings.length - relCount)).map((r) => updatedClubs[r.teamId]?.name || r.teamId) : [];
      const promTeams = promCount > 0 ? comp.standings.slice(0, promCount).map((r) => updatedClubs[r.teamId]?.name || r.teamId) : [];
      const playTeams = playCount > 0 ? comp.standings.slice(promCount, promCount + playCount).map((r) => updatedClubs[r.teamId]?.name || r.teamId) : [];

      const formattedStandingsTable: HistoricalTeamStanding[] = comp.standings.map((r, idx) => ({
        position: idx + 1,
        teamName: updatedClubs[r.teamId]?.name || r.teamId,
        played: r.played,
        won: r.won,
        drawn: r.drawn,
        lost: r.lost,
        goalsFor: r.goalsFor,
        goalsAgainst: r.goalsAgainst,
        points: r.points,
      }));

      newArchives.push({
        seasonId: save.currentSeason,
        competitionId: compId,
        competitionName: regulation?.name || comp.name,
        countryId: updatedClubs[championRow?.teamId]?.countryId,
        isRealPreGameHistory: false,
        championTeam: champClub?.name || championRow.teamId,
        runnerUpTeam: runnerClub?.name || 'Subcampeón',
        thirdTeam: thirdRow ? (updatedClubs[thirdRow.teamId]?.name || thirdRow.teamId) : undefined,
        relegatedTeams: relTeams,
        promotedTeams: promTeams,
        playoffTeams: playTeams,
        topScorer: {
          playerName: 'Goleador de Liga',
          clubName: champClub?.name || 'Campeón',
          goals: Math.max(18, Math.round((championRow?.played || 38) * 0.65)),
          matchesPlayed: championRow?.played || 38,
        },
        bestGoalkeeper: {
          goalkeeperName: 'Portero Menos Goleado',
          clubName: champClub?.name || 'Campeón',
          goalsConceded: championRow ? Math.max(18, championRow.goalsAgainst) : 25,
          matchesPlayed: championRow?.played || 38,
          coefficient: championRow ? parseFloat((championRow.goalsAgainst / Math.max(1, championRow.played)).toFixed(2)) : 0.8,
        },
        championManager: managerName,
        standingsTable: formattedStandingsTable,
        notableEvent: `El ${champClub?.name || 'Campeón'} se coronó campeón oficial de ${comp.name} con ${championRow?.points} puntos.`,
      });

      // Track user's club performance in their league division
      const userRowIndex = comp.standings.findIndex((r) => r.teamId === save.userClubId);
      if (userRowIndex !== -1) {
        const userRow = comp.standings[userRowIndex];
        const userPos = userRowIndex + 1;
        const isChamp = userPos === 1;
        const isPromoted = userPos <= (comp.promotionSlots || 0);
        const isRelegated = (comp.relegationSlots || 0) > 0 && userPos > comp.standings.length - (comp.relegationSlots || 0);

        userMatchesManagedDelta += userRow.played;
        userWonDelta += userRow.won;
        userDrawnDelta += userRow.drawn;
        userLostDelta += userRow.lost;
        userGoalsForDelta += userRow.goalsFor;
        userGoalsAgainstDelta += userRow.goalsAgainst;

        if (isChamp) {
          userTitlesDelta += 1;
          userTrophyWonTitle = `Trofeo de ${comp.name}`;
        }
        if (isPromoted) {
          userPromotionsDelta += 1;
        }
        if (isRelegated) {
          userRelegationsDelta += 1;
        }

        userSeasonHistoryEntry = {
          season: save.currentSeason,
          clubId: save.userClubId,
          clubName: updatedClubs[save.userClubId]?.name || 'Tu Club',
          divisionId: comp.id,
          finalPosition: userPos,
          promoted: isPromoted,
          relegated: isRelegated,
          trophies: isChamp ? [`Campeón de ${comp.name}`] : [],
          matchesCount: userRow.played,
          wonCount: userRow.won,
          drawnCount: userRow.drawn,
          lostCount: userRow.lost,
        };
      }
    }
  });

  // 0.1 Simulate all unfinished Cup Tournaments (Copas Nacionales, Champions, Libertadores, Supercopa)
  const existingCups = save.cupTournaments || {};
  Object.values(existingCups).forEach((tournInput: KnockoutTournamentState) => {
    let tourn = { ...tournInput };
    let safety = 0;
    while (!tourn.championClubId && safety < 8) {
      safety++;
      tourn.matches = tourn.matches.map((m) => {
        if (m.played) return m;
        return simulateCupMatch(m, updatedClubs, updatedPlayers);
      });
      tourn = progressCupTournament(tourn, updatedClubs);
      const unplayed = tourn.matches.filter((m) => !m.played);
      if (unplayed.length === 0 && !tourn.championClubId) {
        const finalMatch = tourn.matches.find(
          (m) => m.roundName === 'Gran Final' || m.roundName?.includes('Final')
        );
        if (finalMatch && finalMatch.played) {
          tourn.championClubId = getCupMatchWinner(finalMatch);
          tourn.runnerUpClubId = getCupMatchLoser(finalMatch);
        }
        break;
      }
    }

    if (tourn.championClubId) {
      const isSuper = tourn.id.includes('supercopa');
      const isContinental = tourn.id.includes('champions') || tourn.id.includes('libertadores');
      const compType: TrophyRecord['competitionType'] = isSuper ? 'SUPERCOPA' : isContinental ? 'CHAMPIONS' : 'COPA';
      const tier: TrophyRecord['tier'] = isContinental ? 'CONTINENTAL' : isSuper ? 'SUPERCOPA' : 'NACIONAL_COPA';
      const champClub = updatedClubs[tourn.championClubId];
      const runnerClub = tourn.runnerUpClubId ? updatedClubs[tourn.runnerUpClubId] : undefined;
      const finalMatch = tourn.matches.find(
        (m) => m.roundName === 'Gran Final' || m.roundName?.includes('Final')
      );
      const summary = finalMatch && finalMatch.played
        ? `${finalMatch.homeScore} - ${finalMatch.awayScore}${
            finalMatch.homePenalties !== undefined
              ? ` (${finalMatch.homePenalties}-${finalMatch.awayPenalties} pen.)`
              : ''
          }`
        : 'Campeón Oficial';

      const winningManager = champClub?.id === save.userClubId
        ? `${save.manager.firstName} ${save.manager.lastName}`
        : (champClub?.coachName || 'Entrenador Campeón');

      newTrophies.push({
        id: `trophy_${tourn.id}_${save.currentSeason.replace('/', '-')}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        season: save.currentSeason,
        competitionId: tourn.id,
        competitionName: tourn.name,
        competitionType: compType,
        tier,
        championId: tourn.championClubId,
        championName: champClub?.name || tourn.championClubId,
        runnerUpId: tourn.runnerUpClubId || undefined,
        runnerUpName: runnerClub?.name,
        scoreOrSummary: summary,
        winningManagerName: winningManager,
        isPreGameHistory: false,
      });

      // Update club history titles
      if (champClub) {
        updatedClubs[champClub.id] = {
          ...champClub,
          historyTitles: [
            ...(champClub.historyTitles || []),
            { title: `Campeón de ${tourn.name}`, season: save.currentSeason },
          ],
          reputation: Math.min(99, champClub.reputation + 2),
        };
      }

      // Add to historical encyclopedia archive
      newArchives.push({
        seasonId: save.currentSeason,
        competitionId: tourn.id,
        competitionName: tourn.name,
        countryId: champClub?.countryId,
        isRealPreGameHistory: false,
        championTeam: champClub?.name || tourn.championClubId,
        runnerUpTeam: runnerClub?.name || 'Subcampeón',
        relegatedTeams: [],
        promotedTeams: [],
        playoffTeams: [],
        standingsTable: [],
        topScorer: {
          playerName: 'Goleador del Torneo',
          clubName: champClub?.name || 'Club Campeón',
          goals: 6,
          matchesPlayed: 7,
        },
        championManager: winningManager,
        notableEvent: `El ${champClub?.name} conquistó el título de ${tourn.name} superando en la final a ${runnerClub?.name || 'su rival'} (${summary}).`,
      });
    }
  });

  // 0.2 Check & Simulate World Cup if it is a World Cup season (e.g. 2025/26 ends in summer 2026; 2029/30 in summer 2030)
  const seasonStartYear = parseInt(save.currentSeason.slice(0, 4), 10) || 2024;
  const isWcSeason = seasonStartYear % 4 === 1; // 2025/26, 2029/30, 2033/34
  let wcToArchive = save.worldCupTournament;

  if (isWcSeason) {
    const wcYear = seasonStartYear + 1;
    if (!wcToArchive || wcToArchive.currentStage !== 'FINALIZADO') {
      const userNationId = save.manager?.nationalTeamRole?.countryId || 'ESP';
      const baseWc = wcToArchive || createWorldCupTournament(userNationId, undefined, 48, wcYear);
      wcToArchive = simulateEntireWorldCupTournament(baseWc, updatedPlayers);
    }

    if (wcToArchive && wcToArchive.championTeamId) {
      const champNation = NATIONAL_TEAMS_MAP[wcToArchive.championTeamId];
      const runnerNation = wcToArchive.runnerUpTeamId ? NATIONAL_TEAMS_MAP[wcToArchive.runnerUpTeamId] : undefined;
      const finalM = wcToArchive.finalMatch;
      const wcSummary = finalM && finalM.played
        ? `${finalM.homeScore} - ${finalM.awayScore}${
            finalM.homePenalties !== undefined
              ? ` (${finalM.homePenalties}-${finalM.awayPenalties} pen.)`
              : ''
          }`
        : 'Campeón Mundial';

      const userNationId = save.manager?.nationalTeamRole?.countryId || 'ESP';
      const winningCoach = wcToArchive.championTeamId === userNationId
        ? `${save.manager.firstName} ${save.manager.lastName}`
        : 'Seleccionador Nacional';

      newTrophies.push({
        id: `trophy_wc_${wcYear}_${Date.now()}`,
        season: `${wcYear}`,
        competitionId: wcToArchive.id,
        competitionName: wcToArchive.name,
        competitionType: 'SELECCIONES_MUNDIAL',
        tier: 'MUNDIAL',
        championId: wcToArchive.championTeamId,
        championName: champNation ? `${champNation.flag} ${champNation.name}` : wcToArchive.championTeamId,
        runnerUpId: wcToArchive.runnerUpTeamId || undefined,
        runnerUpName: runnerNation ? `${runnerNation.flag} ${runnerNation.name}` : undefined,
        scoreOrSummary: `${wcSummary} (${wcToArchive.hostName})`,
        winningManagerName: winningCoach,
        isPreGameHistory: false,
      });

      newArchives.push({
        seasonId: `${wcYear}`,
        competitionId: `fifa_world_cup_${wcYear}`,
        competitionName: wcToArchive.name,
        countryId: wcToArchive.championTeamId,
        isRealPreGameHistory: false,
        championTeam: champNation ? `${champNation.flag} ${champNation.name}` : wcToArchive.championTeamId,
        runnerUpTeam: runnerNation ? `${runnerNation.flag} ${runnerNation.name}` : 'Subcampeón del Mundo',
        relegatedTeams: [],
        promotedTeams: [],
        playoffTeams: [],
        standingsTable: [],
        topScorer: {
          playerName: 'Bota de Oro Mundial',
          clubName: champNation?.name || 'Selección Campeona',
          goals: 7,
          matchesPlayed: 7,
        },
        championManager: winningCoach,
        notableEvent: `¡${champNation?.name || 'La campeona'} alza la Copa Mundial de la FIFA en ${wcToArchive.hostName} tras vencer en la gran final (${wcSummary})!`,
      });
    }
  }

  const currentTrophyArchive = save.trophyArchive || HISTORICAL_TROPHY_ARCHIVE;
  const updatedTrophyArchive = [...newTrophies, ...currentTrophyArchive];

  // Helper to swap promotions & relegations between higher and lower division
  const swapPromotionRelegation = (
    higherComp: Competition | undefined,
    lowerComp: Competition | undefined,
    swapCount: number
  ) => {
    if (!higherComp || !lowerComp) return;
    if (!higherComp.standings || !lowerComp.standings) return;
    if (higherComp.standings.length < swapCount * 2 || lowerComp.standings.length < swapCount * 2) return;

    const sortedHigher = [...higherComp.standings].sort((a, b) => b.points - a.points);
    const sortedLower = [...lowerComp.standings].sort((a, b) => b.points - a.points);

    const relegated = sortedHigher.slice(sortedHigher.length - swapCount).map((r) => r.teamId);
    const promoted = sortedLower.slice(0, swapCount).map((r) => r.teamId);

    relegated.forEach((id) => {
      if (updatedClubs[id]) updatedClubs[id].divisionId = lowerComp.id;
    });
    promoted.forEach((id) => {
      if (updatedClubs[id]) updatedClubs[id].divisionId = higherComp.id;
    });

    higherComp.clubIds = higherComp.clubIds.filter((id) => !relegated.includes(id)).concat(promoted);
    lowerComp.clubIds = lowerComp.clubIds.filter((id) => !promoted.includes(id)).concat(relegated);
  };

  // 1. Spanish Pyramid Promotions & Relegations (Primera -> Segunda -> 1ª RFEF -> 2ª RFEF -> 3ª RFEF)
  swapPromotionRelegation(updatedCompetitions['esp_tier1'], updatedCompetitions['esp_tier2'], 3);
  swapPromotionRelegation(updatedCompetitions['esp_tier2'], updatedCompetitions['esp_tier3_g2'], 2);
  swapPromotionRelegation(updatedCompetitions['esp_tier3_g2'], updatedCompetitions['esp_tier4_g3'], 2);
  swapPromotionRelegation(updatedCompetitions['esp_tier4_g3'], updatedCompetitions['esp_tier5_g5'], 2);

  // Amateur promotion to lowest official tier (Amateur -> 3ª RFEF)
  if (updatedCompetitions['esp_amateur'] && updatedCompetitions['esp_tier5_g5']) {
    swapPromotionRelegation(updatedCompetitions['esp_tier5_g5'], updatedCompetitions['esp_amateur'], 1);
  }

  // English Pyramid
  swapPromotionRelegation(updatedCompetitions['eng_tier1'], updatedCompetitions['eng_tier2'], 3);

  // Stadium Naming Rights expiration check
  Object.values(updatedClubs).forEach((cl) => {
    if (cl?.stadium?.namingRightsSponsor) {
      if (cl.stadium.namingRightsSponsor.endSeason === save.currentSeason) {
        // Contract expired: revert to original historic name unless renewed
        cl.stadium.commercialName = undefined;
        cl.stadium.namingRightsSponsor = undefined;
      }
    }
  });

  // 2. Player progression, aging and retirements
  const retiredPlayerIds = new Set<string>();
  Object.keys(updatedPlayers).forEach((pid) => {
    const p = updatedPlayers[pid];
    const newAge = p.age + 1;
    let newOvr = p.overallRating;

    // Young players grow towards potential
    if (newAge <= 23 && newOvr < p.potential) {
      newOvr = Math.min(p.potential, newOvr + Math.floor(Math.random() * 3) + 1);
    } else if (newAge >= 33) {
      // Veterans decline naturally
      newOvr = Math.max(50, newOvr - Math.floor(Math.random() * 2) - 1);
    }

    // Retirement condition for veteran players
    if ((newAge >= 36 && newOvr <= 62) || newAge >= 39) {
      retiredPlayerIds.add(pid);
      delete updatedPlayers[pid];
      return;
    }

    // Disciplinary reset / carry-over rule:
    // Single-match yellow card accumulation bans reset with the season.
    // Red-card multi-match suspensions carry over with 1 match less.
    const isMultiMatchRed = (p.suspensionMatchesLeft || 0) > 1;
    const carryOverSuspension = isMultiMatchRed ? Math.max(0, (p.suspensionMatchesLeft || 0) - 1) : 0;

    // Section 15: Contract renewals & free agency release on expiry
    const seasonYearNumber = parseInt(nextSeason.slice(0, 4), 10) || 2027;
    let finalClubId: string | null = p.clubId;
    let finalContract: PlayerContract = p.contract ? { ...p.contract } : {
      wagePerWeek: 1000,
      contractEndYear: seasonYearNumber + 2,
      releaseClause: 100000,
      squadStatus: 'Rotación',
    };

    if (finalContract.contractEndYear && finalContract.contractEndYear <= seasonYearNumber) {
      if (p.clubId === save.userClubId) {
        // User club player whose contract expired without user renewing
        const leavingClubName = updatedClubs[save.userClubId]?.name || 'Tu Club';
        contractExpiredNews.push({
          id: `news_exp_${pid}_${seasonYearNumber}`,
          date: `${seasonYearNumber}-07-01`,
          title: `Fin de contrato: ${p.firstName} ${p.lastName} queda libre`,
          content: `El contrato de ${p.firstName} ${p.lastName} con el ${leavingClubName} ha concluido oficialmente sin acuerdo de renovación. El futbolista pasa a la agencia libre.`,
          category: 'FICHAJE',
          read: false,
        });
        finalClubId = null;
        finalContract = {
          wagePerWeek: 0,
          contractEndYear: seasonYearNumber,
          releaseClause: 0,
          squadStatus: 'Rotación',
        };
      } else if (p.clubId) {
        // CPU club contract renewal decision
        const cpuClub = updatedClubs[p.clubId];
        const isKeyPlayer = p.overallRating >= (cpuClub?.reputation || 70) - 4 && newAge <= 33;
        if (isKeyPlayer && Math.random() < 0.85) {
          finalContract.contractEndYear = seasonYearNumber + Math.floor(Math.random() * 3) + 1;
          finalContract.wagePerWeek = Math.round(finalContract.wagePerWeek * 1.08);
        } else {
          // Player released as free agent
          finalClubId = null;
          finalContract = {
            wagePerWeek: 0,
            contractEndYear: seasonYearNumber,
            releaseClause: 0,
            squadStatus: 'Rotación',
          };
        }
      }
    }

    updatedPlayers[pid] = {
      ...p,
      age: newAge,
      overallRating: newOvr,
      clubId: finalClubId,
      contract: finalContract,
      isTransferListed: finalClubId ? p.isTransferListed : false,
      isLoanListed: finalClubId ? p.isLoanListed : false,
      fitness: 100,
      matchReadiness: 90,
      isInjured: false,
      injuryWeeksLeft: 0,
      yellowCardAccumulation: 0,
      isSuspended: carryOverSuspension > 0,
      suspensionMatchesLeft: carryOverSuspension,
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

  // Remove retired and released free agent players from clubs and ensure every club has complete squads (>= 22 players)
  const nextSeasonStartYear = parseInt(nextSeason.slice(0, 4), 10) || 2027;
  Object.keys(updatedClubs).forEach((cid) => {
    const c = updatedClubs[cid];
    c.playerIds = (c.playerIds || []).filter((pid) => !retiredPlayerIds.has(pid) && updatedPlayers[pid]?.clubId === cid);
    
    // Squad completeness guarantee (User Request: Plantillas completas perpetuas)
    const res = ensureClubSquadCompleteness(c, updatedPlayers, nextSeasonStartYear);
    updatedClubs[cid] = res.updatedClub;
    res.newPlayers.forEach((np) => {
      updatedPlayers[np.id] = np;
    });
  });

  // 3. Reset all competition standings and generate round-robin calendar for new season
  Object.keys(updatedCompetitions).forEach((cid) => {
    const comp = updatedCompetitions[cid];
    const clubIds = comp.clubIds;
    const n = clubIds.length;
    const matches: Match[] = [];

    const standings: StandingsRow[] = clubIds.map((tid) => ({
      teamId: tid,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      recentForm: [],
    }));

    // Round-robin pairings
    const teamList = [...clubIds];
    if (n % 2 !== 0) teamList.push('BYE');
    const numTeams = teamList.length;
    const halfRounds = numTeams - 1;

    const nextSeasonStartYearNum = parseInt(nextSeason.slice(0, 4), 10);
    const computeLeagueMatchdayDate = (rIndex: number): string => {
      const d = new Date(nextSeasonStartYearNum, 7, 22);
      while (d.getDay() !== 6) {
        d.setDate(d.getDate() + 1);
      }
      let winterGap = 0;
      if (rIndex >= 18) winterGap = 14; // Pausa navideña
      d.setDate(d.getDate() + rIndex * 7 + winterGap);
      return d.toISOString().slice(0, 10);
    };

    for (let round = 0; round < halfRounds; round++) {
      const matchday = round + 1;
      const dateStr = computeLeagueMatchdayDate(round);

      for (let i = 0; i < numTeams / 2; i++) {
        const homeIdx = (round + i) % (numTeams - 1);
        let awayIdx = (numTeams - 1 - i + round) % (numTeams - 1);
        if (i === 0) awayIdx = numTeams - 1;

        const homeId = teamList[homeIdx];
        const awayId = teamList[awayIdx];

        if (homeId !== 'BYE' && awayId !== 'BYE') {
          matches.push({
            id: `match_${cid}_${nextSeason.replace('/', '-')}_j${matchday}_${i + 1}`,
            competitionId: cid,
            matchday,
            date: dateStr,
            homeTeamId: homeId,
            awayTeamId: awayId,
            played: false,
          });
        }
      }
    }

    // Second half (Vuelta)
    for (let round = 0; round < halfRounds; round++) {
      const matchday = halfRounds + round + 1;
      const dateStr = computeLeagueMatchdayDate(halfRounds + round);

      const firstHalfMatches = matches.filter((m) => m.matchday === round + 1);
      firstHalfMatches.forEach((fhm, idx) => {
        matches.push({
          id: `match_${cid}_${nextSeason.replace('/', '-')}_j${matchday}_${idx + 1}`,
          competitionId: cid,
          matchday,
          date: dateStr,
          homeTeamId: fhm.awayTeamId,
          awayTeamId: fhm.homeTeamId,
          played: false,
        });
      });
    }

    updatedCompetitions[cid] = {
      ...comp,
      season: nextSeason,
      currentMatchday: 1,
      totalMatchdays: halfRounds * 2,
      matches,
      standings,
    };
  });

  // 4. Financial budget reload for clubs
  Object.keys(updatedClubs).forEach((cid) => {
    const c = updatedClubs[cid];
    const ticketRevenue = c.stadium.seasonTicketHolders * c.stadium.ticketPrice * 12;
    const sponsorRevenue = Math.round(c.finances.sponsorAnnualRevenue * 0.95);
    updatedClubs[cid] = {
      ...c,
      finances: {
        ...c.finances,
        balance: c.finances.balance + ticketRevenue + sponsorRevenue,
        seasonTicketRevenue: ticketRevenue,
        recentLedger: [
          {
            id: `ledg_${cid}_start_${nextSeason}`,
            date: `${parseInt(nextSeason.slice(0, 4), 10)}-08-01`,
            category: 'abonos',
            description: `Recaudación campaña de abonos temporada ${nextSeason}`,
            amount: ticketRevenue,
          },
          ...c.finances.recentLedger.slice(0, 10),
        ],
      },
    };
  });

  const newsItem: NewsItem = {
    id: `news_season_${nextSeason}_start`,
    date: `${parseInt(nextSeason.slice(0, 4), 10)}-08-15`,
    title: `¡Arranca la Temporada ${nextSeason}!`,
    content: `Se da el pistoletazo de salida a la nueva temporada futbolística ${nextSeason}. Todos los clubes inician con el casillero a cero, nuevas aspiraciones de ascenso, ilusiones renovadas y el mercado de fichajes en plena ebullición.`,
    category: 'DIRECTIVA',
    read: false,
  };

  const currentArchives = save.historicalArchives && save.historicalArchives.length > 0
    ? save.historicalArchives
    : REAL_HISTORICAL_ARCHIVES_EXPANDED;

    const continentalQual = resolveContinentalQualification(save);

  let updatedManager = { ...save.manager };
  const prevStats = updatedManager.careerStats || {
    matchesManaged: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    titlesWon: 0,
    promotions: 0,
    relegations: 0,
    sacksCount: 0,
    resignationsCount: 0,
  };

  updatedManager = {
    ...updatedManager,
    careerStats: {
      ...prevStats,
      matchesManaged: prevStats.matchesManaged + userMatchesManagedDelta,
      won: prevStats.won + userWonDelta,
      drawn: prevStats.drawn + userDrawnDelta,
      lost: prevStats.lost + userLostDelta,
      goalsFor: prevStats.goalsFor + userGoalsForDelta,
      goalsAgainst: prevStats.goalsAgainst + userGoalsAgainstDelta,
      titlesWon: prevStats.titlesWon + userTitlesDelta,
      promotions: prevStats.promotions + userPromotionsDelta,
      relegations: (prevStats.relegations || 0) + userRelegationsDelta,
    },
    careerLog: [
      ...(userSeasonHistoryEntry ? [{
        season: save.currentSeason,
        clubOrNationName: updatedClubs[save.userClubId]?.name || 'Tu Club',
        competitionName: updatedCompetitions[userSeasonHistoryEntry.divisionId]?.name || 'Liga Regular',
        achieved: userSeasonHistoryEntry.promoted 
          ? `🏅 ¡ASCENSO DE CATEGORÍA! (Puesto ${userSeasonHistoryEntry.finalPosition}º)`
          : userSeasonHistoryEntry.relegated
          ? `🔻 Descenso de categoría (Puesto ${userSeasonHistoryEntry.finalPosition}º)`
          : userSeasonHistoryEntry.finalPosition === 1
          ? `🏆 CAMPEÓN de Liga (Puesto 1º)`
          : `Puesto ${userSeasonHistoryEntry.finalPosition}º en Liga regular`,
        isPromotion: userSeasonHistoryEntry.promoted,
        isRelegation: userSeasonHistoryEntry.relegated,
        isTitle: userSeasonHistoryEntry.finalPosition === 1,
        matches: userSeasonHistoryEntry.matchesCount,
      }] : []),
      ...(updatedManager.careerLog || []),
    ],
  };

  let workingSaveWithBonuses = { ...save };
  if (userTitlesDelta > 0 && userTrophyWonTitle) {
    workingSaveWithBonuses = rewardManagerTitleBonus(workingSaveWithBonuses, userTrophyWonTitle, 300000);
  }
  if (userPromotionsDelta > 0) {
    workingSaveWithBonuses = rewardManagerPromotionBonus(
      workingSaveWithBonuses, 
      updatedClubs[save.userClubId]?.name || 'Tu Club', 
      save.manager.contract?.wageWeekly ? save.manager.contract.wageWeekly * 12 : 75000
    );
  }

  const updatedHistory = userSeasonHistoryEntry
    ? [userSeasonHistoryEntry, ...(save.history || [])]
    : (save.history || []);

  const newSeasonSave: GameSave = {
    ...workingSaveWithBonuses,
    manager: updatedManager,
    history: updatedHistory,
    currentSeason: nextSeason,
    currentDate: `${parseInt(nextSeason.slice(0, 4), 10)}-08-15`,
    isTransferWindowOpen: true,
    currentTransferWindow: 'VERANO',
    clubs: updatedClubs,
    players: updatedPlayers,
    competitions: updatedCompetitions,
    cupTournaments: initializeAllTournaments(
      updatedClubs,
      nextSeason,
      save.userClubId,
      continentalQual.championsLeagueIds
    ),
    trophyArchive: updatedTrophyArchive,
    historicalArchives: [...newArchives, ...currentArchives],
    worldCupTournament: null, // Reset for the new cycle
    news: [newsItem, ...contractExpiredNews, ...(save.news || [])],
  };

  const { updatedSave: evolvedSave } = checkAndTriggerWorldEvolutionMilestones(newSeasonSave, nextSeason);
  return evolvedSave;
}
