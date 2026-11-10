import { Position, Player } from '../types/player';
import { ClubSeedData } from '../db/worldClubs/spainTier1';

export const FIRST_NAMES_BY_COUNTRY: Record<string, string[]> = {
  ESP: ['Alejandro', 'Javier', 'Carlos', 'Pablo', 'Sergio', 'David', 'Adrián', 'Álvaro', 'Marcos', 'Hugo', 'Daniel', 'Lucas', 'Manuel', 'Iker', 'Mario', 'Jorge', 'Raúl', 'Rubén', 'Iván', 'Mateo'],
  ENG: ['Harry', 'Jack', 'Oliver', 'George', 'Charlie', 'James', 'Thomas', 'Jacob', 'William', 'Alfie', 'Joshua', 'Edward', 'Henry', 'Arthur', 'Freddie', 'Leo', 'Archie', 'Mason', 'Theo', 'Liam'],
  ITA: ['Lorenzo', 'Leonardo', 'Francesco', 'Alessandro', 'Mattia', 'Andrea', 'Gabriele', 'Matteo', 'Tommaso', 'Riccardo', 'Edoardo', 'Federico', 'Davide', 'Giuseppe', 'Marco', 'Filippo', 'Luca', 'Giovanni', 'Simone', 'Pietro'],
  GER: ['Lukas', 'Maximilian', 'Felix', 'Jonas', 'Paul', 'Julian', 'Niklas', 'Leon', 'Tim', 'Jan', 'Finn', 'Elias', 'Florian', 'Tobias', 'Moritz', 'Alexander', 'Simon', 'David', 'Philipp', 'Fabian'],
  FRA: ['Lucas', 'Hugo', 'Louis', 'Arthur', 'Jules', 'Gabriel', 'Léo', 'Raphaël', 'Paul', 'Maxime', 'Antoine', 'Clément', 'Alexandre', 'Enzo', 'Nathan', 'Thomas', 'Mathis', 'Romain', 'Théo', 'Valentin'],
  POR: ['Gonçalo', 'Rodrigo', 'Martim', 'Afonso', 'Tiago', 'Diogo', 'Tomás', 'Duarte', 'Salvador', 'Miguel', 'Francisco', 'Guilherme', 'Gabriel', 'Santiago', 'Lourenço', 'Bernardo', 'Lucas', 'Simão', 'Pedro', 'Rafael'],
  NED: ['Daan', 'Sem', 'Lucas', 'Milan', 'Levi', 'Finn', 'Jesse', 'Luuk', 'Bram', 'Thomas', 'Ruben', 'Lars', 'Liam', 'Thijs', 'Julian', 'Stijn', 'Tim', 'Noah', 'Jayden', 'Niek'],
  BEL: ['Arthur', 'Noah', 'Jules', 'Louis', 'Lucas', 'Liam', 'Adam', 'Victor', 'Gabriel', 'Maxime', 'Félix', 'Mathis', 'Eden', 'Robin', 'Arno', 'Luka', 'Milan', 'Simon', 'Niels', 'Senne'],
  SCO: ['Callum', 'Lewis', 'Jack', 'James', 'Logan', 'Alexander', 'Harris', 'Finlay', 'Rory', 'Brodie', 'Cameron', 'Archie', 'Fraser', 'Alasdair', 'Hamish', 'Euan', 'Duncan', 'Calum', 'Craig', 'Blair'],
  TUR: ['Yusuf', 'Eray', 'Mehmet', 'Mustafa', 'Ahmet', 'Ali', 'Emre', 'Burak', 'Hakan', 'Serkan', 'Kerem', 'Arda', 'Barış', 'Deniz', 'Can', 'Oğuz', 'Kaan', 'Tolga', 'Semih', 'Batuhan'],
  GRE: ['Konstantinos', 'Georgios', 'Dimitrios', 'Ioannis', 'Nikolaos', 'Panagiotis', 'Vasileios', 'Christos', 'Athanasios', 'Michail', 'Alexandros', 'Spyridon', 'Evangelos', 'Andreas', 'Stefanos', 'Stavros', 'Theodoros', 'Petros', 'Antonios', 'Marios'],
  SUI: ['Noah', 'Liam', 'Matteo', 'Leon', 'Luca', 'Elias', 'Nino', 'Julian', 'Fabian', 'Lukas', 'Marco', 'Sandro', 'Silvan', 'Pascal', 'Yannick', 'Remo', 'Janick', 'Reto', 'Stefan', 'Simon'],
  KSA: ['Mohammed', 'Abdullah', 'Fahad', 'Salem', 'Sultan', 'Saud', 'Nawaf', 'Ali', 'Hassan', 'Yasser', 'Khalid', 'Omar', 'Abdulrahman', 'Nasser', 'Bandar', 'Mansour', 'Saleh', 'Majed', 'Turki', 'Faisal'],
  JPN: ['Takumi', 'Daichi', 'Hiroki', 'Yuto', 'Koki', 'Sho', 'Ryota', 'Ren', 'Sora', 'Haruto', 'Yuki', 'Shota', 'Kazuki', 'Hayato', 'Taiga', 'Kota', 'Riku', 'Kenji', 'Shinji', 'Tsubasa'],
  MAR: ['Youssef', 'Amine', 'Mehdi', 'Hamza', 'Achraf', 'Soufiane', 'Ayoub', 'Zakaria', 'Bilal', 'Anas', 'Oussama', 'Reda', 'Walid', 'Ismail', 'Ilyas', 'Taha', 'Hicham', 'Karim', 'Rayan', 'Marouane'],
  EGY: ['Mohamed', 'Ahmed', 'Mahmoud', 'Tarek', 'Karim', 'Mostafa', 'Omar', 'Youssef', 'Amr', 'Hassan', 'Hussein', 'Ibrahim', 'Ali', 'Ziad', 'Khaled', 'Sherif', 'Ramy', 'Marwan', 'Akram', 'Emam'],
  RSA: ['Themba', 'Percy', 'Sipho', 'Teboho', 'Ronwen', 'Bongani', 'Keagan', 'Aubrey', 'Lyle', 'Sphephelo', 'Grant', 'Terrence', 'Thapelo', 'Nkosinathi', 'Bathusi', 'Goodman', 'Monnapule', 'Evidence', 'Oswin', 'Khuliso'],
  NGA: ['Victor', 'Samuel', 'Kelechi', 'Wilfred', 'Alex', 'Ademola', 'Moses', 'Terem', 'Frank', 'Joe', 'Calvin', 'Bright', 'Raphael', 'Stanley', 'Chidera', 'Taiwo', 'Cyriel', 'Semi', 'Kenneth', 'Ola'],
  SEN: ['Sadio', 'Kalidou', 'Idrissa', 'Édouard', 'Ismaïla', 'Pape', 'Boulaye', 'Nicolas', 'Pathé', 'Cheikhou', 'Habib', 'Abdou', 'Formose', 'Lamine', 'Iliman', 'Krépin', 'Bamba', 'Nampalys', 'Moustapha', 'Alfred'],
  DZA: ['Riyad', 'Ismaël', 'Youcef', 'Baghdad', 'Sofiane', 'Ramy', 'Aïssa', 'Houssem', 'Farès', 'Amine', 'Ramiz', 'Hicham', 'Anthony', 'Billal', 'Saïd', 'Adem', 'Badredine', 'Mohamed', 'Yassine', 'Nabil'],
  ARG: ['Facundo', 'Lautaro', 'Agustín', 'Joaquín', 'Nicolás', 'Santiago', 'Mateo', 'Ignacio', 'Tomás', 'Bautista', 'Thiago', 'Matías', 'Franco', 'Benjamín', 'Gonzalo', 'Julián', 'Rodrigo', 'Lucas', 'Enzo', 'Valentín'],
  BRA: ['Gabriel', 'Lucas', 'Matheus', 'Guilherme', 'Felipe', 'Gustavo', 'Rafael', 'Leonardo', 'Thiago', 'Vinícius', 'Bruno', 'Rodrigo', 'Eduardo', 'Caio', 'Danilo', 'Igor', 'Marcelo', 'Murilo', 'Otávio', 'Renan'],
  USA: ['Christian', 'Tyler', 'Weston', 'Brendan', 'Walker', 'Miles', 'Cameron', 'Sergiño', 'Antonee', 'Mark', 'Ethan', 'Paxten', 'Cade', 'Cole', 'Jack', 'Aidan', 'Griffin', 'Keaton', 'Quinn', 'Brooks'],
  MEX: ['Santiago', 'Mateo', 'Sebastián', 'Leonardo', 'Emiliano', 'Diego', 'Daniel', 'Alexander', 'Jesús', 'Carlos', 'Eduardo', 'Mauricio', 'Javier', 'Rodrigo', 'Fernando', 'César', 'Edson', 'Héctor', 'Raúl', 'Alan'],
  COL: ['Juan', 'Camilo', 'Sebastián', 'Santiago', 'Mateo', 'Andrés', 'Nicolás', 'Felipe', 'Alejandro', 'Daniel', 'Carlos', 'David', 'Esteban', 'Julián', 'Cristian', 'Diego', 'Gabriel', 'Jhon', 'Luis', 'Brayan'],
  CHI: ['Benjamín', 'Vicente', 'Martín', 'Matías', 'Joaquín', 'Agustín', 'Cristóbal', 'Maximiliano', 'Lucas', 'Tomás', 'Ignacio', 'Felipe', 'Diego', 'Nicolás', 'Sebastián', 'Gabriel', 'Alonso', 'Esteban', 'Claudio', 'Rodrigo'],
  URU: ['Santiago', 'Mateo', 'Joaquín', 'Agustín', 'Lucas', 'Ignacio', 'Facundo', 'Matías', 'Martín', 'Nicolás', 'Sebastián', 'Federico', 'Rodrigo', 'Emiliano', 'Nahuel', 'Bruno', 'Manuel', 'Maximiliano', 'Diego', 'Gastón'],
};

