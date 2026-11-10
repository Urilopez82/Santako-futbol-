import { WORLD_CLUBS } from '../db/worldData/clubs';
import { WORLD_COMPETITIONS } from '../db/worldData/competitions';
import { DATA_CONNECTORS } from '../db/worldData/connectors';
import { WORLD_COUNTRIES } from '../db/worldData/countries';
import { WORLD_PLAYERS } from '../db/worldData/players';
import { WORLD_STADIUMS } from '../db/worldData/stadiums';
import { WORLD_STAFF } from '../db/worldData/staff';
import { 
  CountryFederation, 
  WorldClub, 
  WorldCompetition, 
  WorldPlayer, 
  WorldStaff, 
  DetailedStadium, 
  DataSourceConnector,
  LeagueHierarchyPath,
  DivisionRegulationRules
} from '../types/worldDatabase';

export interface QualityAuditReport {
  totalCountries: number;
  totalCompetitions: number;
  totalClubs: number;
  totalPlayers: number;
  totalStadiums: number;
  totalStaff: number;
  officialPlayersCount: number;
  estimatedPlayersCount: number;
  clubsWithoutStadium: string[];
  incompleteClubs: string[];
  potentialDuplicates: string[];
  confederationBreakdown: Record<string, { countries: number; competitions: number; clubs: number }>;
}

class DataService {
  private countries: CountryFederation[] = [...WORLD_COUNTRIES];
  private competitions: WorldCompetition[] = [...WORLD_COMPETITIONS];
  private stadiums: DetailedStadium[] = [...WORLD_STADIUMS];
  private clubs: WorldClub[] = [...WORLD_CLUBS];
  private players: WorldPlayer[] = [...WORLD_PLAYERS];
  private staff: WorldStaff[] = [...WORLD_STAFF];
  private connectors: DataSourceConnector[] = [...DATA_CONNECTORS];

  // Getters
  public getCountries(): CountryFederation[] {
    return this.countries;
  }

  public getCompetitions(): WorldCompetition[] {
    return this.competitions;
  }

  public getStadiums(): DetailedStadium[] {
    return this.stadiums;
  }

  public getClubs(): WorldClub[] {
    return this.clubs;
  }

  public getPlayers(): WorldPlayer[] {
    return this.players;
  }

  public getStaff(): WorldStaff[] {
    return this.staff;
  }

  public getConnectors(): DataSourceConnector[] {
    return this.connectors;
  }

  public getClubById(id: string): WorldClub | undefined {
    return this.clubs.find((c) => c.id === id);
  }

  public getStadiumById(id: string): DetailedStadium | undefined {
    return this.stadiums.find((s) => s.id === id);
  }

  public getCompetitionById(id: string): WorldCompetition | undefined {
    return this.competitions.find((c) => c.id === id);
  }

  public getPlayersByClub(clubId: string): WorldPlayer[] {
    return this.players.filter((p) => p.currentClubId === clubId);
  }

  public getStaffByClub(clubId: string): WorldStaff[] {
    return this.staff.filter((s) => s.clubId === clubId);
  }

  public getClubsByCompetition(competitionId: string): WorldClub[] {
    return this.clubs.filter((c) => c.divisionId === competitionId);
  }

