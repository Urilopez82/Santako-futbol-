import React, { useState, useMemo, useEffect } from 'react';
import { processWeeklyFinances } from '../engine/financeEngine';
import { exportSaveToFile, saveGame } from '../storage/indexedDB';
import { Club } from '../types/club';
import { GameSave, NewsItem } from '../types/game';
import { Player } from '../types/player';
import { playClickSound, playWhistleSound, playGoalSound } from '../utils/audio';
import { LiveMatchModal } from './LiveMatchModal';
import { CompetitionView } from './views/CompetitionView';
import { FacilitiesView } from './views/FacilitiesView';
import { FinancesView } from './views/FinancesView';
import { OfficeView } from './views/OfficeView';
import { SquadView } from './views/SquadView';
import { TransfersView } from './views/TransfersView';
import { 
  Building, 
  Calendar, 
  ChevronRight, 
  Coins, 
  FastForward, 
  FileText, 
  FolderDown, 
  Home, 
  LogOut, 
  Save, 
  Search, 
  Shield, 
  Trophy, 
  Users, 
  Play, 
  CheckCircle, 
  Globe2, 
  ShieldCheck, 
  Compass, 
  User, 
  Briefcase,
  Building2,
  BookOpen,
  Crown,
  Palette,
  Sparkles,
  Scale,
  Infinity,
  Gamepad2,
  HeartPulse,
  Wallet
} from 'lucide-react';
import { ManagerProfileModal } from './manager/ManagerProfileModal';
import { ManagerMarketView } from './manager/ManagerMarketView';
import { ClubManagementView } from './views/ClubManagementView';
import { HistoryEncyclopediaView } from './views/HistoryEncyclopediaView';
import { SportingDirectorView } from './views/SportingDirectorView';
import { RegulationsAndPalmaresView } from './views/RegulationsAndPalmaresView';
import { PerpetualUniverseView } from './views/PerpetualUniverseView';
import { ChapasGameHubView } from './views/ChapasGameHubView';
import { NationalTeamView } from './views/NationalTeamView';
import { InfirmaryView } from './views/InfirmaryView';
import { PrivateLifeView } from './views/PrivateLifeView';
import { depositManagerWeeklyWage, rewardManagerTitleBonus } from '../engine/privateLifeEngine';
import { progressWeeklyInjuries } from '../engine/infirmaryEngine';
import { ContractSigningModal, ContractSigningDetails } from './modals/ContractSigningModal';
import { PcFutbolMenuModal } from './navigation/PcFutbolMenuModal';
import { PcFutbolTopHeader } from './navigation/PcFutbolTopHeader';
import { PlayerProfileModal } from './player/PlayerProfileModal';
import { WorldCupModeModal } from './worldcup/WorldCupModeModal';
import { SquadSubTab } from './views/SquadView';
import { 
  acceptJobOffer, 
  generateJobOffers, 
  generateImmediateMarketOffers,
  rejectJobOffer, 
  renewContract, 
  resignFromClub, 
  simulateMarketMovements, 
  terminateContractByBoard 
} from '../engine/managerCareerEngine';
import { 
  processComprehensiveWeeklyFinances, 
  processStadiumProjectsForDate,
  calculateMatchdayGate,
  ensureClubManagementState 
} from '../engine/clubManagementEngine';
import { 
  archiveSeasonResults, 
  ensureWorldHistory, 
  advanceWorldToNextSeason, 
  getNextSeasonString,
  updateWorldTransferRecords 
} from '../engine/worldHistoryEngine';
import { evaluateAndGenerateCpuTransferOffers } from '../engine/transferPricingEngine';
import { 
  finalizeTransferDeal, 
  progressScoutingMissions, 
  simulatePlayerEvolution, 
  isDateInTransferWindow 
} from '../engine/sportingDirectorEngine';
import { simulateMatch, SimulatedMatchResult } from '../engine/matchEngine';
import { updateStandingsWithMatch } from '../engine/competitionEngine';
import { 
  ensureClubTacticsState, 
  processDailyTraining 
} from '../engine/tacticsEngine';
import { 
  simulateWorldMatchday, 
  simulateClubsDynamicEvolution 
} from '../engine/worldSimulationEngine';
import { 
  findUnifiedNextMatch, 
  UnifiedFixture, 
  simulateScheduledCupMatchesForDate, 
  updateCupStandingsWithMatch, 
  progressCupTournament, 
  initializeAllTournaments,
  ensureCompleteCupTournaments,
  resolveContinentalQualification,
  getAllSeasonFixturesForClub
} from '../engine/internationalCompetitionsEngine';
import { 
  createWorldCupTournament, 
  advanceWorldCupTournament, 
  simulateScheduledWorldCupMatchesForDate, 
  updateWorldCupGroupWithMatch 
} from '../engine/worldCupTournamentEngine';
import { NATIONAL_TEAMS_MAP, NATIONAL_TEAMS_80 } from '../db/worldData/nationalTeams80';
import { ensureAllNationalTeamsPools } from '../engine/nationalTeamsEngine';
import { FullTransferOffer } from '../types/sportingDirector';
import { JobOffer } from '../types/game';
import { TransferOffer } from '../types/transfer';
import { executeTransfer } from '../engine/transferEngine';
import { evaluateDynamicReputationAndSuccess } from '../engine/managerReputationEngine';
import { awardTrophyToWinner } from '../engine/palmaresEngine';
import { TrophyCelebrationModal, TrophyCelebrationData } from './trophy/TrophyCelebrationModal';
import { ChampionsFinalAnnouncementModal, ChampionsFinalData } from './champions/ChampionsFinalAnnouncementModal';
import { MonthlySummaryModal, MonthlySimulationSummary } from './modals/MonthlySummaryModal';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
  initialSave: GameSave;
  onExitToMenu: () => void;
  onOpenWorldBrowser?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  initialSave,
  onExitToMenu,
  onOpenWorldBrowser,
  onOpenAdminPanel,
}) => {
  const [gameSave, setGameSave] = useState<GameSave>(() => {
    const saveWithHistory = ensureWorldHistory(initialSave);
    const { updatedSave: saveWithPools } = ensureAllNationalTeamsPools(saveWithHistory);
    const completeCups = ensureCompleteCupTournaments(
      saveWithPools.clubs,
      saveWithPools.cupTournaments,
      saveWithPools.currentSeason || '2026/27',
      saveWithPools.userClubId
    );
    return {
      ...saveWithPools,
      cupTournaments: completeCups,
    };
  });
  const [activeTab, setActiveTab] = useState<
    'despacho' | 'plantilla' | 'direccion_deportiva' | 'competicion' | 'fichajes' | 'gestion_club' | 'finanzas' | 'instalaciones' | 'mercado_managers' | 'enciclopedia_historia' | 'reglamentos_palmares' | 'universo_perpetuo' | 'futbol_chapas' | 'seleccion' | 'enfermeria' | 'vida_privada'
  >('despacho');
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPcFutbolMenuOpen, setIsPcFutbolMenuOpen] = useState(false);
  const [isWorldCupModalOpen, setIsWorldCupModalOpen] = useState(false);
  const [isAdvancingSeason, setIsAdvancingSeason] = useState(false);
  const [selectedPlayerForProfile, setSelectedPlayerForProfile] = useState<Player | null>(null);
  const [squadSubTab, setSquadSubTab] = useState<SquadSubTab>('pizarra');
  const [clubManagementSubTab, setClubManagementSubTab] = useState<any>('economia');
  const [sportingDirectorSubTab, setSportingDirectorSubTab] = useState<any>('plantillas');
  const [sportingDirectorSquadFilter, setSportingDirectorSquadFilter] = useState<any>('PRIMER_EQUIPO');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isAdvancingToMatch, setIsAdvancingToMatch] = useState(false);
  const [advancingMatchdayText, setAdvancingMatchdayText] = useState('');
  const [celebratingTrophy, setCelebratingTrophy] = useState<TrophyCelebrationData | null>(null);
  const [championsFinalAnnouncement, setChampionsFinalAnnouncement] = useState<ChampionsFinalData | null>(null);
  const [announcedFinalIds, setAnnouncedFinalIds] = useState<Set<string>>(new Set());
  const [monthlySummary, setMonthlySummary] = useState<MonthlySimulationSummary | null>(null);
  const [isMonthlySummaryOpen, setIsMonthlySummaryOpen] = useState(false);
  const [signingModalDetails, setSigningModalDetails] = useState<ContractSigningDetails | null>(null);

  // Proactive ELO & reputation update on mount (ensuring win streaks and cup progress reflect in manager reputation)
  useEffect(() => {
    try {
      const repEval = evaluateDynamicReputationAndSuccess(gameSave, false, false, false, false);
      if (repEval.reputationGained > 0 || repEval.newOffersGenerated || (gameSave.manager.reputation !== repEval.updatedSave.manager.reputation)) {
        setGameSave(repEval.updatedSave);
        saveGame(repEval.updatedSave);
      }
    } catch (e) {
      console.warn('Error evaluating reputation on mount:', e);
    }
  }, []);

  // Proactive Champions League Grand Final special announcement - strictly only when tournament reaches Gran Final
  useEffect(() => {
    try {
      const ucl = gameSave.cupTournaments?.uefa_champions;
      if (!ucl?.matches) return;
      // Must STRICTLY be in the Gran Final round to announce the final!
      if (ucl.currentRound !== 'Gran Final') return;

      const finalMatch = ucl.matches.find((m: any) => m.roundName === 'Gran Final' && !m.played);
      if (!finalMatch) return;

      if (announcedFinalIds.has(finalMatch.id)) return;

      const homeClub = gameSave.clubs[finalMatch.homeTeamId];
      const awayClub = gameSave.clubs[finalMatch.awayTeamId];
      if (!homeClub || !awayClub) return;

      const isUserInFinal = homeClub.id === gameSave.userClubId || awayClub.id === gameSave.userClubId;
      const daysDiff = (new Date(finalMatch.date).getTime() - new Date(gameSave.currentDate).getTime()) / (1000 * 60 * 60 * 24);

      if (isUserInFinal || (daysDiff >= 0 && daysDiff <= 14)) {
        const homePlayers = Object.values(gameSave.players).filter((p) => p.clubId === homeClub.id);
        const awayPlayers = Object.values(gameSave.players).filter((p) => p.clubId === awayClub.id);
        const homeStar = homePlayers.sort((a, b) => b.overallRating - a.overallRating)[0] || null;
        const awayStar = awayPlayers.sort((a, b) => b.overallRating - a.overallRating)[0] || null;

        setChampionsFinalAnnouncement({
          homeClub,
          awayClub,
          date: finalMatch.date,
          neutralVenue: finalMatch.neutralVenue || 'Allianz Arena (Múnich)',
          season: gameSave.currentSeason,
          userClubId: gameSave.userClubId,
          homeStarPlayer: homeStar,
          awayStarPlayer: awayStar,
        });
        setAnnouncedFinalIds((prev) => new Set([...prev, finalMatch.id]));
      }
    } catch (e) {
      console.warn('Error checking Champions Final announcement:', e);
    }
  }, [gameSave.currentDate, gameSave.cupTournaments?.uefa_champions]);

  const rawClub =
    (gameSave.clubs && gameSave.clubs[gameSave.userClubId]) ||
    (gameSave.clubs && Object.values(gameSave.clubs).find((c) => c.name?.toLowerCase().includes(gameSave.metadata?.clubName?.toLowerCase() || ''))) ||
    (gameSave.clubs && Object.values(gameSave.clubs)[0]);

  const club = rawClub ? ensureClubTacticsState(
    ensureClubManagementState(rawClub),
    gameSave.players || {}
  ) : null;
  const competition = (club && gameSave.competitions && gameSave.competitions[club.divisionId]) || (gameSave.competitions && Object.values(gameSave.competitions)[0]);

  // Navigation handler for the official 25 PC Fútbol sections
  const handleSelectSection = (sectionId: number) => {
    switch (sectionId) {
      case 1: // 1. Inicio
        setActiveTab('despacho');
        break;
      case 2: // 2. Primer equipo
        setSquadSubTab('plantilla');
        setActiveTab('plantilla');
        break;
      case 3: // 3. Filial
        setSportingDirectorSubTab('plantillas');
        setSportingDirectorSquadFilter('FILIAL_B');
        setActiveTab('direccion_deportiva');
        break;
      case 4: // 4. Cantera
        setSportingDirectorSubTab('cantera');
        setActiveTab('direccion_deportiva');
        break;
      case 5: // 5. Fichajes
        setActiveTab('fichajes');
        break;
      case 6: // 6. Ojeadores
        setSportingDirectorSubTab('ojeadores');
        setActiveTab('direccion_deportiva');
        break;
      case 7: // 7. Entrenamiento
        setSquadSubTab('entrenamiento');
        setActiveTab('plantilla');
        break;
      case 8: // 8. Tácticas
        setSquadSubTab('pizarra');
        setActiveTab('plantilla');
        break;
      case 9: // 9. Partidos
        setIsMatchModalOpen(true);
        break;
      case 10: // 10. Competición
      case 11: // 11. Clasificación
      case 12: // 12. Estadísticas
        setActiveTab('competicion');
        break;
      case 13: // 13. Economía
        setClubManagementSubTab('economia');
        setActiveTab('gestion_club');
        break;
      case 14: // 14. Estadio
        setClubManagementSubTab('estadio');
        setActiveTab('gestion_club');
        break;
      case 15: // 15. Instalaciones
        setActiveTab('instalaciones');
        break;
      case 16: // 16. Patrocinadores
        setClubManagementSubTab('patrocinios');
        setActiveTab('gestion_club');
        break;
      case 17: // 17. Merchandising
        setClubManagementSubTab('tienda');
        setActiveTab('gestion_club');
        break;
      case 18: // 18. Restaurante y catering
        setClubManagementSubTab('catering');
        setActiveTab('gestion_club');
        break;
      case 19: // 19. Afición
        setClubManagementSubTab('taquillas');
        setActiveTab('gestion_club');
        break;
      case 20: // 20. Prensa
        setSquadSubTab('analisis_prensa');
        setActiveTab('plantilla');
        break;
      case 21: // 21. Directiva
        setActiveTab('despacho');
        break;
      case 22: // 22. Personal técnico
        setSportingDirectorSubTab('ojeadores');
        setActiveTab('direccion_deportiva');
        break;
      case 23: // 23. Historia del club
        setActiveTab('enciclopedia_historia');
        break;
      case 24: // 24. Perfil del entrenador
        setIsProfileModalOpen(true);
        break;
      case 25: // 25. Mundo futbolístico
        setActiveTab('universo_perpetuo');
        break;
      case 26: // 26. Fútbol Chapas
        setActiveTab('futbol_chapas');
        break;
      case 27: // 27. Enfermería & Servicios Médicos
        setActiveTab('enfermeria');
        break;
      case 28: // 28. Vida Privada del Entrenador
        setActiveTab('vida_privada');
        break;
      case 29: // 29. Selección Nacional
        setActiveTab('seleccion');
        break;
    }
  };

  // Check upcoming unified fixtures for the user's club across ALL competitions (Liga, Copa, Champions, Supercopa)
  const unifiedNextMatch: UnifiedFixture | null = useMemo(() => {
    if (!club) return null;
    return findUnifiedNextMatch(gameSave, club.id);
  }, [gameSave, club?.id]);

  const nextMatch = useMemo(() => {
    if (!club || !competition?.matches) return null;
    return competition.matches.find((m) => !m.played && (m.homeTeamId === club.id || m.awayTeamId === club.id)) || null;
  }, [competition, club?.id]);

  const isMatchdayToday = unifiedNextMatch ? unifiedNextMatch.date <= gameSave.currentDate : false;
  const isSeasonFinished = Boolean(
    competition &&
    competition.matches.length > 0 &&
    competition.matches.every((m) => m.played) &&
    (!gameSave.worldCupTournament || gameSave.worldCupTournament.currentStage === 'FINALIZADO')
  );

  // Manual save trigger
  const handleManualSave = async () => {
    playClickSound();
    await saveGame(gameSave);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  // Export current save file
  const handleExportSave = () => {
    playClickSound();
    exportSaveToFile(gameSave);
  };

  // Helper to advance exactly 1 calendar day with all simulation systems active
  const advanceSingleDay = (currentSave: GameSave): GameSave => {
    // Safe UTC date incrementation to prevent timezone drift, DST jumps or leap year hangs
    const parts = currentSave.currentDate.slice(0, 10).split('-').map(Number);
    const y = parts[0] || 2026;
    const m = parts[1] || 1;
    const d = parts[2] || 1;
    const dt = new Date(Date.UTC(y, m - 1, d + 1));
    const newDateStr = dt.toISOString().slice(0, 10);
    const dayOfWeek = dt.getUTCDay(); // 0 = Domingo, 1 = Lunes

    const targetClub = currentSave.clubs[currentSave.userClubId] || club;
    let updatedPlayers = { ...currentSave.players };
    let updatedClub = { ...targetClub };
    let weeklyNews: NewsItem[] = [];

    // FASE 5: Execute daily training schedule, fitness changes and individual progression
    const trainingRes = processDailyTraining(updatedClub, updatedPlayers, newDateStr);
    updatedClub = trainingRes.updatedClub;
    updatedPlayers = trainingRes.updatedPlayers;

    if (trainingRes.trainingAlerts.length > 0) {
      trainingRes.trainingAlerts.slice(0, 2).forEach((alert, idx) => {
        weeklyNews.unshift({
          id: `train_news_${Date.now()}_${idx}`,
          date: newDateStr,
          title: 'Parte del Cuerpo Técnico',
          content: alert,
          category: 'ENTRENADOR',
          read: false,
        });
      });
    }

    // Daily check and progression of stadium renovation projects
    if (updatedClub.activeStadiumProjects && updatedClub.activeStadiumProjects.length > 0) {
      const stadiumProg = processStadiumProjectsForDate(updatedClub, newDateStr);
      updatedClub = stadiumProg.updatedClub;
      if (stadiumProg.completedNews.length > 0) {
        weeklyNews = [...stadiumProg.completedNews, ...weeklyNews];
      }
    }

    // If day is Monday, process weekly comprehensive finances
    if (dayOfWeek === 1) {
      const financeRes = processComprehensiveWeeklyFinances(updatedClub, updatedPlayers, newDateStr);
      updatedClub = financeRes.updatedClub;
      weeklyNews = [...weeklyNews, ...financeRes.newsItems];
    }

    let updatedSave: GameSave = {
      ...currentSave,
      currentDate: newDateStr,
      clubs: {
        ...currentSave.clubs,
        [targetClub.id]: updatedClub,
      },
      players: updatedPlayers,
      news: weeklyNews.length > 0 ? [...weeklyNews, ...currentSave.news] : currentSave.news,
    };

    if (dayOfWeek === 1) {
      updatedSave = depositManagerWeeklyWage(updatedSave);
      updatedSave = progressWeeklyInjuries(updatedSave);
    }

    // Managerial market movements
    updatedSave = simulateMarketMovements(updatedSave);

    // Board confidence check
    if (updatedClub.boardConfidence <= 20) {
      const sackRes = terminateContractByBoard(
        updatedSave,
        'La junta directiva ha perdido la confianza tras una racha deportiva negativa.'
      );
      updatedSave = sackRes.updatedSave;
    }

    // Purge stale offers older than 30 days or from previous seasons
    const currentYear = parseInt(newDateStr.slice(0, 4), 10) || 2026;
    let validOffers = (updatedSave.jobOffers || []).filter((o) => {
      if (o.status !== 'PENDIENTE') return false;
      if (o.offeredDate) {
        const offYear = parseInt(o.offeredDate.slice(0, 4), 10) || 2026;
        if (currentYear - offYear >= 1) return false;
      }
      return true;
    });

    // Spontaneous job offers matching manager reputation / ELO (higher chance on Mondays or every few days)
    if ((dayOfWeek === 1 || Math.random() < 0.35) && validOffers.length < 6) {
      const newOffers = generateJobOffers(updatedSave.manager, updatedSave, 6);
      const existingIds = new Set(validOffers.map((o) => o.clubId || o.clubName));
      const filteredNew = newOffers.filter((o) => !existingIds.has(o.clubId || o.clubName));
      if (filteredNew.length > 0) {
        validOffers = [...filteredNew, ...validOffers].slice(0, 8);
      }
    }
    updatedSave = {
      ...updatedSave,
      jobOffers: validOffers,
    };

    // AI clubs regularly examine the transfer market and submit bids for transfer-listed user players
    if (dayOfWeek === 1 || dayOfWeek === 4 || Math.random() < 0.28) {
      const cpuTransferRes = evaluateAndGenerateCpuTransferOffers(updatedSave);
      if (cpuTransferRes.newOffersCount > 0) {
        updatedSave = {
          ...updatedSave,
          transferOffers: cpuTransferRes.updatedOffers,
          news: [...cpuTransferRes.newsAlerts, ...(updatedSave.news || [])],
        };
      }
    }

    // Periodically evaluate dynamic reputation & ELO on Mondays
    if (dayOfWeek === 1) {
      const repEval = evaluateDynamicReputationAndSuccess(updatedSave, false, false, false);
      updatedSave = repEval.updatedSave;
    }

    // FASE 6: Simulación simultánea de todas las ligas del universo con modelo probabilístico
    const worldSim = simulateWorldMatchday(updatedSave, newDateStr);
    updatedSave = worldSim.updatedSave;

    // Simulación de Copas Continentales y Copa del Rey
    if (updatedSave.cupTournaments) {
      updatedSave = {
        ...updatedSave,
        cupTournaments: simulateScheduledCupMatchesForDate(
          updatedSave.cupTournaments,
          newDateStr,
          updatedSave.clubs,
          updatedSave.players,
          updatedSave.userClubId
        ),
      };
    }

    // Activación y simulación de la Copa del Mundo (cada 4 años: 2026, 2030, etc.)
    const yearNum = parseInt(newDateStr.slice(0, 4), 10) || 2026;
    const monthNum = parseInt(newDateStr.slice(5, 7), 10) || 8;
    const dayOfMonth = parseInt(newDateStr.slice(8, 10), 10) || 1;
    const isWorldCupYear = yearNum % 4 === 2;

    if (isWorldCupYear && (monthNum === 6 || (monthNum === 5 && dayOfMonth >= 25) || monthNum === 7)) {
      if (!updatedSave.worldCupTournament) {
        const userNationId = updatedSave.manager?.nationalTeamRole?.countryId || (updatedSave.manager as any).nationalityCountryId || 'ESP';
        const newTournament = createWorldCupTournament(userNationId, undefined, 48, yearNum);
        const nationData = NATIONAL_TEAMS_MAP[userNationId] || NATIONAL_TEAMS_80.find((n) => n.id === userNationId || n.name.toLowerCase() === userNationId.toLowerCase());

        updatedSave = {
          ...updatedSave,
          worldCupTournament: newTournament,
          manager: {
            ...updatedSave.manager,
            nationalTeamRole: {
              countryId: userNationId,
              countryName: nationData ? nationData.name : 'Selección Nacional',
              flag: nationData ? nationData.flag : '🌐',
              teamType: 'ABSOLUTA',
              squadPlayerIds: [],
              reputation: 88,
            },
          },
          news: [
            {
              id: `wc_nomination_${Date.now()}`,
              date: newDateStr,
              title: `¡OFICIAL: ${nationData?.flag || '🌐'} Nombrado Seleccionador de ${nationData?.name || 'la Selección'} para el Mundial ${yearNum}!`,
              content: `La federación nacional de ${nationData?.name || 'la selección'} ha designado oficialmente a ${updatedSave.manager.firstName} ${updatedSave.manager.lastName} como seleccionador para liderar al combinado en la Copa Mundial de la FIFA. El objetivo: ¡conquistar la gloria planetaria!`,
              category: 'ENTRENADOR',
              read: false,
            },
            ...updatedSave.news,
          ],
        };
      }
    }

    // Simulación diaria de partidos del Mundial
    if (updatedSave.worldCupTournament && updatedSave.worldCupTournament.currentStage !== 'FINALIZADO') {
      const userNationId = updatedSave.worldCupTournament.userTeamId || updatedSave.manager?.nationalTeamRole?.countryId || 'ESP';
      updatedSave = {
        ...updatedSave,
        worldCupTournament: simulateScheduledWorldCupMatchesForDate(
          updatedSave.worldCupTournament,
          newDateStr,
          updatedSave.players,
          userNationId
        ),
      };
    }

    // Generar noticia destacada
    if (worldSim.summary.simulatedMatchesCount > 0 && worldSim.summary.topEvents.length > 0) {
      const topEvent = worldSim.summary.topEvents[0];
      updatedSave = {
        ...updatedSave,
        news: [
          {
            id: `world_match_news_${Date.now()}`,
            date: newDateStr,
            title: `Resumen de Competiciones: ${topEvent.competitionName}`,
            content: `Se disputaron ${worldSim.summary.simulatedMatchesCount} partidos en el universo futbolístico. Resultado destacado: ${topEvent.headline}.`,
            category: 'PARTIDO',
            read: false,
          },
          ...updatedSave.news,
        ],
      };
    }

    // Transfer window status
    const windowInfo = isDateInTransferWindow(newDateStr);
    updatedSave = {
      ...updatedSave,
      isTransferWindowOpen: windowInfo.isOpen,
      currentTransferWindow: windowInfo.windowName,
    };

    // Scouting network progression
    if (dayOfWeek === 1 || Math.random() < 0.25) {
      const scoutRes = progressScoutingMissions(updatedSave);
      updatedSave = scoutRes.updatedSave;
    }

    // Weekly player attributes evolution
    if (dayOfWeek === 1) {
      const evolvedPlayers = simulatePlayerEvolution(updatedSave.players);
      updatedSave = {
        ...updatedSave,
        players: evolvedPlayers,
      };
    }

    return updatedSave;
  };

  // Advance Date (single day)
  const handleAdvanceDate = async () => {
    if (isAdvancingToMatch) return;
    playClickSound();
    setIsAdvancingToMatch(true);
    setAdvancingMatchdayText('Avanzando un día en el calendario...');
    await new Promise((r) => setTimeout(r, 10));

    try {
      const updated = advanceSingleDay(gameSave);
      setGameSave(updated);
      await saveGame(updated);
    } catch (err) {
      console.error('Error advancing single day:', err);
    } finally {
      setIsAdvancingToMatch(false);
      setAdvancingMatchdayText('');
    }
  };

  // Advance Date directly to the next scheduled match (simulating intermediate days non-blockingly)
  const handleAdvanceToMatch = async (targetDateStr: string) => {
    if (isAdvancingToMatch) return;
    playClickSound();
    setIsAdvancingToMatch(true);
    setAdvancingMatchdayText(`Avanzando calendario hasta ${targetDateStr}...`);

    let current = { ...gameSave };
    let safetyLimit = 0;

    try {
      while (current.currentDate < targetDateStr && safetyLimit < 60) {
        // If current date already has a match involving user's club, stop immediately!
        const matchNow = findUnifiedNextMatch(current, current.userClubId);
        if (matchNow && matchNow.date <= current.currentDate) {
          break;
        }

        current = advanceSingleDay(current);
        safetyLimit++;
        setAdvancingMatchdayText(`Simulando jornada (${current.currentDate})...`);

        // Yield to browser event loop so UI stays completely fluid
        await new Promise((resolve) => setTimeout(resolve, 15));

        // After advancing, check if user's matchday is reached
        const nextUserMatch = findUnifiedNextMatch(current, current.userClubId);
        if (nextUserMatch && nextUserMatch.date <= current.currentDate) {
          break;
        }
      }

      setGameSave(current);
      await saveGame(current);
    } catch (err) {
      console.error('Error advancing to matchday:', err);
    } finally {
      setIsAdvancingToMatch(false);
      setAdvancingMatchdayText('');
    }
  };

  // Direct Month-by-Month Simulation (BLOQUE G)
  const handleSimulateFullMonth = async () => {
    if (isAdvancingToMatch || isSeasonFinished) return;
    playClickSound();
    setIsAdvancingToMatch(true);

    const initialDate = gameSave.currentDate;
    const initialParts = initialDate.split('-');
    const currentYear = parseInt(initialParts[0], 10);
    const currentMonth = parseInt(initialParts[1], 10);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthLabel = `${monthNames[currentMonth - 1] || 'Mes'} ${currentYear}`;
    setAdvancingMatchdayText(`Simulando mes de ${monthLabel}...`);

    let current = { ...gameSave };
    const initialBalance = (current.clubs[current.userClubId]?.finances?.balance) || 0;
    const initialInjuredIds = new Set(
      Object.values(current.players)
        .filter((p) => p.clubId === current.userClubId && p.isInjured)
        .map((p) => p.id)
    );
    const initialSuspendedIds = new Set(
      Object.values(current.players)
        .filter((p) => p.clubId === current.userClubId && p.suspensionMatchesLeft && p.suspensionMatchesLeft > 0)
        .map((p) => p.id)
    );

    const matchesPlayedInMonth: MonthlySimulationSummary['matchesPlayed'] = [];
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let gf = 0;
    let gc = 0;

    let daysAdvanced = 0;
    let safetyLimit = 0;

    try {
      while (safetyLimit < 35) {
        safetyLimit++;
        const dateParts = current.currentDate.split('-');
        const iterMonth = parseInt(dateParts[1], 10);

        // Month boundary reached: target month is simulated
        if (iterMonth !== currentMonth) {
          break;
        }

        // Check if there is an official match today for user club
        const todayFixture = findUnifiedNextMatch(current, current.userClubId);
        if (todayFixture && todayFixture.date === current.currentDate && !todayFixture.played) {
          const userClub = current.clubs[current.userClubId];
          const opponent = current.clubs[todayFixture.opponentId];
          if (userClub && opponent) {
            const userRep = userClub.reputation || 70;
            const oppRep = opponent.reputation || 70;
            const diff = (userRep - oppRep) / 20;
            const homeScore = Math.max(0, Math.round(1.6 + (todayFixture.isHome ? diff * 0.5 : -diff * 0.5) + (Math.random() * 2 - 1)));
            const awayScore = Math.max(0, Math.round(1.1 + (todayFixture.isHome ? -diff * 0.5 : diff * 0.5) + (Math.random() * 2 - 1)));
            
            const myScore = todayFixture.isHome ? homeScore : awayScore;
            const theirScore = todayFixture.isHome ? awayScore : homeScore;

            gf += myScore;
            gc += theirScore;
            let resultChar: 'W' | 'D' | 'L' = 'D';
            if (myScore > theirScore) {
              won++;
              resultChar = 'W';
            } else if (myScore < theirScore) {
              lost++;
              resultChar = 'L';
            } else {
              drawn++;
              resultChar = 'D';
            }

            const userPlayers = Object.values(current.players).filter((p) => p.clubId === current.userClubId);
            const goalScorers: string[] = [];
            for (let g = 0; g < myScore; g++) {
              const scorer = userPlayers[Math.floor(Math.random() * Math.min(6, userPlayers.length))] || userPlayers[0];
              if (scorer) {
                scorer.seasonStats.goals += 1;
                goalScorers.push(`${scorer.lastName} (${15 + g * 25}')`);
              }
            }

            matchesPlayedInMonth.push({
              id: todayFixture.id,
              competitionName: todayFixture.competitionName,
              opponentName: opponent.name,
              isHome: todayFixture.isHome,
              homeScore,
              awayScore,
              scorers: goalScorers,
              result: resultChar,
              date: current.currentDate,
            });
          }
        }

        current = advanceSingleDay(current);
        daysAdvanced++;
        setAdvancingMatchdayText(`Simulando mes: ${current.currentDate} (${daysAdvanced} días)...`);
        await new Promise((resolve) => setTimeout(resolve, 8));
      }

      const finalUserClub = current.clubs[current.userClubId];
      const finalBalance = (finalUserClub?.finances?.balance) || 0;
      const delta = finalBalance - initialBalance;

      // Squad condition
      const userClubPlayers = Object.values(current.players).filter((p) => p.clubId === current.userClubId);
      const avgCondition = Math.round(
        userClubPlayers.reduce((acc, p) => acc + (p.fitness || 85), 0) / Math.max(1, userClubPlayers.length)
      );
      const avgMorale = Math.round(
        userClubPlayers.reduce((acc, p) => acc + (p.morale || 80), 0) / Math.max(1, userClubPlayers.length)
      );

      // Injuries and sanctions during the month
      const injuredPlayers = userClubPlayers
        .filter((p) => p.isInjured && !initialInjuredIds.has(p.id))
        .map((p) => ({
          name: `${p.firstName} ${p.lastName}`,
          position: p.primaryPosition,
          weeks: p.injuryWeeksLeft || 2,
        }));

      const suspendedPlayers = userClubPlayers
        .filter((p) => p.suspensionMatchesLeft && p.suspensionMatchesLeft > 0 && !initialSuspendedIds.has(p.id))
        .map((p) => ({
          name: `${p.firstName} ${p.lastName}`,
          position: p.primaryPosition,
          matches: p.suspensionMatchesLeft || 1,
        }));

      // Top performers
      const topPerformers = [...userClubPlayers]
        .sort((a, b) => b.overallRating - a.overallRating)
        .slice(0, 4)
        .map((p) => ({
          name: `${p.firstName} ${p.lastName}`,
          position: p.primaryPosition,
          rating: p.overallRating,
          goals: p.seasonStats.goals,
        }));

      // Upcoming fixtures in the new month
      const allUpcoming = getAllSeasonFixturesForClub(current, current.userClubId).filter((f) => !f.played);
      const upcomingFixtures = allUpcoming.slice(0, 6).map((f) => {
        const opp = current.clubs[f.opponentId];
        return {
          competitionName: f.competitionName,
          opponentName: opp ? opp.name : f.opponentId,
          date: f.date,
          isHome: f.isHome,
        };
      });

      const summary: MonthlySimulationSummary = {
        monthName: monthLabel,
        season: current.currentSeason,
        startDate: initialDate,
        endDate: current.currentDate,
        daysSimulated: daysAdvanced,
        matchesPlayed: matchesPlayedInMonth,
        record: { won, drawn, lost, gf, gc },
        financials: {
          initialBalance,
          finalBalance,
          delta,
          weeklyWagesPaid: (finalUserClub?.finances?.weeklyWageBudget || 0) * 4,
        },
        squadStatus: {
          avgMorale,
          avgCondition,
          injuredPlayers,
          suspendedPlayers,
        },
        topPerformers,
        upcomingFixtures,
        headlines: (current.news || []).slice(0, 3).map((n) => n.title),
      };

      setMonthlySummary(summary);
      setIsMonthlySummaryOpen(true);
      setGameSave(current);
      await saveGame(current);
    } catch (err) {
      console.error('Error simulating full month:', err);
    } finally {
      setIsAdvancingToMatch(false);
      setAdvancingMatchdayText('');
    }
  };

  // Trilateral Transfer Completion (FASE 4)
  const handleFinalizeTransfer = async (offer: FullTransferOffer, player: Player) => {
    playClickSound();
    const result = finalizeTransferDeal(gameSave, offer, player);
    setGameSave(result.updatedSave);
    await saveGame(result.updatedSave);
  };

  // Career: Accept Job Offer
  const handleAcceptJobOffer = async (offer: JobOffer) => {
    playClickSound();
    const result = acceptJobOffer(gameSave, offer);
    setGameSave(result.updatedSave);
    await saveGame(result.updatedSave);

    const isNat = Boolean(offer.isNationalTeam);
    const targetName = offer.clubName;
    const resolvedNat = isNat
      ? (offer.countryId ? NATIONAL_TEAMS_MAP[offer.countryId] : null) ||
        NATIONAL_TEAMS_80.find(
          (n) => n.id === offer.countryId || targetName.toLowerCase().includes(n.name.toLowerCase())
        )
      : null;
    const badgeOrFlag = isNat
      ? (resolvedNat?.flag || (offer.countryId ? NATIONAL_TEAMS_MAP[offer.countryId]?.flag : null) || '🌐')
      : (gameSave.clubs[offer.clubId || '']?.code || 'FC');
    const startYr = parseInt(gameSave.currentSeason.slice(0, 4), 10) || 2026;
    const endYr = startYr + offer.durationYears;

    setSigningModalDetails({
      teamName: targetName,
      badgeOrFlag,
      isNationalTeam: isNat,
      roleTitle: isNat ? 'Seleccionador Nacional' : 'Primer Entrenador',
      startDate: gameSave.currentDate,
      endSeason: `${endYr}/${String(endYr + 1).slice(2)}`,
      durationYears: offer.durationYears,
      wageWeekly: offer.wageWeekly,
      wageAnnual: offer.wageWeekly * 52,
      sportingObjective: offer.sportingObjective || 'Cumplir los objetivos pactados con la presidencia',
      economicObjective: offer.transferBudget ? `Presupuesto de fichajes: ${offer.transferBudget.toLocaleString()} €` : undefined,
      releaseClause: Math.round(offer.wageWeekly * 52 * 2.5),
    });
  };

  // Career: Reject Job Offer
  const handleRejectJobOffer = async (offerId: string) => {
    playClickSound();
    const updated = rejectJobOffer(gameSave, offerId);
    setGameSave(updated);
    await saveGame(updated);
  };

  // Career: Renew Contract
  const handleRenewContract = async () => {
    playClickSound();
    const result = renewContract(gameSave, 1, 15);
    setGameSave(result.updatedSave);
    await saveGame(result.updatedSave);

    const currentClub = club;
    if (currentClub) {
      setSigningModalDetails({
        teamName: currentClub.name,
        badgeOrFlag: currentClub.code,
        isNationalTeam: false,
        roleTitle: 'Primer Entrenador',
        startDate: gameSave.currentDate,
        endSeason: result.updatedSave.manager.contract.endSeason,
        durationYears: 1,
        wageWeekly: result.updatedSave.manager.contract.wageWeekly,
        wageAnnual: result.updatedSave.manager.contract.wageWeekly * 52,
        sportingObjective: currentClub.boardObjective,
        economicObjective: `Presupuesto renovado: ${currentClub.finances.transferBudget.toLocaleString()} €`,
        releaseClause: Math.round(result.updatedSave.manager.contract.wageWeekly * 52 * 2.5),
      });
    }
  };

  // Career: Resign from Club
  const handleResign = async () => {
    playClickSound();
    const result = resignFromClub(gameSave);
    setGameSave(result.updatedSave);
    await saveGame(result.updatedSave);
  };

  // Career: Simulate Sacking by Board
  const handleSimulateSack = async () => {
    playClickSound();
    const result = terminateContractByBoard(
      gameSave,
      'Cese fulminante por decisión ejecutiva de la presidencia.'
    );
    setGameSave(result.updatedSave);
    await saveGame(result.updatedSave);
  };

  // Career: Apply for club vacancy in Market
  const handleApplyForClub = async (targetClub: Club) => {
    playClickSound();
    const offer: JobOffer = {
      id: `offer_${targetClub.id}_${Date.now()}`,
      clubId: targetClub.id,
      clubName: targetClub.name,
      clubCode: targetClub.code,
      divisionName: targetClub.divisionId,
      countryId: targetClub.countryId || 'ESP',
      wageWeekly: Math.round(targetClub.finances.weeklyWageBudget * 0.08),
      durationYears: 2,
      sportingObjective: targetClub.boardObjective,
      transferBudget: targetClub.finances.transferBudget,
      isNationalTeam: false,
      offeredDate: gameSave.currentDate,
      reputationRequired: targetClub.reputation - 5,
      status: 'PENDIENTE',
    };

    const updatedSave: GameSave = {
      ...gameSave,
      jobOffers: [offer, ...gameSave.jobOffers],
    };
    setGameSave(updatedSave);
    await saveGame(updatedSave);
  };

  // Career: Apply for National Team
  const handleApplyForNationalTeam = async (
    countryName: string,
    teamType: 'ABSOLUTA' | 'SUB21' | 'SUB20',
    countryId?: string
  ) => {
    playClickSound();
    const cleanCountry = countryName
      .replace(/^Selección\s+(de\s+|Absoluta\s+de\s+|de\s+Fútbol\s+de\s+)?/i, '')
      .replace(/\s+Sub-2[01]$/i, '')
      .trim()
      .toLowerCase();

    const natTeam = (countryId ? NATIONAL_TEAMS_MAP[countryId] : null) ||
      NATIONAL_TEAMS_80.find(
        (n) => n.id === countryId || n.name.toLowerCase() === cleanCountry || cleanCountry.includes(n.name.toLowerCase())
      );

    const resolvedCountryId = natTeam?.id || countryId || 'ESP';
    const resolvedName = natTeam ? `Selección de ${natTeam.name}` : countryName;

    const offer: JobOffer = {
      id: `offer_nat_${teamType.toLowerCase()}_${Date.now()}`,
      clubName: resolvedName,
      divisionName: `Selección Nacional ${teamType}`,
      countryId: resolvedCountryId,
      wageWeekly: teamType === 'ABSOLUTA' ? 5000 : teamType === 'SUB21' ? 2200 : 1400,
      durationYears: 2,
      sportingObjective: `Competir con el máximo rigor en los torneos oficiales ${teamType}`,
      transferBudget: 0,
      isNationalTeam: true,
      nationalTeamType: teamType,
      offeredDate: gameSave.currentDate,
      reputationRequired: teamType === 'ABSOLUTA' ? 70 : teamType === 'SUB21' ? 60 : 50,
      status: 'PENDIENTE',
    };

    const updatedSave: GameSave = {
      ...gameSave,
      jobOffers: [offer, ...gameSave.jobOffers],
    };
    setGameSave(updatedSave);
    await saveGame(updatedSave);
  };

  // Career: Request fresh job offers from Agent / Representative
  const handleRequestAgentOffers = async () => {
    playClickSound();
    // Re-evaluate dynamic reputation & ELO based on current season achievements first
    const repEval = evaluateDynamicReputationAndSuccess(gameSave, false, false, false);
    const result = generateImmediateMarketOffers(repEval.updatedSave);
    setGameSave(result.updatedSave);
    await saveGame(result.updatedSave);
  };

  // Update Club tactics, facilities, kits, loans, sponsors, etc.
  const handleUpdateClub = async (
    updatedClub: Club,
    playerDeltas?: Record<string, Player>,
    newsItem?: NewsItem
  ) => {
    const updatedPlayers = playerDeltas ? { ...gameSave.players, ...playerDeltas } : gameSave.players;
    const updatedNews = newsItem ? [newsItem, ...gameSave.news] : gameSave.news;
    const updatedSave: GameSave = {
      ...gameSave,
      clubs: {
        ...gameSave.clubs,
        [updatedClub.id]: updatedClub,
      },
      players: updatedPlayers,
      news: updatedNews,
    };
    setGameSave(updatedSave);
    await saveGame(updatedSave);
  };

  // Execute Transfer Deal
  const handleExecuteDeal = async (
    updatedBuyer: Club,
    updatedSeller: Club | null,
    updatedPlayer: Player,
    newsItem: NewsItem
  ) => {
    const updatedClubs = {
      ...gameSave.clubs,
      [updatedBuyer.id]: updatedBuyer,
    };
    if (updatedSeller) {
      updatedClubs[updatedSeller.id] = updatedSeller;
    }

    // Check fee from buyer's ledger
    const latestLedger = updatedBuyer.finances?.recentLedger?.[0];
    const fee = latestLedger && latestLedger.amount < 0 ? Math.abs(latestLedger.amount) : 0;
    const recCheck = updateWorldTransferRecords(
      gameSave,
      updatedPlayer,
      updatedBuyer,
      updatedSeller,
      fee,
      gameSave.currentSeason
    );

    const updatedSave: GameSave = {
      ...gameSave,
      clubs: updatedClubs,
      players: {
        ...gameSave.players,
        [updatedPlayer.id]: updatedPlayer,
      },
      worldRecords: recCheck.updatedRecords,
      news: [newsItem, ...recCheck.brokenRecordNews, ...gameSave.news],
    };

    setGameSave(updatedSave);
    await saveGame(updatedSave);
  };

  // CPU Transfer Offers Handlers
  const handleAcceptCpuTransferOffer = async (offer: TransferOffer) => {
    playGoalSound();
    const player = gameSave.players[offer.playerId];
    const buyerClub = gameSave.clubs[offer.buyingClubId];
    const sellerClub = gameSave.clubs[offer.sellingClubId] || club;
    if (!player || !buyerClub) return;

    // Execute transfer
    const executed = executeTransfer(
      player,
      buyerClub,
      sellerClub,
      offer.transferFee,
      offer.proposedWageWeekly,
      offer.proposedContractYears,
      offer.proposedReleaseClause,
      gameSave.currentDate
    );

    // Update historical transfer records
    const recCheck = updateWorldTransferRecords(
      gameSave,
      player,
      buyerClub,
      sellerClub,
      offer.transferFee,
      gameSave.currentSeason
    );

    // Mark offer as COMPLETADA
    const updatedOffers = (gameSave.transferOffers || []).map((o) =>
      o.id === offer.id ? { ...o, status: 'COMPLETADA' as const } : o
    );

    const updatedClubs = {
      ...gameSave.clubs,
      [executed.updatedBuyer.id]: executed.updatedBuyer,
    };
    if (executed.updatedSeller) {
      updatedClubs[executed.updatedSeller.id] = executed.updatedSeller;
    }

    const newsItem: NewsItem = {
      id: `news_sale_${Date.now()}`,
      date: gameSave.currentDate,
      title: `¡Traspaso Oficial: ${player.firstName} ${player.lastName} vendido!`,
      content: `El ${sellerClub?.name || 'club'} ha completado el traspaso de ${player.firstName} ${player.lastName} al ${buyerClub.name} por ${offer.transferFee.toLocaleString()} €. Los ingresos ya constan en tesorería y presupuesto de fichajes.`,
      category: 'FICHAJE',
      read: false,
    };

    const finalSave: GameSave = {
      ...gameSave,
      clubs: updatedClubs,
      players: {
        ...gameSave.players,
        [executed.updatedPlayer.id]: executed.updatedPlayer,
      },
      transferOffers: updatedOffers,
      worldRecords: recCheck.updatedRecords,
      news: [newsItem, ...recCheck.brokenRecordNews, ...(gameSave.news || [])],
    };

    setGameSave(finalSave);
    await saveGame(finalSave);
  };

  const handleRejectCpuTransferOffer = async (offerId: string) => {
    playClickSound();
    const updatedOffers = (gameSave.transferOffers || []).map((o) =>
      o.id === offerId ? { ...o, status: 'RECHAZADA_CLUB' as const } : o
    );
    const updatedSave: GameSave = {
      ...gameSave,
      transferOffers: updatedOffers,
    };
    setGameSave(updatedSave);
    await saveGame(updatedSave);
  };

  const handleNegotiateCpuTransferOffer = async (offerId: string, counterFee: number) => {
    playClickSound();
    const offer = (gameSave.transferOffers || []).find((o) => o.id === offerId);
    if (!offer) return;
    const player = gameSave.players[offer.playerId];
    const buyerClub = gameSave.clubs[offer.buyingClubId];
    if (!player || !buyerClub) return;

    const buyerBudget = Math.max(buyerClub.finances?.transferBudget || 0, Math.round((buyerClub.finances?.balance || 0) * 0.7));
    const marketVal = player.marketValue || 1000000;
    const isAcceptable = counterFee <= buyerBudget && counterFee <= marketVal * 1.25;

    let updatedOffers = [...(gameSave.transferOffers || [])];
    let newsItem: NewsItem;

    if (isAcceptable) {
      updatedOffers = updatedOffers.map((o) =>
        o.id === offerId ? { ...o, transferFee: counterFee, status: 'PENDIENTE' as const } : o
      );
      newsItem = {
        id: `news_counter_acc_${Date.now()}`,
        date: gameSave.currentDate,
        title: `¡${buyerClub.name} acepta tu contraoferta por ${player.lastName}!`,
        content: `La directiva de ${buyerClub.name} ha aceptado abonar los ${counterFee.toLocaleString()} € propuestos. Ya puedes formalizar y firmar el traspaso en la bandeja de ofertas.`,
        category: 'FICHAJE',
        read: false,
      };
    } else {
      const compromiseFee = Math.round((offer.transferFee + counterFee) / 2);
      if (compromiseFee > offer.transferFee && compromiseFee <= buyerBudget) {
        updatedOffers = updatedOffers.map((o) =>
          o.id === offerId ? { ...o, transferFee: compromiseFee } : o
        );
        newsItem = {
          id: `news_counter_comp_${Date.now()}`,
          date: gameSave.currentDate,
          title: `Contrapropuesta de ${buyerClub.name} por ${player.lastName}`,
          content: `${buyerClub.name} no alcanza los ${counterFee.toLocaleString()} € solicitados, pero presenta una última oferta mejorada de ${compromiseFee.toLocaleString()} €.`,
          category: 'FICHAJE',
          read: false,
        };
      } else {
        updatedOffers = updatedOffers.map((o) =>
          o.id === offerId ? { ...o, status: 'RECHAZADA_CLUB' as const } : o
        );
        newsItem = {
          id: `news_counter_rej_${Date.now()}`,
          date: gameSave.currentDate,
          title: `Ruptura de negociaciones con ${buyerClub.name}`,
          content: `${buyerClub.name} considera excesivas tus pretensiones de ${counterFee.toLocaleString()} € por ${player.lastName} y se retira definitivamente de la puja.`,
          category: 'FICHAJE',
          read: false,
        };
      }
    }

    const updatedSave: GameSave = {
      ...gameSave,
      transferOffers: updatedOffers,
      news: [newsItem, ...(gameSave.news || [])],
    };
    setGameSave(updatedSave);
    await saveGame(updatedSave);
  };

  // Ticket price change
  const handleUpdateTicketPrice = async (newPrice: number) => {
    if (!club) return;
    const updatedClub: Club = {
      ...club,
      stadium: {
        ...club.stadium,
        ticketPrice: newPrice,
      },
    };
    await handleUpdateClub(updatedClub);
  };

  // Facilities upgrade
  const handleUpgradeFacility = async (updatedClub: Club, newsItem: NewsItem) => {
    const updatedSave: GameSave = {
      ...gameSave,
      clubs: {
        ...gameSave.clubs,
        [updatedClub.id]: updatedClub,
      },
      news: [newsItem, ...gameSave.news],
    };
    setGameSave(updatedSave);
    await saveGame(updatedSave);
  };

  // Post match handler & Season archive
  const handleMatchFinished = async (
    updatedSave: GameSave,
    userMatchResult: SimulatedMatchResult
  ) => {
    // Synchronize rest of matches around the world for this date (FASE 6)
    const worldSim = simulateWorldMatchday(updatedSave, gameSave.currentDate, {
      matchId: userMatchResult.match.id,
      match: userMatchResult.match,
      updatedPlayers: userMatchResult.updatedPlayers,
    });
    let finalSave = worldSim.updatedSave;
    setIsMatchModalOpen(false);

    // 1. If it was a World Cup match, update worldCupTournament state
    if (unifiedNextMatch?.isWorldCup && finalSave.worldCupTournament) {
      let wc = { ...finalSave.worldCupTournament };
      const userScore = userMatchResult.homeScore;
      const rivalScore = userMatchResult.awayScore;
      const isKnockout = unifiedNextMatch.worldCupMatch?.stage && unifiedNextMatch.worldCupMatch.stage !== 'GRUPO';
      let homePen: number | undefined = undefined;
      let awayPen: number | undefined = undefined;

      if (isKnockout && userScore === rivalScore) {
        homePen = 5;
        awayPen = 4;
      }

      const updatedWcMatch = {
        id: userMatchResult.match.id,
        stage: unifiedNextMatch.worldCupMatch?.stage || 'GRUPO',
        groupName: unifiedNextMatch.worldCupMatch?.groupName,
        homeTeamId: userMatchResult.match.homeTeamId,
        awayTeamId: userMatchResult.match.awayTeamId,
        homeScore: userScore,
        awayScore: rivalScore,
        homePenalties: homePen,
        awayPenalties: awayPen,
        played: true,
        date: userMatchResult.match.date,
        city: unifiedNextMatch.worldCupMatch?.city || 'MetLife Stadium',
        stadium: unifiedNextMatch.worldCupMatch?.stadium || 'MetLife Stadium',
        events: (userMatchResult.events || []).map((e) => ({
          minute: e.minute,
          type: e.type === 'GOL' || e.type === 'GOL_PENALTI' ? ('GOL' as const) : (e.type as any),
          teamId: e.teamId,
          playerName: finalSave.players[e.playerId]
            ? `${finalSave.players[e.playerId].firstName} ${finalSave.players[e.playerId].lastName}`
            : 'Goleador',
        })),
      };

      // Update in groups
      wc.groups = wc.groups.map((g) => {
        if (g.matches.some((m) => m.id === updatedWcMatch.id)) {
          return updateWorldCupGroupWithMatch(g, updatedWcMatch);
        }
        return g;
      });

      // Update in knockout brackets
      const updateBracketList = (list: any[]) =>
        list.map((m) => (m.id === updatedWcMatch.id ? updatedWcMatch : m));

      if (wc.bracketRoundOf32) wc.bracketRoundOf32 = updateBracketList(wc.bracketRoundOf32);
      if (wc.bracketRoundOf16) wc.bracketRoundOf16 = updateBracketList(wc.bracketRoundOf16);
      if (wc.bracketQuarterFinals) wc.bracketQuarterFinals = updateBracketList(wc.bracketQuarterFinals);
      if (wc.bracketSemiFinals) wc.bracketSemiFinals = updateBracketList(wc.bracketSemiFinals);
      if (wc.thirdPlaceMatch && wc.thirdPlaceMatch.id === updatedWcMatch.id) wc.thirdPlaceMatch = updatedWcMatch;
      if (wc.finalMatch && wc.finalMatch.id === updatedWcMatch.id) wc.finalMatch = updatedWcMatch;

      // Advance brackets
      wc = advanceWorldCupTournament(wc);

      // Check if user won the World Cup Final
      if (wc.finalMatch && wc.finalMatch.played && wc.championTeamId) {
        const userNation = wc.userTeamId;
        if (wc.championTeamId === userNation) {
          finalSave = {
            ...finalSave,
            manager: {
              ...finalSave.manager,
              careerStats: {
                ...finalSave.manager.careerStats,
                titlesWon: finalSave.manager.careerStats.titlesWon + 1,
              },
            },
            news: [
              {
                id: `wc_champ_${Date.now()}`,
                date: gameSave.currentDate,
                title: '¡¡¡CAMPEÓN DE LA COPA MUNDIAL DE LA FIFA 2026!!!',
                content: `¡Hazaña histórica para los anales del fútbol mundial! La selección dirigida magistralmente por ${finalSave.manager.firstName} ${finalSave.manager.lastName} se proclama CAMPEONA DE LA COPA DEL MUNDIAL DE LA FIFA ante miles de espectadores.`,
                category: 'PARTIDO',
                read: false,
              },
              ...finalSave.news,
            ],
          };
        }
      }

      finalSave = {
        ...finalSave,
        worldCupTournament: wc,
      };
    }

    // 2. If it was a cup fixture, mark it played and update standings/progression
    if (unifiedNextMatch?.isCup && finalSave.cupTournaments) {
      const tournId = unifiedNextMatch.competitionId;
      let tourn = finalSave.cupTournaments[tournId];
      if (tourn) {
        const isKnockout = !unifiedNextMatch.roundOrMatchday?.startsWith('Fase de Liga');
        let homePen: number | undefined = undefined;
        let awayPen: number | undefined = undefined;
        if (isKnockout && userMatchResult.homeScore === userMatchResult.awayScore) {
          homePen = 5;
          awayPen = 4;
        }

        const updatedCupMatches = tourn.matches.map((cm: any) =>
          cm.id === userMatchResult.match.id
            ? {
                ...cm,
                played: true,
                homeScore: userMatchResult.homeScore,
                awayScore: userMatchResult.awayScore,
                homePenalties: homePen,
                awayPenalties: awayPen,
              }
            : cm
        );

        tourn = {
          ...tourn,
          matches: updatedCupMatches,
        };

        if (tourn.standings && unifiedNextMatch.roundOrMatchday?.startsWith('Fase de Liga')) {
          const matchObj = updatedCupMatches.find((m: any) => m.id === userMatchResult.match.id);
          if (matchObj) {
            tourn.standings = updateCupStandingsWithMatch(tourn.standings, matchObj);
          }
        }

        tourn = progressCupTournament(tourn, finalSave.clubs);

        finalSave = {
          ...finalSave,
          cupTournaments: {
            ...finalSave.cupTournaments,
            [tournId]: tourn,
          },
        };

        // Check if this was genuinely the CUP FINAL!
        const roundLower = (unifiedNextMatch.roundOrMatchday || '').toLowerCase().trim();
        const isActualFinalRound = 
          roundLower.startsWith('gran final') ||
          roundLower === 'final' ||
          roundLower.startsWith('final ') ||
          tourn.currentRound === 'Gran Final' ||
          tourn.currentRound === 'Final';

        const isFinalMatchObj = (tourn.matches || []).some(
          (m: any) =>
            m.id === userMatchResult.match.id &&
            ((m.roundName || '').toLowerCase().startsWith('gran final') ||
              (m.roundName || '').toLowerCase() === 'final')
        );

        if (isActualFinalRound && isFinalMatchObj) {
          const cupUserClubId = club?.id || finalSave.userClubId;
          const isUserHomeInFinal = userMatchResult.match.homeTeamId === cupUserClubId;
          const userScoreInFinal = isUserHomeInFinal ? userMatchResult.homeScore : userMatchResult.awayScore;
          const rivalScoreInFinal = isUserHomeInFinal ? userMatchResult.awayScore : userMatchResult.homeScore;
          const userWonCup = userScoreInFinal > rivalScoreInFinal;

          const champId = userWonCup ? cupUserClubId : (isUserHomeInFinal ? userMatchResult.match.awayTeamId : userMatchResult.match.homeTeamId);
          const runnerUpId = champId === userMatchResult.match.homeTeamId ? userMatchResult.match.awayTeamId : userMatchResult.match.homeTeamId;

          tourn.championClubId = champId;
          tourn.runnerUpClubId = runnerUpId;
          tourn.currentRound = 'Finalizado';

          const trophyRes = awardTrophyToWinner(finalSave, {
            competitionId: tourn.id,
            competitionName: tourn.name,
            trophyName: tourn.trophyName || tourn.name,
            competitionType: tourn.id.includes('champions') ? 'CHAMPIONS' : tourn.id.includes('supercopa') ? 'SUPERCOPA' : 'COPA',
            season: finalSave.currentSeason,
            championId: champId,
            runnerUpId,
            scoreOrSummary: `${userScoreInFinal} - ${rivalScoreInFinal} en la Gran Final`,
          });
          finalSave = trophyRes.updatedSave;
          if (trophyRes.celebrationData) {
            setCelebratingTrophy(trophyRes.celebrationData);
          }
        }
      }
    }

    const currentComp = (club && finalSave.competitions[club.divisionId]) || Object.values(finalSave.competitions)[0];
    const pendingMatches = currentComp?.matches.filter((m) => !m.played);

    // If season completed, award League Trophy and archive to dynamic world history!
    if (currentComp && pendingMatches && pendingMatches.length === 0) {
      const sortedTable = [...currentComp.standings].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
      if (sortedTable[0]) {
        const champId = sortedTable[0].teamId;
        const trophyRes = awardTrophyToWinner(finalSave, {
          competitionId: currentComp.id,
          competitionName: currentComp.name,
          trophyName: `Trofeo de ${currentComp.shortName || currentComp.name}`,
          competitionType: 'LIGA',
          season: finalSave.currentSeason,
          championId: champId,
          runnerUpId: sortedTable[1]?.teamId,
          scoreOrSummary: `${sortedTable[0].points} pts (${sortedTable[0].won}V ${sortedTable[0].drawn}E ${sortedTable[0].lost}D)`,
        });
        finalSave = trophyRes.updatedSave;
        if (trophyRes.celebrationData) {
          setCelebratingTrophy(trophyRes.celebrationData);
        }
      }
      finalSave = archiveSeasonResults(finalSave, currentComp, finalSave.currentSeason);
    }

    // ACCURATE USER SCORE RESOLUTION (accounting for home or away venue)
    const userClubId = club?.id || finalSave.userClubId;
    const isUserHome = userMatchResult.match.homeTeamId === userClubId || (Boolean(unifiedNextMatch?.isWorldCup) && userMatchResult.match.homeTeamId === finalSave.worldCupTournament?.userTeamId);
    const userScore = isUserHome ? userMatchResult.homeScore : userMatchResult.awayScore;
    const rivalScore = isUserHome ? userMatchResult.awayScore : userMatchResult.homeScore;
    const userWon = userScore > rivalScore;
    const isDraw = userScore === rivalScore;
    const isCup = Boolean(unifiedNextMatch?.isCup);

    // Update manager career goals
    const prevCareer = finalSave.manager.careerStats || {
      matchesManaged: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      titlesWon: 0,
      promotions: 0,
      sacksCount: 0,
      resignationsCount: 0,
    };
    finalSave = {
      ...finalSave,
      manager: {
        ...finalSave.manager,
        careerStats: {
          ...prevCareer,
          goalsFor: (prevCareer.goalsFor || 0) + userScore,
          goalsAgainst: (prevCareer.goalsAgainst || 0) + rivalScore,
        },
      },
    };

    // Update player seasonStats (matches played, goals, assists)
    let updatedPlayers = { ...finalSave.players };
    const matchLineup = [
      ...(club?.startingElevenIds || []),
      ...(userMatchResult.match.events || []).map((e) => e.playerId).filter(Boolean),
    ];
    matchLineup.forEach((pid) => {
      const p = updatedPlayers[pid];
      if (p) {
        const cur = p.seasonStats || {
          goals: 0,
          matchesPlayed: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          minutesPlayed: 0,
          averageRating: 7.0,
        };
        const gCount = (userMatchResult.match.events || []).filter(
          (e) => e.playerId === pid && (e.type === 'GOL' || e.type === 'GOL_PENALTI')
        ).length;
        const aCount = (userMatchResult.match.events || []).filter(
          (e) => e.assistPlayerId === pid
        ).length;
        const yCount = (userMatchResult.match.events || []).filter(
          (e) => e.playerId === pid && e.type === 'TARJETA_AMARILLA'
        ).length;
        const rCount = (userMatchResult.match.events || []).filter(
          (e) => e.playerId === pid && e.type === 'TARJETA_ROJA'
        ).length;

        updatedPlayers[pid] = {
          ...p,
          seasonStats: {
            ...cur,
            matchesPlayed: cur.matchesPlayed + 1,
            minutesPlayed: cur.minutesPlayed + 90,
            goals: cur.goals + gCount,
            assists: cur.assists + aCount,
            yellowCards: cur.yellowCards + yCount,
            redCards: cur.redCards + rCount,
          },
        };
      }
    });

    // Disciplinary cycle processing:
    // 1. Red cards and yellow accumulations in this match -> trigger suspensions
    (userMatchResult.match.events || []).forEach((ev) => {
      if (ev.type === 'TARJETA_ROJA' && ev.playerId && updatedPlayers[ev.playerId]) {
        updatedPlayers[ev.playerId] = {
          ...updatedPlayers[ev.playerId],
          isSuspended: true,
          suspensionMatchesLeft: 2,
        };
      }
    });

    matchLineup.forEach((pid) => {
      const p = updatedPlayers[pid];
      if (p) {
        const yCount = (userMatchResult.match.events || []).filter(
          (e) => e.playerId === pid && e.type === 'TARJETA_AMARILLA'
        ).length;
        if (yCount > 0) {
          const currentAcc = (p.yellowCardAccumulation || 0) + yCount;
          const triggersBan = currentAcc % 5 === 0;
          updatedPlayers[pid] = {
            ...updatedPlayers[pid],
            yellowCardAccumulation: currentAcc,
            isSuspended: triggersBan ? true : updatedPlayers[pid]?.isSuspended,
            suspensionMatchesLeft: triggersBan ? 1 : updatedPlayers[pid]?.suspensionMatchesLeft,
          };
        }
      }
    });

    // 2. Decrement and clear suspensions for players of both clubs who sat out serving their ban!
    const matchClubIds = [userMatchResult.match.homeTeamId, userMatchResult.match.awayTeamId].filter(Boolean);
    matchClubIds.forEach((cid) => {
      Object.values(updatedPlayers)
        .filter((p) => p.clubId === cid)
        .forEach((p) => {
          const gotRedInThisMatch = (userMatchResult.match.events || []).some(
            (e) => e.playerId === p.id && e.type === 'TARJETA_ROJA'
          );
          if (p.isSuspended && !gotRedInThisMatch) {
            const remaining = Math.max(0, (p.suspensionMatchesLeft || 1) - 1);
            updatedPlayers[p.id] = {
              ...p,
              suspensionMatchesLeft: remaining,
              isSuspended: remaining > 0,
            };
          }
        });
    });

    // Reset pre-match press conference so next match starts with new rival analysis
    let updatedClubs = { ...finalSave.clubs };
    if (updatedClubs[userClubId]) {
      updatedClubs[userClubId] = {
        ...updatedClubs[userClubId],
        activePressConference: undefined,
      };
    }

    finalSave = {
      ...finalSave,
      clubs: updatedClubs,
      players: updatedPlayers,
    };

    // Evaluate Dynamic Manager ELO, win streak and reputation after match!
    const repEval = evaluateDynamicReputationAndSuccess(finalSave, userWon, isDraw, isCup, true);
    finalSave = repEval.updatedSave;

    // Automatically advance calendar date to the following day after the match!
    finalSave = advanceSingleDay(finalSave);

    setGameSave(finalSave);
    await saveGame(finalSave);
  };

  // Transition to next season (FASE 6 / Historia dinámica acumulativa y evolución de clubes)
  const handleAdvanceToNextSeason = async () => {
    playClickSound();
    setIsAdvancingSeason(true);
    await new Promise((r) => setTimeout(r, 60)); // Yield to paint UI spinner

    try {
      let workingSave = { ...gameSave };
      // Resolve continental qualification: National Cup winners (e.g. Copa del Rey) earn direct Champions League spots!
      const continentalQual = resolveContinentalQualification(workingSave);

      // Archive all competitions that haven't been archived yet for this season
      Object.values(workingSave.competitions).forEach((comp) => {
        workingSave = archiveSeasonResults(workingSave, comp, workingSave.currentSeason);
      });
      // Evolve clubs prestige, finances, and tiers
      workingSave = {
        ...workingSave,
        clubs: simulateClubsDynamicEvolution(workingSave.clubs, workingSave.competitions),
      };
      // Advance world to next season (promotions, relegations, player ages & evolution, fresh calendars)
      let newSave = advanceWorldToNextSeason(workingSave);

      // Clean up single-match suspensions and card accumulation for the fresh season
      const cleanPlayers = { ...newSave.players };
      Object.keys(cleanPlayers).forEach((pid) => {
        const pl = cleanPlayers[pid];
        if (pl) {
          cleanPlayers[pid] = {
            ...pl,
            yellowCardAccumulation: 0,
            isSuspended: (pl.suspensionMatchesLeft || 0) > 1,
            suspensionMatchesLeft: Math.max(0, (pl.suspensionMatchesLeft || 0) - 1),
          };
        }
      });

      // Re-initialize cup tournaments (with official 36-team Champions League including Cup champions!)
      newSave = {
        ...newSave,
        players: cleanPlayers,
        cupTournaments: initializeAllTournaments(
          newSave.clubs,
          newSave.currentSeason,
          newSave.userClubId,
          continentalQual.championsLeagueIds
        ),
        worldCupTournament: null,
      };

      setGameSave(newSave);
      await saveGame(newSave);
    } finally {
      setIsAdvancingSeason(false);
    }
  };

  // Actions from PlayerProfileModal
  const handleToggleTransferListFromProfile = async (playerId: string) => {
    const p = gameSave.players[playerId];
    if (!p || !club) return;
    const updatedP: Player = { ...p, isTransferListed: !p.isTransferListed };
    await handleUpdateClub(club, { [playerId]: updatedP });
    setSelectedPlayerForProfile(updatedP);
  };

  const handlePromoteToFirstTeamFromProfile = async (playerId: string) => {
    const p = gameSave.players[playerId];
    if (!p || !club) return;
    const updatedP: Player = { ...p, squadCategory: 'PRIMER_EQUIPO' };
    await handleUpdateClub(club, { [playerId]: updatedP });
    setSelectedPlayerForProfile(updatedP);
  };

  const handleDemoteToReserveFromProfile = async (playerId: string) => {
    const p = gameSave.players[playerId];
    if (!p || !club) return;
    const updatedP: Player = { ...p, squadCategory: 'FILIAL_B' };
    await handleUpdateClub(club, { [playerId]: updatedP });
    setSelectedPlayerForProfile(updatedP);
  };

  if (!club || !competition) {
    return (
      <div className="min-h-screen pcf-pitch-bg flex items-center justify-center p-6 text-slate-100">
        <div className="pcf-panel max-w-md w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase font-condensed">Cargando datos del club...</h2>
          <button onClick={onExitToMenu} className="pcf-btn pcf-btn-gold px-4 py-2 text-xs uppercase font-bold">
            Volver al Menú Principal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pcf-pitch-bg text-slate-100 flex flex-col font-sans select-none">
      {/* PC Fútbol Authentic Top Header Bar */}
      <PcFutbolTopHeader
        gameSave={gameSave}
        club={club}
        competition={competition}
        activeTab={activeTab}
        nextMatch={nextMatch}
        unifiedNextMatch={unifiedNextMatch}
        isMatchdayToday={isMatchdayToday}
        isSeasonFinished={isSeasonFinished}
        saveSuccessMsg={saveSuccessMsg}
        isAdvancingToMatch={isAdvancingToMatch}
        onOpenPcFutbolMenu={() => setIsPcFutbolMenuOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenMatch={() => setIsMatchModalOpen(true)}
        onAdvanceDate={handleAdvanceDate}
        onAdvanceToMatch={handleAdvanceToMatch}
        onAdvanceToNextSeason={handleAdvanceToNextSeason}
        onManualSave={handleManualSave}
        onExportSave={handleExportSave}
        onExitToMenu={onExitToMenu}
        onOpenWorldCup={() => setIsWorldCupModalOpen(true)}
        onOpenWorldBrowser={onOpenWorldBrowser}
        onOpenAdminPanel={onOpenAdminPanel}
        onSimulateFullMonth={handleSimulateFullMonth}
        onOpenChapas={() => setActiveTab('futbol_chapas')}
      />

      {/* Simulation Progress HUD Overlay */}
      {isAdvancingToMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 via-[#0d1527] to-[#070b14] border border-amber-500/40 rounded-2xl p-6 shadow-2xl max-w-md w-full text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white uppercase font-condensed tracking-wider">
                Simulando Calendario Mundial
              </h3>
              <p className="text-xs text-slate-300 font-mono-num font-semibold">
                {advancingMatchdayText || `Simulando fecha: ${gameSave.currentDate}`}
              </p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full w-2/3 animate-pulse rounded-full" />
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono-num">
              Actualizando clasificaciones, estados de plantilla, mercado y ELO
            </p>
          </div>
        </div>
      )}

      {/* Primary Sub-navigation Bar (Classic PC Fútbol metallic tabs with gold accent) */}
      <nav className="bg-gradient-to-r from-[#07160d] via-[#0c2215] to-[#07160d] border-b-2 border-amber-500/30 px-4 overflow-x-auto flex items-center gap-1 shadow-lg backdrop-blur-md">
        {[
          { key: 'despacho', label: 'Despacho', icon: Home },
          { key: 'plantilla', label: 'Plantilla & Táctica', icon: Users },
          { key: 'direccion_deportiva', label: 'Dirección Deportiva', icon: ShieldCheck },
          { key: 'competicion', label: 'Competición & Clasificación', icon: Trophy },
          { key: 'fichajes', label: 'Mercado de Fichajes', icon: Search },
          { key: 'gestion_club', label: 'Gestión Total Club', icon: Building2 },
          { key: 'mercado_managers', label: 'Mercado Mánagers', icon: Compass },
          { key: 'enciclopedia_historia', label: 'Historia & Récords', icon: BookOpen },
          { key: 'reglamentos_palmares', label: 'Reglamentos & Palmarés', icon: Scale },
          { key: 'universo_perpetuo', label: 'Universo Perpetuo', icon: Infinity },
          { key: 'futbol_chapas', label: 'Fútbol Chapas', icon: Gamepad2 },
          { 
            key: 'seleccion', 
            label: gameSave.manager?.nationalTeamRole
              ? `${gameSave.manager.nationalTeamRole.flag || '🌐'} ${gameSave.manager.nationalTeamRole.countryName || 'Selección'}`
              : 'Selección', 
            icon: Globe2 
          },
          { key: 'enfermeria', label: 'Enfermería', icon: HeartPulse },
          { key: 'vida_privada', label: 'Vida Privada', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.key as any);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold font-condensed uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-amber-400 text-amber-300 bg-amber-950/40 shadow-[inset_0_1px_0_rgba(251,191,36,0.3)]'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-emerald-950/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Champions League Notice Banner - Shows Current Active Round accurately */}
      {(() => {
        const ucl = gameSave.cupTournaments?.uefa_champions;
        if (!ucl) return null;

        // Gran Final Banner: strictly ONLY when tournament is genuinely at Gran Final round!
        if (ucl.currentRound === 'Gran Final') {
          const fm = ucl.matches.find((m: any) => m.roundName === 'Gran Final' && !m.played);
          if (!fm) return null;
          const h = gameSave.clubs[fm.homeTeamId]?.name || fm.homeTeamId;
          const a = gameSave.clubs[fm.awayTeamId]?.name || fm.awayTeamId;
          return (
            <div className="bg-gradient-to-r from-blue-950 via-[#0b1c4c] to-blue-950 border-b border-amber-400/80 px-4 py-2 flex items-center justify-between text-xs font-condensed shadow-lg shrink-0">
              <div className="flex items-center gap-2 truncate">
                <Trophy className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
                <span className="font-black text-amber-300 uppercase tracking-wider shrink-0">
                  ¡LA GRAN FINAL DE LA UEFA CHAMPIONS LEAGUE!
                </span>
                <span className="text-slate-300 hidden sm:inline truncate">
                  — {h} vs {a} · Allianz Arena (Múnich)
                </span>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  const homeClub = gameSave.clubs[fm.homeTeamId];
                  const awayClub = gameSave.clubs[fm.awayTeamId];
                  if (homeClub && awayClub) {
                    const homePlayers = Object.values(gameSave.players).filter((p) => p.clubId === homeClub.id);
                    const awayPlayers = Object.values(gameSave.players).filter((p) => p.clubId === awayClub.id);
                    setChampionsFinalAnnouncement({
                      homeClub,
                      awayClub,
                      date: fm.date,
                      neutralVenue: fm.neutralVenue || 'Allianz Arena (Múnich)',
                      season: gameSave.currentSeason,
                      userClubId: gameSave.userClubId,
                      homeStarPlayer: homePlayers.sort((a, b) => b.overallRating - a.overallRating)[0] || null,
                      awayStarPlayer: awayPlayers.sort((a, b) => b.overallRating - a.overallRating)[0] || null,
                    });
                  }
                }}
                className="pcf-btn pcf-btn-gold px-3 py-1 text-[11px] font-black uppercase rounded-lg flex items-center gap-1.5 cursor-pointer shadow shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ver Presentación Oficial</span>
              </button>
            </div>
          );
        }

        // Active knockout rounds prior to final (16avos, Octavos, Cuartos, Semifinales)
        const unplayedKnockout = ucl.matches.filter(
          (m: any) => !m.played && m.roundName !== 'Gran Final' && !m.roundName.startsWith('Fase de Liga')
        );
        if (unplayedKnockout.length > 0) {
          const currentKnockoutRound = unplayedKnockout[0]?.roundName || ucl.currentRound;
          return (
            <div className="bg-gradient-to-r from-slate-950 via-[#0a1636] to-slate-950 border-b border-sky-500/40 px-4 py-1.5 flex items-center justify-between text-xs font-condensed shadow shrink-0">
              <div className="flex items-center gap-2 truncate">
                <Trophy className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-bold text-sky-300 uppercase tracking-wider">
                  UEFA Champions League · {currentKnockoutRound}
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  ({unplayedKnockout.length} eliminatorias en juego)
                </span>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('competicion');
                }}
                className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-950/80 text-sky-300 border border-sky-600/50 hover:bg-sky-900 transition-colors cursor-pointer"
              >
                Ver Cuadro
              </button>
            </div>
          );
        }

        return null;
      })()}

      {/* Main Tab Content View */}
      <main className="flex-1 p-3 sm:p-6 pb-24 sm:pb-8 max-w-7xl mx-auto w-full">
        {activeTab === 'despacho' && (
          <OfficeView
            gameSave={gameSave}
            onNavigateTab={(t, sub) => {
              setActiveTab(t as any);
              if (sub) {
                if (t === 'plantilla') setSquadSubTab(sub as any);
                if (t === 'gestion_club') setClubManagementSubTab(sub);
                if (t === 'direccion_deportiva') setSportingDirectorSubTab(sub);
              }
            }}
            onOpenMatch={() => setIsMatchModalOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onInspectPlayer={(p) => setSelectedPlayerForProfile(p)}
          />
        )}

        {activeTab === 'plantilla' && (
          <SquadView
            gameSave={gameSave}
            onUpdateClub={handleUpdateClub}
            onSelectPlayer={(p) => setSelectedPlayerForProfile(p)}
            initialSubTab={squadSubTab}
          />
        )}

        {activeTab === 'direccion_deportiva' && (
          <SportingDirectorView
            gameSave={gameSave}
            onUpdateClub={handleUpdateClub}
            onUpdateSave={async (newSave) => {
              setGameSave(newSave);
              await saveGame(newSave);
            }}
            onFinalizeTransfer={handleFinalizeTransfer}
            onSelectPlayer={(p) => setSelectedPlayerForProfile(p)}
            initialSubTab={sportingDirectorSubTab}
            initialSquadFilter={sportingDirectorSquadFilter}
          />
        )}

        {activeTab === 'competicion' && (
          <CompetitionView 
            gameSave={gameSave} 
            onUpdateSave={async (newSave) => {
              setGameSave(newSave);
              await saveGame(newSave);
            }}
          />
        )}

        {activeTab === 'fichajes' && (
          <TransfersView
            gameSave={gameSave}
            onExecuteDeal={handleExecuteDeal}
            onAcceptCpuOffer={handleAcceptCpuTransferOffer}
            onRejectCpuOffer={handleRejectCpuTransferOffer}
            onNegotiateCpuOffer={handleNegotiateCpuTransferOffer}
          />
        )}

        {activeTab === 'gestion_club' && (
          <ClubManagementView
            gameSave={gameSave}
            onUpdateClub={handleUpdateClub}
            initialSubTab={clubManagementSubTab}
          />
        )}

        {activeTab === 'finanzas' && (
          <FinancesView
            gameSave={gameSave}
            onUpdateTicketPrice={handleUpdateTicketPrice}
          />
        )}

        {activeTab === 'instalaciones' && (
          <FacilitiesView
            gameSave={gameSave}
            onUpgradeFacility={handleUpgradeFacility}
          />
        )}

        {activeTab === 'mercado_managers' && (
          <ManagerMarketView
            gameSave={gameSave}
            onApplyForClub={handleApplyForClub}
            onApplyForNationalTeam={handleApplyForNationalTeam}
          />
        )}

        {activeTab === 'enciclopedia_historia' && (
          <HistoryEncyclopediaView
            gameSave={gameSave}
            onAdvanceSeason={handleAdvanceToNextSeason}
          />
        )}

        {activeTab === 'reglamentos_palmares' && (
          <RegulationsAndPalmaresView
            gameSave={gameSave}
          />
        )}

        {activeTab === 'universo_perpetuo' && (
          <PerpetualUniverseView
            gameSave={gameSave}
            onUpdateGameSave={async (newSave) => {
              setGameSave(newSave);
              await saveGame(newSave);
            }}
          />
        )}

        {activeTab === 'futbol_chapas' && (
          <ChapasGameHubView
            gameSave={gameSave}
            onBackToOffice={() => setActiveTab('despacho')}
          />
        )}

        {activeTab === 'seleccion' && (
          <NationalTeamView
            gameSave={gameSave}
            onUpdateSave={async (newSave) => {
              setGameSave(newSave);
              await saveGame(newSave);
            }}
            onBackToOffice={() => setActiveTab('despacho')}
          />
        )}

        {activeTab === 'enfermeria' && (
          <InfirmaryView
            gameSave={gameSave}
            onUpdateSave={async (newSave) => {
              setGameSave(newSave);
              await saveGame(newSave);
            }}
          />
        )}

        {activeTab === 'vida_privada' && (
          <PrivateLifeView
            gameSave={gameSave}
            onUpdateSave={async (newSave) => {
              setGameSave(newSave);
              await saveGame(newSave);
            }}
          />
        )}
      </main>

      {/* Trophy Celebration Modal (Cup & League Victories with golden fanfare) */}
      <TrophyCelebrationModal
        isOpen={Boolean(celebratingTrophy)}
        data={celebratingTrophy}
        onClose={() => setCelebratingTrophy(null)}
        onViewPalmares={() => {
          setCelebratingTrophy(null);
          setActiveTab('reglamentos_palmares');
        }}
      />

      {/* Champions League Grand Final Special Announcement Screen */}
      <ChampionsFinalAnnouncementModal
        isOpen={Boolean(championsFinalAnnouncement)}
        data={championsFinalAnnouncement}
        onClose={() => setChampionsFinalAnnouncement(null)}
        onPlayFinal={() => {
          setChampionsFinalAnnouncement(null);
          setIsMatchModalOpen(true);
        }}
      />

      {/* Fixed Mobile Bottom Navigation Bar (100% Mobile Playability) */}
      <nav aria-label="Navegación móvil" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-amber-500/30 backdrop-blur-md px-1 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => { playClickSound(); setActiveTab('despacho'); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-condensed tracking-wider transition-colors ${
            activeTab === 'despacho'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>DESPACHO</span>
        </button>

        <button
          onClick={() => { playClickSound(); setActiveTab('plantilla'); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-condensed tracking-wider transition-colors ${
            activeTab === 'plantilla'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>PLANTILLA</span>
        </button>

        <button
          onClick={() => { playClickSound(); setActiveTab('competicion'); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-condensed tracking-wider transition-colors ${
            activeTab === 'competicion'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5" />
          <span>COMPETICIÓN</span>
        </button>

        <button
          onClick={() => { playClickSound(); setActiveTab('fichajes'); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-condensed tracking-wider transition-colors ${
            activeTab === 'fichajes'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span>FICHAJES</span>
        </button>

        <button
          onClick={() => { playClickSound(); setIsPcFutbolMenuOpen(true); }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-condensed tracking-wider text-amber-300 font-black bg-gradient-to-t from-amber-950/40 to-amber-900/20 border border-amber-500/40"
        >
          <Crown className="w-4 h-4 mb-0.5 text-amber-400" />
          <span>MENÚ 25</span>
        </button>
      </nav>

      {/* Live Match Engine Modal */}
      {isMatchModalOpen && (
        <LiveMatchModal
          isOpen={isMatchModalOpen}
          gameSave={gameSave}
          targetFixture={unifiedNextMatch}
          onMatchFinished={handleMatchFinished}
          onClose={() => setIsMatchModalOpen(false)}
        />
      )}

      {/* Manager Profile & Official Contract Sheet Modal */}
      {isProfileModalOpen && (
        <ManagerProfileModal
          isOpen={isProfileModalOpen}
          gameSave={gameSave}
          onClose={() => setIsProfileModalOpen(false)}
          onAcceptOffer={handleAcceptJobOffer}
          onRejectOffer={handleRejectJobOffer}
          onRenewContract={handleRenewContract}
          onResign={handleResign}
          onSimulateSack={handleSimulateSack}
          onRequestOffers={handleRequestAgentOffers}
        />
      )}

      {/* PC Fútbol 25-Section Comprehensive Menu Modal */}
      {isPcFutbolMenuOpen && (
        <PcFutbolMenuModal
          isOpen={isPcFutbolMenuOpen}
          onClose={() => setIsPcFutbolMenuOpen(false)}
          onSelectSection={handleSelectSection}
        />
      )}

      {/* Official PC Fútbol Player Profile Dossier Modal */}
      {selectedPlayerForProfile && (
        <PlayerProfileModal
          player={selectedPlayerForProfile}
          club={selectedPlayerForProfile.clubId ? gameSave.clubs[selectedPlayerForProfile.clubId] : club}
          isOpen={Boolean(selectedPlayerForProfile)}
          onClose={() => setSelectedPlayerForProfile(null)}
          onToggleTransferList={handleToggleTransferListFromProfile}
          onPromoteToFirstTeam={handlePromoteToFirstTeamFromProfile}
          onDemoteToReserve={handleDemoteToReserveFromProfile}
          onRenewPlayerContract={async (playerId, newWage, newEndYear, newClause) => {
            const pl = gameSave.players[playerId];
            if (!pl) return;
            const updatedPlayer: Player = {
              ...pl,
              contract: {
                ...pl.contract,
                wagePerWeek: newWage,
                contractEndYear: newEndYear,
                releaseClause: newClause,
              },
            };
            const updatedSave: GameSave = {
              ...gameSave,
              players: {
                ...gameSave.players,
                [playerId]: updatedPlayer,
              },
              news: [
                {
                  id: `news_renew_${playerId}_${Date.now()}`,
                  date: gameSave.currentDate,
                  title: `Acuerdo oficial: ${pl.firstName} ${pl.lastName} renueva su contrato`,
                  content: `El futbolista ha sellado su ampliación de contrato hasta el 30 de junio de ${newEndYear} percibiendo ${newWage.toLocaleString()} € semanales, con una cláusula de rescisión de ${newClause.toLocaleString()} €.`,
                  category: 'DIRECTIVA',
                  read: false,
                },
                ...(gameSave.news || []).slice(0, 30),
              ],
            };
            setGameSave(updatedSave);
            setSelectedPlayerForProfile(updatedPlayer);
            await saveGame(updatedSave);
          }}
        />
      )}

      {/* World Cup 2026 Standalone & In-Career Tournament Modal */}
      {isWorldCupModalOpen && (
        <WorldCupModeModal
          isOpen={isWorldCupModalOpen}
          onClose={() => setIsWorldCupModalOpen(false)}
          playersMap={gameSave.players}
          initialTournament={gameSave.worldCupTournament}
          onSaveTournament={async (t) => {
            const updatedSave: GameSave = { ...gameSave, worldCupTournament: t };
            setGameSave(updatedSave);
            await saveGame(updatedSave);
          }}
        />
      )}

      {/* Monthly Simulation Executive Summary Modal (BLOQUE G) */}
      {isMonthlySummaryOpen && monthlySummary && (
        <MonthlySummaryModal
          isOpen={isMonthlySummaryOpen}
          onClose={() => setIsMonthlySummaryOpen(false)}
          summary={monthlySummary}
          clubName={club?.name || 'Tu Club'}
        />
      )}

      {/* Official Contract Signing & Presentation Announcement Modal */}
      <ContractSigningModal
        isOpen={Boolean(signingModalDetails)}
        details={signingModalDetails}
        onClose={() => setSigningModalDetails(null)}
      />

      {/* Non-blocking Season Transition Overlay */}
      {isAdvancingSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-6">
          <div className="pcf-panel rounded-3xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl border-2 border-emerald-500/50">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 mx-auto flex items-center justify-center animate-spin">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white font-condensed tracking-wider uppercase">
                PROCESANDO CAMBIO DE TEMPORADA
              </h3>
              <p className="text-xs text-slate-300 font-condensed tracking-wide mt-1">
                Evolucionando plantillas, canteras internacionales, ascensos, descensos y generando el nuevo calendario oficial...
              </p>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
              <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full w-full animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
