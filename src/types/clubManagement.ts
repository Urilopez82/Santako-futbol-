export type SponsorCategory = 
  | 'CAMISETA_PRINCIPAL'
  | 'MANGA'
  | 'PANTALON'
  | 'VALLAS_ESTADIO'
  | 'DIGITAL'
  | 'NAMING_ESTADIO';

export interface SponsorContract {
  id: string;
  category: SponsorCategory;
  sponsorName: string;
  industry: string;
  annualAmount: number;
  weeklyPayment: number;
  yearsLeft: number;
  reputationRequired: number;
  bonusTitle: number;
  bonusPromotion: number;
  clauses: string;
  signedDate: string;
}

export interface SponsorProposal {
  id: string;
  category: SponsorCategory;
  sponsorName: string;
  industry: string;
  annualAmount: number;
  durationYears: number;
  reputationRequired: number;
  bonusTitle: number;
  bonusPromotion: number;
  clauses: string;
  reputationScore: number;
}

export interface ClubLoan {
  id: string;
  name: string;
  principal: number;
  remainingAmount: number;
  interestRate: number; // e.g. 0.05 for 5%
  weeklyPayment: number;
  remainingWeeks: number;
  totalWeeks: number;
  takenDate: string;
}

export interface LoanOffer {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  termWeeks: number;
  weeklyPayment: number;
  description: string;
  minReputation: number;
}

export type KitPattern = 
  | 'solid' 
  | 'stripes_vertical' 
  | 'stripes_horizontal' 
  | 'sash' 
  | 'halves' 
  | 'gradient' 
  | 'checkered';

export type KitCollar = 'round' | 'v_neck' | 'polo';

export interface KitDesign {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pattern: KitPattern;
  collar: KitCollar;
  sleeveColor: string;
  shortsColor: string;
  socksColor: string;
  sponsorText?: string;
  manufacturerLogo?: string;
}

export interface ClubKits {
  home: KitDesign;
  away: KitDesign;
  third: KitDesign;
  appealRating: number; // 1-100 affects jersey sales
}

export interface StadiumZonePricing {
  tribunaPrice: number;
  lateralPrice: number;
  fondosPrice: number;
  vipPrice: number;
  visitorPrice: number;
  seasonTicketDiscountPct: number; // e.g. 20%
}

export interface StadiumZoneCapacity {
  tribuna: number;
  lateral: number;
  fondos: number;
  vipBoxes: number;
}

export interface ActiveConstructionProject {
  id: string;
  title: string;
  type: 'AMPLIACION_AFORO' | 'CESPED_HIBRIDO' | 'VIDEOMARCADOR' | 'ILUMINACION_TV' | 'PALCOS_VIP' | 'VESTUARIOS' | 'PARKING' | 'ACCESOS';
  totalCost: number;
  weeklyCost: number;
  weeksRemaining: number;
  totalWeeks: number;
  capacityChange: number;
  comfortBonus: number;
  description: string;
  startedDate: string;
  targetCompletionDate?: string;
}

export interface StadiumUpgradeOption {
  id: string;
  title: string;
  category: ActiveConstructionProject['type'];
  cost: number;
  durationWeeks: number;
  capacityBonus: number;
  comfortBonus: number;
  revenueBonusPerMatch: number;
  description: string;
  minTier?: number;
}

export interface CateringItem {
  id: string;
  name: string;
  category: 'bocadillos' | 'bebidas' | 'snacks' | 'menu_vip';
  costPrice: number;
  salePrice: number;
  qualityLevel: 1 | 2 | 3 | 4 | 5;
  supplier: string;
  weeklySalesVolume: number;
}

export interface StadiumCateringConfig {
  restaurantOpen: boolean;
  restaurantMenuPrice: number;
  restaurantQualityStars: number;
  concessionsOpen: boolean;
  items: CateringItem[];
}

export interface MerchandiseItem {
  id: string;
  name: string;
  category: 'camisetas' | 'bufandas' | 'gorras' | 'accesorios';
  costPrice: number;
  salePrice: number;
  stock: number;
  unitsSoldWeekly: number;
  description: string;
}

export interface MerchandisingStore {
  items: MerchandiseItem[];
  marketingLevel: number; // 1-5
  weeklyMarketingExpense: number;
}

export interface PressQuestion {
  id: string;
  journalist: string;
  mediaOutlet: string;
  question: string;
  options: {
    text: string;
    moraleEffect: number; // -5 to +5
    boardConfidenceEffect: number; // -5 to +5
    fansPopularityEffect: number; // -5 to +5
    tone: 'prudente' | 'ambicioso' | 'polemico';
  }[];
}

export interface ClubStatementOption {
  id: string;
  title: string;
  category: 'RESPALDO_EQUIPO' | 'QUEJA_ARBITRAL' | 'LLAMAMIENTO_AFICION' | 'TRANQUILIDAD_ECONOMICA';
  cost: number;
  description: string;
  fansEffect: number;
  boardEffect: number;
}

export interface ClubBoardGovernance {
  presidentName: string;
  mandateYearsLeft: number;
  patienceLevel: 'Muy Alta' | 'Equilibrada' | 'Exigente' | 'Intransigente';
  financialFocus: 'Austeridad Rigurosa' | 'Sostenibilidad' | 'Inversión Ambiciosa';
  currentDemands: string[];
}
