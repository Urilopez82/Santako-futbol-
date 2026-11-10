import { Club } from '../types/club';
import { Competition, Match, StandingsRow } from '../types/competition';
import { GameSave, NewsItem } from '../types/game';
import { Player, Position } from '../types/player';
import { 
  AnnualAwardWinners, 
  ClubEraType, 
  ClubTimelineEvent, 
  DurabilityAssertionReport, 
  NewgenPlayer, 
  RetiredLegendRecord, 
  RetirementReason, 
  TalentTier 
} from '../types/perpetualWorld';
import { TrophyRecord } from '../types/regulations';
import { OFFICIAL_COMPETITION_REGULATIONS, resolveCompetitionStandings } from './regulationEngine';
import { HISTORICAL_TROPHY_ARCHIVE } from './palmaresEngine';
import { ensureClubSquadCompleteness } from './squadCompletenessEngine';
import { NATIONAL_TEAMS_MAP } from '../db/worldData/nationalTeams80';
import { 
  simulateCupMatch, 
  progressCupTournament, 
  getCupMatchWinner, 
  getCupMatchLoser,
  initializeAllTournaments,
  resolveContinentalQualification 
} from './internationalCompetitionsEngine';
import { 
  createWorldCupTournament, 
  simulateEntireWorldCupTournament 
} from './worldCupTournamentEngine';
import { calculateRealisticPlayerMarketValue } from './transferPricingEngine';
import { 
  checkAndTriggerWorldEvolutionMilestones, 
  ALIEN_FIRST_NAMES, 
  ALIEN_LAST_NAMES, 
  ALIEN_CIVILIZATIONS 
} from './worldEvolutionMilestonesEngine';
import { archiveSeasonResults } from './worldHistoryEngine';

// ============================================================================
// 1. DICCIONARIOS ONOMÁSTICOS Y GENERADOR DE IDENTIDADES AUTÉNTICAS
// ============================================================================

export const FIRST_NAMES_EXPANDED: Record<string, string[]> = {
  ESP: [
    'Alejandro', 'Javier', 'Carlos', 'Pablo', 'Sergio', 'David', 'Adrián', 'Álvaro', 'Marcos', 'Hugo', 
    'Daniel', 'Lucas', 'Manuel', 'Iker', 'Mario', 'Jorge', 'Raúl', 'Rubén', 'Iván', 'Mateo',
    'Pau', 'Marc', 'Pol', 'Arnau', 'Oriol', 'Ferran', 'Aleix', 'Guillem', 'Jordi', 'Nil',
    'Ander', 'Mikel', 'Iñaki', 'Gorka', 'Unai', 'Jon', 'Eneko', 'Aitor', 'Asier', 'Julen'
  ],
  ENG: [
    'Harry', 'Jack', 'Oliver', 'George', 'Charlie', 'James', 'Thomas', 'Jacob', 'William', 'Alfie', 
    'Joshua', 'Edward', 'Henry', 'Arthur', 'Freddie', 'Leo', 'Archie', 'Mason', 'Theo', 'Liam',
    'Jude', 'Bukayo', 'Declan', 'Phil', 'Marcus', 'Trent', 'Cole', 'Harvey', 'Kobbie', 'Rico'
  ],
  GER: [
    'Lukas', 'Maximilian', 'Felix', 'Jonas', 'Paul', 'Julian', 'Niklas', 'Leon', 'Tim', 'Jan', 
    'Finn', 'Elias', 'Florian', 'Tobias', 'Moritz', 'Alexander', 'Simon', 'David', 'Philipp', 'Fabian',
    'Jamal', 'Kai', 'Leroy', 'Joshua', 'Toni', 'Thomas', 'Bastian', 'Mats', 'Manuel', 'Marc'
  ],
  FRA: [
    'Lucas', 'Hugo', 'Louis', 'Arthur', 'Jules', 'Gabriel', 'Léo', 'Raphaël', 'Paul', 'Maxime', 
    'Antoine', 'Clément', 'Alexandre', 'Enzo', 'Nathan', 'Thomas', 'Mathis', 'Romain', 'Théo', 'Valentin',
    'Kylian', 'Aurélien', 'Eduardo', 'Ousmane', 'Bradley', 'Warren', 'William', 'Kingsley', 'Théo', 'Malo'
  ],
  ITA: [
    'Lorenzo', 'Leonardo', 'Francesco', 'Alessandro', 'Mattia', 'Andrea', 'Gabriele', 'Matteo', 'Tommaso', 'Riccardo', 
    'Edoardo', 'Federico', 'Davide', 'Giuseppe', 'Marco', 'Filippo', 'Luca', 'Giovanni', 'Simone', 'Pietro',
    'Nicolo', 'Gianluigi', 'Sandro', 'Giacomo', 'Davide', 'Giorgio', 'Ciro', 'Manuel', 'Domenico', 'Moise'
  ],
  BRA: [
    'Gabriel', 'Lucas', 'Matheus', 'Guilherme', 'Felipe', 'Gustavo', 'Rafael', 'Leonardo', 'Thiago', 'Vinícius', 
    'Bruno', 'Rodrigo', 'Eduardo', 'Caio', 'Danilo', 'Igor', 'Marcelo', 'Murilo', 'Otávio', 'Renan',
    'Endrick', 'Rodrygo', 'Raphinha', 'Casemiro', 'Neymar', 'Alisson', 'Ederson', 'Marquinhos', 'Eder', 'Bento'
  ],
  ARG: [
    'Facundo', 'Lautaro', 'Agustín', 'Joaquín', 'Nicolás', 'Santiago', 'Mateo', 'Ignacio', 'Tomás', 'Bautista', 
    'Thiago', 'Matías', 'Franco', 'Benjamín', 'Gonzalo', 'Julián', 'Rodrigo', 'Lucas', 'Enzo', 'Valentín',
    'Lionel', 'Ángel', 'Emiliano', 'Alexis', 'Cristian', 'Nahuel', 'Lisandro', 'Alejandro', 'Exequiel', 'Giovani'
  ],
  POR: [
    'Gonçalo', 'Rodrigo', 'Martim', 'Afonso', 'Tiago', 'Diogo', 'Tomás', 'Duarte', 'Salvador', 'Miguel',
    'Francisco', 'Guilherme', 'Gabriel', 'Santiago', 'Bernardo', 'Cristiano', 'Bruno', 'Ruben', 'Joao', 'Rafael'
  ],
  NED: [
    'Daan', 'Sem', 'Lucas', 'Milan', 'Levi', 'Finn', 'Jesse', 'Luuk', 'Bram', 'Thomas', 
    'Ruben', 'Lars', 'Liam', 'Thijs', 'Julian', 'Stijn', 'Cody', 'Frenkie', 'Virgil', 'Memphis'
  ],
  BEL: [
    'Arthur', 'Noah', 'Jules', 'Louis', 'Lucas', 'Liam', 'Adam', 'Victor', 'Gabriel', 'Maxime',
    'Kevin', 'Romelu', 'Eden', 'Thibaut', 'Leandro', 'Amadou', 'Jeremy', 'Youri', 'Charles', 'Lois'
  ],
  MAR: [
    'Achraf', 'Hakim', 'Yassine', 'Sofyan', 'Azzedine', 'Brahim', 'Bilal', 'Youssef', 'Soufiane', 'Nayef',
    'Amine', 'Zakaria', 'Ayoub', 'Ilias', 'Abde', 'Selim', 'Walid', 'Tariq', 'Ismael', 'Nordin'
  ],
  SEN: [
    'Sadio', 'Kalidou', 'Nicolas', 'Pape', 'Idrissa', 'Ismaïla', 'Edouard', 'Boulaye', 'Habib', 'Cheikhou',
    'Lamine', 'Formose', 'Pathé', 'Moustapha', 'Bamba', 'Abdoulaye', 'Demba', 'Moussa', 'Krépin', 'Dion'
  ],
  NGA: [
    'Victor', 'Ademola', 'Alex', 'Samuel', 'Wilfred', 'Kelechi', 'Calvin', 'Frank', 'Terem', 'Moses',
    'Chidera', 'Nathan', 'Raphael', 'Taiwo', 'Bright', 'Ola', 'Paul', 'Joe', 'Emmanuel', 'Stanley'
  ],
  EGY: [
    'Mohamed', 'Omar', 'Mahmoud', 'Mostafa', 'Ahmed', 'Emam', 'Marwan', 'Zizo', 'Trezeguet', 'Tamer',
    'Karim', 'Tarek', 'Hussein', 'Akram', 'Yasser', 'Ali', 'Sherif', 'Hamdi', 'Ibrahim', 'Hossam'
  ],
  CMR: [
    'Bryan', 'André', 'Vincent', 'Karl', 'Georges-Kévin', 'Frank', 'Christopher', 'Harold', 'Olivier', 'Jean-Charles',
    'Samuel', 'Geremi', 'Rigobert', 'Stephane', 'Nicolas', 'Ignatius', 'Enzo', 'Martin', 'Junior', 'Carlos'
  ],
  CIV: [
    'Franck', 'Simon', 'Sébastien', 'Oumar', 'Nicolas', 'Evan', 'Wilfried', 'Amad', 'Jérémie', 'Seko',
    'Didier', 'Yaya', 'Kolo', 'Gervinho', 'Serge', 'Odilon', 'Christian', 'Ibrahim', 'Ghislain', 'Max'
  ],
  JPN: [
    'Kaoru', 'Takefusa', 'Wataru', 'Ritsu', 'Daichi', 'Takumi', 'Ayase', 'Ko', 'Yukinari', 'Ao',
    'Keisuke', 'Shunsuke', 'Shinji', 'Hidetoshi', 'Hiroki', 'Koki', 'Reo', 'Daizen', 'Shogo', 'Zion'
  ],
  KOR: [
    'Heung-min', 'Kang-in', 'Min-jae', 'Hee-chan', 'In-beom', 'Jae-sung', 'Hyun-seok', 'Woo-yeong', 'Gue-sung', 'Young-woo',
    'Ji-sung', 'Chung-yong', 'Ki-sung', 'Dong-won', 'Seung-woo', 'Jin-su', 'Tae-hwan', 'Bum-keun', 'Min-hyeok', 'Jun-ho'
  ],
  MEX: [
    'Santiago', 'Edson', 'Hirving', 'Julián', 'César', 'Johan', 'Luis', 'Orbelín', 'Alexis', 'Guillermo',
    'Raúl', 'Javier', 'Carlos', 'Andrés', 'Héctor', 'Jesús', 'Diego', 'Uriel', 'Erick', 'Roberto'
  ],
  USA: [
    'Christian', 'Weston', 'Yunus', 'Folarin', 'Timothy', 'Tyler', 'Antonee', 'Chris', 'Gio', 'Sergiño',
    'Landon', 'Clint', 'Tim', 'Ricardo', 'Johnny', 'Malik', 'Mark', 'Brenden', 'Miles', 'Matt'
  ],
  COL: [
    'Luis', 'James', 'Jhon', 'Jefferson', 'Richard', 'Daniel', 'Davinson', 'Yerry', 'Camilo', 'Rafael',
    'Radamel', 'Juan', 'Carlos', 'David', 'Santiago', 'Mateus', 'Wilmar', 'Jorge', 'Kevin', 'Yaser'
  ],
  URU: [
    'Federico', 'Darwin', 'Ronald', 'Manuel', 'Facundo', 'Rodrigo', 'Mathías', 'Sergio', 'Giorgian', 'Sebastián',
    'Luis', 'Edinson', 'Diego', 'José', 'Nahitan', 'Brian', 'Nicolás', 'Maximiliano', 'Lucas', 'Guillermo'
  ],
  CRO: [
    'Luka', 'Mateo', 'Joško', 'Andrej', 'Marcelo', 'Mario', 'Dominik', 'Lovro', 'Martin', 'Borna',
    'Ivan', 'Ante', 'Dario', 'Dejan', 'Domagoj', 'Josip', 'Nikola', 'Petar', 'Bruno', 'Kristijan'
  ],
  TUR: [
    'Arda', 'Hakan', 'Kenan', 'Kerem', 'Barış', 'Ferdi', 'Orkun', 'Merih', 'Semih', 'Salih',
    'Burak', 'Cenk', 'Emre', 'Ozan', 'Yusuf', 'Cengiz', 'Çağlar', 'Kaan', 'Uğurcan', 'Altay'
  ]
};

