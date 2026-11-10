import { NATIONAL_TEAMS_80, NationalTeam80, NATIONAL_TEAMS_MAP } from '../db/worldData/nationalTeams80';
import { Player, Position } from '../types/player';
import { GameSave } from '../types/game';
import { FIRST_NAMES_EXPANDED, LAST_NAMES_EXPANDED } from './perpetualWorldEngine';
import { ALIEN_FIRST_NAMES, ALIEN_LAST_NAMES } from './worldEvolutionMilestonesEngine';

export const INTERGALACTIC_NATIONAL_TEAMS: NationalTeam80[] = [
  { id: 'KEP', name: 'Kepler-452b', code: 'KEP', flag: '🪐', confederation: 'CÓSMICA', fifaRanking: 12, primaryColor: '#6366f1', secondaryColor: '#4338ca', textColor: '#ffffff', reputation: 85, starPlayersSample: ['Zor-El Prime', 'Kry-Vok Centauri', 'Balth-Zor Vortex'] },
  { id: 'CEN', name: 'Proxima Centauri b', code: 'CEN', flag: '☄️', confederation: 'CÓSMICA', fifaRanking: 15, primaryColor: '#ec4899', secondaryColor: '#be185d', textColor: '#ffffff', reputation: 84, starPlayersSample: ['Zeph-Kryon Hyperion', 'Vokk-Raa Nova', 'Sol-Ark Starlight'] },
  { id: 'TRP', name: 'Trappist-1e', code: 'TRP', flag: '🌌', confederation: 'CÓSMICA', fifaRanking: 18, primaryColor: '#8b5cf6', secondaryColor: '#6d28d9', textColor: '#ffffff', reputation: 83, starPlayersSample: ['Xylar Quantum', "T'Kalon Pulsar", 'Aethel-6 Cosmos'] },
  { id: 'AND', name: 'Andrómeda Prime', code: 'AND', flag: '🛸', confederation: 'CÓSMICA', fifaRanking: 20, primaryColor: '#06b6d4', secondaryColor: '#0891b2', textColor: '#0f172a', reputation: 82, starPlayersSample: ['Drak-Nor Nebula', 'Vor-Kesh Solaris', 'Vael-Khor Zenith'] },
  { id: 'SIR', name: 'Sirio IV', code: 'SIR', flag: '✨', confederation: 'CÓSMICA', fifaRanking: 22, primaryColor: '#f59e0b', secondaryColor: '#d97706', textColor: '#0f172a', reputation: 81, starPlayersSample: ['Thok-Ra Tachyon', 'Nex-Tyron Photon', 'Kael-Zir Eclipse'] },
  { id: 'ALD', name: 'Aldebarán', code: 'ALD', flag: '🔴', confederation: 'CÓSMICA', fifaRanking: 24, primaryColor: '#ef4444', secondaryColor: '#b91c1c', textColor: '#ffffff', reputation: 80, starPlayersSample: ['Zal-Tor Supernova', 'Elor-Vex Singularity', 'Orin-Psi Orbital'] },
  { id: 'VEG', name: 'Vega Prime', code: 'VEG', flag: '⚡', confederation: 'CÓSMICA', fifaRanking: 26, primaryColor: '#10b981', secondaryColor: '#047857', textColor: '#ffffff', reputation: 79, starPlayersSample: ['Zen-Dax Kepler', 'Qrix-9 Prime', 'Balth-Zor Nova'] },
  { id: 'RIG', name: 'Rigel B', code: 'RIG', flag: '🔷', confederation: 'CÓSMICA', fifaRanking: 28, primaryColor: '#3b82f6', secondaryColor: '#1d4ed8', textColor: '#ffffff', reputation: 78, starPlayersSample: ['Sol-Ark Hyperion', 'Vor-Kesh Pulsar', 'Vael-Khor Starlight'] },
  { id: 'GLI', name: 'Gliese 667Cc', code: 'GLI', flag: '🌊', confederation: 'CÓSMICA', fifaRanking: 30, primaryColor: '#14b8a6', secondaryColor: '#0f766e', textColor: '#ffffff', reputation: 77, starPlayersSample: ['Kry-Vok Quantum', 'Zeph-Kryon Cosmos', 'Thok-Ra Zenith'] },
  { id: 'SUP', name: 'SuperTierra HD 40307g', code: 'SUP', flag: '🪐', confederation: 'CÓSMICA', fifaRanking: 32, primaryColor: '#a855f7', secondaryColor: '#7e22ce', textColor: '#ffffff', reputation: 76, starPlayersSample: ['Zor-El Solaris', "T'Kalon Nebula", 'Aethel-6 Photon'] },
  { id: 'HYG', name: 'Hygiea K2-18b', code: 'HYG', flag: '💎', confederation: 'CÓSMICA', fifaRanking: 34, primaryColor: '#0284c7', secondaryColor: '#0369a1', textColor: '#ffffff', reputation: 75, starPlayersSample: ['Drak-Nor Tachyon', 'Kael-Zir Eclipse', 'Nex-Tyron Singularity'] },
  { id: 'WLF', name: 'Wolf 1061c', code: 'WLF', flag: '🐺', confederation: 'CÓSMICA', fifaRanking: 36, primaryColor: '#64748b', secondaryColor: '#334155', textColor: '#ffffff', reputation: 74, starPlayersSample: ['Xylar Orbital', 'Vor-Kesh Kepler', 'Elor-Vex Supernova'] },
  { id: 'ORI', name: 'Nebulosa de Orión', code: 'ORI', flag: '🔮', confederation: 'CÓSMICA', fifaRanking: 38, primaryColor: '#d946ef', secondaryColor: '#a21caf', textColor: '#ffffff', reputation: 73, starPlayersSample: ['Zal-Tor Prime', 'Orin-Psi Starlight', 'Sol-Ark Nova'] },
  { id: 'CYG', name: 'Cygnus X-1', code: 'CYG', flag: '🌀', confederation: 'CÓSMICA', fifaRanking: 40, primaryColor: '#0ea5e9', secondaryColor: '#0284c7', textColor: '#ffffff', reputation: 72, starPlayersSample: ['Balth-Zor Pulsar', 'Thok-Ra Cosmos', 'Kry-Vok Quantum'] },
  { id: 'TIT', name: 'Titán Prime', code: 'TIT', flag: '🌙', confederation: 'CÓSMICA', fifaRanking: 42, primaryColor: '#f97316', secondaryColor: '#c2410c', textColor: '#ffffff', reputation: 71, starPlayersSample: ['Zeph-Kryon Zenith', "T'Kalon Hyperion", 'Vokk-Raa Solaris'] },
  { id: 'BET', name: 'Betelgeuse Nova', code: 'BET', flag: '☀️', confederation: 'CÓSMICA', fifaRanking: 44, primaryColor: '#e11d48', secondaryColor: '#9f1239', textColor: '#ffffff', reputation: 70, starPlayersSample: ['Aethel-6 Nebula', 'Drak-Nor Singularity', 'Xylar Photon'] },
];

