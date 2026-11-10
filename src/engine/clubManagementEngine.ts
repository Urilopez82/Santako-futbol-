import { Club, FinancialLedgerEntry } from '../types/club';
import { 
  ActiveConstructionProject, 
  ClubBoardGovernance, 
  ClubKits, 
  ClubLoan, 
  KitDesign, 
  LoanOffer, 
  MerchandisingStore, 
  SponsorCategory, 
  SponsorContract, 
  SponsorProposal, 
  StadiumCateringConfig, 
  StadiumUpgradeOption, 
  StadiumZonePricing 
} from '../types/clubManagement';
import { NewsItem } from '../types/game';
import { Player } from '../types/player';

// Bank Loan Catalog
export const BANK_LOAN_OFFERS: LoanOffer[] = [
  {
    id: 'loan_ico_pyme',
    name: 'Línea de Crédito ICO para Entidades Deportivas',
    principal: 75000,
    interestRate: 0.04, // 4%
    termWeeks: 52, // 1 año
    weeklyPayment: 1500,
    description: 'Crédito bonificado para atender tensiones de tesorería a corto plazo.',
    minReputation: 35,
  },
  {
    id: 'loan_banco_santako',
    name: 'Préstamo de Expansión Caixa Santako',
    principal: 200000,
    interestRate: 0.06, // 6%
    termWeeks: 104, // 2 años
    weeklyPayment: 2050,
    description: 'Financiación bancaria para modernización de instalaciones y reforma del estadio.',
    minReputation: 45,
  },
  {
    id: 'loan_sindicado_elite',
    name: 'Crédito Sindicado de Inversión Estructural',
    principal: 600000,
    interestRate: 0.08, // 8%
    termWeeks: 156, // 3 años
    weeklyPayment: 4150,
    description: 'Gran línea de crédito para clubes con aspiraciones de ascenso al fútbol profesional.',
    minReputation: 60,
  },
];

// Available Stadium Upgrades & Construction Catalog
export const STADIUM_UPGRADES_CATALOG: StadiumUpgradeOption[] = [
  {
    id: 'upg_aforo_lateral',
    title: 'Ampliación de Grada Lateral (+1.200 localidades)',
    category: 'AMPLIACION_AFORO',
    cost: 85000,
    durationWeeks: 6,
    capacityBonus: 1200,
    comfortBonus: 5,
    revenueBonusPerMatch: 1400,
    description: 'Construcción de un nuevo graderío prefabricado homologado por la RFEF.',
  },
  {
    id: 'upg_aforo_tribuna',
    title: 'Ampliación y Techado de Tribuna (+2.500 localidades)',
    category: 'AMPLIACION_AFORO',
    cost: 190000,
    durationWeeks: 10,
    capacityBonus: 2500,
    comfortBonus: 15,
    revenueBonusPerMatch: 3500,
    description: 'Reforma integral de la tribuna principal con cubierta voladiza protectora.',
    minTier: 3,
  },
  {
    id: 'upg_aforo_anillo',
    title: 'Construcción de Segundo Anillo (+5.000 localidades)',
    category: 'AMPLIACION_AFORO',
    cost: 380000,
    durationWeeks: 14,
    capacityBonus: 5000,
    comfortBonus: 12,
    revenueBonusPerMatch: 7500,
    description: 'Elevación de un segundo graderío perimetral con accesos mecánicos y vomitorios ampliados.',
  },
  {
    id: 'upg_aforo_macro',
    title: 'Ampliación Mayor de Fondos (+10.000 localidades)',
    category: 'AMPLIACION_AFORO',
    cost: 750000,
    durationWeeks: 18,
    capacityBonus: 10000,
    comfortBonus: 18,
    revenueBonusPerMatch: 15000,
    description: 'Ampliación integral de los fondos norte y sur para convertir el recinto en un gran estadio continental.',
  },
  {
    id: 'upg_cesped_hibrido',
    title: 'Implantación de Césped Híbrido con Drenaje Anti-Lluvia',
    category: 'CESPED_HIBRIDO',
    cost: 65000,
    durationWeeks: 4,
    capacityBonus: 0,
    comfortBonus: 10,
    revenueBonusPerMatch: 500,
    description: 'Hierba de última generación que reduce un 40% las lesiones musculares por mal terreno.',
  },
  {
    id: 'upg_videomarcador_hd',
    title: 'Instalación de Videomarcador LED Panorámico',
    category: 'VIDEOMARCADOR',
    cost: 45000,
    durationWeeks: 3,
    capacityBonus: 0,
    comfortBonus: 8,
    revenueBonusPerMatch: 800,
    description: 'Pantalla de alta resolución para repeticiones, anuncios de patrocinadores y animación.',
  },
  {
    id: 'upg_iluminacion_tv',
    title: 'Torres de Iluminación LED para Retransmisiones TV 4K',
    category: 'ILUMINACION_TV',
    cost: 55000,
    durationWeeks: 4,
    capacityBonus: 0,
    comfortBonus: 6,
    revenueBonusPerMatch: 1100,
    description: 'Cumple los requerimientos lumínicos de LaLiga y operadores televisivos internacionales.',
  },
  {
    id: 'upg_palcos_vip',
    title: 'Construcción de 6 Palcos VIP Presidenciales',
    category: 'PALCOS_VIP',
    cost: 75000,
    durationWeeks: 5,
    capacityBonus: 120,
    comfortBonus: 12,
    revenueBonusPerMatch: 2400,
    description: 'Zonas exclusivas de hospitalidad corporativa para empresas colaboradoras.',
  },
  {
    id: 'upg_vestuarios_elite',
    title: 'Modernización de Vestuarios y Zona de Prensa',
    category: 'VESTUARIOS',
    cost: 38000,
    durationWeeks: 3,
    capacityBonus: 0,
    comfortBonus: 10,
    revenueBonusPerMatch: 300,
    description: 'Sala de hidroterapia, taquillas individualizadas y sala de prensa profesional.',
  },
  {
    id: 'upg_parking_accesos',
    title: 'Tornos Biométricos y Parking Subterráneo',
    category: 'PARKING',
    cost: 42000,
    durationWeeks: 4,
    capacityBonus: 0,
    comfortBonus: 10,
    revenueBonusPerMatch: 650,
    description: 'Agiliza los accesos en los días de gran afluencia y reduce atascos perimetrales.',
  },
];