  public getHierarchyPath(competitionId: string): LeagueHierarchyPath | undefined {
    const comp = this.getCompetitionById(competitionId);
    if (!comp) return undefined;
    const country = this.countries.find((c) => c.code === comp.countryId || c.id === comp.countryId);
    
    const isSpain = comp.countryId === 'ESP';
    const isEngland = comp.countryId === 'ENG';
    const rules: DivisionRegulationRules = {
      maxSquadSize: 25,
      maxNonEuPlayers: isSpain ? 3 : isEngland ? 6 : undefined,
      homegrownMinPlayers: 4,
      varImplemented: comp.tier <= 2,
      substitutionsAllowed: 5,
      summerWindow: { start: '07-01', end: '09-01' },
      winterWindow: { start: '01-02', end: '01-31' },
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      tiebreakerMethod: isSpain ? 'PARTICULAR' : 'GOAL_DIFFERENCE',
    };

    return {
      confederationId: comp.confederation,
      confederationName: comp.confederation === 'UEFA' ? 'Unión de Federaciones Europeas de Fútbol (UEFA)' :
                         comp.confederation === 'CONMEBOL' ? 'Confederación Sudamericana de Fútbol (CONMEBOL)' :
                         comp.confederation === 'CONCACAF' ? 'Confederación de Norte, Centroamérica y el Caribe (CONCACAF)' :
                         comp.confederation === 'CAF' ? 'Confederación Africana de Fútbol (CAF)' :
                         comp.confederation === 'AFC' ? 'Confederación Asiática de Fútbol (AFC)' : 'Confederación de Oceanía (OFC)',
      countryId: country?.code || comp.countryId || 'ESP',
      countryName: country?.name || 'Internacional',
      countryFlag: country?.flag || '🌐',
      competitionId: comp.id,
      competitionName: comp.name,
      competitionShortName: comp.shortName,
      divisionTier: comp.tier,
      divisionFormat: comp.formatDescription,
      relegationSlots: comp.relegationSlots,
      promotionSlots: comp.promotionSlots,
      playoffSlots: comp.playoffSlots,
      rules,
    };
  }

  // Quality Control Audit
  public generateQualityReport(): QualityAuditReport {
    const stadiumIds = new Set(this.stadiums.map((s) => s.id));
    const clubsWithoutStadium: string[] = [];
    const incompleteClubs: string[] = [];
    const confederationBreakdown: Record<string, { countries: number; competitions: number; clubs: number }> = {
      UEFA: { countries: 0, competitions: 0, clubs: 0 },
      CONMEBOL: { countries: 0, competitions: 0, clubs: 0 },
      CONCACAF: { countries: 0, competitions: 0, clubs: 0 },
      CAF: { countries: 0, competitions: 0, clubs: 0 },
      AFC: { countries: 0, competitions: 0, clubs: 0 },
      OFC: { countries: 0, competitions: 0, clubs: 0 },
    };

    // Country counts
    this.countries.forEach((country) => {
      if (confederationBreakdown[country.confederation]) {
        confederationBreakdown[country.confederation].countries++;
      }
    });

    // Competition counts
    this.competitions.forEach((comp) => {
      if (confederationBreakdown[comp.confederation]) {
        confederationBreakdown[comp.confederation].competitions++;
      }
    });

    // Club checks
    this.clubs.forEach((club) => {
      const country = this.countries.find((c) => c.id === club.countryId);
      if (country && confederationBreakdown[country.confederation]) {
        confederationBreakdown[country.confederation].clubs++;
      }

      if (!stadiumIds.has(club.stadiumId)) {
        clubsWithoutStadium.push(club.name);
      }

      const squad = this.getPlayersByClub(club.id);
      if (squad.length < 3) {
        incompleteClubs.push(`${club.name} (${squad.length} jugadores documentados)`);
      }
    });

    // Duplicate check on players by name + birthdate
    const seenPlayers = new Set<string>();
    const potentialDuplicates: string[] = [];
    this.players.forEach((p) => {
      const key = `${p.fullName.toLowerCase()}_${p.birthDate}`;
      if (seenPlayers.has(key)) {
        potentialDuplicates.push(p.fullName);
      } else {
        seenPlayers.add(key);
      }
    });

    const officialPlayersCount = this.players.filter((p) => p.isOfficialSource && !p.isMotorEstimate).length;
    const estimatedPlayersCount = this.players.filter((p) => p.isMotorEstimate).length;

    return {
      totalCountries: this.countries.length,
      totalCompetitions: this.competitions.length,
      totalClubs: this.clubs.length,
      totalPlayers: this.players.length,
      totalStadiums: this.stadiums.length,
      totalStaff: this.staff.length,
      officialPlayersCount,
      estimatedPlayersCount,
      clubsWithoutStadium,
      incompleteClubs,
      potentialDuplicates,
      confederationBreakdown,
    };
  }