// Register Intergalactic National Teams into the global map
INTERGALACTIC_NATIONAL_TEAMS.forEach((nat) => {
  NATIONAL_TEAMS_MAP[nat.id] = nat;
  NATIONAL_TEAMS_MAP[nat.code] = nat;
  NATIONAL_TEAMS_MAP[nat.name] = nat;
});

export function getAllNationalTeams(currentSeasonYear: number = 2026): NationalTeam80[] {
  if (currentSeasonYear >= 2226) {
    return [...NATIONAL_TEAMS_80, ...INTERGALACTIC_NATIONAL_TEAMS];
  }
  return NATIONAL_TEAMS_80;
}

export interface NationalTeamSquad {
  team: NationalTeam80;
  starters: Player[];
  bench: Player[];
  all23: Player[];
  averageRating: number;
}

// Regional / Country First Names for authentic player generation
export const REGIONAL_FIRST_NAMES: Record<string, string[]> = {
  // Conmebol
  ARG: ['Lautaro', 'Julián', 'Rodrigo', 'Enzo', 'Alexis', 'Nahuel', 'Cristian', 'Gonzalo', 'Nicolás', 'Thiago', 'Facundo', 'Valentín', 'Lucas', 'Leandro', 'Marcos'],
  BRA: ['Vinícius', 'Rodrygo', 'Gabriel', 'Lucas', 'Matheus', 'Arthur', 'Bruno', 'Danilo', 'Felipe', 'Igor', 'Pedro', 'Renan', 'Vitor', 'Caio', 'Gustavo'],
  COL: ['Luis', 'Jhon', 'James', 'Jefferson', 'Camilo', 'Daniel', 'Mateus', 'Yaser', 'Kevin', 'Richard', 'Davinson', 'Santiago', 'Johan', 'Carlos', 'Andrés'],
  URU: ['Federico', 'Darwin', 'Ronald', 'Manuel', 'Facundo', 'Mathías', 'Nicolás', 'Nahitan', 'Rodrigo', 'Brian', 'Sebastián', 'Agustín', 'Lucas', 'Emiliano', 'Franco'],
  CHI: ['Alexis', 'Ben', 'Erick', 'Marcelino', 'Darío', 'Guillermo', 'Paulo', 'Víctor', 'Gabriel', 'Felipe', 'Brayan', 'Lucas', 'Vicente', 'Alexander', 'Diego'],
  PER: ['Gianluca', 'Renato', 'Pedro', 'Luis', 'Piero', 'Oliver', 'Marcos', 'Edison', 'Bryan', 'Sergio', 'Carlos', 'Jesús', 'André', 'Jhilmar', 'Joao'],
  ECU: ['Moisés', 'Piero', 'Enner', 'Willian', 'Kendry', 'Félix', 'Pervis', 'Alan', 'Angelo', 'Jordy', 'John', 'Hernán', 'Leonardo', 'Jhoanner', 'Joel'],
  PAR: ['Miguel', 'Julio', 'Gustavo', 'Mathías', 'Ramón', 'Omar', 'Damián', 'Diego', 'Alejandro', 'Ángel', 'Kaku', 'Fabián', 'Matías', 'Junior', 'Adam'],
  VEN: ['Salomón', 'Yeferson', 'Yangel', 'Nahuel', 'Jon', 'Cristian', 'Telasco', 'Darwin', 'Jefferson', 'Miguel', 'José', 'Alexander', 'Jhon', 'Wilker', 'Kervin'],
  BOL: ['Ramiro', 'Carmelo', 'Miguel', 'Guillermo', 'Luis', 'Roberto', 'Gabriel', 'Boris', 'Marcelo', 'Lucas', 'Adalid', 'Héctor', 'Enzo', 'Bruno', 'Yomar'],

  // UEFA
  ESP: ['Rodri', 'Lamine', 'Nico', 'Pedri', 'Dani', 'Gavi', 'Fabián', 'Robin', 'Aymeric', 'Marc', 'Alejandro', 'Álvaro', 'Mikel', 'Ferran', 'David'],
  FRA: ['Kylian', 'Antoine', 'Aurélien', 'Eduardo', 'Mike', 'Theo', 'Dayot', 'William', 'Ousmane', 'Bradley', 'Warren', 'Jules', 'Adrien', 'Marcus', 'Kingsley'],
  ENG: ['Harry', 'Jude', 'Phil', 'Bukayo', 'Declan', 'Trent', 'Cole', 'Kobbie', 'John', 'Kyle', 'Ollie', 'Eberechi', 'Anthony', 'Marc', 'Jordan'],
  GER: ['Florian', 'Jamal', 'Joshua', 'Kai', 'Antonio', 'Maximilian', 'Nico', 'Jonathan', 'Robert', 'David', 'Pascal', 'Deniz', 'Waldemar', 'Alexander', 'Angelo'],
  ITA: ['Nicolò', 'Alessandro', 'Gianluigi', 'Federico', 'Sandro', 'Riccardo', 'Mateo', 'Davide', 'Gianluca', 'Lorenzo', 'Giacomo', 'Bryan', 'Andrea', 'Samuele', 'Raoul'],
  NED: ['Virgil', 'Frenkie', 'Cody', 'Xavi', 'Tijjani', 'Denzel', 'Nathan', 'Jeremie', 'Bart', 'Joey', 'Quinten', 'Matthijs', 'Micky', 'Brian', 'Stefan'],
  POR: ['Cristiano', 'Bernardo', 'Bruno', 'Rafael', 'Rúben', 'Diogo', 'João', 'Vitinha', 'Nuno', 'Gonçalo', 'Pedro', 'Francisco', 'Matheus', 'António', 'José'],
  BEL: ['Kevin', 'Romelu', 'Jérémy', 'Amadou', 'Koen', 'Timothy', 'Arthur', 'Youri', 'Charles', 'Orel', 'Johan', 'Maxim', 'Zeno', 'Arne', 'Wout'],
  CRO: ['Luka', 'Joško', 'Mateo', 'Andrej', 'Dominik', 'Lovro', 'Martin', 'Mario', 'Josip', 'Borna', 'Petar', 'Luka', 'Nikola', 'Ivan', 'Duje'],
  SUI: ['Granit', 'Manuel', 'Breel', 'Remo', 'Yann', 'Dan', 'Michel', 'Silvan', 'Ruben', 'Fabian', 'Denis', 'Vincent', 'Kwadwo', 'Ardon', 'Leonidas'],
  NOR: ['Erling', 'Martin', 'Alexander', 'Julian', 'Antonio', 'Sander', 'Kristoffer', 'Leo', 'Jørgen', 'Patrick', 'Morten', 'Fredrik', 'Stian', 'Hugo', 'David'],
  SWE: ['Alexander', 'Viktor', 'Dejan', 'Victor', 'Robin', 'Isak', 'Gabriel', 'Emil', 'Yasin', 'Ken', 'Jens', 'Samuel', 'Carl', 'Hugo', 'Lucas'],
  TUR: ['Arda', 'Hakan', 'Kenan', 'Ferdi', 'Mert', 'Barış', 'Kerem', 'Orkun', 'Kaan', 'Samet', 'İsmail', 'Zeki', 'Uğurcan', 'Semih', 'Okay'],
  DEN: ['Christian', 'Rasmus', 'Pierre-Emile', 'Joachim', 'Kasper', 'Andreas', 'Victor', 'Morten', 'Jonas', 'Mikkel', 'Alexander', 'Gustav', 'Patrick', 'Yussuf', 'Mads'],
  POL: ['Robert', 'Piotr', 'Nicola', 'Jakub', 'Łukasz', 'Sebastian', 'Karol', 'Przemysław', 'Jan', 'Bartosz', 'Taras', 'Kacper', 'Adam', 'Mateusz', 'Marcin'],
  UKR: ['Artem', 'Mykhailo', 'Oleksandr', 'Andriy', 'Viktor', 'Illia', 'Volodymyr', 'Heorhiy', 'Mykola', 'Roman', 'Vitaliy', 'Taras', 'Maksym', 'Vladyslav', 'Bohdan'],
  SCO: ['Andrew', 'Scott', 'John', 'Billy', 'Che', 'Kieran', 'Ryan', 'Callum', 'Kenny', 'Grant', 'Jack', 'Lyndon', 'Lawrence', 'Anthony', 'Ross'],
  GRE: ['Vangelis', 'Kostas', 'Tasos', 'Christos', 'Odysseas', 'Fotis', 'Dimitris', 'Giannis', 'Petros', 'Lazaros', 'Konstantinos', 'Manolis', 'Sotiris', 'Pantelis', 'Giorgos'],

  // CAF (África)
  MAR: ['Achraf', 'Brahim', 'Youssef', 'Sofyan', 'Azzedine', 'Hakim', 'Noussair', 'Bilal', 'Abde', 'Amine', 'Nayef', 'Yassine', 'Eliesse', 'Amir', 'Osame'],
  EGY: ['Mohamed', 'Omar', 'Ahmed', 'Mahmoud', 'Mostafa', 'Trézéguet', 'Emam', 'Marwan', 'Yasser', 'Zizo', 'Mohamed', 'Nasser', 'Hamdi', 'Akram', 'Ramy'],
  SEN: ['Sadio', 'Nicolas', 'Pape', 'Kalidou', 'Ismaïla', 'Idrissa', 'Habib', 'Lamine', 'Formose', 'Cheikhou', 'Edouard', 'Abdoulaye', 'Mory', 'Pathé', 'Iliman'],
  NGA: ['Victor', 'Ademola', 'Alex', 'Kelechi', 'Samuel', 'Wilfred', 'Calvin', 'Taiwo', 'Terem', 'Moses', 'Stanley', 'Semi', 'Frank', 'Fisayo', 'Raphael'],
  DZA: ['Riyad', 'Ismaël', 'Amine', 'Rayan', 'Houssem', 'Youcef', 'Baghdad', 'Ramy', 'Aïssa', 'Anthony', 'Saïd', 'Farès', 'Hicham', 'Ramiz', 'Mohamed'],
  RSA: ['Percy', 'Themba', 'Teboho', 'Ronwen', 'Khuliso', 'Aubrey', 'Mothobi', 'Sphephelo', 'Oswin', 'Evidence', 'Grant', 'Thapelo', 'Terrence', 'Sipho', 'Nkosinathi'],
  CIV: ['Franck', 'Sébastien', 'Simon', 'Oumar', 'Evan', 'Wilfried', 'Ibrahim', 'Odilon', 'Seko', 'Nicolas', 'Christian', 'Amad', 'Karim', 'Yahia', 'Jean'],

  // AFC (Asia)
  JPN: ['Kaoru', 'Takefusa', 'Wataru', 'Takumi', 'Ritsu', 'Daichi', 'Ao', 'Koki', 'Ayase', 'Shogo', 'Ko', 'Zion', 'Hiroki', 'Yukinari', 'Reo'],
  KOR: ['Heung-min', 'Min-jae', 'Kang-in', 'Hee-chan', 'In-beom', 'Jae-sung', 'Gue-sung', 'Young-woo', 'Hyun-seok', 'Seol', 'Jo', 'Bum-keun', 'Seung-ho', 'Jin-seob', 'Woo-yeong'],
  KSA: ['Salem', 'Firas', 'Saud', 'Sultan', 'Ali', 'Hassan', 'Nasser', 'Abdulelah', 'Fahad', 'Musab', 'Ayman', 'Abdullah', 'Mohammed', 'Ahmed', 'Yasser'],
  AUS: ['Jackson', 'Harry', 'Mathew', 'Keanu', 'Mitchell', 'Connor', 'Cameron', 'Craig', 'Kye', 'Nestory', 'Riley', 'Apostolos', 'Thomas', 'Jordan', 'Lewis'],

  // CONCACAF
  USA: ['Christian', 'Weston', 'Folarin', 'Yunus', 'Tyler', 'Timothy', 'Antonee', 'Chris', 'Gio', 'Brenden', 'Matt', 'Johnny', 'Mark', 'Joe', 'Malik'],
  MEX: ['Santiago', 'Edson', 'Hirving', 'Johan', 'César', 'Orbelín', 'Luis', 'Uriel', 'Alexis', 'Erick', 'Guillermo', 'Jesús', 'Julián', 'Marcel', 'Jorge'],
  CAN: ['Alphonso', 'Jonathan', 'Stephen', 'Tajon', 'Ismaël', 'Moïse', 'Alistair', 'Derek', 'Jacob', 'Maxime', 'Cyle', 'Richie', 'Kamal', 'Samuel', 'Liam'],
};