// Sponsorship Market Proposals Available to Negotiate
export const SPONSOR_PROPOSALS_CATALOG: SponsorProposal[] = [
  {
    id: 'spon_main_catalana',
    category: 'CAMISETA_PRINCIPAL',
    sponsorName: 'Catalana Occident Assegurances',
    industry: 'Seguros y Finanzas',
    annualAmount: 65000,
    durationYears: 2,
    reputationRequired: 40,
    bonusTitle: 15000,
    bonusPromotion: 25000,
    clauses: 'Logotipo frontal en la equipación local y visitante.',
    reputationScore: 78,
  },
  {
    id: 'spon_main_damm',
    category: 'CAMISETA_PRINCIPAL',
    sponsorName: 'Estrella Damm',
    industry: 'Bebidas y Ocio',
    annualAmount: 90000,
    durationYears: 3,
    reputationRequired: 48,
    bonusTitle: 20000,
    bonusPromotion: 35000,
    clauses: 'Exclusividad en las barras del estadio y pecho de la camiseta.',
    reputationScore: 88,
  },
  {
    id: 'spon_sleeve_bonpreu',
    category: 'MANGA',
    sponsorName: 'Bonpreu Esclat',
    industry: 'Alimentación y Gran Consumo',
    annualAmount: 22000,
    durationYears: 2,
    reputationRequired: 38,
    bonusTitle: 5000,
    bonusPromotion: 8000,
    clauses: 'Parche publicitario en la manga izquierda de las tres equipaciones.',
    reputationScore: 75,
  },
  {
    id: 'spon_shorts_seat',
    category: 'PANTALON',
    sponsorName: 'SEAT Barcelona',
    industry: 'Automoción',
    annualAmount: 18000,
    durationYears: 1,
    reputationRequired: 42,
    bonusTitle: 4000,
    bonusPromotion: 6000,
    clauses: 'Publicidad en la pernera trasera derecha del pantalón oficial.',
    reputationScore: 82,
  },
  {
    id: 'spon_boards_santako',
    category: 'VALLAS_ESTADIO',
    sponsorName: 'Comerç de Santa Coloma & Gramenet',
    industry: 'Comercio Local e Institucional',
    annualAmount: 28000,
    durationYears: 2,
    reputationRequired: 35,
    bonusTitle: 3000,
    bonusPromotion: 6000,
    clauses: 'Vallas LED fijas en el primer anillo del terreno de juego.',
    reputationScore: 70,
  },
  {
    id: 'spon_digital_fibra',
    category: 'DIGITAL',
    sponsorName: 'Parlem Telecom',
    industry: 'Telecomunicaciones y Fibra',
    annualAmount: 16000,
    durationYears: 2,
    reputationRequired: 38,
    bonusTitle: 2500,
    bonusPromotion: 4000,
    clauses: 'Naming en redes sociales, app oficial del club y streaming.',
    reputationScore: 74,
  },
  {
    id: 'spon_naming_estadi',
    category: 'NAMING_ESTADIO',
    sponsorName: 'CaixaBank Arena',
    industry: 'Banca y Servicios Financieros',
    annualAmount: 110000,
    durationYears: 4,
    reputationRequired: 52,
    bonusTitle: 30000,
    bonusPromotion: 50000,
    clauses: 'Derecho a renombrar comercialmente el estadio durante 4 temporadas.',
    reputationScore: 92,
  },
];

/**
 * Country-specific authentic sponsor catalogs
 */