export const LAST_NAMES_BY_COUNTRY: Record<string, string[]> = {
  ESP: ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez'],
  ENG: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke'],
  ITA: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti'],
  GER: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann'],
  FRA: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'],
  POR: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Jesus', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes', 'Marques', 'Alves', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho'],
  NED: ['de Jong', 'Jansen', 'de Vries', 'van de Berg', 'van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer'],
  BEL: ['Peeters', 'Janssens', 'Maes', 'Jacobs', 'Willems', 'Mertens', 'Claes', 'Goossens', 'Wouters', 'De Smet', 'Vermeulen', 'Pauwels', 'Hermans', 'Michiels', 'Martens', 'Aerts', 'Claeys', 'De Clercq', 'Vandamme', 'Bogaert'],
  SCO: ['Smith', 'Brown', 'Wilson', 'Thomson', 'Robertson', 'Campbell', 'Stewart', 'Anderson', 'MacDonald', 'Scott', 'Reid', 'Murray', 'Taylor', 'Clark', 'Ross', 'Watson', 'Morrison', 'Paterson', 'Young', 'Walker'],
  TUR: ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek'],
  GRE: ['Papadopoulos', 'Papageorgiou', 'Oikonomou', 'Georgiou', 'Dimitriou', 'Nikolaou', 'Konstantinou', 'Vasileiou', 'Karagiannis', 'Ioannou', 'Antoniou', 'Athanasiou', 'Petridis', 'Alexiou', 'Kostopoulos', 'Papanikolaou', 'Stavropoulos', 'Giannopoulos', 'Christodoulou', 'Theodorou'],
  SUI: ['Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider', 'Meyer', 'Steiner', 'Fischer', 'Gerber', 'Brunner', 'Baumann', 'Frei', 'Zimmermann', 'Moser', 'Widmer', 'Graf', 'Wyss', 'Roth'],
  KSA: ['Al-Dawsari', 'Al-Shehri', 'Al-Faraj', 'Al-Shahrani', 'Al-Muwallad', 'Al-Ghamdi', 'Al-Bishi', 'Al-Harbi', 'Al-Zahrani', 'Al-Otaibi', 'Al-Qahtani', 'Al-Mutairi', 'Al-Malki', 'Al-Khaibari', 'Al-Nasser', 'Al-Subaie', 'Al-Amri', 'Al-Hassan', 'Al-Ghannam', 'Al-Owais'],
  JPN: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi', 'Saito', 'Matsumoto', 'Inoue', 'Kimura', 'Hayashi', 'Shimizu'],
  MAR: ['Bennani', 'El Idrissi', 'Alaoui', 'Berrada', 'Chraibi', 'El Amrani', 'Tazi', 'Fassi', 'Benjelloun', 'Mansouri', 'Kabbaj', 'Lahlou', 'Tahiri', 'Naciri', 'Slaoui', 'Bensouda', 'Daoudi', 'El Fassi', 'Hassani', 'Bouazza'],
  EGY: ['Salah', 'Elneny', 'Trezeguet', 'Marmoush', 'Hegazi', 'Sobhi', 'Fathi', 'Ashour', 'Zizo', 'Afsha', 'Kahraba', 'Hamdy', 'Tawfik', 'Rabia', 'Ibrahim', 'El-Shenawy', 'Gabal', 'Sobhy', 'Mohsen', 'Koka'],
  RSA: ['Mokoena', 'Modiba', 'Zwane', 'Tau', 'Williams', 'Kekana', 'Mudau', 'Sithole', 'Mayambela', 'Lepasa', 'Adams', 'Mvala', 'Xulu', 'Morena', 'Maboe', 'Mobbie', 'Goss', 'Mothwa', 'Sibisi', 'Appollis'],
  NGA: ['Osimhen', 'Lookman', 'Chukwueze', 'Iwobi', 'Ndidi', 'Bassey', 'Aina', 'Ajayi', 'Troost-Ekong', 'Sanusi', 'Simon', 'Iheanacho', 'Boniface', 'Moffi', 'Onyeka', 'Nwabali', 'Uzoho', 'Omeruo', 'Awaziem', 'Yusuf'],
  SEN: ['Mané', 'Koulibaly', 'Mendy', 'Gueye', 'Sarr', 'Diallo', 'Jackson', 'Jakobs', 'Diatta', 'Camara', 'Ciss', 'Kouyaté', 'Sabaly', 'Dia', 'Ndiaye', 'Seck', 'Niakhaté', 'Gomis', 'Diaw', 'Lopy'],
  DZA: ['Mahrez', 'Bennacer', 'Bounedjah', 'Slimani', 'Feghouli', 'Bensebaini', 'Mandi', 'Atal', 'Chaïbi', 'Boudaoui', 'Aouar', 'Amoura', 'Gouiri', 'Zerrouki', 'Ounas', 'Belmadi', 'Zeghba', 'Mandrea', 'Touba', 'Larouci'],
  ARG: ['González', 'Rodríguez', 'López', 'Fernández', 'García', 'Pérez', 'Martínez', 'Gómez', 'Díaz', 'Álvarez', 'Romero', 'Sosa', 'Torres', 'Benítez', 'Ramírez', 'Flores', 'Acosta', 'Medina', 'Herrera', 'Aguirre'],
  BRA: ['Silva', 'Santos', 'Sousa', 'Oliveira', 'Pereira', 'Lima', 'Carvalho', 'Ferreira', 'Ribeiro', 'Rodrigues', 'Gomes', 'Martins', 'Araújo', 'Melo', 'Barbosa', 'Ramos', 'Rocha', 'Nascimento', 'Moreira', 'Freitas'],
  USA: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez'],
  MEX: ['Hernández', 'García', 'Martínez', 'López', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Vázquez', 'Reyes', 'Jiménez', 'Torres', 'Díaz', 'Gutiérrez', 'Mendoza'],
  COL: ['Rodríguez', 'Gómez', 'González', 'Martínez', 'García', 'López', 'Hernández', 'Sánchez', 'Ramírez', 'Pérez', 'Díaz', 'Muñoz', 'Rojas', 'Moreno', 'Ortiz', 'Jiménez', 'Castillo', 'Álvarez', 'Torres', 'Castro'],
  CHI: ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela'],
  URU: ['Rodríguez', 'González', 'Hernández', 'Pérez', 'García', 'Martínez', 'Silva', 'López', 'Fernández', 'Díaz', 'Álvarez', 'Romero', 'Sánchez', 'Suárez', 'Gómez', 'Pereira', 'Morales', 'Vázquez', 'Castro', 'Olivera'],
};

const REQUIRED_POSITIONS: Position[] = [
  'POR', 'LD', 'DFC', 'DFC', 'LI', 'MCD', 'MC', 'MC', 'ED', 'DC', 'EI',
  'POR', 'DFC', 'MC', 'ED', 'DC', 'LI'
];

/**
 * Ensures every club has a full, realistic roster of 16-17 players matching the club's country and base rating.
 */
export function ensureFullRoster(club: ClubSeedData): { name: string; surname: string; pos: Position; age: number; ovr: number }[] {
  const currentRoster = [...(club.roster || [])];
  if (currentRoster.length >= 16) return currentRoster;

  const country = club.countryId || 'ESP';
  const firstNames = FIRST_NAMES_BY_COUNTRY[country] || FIRST_NAMES_BY_COUNTRY['ESP'];
  const lastNames = LAST_NAMES_BY_COUNTRY[country] || LAST_NAMES_BY_COUNTRY['ESP'];

  const existingPositions = currentRoster.map((p) => p.pos);
  const neededPositions = [...REQUIRED_POSITIONS];

  // Remove already satisfied positions
  existingPositions.forEach((pos) => {
    const idx = neededPositions.indexOf(pos);
    if (idx !== -1) neededPositions.splice(idx, 1);
  });

  const baseOvr = club.playerBaseOverall || 75;
  let counter = currentRoster.length;

  while (currentRoster.length < 16) {
    const pos = neededPositions.shift() || 'MC';
    counter++;
    const fn = firstNames[(counter * 7 + club.foundedYear) % firstNames.length];
    const ln = lastNames[(counter * 13 + club.foundedYear) % lastNames.length];
    
    // Age curve: young talent (19-23), prime (24-29), veteran (30-35)
    const ageSeed = (counter * 3 + club.foundedYear) % 10;
    const age = ageSeed < 3 ? 20 + (counter % 4) : ageSeed < 7 ? 25 + (counter % 5) : 31 + (counter % 5);
    
    // Rating variation: ±3 around base overall, starters slightly higher
    const delta = (counter % 7) - 3;
    const ovr = Math.max(50, Math.min(95, baseOvr + delta));

    currentRoster.push({
      name: fn,
      surname: ln,
      pos,
      age,
      ovr,
    });
  }

  return currentRoster;
}

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'España': 'ESP', 'Spain': 'ESP',
  'Inglaterra': 'ENG', 'England': 'ENG',
  'Italia': 'ITA', 'Italy': 'ITA',
  'Alemania': 'GER', 'Germany': 'GER',
  'Francia': 'FRA', 'France': 'FRA',
  'Portugal': 'POR',
  'Países Bajos': 'NED', 'Holanda': 'NED', 'Netherlands': 'NED',
  'Bélgica': 'BEL', 'Belgium': 'BEL',
  'Escocia': 'SCO', 'Scotland': 'SCO',
  'Turquía': 'TUR', 'Turkey': 'TUR',
  'Grecia': 'GRE', 'Greece': 'GRE',
  'Suiza': 'SUI', 'Switzerland': 'SUI',
  'Arabia Saudí': 'KSA', 'Saudi Arabia': 'KSA',
  'Japón': 'JPN', 'Japan': 'JPN',
  'Marruecos': 'MAR', 'Morocco': 'MAR',
  'Egipto': 'EGY', 'Egypt': 'EGY',
  'Sudáfrica': 'RSA', 'South Africa': 'RSA',
  'Nigeria': 'NGA',
  'Senegal': 'SEN',
  'Argelia': 'DZA', 'Algeria': 'DZA',
  'Argentina': 'ARG',
  'Brasil': 'BRA', 'Brazil': 'BRA',
  'Estados Unidos': 'USA', 'EEUU': 'USA',
  'México': 'MEX', 'Mexico': 'MEX',
  'Colombia': 'COL',
  'Chile': 'CHI',
  'Uruguay': 'URU',
};