// Regional / Country Last Names
export const REGIONAL_LAST_NAMES: Record<string, string[]> = {
  ARG: ['Martínez', 'Álvarez', 'De Paul', 'Fernández', 'Mac Allister', 'Molina', 'Romero', 'Montiel', 'Otamendi', 'González', 'Garnacho', 'Pezzella', 'Palacios', 'Tagliafico', 'Armani'],
  BRA: ['Júnior', 'Silva', 'Santos', 'Alisson', 'Guimarães', 'Paquetá', 'Magalhães', 'Danilo', 'Militão', 'Ederson', 'Rodrigues', 'Oliveira', 'Costa', 'Pereira', 'Souza'],
  COL: ['Díaz', 'Rodríguez', 'Arias', 'Lerma', 'Vargas', 'Muñoz', 'Sánchez', 'Lucumí', 'Mojica', 'Ríos', 'Córdoba', 'Borré', 'Sinisterra', 'Castaño', 'Ospina'],
  URU: ['Valverde', 'Núñez', 'Araújo', 'Ugarte', 'Rochet', 'Pellistri', 'Olivera', 'De la Cruz', 'Nández', 'Bentancur', 'Giménez', 'Viña', 'Ocampo', 'Cáceres', 'Muslera'],
  CHI: ['Sánchez', 'Brereton Díaz', 'Maripán', 'Pulgar', 'Cortés', 'Núñez', 'Osorio', 'Catalán', 'Suazo', 'Echeverría', 'Loyola', 'Pavez', 'Aravena', 'Dávila', 'Vigouroux'],
  PER: ['Lapadula', 'Tapia', 'Gallese', 'Advíncula', 'Quispe', 'Sonne', 'López', 'Flores', 'Reyna', 'Peña', 'Zambrano', 'Callens', 'Cartagena', 'Polo', 'Cáceda'],
  ECU: ['Caicedo', 'Hincapié', 'Valencia', 'Pacho', 'Páez', 'Torres', 'Estupiñán', 'Franco', 'Preciado', 'Yeboah', 'Minda', 'Galíndez', 'Campana', 'Sarmiento', 'Domínguez'],
  PAR: ['Almirón', 'Enciso', 'Gómez', 'Villasanti', 'Sosa', 'Alderete', 'Bobadilla', 'Galarza', 'Romero', 'Sanabria', 'Fernández', 'Balbuena', 'Espinoza', 'Bareiro', 'Coronel'],
  VEN: ['Rondón', 'Soteldo', 'Herrera', 'Ferraresi', 'Romo', 'Aramburu', 'Martínez', 'Casseres', 'Machís', 'Bello', 'Navarro', 'Osorio', 'Rincón', 'Cádiz', 'Graterol'],
  BOL: ['Vaca', 'Algarañaz', 'Terceros', 'Viscarra', 'Haquín', 'Fernández', 'Cuéllar', 'Céspedes', 'Medina', 'Chávez', 'Sagredo', 'Villamil', 'Roca', 'Lampe', 'Monteiro'],

  ESP: ['Hernández', 'Yamal', 'Williams', 'González', 'Carvajal', 'Gavi', 'Ruiz', 'Le Normand', 'Laporte', 'Cucurella', 'Baena', 'Morata', 'Merino', 'Torres', 'Simón'],
  FRA: ['Mbappé', 'Griezmann', 'Tchouaméni', 'Camavinga', 'Maignan', 'Hernandez', 'Upamecano', 'Saliba', 'Dembélé', 'Barcola', 'Zaïre-Emery', 'Koundé', 'Rabiot', 'Thuram', 'Coman'],
  ENG: ['Kane', 'Bellingham', 'Foden', 'Saka', 'Rice', 'Alexander-Arnold', 'Palmer', 'Mainoo', 'Stones', 'Walker', 'Watkins', 'Eze', 'Gordon', 'Guéhi', 'Pickford'],
  GER: ['Wirtz', 'Musiala', 'Kimmich', 'Havertz', 'Rüdiger', 'Mittelstädt', 'Schlotterbeck', 'Tah', 'Andrich', 'Raum', 'Groß', 'Undav', 'Anton', 'Nübel', 'Stiller'],
  ITA: ['Barella', 'Bastoni', 'Donnarumma', 'Dimarco', 'Tonali', 'Calafiori', 'Retegui', 'Frattesi', 'Scamacca', 'Pellegrini', 'Raspadori', 'Cristante', 'Cambiaso', 'Ricci', 'Bellanova'],
  NED: ['van Dijk', 'de Jong', 'Gakpo', 'Simons', 'Reijnders', 'Dumfries', 'Aké', 'Frimpong', 'Verbruggen', 'Veerman', 'Timber', 'de Ligt', 'van de Ven', 'Brobbey', 'de Vrij'],
  POR: ['Ronaldo', 'Silva', 'Fernandes', 'Leão', 'Dias', 'Jota', 'Cancelo', 'Vitinha', 'Mendes', 'Ramos', 'Neto', 'Conceição', 'Nunes', 'Silva', 'Sá'],
  BEL: ['De Bruyne', 'Lukaku', 'Doku', 'Onana', 'Casteels', 'Castagne', 'Theate', 'Tielemans', 'De Ketelaere', 'Mangala', 'Bakayoko', 'De Cuyper', 'Debast', 'Engels', 'Faes'],
  CRO: ['Modrić', 'Gvardiol', 'Kovačić', 'Kramarić', 'Livaković', 'Majer', 'Baturina', 'Pašalić', 'Stanišić', 'Sosa', 'Sučić', 'Ivanušec', 'Vlašić', 'Pongračić', 'Labrović'],
  SUI: ['Xhaka', 'Akanji', 'Embolo', 'Freuler', 'Sommer', 'Ndoye', 'Aebischer', 'Widmer', 'Vargas', 'Rieder', 'Zakaria', 'Sierro', 'Duah', 'Jashari', 'Kobel'],
  NOR: ['Haaland', 'Ødegaard', 'Sørloth', 'Ryerson', 'Nusa', 'Berge', 'Ajer', 'Østigård', 'Strand Larsen', 'Berg', 'Thorsby', 'Aursnes', 'Gregersen', 'Vetlesen', 'Nyland'],
  SWE: ['Isak', 'Gyökeres', 'Kulusevski', 'Lindelöf', 'Olsen', 'Hien', 'Gudmundsson', 'Forsberg', 'Ayari', 'Sema', 'Cajuste', 'Salétros', 'Starfelt', 'Larsson', 'Bergvall'],
  TUR: ['Güler', 'Çalhanoğlu', 'Yıldız', 'Kadıoğlu', 'Günok', 'Alper Yılmaz', 'Aktürkoğlu', 'Kökçü', 'Ayhan', 'Akaydin', 'Yüksek', 'Çelik', 'Çakır', 'Kılıçsoy', 'Yokuşlu'],
  DEN: ['Eriksen', 'Højlund', 'Højbjerg', 'Andersen', 'Schmeichel', 'Christensen', 'Kristiansen', 'Hjulmand', 'Wind', 'Damsgaard', 'Bah', 'Isaksen', 'Dorgu', 'Poulsen', 'Hermansen'],
  POL: ['Lewandowski', 'Zieliński', 'Zalewski', 'Kiwior', 'Skorupski', 'Szymański', 'Świderski', 'Frankowski', 'Bednarek', 'Slisz', 'Romanczuk', 'Urbański', 'Buksa', 'Piatkowski', 'Bulka'],
  UKR: ['Dovbyk', 'Mudryk', 'Zinchenko', 'Lunin', 'Tsygankov', 'Zabarnyi', 'Brazhko', 'Sudakov', 'Matviyenko', 'Yaremchuk', 'Mykolenko', 'Stepanenko', 'Talovierov', 'Vanat', 'Trubin'],
  SCO: ['Robertson', 'McTominay', 'McGinn', 'Gilmour', 'Adams', 'Tierney', 'Christie', 'McGregor', 'McLean', 'Hanley', 'Hendry', 'Dykes', 'Shankland', 'Ralston', 'Gunn'],
  GRE: ['Pavlidis', 'Tsimikas', 'Bakasetas', 'Tzolis', 'Vlachodimos', 'Ioannidis', 'Pelkas', 'Mantalos', 'Kourbelis', 'Rota', 'Mavropanos', 'Koulierakis', 'Siopis', 'Chatzidiakos', 'Tzolakis'],

  MAR: ['Hakimi', 'Brahim', 'En-Nesyri', 'Amrabat', 'Ounahi', 'Ziyech', 'Mazraoui', 'El Khannouss', 'Ezzalzouli', 'Adli', 'Aguerd', 'Bounou', 'Ben Seghir', 'Richardson', 'Sahraoui'],
  EGY: ['Salah', 'Marmoush', 'Mohamed', 'Hegazi', 'Ashour', 'Trézéguet', 'Fathi', 'Attia', 'Ibrahim', 'Sayed', 'El Shenawy', 'Maher', 'Fathy', 'Tawfik', 'Rabia'],
  SEN: ['Mané', 'Jackson', 'Sarr', 'Koulibaly', 'Gueye', 'Mendy', 'Diallo', 'Diata', 'Ndiaye', 'Jakobs', 'Mendy', 'Seck', 'Diaw', 'Ciss', 'Ndiaye'],
  NGA: ['Osimhen', 'Lookman', 'Iwobi', 'Iheanacho', 'Chukwueze', 'Ndidi', 'Bassey', 'Awoniyi', 'Moffi', 'Simon', 'Nwabali', 'Ajayi', 'Onyeka', 'Dele-Bashiru', 'Onyemaechi'],
  DZA: ['Mahrez', 'Bennacer', 'Gouiri', 'Aït-Nouri', 'Aouar', 'Belaïli', 'Bounedjah', 'Bensebaini', 'Mandi', 'Mandrea', 'Benrahma', 'Chaïbi', 'Boudaoui', 'Zerrouki', 'Amoura'],
  RSA: ['Tau', 'Zwane', 'Mokoena', 'Williams', 'Mudau', 'Modiba', 'Mvala', 'Sithole', 'Appollis', 'Makgopa', 'Kekana', 'Morena', 'Masilake', 'Mbatha', 'Rayners'],
  CIV: ['Kessié', 'Haller', 'Adingra', 'Diakité', 'Ndicka', 'Zaha', 'Sangaré', 'Kossounou', 'Fofana', 'Pépé', 'Kouamé', 'Diallo', 'Konaté', 'Fofana', 'Koné'],

  JPN: ['Mitoma', 'Kubo', 'Endo', 'Minamino', 'Doan', 'Kamada', 'Tanaka', 'Ogawa', 'Ueda', 'Taniguchi', 'Itakura', 'Suzuki', 'Ito', 'Sugawara', 'Hatate'],
  KOR: ['Son', 'Kim', 'Lee', 'Hwang', 'Hwang', 'Lee', 'Cho', 'Seol', 'Hong', 'Bae', 'Hyun-woo', 'Song', 'Paik', 'Park', 'Jeong'],
  KSA: ['Al-Dawsari', 'Al-Buraikan', 'Abdulhamid', 'Al-Ghannam', 'Al-Bulaihi', 'Tambakti', 'Al-Dawsari', 'Al-Malki', 'Al-Muwallad', 'Al-Juwayr', 'Yahya', 'Al-Hamdan', 'Kanno', 'Al-Ghamdi', 'Al-Kassar'],
  AUS: ['Irvine', 'Souttar', 'Ryan', 'Baccus', 'Duke', 'Metcalfe', 'Burgess', 'Goodwin', 'Rowles', 'Irankunda', 'McGree', 'Stamatelopoulos', 'Deng', 'Bos', 'Gauci'],

  USA: ['Pulisic', 'McKennie', 'Balogun', 'Musah', 'Adams', 'Weah', 'Robinson', 'Richards', 'Reyna', 'Aaronson', 'Turner', 'Cardoso', 'McKenzie', 'Scally', 'Tillman'],
  MEX: ['Giménez', 'Álvarez', 'Lozano', 'Vásquez', 'Montes', 'Pineda', 'Chávez', 'Antuna', 'Vega', 'Sánchez', 'Ochoa', 'Gallardo', 'Quiñones', 'Ruiz', 'Malagón'],
  CAN: ['Davies', 'David', 'Eustáquio', 'Buchanan', 'Koné', 'Bombito', 'Johnston', 'Cornelius', 'Shaffelburg', 'Crépeau', 'Larin', 'Laryea', 'Miller', 'Ahmed', 'Millar'],
};

