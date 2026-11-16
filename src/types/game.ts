export type BusinessTypeId = 
  | 'lemonade' 
  | 'grocery' 
  | 'bakery' 
  | 'electronics' 
  | 'clothing';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type Season = 'summer' | 'monsoon' | 'festive' | 'winter';

export type Weather = 'sunny' | 'heatwave' | 'rainy' | 'pleasant' | 'chilly';

export type BusinessStage = 'stall' | 'small_shop' | 'store' | 'chain' | 'corporation';

export interface ProductInventoryItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  wholesalePrice: number;
  baseWholesalePrice: number;
  sellingPrice: number;
  stock: number;
  maxShelfLifeDays: number; // 0 means non-perishable
  daysRemainingFresh: number;
  totalSold: number;
  totalRevenue: number;
  elasticity: number; // e.g. 1.2 is elastic, 0.5 is inelastic
  seasonalMultiplier: Record<Season, number>;
}

export interface BusinessStageInfo {
  stage: BusinessStage;
  name: string;
  icon: string;
  minNetWorth: number;
  rentPerDay: number;
  footfallMultiplier: number;
  baseStorage: number;
  maxStaff: number;
  perks: string;
}

export interface StaffRole {
  id: 'cashier' | 'salesperson' | 'inventory_manager' | 'marketing_specialist';
  name: string;
  icon: string;
  dailySalary: number;
  description: string;
  productivityBonus: string;
  count: number;
  maxCount: number;
}

export interface Upgrade {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
  category: 'storage' | 'equipment' | 'marketing' | 'tech' | 'green';
  purchased: boolean;
  minStage: BusinessStage;
  effect: {
    storageBonus?: number;
    footfallBonus?: number;
    spoilageReduction?: number; // 0.5 = 50% slower spoilage
    electricityReduction?: number; // 0.6 = 60% off electricity
    deliveryBonus?: number; // online delivery sales boost
    loyaltyBonus?: number; // customer price tolerance boost
    theftEliminated?: boolean;
  };
}

export interface ActiveLoan {
  id: string;
  name: string;
  principal: number;
  annualInterestRate: number;
  durationDays: number;
  remainingDays: number;
  dailyEmi: number;
  remainingBalance: number;
}

export interface LoanOffer {
  id: string;
  name: string;
  principal: number;
  annualInterestRate: number;
  durationDays: number;
  description: string;
  minNetWorth: number;
}

export interface EventChoice {
  text: string;
  outcomeText: string;
  economicConcept: string;
  cashDelta?: number;
  reputationDelta?: number;
  demandModifierDays?: { factor: number; days: number };
  priceModifierDays?: { factor: number; days: number };
  spoilageRiskPercent?: number;
}

export interface RandomEvent {
  id: string;
  title: string;
  icon: string;
  tag: string;
  description: string;
  economicConcept: string;
  choices: EventChoice[];
}

export interface DailyReport {
  day: number;
  revenue: number;
  cogs: number;
  rent: number;
  salaries: number;
  electricity: number;
  marketing: number;
  loanEmi: number;
  taxes: number;
  spoilageLoss: number;
  netProfit: number;
  cashEnd: number;
  netWorthEnd: number;
  customersServed: number;
  itemsSold: number;
}

export interface EconomicsTip {
  id: string;
  title: string;
  concept: string;
  icon: string;
  summary: string;
  explanation: string;
  gameplayApplication: string;
  example: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EconomicsLesson {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  concept: string;
  explanation: string;
  realWorldExample: string;
  tycoonStrategy: string;
  completed: boolean;
  score?: number; // out of questions.length
  questions: QuizQuestion[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCash: number;
  rewardReputation: number;
  unlocked: boolean;
  unlockedDay?: number;
}

export interface LeaderboardEntry {
  id: string;
  businessName: string;
  businessType: BusinessTypeId;
  daysPlayed: number;
  finalNetWorth: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  date: string;
}

export interface MarketingCampaign {
  id: 'none' | 'flyers' | 'social_media' | 'billboard' | 'influencer';
  name: string;
  dailyCost: number;
  footfallBoost: number;
  reputationGainDaily: number;
}

export interface GameState {
  version: number;
  businessName: string;
  businessType: BusinessTypeId;
  difficulty: Difficulty;
  day: number;
  currentSeason: Season;
  currentWeather: Weather;
  
  // Finances
  cash: number;
  savings: number;
  reputation: number; // 0 - 100
  customerSatisfaction: number; // 0 - 100
  activeLoans: ActiveLoan[];
  
  // Marketing & Staff
  marketingCampaign: MarketingCampaign['id'];
  staff: StaffRole[];
  
  // Inventory & Upgrades
  inventory: ProductInventoryItem[];
  upgrades: Upgrade[];
  
  // Modifiers
  tempDemandMultiplier: number;
  tempDemandRemainingDays: number;
  tempWholesaleMultiplier: number;
  tempWholesaleRemainingDays: number;
  
  // Progress & History
  dailyReports: DailyReport[];
  achievements: Achievement[];
  completedLessons: Record<string, number>; // lessonId -> score
  activeTipQueue: EconomicsTip[];
  activeEvent: RandomEvent | null;
  
  // Game Status
  isGameOver: boolean;
  gameOverReason?: string;
  hasWon: boolean;
  isEndlessMode: boolean;
  totalCustomersServed: number;
  totalRevenueLifetime: number;
  totalProfitLifetime: number;
  insolvencyDaysCount: number;
}