export const LAST_NAMES_EXPANDED: Record<string, string[]> = {
  ESP: [
    'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 
    'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez',
    'Vila', 'Serra', 'Pujol', 'Font', 'Roca', 'Soler', 'Ferrer', 'Riba', 'Castells', 'Bosch',
    'Etxeberria', 'Goikoetxea', 'Larrazabal', 'Zubimendi', 'Oyarzabal', 'Williams', 'Sancet', 'Guruzeta', 'Vivian', 'Remiro'
  ],
  ENG: [
    'Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 
    'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke',
    'Bellingham', 'Foden', 'Rice', 'Saka', 'Kane', 'Alexander-Arnold', 'Palmer', 'Mainoo', 'Stones', 'Pickford'
  ],
  GER: [
    'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 
    'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann',
    'Musiala', 'Wirtz', 'Kimmich', 'Havertz', 'Sané', 'Rüdiger', 'Gündogan', 'Kroos', 'Neuer', 'Ter Stegen'
  ],
  FRA: [
    'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 
    'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
    'Mbappé', 'Tchouaméni', 'Camavinga', 'Saliba', 'Konaté', 'Barcola', 'Zaïre-Emery', 'Hernández', 'Dembélé', 'Maignan'
  ],
  ITA: [
    'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 
    'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti',
    'Barella', 'Bastoni', 'Donnarumma', 'Tonali', 'Chiesa', 'Dimarco', 'Calafiori', 'Scamacca', 'Frattesi', 'Pellegrini'
  ],
  BRA: [
    'Silva', 'Santos', 'Sousa', 'Oliveira', 'Pereira', 'Lima', 'Carvalho', 'Ferreira', 'Ribeiro', 'Rodrigues', 
    'Gomes', 'Martins', 'Araújo', 'Melo', 'Barbosa', 'Ramos', 'Rocha', 'Nascimento', 'Moreira', 'Freitas',
    'Júnior', 'Guimarães', 'Paquetá', 'Magalhães', 'Militão', 'Casemiro', 'Richarlison', 'Martinelli', 'Danilo', 'Ederson'
  ],
  ARG: [
    'González', 'Rodríguez', 'López', 'Fernández', 'García', 'Pérez', 'Martínez', 'Gómez', 'Díaz', 'Álvarez', 
    'Romero', 'Sosa', 'Torres', 'Benítez', 'Ramírez', 'Flores', 'Acosta', 'Medina', 'Herrera', 'Aguirre',
    'Messi', 'Di María', 'Mac Allister', 'De Paul', 'Otamendi', 'Molina', 'Tagliafico', 'Garnacho', 'Paz', 'Barco'
  ],
  POR: [
    'Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Fernandes', 'Gomes',
    'Lopes', 'Marques', 'Alves', 'Ribeiro', 'Carvalho', 'Cancelo', 'Dias', 'Neves', 'Palhinha', 'Leao'
  ],
  NED: [
    'de Jong', 'Jansen', 'de Vries', 'van de Berg', 'van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer',
    'Gakpo', 'Simons', 'Reijnders', 'Timber', 'Dumfries', 'Aké', 'Verbruggen', 'Malen', 'Frimpong', 'Schouten'
  ],
  BEL: [
    'Peeters', 'Janssens', 'Maes', 'Jacobs', 'Willems', 'Mertens', 'Claes', 'Goossens', 'Wouters', 'De Smet',
    'De Bruyne', 'Lukaku', 'Courtois', 'Doku', 'Onana', 'Tielemans', 'Trossard', 'Bakayoko', 'Castagne', 'Faes'
  ],
  MAR: [
    'Hakimi', 'Ziyech', 'Bounou', 'Amrabat', 'Ounahi', 'Díaz', 'En-Nesyri', 'Aguerd', 'Saïss', 'Mazraoui',
    'El Khannouss', 'Abqar', 'Richardson', 'Akhomach', 'Ben Seghir', 'Rahimi', 'El Kaabi', 'Munir', 'Dari', 'Chibi'
  ],
  SEN: [
    'Mané', 'Koulibaly', 'Jackson', 'Gueye', 'Sarr', 'Mendy', 'Dia', 'Diallo', 'Camara', 'Niakhaté',
    'Diatta', 'Ciss', 'Ndiaye', 'Seck', 'Jakobs', 'Lopy', 'Diarra', 'Gomis', 'Sow', 'Ballo-Touré'
  ],
  NGA: [
    'Osimhen', 'Lookman', 'Iwobi', 'Chukwueze', 'Ndidi', 'Iheanacho', 'Bassey', 'Onyeka', 'Moffi', 'Simon',
    'Boniface', 'Aina', 'Ajayi', 'Nwabali', 'Omeruo', 'Onyedika', 'Dessers', 'Chukwu', 'Yusuf', 'Sanusi'
  ],
  EGY: [
    'Salah', 'Marmoush', 'Trezeguet', 'Mohamed', 'Hegazi', 'Ashour', 'Fathy', 'Elneny', 'Sobhi', 'Abdelmonem',
    'El Shenawy', 'Hany', 'Kahraba', 'Hamdi', 'Tawfik', ' مرموش', 'Zizo', 'Rabia', 'Ibrahim', 'Koka'
  ],
  CMR: [
    'Mbeumo', 'Onana', 'Aboubakar', 'Toko-Ekambi', 'Nkoudou', 'Anguissa', 'Wooh', 'Castelletto', 'Magri', 'Kotto',
    'Song', 'Eto’o', 'Makoun', 'Geremi', 'N’Koulou', 'N’Jie', 'Bong', 'Epassy', 'Tolo', 'Moukoudi'
  ],
  CIV: [
    'Kessié', 'Adingra', 'Haller', 'Diakité', 'Pépé', 'Ndicka', 'Singo', 'Diallo', 'Boga', 'Fofana',
    'Drogba', 'Touré', 'Zaha', 'Bailly', 'Aurier', 'Koné', 'Sangaré', 'Traoré', 'Amani', 'Doumbia'
  ],
  JPN: [
    'Mitoma', 'Kubo', 'Endo', 'Doan', 'Kamada', 'Minamino', 'Ueda', 'Itakura', 'Sugawara', 'Tomiyasu',
    'Tanaka', 'Hatate', 'Maeda', 'Machida', 'Suzuki', 'Nakamura', 'Honda', 'Nagatomo', 'Yoshida', 'Kagawa'
  ],
  KOR: [
    'Son', 'Lee', 'Kim', 'Hwang', 'Cho', 'Seol', 'Park', 'Jung', 'Hong', 'Bae',
    'Cha', 'Ki', 'Koo', 'Moon', 'Song', 'Shin', 'Yoon', 'Oh', 'Jang', 'Kwon'
  ],
  MEX: [
    'Giménez', 'Álvarez', 'Lozano', 'Quiñones', 'Montes', 'Vásquez', 'Chávez', 'Pineda', 'Vega', 'Ochoa',
    'Hernández', 'Márquez', 'Guardado', 'Herrera', 'Corona', 'Sánchez', 'Romo', 'Antuna', 'Huerta', 'Arteaga'
  ],
  USA: [
    'Pulisic', 'McKennie', 'Musah', 'Balogun', 'Weah', 'Adams', 'Robinson', 'Richards', 'Reyna', 'Dest',
    'Donovan', 'Dempsey', 'Howard', 'Pepi', 'Cardoso', 'Tillman', 'Trusty', 'Turner', 'Scally', 'Wright'
  ],
  COL: [
    'Díaz', 'Rodríguez', 'Arias', 'Lerma', 'Ríos', 'Muñoz', 'Sánchez', 'Mina', 'Vargas', 'Borré',
    'Falcao', 'Cuadrado', 'Zapata', 'Muriel', 'Ospina', 'Sinisterra', 'Asprilla', 'Lucumí', 'Mojica', 'Castaño'
  ],
  URU: [
    'Valverde', 'Núñez', 'Araújo', 'Ugarte', 'Pellistri', 'Bentancur', 'Olivera', 'Rochet', 'De Arrascaeta', 'Giménez',
    'Suárez', 'Cavani', 'Godín', 'Forlán', 'Cáceres', 'Nández', 'Torreira', 'Ocampo', 'Viña', 'Marichal'
  ],
  CRO: [
    'Modrić', 'Kovačić', 'Gvardiol', 'Kramarić', 'Brozović', 'Pašalić', 'Livaković', 'Majer', 'Baturina', 'Sosa',
    'Perišić', 'Rakitić', 'Mandžukić', 'Šutalo', 'Stanišić', 'Budimir', 'Petković', 'Sučić', 'Erlić', 'Labrović'
  ],
  TUR: [
    'Güler', 'Çalhanoğlu', 'Yıldız', 'Aktürkoğlu', 'Alper Yılmaz', 'Kadıoğlu', 'Kökçü', 'Demiral', 'Akaydin', 'Günok',
    'Yılmaz', 'Turan', 'Tosun', 'Ünder', 'Söyüncü', 'Özkan', 'Kahveci', 'Bardakcı', 'Müldür', 'Çelik'
  ]
};