// Populate alien civilizations into name pools
['KEP', 'CEN', 'TRP', 'AND', 'SIR', 'ALD', 'VEG', 'RIG', 'GLI', 'SUP', 'HYG', 'WLF', 'ORI', 'CYG', 'TIT', 'BET'].forEach((c) => {
  REGIONAL_FIRST_NAMES[c] = ALIEN_FIRST_NAMES;
  REGIONAL_LAST_NAMES[c] = ALIEN_LAST_NAMES;
});

/**
 * Creates an authentic international-caliber player for a national team
 */
export function createGeneratedInternational(
  id: string,
  country: NationalTeam80,
  pos: Position,
  targetOvr: number,
  customFullName?: string
): Player {
  const cCode = country.code;
  const isAlien = ['KEP', 'CEN', 'TRP', 'AND', 'SIR', 'ALD', 'VEG', 'RIG', 'GLI', 'SUP', 'HYG', 'WLF', 'ORI', 'CYG', 'TIT', 'BET'].includes(cCode) || country.confederation === 'CÓSMICA';
  const firstPool = isAlien ? ALIEN_FIRST_NAMES : (REGIONAL_FIRST_NAMES[cCode] || FIRST_NAMES_EXPANDED[cCode] || ['Alex', 'David', 'Carlos', 'Marco', 'Gabriel', 'Daniel', 'Julian', 'Lucas', 'Leo', 'Mateo', 'Victor', 'Arthur', 'Samuel', 'Hugo', 'Martin']);
  const lastPool = isAlien ? ALIEN_LAST_NAMES : (REGIONAL_LAST_NAMES[cCode] || LAST_NAMES_EXPANDED[cCode] || ['Silva', 'Santos', 'García', 'Fernández', 'Popov', 'Jovanovic', 'Smith', 'Kovacic', 'Müller', 'Traoré', 'Diallo', 'Kim', 'Tanaka', 'Ivanov', 'Novak']);

  let firstName: string;
  let lastName: string;

  if (customFullName && customFullName.trim().includes(' ')) {
    const parts = customFullName.trim().split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  } else if (customFullName) {
    firstName = customFullName.trim();
    lastName = lastPool[Math.floor(Math.random() * lastPool.length)];
  } else {
    firstName = firstPool[Math.floor(Math.random() * firstPool.length)];
    lastName = lastPool[Math.floor(Math.random() * lastPool.length)];
  }

  const age = Math.floor(19 + Math.random() * 15); // 19 - 33 years
  const ovr = Math.max(68, Math.min(94, Math.round(targetOvr + (Math.random() * 6 - 3))));
  const isGk = pos === 'POR';

  const p: Player = {
    id,
    firstName,
    lastName,
    nationality: country.flag ? `${country.flag} ${country.name}` : country.name,
    birthDate: `${2026 - age}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    age,
    primaryPosition: pos,
    overallRating: ovr,
    potential: Math.min(99, ovr + (age < 24 ? 6 : 1)),
    clubId: null,
    isTransferListed: false,
    isLoanListed: false,
    marketValue: ovr * ovr * 4500,
    attributes: {
      disparo: isGk ? 15 : Math.round(ovr * (pos === 'DC' ? 1.05 : 0.85)),
      pase: isGk ? 45 : Math.round(ovr * (pos === 'MC' || pos === 'MCO' ? 1.05 : 0.9)),
      regate: isGk ? 20 : Math.round(ovr * 0.95),
      defensa: isGk ? 25 : Math.round(ovr * (pos === 'DFC' || pos === 'MCD' ? 1.05 : 0.65)),
      velocidad: Math.round(ovr * 0.95),
      resistencia: Math.round(ovr * 0.95),
      fuerza: Math.round(ovr * 0.95),
      vision: Math.round(ovr * 0.9),
      liderazgo: Math.round(55 + (age - 20) * 2),
      reflejos: isGk ? ovr : undefined,
      paradas: isGk ? ovr : undefined,
    },
    contract: {
      wagePerWeek: Math.round(ovr * 90),
      contractEndYear: 2029,
      releaseClause: ovr * ovr * 9000,
      squadStatus: 'Titular',
    },
    fitness: 100,
    morale: 90,
    matchReadiness: 90,
    isInjured: false,
    seasonStats: {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
      cleanSheets: 0,
      averageRating: 7.0,
    },
  };

  (p as any).countryId = country.id;
  return p;
}

/**
 * Returns or builds the official 23-player national team squad for any of the 80 nations.
 * Guaranteed:
 * - Minimum 23 players ALWAYS
 * - Balanced positions: 3 Goalkeepers, 7 Defenders, 7 Midfielders, 6 Forwards
 */
export function getOrBuildNationalSquad(
  countryId: string,
  playersMap: Record<string, Player>
): NationalTeamSquad {
  const team = NATIONAL_TEAMS_MAP[countryId] || 
    NATIONAL_TEAMS_80.find(n => n.id === countryId || n.name.toLowerCase() === countryId.toLowerCase()) || 
    NATIONAL_TEAMS_80[0];

  // 1. Filter all database players of this nationality
  const countryPlayers = Object.values(playersMap || {}).filter((p) => {
    const pNat = p.nationality || '';
    return (
      pNat === team.name ||
      pNat === team.code ||
      pNat === team.id ||
      pNat.toLowerCase() === team.name.toLowerCase() ||
      (p as any).countryId === team.id
    );
  });

  // Target base rating for this country based on FIFA ranking
  const targetBaseOvr = Math.max(70, Math.min(88, 92 - Math.round(team.fifaRanking * 0.25)));

  // Separate by tactical lines
  const gks = countryPlayers.filter((p) => p.primaryPosition === 'POR').sort((a, b) => b.overallRating - a.overallRating);
  const defs = countryPlayers.filter((p) => ['DFC', 'LD', 'LI'].includes(p.primaryPosition)).sort((a, b) => b.overallRating - a.overallRating);
  const mids = countryPlayers.filter((p) => ['MCD', 'MC', 'MCO'].includes(p.primaryPosition)).sort((a, b) => b.overallRating - a.overallRating);
  const fwds = countryPlayers.filter((p) => ['DC', 'ED', 'EI'].includes(p.primaryPosition)).sort((a, b) => b.overallRating - a.overallRating);

  // Ensure minimum quota: 3 GKs, 7 Defs, 7 Mids, 6 Fwds = 23 players
  const neededGks = Math.max(0, 3 - gks.length);
  const neededDefs = Math.max(0, 7 - defs.length);
  const neededMids = Math.max(0, 7 - mids.length);
  const neededFwds = Math.max(0, 6 - fwds.length);

  for (let i = 0; i < neededGks; i++) {
    gks.push(createGeneratedInternational(`nat_${team.id.toLowerCase()}_gk_gen_${i + 1}`, team, 'POR', targetBaseOvr - 2));
  }
  for (let i = 0; i < neededDefs; i++) {
    const pos: Position = i % 3 === 0 ? 'LD' : i % 3 === 1 ? 'LI' : 'DFC';
    defs.push(createGeneratedInternational(`nat_${team.id.toLowerCase()}_def_gen_${i + 1}`, team, pos, targetBaseOvr));
  }
  for (let i = 0; i < neededMids; i++) {
    const pos: Position = i % 2 === 0 ? 'MC' : 'MCD';
    mids.push(createGeneratedInternational(`nat_${team.id.toLowerCase()}_mid_gen_${i + 1}`, team, pos, targetBaseOvr));
  }
  for (let i = 0; i < neededFwds; i++) {
    const pos: Position = i % 3 === 0 ? 'DC' : i % 3 === 1 ? 'ED' : 'EI';
    fwds.push(createGeneratedInternational(`nat_${team.id.toLowerCase()}_fwd_gen_${i + 1}`, team, pos, targetBaseOvr + 1));
  }

  // Selected 23
  const selectedGks = gks.slice(0, 3);
  const selectedDefs = defs.slice(0, 7);
  const selectedMids = mids.slice(0, 7);
  const selectedFwds = fwds.slice(0, 6);

  // Starters 4-3-3: 1 GK, 4 DEF (1 LD, 2 DFC, 1 LI), 3 MID, 3 FWD
  const starters: Player[] = [
    selectedGks[0],
    selectedDefs.find((p) => p.primaryPosition === 'LD') || selectedDefs[0],
    selectedDefs.filter((p) => p.primaryPosition === 'DFC')[0] || selectedDefs[1],
    selectedDefs.filter((p) => p.primaryPosition === 'DFC')[1] || selectedDefs[2],
    selectedDefs.find((p) => p.primaryPosition === 'LI') || selectedDefs[3],
    selectedMids[0],
    selectedMids[1],
    selectedMids[2],
    selectedFwds.find((p) => p.primaryPosition === 'ED') || selectedFwds[0],
    selectedFwds.find((p) => p.primaryPosition === 'DC') || selectedFwds[1],
    selectedFwds.find((p) => p.primaryPosition === 'EI') || selectedFwds[2],
  ];

  // Bench: Remaining 12 players
  const starterIds = new Set(starters.map((p) => p.id));
  const all23 = [...selectedGks, ...selectedDefs, ...selectedMids, ...selectedFwds];
  const bench = all23.filter((p) => !starterIds.has(p.id));

  const averageRating = Math.round(all23.reduce((acc, p) => acc + p.overallRating, 0) / all23.length);

  return {
    team,
    starters,
    bench,
    all23,
    averageRating,
  };
}

/**
 * Ensures that EVERY national team in the 80 nations has:
 * 1. At least 50 selectable players in save.players (with balanced POR, DEF, MED, DEL)
 * 2. At least 23 called-up players in squadPlayerIds if managed by user or in role
 */
export function ensureAllNationalTeamsPools(save: GameSave): { updatedSave: GameSave; addedCount: number } {
  const updatedPlayers: Record<string, Player> = { ...(save.players || {}) };
  let addedCount = 0;
  const currentSeasonYear = parseInt((save.currentSeason || '2026').slice(0, 4), 10) || 2026;
  const allNations = getAllNationalTeams(currentSeasonYear);

  for (const nat of allNations) {
    // 1. Gather all existing players for this nationality
    const natNameLower = nat.name.toLowerCase();
    const existing = Object.values(updatedPlayers).filter((p) => {
      const pNat = (p.nationality || '').toLowerCase();
      return (
        pNat === natNameLower ||
        pNat.includes(natNameLower) ||
        natNameLower.includes(pNat) ||
        (nat.flag && pNat.includes(nat.flag)) ||
        p.nationality === nat.code ||
        p.nationality === nat.id ||
        (p as any).countryId === nat.id
      );
    });

    const targetBaseOvr = Math.max(70, Math.min(88, 92 - Math.round(nat.fifaRanking * 0.25)));

    // Count by position lines
    const gks = existing.filter((p) => p.primaryPosition === 'POR');
    const defs = existing.filter((p) => ['DFC', 'LD', 'LI'].includes(p.primaryPosition));
    const mids = existing.filter((p) => ['MCD', 'MC', 'MCO'].includes(p.primaryPosition));
    const fwds = existing.filter((p) => ['DC', 'ED', 'EI'].includes(p.primaryPosition));

    // First: ensure any real stars in starPlayersSample exist
    if (nat.starPlayersSample && nat.starPlayersSample.length > 0) {
      for (let sIdx = 0; sIdx < nat.starPlayersSample.length; sIdx++) {
        const starName = nat.starPlayersSample[sIdx];
        const alreadyHasStar = existing.some((p) => 
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(starName.toLowerCase()) ||
          starName.toLowerCase().includes(p.lastName.toLowerCase())
        );

        if (!alreadyHasStar) {
          const pos: Position = sIdx === 0 ? 'DC' : sIdx === 1 ? 'MC' : sIdx === 2 ? 'EI' : sIdx === 3 ? 'DFC' : 'POR';
          const starOvr = Math.min(92, targetBaseOvr + 4 + (4 - sIdx));
          const starPlayer = createGeneratedInternational(
            `nat_${nat.id.toLowerCase()}_star_${sIdx + 1}`,
            nat,
            pos,
            starOvr,
            starName
          );
          updatedPlayers[starPlayer.id] = starPlayer;
          existing.push(starPlayer);
          if (pos === 'POR') gks.push(starPlayer);
          else if (['DFC', 'LD', 'LI'].includes(pos)) defs.push(starPlayer);
          else if (['MCD', 'MC', 'MCO'].includes(pos)) mids.push(starPlayer);
          else fwds.push(starPlayer);
          addedCount++;
        }
      }
    }

    // Target minimums: 5 POR, 15 DEF, 15 MED, 15 DEL = 50 selectable players minimum
    const neededGks = Math.max(0, 5 - gks.length);
    const neededDefs = Math.max(0, 15 - defs.length);
    const neededMids = Math.max(0, 15 - mids.length);
    const neededFwds = Math.max(0, 15 - fwds.length);

    for (let i = 0; i < neededGks; i++) {
      const p = createGeneratedInternational(`nat_${nat.id.toLowerCase()}_gk_${Date.now().toString(36)}_${i}`, nat, 'POR', targetBaseOvr - 2);
      updatedPlayers[p.id] = p;
      existing.push(p);
      gks.push(p);
      addedCount++;
    }

    for (let i = 0; i < neededDefs; i++) {
      const pos: Position = i % 3 === 0 ? 'LD' : i % 3 === 1 ? 'LI' : 'DFC';
      const p = createGeneratedInternational(`nat_${nat.id.toLowerCase()}_def_${Date.now().toString(36)}_${i}`, nat, pos, targetBaseOvr);
      updatedPlayers[p.id] = p;
      existing.push(p);
      defs.push(p);
      addedCount++;
    }

    for (let i = 0; i < neededMids; i++) {
      const pos: Position = i % 3 === 0 ? 'MCD' : i % 3 === 1 ? 'MC' : 'MCO';
      const p = createGeneratedInternational(`nat_${nat.id.toLowerCase()}_mid_${Date.now().toString(36)}_${i}`, nat, pos, targetBaseOvr);
      updatedPlayers[p.id] = p;
      existing.push(p);
      mids.push(p);
      addedCount++;
    }

    for (let i = 0; i < neededFwds; i++) {
      const pos: Position = i % 3 === 0 ? 'DC' : i % 3 === 1 ? 'ED' : 'EI';
      const p = createGeneratedInternational(`nat_${nat.id.toLowerCase()}_fwd_${Date.now().toString(36)}_${i}`, nat, pos, targetBaseOvr + 1);
      updatedPlayers[p.id] = p;
      existing.push(p);
      fwds.push(p);
      addedCount++;
    }

    // If total still under 50, top up
    while (existing.length < 50) {
      const idx = existing.length;
      const pos: Position = idx % 4 === 0 ? 'POR' : idx % 4 === 1 ? 'DFC' : idx % 4 === 2 ? 'MC' : 'DC';
      const p = createGeneratedInternational(`nat_${nat.id.toLowerCase()}_extra_${Date.now().toString(36)}_${idx}`, nat, pos, targetBaseOvr);
      updatedPlayers[p.id] = p;
      existing.push(p);
      addedCount++;
    }
  }

  // 3. Ensure manager's national squad has at least 23 convocados
  let updatedManager = { ...save.manager };
  if (updatedManager.nationalTeamRole) {
    const role = updatedManager.nationalTeamRole;
    const countryId = role.countryId;
    const natTeam = NATIONAL_TEAMS_MAP[countryId] || 
      NATIONAL_TEAMS_80.find(n => n.id === countryId || n.name.toLowerCase() === role.countryName.toLowerCase()) || 
      NATIONAL_TEAMS_80[0];

    const currentSquad = getOrBuildNationalSquad(natTeam.id, updatedPlayers);
    const currentCalledUp = role.squadPlayerIds || [];

    // Ensure squadPlayerIds has at least 23 players
    let finalCalledUp = currentCalledUp.filter((id) => updatedPlayers[id]);
    if (finalCalledUp.length < 23) {
      finalCalledUp = currentSquad.all23.map((p) => p.id);
    }

    updatedManager = {
      ...updatedManager,
      nationalTeamRole: {
        ...role,
        countryId: natTeam.id,
        countryName: `Selección de ${natTeam.name}`,
        flag: natTeam.flag,
        squadPlayerIds: finalCalledUp,
      },
    };
  }

  return {
    updatedSave: {
      ...save,
      players: updatedPlayers,
      manager: updatedManager,
    },
    addedCount,
  };
}