export const COUNTRY_SPONSORS: Record<string, SponsorProposal[]> = {
  ESP: [
    { id: 'spon_esp_santander', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Banco Santander', industry: 'Banca y Servicios Financieros', annualAmount: 45000000, durationYears: 3, reputationRequired: 75, bonusTitle: 8000000, bonusPromotion: 12000000, clauses: 'Patrocinador financiero global en camiseta y banca oficial.', reputationScore: 94 },
    { id: 'spon_esp_movistar', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Movistar Telefónica', industry: 'Telecomunicaciones y Fibra', annualAmount: 38000000, durationYears: 3, reputationRequired: 72, bonusTitle: 6000000, bonusPromotion: 10000000, clauses: 'Naming frontal y derechos de contenido digital exclusivo.', reputationScore: 92 },
    { id: 'spon_esp_mahou', category: 'MANGA', sponsorName: 'Mahou San Miguel', industry: 'Cervezas y Hostelería', annualAmount: 9500000, durationYears: 2, reputationRequired: 68, bonusTitle: 1500000, bonusPromotion: 2500000, clauses: 'Exclusividad cervecera en el estadio y parche de manga.', reputationScore: 89 },
    { id: 'spon_esp_repsol', category: 'PANTALON', sponsorName: 'Repsol Energía', industry: 'Energía y Movilidad Sostenible', annualAmount: 6800000, durationYears: 2, reputationRequired: 65, bonusTitle: 1000000, bonusPromotion: 2000000, clauses: 'Logotipo en pernera trasera del pantalón oficial.', reputationScore: 88 },
    { id: 'spon_esp_caixa', category: 'NAMING_ESTADIO', sponsorName: 'CaixaBank Estadio Metropolitano', industry: 'Banca y Obra Social', annualAmount: 24000000, durationYears: 5, reputationRequired: 74, bonusTitle: 5000000, bonusPromotion: 8000000, clauses: 'Denominación oficial del recinto deportivo por 5 temporadas.', reputationScore: 93 },
  ],
  ENG: [
    { id: 'spon_eng_barclays', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Barclays International', industry: 'Banca de Inversión', annualAmount: 52000000, durationYears: 4, reputationRequired: 78, bonusTitle: 12000000, bonusPromotion: 15000000, clauses: 'Official shirt front partner across all competitions.', reputationScore: 96 },
    { id: 'spon_eng_standard', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Standard Chartered', industry: 'Banca Global', annualAmount: 48000000, durationYears: 3, reputationRequired: 76, bonusTitle: 9000000, bonusPromotion: 14000000, clauses: 'Front of kit logo and global financial partnership.', reputationScore: 95 },
    { id: 'spon_eng_emirates', category: 'NAMING_ESTADIO', sponsorName: 'Emirates Global Arena', industry: 'Aerolíneas', annualAmount: 32000000, durationYears: 5, reputationRequired: 79, bonusTitle: 7000000, bonusPromotion: 10000000, clauses: 'Naming rights for the stadium and training ground.', reputationScore: 98 },
    { id: 'spon_eng_castore', category: 'MANGA', sponsorName: 'Castore Sportswear', industry: 'Equipamiento Deportivo', annualAmount: 8500000, durationYears: 2, reputationRequired: 70, bonusTitle: 1200000, bonusPromotion: 2000000, clauses: 'Left sleeve patch on official Premier League match kit.', reputationScore: 86 },
  ],
  GER: [
    { id: 'spon_ger_telekom', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Deutsche Telekom Magenta', industry: 'Telecomunicaciones', annualAmount: 50000000, durationYears: 4, reputationRequired: 78, bonusTitle: 10000000, bonusPromotion: 15000000, clauses: 'Brustsponsoring und exklusive Medienpartnerschaft.', reputationScore: 97 },
    { id: 'spon_ger_allianz', category: 'NAMING_ESTADIO', sponsorName: 'Allianz Arena Park', industry: 'Versicherungen & Finanzen', annualAmount: 28000000, durationYears: 5, reputationRequired: 77, bonusTitle: 6000000, bonusPromotion: 9000000, clauses: 'Exklusive Namensrechte des Stadions über 5 Jahre.', reputationScore: 96 },
    { id: 'spon_ger_bmw', category: 'PANTALON', sponsorName: 'BMW Group Automotive', industry: 'Automoción de Lujo', annualAmount: 11000000, durationYears: 3, reputationRequired: 72, bonusTitle: 2000000, bonusPromotion: 3500000, clauses: 'Offizieller Mobilitätspartner der Lizenzmannschaft.', reputationScore: 94 },
  ],
  ITA: [
    { id: 'spon_ita_pirelli', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Pirelli Motorsport & Pneumatici', industry: 'Neumáticos y Movilidad', annualAmount: 35000000, durationYears: 3, reputationRequired: 75, bonusTitle: 7000000, bonusPromotion: 10000000, clauses: 'Sponsor storico di maglia e partner automotive.', reputationScore: 93 },
    { id: 'spon_ita_jeep', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Jeep Automobili', industry: 'Automoción 4x4', annualAmount: 42000000, durationYears: 3, reputationRequired: 77, bonusTitle: 8000000, bonusPromotion: 12000000, clauses: 'Logo frontale divisa gara e fornitura veicoli societari.', reputationScore: 92 },
    { id: 'spon_ita_enel', category: 'MANGA', sponsorName: 'Enel Energia Pulita', industry: 'Energía y Utilities', annualAmount: 7500000, durationYears: 2, reputationRequired: 70, bonusTitle: 1500000, bonusPromotion: 2500000, clauses: 'Patch manica ufficiale per Serie A e Coppa Italia.', reputationScore: 89 },
  ],
  FRA: [
    { id: 'spon_fra_accor', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Accor Live Limitless', industry: 'Hoteles y Hospitalidad Global', annualAmount: 44000000, durationYears: 3, reputationRequired: 76, bonusTitle: 8500000, bonusPromotion: 13000000, clauses: 'Sponsor maillot face avant et programme de fidélité.', reputationScore: 94 },
    { id: 'spon_fra_orange', category: 'MANGA', sponsorName: 'Orange Télécom', industry: 'Telecomunicaciones', annualAmount: 9000000, durationYears: 2, reputationRequired: 71, bonusTitle: 1800000, bonusPromotion: 2800000, clauses: 'Présence manche maillot et connectivité du stade.', reputationScore: 91 },
    { id: 'spon_fra_total', category: 'NAMING_ESTADIO', sponsorName: 'TotalEnergies Stadium', industry: 'Energías Renovables', annualAmount: 22000000, durationYears: 5, reputationRequired: 75, bonusTitle: 4000000, bonusPromotion: 7000000, clauses: 'Naming officiel du stade pour toutes compétitions.', reputationScore: 92 },
  ],
  MAR: [
    { id: 'spon_mar_iam', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Maroc Telecom (IAM)', industry: 'Télécommunications Maroc', annualAmount: 12000000, durationYears: 3, reputationRequired: 68, bonusTitle: 2500000, bonusPromotion: 4000000, clauses: 'Sponsor officiel de la Botola Pro sur le maillot.', reputationScore: 90 },
    { id: 'spon_mar_inwi', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Inwi 5G & Fibre', industry: 'Opérateur Télécom Maroc', annualAmount: 9500000, durationYears: 2, reputationRequired: 64, bonusTitle: 1800000, bonusPromotion: 3000000, clauses: 'Logo face avant maillot et partenaire digital officiel.', reputationScore: 87 },
    { id: 'spon_mar_ram', category: 'MANGA', sponsorName: 'Royal Air Maroc', industry: 'Compagnie Aérienne Nationale', annualAmount: 3200000, durationYears: 2, reputationRequired: 62, bonusTitle: 600000, bonusPromotion: 1200000, clauses: 'Transporteur officiel et écusson sur la manche.', reputationScore: 88 },
    { id: 'spon_mar_ocp', category: 'NAMING_ESTADIO', sponsorName: 'OCP Group Arena', industry: 'Industrie & Phosphates Maroc', annualAmount: 8500000, durationYears: 4, reputationRequired: 67, bonusTitle: 1500000, bonusPromotion: 2500000, clauses: 'Dénomination du grand complexe sportif.', reputationScore: 91 },
  ],
  EGY: [
    { id: 'spon_egy_telecom', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Telecom Egypt (WE)', industry: 'National Telecom Egypt', annualAmount: 11000000, durationYears: 3, reputationRequired: 66, bonusTitle: 2200000, bonusPromotion: 3500000, clauses: 'Prime shirt sponsor for domestic and CAF matches.', reputationScore: 89 },
    { id: 'spon_egy_etisalat', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Etisalat by e& Egypt', industry: 'Mobile & Digital Services', annualAmount: 13500000, durationYears: 3, reputationRequired: 69, bonusTitle: 2800000, bonusPromotion: 4200000, clauses: 'Front logo across official kit and stadium banners.', reputationScore: 91 },
    { id: 'spon_egy_misr', category: 'NAMING_ESTADIO', sponsorName: 'Banque Misr Cairo Stadium', industry: 'National Banking', annualAmount: 7000000, durationYears: 4, reputationRequired: 65, bonusTitle: 1200000, bonusPromotion: 2000000, clauses: 'Stadium naming partnership and club banking.', reputationScore: 88 },
  ],
  RSA: [
    { id: 'spon_rsa_vodacom', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Vodacom South Africa', industry: 'Telecommunications & Mobile', annualAmount: 10500000, durationYears: 3, reputationRequired: 66, bonusTitle: 2000000, bonusPromotion: 3200000, clauses: 'Official PSL shirt front sponsor.', reputationScore: 90 },
    { id: 'spon_rsa_mtn', category: 'CAMISETA_PRINCIPAL', sponsorName: 'MTN Group Everywhere You Go', industry: 'Telecommunications Africa', annualAmount: 9800000, durationYears: 2, reputationRequired: 64, bonusTitle: 1800000, bonusPromotion: 2800000, clauses: 'Front of jersey sponsorship and mobile rewards.', reputationScore: 89 },
    { id: 'spon_rsa_nedbank', category: 'NAMING_ESTADIO', sponsorName: 'Nedbank Johannesburg Park', industry: 'Banking & Financial', annualAmount: 6200000, durationYears: 4, reputationRequired: 63, bonusTitle: 1100000, bonusPromotion: 1900000, clauses: 'Exclusive naming rights of the home ground.', reputationScore: 87 },
  ],
  ARG: [
    { id: 'spon_arg_quilmes', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Cervecería y Maltería Quilmes', industry: 'Cervezas Clásicas de Argentina', annualAmount: 8500000, durationYears: 3, reputationRequired: 65, bonusTitle: 1500000, bonusPromotion: 2500000, clauses: 'Sponsor clásico en el pecho de la camiseta.', reputationScore: 91 },
    { id: 'spon_arg_ypf', category: 'PANTALON', sponsorName: 'YPF Energía Argentina', industry: 'Petróleo y Estaciones de Servicio', annualAmount: 3200000, durationYears: 2, reputationRequired: 60, bonusTitle: 600000, bonusPromotion: 1100000, clauses: 'Publicidad en el pantalón oficial de juego.', reputationScore: 89 },
  ],
  BRA: [
    { id: 'spon_bra_itau', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Banco Itaú Unibanco', industry: 'Serviços Financeiros e Bancários', annualAmount: 14000000, durationYears: 3, reputationRequired: 70, bonusTitle: 2500000, bonusPromotion: 4000000, clauses: 'Patrocínio máster no peito do uniforme oficial.', reputationScore: 93 },
    { id: 'spon_bra_petrobras', category: 'NAMING_ESTADIO', sponsorName: 'Petrobras Arena de Futebol', industry: 'Energia e Biocombustíveis', annualAmount: 9000000, durationYears: 4, reputationRequired: 68, bonusTitle: 1800000, bonusPromotion: 3000000, clauses: 'Direitos de denominação da praça esportiva.', reputationScore: 92 },
  ],
  MEX: [
    { id: 'spon_mex_corona', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Cerveza Corona Extra', industry: 'Cervecería Tradicional Mexicana', annualAmount: 12500000, durationYears: 3, reputationRequired: 68, bonusTitle: 2200000, bonusPromotion: 3800000, clauses: 'Patrocinador oficial en el frente del jersey.', reputationScore: 92 },
    { id: 'spon_mex_telcel', category: 'MANGA', sponsorName: 'Telcel Red 5G', industry: 'Telecomunicaciones Móviles', annualAmount: 4800000, durationYears: 2, reputationRequired: 64, bonusTitle: 900000, bonusPromotion: 1600000, clauses: 'Parche en la manga de las tres equipaciones.', reputationScore: 89 },
  ],
  USA: [
    { id: 'spon_usa_apple', category: 'CAMISETA_PRINCIPAL', sponsorName: 'Apple TV & MLS Season Pass', industry: 'Tecnología y Streaming', annualAmount: 16000000, durationYears: 3, reputationRequired: 70, bonusTitle: 3000000, bonusPromotion: 4500000, clauses: 'Official jersey front partner and digital broadcast promo.', reputationScore: 96 },
    { id: 'spon_usa_att', category: 'NAMING_ESTADIO', sponsorName: 'AT&T High Performance Stadium', industry: 'Telecommunications & 5G', annualAmount: 11000000, durationYears: 5, reputationRequired: 69, bonusTitle: 2000000, bonusPromotion: 3200000, clauses: 'Stadium naming rights across North American sports.', reputationScore: 93 },
  ],
};

/**
 * Returns tailored sponsor proposals matching club's geographical identity and prestige tier
 */
export function getSponsorProposalsForClub(club: Club): SponsorProposal[] {
  const isSantaColoma = club.id === 'fe_grama' || (club.city && club.city.toLowerCase().includes('coloma')) || (club.shortName && club.shortName.toLowerCase().includes('grama'));
  const rep = club.reputation || 40;
  const country = club.countryId || 'ESP';

  if (isSantaColoma || rep < 50) {
    return [
      {
        id: 'spon_main_santako_comerc',
        category: 'CAMISETA_PRINCIPAL',
        sponsorName: 'Comerç i Restauració Santa Coloma',
        industry: 'Comercio Local e Institucional',
        annualAmount: Math.round(rep * 1200 + 15000),
        durationYears: 2,
        reputationRequired: 20,
        bonusTitle: 8000,
        bonusPromotion: 18000,
        clauses: 'Patrocinador oficial de Santa Coloma en el pecho de la camiseta.',
        reputationScore: 75,
      },
      {
        id: 'spon_main_can_sistere',
        category: 'CAMISETA_PRINCIPAL',
        sponsorName: 'Restauració Can Sisteré & Besòs',
        industry: 'Hostelería Local',
        annualAmount: Math.round(rep * 1400 + 20000),
        durationYears: 3,
        reputationRequired: 30,
        bonusTitle: 12000,
        bonusPromotion: 25000,
        clauses: 'Presencia en camisetas y catering oficial de Can Peixauet.',
        reputationScore: 80,
      },
      {
        id: 'spon_sleeve_bonpreu',
        category: 'MANGA',
        sponsorName: 'Bonpreu Esclat Besòs',
        industry: 'Alimentación y Supermercados',
        annualAmount: Math.round(rep * 450 + 6000),
        durationYears: 2,
        reputationRequired: 25,
        bonusTitle: 3000,
        bonusPromotion: 7000,
        clauses: 'Parche publicitario en la manga izquierda de las tres equipaciones.',
        reputationScore: 76,
      },
      {
        id: 'spon_shorts_tallers',
        category: 'PANTALON',
        sponsorName: 'Tallers Mecànics Besòs',
        industry: 'Automoción y Talleres',
        annualAmount: Math.round(rep * 350 + 5000),
        durationYears: 1,
        reputationRequired: 20,
        bonusTitle: 2000,
        bonusPromotion: 5000,
        clauses: 'Publicidad en la pernera trasera del pantalón oficial.',
        reputationScore: 70,
      },
      {
        id: 'spon_boards_santako_fcf',
        category: 'VALLAS_ESTADIO',
        sponsorName: 'FCF Suport Català & Ajuntament',
        industry: 'Institucional y Fomento del Deporte',
        annualAmount: Math.round(rep * 550 + 8000),
        durationYears: 2,
        reputationRequired: 25,
        bonusTitle: 2500,
        bonusPromotion: 6000,
        clauses: 'Vallas perimetrales fijas en el terreno de juego.',
        reputationScore: 72,
      },
      {
        id: 'spon_naming_caixa_santako',
        category: 'NAMING_ESTADIO',
        sponsorName: 'Caixa Santako Arena',
        industry: 'Banca y Obra Social',
        annualAmount: Math.round(rep * 1800 + 35000),
        durationYears: 3,
        reputationRequired: 35,
        bonusTitle: 15000,
        bonusPromotion: 30000,
        clauses: 'Derecho a renombrar comercialmente el estadio local.',
        reputationScore: 85,
      },
    ];
  }

  // Country-specific sponsors
  const countryList = COUNTRY_SPONSORS[country] || COUNTRY_SPONSORS['ESP'];
  const eligibleCountrySponsors = countryList.filter((s) => rep >= s.reputationRequired - 12);

  if (eligibleCountrySponsors.length > 0) {
    return [...eligibleCountrySponsors, ...SPONSOR_PROPOSALS_CATALOG];
  }

  return SPONSOR_PROPOSALS_CATALOG;
}

/**
 * Calculates weekly TV Broadcasting Rights income calibrated to league tier and club stature
 */
export function calculateWeeklyTvRightsIncome(club: Club): number {
  const div = club.divisionId || '';
  const rep = club.reputation || 50;

  // Elite Tier 1 (LaLiga, Premier, Serie A, Bundesliga, Ligue 1)
  if (['esp_tier1', 'eng_tier1', 'ger_tier1', 'ita_tier1', 'fra_tier1'].includes(div)) {
    const base = div === 'eng_tier1' ? 2400000 : 1600000;
    return Math.round(base * (rep / 85));
  }

  // High Tier 1 (Portugal, Países Bajos, Argentina, Brasil, Marruecos, Egipto, Arabia Saudí, MLS, etc.)
  if (['por_tier1', 'ned_tier1', 'bra_tier1', 'arg_tier1', 'mar_tier1', 'egy_tier1', 'sau_tier1', 'usa_tier1', 'mex_tier1', 'tur_tier1'].includes(div)) {
    return Math.round(450000 * (rep / 76));
  }

  // Tier 2 (LaLiga Hypermotion, etc.)
  if (div === 'esp_tier2') {
    return Math.round(180000 * (rep / 65));
  }

  // Tier 3 (1ª RFEF)
  if (div.startsWith('esp_tier3')) {
    return Math.round(35000 * (rep / 55));
  }

  // Tier 4 (2ª RFEF)
  if (div.startsWith('esp_tier4')) {
    return Math.round(12000 * (rep / 48));
  }

  // Tier 5 (3ª RFEF)
  if (div.startsWith('esp_tier5')) {
    return Math.round(4500 * (rep / 40));
  }

  // Generic fallback
  return Math.round(25000 * (rep / 60));
}

/**
 * Calculates realistic supply and demand economics for Catering & Restaurant
 */
export function calculateCateringItemEconomics(
  item: { id: string; category: string; salePrice: number; costPrice: number; qualityLevel: number },
  attendance: number,
  clubReputation: number
): {
  estimatedUnits: number;
  grossRevenue: number;
  totalCost: number;
  netProfit: number;
  demandFactor: number;
  customerSatisfaction: 'Óptima' | 'Aceptable' | 'Precios Elevados' | 'Tarifas Abusivas';
} {
  // Baseline consumption rate (% of stadium attendees who buy this type of product)
  const baseRateMap: Record<string, number> = {
    bocadillos: 0.22,
    bebidas: 0.38,
    snacks: 0.16,
    menu_vip: 0.03,
  };
  const baseRate = baseRateMap[item.category] || 0.18;

  // Fair market optimal price (fans accept this gladly)
  const optimalPriceMap: Record<string, number> = {
    bocadillos: 5.5,
    bebidas: 2.8,
    snacks: 2.0,
    menu_vip: 42.0,
  };
  const optimalPrice = optimalPriceMap[item.category] || 5.0;

  // Price elasticity curve:
  // If price <= optimal: demand increases moderately (up to 1.35x)
  // If price > optimal: demand falls quadratically
  const priceRatio = item.salePrice / optimalPrice;
  let demandFactor: number;
  let customerSatisfaction: 'Óptima' | 'Aceptable' | 'Precios Elevados' | 'Tarifas Abusivas';

  if (priceRatio <= 0.85) {
    demandFactor = 1.35;
    customerSatisfaction = 'Óptima';
  } else if (priceRatio <= 1.15) {
    demandFactor = 1.0;
    customerSatisfaction = 'Óptima';
  } else if (priceRatio <= 1.45) {
    demandFactor = Math.pow(1 / priceRatio, 1.6);
    customerSatisfaction = 'Aceptable';
  } else if (priceRatio <= 1.85) {
    demandFactor = Math.pow(1 / priceRatio, 2.2);
    customerSatisfaction = 'Precios Elevados';
  } else {
    demandFactor = Math.max(0.05, Math.pow(1 / priceRatio, 3.0));
    customerSatisfaction = 'Tarifas Abusivas';
  }

  // Quality bonus
  const qualityFactor = 0.85 + (item.qualityLevel / 5) * 0.25;
  const reputationFactor = 0.8 + (clubReputation / 100) * 0.35;

  const baseVolume = attendance * baseRate;
  const estimatedUnits = Math.max(0, Math.round(baseVolume * demandFactor * qualityFactor * reputationFactor));

  const grossRevenue = Math.round(estimatedUnits * item.salePrice);
  const totalCost = Math.round(estimatedUnits * item.costPrice);
  const netProfit = grossRevenue - totalCost;

  return {
    estimatedUnits,
    grossRevenue,
    totalCost,
    netProfit,
    demandFactor,
    customerSatisfaction,
  };
}

/**
 * Calculates realistic supply and demand economics for Official Merchandising Store
 */
export function calculateMerchandisingItemEconomics(
  item: { id: string; category: string; salePrice: number; costPrice: number },
  clubReputation: number
): {
  weeklyUnitsSold: number;
  weeklyRevenue: number;
  weeklyCost: number;
  weeklyProfit: number;
  customerSatisfaction: 'Excelente' | 'Normal' | 'Precio Caro' | 'Prohibitivo';
} {
  // Fair optimal prices
  const optimalPriceMap: Record<string, number> = {
    camisetas: 68.0,
    bufandas: 16.0,
    gorras: 14.0,
    accesorios: 22.0,
  };
  const optimalPrice = optimalPriceMap[item.category] || 30.0;

  // Base weekly buyer pool determined by club reputation
  const baseWeeklyBuyersMap: Record<string, number> = {
    camisetas: Math.round(clubReputation * 1.8),
    bufandas: Math.round(clubReputation * 2.4),
    gorras: Math.round(clubReputation * 1.2),
    accesorios: Math.round(clubReputation * 1.0),
  };
  const baseBuyers = baseWeeklyBuyersMap[item.category] || Math.round(clubReputation * 1.5);

  const priceRatio = item.salePrice / optimalPrice;
  let demandFactor: number;
  let customerSatisfaction: 'Excelente' | 'Normal' | 'Precio Caro' | 'Prohibitivo';

  if (priceRatio <= 0.85) {
    demandFactor = 1.45;
    customerSatisfaction = 'Excelente';
  } else if (priceRatio <= 1.15) {
    demandFactor = 1.0;
    customerSatisfaction = 'Normal';
  } else if (priceRatio <= 1.5) {
    demandFactor = Math.pow(1 / priceRatio, 1.7);
    customerSatisfaction = 'Precio Caro';
  } else {
    demandFactor = Math.max(0.08, Math.pow(1 / priceRatio, 2.5));
    customerSatisfaction = 'Prohibitivo';
  }

  const weeklyUnitsSold = Math.max(1, Math.round(baseBuyers * demandFactor));
  const weeklyRevenue = Math.round(weeklyUnitsSold * item.salePrice);
  const weeklyCost = Math.round(weeklyUnitsSold * item.costPrice);
  const weeklyProfit = weeklyRevenue - weeklyCost;

  return {
    weeklyUnitsSold,
    weeklyRevenue,
    weeklyCost,
    weeklyProfit,
    customerSatisfaction,
  };
}

/**
 * Reallocates club funds between Treasury cash balance and Transfer Budget up to 80% of cash balance
 */
export function reallocateClubTransferBudget(
  club: Club,
  desiredTransferBudget: number
): { updatedClub: Club; success: boolean; message: string } {
  const currentBalance = club.finances.balance;
  // Maximum transfer budget allowed is at least 80% of cash balance
  const maxAllowedTransferBudget = Math.max(
    club.finances.transferBudget,
    Math.floor(currentBalance * 0.80)
  );

  if (desiredTransferBudget < 0) {
    return {
      updatedClub: club,
      success: false,
      message: 'El presupuesto de traspasos no puede ser negativo.',
    };
  }

  if (desiredTransferBudget > maxAllowedTransferBudget && currentBalance > 0) {
    return {
      updatedClub: club,
      success: false,
      message: `El límite máximo de asignación de tesorería es del 80% (${maxAllowedTransferBudget.toLocaleString()} €).`,
    };
  }

  const updatedClub: Club = {
    ...club,
    finances: {
      ...club.finances,
      transferBudget: desiredTransferBudget,
    },
  };

  return {
    updatedClub,
    success: true,
    message: `Presupuesto de traspasos reasignado a ${desiredTransferBudget.toLocaleString()} € (Límite: hasta el 80% de tesorería).`,
  };
}

// Helper to get or initialize complete Club Management state
export function ensureClubManagementState(club: Club): Club {
  if (!club) return club;
  let updated = { ...club };

  // 1. Kits
  if (!updated.kits) {
    updated.kits = {
      home: {
        primaryColor: club.primaryColor || '#10b981',
        secondaryColor: club.secondaryColor || '#064e3b',
        accentColor: '#ffffff',
        pattern: 'stripes_vertical',
        collar: 'round',
        sleeveColor: club.primaryColor || '#10b981',
        shortsColor: '#0f172a',
        socksColor: club.primaryColor || '#10b981',
        sponsorText: club.finances?.sponsorName || 'SANTAKO SPORT',
        manufacturerLogo: 'KELME',
      },
      away: {
        primaryColor: '#f8fafc',
        secondaryColor: '#0f172a',
        accentColor: club.primaryColor || '#10b981',
        pattern: 'sash',
        collar: 'v_neck',
        sleeveColor: '#f8fafc',
        shortsColor: '#f8fafc',
        socksColor: '#f8fafc',
        sponsorText: club.finances?.sponsorName || 'SANTAKO SPORT',
        manufacturerLogo: 'KELME',
      },
      third: {
        primaryColor: '#e11d48',
        secondaryColor: '#1e293b',
        accentColor: '#fbbf24',
        pattern: 'gradient',
        collar: 'polo',
        sleeveColor: '#e11d48',
        shortsColor: '#1e293b',
        socksColor: '#e11d48',
        sponsorText: club.finances?.sponsorName || 'SANTAKO SPORT',
        manufacturerLogo: 'KELME',
      },
      appealRating: 72,
    };
  }

  // 2. Zone Pricing
  if (!updated.zonePricing) {
    updated.zonePricing = {
      tribunaPrice: 22,
      lateralPrice: 15,
      fondosPrice: 10,
      vipPrice: 45,
      visitorPrice: 14,
      seasonTicketDiscountPct: 20,
    };
  }

  // 3. Catering (PC Fútbol Style)
  if (!updated.cateringConfig) {
    updated.cateringConfig = {
      restaurantOpen: true,
      restaurantMenuPrice: 24,
      restaurantQualityStars: 3,
      concessionsOpen: true,
      items: [
        {
          id: 'cat_bocata_butifarra',
          name: 'Bocadillo de Butifarra a la Brasa',
          category: 'bocadillos',
          costPrice: 2.1,
          salePrice: 6.0,
          qualityLevel: 4,
          supplier: 'Carnisseries Can Coloma',
          weeklySalesVolume: 420,
        },
        {
          id: 'cat_bocata_jamon',
          name: 'Bocadillo de Jamón Ibérico con Tomate',
          category: 'bocadillos',
          costPrice: 2.8,
          salePrice: 7.5,
          qualityLevel: 5,
          supplier: 'Xarcuteria Ibèrica',
          weeklySalesVolume: 310,
        },
        {
          id: 'cat_refresco',
          name: 'Cerveza Sin Alcohol / Refrescos 500ml',
          category: 'bebidas',
          costPrice: 0.7,
          salePrice: 3.0,
          qualityLevel: 3,
          supplier: 'Distribuciones Damm & Bebidas',
          weeklySalesVolume: 750,
        },
        {
          id: 'cat_patatas_frutos',
          name: 'Bolsa de Patatas y Frutos Secos',
          category: 'snacks',
          costPrice: 0.6,
          salePrice: 2.5,
          qualityLevel: 3,
          supplier: 'Snacks Cataluña',
          weeklySalesVolume: 380,
        },
        {
          id: 'cat_menu_vip',
          name: 'Menú Degustación Palco VIP (Cava + Marisco)',
          category: 'menu_vip',
          costPrice: 16.0,
          salePrice: 48.0,
          qualityLevel: 5,
          supplier: 'Càtering Gourmet Barcelona',
          weeklySalesVolume: 45,
        },
      ],
    };
  }

  // 4. Merchandising Store
  if (!updated.merchandisingStore) {
    updated.merchandisingStore = {
      marketingLevel: 2,
      weeklyMarketingExpense: 350,
      items: [
        {
          id: 'merch_shirt_home',
          name: 'Camiseta Oficial 1ª Equipación',
          category: 'camisetas',
          costPrice: 24,
          salePrice: 65,
          stock: 140,
          unitsSoldWeekly: 18,
          description: 'Camiseta de juego oficial con tejido transpirable y escudo bordado.',
        },
        {
          id: 'merch_shirt_away',
          name: 'Camiseta Oficial 2ª Equipación',
          category: 'camisetas',
          costPrice: 24,
          salePrice: 65,
          stock: 85,
          unitsSoldWeekly: 9,
          description: 'Segunda equipación para partidos fuera de casa.',
        },
        {
          id: 'merch_scarf',
          name: 'Bufanda Clásica de Punto del Club',
          category: 'bufandas',
          costPrice: 5.5,
          salePrice: 16,
          stock: 220,
          unitsSoldWeekly: 25,
          description: 'La bufanda tradicional de los aficionados para animar en la grada.',
        },
        {
          id: 'merch_cap',
          name: 'Gorra Bordada Edición Centenario',
          category: 'gorras',
          costPrice: 4.8,
          salePrice: 15,
          stock: 90,
          unitsSoldWeekly: 8,
          description: 'Gorra ajustable con visera curvada y escudo en relieve.',
        },
        {
          id: 'merch_ball',
          name: 'Balón Oficial de Entrenamiento RFEF',
          category: 'accesorios',
          costPrice: 9.0,
          salePrice: 25,
          stock: 60,
          unitsSoldWeekly: 7,
          description: 'Balón homologado con los colores oficiales de la entidad.',
        },
      ],
    };
  }

  // 5. Sponsors portfolio
  if (!updated.sponsors || updated.sponsors.length === 0) {
    updated.sponsors = [
      {
        id: 'spon_init_main',
        category: 'CAMISETA_PRINCIPAL',
        sponsorName: updated.finances.sponsorName || 'Santako Segurs',
        industry: 'Servicios',
        annualAmount: updated.finances.sponsorAnnualRevenue || 35000,
        weeklyPayment: Math.round((updated.finances.sponsorAnnualRevenue || 35000) / 40),
        yearsLeft: 2,
        reputationRequired: 35,
        bonusTitle: 10000,
        bonusPromotion: 15000,
        clauses: 'Patrocinador principal de la camiseta.',
        signedDate: '2026-07-01',
      },
      {
        id: 'spon_init_vallas',
        category: 'VALLAS_ESTADIO',
        sponsorName: 'Comerç de Santa Coloma',
        industry: 'Comercio',
        annualAmount: 14000,
        weeklyPayment: 350,
        yearsLeft: 1,
        reputationRequired: 30,
        bonusTitle: 2000,
        bonusPromotion: 4000,
        clauses: 'Publicidad en vallas del campo.',
        signedDate: '2026-07-01',
      },
    ];
  }

  // 6. Active Stadium Projects
  if (!updated.activeStadiumProjects) {
    updated.activeStadiumProjects = [];
  }

  // 7. Loans
  if (!updated.loans) {
    updated.loans = [];
  }

  // 8. Board Governance
  if (!updated.boardGovernance) {
    updated.boardGovernance = {
      presidentName: 'Josep Maria Vidal',
      mandateYearsLeft: 3,
      patienceLevel: 'Equilibrada',
      financialFocus: 'Sostenibilidad',
      currentDemands: [
        'Cumplir el objetivo deportivo marcado sin exceder la masa salarial',
        'Mantener saldo de tesorería positivo a final de temporada',
      ],
    };
  }

  return updated;
}

// Full comprehensive weekly finances execution
export function processComprehensiveWeeklyFinances(
  rawClub: Club,
  players: Record<string, Player>,
  currentDate: string
): { updatedClub: Club; ledgerEntries: FinancialLedgerEntry[]; newsItems: NewsItem[] } {
  const club = ensureClubManagementState(rawClub);
  const ledgerEntries: FinancialLedgerEntry[] = [];
  const newsItems: NewsItem[] = [];

  // 1. Players & Technical staff wages
  let totalPlayerWages = 0;
  club.playerIds.forEach((pid) => {
    const p = players[pid];
    if (p?.contract) {
      totalPlayerWages += p.contract.wagePerWeek;
    }
  });

  const staffWeekly = 1400; // médicos, preparador físico, utilleros
  if (totalPlayerWages > 0) {
    ledgerEntries.push({
      id: `ledg_wage_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      date: currentDate,
      category: 'salarios',
      description: `Nóminas semanales del primer equipo y cuerpo técnico (${club.playerIds.length} futbolistas)`,
      amount: -(totalPlayerWages + staffWeekly),
    });
  }

  // 2. Operational & Facilities Maintenance
  const stadiumMaintenance = Math.round(club.stadium.capacity * 0.16);
  const facilitiesMaintenance =
    (club.facilities.trainingGroundLevel +
      club.facilities.youthAcademyLevel +
      club.facilities.medicalCenterLevel +
      club.facilities.stadiumLevel) *
    400;

  const totalMaintenance = stadiumMaintenance + facilitiesMaintenance;
  ledgerEntries.push({
    id: `ledg_maint_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    date: currentDate,
    category: 'mantenimiento',
    description: `Mantenimiento operativo del estadio (${club.stadium.name}) e instalaciones`,
    amount: -totalMaintenance,
  });

  // 3. Loans weekly amortization & interest
  let updatedLoans = [...(club.loans || [])];
  let totalLoanPayments = 0;

  updatedLoans = updatedLoans.map((loan) => {
    if (loan.remainingWeeks > 0) {
      totalLoanPayments += loan.weeklyPayment;
      const newRemaining = Math.max(0, loan.remainingAmount - loan.weeklyPayment);
      const newWeeks = loan.remainingWeeks - 1;

      if (newWeeks === 0 || newRemaining === 0) {
        newsItems.push({
          id: `news_loan_paid_${Date.now()}_${loan.id}`,
          date: currentDate,
          title: `Préstamo bancario cancelado: ${loan.name}`,
          content: `El club ha completado con éxito la amortización íntegra del crédito bancario de ${loan.principal.toLocaleString()} €. La masa de endeudamiento queda liberada.`,
          category: 'ECONOMIA',
          read: false,
        });
      }

      return {
        ...loan,
        remainingAmount: newRemaining,
        remainingWeeks: newWeeks,
      };
    }
    return loan;
  }).filter((l) => l.remainingWeeks > 0 && l.remainingAmount > 0);

  if (totalLoanPayments > 0) {
    ledgerEntries.push({
      id: `ledg_loan_${Date.now()}`,
      date: currentDate,
      category: 'salarios', // financial cost
      description: `Amortización e intereses de préstamos bancarios (${club.loans?.length || 1} créditos)`,
      amount: -totalLoanPayments,
    });
  }

  // 4. Sponsorships weekly income
  let totalSponsorIncome = 0;
  club.sponsors?.forEach((sp) => {
    totalSponsorIncome += sp.weeklyPayment;
  });

  if (totalSponsorIncome > 0) {
    ledgerEntries.push({
      id: `ledg_spon_${Date.now()}`,
      date: currentDate,
      category: 'patrocinio',
      description: `Ingresos comerciales y patrocinios semanales (${club.sponsors?.length} contratos activos)`,
      amount: totalSponsorIncome,
    });
  }

  // 5. Merchandising sales
  let weeklyMerchRevenue = 0;
  let weeklyMerchCost = 0;
  const store = club.merchandisingStore;

  if (store) {
    weeklyMerchCost += store.weeklyMarketingExpense;
    store.items.forEach((item) => {
      // Units sold calculated based on club reputation and marketing level
      const demandFactor = (club.reputation / 60) * (store.marketingLevel * 0.4);
      const soldThisWeek = Math.min(item.stock, Math.round(item.unitsSoldWeekly * demandFactor));
      weeklyMerchRevenue += soldThisWeek * item.salePrice;
      weeklyMerchCost += soldThisWeek * item.costPrice;
    });

    const netMerchProfit = weeklyMerchRevenue - weeklyMerchCost;
    ledgerEntries.push({
      id: `ledg_merch_${Date.now()}`,
      date: currentDate,
      category: 'patrocinio',
      description: `Beneficio neto de la Tienda Oficial y Merchandising`,
      amount: Math.round(netMerchProfit),
    });
  }

  // 6. Catering & Concessions baseline weekly revenue (bars & restaurant)
  let cateringProfit = 0;
  if (club.cateringConfig?.restaurantOpen) {
    cateringProfit += Math.round(club.cateringConfig.restaurantMenuPrice * 18 * club.cateringConfig.restaurantQualityStars);
  }
  if (club.cateringConfig?.concessionsOpen) {
    cateringProfit += 650;
  }
  if (cateringProfit > 0) {
    ledgerEntries.push({
      id: `ledg_cater_${Date.now()}`,
      date: currentDate,
      category: 'taquilla',
      description: 'Explotación comercial de cafeterías, bar y restaurante del club',
      amount: cateringProfit,
    });
  }

  // 7. Active Stadium Construction Projects Progress
  // Projects are paid upfront upon initiation. We advance duration and apply permanent capacity upgrades.
  const stadiumProg = processStadiumProjectsForDate(club, currentDate);
  const updatedProjects = stadiumProg.updatedClub.activeStadiumProjects || [];
  const updatedCapacity = stadiumProg.updatedClub.stadium.capacity;
  const updatedCondition = stadiumProg.updatedClub.stadium.condition;
  const updatedStadiumFacilities = stadiumProg.updatedClub.facilities;
  newsItems.push(...stadiumProg.completedNews);

  // If any legacy project still had a weeklyCost > 0, deduct certification
  updatedProjects.forEach((proj) => {
    if (proj.weeklyCost && proj.weeklyCost > 0) {
      ledgerEntries.push({
        id: `ledg_work_${proj.id}_${Date.now()}`,
        date: currentDate,
        category: 'instalaciones',
        description: `Certificación de obra: ${proj.title} (${proj.weeksRemaining} sem. restantes)`,
        amount: -proj.weeklyCost,
      });
    }
  });

  // Calculate net weekly balance delta
  const netWeeklyDelta = ledgerEntries.reduce((sum, item) => sum + item.amount, 0);
  const newBalance = club.finances.balance + netWeeklyDelta;

  const updatedLedger = [...ledgerEntries, ...club.finances.recentLedger].slice(0, 40);

  const updatedClub: Club = {
    ...club,
    facilities: updatedStadiumFacilities,
    stadium: {
      ...club.stadium,
      capacity: updatedCapacity,
      condition: updatedCondition,
    },
    loans: updatedLoans,
    activeStadiumProjects: updatedProjects,
    finances: {
      ...club.finances,
      balance: newBalance,
      recentLedger: updatedLedger,
    },
  };

  return { updatedClub, ledgerEntries, newsItems };
}

// Calculate realistic matchday gate receipts & attendance
export function calculateMatchdayGate(
  club: Club,
  opponent: Club,
  isDerby: boolean
): { attendance: number; gateRevenue: number; cateringRevenue: number } {
  const c = ensureClubManagementState(club);
  const zp = c.zonePricing || {
    tribunaPrice: 22,
    lateralPrice: 15,
    fondosPrice: 10,
    vipPrice: 45,
    visitorPrice: 14,
    seasonTicketDiscountPct: 20,
  };

  const cap = c.stadium.capacity;
  const avgPrice = (zp.tribunaPrice * 0.25 + zp.lateralPrice * 0.35 + zp.fondosPrice * 0.35 + zp.vipPrice * 0.05);

  // Demand curve
  const baseAttraction = 0.45 + (c.reputation / 100) * 0.3 + (opponent.reputation / 100) * 0.2;
  const derbyBonus = isDerby ? 0.25 : 0;
  const conditionFactor = (c.stadium.condition / 100) * 0.15;
  const priceResistance = Math.max(0.35, Math.min(1.8, 18 / Math.max(8, avgPrice)));

  const fillRate = Math.min(1.0, (baseAttraction + derbyBonus + conditionFactor) * priceResistance);
  const attendance = Math.min(cap, Math.round(cap * fillRate));

  const seasonPassHolders = Math.min(attendance, c.stadium.seasonTicketHolders);
  const singleTicketBuyers = Math.max(0, attendance - seasonPassHolders);

  // Distribute buyers across zones
  const tribunaBuyers = Math.round(singleTicketBuyers * 0.25);
  const lateralBuyers = Math.round(singleTicketBuyers * 0.35);
  const fondosBuyers = Math.round(singleTicketBuyers * 0.35);
  const vipBuyers = Math.round(singleTicketBuyers * 0.05);

  const gateRevenue = 
    tribunaBuyers * zp.tribunaPrice +
    lateralBuyers * zp.lateralPrice +
    fondosBuyers * zp.fondosPrice +
    vipBuyers * zp.vipPrice;

  // Catering sales on matchday
  let cateringRevenue = 0;
  if (c.cateringConfig?.concessionsOpen) {
    const spendPerFan = 3.2 + (c.cateringConfig.restaurantQualityStars * 0.6);
    cateringRevenue = Math.round(attendance * spendPerFan * 0.45);
  }

  return { attendance, gateRevenue, cateringRevenue };
}

// Request bank loan
export function applyForLoan(
  rawClub: Club,
  offer: LoanOffer,
  currentDate: string
): { updatedClub: Club; newsItem: NewsItem } {
  const club = ensureClubManagementState(rawClub);
  const loanRecord: ClubLoan = {
    id: `loan_${Date.now()}`,
    name: offer.name,
    principal: offer.principal,
    remainingAmount: Math.round(offer.principal * (1 + offer.interestRate)),
    interestRate: offer.interestRate,
    weeklyPayment: offer.weeklyPayment,
    remainingWeeks: offer.termWeeks,
    totalWeeks: offer.termWeeks,
    takenDate: currentDate,
  };

  const newBalance = club.finances.balance + offer.principal;
  const ledgerEntry: FinancialLedgerEntry = {
    id: `ledg_loan_in_${Date.now()}`,
    date: currentDate,
    category: 'patrocinio', // incoming finance
    description: `Concesión de crédito bancario: ${offer.name}`,
    amount: offer.principal,
  };

  const newsItem: NewsItem = {
    id: `news_loan_granted_${Date.now()}`,
    date: currentDate,
    title: `Acuerdo financiero: Inyección de ${offer.principal.toLocaleString()} € vía préstamo`,
    content: `La dirección general ha cerrado la firma de la ${offer.name}. El capital se incorpora inmediatamente a la tesorería del club para financiar la actividad deportiva y patrimonial.`,
    category: 'ECONOMIA',
    read: false,
  };

  const updatedClub: Club = {
    ...club,
    loans: [...(club.loans || []), loanRecord],
    finances: {
      ...club.finances,
      balance: newBalance,
      recentLedger: [ledgerEntry, ...club.finances.recentLedger],
    },
  };

  return { updatedClub, newsItem };
}

/**
 * Processes active stadium renovation projects on every calendar day.
 * When the duration has elapsed (either targetCompletionDate is reached or weeksRemaining <= 0),
 * the stadium capacity is permanently increased for all future fixtures, the project is completed,
 * and an official celebratory news item is registered.
 */
export function processStadiumProjectsForDate(
  rawClub: Club,
  currentDate: string
): { updatedClub: Club; completedNews: NewsItem[] } {
  const club = ensureClubManagementState(rawClub);
  const activeProjects = club.activeStadiumProjects || [];
  if (activeProjects.length === 0) {
    return { updatedClub: club, completedNews: [] };
  }

  const completedNews: NewsItem[] = [];
  let updatedCapacity = club.stadium.capacity;
  let updatedCondition = club.stadium.condition || 80;
  let updatedStadiumLevel = club.facilities.stadiumLevel || 1;
  const remainingProjects: ActiveConstructionProject[] = [];

  const curTime = new Date(currentDate).getTime();

  for (const project of activeProjects) {
    let isComplete = false;

    if (project.targetCompletionDate) {
      const targetTime = new Date(project.targetCompletionDate).getTime();
      if (curTime >= targetTime) {
        isComplete = true;
      }
    }

    if (!isComplete && project.weeksRemaining <= 0) {
      isComplete = true;
    }

    if (isComplete) {
      // 1. Permanently increase stadium capacity for all future matches
      const capacityIncrease = project.capacityChange || 0;
      if (capacityIncrease > 0) {
        updatedCapacity += capacityIncrease;
      }

      // 2. Permanently improve stadium condition / comfort
      if (project.comfortBonus) {
        updatedCondition = Math.min(100, updatedCondition + project.comfortBonus);
      }

      // 3. Increment facility stadium level if milestones are reached
      if (updatedCapacity >= 10000 && updatedStadiumLevel < 2) updatedStadiumLevel = 2;
      if (updatedCapacity >= 25000 && updatedStadiumLevel < 3) updatedStadiumLevel = 3;
      if (updatedCapacity >= 45000 && updatedStadiumLevel < 4) updatedStadiumLevel = 4;
      if (updatedCapacity >= 70000 && updatedStadiumLevel < 5) updatedStadiumLevel = 5;

      completedNews.push({
        id: `news_stadium_done_${Date.now()}_${project.id}`,
        date: currentDate,
        title: `¡Obras finalizadas en el estadio! ${project.title}`,
        content: `La junta directiva de ${club.name} ha inaugurado oficialmente la conclusión de las obras en ${club.stadium.name}. El nuevo aforo oficial asciende a ${updatedCapacity.toLocaleString()} espectadores de forma permanente (+${capacityIncrease.toLocaleString()} localidades homologadas) tras ${project.totalWeeks} semanas de construcción.`,
        category: 'INSTALACIONES',
        read: false,
      });
    } else {
      // Still in progress: update weeksRemaining based on remaining calendar days
      let updatedWeeks = project.weeksRemaining;
      if (project.targetCompletionDate) {
        const targetTime = new Date(project.targetCompletionDate).getTime();
        const diffMs = targetTime - curTime;
        const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        updatedWeeks = Math.max(1, Math.ceil(diffDays / 7));
      }
      remainingProjects.push({
        ...project,
        weeksRemaining: updatedWeeks,
      });
    }
  }

  const updatedClub: Club = {
    ...club,
    stadium: {
      ...club.stadium,
      capacity: updatedCapacity,
      condition: updatedCondition,
    },
    facilities: {
      ...club.facilities,
      stadiumLevel: updatedStadiumLevel,
    },
    activeStadiumProjects: remainingProjects,
  };

  return { updatedClub, completedNews };
}

// Start stadium upgrade project with upfront budget deduction and target completion date
export function startStadiumUpgrade(
  rawClub: Club,
  option: StadiumUpgradeOption,
  currentDate: string
): { updatedClub: Club; newsItem: NewsItem } {
  const club = ensureClubManagementState(rawClub);

  // 1. Calculate target completion date accurately based on durationWeeks (7 days per week)
  const startDate = new Date(currentDate);
  const durationDays = Math.max(1, (option.durationWeeks || 1) * 7);
  const targetDateObj = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const targetCompletionDate = targetDateObj.toISOString().slice(0, 10);

  // 2. Full cost deducted immediately from club budget / treasury
  const newBalance = club.finances.balance - option.cost;
  const newTransferBudget = Math.max(0, Math.min(club.finances.transferBudget || 0, Math.floor(newBalance * 0.8)));

  const ledgerEntry: FinancialLedgerEntry = {
    id: `ledg_stad_upg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: currentDate,
    category: 'instalaciones',
    description: `Financiación de obras: ${option.title} (${option.durationWeeks} sem.)`,
    amount: -option.cost,
  };

  const newProject: ActiveConstructionProject = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: option.title,
    type: option.category,
    totalCost: option.cost,
    weeklyCost: 0, // Paid upfront from treasury
    weeksRemaining: option.durationWeeks,
    totalWeeks: option.durationWeeks,
    capacityChange: option.capacityBonus,
    comfortBonus: option.comfortBonus,
    description: option.description,
    startedDate: currentDate,
    targetCompletionDate,
  };

  const newsItem: NewsItem = {
    id: `news_proj_started_${Date.now()}`,
    date: currentDate,
    title: `Inicio de obras: ${option.title}`,
    content: `Se han puesto en marcha las obras de modernización en el estadio ${club.stadium.name}. El coste íntegro de ${option.cost.toLocaleString()} € ha sido desembolsado y deducido del presupuesto del club. Duración prevista: ${option.durationWeeks} semanas (Fecha prevista: ${targetCompletionDate}). A su término, la capacidad del estadio aumentará en +${option.capacityBonus.toLocaleString()} localidades para siempre.`,
    category: 'INSTALACIONES',
    read: false,
  };

  const updatedClub: Club = {
    ...club,
    finances: {
      ...club.finances,
      balance: newBalance,
      transferBudget: newTransferBudget,
      recentLedger: [ledgerEntry, ...club.finances.recentLedger].slice(0, 50),
    },
    activeStadiumProjects: [...(club.activeStadiumProjects || []), newProject],
  };

  return { updatedClub, newsItem };
}

// Sign new sponsor contract
export function signSponsorProposal(
  rawClub: Club,
  proposal: SponsorProposal,
  currentDate: string
): { updatedClub: Club; newsItem: NewsItem } {
  const club = ensureClubManagementState(rawClub);
  const newContract: SponsorContract = {
    id: `spon_${Date.now()}`,
    category: proposal.category,
    sponsorName: proposal.sponsorName,
    industry: proposal.industry,
    annualAmount: proposal.annualAmount,
    weeklyPayment: Math.round(proposal.annualAmount / 40),
    yearsLeft: proposal.durationYears,
    reputationRequired: proposal.reputationRequired,
    bonusTitle: proposal.bonusTitle,
    bonusPromotion: proposal.bonusPromotion,
    clauses: proposal.clauses,
    signedDate: currentDate,
  };

  // Replace existing contract in that category
  const filtered = (club.sponsors || []).filter((s) => s.category !== proposal.category);

  const newsItem: NewsItem = {
    id: `news_spon_signed_${Date.now()}`,
    date: currentDate,
    title: `Nuevo patrocinio oficial: ${proposal.sponsorName}`,
    content: `El club ha firmado un acuerdo de patrocinio estratégico en la categoría ${proposal.category} por valor de ${proposal.annualAmount.toLocaleString()} € anuales durante ${proposal.durationYears} temporadas.`,
    category: 'ECONOMIA',
    read: false,
  };

  const updatedClub: Club = {
    ...club,
    sponsors: [...filtered, newContract],
  };

  return { updatedClub, newsItem };
}