  // Import JSON batch
  public importFromJson(jsonString: string): { importedCount: number; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      let count = 0;

      if (Array.isArray(parsed.players)) {
        parsed.players.forEach((newP: WorldPlayer) => {
          const idx = this.players.findIndex((p) => p.id === newP.id);
          if (idx !== -1) {
            this.players[idx] = newP;
          } else {
            this.players.push(newP);
          }
          count++;
        });
      }

      if (Array.isArray(parsed.clubs)) {
        parsed.clubs.forEach((newC: WorldClub) => {
          const idx = this.clubs.findIndex((c) => c.id === newC.id);
          if (idx !== -1) {
            this.clubs[idx] = newC;
          } else {
            this.clubs.push(newC);
          }
          count++;
        });
      }

      return { importedCount: count, message: `Se importaron/actualizaron ${count} registros con éxito.` };
    } catch (err: any) {
      throw new Error(`Error en el formato JSON: ${err.message}`);
    }
  }

  // Import CSV batch for players
  public importPlayersFromCsv(csvText: string): { importedCount: number; message: string } {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('El archivo CSV debe contener una cabecera y al menos una fila de datos.');
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length < 4) continue;

      const id = values[0] || `wp_import_${Date.now()}_${count}`;
      const fullName = values[1];
      const pos = values[2] || 'DC';
      const age = parseInt(values[3], 10) || 24;
      const clubId = values[4] || null;

      const player: WorldPlayer = {
        id,
        fullName,
        birthDate: `${2026 - age}-06-01`,
        age,
        nationalityId: 'ESP',
        heightCm: 180,
        preferredFoot: 'Derecho',
        primaryPosition: pos,
        secondaryPositions: [],
        currentClubId: clubId,
        squadNumber: 15,
        currentAbility: 65,
        potentialAbility: 70,
        contract: {
          wagePerWeek: 600,
          contractEndYear: 2028,
          releaseClause: 150000,
          status: 'Primer Equipo',
        },
        marketValue: 120000,
        fitness: 100,
        isInjured: false,
        internationalCaps: 0,
        internationalGoals: 0,
        previousClubs: [],
        attributes: {
          velocidad: 65,
          aceleracion: 65,
          resistencia: 65,
          fuerza: 65,
          salto: 65,
          agilidad: 65,
          tecnica: 65,
          controlBalon: 65,
          paseCorto: 65,
          paseLargo: 65,
          centros: 60,
          regate: 65,
          remate: 65,
          potenciaDisparo: 65,
          juegoAereo: 65,
          tiroFaltas: 55,
          penaltis: 60,
          vision: 65,
          creatividad: 65,
          decisiones: 65,
          colocacion: 65,
          marcaje: 55,
          entradas: 55,
          anticipacion: 65,
          liderazgo: 60,
          concentracion: 65,
          trabajoEquipo: 70,
          agresividad: 60,
          compostura: 65,
        },
        isOfficialSource: false,
        sourceName: 'Importación CSV Usuario',
        isMotorEstimate: true,
        lastUpdated: new Date().toISOString().slice(0, 10),
      };

      const existingIdx = this.players.findIndex((p) => p.id === id);
      if (existingIdx !== -1) {
        this.players[existingIdx] = player;
      } else {
        this.players.push(player);
      }
      count++;
    }

    return { importedCount: count, message: `Se procesaron e importaron ${count} futbolistas correctamente.` };
  }

  // Export full database
  public exportFullDatabaseAsJson(): string {
    return JSON.stringify(
      {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        countries: this.countries,
        competitions: this.competitions,
        stadiums: this.stadiums,
        clubs: this.clubs,
        players: this.players,
        staff: this.staff,
        connectors: this.connectors,
      },
      null,
      2
    );
  }
}

export const dataService = new DataService();