const CODE_TO_COUNTRY_NAME: Record<string, string> = {
  ESP: 'España', ENG: 'Inglaterra', ITA: 'Italia', GER: 'Alemania',
  FRA: 'Francia', POR: 'Portugal', NED: 'Países Bajos', BEL: 'Bélgica',
  SCO: 'Escocia', TUR: 'Turquía', GRE: 'Grecia', SUI: 'Suiza',
  KSA: 'Arabia Saudí', JPN: 'Japón', MAR: 'Marruecos', EGY: 'Egipto',
  RSA: 'Sudáfrica', NGA: 'Nigeria', SEN: 'Senegal', DZA: 'Argelia',
  ARG: 'Argentina', BRA: 'Brasil', USA: 'Estados Unidos', MEX: 'México',
  COL: 'Colombia', CHI: 'Chile', URU: 'Uruguay',
};

const ALIEN_FIRST_NAMES = [
  'Zorg', 'Xylar', 'Kaelen', 'Vex', 'Thyron', 'Orion', 'Soran', 'Balthazar', 'Dax', "T'Pau",
  'Zephyr', 'Aethel', 'Krypton', 'Valthor', 'Qwark', 'Zul', 'Ragnarok', 'Nox', 'Cygnus', 'Vega',
  'Xerxes', 'Azimuth', 'Krynn', 'Solon', 'Talos', 'Volturn', 'Kryos', 'Vaelin'
];