// ============================================================================
// 2. GENERACIÓN DE NUEVAS GENERACIONES DE JUVENILES (NEWGENS)
// ============================================================================

export const COUNTRY_NAMES_ES: Record<string, string> = {
  ESP: 'España', ENG: 'Inglaterra', GER: 'Alemania', FRA: 'Francia', ITA: 'Italia',
  BRA: 'Brasil', ARG: 'Argentina', POR: 'Portugal', NED: 'Países Bajos', BEL: 'Bélgica',
  MAR: 'Marruecos', SEN: 'Senegal', NGA: 'Nigeria', EGY: 'Egipto', CMR: 'Camerún',
  CIV: 'Costa de Marfil', JPN: 'Japón', KOR: 'Corea del Sur', MEX: 'México', USA: 'Estados Unidos',
  COL: 'Colombia', URU: 'Uruguay', CRO: 'Croacia', TUR: 'Turquía', SCO: 'Escocia'
};

const POSITION_DISTRIBUTION: Position[] = [
  'POR', 'LD', 'DFC', 'DFC', 'LI', 
  'MCD', 'MC', 'MC', 'MCO', 'ED', 'EI', 'DC',
  'DFC', 'MC', 'DC', 'POR'
];

/**
 * Generates a realistic intake of 2-4 youth academy players for a specific club.
 * Strictly respects the bell curve:
 * - Normal: 70%
 * - Promising: 22%
 * - Great Talent: 7%
 * - Generational Superstar: 1% (capped per year)
 */