const ALIEN_LAST_NAMES = [
  'Prime', 'de Andrómeda', 'del Vórtice', 'Nebula', 'de Titán', 'de Ganímedes', 'de Keplar', 'Vanguard',
  'Solarius', 'Zeta', 'Pulsar', 'Quantum', 'Void', 'Eclipse', 'Starlight', 'Novastorm', 'Drakon', 'Zenith',
  'Voidstrider', 'Solaris', 'Starfall', 'Helios', 'Hyperion'
];

const ALIEN_PLANETS = [
  'Andrómeda Prime', 'Titán', 'Kepler-452b', 'Centauri B', 'Sirius C', 'Nebulosa de Orión',
  'Ganimedes', 'Cygnus X-1', 'Vega Minor', 'Nova Terra'
];

export function generateCulturallyAccurateName(
  countryInput?: string,
  isIntergalactic: boolean = false
): { firstName: string; lastName: string; nationality: string } {
  if (isIntergalactic) {
    const fn = ALIEN_FIRST_NAMES[Math.floor(Math.random() * ALIEN_FIRST_NAMES.length)];
    const ln = ALIEN_LAST_NAMES[Math.floor(Math.random() * ALIEN_LAST_NAMES.length)];
    const planet = ALIEN_PLANETS[Math.floor(Math.random() * ALIEN_PLANETS.length)];
    return { firstName: fn, lastName: ln, nationality: planet };
  }

  // 15% probability of an international migrant youth prospect from other countries
  let code = 'ESP';
  if (countryInput) {
    const clean = countryInput.trim();
    code = clean.length === 3 && FIRST_NAMES_BY_COUNTRY[clean.toUpperCase()]
      ? clean.toUpperCase()
      : COUNTRY_NAME_TO_CODE[clean] || 'ESP';
  }

  if (Math.random() < 0.15) {
    const allCodes = Object.keys(FIRST_NAMES_BY_COUNTRY);
    code = allCodes[Math.floor(Math.random() * allCodes.length)];
  }

  const fList = FIRST_NAMES_BY_COUNTRY[code] || FIRST_NAMES_BY_COUNTRY['ESP'];
  const lList = LAST_NAMES_BY_COUNTRY[code] || LAST_NAMES_BY_COUNTRY['ESP'];

  const fn = fList[Math.floor(Math.random() * fList.length)];
  const ln = lList[Math.floor(Math.random() * lList.length)];
  const natName = CODE_TO_COUNTRY_NAME[code] || 'España';

  return { firstName: fn, lastName: ln, nationality: natName };
}