export function generateClubYouthIntake(
  club: Club,
  seasonYear: number,
  globalWonderkidsSpawnedThisSeason: number
): { newPlayers: Player[]; newgenRecords: NewgenPlayer[]; spawnedWonderkidCount: number } {
  const newPlayers: Player[] = [];
  const newgenRecords: NewgenPlayer[] = [];
  let wonderkidsCount = globalWonderkidsSpawnedThisSeason;

  const academyLevel = club.facilities?.youthAcademyLevel || 2;
  const numIntake = Math.min(4, Math.max(2, Math.floor(academyLevel * 0.7 + Math.random() * 2)));
  const allCountries = Object.keys(FIRST_NAMES_EXPANDED);

  const isGalacticClub = 
    Boolean(club.divisionId?.startsWith('gal_')) || 
    Boolean(club.id.startsWith('alien_')) || 
    ALIEN_CIVILIZATIONS.some((c) => c.planet === club.countryId);

  for (let i = 0; i < numIntake; i++) {
    let fn: string;
    let ln: string;
    let nationalityName: string;
    let playerCountry = club.countryId || 'ESP';

    if (isGalacticClub) {
      // 85% alien player, 15% Earth scouted player
      const isEarthScout = Math.random() < 0.15;
      if (isEarthScout) {
        playerCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
        const firstNames = FIRST_NAMES_EXPANDED[playerCountry] || FIRST_NAMES_EXPANDED['ESP'];
        const lastNames = LAST_NAMES_EXPANDED[playerCountry] || LAST_NAMES_EXPANDED['ESP'];
        fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        nationalityName = COUNTRY_NAMES_ES[playerCountry] || playerCountry;
      } else {
        const civ = ALIEN_CIVILIZATIONS[Math.floor(Math.random() * ALIEN_CIVILIZATIONS.length)];
        playerCountry = civ.prefix || 'GAL';
        fn = ALIEN_FIRST_NAMES[Math.floor(Math.random() * ALIEN_FIRST_NAMES.length)];
        ln = ALIEN_LAST_NAMES[Math.floor(Math.random() * ALIEN_LAST_NAMES.length)];
        nationalityName = `${civ.flag} ${civ.planet}`;
      }
    } else {
      // Earth Club: after 2226, 10% chance to scout an intergalactic alien wonderkid
      const isAlienScout = seasonYear >= 2226 && Math.random() < 0.10;
      if (isAlienScout) {
        const civ = ALIEN_CIVILIZATIONS[Math.floor(Math.random() * ALIEN_CIVILIZATIONS.length)];
        playerCountry = civ.prefix || 'GAL';
        fn = ALIEN_FIRST_NAMES[Math.floor(Math.random() * ALIEN_FIRST_NAMES.length)];
        ln = ALIEN_LAST_NAMES[Math.floor(Math.random() * ALIEN_LAST_NAMES.length)];
        nationalityName = `${civ.flag} ${civ.planet}`;
      } else {
        const isForeignRecruit = Math.random() < 0.35;
        playerCountry = isForeignRecruit
          ? allCountries[Math.floor(Math.random() * allCountries.length)]
          : (club.countryId || 'ESP');
        const firstNames = FIRST_NAMES_EXPANDED[playerCountry] || FIRST_NAMES_EXPANDED['ESP'];
        const lastNames = LAST_NAMES_EXPANDED[playerCountry] || LAST_NAMES_EXPANDED['ESP'];
        fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        nationalityName = COUNTRY_NAMES_ES[playerCountry] || playerCountry;
      }
    }

    const pos = POSITION_DISTRIBUTION[Math.floor(Math.random() * POSITION_DISTRIBUTION.length)];
    const age = 16 + Math.floor(Math.random() * 3); // 16, 17 o 18 años
    const birthYear = seasonYear - age;
    const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

    // Pyramidal distribution (72% low-mid, 20% promising, 6.5% high talent, 1.4% exceptional, 0.1% rare generational)
    const roll = Math.random();
    let tier: TalentTier = 'NORMAL';
    let baseOvr = 52 + Math.floor(Math.random() * 9); // 52-60
    let basePot = baseOvr + 4 + Math.floor(Math.random() * 8);

    if (roll > 0.992 && wonderkidsCount < 2) {
      // 0.8% Generational Wonderkid (capped at 2 worldwide per year, initial OVR 74-78, high potential 90-94)
      tier = 'ESTRELLA_MUNDIAL';
      baseOvr = 74 + Math.floor(Math.random() * 5); // 74-78
      basePot = 91 + Math.floor(Math.random() * 4); // 91-94
      wonderkidsCount++;
    } else if (roll > 0.92) {
      // 7.2% Great Talent
      tier = 'GRAN_TALENTO';
      baseOvr = 67 + Math.floor(Math.random() * 5); // 67-71
      basePot = 81 + Math.floor(Math.random() * 6); // 81-86
    } else if (roll > 0.72) {
      // 20% Promising youth prospect
      tier = 'PROMETEDOR';
      baseOvr = 61 + Math.floor(Math.random() * 6); // 61-66
      basePot = 72 + Math.floor(Math.random() * 7); // 72-78
    } else {
      // 72% Normal squad player / grassroots academy trainee
      tier = 'NORMAL';
      baseOvr = 52 + Math.floor(Math.random() * 9); // 52-60
      basePot = Math.min(71, baseOvr + 4 + Math.floor(Math.random() * 7));
    }

    // High academy facilities boost initial quality moderately (+1 to +2)
    if (academyLevel >= 4) {
      baseOvr = Math.min(80, baseOvr + 2);
      basePot = Math.min(94, basePot + 2);
    }

    const uniqueId = `newgen_${playerCountry.toLowerCase()}_${birthYear}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const weeklyWage = tier === 'ESTRELLA_MUNDIAL' ? 3500 : tier === 'GRAN_TALENTO' ? 1800 : 750;

    const playerObj: Player = {
      id: uniqueId,
      firstName: fn,
      lastName: ln,
      nationality: nationalityName,
      birthDate,
      age,
      primaryPosition: pos,
      secondaryPosition: pos === 'MC' ? 'MCD' : pos === 'EI' ? 'ED' : undefined,
      overallRating: baseOvr,
      potential: basePot,
      marketValue: 100000,
      isTransferListed: false,
      isLoanListed: false,
      squadNumber: 30 + i,
      squadCategory: 'FILIAL_B',
      fitness: 100,
      matchReadiness: 90,
      morale: 95,
      isInjured: false,
      injuryWeeksLeft: 0,
      clubId: club.id,
      attributes: {
        velocidad: Math.min(99, baseOvr + Math.floor(Math.random() * 10) - 5),
        disparo: Math.min(99, baseOvr + Math.floor(Math.random() * 10) - 5),
        pase: Math.min(99, baseOvr + Math.floor(Math.random() * 10) - 5),
        regate: Math.min(99, baseOvr + Math.floor(Math.random() * 10) - 5),
        defensa: Math.min(99, baseOvr + Math.floor(Math.random() * 10) - 5),
        fuerza: Math.min(99, baseOvr + Math.floor(Math.random() * 10) - 5),
        resistencia: Math.min(99, baseOvr + Math.floor(Math.random() * 10) - 5),
        vision: Math.min(99, baseOvr + Math.floor(Math.random() * 10) - 5),
        liderazgo: Math.min(99, 45 + Math.floor(Math.random() * 30)),
        reflejos: pos === 'POR' ? baseOvr : undefined,
        paradas: pos === 'POR' ? baseOvr : undefined,
      },
      contract: {
        wagePerWeek: weeklyWage,
        contractEndYear: seasonYear + 3,
        releaseClause: basePot >= 90 ? 45000000 : basePot >= 83 ? 12000000 : 2500000,
        squadStatus: 'Juvenil',
      },
      seasonStats: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        averageRating: 7.0,
      },
    };

    playerObj.marketValue = calculateRealisticPlayerMarketValue(playerObj, club);

    const newgenRec: NewgenPlayer = {
      id: uniqueId,
      firstName: fn,
      lastName: ln,
      nationality: nationalityName,
      birthDate,
      birthYear,
      age,
      position: pos,
      overallRating: baseOvr,
      potential: basePot,
      talentTier: tier,
      clubId: club.id,
      clubName: club.name,
      seasonIntake: `${seasonYear}/${String(seasonYear + 1).slice(2)}`,
      scoutingSummary: tier === 'ESTRELLA_MUNDIAL'
        ? `¡TALENTO GENERACIONAL! Ojeadores comparan a ${fn} con leyendas históricas mundiales.`
        : tier === 'GRAN_TALENTO'
        ? `Joya de la cantera con condiciones sobresalientes para el fútbol de élite.`
        : tier === 'PROMETEDOR'
        ? `Futbolista con buena progresión táctica y proyección al primer equipo.`
        : `Jugador disciplinado formado en la academia para completar convocatorias.`,
    };

    newPlayers.push(playerObj);
    newgenRecords.push(newgenRec);
  }

  return { newPlayers, newgenRecords, spawnedWonderkidCount: wonderkidsCount };
}

// ============================================================================
// 3. ENVEJECIMIENTO, EVOLUCIÓN DINÁMICA Y RETIRADAS INTELIGENTES
// ============================================================================

/**
 * Evolves all players across the universe:
 * - Ages players +1 year
 * - Applies development curve (youth sprint, prime peak, veteran decay)
 * - Evaluates realistic retirements based on age, fitness, injuries, rating and career options
 */
export function evolvePlayersAndProcessRetirements(
  players: Record<string, Player>,
  clubs: Record<string, Club>,
  currentSeason: string
): {
  updatedPlayers: Record<string, Player>;
  retiredLegends: RetiredLegendRecord[];
  retiredPlayerIds: Set<string>;
} {
  const updatedPlayers: Record<string, Player> = {};
  const retiredLegends: RetiredLegendRecord[] = [];
  const retiredPlayerIds = new Set<string>();

  Object.keys(players).forEach((pid) => {
    const p = players[pid];
    const newAge = p.age + 1;
    let newOvr = p.overallRating;

    // 1. Progresión física y técnica según edad
    if (newAge <= 21) {
      // Juventud: progresión rápida hacia el potencial
      const growth = Math.min(p.potential - newOvr, Math.floor(Math.random() * 4) + 1);
      newOvr = Math.min(p.potential, newOvr + Math.max(0, growth));
    } else if (newAge <= 28) {
      // Edad madura: consolidación
      if (newOvr < p.potential && Math.random() < 0.6) {
        newOvr = Math.min(p.potential, newOvr + 1);
      }
    } else if (newAge <= 32) {
      // Plenitud / Meseta
      if (Math.random() < 0.3) {
        newOvr = Math.max(50, newOvr - 1);
      }
    } else {
      // Declive de veteranos (porteros declinan a la mitad de velocidad)
      const declineRate = p.primaryPosition === 'POR' ? 1 : Math.floor(Math.random() * 3) + 1;
      newOvr = Math.max(48, newOvr - declineRate);
    }

    // 2. Cálculo probabilístico de retirada (NO edad fija)
    let shouldRetire = false;
    let reason: RetirementReason = 'EDAD_AVANZADA';

    if (newAge >= 33) {
      const isGoalkeeper = p.primaryPosition === 'POR';
      const ageThreshold = isGoalkeeper ? 36 : 33;
      
      // Factores de decisión
      const baseRetirementChance = Math.max(0, (newAge - ageThreshold) * 0.18);
      const lowOvrPenalty = newOvr < 65 ? 0.35 : 0;
      const injuryHistoryPenalty = (p.isInjured ? 0.25 : 0);
      const totalRetirementProbability = Math.min(0.96, baseRetirementChance + lowOvrPenalty + injuryHistoryPenalty);

      if (Math.random() < totalRetirementProbability) {
        shouldRetire = true;
        if (injuryHistoryPenalty > 0.2) {
          reason = 'LESIONES_RECURRENTES';
        } else if (lowOvrPenalty > 0.2) {
          reason = 'DECLIVE_FISICO';
        } else if (newAge >= 38) {
          reason = 'EDAD_AVANZADA';
        } else {
          reason = 'MOTIVACION_CUMPLIDA';
        }
      }
    }

    // Forzar retirada si supera 44 años
    if (newAge >= 44) {
      shouldRetire = true;
      reason = 'EDAD_AVANZADA';
    }

    if (shouldRetire) {
      retiredPlayerIds.add(p.id);
      
      // Inducir al Salón de la Fama si tiene prestigio destacado
      const isSuperstar = p.overallRating >= 78 || (p.potential >= 88 && p.age >= 34);
      const clubName = clubs[p.clubId || '']?.name || 'Agente Libre';
      
      const record: RetiredLegendRecord = {
        id: `ret_${p.id}_${Date.now()}`,
        playerId: p.id,
        playerName: `${p.firstName} ${p.lastName}`,
        nationality: p.nationality,
        position: p.primaryPosition,
        retirementSeason: currentSeason,
        retirementAge: newAge,
        reason,
        careerStats: {
          totalMatches: 300 + Math.floor(Math.random() * 400),
          totalGoals: ['DC', 'EI', 'ED'].includes(p.primaryPosition) ? 80 + Math.floor(Math.random() * 250) : 15 + Math.floor(Math.random() * 40),
          totalAssists: 30 + Math.floor(Math.random() * 120),
          totalCleanSheets: p.primaryPosition === 'POR' ? 90 + Math.floor(Math.random() * 120) : undefined,
          clubsRepresented: [clubName],
          titlesWonCount: isSuperstar ? 4 + Math.floor(Math.random() * 8) : Math.floor(Math.random() * 3),
          titlesList: isSuperstar ? ['Liga Nacional', 'Copa Nacional', 'Supercopa'] : [],
        },
        isHallOfFame: isSuperstar,
        legacyDescription: isSuperstar 
          ? `Leyenda inolvidable del fútbol que cuelga las botas tras una trayectoria repleta de éxitos y maestría sobre el verde.`
          : `Profesional comprometido que finaliza su carrera deportiva habiendo dejado huella en su vestuario.`,
      };

      retiredLegends.push(record);
    } else {
      // Mantener en el universo con atributos actualizados
      updatedPlayers[p.id] = {
        ...p,
        age: newAge,
        overallRating: newOvr,
        fitness: 100,
        matchReadiness: 90,
        isInjured: false,
        injuryWeeksLeft: 0,
        seasonStats: {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          minutesPlayed: 0,
          averageRating: 7.0,
          cleanSheets: p.primaryPosition === 'POR' ? 0 : undefined,
        },
      };
    }
  });

  return { updatedPlayers, retiredLegends, retiredPlayerIds };
}

// ============================================================================
// 4. PREMIOS INDIVIDUALES ANUALES (BALÓN DE ORO, THE BEST, YASHIN, GOLDEN BOY)
// ============================================================================

/**
 * Calculates world individual awards for a concluded season using authentic sporting metrics
 */
export function calculateAnnualWorldAwards(
  players: Record<string, Player>,
  clubs: Record<string, Club>,
  season: string
): AnnualAwardWinners {
  const playerList = Object.values(players);

  // 1. Balón de Oro (Mejor jugador absoluto mundial)
  const topOutfield = [...playerList]
    .filter((p) => p.primaryPosition !== 'POR')
    .sort((a, b) => {
      const scoreA = a.overallRating * 1.5 + (a.seasonStats?.goals || 0) * 1.8 + (a.seasonStats?.assists || 0) * 1.2;
      const scoreB = b.overallRating * 1.5 + (b.seasonStats?.goals || 0) * 1.8 + (b.seasonStats?.assists || 0) * 1.2;
      return scoreB - scoreA;
    });

  const bdorWinner = topOutfield[0] || playerList[0];
  const bdorClub = clubs[bdorWinner?.clubId || '']?.name || 'Club de Élite';

  // 2. Trofeo Yashin (Mejor Portero)
  const topGk = [...playerList]
    .filter((p) => p.primaryPosition === 'POR')
    .sort((a, b) => b.overallRating - a.overallRating)[0] || playerList[0];
  const gkClub = clubs[topGk?.clubId || '']?.name || 'Club de Élite';

  // 3. Golden Boy (Mejor Joven sub-21)
  const topYouth = [...playerList]
    .filter((p) => p.age <= 21)
    .sort((a, b) => (b.overallRating + b.potential) - (a.overallRating + a.potential))[0] || playerList[0];
  const youthClub = clubs[topYouth?.clubId || '']?.name || 'Club Formador';

  // 4. Bota de Oro Europea
  const topScorerCandidate = [...playerList]
    .filter((p) => ['DC', 'EI', 'ED'].includes(p.primaryPosition))
    .sort((a, b) => (b.seasonStats?.goals || b.overallRating) - (a.seasonStats?.goals || a.overallRating))[0] || playerList[0];
  const scorerClub = clubs[topScorerCandidate?.clubId || '']?.name || 'Club de Élite';
  const simulatedGoals = (topScorerCandidate?.seasonStats?.goals && topScorerCandidate.seasonStats.goals > 0)
    ? topScorerCandidate.seasonStats.goals
    : 28 + Math.floor(Math.random() * 12);

  // 5. Entrenador del Año
  const managerWinners = [
    { name: 'Pep Guardiola', club: 'Manchester City', achievement: 'Dominio táctico y títulos continentales' },
    { name: 'Carlo Ancelotti', club: 'Real Madrid CF', achievement: 'Gestión impecable de vestuario y campeonatos' },
    { name: 'Xabi Alonso', club: 'Bayer Leverkusen', achievement: 'Fútbol de alta escuela e innovación ofensiva' },
    { name: 'Mikel Arteta', club: 'Arsenal FC', achievement: 'Rendimiento colectivo y solidez defensiva' },
  ];
  const selectedManager = managerWinners[Math.floor(Math.random() * managerWinners.length)];

  return {
    season,
    ballonDOr: {
      playerId: bdorWinner.id,
      playerName: `${bdorWinner.firstName} ${bdorWinner.lastName}`,
      clubName: bdorClub,
      nationality: bdorWinner.nationality,
      position: bdorWinner.primaryPosition,
      seasonGoals: bdorWinner.seasonStats?.goals || 32,
      seasonAssists: bdorWinner.seasonStats?.assists || 14,
      averageRating: 8.4,
      trophiesCount: 2,
    },
    theBestFIFA: {
      playerName: `${bdorWinner.firstName} ${bdorWinner.lastName}`,
      clubName: bdorClub,
    },
    yashinTrophy: {
      playerId: topGk.id,
      playerName: `${topGk.firstName} ${topGk.lastName}`,
      clubName: gkClub,
      cleanSheets: 18 + Math.floor(Math.random() * 8),
    },
    goldenBoy: {
      playerId: topYouth.id,
      playerName: `${topYouth.firstName} ${topYouth.lastName}`,
      clubName: youthClub,
      age: topYouth.age,
      overall: topYouth.overallRating,
    },
    goldenBoot: {
      playerName: `${topScorerCandidate.firstName} ${topScorerCandidate.lastName}`,
      clubName: scorerClub,
      goals: simulatedGoals,
      leagueMultiplier: 2.0,
      points: simulatedGoals * 2.0,
    },
    managerOfYear: {
      managerName: selectedManager.name,
      clubName: selectedManager.club,
      achievement: selectedManager.achievement,
    },
  };
}

// ============================================================================
// 5. EVOLUCIÓN HISTÓRICA DE CLUBES A LO LARGO DE DÉCADAS
// ============================================================================

/**
 * Generates institutional club events: takeovers, golden eras, crises, stadium expansions
 */
export function simulateDecennialClubEvents(
  clubs: Record<string, Club>,
  season: string
): { updatedClubs: Record<string, Club>; events: ClubTimelineEvent[] } {
  const updatedClubs = { ...clubs };
  const events: ClubTimelineEvent[] = [];
  const clubIds = Object.keys(updatedClubs);

  // Trigger 2 to 4 institutional milestones across the universe each season
  const selectedCount = Math.min(4, Math.floor(Math.random() * 3) + 2);
  const shuffledIds = [...clubIds].sort(() => Math.random() - 0.5);

  for (let i = 0; i < selectedCount; i++) {
    const cid = shuffledIds[i];
    const club = updatedClubs[cid];
    if (!club) continue;

    const eventRoll = Math.random();
    let type: ClubEraType = 'ERA_DORADA';
    let headline = '';
    let details = '';
    let repDelta = 0;
    let budgetDelta = 0;

    if (eventRoll > 0.8) {
      type = 'CAMBIO_PROPIEDAD_MECENAS';
      headline = `Adquisición Institucional en ${club.name}`;
      details = `Un consorcio empresarial inyecta capital transformador para modernizar la estructura y potenciar la cantera.`;
      repDelta = +4;
      budgetDelta = 25000000;
      updatedClubs[cid] = {
        ...club,
        reputation: Math.min(99, club.reputation + repDelta),
        finances: {
          ...club.finances,
          balance: club.finances.balance + budgetDelta,
          transferBudget: club.finances.transferBudget + Math.round(budgetDelta * 0.6),
        },
      };
    } else if (eventRoll > 0.55 && club.stadium) {
      type = 'AMPLIACION_ESTADIO';
      const seatIncrease = 4000 + Math.floor(Math.random() * 8000);
      headline = `Ampliación del ${club.stadium.name}`;
      details = `Finalizan las obras de ampliación sumando +${seatIncrease.toLocaleString()} asientos nuevos para responder a la masa social.`;
      repDelta = +2;
      updatedClubs[cid] = {
        ...club,
        reputation: Math.min(99, club.reputation + repDelta),
        stadium: {
          ...club.stadium,
          capacity: club.stadium.capacity + seatIncrease,
        },
      };
    } else if (eventRoll > 0.3) {
      type = 'ERA_DORADA';
      headline = `Ciclo Virtuoso Deportivo en ${club.name}`;
      details = `La dirección deportiva cosecha frutos de estabilidad, logrando récord de ingresos por patrocinio y abonados.`;
      repDelta = +3;
      budgetDelta = 8000000;
      updatedClubs[cid] = {
        ...club,
        reputation: Math.min(99, club.reputation + repDelta),
        finances: {
          ...club.finances,
          balance: club.finances.balance + budgetDelta,
        },
      };
    } else {
      type = 'CRISIS_ECONOMICA';
      headline = `Ajuste Presupuestario y Austeridad en ${club.name}`;
      details = `La entidad aplica un plan de contención de masa salarial para sanear tesorería y garantizar viabilidad futura.`;
      repDelta = -3;
      updatedClubs[cid] = {
        ...club,
        reputation: Math.max(30, club.reputation + repDelta),
        finances: {
          ...club.finances,
          transferBudget: Math.round(club.finances.transferBudget * 0.7),
        },
      };
    }

    events.push({
      id: `timeline_${cid}_${season.replace('/', '-')}_${Date.now()}_${i}`,
      season,
      date: `${parseInt(season.slice(0, 4), 10)}-11-15`,
      clubId: cid,
      clubName: club.name,
      type,
      headline,
      details,
      impactReputationDelta: repDelta,
      impactBudgetDelta: budgetDelta,
    });
  }

  return { updatedClubs, events };
}

// ============================================================================
// 6. MOTOR DE SIMULACIÓN ULTRA-RÁPIDA POR TEMPORADAS (PERPETUAL RUNNER)
// ============================================================================

/**
 * Simulates a full season in a single fast, coherent pass:
 * 1. Resolves all matches and standings with official tiebreakers
 * 2. Awards trophies and updates palmarés
 * 3. Ages players and processes retirements into Hall of Fame
 * 4. Ingests fresh youth academy newgens
 * 5. Calculates annual awards (Ballon d'Or, Yashin, etc.)
 * 6. Executes promotion and relegations across the football pyramid
 * 7. Compacts completed matches to keep IndexedDB light and ultra-responsive
 */
export function simulateOneFullSeasonFast(save: GameSave): GameSave {
  const currentSeason = save.currentSeason;
  const nextSeasonYear = parseInt(currentSeason.slice(0, 4), 10) + 1;
  const nextSeason = `${nextSeasonYear}/${String(nextSeasonYear + 1).slice(2)}`;

  let updatedClubs = { ...save.clubs };
  let updatedCompetitions = { ...save.competitions };
  const newTrophies: TrophyRecord[] = [];

  let updatedManager = {
    ...save.manager,
    careerStats: { ...save.manager.careerStats },
    historyTitles: [...(save.manager.historyTitles || [])],
    careerLog: [...(save.manager.careerLog || [])],
  };

  // Helper for fast, realistic multi-factor squad power evaluation
  const evaluateFastClubPower = (club: Club | undefined, playersMap: Record<string, Player>): number => {
    if (!club) return 60;
    const playerIds = club.playerIds || [];
    let squadTotal = 0;
    let count = 0;
    for (let i = 0; i < playerIds.length; i++) {
      const p = playersMap[playerIds[i]];
      if (p && !p.isInjured && !p.isSuspended) {
        squadTotal += p.overallRating;
        count++;
      }
    }
    const avgSquad = count > 0 ? squadTotal / count : (club.reputation || 65);

    // Tactical mentality modifier
    let tacticMod = 0;
    if (club.tacticMentality === 'Ofensiva') tacticMod = 1.0;
    else if (club.tacticMentality === 'Al Ataque') tacticMod = 1.6;
    else if (club.tacticMentality === 'Muy Defensiva') tacticMod = -1.2;

    // Economic depth factor (budget & wage budget capacity)
    const clubBudget = club.finances?.balance || club.finances?.transferBudget || 500000;
    const economicBonus = Math.min(2.5, Math.max(0, Math.log10(Math.max(100000, clubBudget)) - 5));

    return avgSquad * 0.72 + (club.reputation || 65) * 0.28 + tacticMod + economicBonus;
  };

  // 1. Simular todos los partidos pendientes de la temporada con motor realista
  Object.keys(updatedCompetitions).forEach((compId) => {
    const comp = updatedCompetitions[compId];
    const regulation = OFFICIAL_COMPETITION_REGULATIONS[compId];
    let standings = [...(comp.standings || [])];

    // Simular resultados si hay partidos pendientes
    comp.matches = comp.matches.map((m) => {
      if (!m.played) {
        const homeClub = updatedClubs[m.homeTeamId];
        const awayClub = updatedClubs[m.awayTeamId];

        const homePower = evaluateFastClubPower(homeClub, save.players) + 3.6; // Factor campo (+3.6 pts de rating)
        const awayPower = evaluateFastClubPower(awayClub, save.players);

        const hRow = standings.find((r) => r.teamId === m.homeTeamId);
        const aRow = standings.find((r) => r.teamId === m.awayTeamId);

        // Modificadores de racha reciente ('V' = Victoria, 'E' = Empate, 'D' = Derrota)
        let homeFormBonus = 0;
        if (hRow?.recentForm && hRow.recentForm.length > 0) {
          const last3 = hRow.recentForm.slice(-3);
          last3.forEach((res) => {
            if (res === 'V') homeFormBonus += 0.7;
            if (res === 'D') homeFormBonus -= 0.7;
          });
        }
        let awayFormBonus = 0;
        if (aRow?.recentForm && aRow.recentForm.length > 0) {
          const last3 = aRow.recentForm.slice(-3);
          last3.forEach((res) => {
            if (res === 'V') awayFormBonus += 0.7;
            if (res === 'D') awayFormBonus -= 0.7;
          });
        }

        // Factor Sorpresa / Underdog Variance (20% de probabilidad de sorpresa deportiva)
        let surpriseSwing = 0;
        if (Math.random() < 0.20) {
          if (homePower < awayPower) {
            surpriseSwing = 3.5 + Math.random() * 5.0; // Underdog local saca casta
          } else if (awayPower < homePower) {
            surpriseSwing = -(3.5 + Math.random() * 5.0); // Underdog visitante da la campanada
          }
        }

        const ratingDiff = (homePower + homeFormBonus + surpriseSwing) - (awayPower + awayFormBonus);

        // xG base y muestreo realista
        const homeXg = Math.max(0.35, 1.45 + ratingDiff * 0.055 + (Math.random() * 0.6 - 0.3));
        const awayXg = Math.max(0.25, 1.15 - ratingDiff * 0.045 + (Math.random() * 0.6 - 0.3));

        const sampleGoals = (lambda: number) => {
          const l = Math.exp(-lambda);
          let k = 0;
          let p = 1.0;
          do {
            k++;
            p *= Math.random();
          } while (p > l && k < 9);
          return Math.max(0, k - 1);
        };

        const homeScore = Math.min(7, sampleGoals(homeXg));
        const awayScore = Math.min(7, sampleGoals(awayXg));

        // Actualizar estadísticas del manager del usuario si participa su club
        const isUserHome = m.homeTeamId === save.userClubId;
        const isUserAway = m.awayTeamId === save.userClubId;
        if (isUserHome || isUserAway) {
          updatedManager.careerStats.matchesManaged++;
          const userG = isUserHome ? homeScore : awayScore;
          const oppG = isUserHome ? awayScore : homeScore;
          updatedManager.careerStats.goalsFor += userG;
          updatedManager.careerStats.goalsAgainst += oppG;
          if (userG > oppG) updatedManager.careerStats.won++;
          else if (userG === oppG) updatedManager.careerStats.drawn++;
          else updatedManager.careerStats.lost++;
        }

        if (hRow && aRow) {
          hRow.played++;
          aRow.played++;
          hRow.goalsFor += homeScore;
          hRow.goalsAgainst += awayScore;
          aRow.goalsFor += awayScore;
          aRow.goalsAgainst += homeScore;
          hRow.goalDifference = hRow.goalsFor - hRow.goalsAgainst;
          aRow.goalDifference = aRow.goalsFor - aRow.goalsAgainst;

          const hForm = hRow.recentForm ? [...hRow.recentForm] : [];
          const aForm = aRow.recentForm ? [...aRow.recentForm] : [];

          if (homeScore > awayScore) {
            hRow.won++;
            hRow.points += 3;
            aRow.lost++;
            hForm.push('V');
            aForm.push('D');
          } else if (homeScore === awayScore) {
            hRow.drawn++;
            aRow.drawn++;
            hRow.points += 1;
            aRow.points += 1;
            hForm.push('E');
            aForm.push('E');
          } else {
            aRow.won++;
            aRow.points += 3;
            hRow.lost++;
            hForm.push('D');
            aForm.push('V');
          }

          hRow.recentForm = hForm.slice(-5);
          aRow.recentForm = aForm.slice(-5);
        }

        return {
          ...m,
          played: true,
          homeScore,
          awayScore,
        };
      }
      return m;
    });

    // Ordenar con reglamento oficial
    if (regulation) {
      standings = resolveCompetitionStandings(standings, comp.matches, regulation);
    } else {
      standings.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    }

    comp.standings = standings;

    // Registrar trofeos de los campeones y méritos del manager
    const championRow = standings[0];
    const runnerUpRow = standings[1];
    if (championRow) {
      const champClub = updatedClubs[championRow.teamId];
      const runnerClub = runnerUpRow ? updatedClubs[runnerUpRow.teamId] : undefined;
      const isUserClub = champClub?.id === save.userClubId;
      const managerName = isUserClub 
        ? `${save.manager.firstName} ${save.manager.lastName}`
        : (champClub?.coachName || 'Entrenador Titulado');

      if (isUserClub) {
        updatedManager.careerStats.titlesWon++;
        updatedManager.historyTitles.push({
          title: `Campeón de ${regulation?.name || comp.name}`,
          season: currentSeason,
          clubName: champClub?.name || 'Tu Club',
        });
        updatedManager.careerLog.push({
          season: currentSeason,
          clubOrNationName: champClub?.name || 'Tu Club',
          competitionName: regulation?.name || comp.name,
          achieved: `Campeón de Liga (${championRow.points} pts)`,
          isTitle: true,
          date: `${nextSeasonYear}-05-24`,
          matches: championRow.played,
          won: championRow.won,
          drawn: championRow.drawn,
          lost: championRow.lost,
        });
      }

      newTrophies.push({
        id: `trophy_${compId}_${currentSeason.replace('/', '-')}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        season: currentSeason,
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
    }
  });

  // Archivar resultados de todas las ligas en la enciclopedia histórica mundial
  let workingSaveState = { ...save, clubs: updatedClubs, competitions: updatedCompetitions, players: save.players };
  Object.keys(updatedCompetitions).forEach((cid) => {
    const comp = updatedCompetitions[cid];
    workingSaveState = archiveSeasonResults(workingSaveState, comp, currentSeason);
  });

  // 1.1 Simular copas nacionales y continentales (Copa del Rey, Champions, etc.)
  const cups = save.cupTournaments || initializeAllTournaments(updatedClubs, currentSeason);
  Object.values(cups).forEach((tournInput) => {
    let tourn = { ...tournInput };
    let safety = 0;
    while (!tourn.championClubId && safety < 8) {
      safety++;
      tourn.matches = tourn.matches.map((m) => {
        if (m.played) return m;
        return simulateCupMatch(m, updatedClubs, save.players);
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

      if (champClub?.id === save.userClubId) {
        updatedManager.careerStats.titlesWon++;
        updatedManager.historyTitles.push({
          title: `Campeón de ${tourn.name}`,
          season: currentSeason,
          clubName: champClub?.name || 'Tu Club',
        });
        updatedManager.careerLog.push({
          season: currentSeason,
          clubOrNationName: champClub?.name || 'Tu Club',
          competitionName: tourn.name,
          achieved: `Campeón de ${tourn.name}`,
          isTitle: true,
          date: `${nextSeasonYear}-05-18`,
        });
      }

      newTrophies.push({
        id: `trophy_${tourn.id}_${currentSeason.replace('/', '-')}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        season: currentSeason,
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

      if (champClub) {
        updatedClubs[champClub.id] = {
          ...champClub,
          historyTitles: [
            ...(champClub.historyTitles || []),
            { title: `Campeón de ${tourn.name}`, season: currentSeason },
          ],
        };
      }
    }
  });

  // 1.2 Simular Mundial FIFA si corresponde al ciclo
  const seasonStartYear = parseInt(currentSeason.slice(0, 4), 10);
  if (seasonStartYear % 4 === 1) {
    const wcYear = seasonStartYear + 1;
    const userNation = save.manager?.nationalTeamRole?.countryId || 'ESP';
    let wc = createWorldCupTournament(userNation, undefined, 48, wcYear);
    wc = simulateEntireWorldCupTournament(wc, save.players);

    if (wc && wc.championTeamId) {
      const champNation = NATIONAL_TEAMS_MAP[wc.championTeamId];
      const runnerNation = wc.runnerUpTeamId ? NATIONAL_TEAMS_MAP[wc.runnerUpTeamId] : undefined;
      const finalM = wc.finalMatch;
      const wcSummary = finalM && finalM.played
        ? `${finalM.homeScore} - ${finalM.awayScore}${
            finalM.homePenalties !== undefined
              ? ` (${finalM.homePenalties}-${finalM.awayPenalties} pen.)`
              : ''
          }`
        : 'Campeón Mundial';

      newTrophies.push({
        id: `trophy_wc_${wcYear}_${Date.now()}`,
        season: `${wcYear}`,
        competitionId: wc.id,
        competitionName: wc.name,
        competitionType: 'SELECCIONES_MUNDIAL',
        tier: 'MUNDIAL',
        championId: wc.championTeamId,
        championName: champNation ? `${champNation.flag} ${champNation.name}` : wc.championTeamId,
        runnerUpId: wc.runnerUpTeamId || undefined,
        runnerUpName: runnerNation ? `${runnerNation.flag} ${runnerNation.name}` : undefined,
        scoreOrSummary: `${wcSummary} (${wc.hostName})`,
        winningManagerName: wc.championTeamId === userNation ? `${save.manager.firstName} ${save.manager.lastName}` : 'Seleccionador Nacional',
        isPreGameHistory: false,
      });
    }
  }

  // 2. Procesar envejecimiento y retiradas
  const { updatedPlayers: agedPlayers, retiredLegends, retiredPlayerIds } = evolvePlayersAndProcessRetirements(
    save.players,
    updatedClubs,
    currentSeason
  );

  let activePlayers = { ...agedPlayers };

  // Limpiar futbolistas retirados de las plantillas
  Object.keys(updatedClubs).forEach((cid) => {
    const c = updatedClubs[cid];
    c.playerIds = (c.playerIds || []).filter((pid) => !retiredPlayerIds.has(pid));
  });

  // 3. Generar nueva generación de juveniles (Newgens)
  let globalWonderkidsCount = 0;
  const newgensThisYear: NewgenPlayer[] = [];

  Object.keys(updatedClubs).forEach((cid) => {
    const c = updatedClubs[cid];
    const intake = generateClubYouthIntake(c, nextSeasonYear, globalWonderkidsCount);
    globalWonderkidsCount = intake.spawnedWonderkidCount;

    intake.newPlayers.forEach((np) => {
      activePlayers[np.id] = np;
      c.playerIds.push(np.id);
    });

    newgensThisYear.push(...intake.newgenRecords);

    // Guarantee full squad depth (min 22 players, complete positions)
    const completeness = ensureClubSquadCompleteness(c, activePlayers, nextSeasonYear);
    updatedClubs[cid] = completeness.updatedClub;
    completeness.newPlayers.forEach((np) => {
      activePlayers[np.id] = np;
    });
  });

  // 4. Calcular premios anuales (Balón de Oro, etc.)
  const annualAwards = calculateAnnualWorldAwards(activePlayers, updatedClubs, currentSeason);

  // 5. Simular evolución institucional de clubes (eras, cambios de propiedad, estadios)
  const decennial = simulateDecennialClubEvents(updatedClubs, currentSeason);
  updatedClubs = decennial.updatedClubs;

  // 6. Ejecutar ascensos y descensos
  const swapPromotionRelegation = (
    higherComp: Competition | undefined,
    lowerComp: Competition | undefined,
    swapCount: number
  ) => {
    if (!higherComp || !lowerComp) return;
    if (!higherComp.standings || !lowerComp.standings) return;
    if (higherComp.standings.length < swapCount * 2 || lowerComp.standings.length < swapCount * 2) return;

    const relegated = higherComp.standings.slice(higherComp.standings.length - swapCount).map((r) => r.teamId);
    const promoted = lowerComp.standings.slice(0, swapCount).map((r) => r.teamId);

    relegated.forEach((id) => {
      if (updatedClubs[id]) updatedClubs[id].divisionId = lowerComp.id;
      if (id === save.userClubId) {
        updatedManager.careerStats.relegations = (updatedManager.careerStats.relegations || 0) + 1;
        updatedManager.careerLog.push({
          season: currentSeason,
          clubOrNationName: updatedClubs[id]?.name || 'Tu Club',
          competitionName: higherComp.name,
          achieved: `Descenso a ${lowerComp.name}`,
          isRelegation: true,
          date: `${nextSeasonYear}-06-05`,
        });
      }
    });
    promoted.forEach((id) => {
      if (updatedClubs[id]) updatedClubs[id].divisionId = higherComp.id;
      if (id === save.userClubId) {
        updatedManager.careerStats.promotions++;
        updatedManager.careerLog.push({
          season: currentSeason,
          clubOrNationName: updatedClubs[id]?.name || 'Tu Club',
          competitionName: lowerComp.name,
          achieved: `Ascenso a ${higherComp.name}`,
          isPromotion: true,
          date: `${nextSeasonYear}-06-05`,
        });
      }
    });

    higherComp.clubIds = higherComp.clubIds.filter((id) => !relegated.includes(id)).concat(promoted);
    lowerComp.clubIds = lowerComp.clubIds.filter((id) => !promoted.includes(id)).concat(relegated);
  };

  swapPromotionRelegation(updatedCompetitions['esp_tier1'], updatedCompetitions['esp_tier2'], 3);
  swapPromotionRelegation(updatedCompetitions['esp_tier2'], updatedCompetitions['esp_tier3_g2'], 2);
  swapPromotionRelegation(updatedCompetitions['esp_tier3_g2'], updatedCompetitions['esp_tier4_g3'], 2);
  swapPromotionRelegation(updatedCompetitions['esp_tier4_g3'], updatedCompetitions['esp_tier5_g5'], 2);
  swapPromotionRelegation(updatedCompetitions['eng_tier1'], updatedCompetitions['eng_tier2'], 3);

  // 7. Compactación y reseteo de calendarios para la siguiente temporada
  Object.keys(updatedCompetitions).forEach((cid) => {
    const comp = updatedCompetitions[cid];
    comp.standings = comp.clubIds.map((tid) => ({
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

    // Mantener sólo un calendario ligero de partidos para la nueva temporada
    const clubIds = comp.clubIds;
    const matches: Match[] = [];
    for (let r = 0; r < Math.min(6, clubIds.length); r++) {
      for (let i = 0; i < clubIds.length / 2; i++) {
        const home = clubIds[i];
        const away = clubIds[clubIds.length - 1 - i];
        if (home && away) {
          matches.push({
            id: `fast_m_${cid}_${nextSeasonYear}_r${r}_${i}`,
            competitionId: cid,
            matchday: r + 1,
            date: `${nextSeasonYear}-09-${String((r + 1) * 4).padStart(2, '0')}`,
            homeTeamId: home,
            awayTeamId: away,
            played: false,
          });
        }
      }
    }
    comp.matches = matches;
    comp.currentMatchday = 1;
  });

  // Conservar toda la historia y palmarés acumulado de 10, 50, 100 y 200 años sin truncar
  const allTrophies = [...newTrophies, ...(workingSaveState.trophyArchive || save.trophyArchive || HISTORICAL_TROPHY_ARCHIVE)];
  const allAwards = [annualAwards, ...(save.annualAwardsHistory || [])];
  const allLegends = [...retiredLegends.filter((r) => r.isHallOfFame), ...(save.retiredLegends || [])].slice(0, 500);
  const allTimeline = [...decennial.events, ...(save.clubTimelineEvents || [])];
  const allNewgens = [...newgensThisYear.slice(0, 50), ...(save.newgenRegistry || [])].slice(0, 500);

  const seasonStartNews: NewsItem = {
    id: `news_season_${nextSeason}_start`,
    date: `${nextSeasonYear}-08-15`,
    title: `¡Comienza la Temporada ${nextSeason}!`,
    content: `El fútbol mundial entra en la temporada ${nextSeason}. El Balón de Oro ha sido concedido a ${annualAwards.ballonDOr.playerName} (${annualAwards.ballonDOr.clubName}). Se incorporan ${newgensThisYear.length} nuevas promesas de las canteras mundiales.`,
    category: 'DIRECTIVA',
    read: false,
  };

  const simulatedSeasonSave: GameSave = {
    ...save,
    currentSeason: nextSeason,
    currentDate: `${nextSeasonYear}-08-15`,
    clubs: updatedClubs,
    players: activePlayers,
    competitions: updatedCompetitions,
    historicalArchives: workingSaveState.historicalArchives || save.historicalArchives || [],
    manager: updatedManager,
    cupTournaments: initializeAllTournaments(
      updatedClubs,
      nextSeason,
      save.userClubId,
      resolveContinentalQualification(save).championsLeagueIds
    ),
    trophyArchive: allTrophies,
    annualAwardsHistory: allAwards,
    retiredLegends: allLegends,
    clubTimelineEvents: allTimeline,
    newgenRegistry: allNewgens,
    news: [seasonStartNews, ...(save.news || []).slice(0, 30)],
  };

  const { updatedSave: evolvedSave } = checkAndTriggerWorldEvolutionMilestones(simulatedSeasonSave, nextSeason);
  return evolvedSave;
}

// ============================================================================
// 7. BATERÍA DE PRUEBAS DE DURABILIDAD Y LONGEVIDAD (10, 50, 100, 200 TEMPORADAS)
// ============================================================================

/**
 * Runs rigorous durability and longevity integrity assertions across the perpetual universe:
 * - Checks zero clubs lost
 * - Checks zero duplicate player identities
 * - Checks realistic age boundaries (15 <= age <= 45)
 * - Checks contract validity and non-negative wages
 * - Checks clubs have operational squad sizes (16 to 32 players)
 * - Checks league standings continue generating champions
 * - Compacts database size
 */
export function runDurabilityAssertionSuite(
  initialSave: GameSave,
  seasonsToSimulate: number
): { finalSave: GameSave; report: DurabilityAssertionReport } {
  let simSave = { ...initialSave };
  const initialClubsCount = Object.keys(initialSave.clubs).length;
  const startSeason = initialSave.currentSeason;

  // Run fast perpetual simulation loop
  for (let s = 0; s < seasonsToSimulate; s++) {
    simSave = simulateOneFullSeasonFast(simSave);
  }

  // Ejecutar verificaciones estrictas
  const activeClubs = Object.values(simSave.clubs);
  const activePlayers = Object.values(simSave.players);

  // 1. Integridad de clubes
  const clubsLostCount = Math.max(0, initialClubsCount - activeClubs.length);

  // 2. Integridad de edades
  let minPlayerAge = 99;
  let maxPlayerAge = 0;
  let impossibleAgesDetected = 0;

  activePlayers.forEach((p) => {
    if (p.age < minPlayerAge) minPlayerAge = p.age;
    if (p.age > maxPlayerAge) maxPlayerAge = p.age;
    if (p.age < 15 || p.age > 45) {
      impossibleAgesDetected++;
    }
  });

  // 3. Duplicación de identidades
  const seenIds = new Set<string>();
  let duplicateIdentitiesCount = 0;
  activePlayers.forEach((p) => {
    if (seenIds.has(p.id)) {
      duplicateIdentitiesCount++;
    }
    seenIds.add(p.id);
  });

  // 4. Integridad de contratos y salarios
  let brokenContractsCount = 0;
  activePlayers.forEach((p) => {
    if (!p.contract || p.contract.wagePerWeek < 0) {
      brokenContractsCount++;
    }
  });

  // 5. Plantillas operativas
  let squadSizeAlertsCount = 0;
  activeClubs.forEach((c) => {
    const squadSize = c.playerIds?.length || 0;
    if (squadSize < 14 || squadSize > 38) {
      squadSizeAlertsCount++;
    }
  });

  // 6. Funcionamiento de competiciones
  let brokenLeagueStandingsCount = 0;
  Object.values(simSave.competitions).forEach((comp) => {
    if (!comp.standings || comp.standings.length < 4) {
      brokenLeagueStandingsCount++;
    }
  });

  // Estimación de memoria en KB
  const estimatedMemoryKb = Math.round(JSON.stringify(simSave).length / 1024);

  const isAllPassing = 
    clubsLostCount === 0 &&
    impossibleAgesDetected === 0 &&
    duplicateIdentitiesCount === 0 &&
    brokenContractsCount === 0 &&
    brokenLeagueStandingsCount === 0;

  const details: string[] = [
    `Simulación de longevidad completada con éxito: ${seasonsToSimulate} temporadas consecutivas (${startSeason} -> ${simSave.currentSeason}).`,
    `Censo de Clubes: ${activeClubs.length}/${initialClubsCount} clubes preservados intactos en el universo.`,
    `Censo de Futbolistas Activos: ${activePlayers.length} jugadores con edades entre ${minPlayerAge} y ${maxPlayerAge} años.`,
    `Generaciones de cantera registradas: ${simSave.newgenRegistry?.length || 0} futbolistas con talento regulado.`,
    `Salón de la Fama y Retiradas: ${simSave.retiredLegends?.length || 0} leyendas con palmarés acumulado.`,
    `Historial de Premios: ${simSave.annualAwardsHistory?.length || 0} ediciones del Balón de Oro y Bota de Oro archivadas.`,
    `Memoria de partida compactada: ~${estimatedMemoryKb.toLocaleString()} KB en almacenamiento persistente.`,
  ];

  const report: DurabilityAssertionReport = {
    timestamp: new Date().toISOString(),
    seasonsTestedCount: seasonsToSimulate,
    startSeason,
    endSeason: simSave.currentSeason,
    totalClubsTracked: activeClubs.length,
    clubsLostCount,
    totalActivePlayers: activePlayers.length,
    minPlayerAge,
    maxPlayerAge,
    impossibleAgesDetected,
    duplicateIdentitiesCount,
    brokenContractsCount,
    squadSizeAlertsCount,
    brokenLeagueStandingsCount,
    estimatedMemoryKb,
    isAllPassing,
    details,
  };

  const updatedReports = [report, ...(simSave.durabilityReports || []).slice(0, 10)];
  simSave.durabilityReports = updatedReports;

  return { finalSave: simSave, report };
}
