import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  BusinessTypeId,
  Difficulty,
  Season,
  Weather,
  BusinessStage,
  DailyReport,
  EconomicsTip,
  RandomEvent,
  EventChoice,
  Upgrade,
  ActiveLoan,
  LoanOffer,
  MarketingCampaign,
  StaffRole,
} from '../types/game';
import {
  BUSINESS_CONFIGS,
  STAGES_CONFIG,
  INITIAL_STAFF_ROLES,
  ALL_UPGRADES,
  LOAN_OFFERS,
  MARKETING_CAMPAIGNS,
  RANDOM_EVENTS_POOL,
  ECONOMICS_TIPS,
  INITIAL_ACHIEVEMENTS,
} from '../data/gameData';
import { soundFx } from '../utils/audio';
import { fireConfettiBurst } from '../utils/confetti';
import { calculateGrade } from '../utils/format';

const SAVE_KEY = 'vyapaar_tycoon_save_v1';
const LEADERBOARD_KEY = 'vyapaar_tycoon_leaderboard';

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [currentTip, setCurrentTip] = useState<EconomicsTip | null>(null);
  const [showMonthlySummary, setShowMonthlySummary] = useState<boolean>(false);
  const [lastMonthlyReport, setLastMonthlyReport] = useState<DailyReport[]>([]);
  const [stageUpgradedNotification, setStageUpgradedNotification] = useState<{ from: BusinessStage; to: BusinessStage } | null>(null);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage or null
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed: GameState = JSON.parse(saved);
        setGameState(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (gameState) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
      } catch {
        // storage overflow fallback
      }
    }
  }, [gameState]);

  // Compute Current Business Stage
  const currentNetWorth = gameState
    ? Math.round(
        gameState.cash +
          gameState.savings +
          gameState.inventory.reduce((acc, item) => acc + item.stock * item.wholesalePrice, 0) +
          gameState.upgrades.filter((u) => u.purchased).reduce((acc, u) => acc + u.cost * 0.75, 0) -
          gameState.activeLoans.reduce((acc, loan) => acc + loan.remainingBalance, 0)
      )
    : 0;

  const currentStage: BusinessStage = (() => {
    if (currentNetWorth >= 1000000) return 'corporation';
    if (currentNetWorth >= 400000) return 'chain';
    if (currentNetWorth >= 150000) return 'store';
    if (currentNetWorth >= 50000) return 'small_shop';
    return 'stall';
  })();

  // Start a new game
  const startNewGame = useCallback((businessName: string, businessType: BusinessTypeId, difficulty: Difficulty) => {
    const config = BUSINESS_CONFIGS[businessType];
    const startingCash = difficulty === 'easy' ? 50000 : difficulty === 'normal' ? 25000 : 10000;

    const initialInventory = config.defaultProducts.map((p) => ({
      ...p,
      totalSold: 0,
      totalRevenue: 0,
    }));

    const newState: GameState = {
      version: 1,
      businessName: businessName.trim() || 'My Business Tycoon',
      businessType,
      difficulty,
      day: 1,
      currentSeason: 'summer',
      currentWeather: 'sunny',
      cash: startingCash,
      savings: 0,
      reputation: 60,
      customerSatisfaction: 80,
      activeLoans: [],
      marketingCampaign: 'none',
      staff: INITIAL_STAFF_ROLES.map((s) => ({ ...s })),
      inventory: initialInventory,
      upgrades: ALL_UPGRADES.map((u) => ({ ...u })),
      tempDemandMultiplier: 1.0,
      tempDemandRemainingDays: 0,
      tempWholesaleMultiplier: 1.0,
      tempWholesaleRemainingDays: 0,
      dailyReports: [],
      achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
      completedLessons: {},
      activeTipQueue: [ECONOMICS_TIPS.supply_demand],
      activeEvent: null,
      isGameOver: false,
      hasWon: false,
      isEndlessMode: false,
      totalCustomersServed: 0,
      totalRevenueLifetime: 0,
      totalProfitLifetime: 0,
      insolvencyDaysCount: 0,
    };

    setGameState(newState);
    setIsPlaying(false);
    setCurrentTip(ECONOMICS_TIPS.supply_demand);
    soundFx.playKaching();
  }, []);

  // Advance simulation by 1 Day
  const advanceDay = useCallback(() => {
    setGameState((prev) => {
      if (!prev || prev.isGameOver) return prev;

      const nextDay = prev.day + 1;

      // Season progression every 15 days
      const seasonIndex = Math.floor(((nextDay - 1) % 60) / 15);
      const seasons: Season[] = ['summer', 'monsoon', 'festive', 'winter'];
      const nextSeason = seasons[seasonIndex];

      // Weather variation
      const weathers: Weather[] = ['sunny', 'heatwave', 'rainy', 'pleasant', 'chilly'];
      const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];

      // Check current stage definition
      const stageInfo = STAGES_CONFIG[currentStage];

      // Staff perks
      const cashiers = prev.staff.find((s) => s.id === 'cashier')?.count || 0;
      const salespersons = prev.staff.find((s) => s.id === 'salesperson')?.count || 0;
      const invManagers = prev.staff.find((s) => s.id === 'inventory_manager')?.count || 0;
      const marketers = prev.staff.find((s) => s.id === 'marketing_specialist')?.count || 0;

      // Upgrades perks
      const hasFreezer = prev.upgrades.find((u) => u.id === 'commercial_freezer')?.purchased || false;
      const hasSignboard = prev.upgrades.find((u) => u.id === 'neon_signboard')?.purchased || false;
      const hasDelivery = prev.upgrades.find((u) => u.id === 'online_delivery')?.purchased || false;
      const hasLoyalty = prev.upgrades.find((u) => u.id === 'loyalty_program')?.purchased || false;
      const hasSolar = prev.upgrades.find((u) => u.id === 'solar_rooftop')?.purchased || false;

      // Marketing
      const activeCampaign = MARKETING_CAMPAIGNS.find((c) => c.id === prev.marketingCampaign) || MARKETING_CAMPAIGNS[0];

      // Calculate Footfall (Daily Customers potential)
      let baseFootfall = Math.round(25 * stageInfo.footfallMultiplier);
      const repMultiplier = 0.7 + (prev.reputation / 100) * 0.6; // 0.7 to 1.3
      const marketingBoost = activeCampaign.footfallBoost + marketers * 0.25;
      const signboardBoost = hasSignboard ? 0.15 : 0;
      const deliveryBoost = hasDelivery ? 0.25 : 0;

      let totalFootfall = Math.round(
        baseFootfall * repMultiplier * (1 + marketingBoost + signboardBoost + deliveryBoost) * (prev.tempDemandRemainingDays > 0 ? prev.tempDemandMultiplier : 1.0)
      );

      // Weather impact on footfall
      if (nextWeather === 'rainy' && !hasDelivery) {
        totalFootfall = Math.round(totalFootfall * 0.75); // 25% drop if rainy and no delivery
      } else if (nextWeather === 'pleasant') {
        totalFootfall = Math.round(totalFootfall * 1.15);
      }

      // Cashier capacity: each cashier adds 20 max capacity above base 40
      const maxServiceCapacity = 40 + cashiers * 25;
      const actualCustomersServed = Math.min(totalFootfall, maxServiceCapacity);

      // Simulate Product Sales
      let dailyRevenue = 0;
      let dailyCOGS = 0;
      let totalItemsSold = 0;
      let totalSpoilageLoss = 0;

      const updatedInventory = prev.inventory.map((item) => {
        // Market baseline selling price
        const suggestedMarketPrice = Math.round(item.baseWholesalePrice * 1.6);
        const priceRatio = item.sellingPrice / suggestedMarketPrice;

        // Elasticity impact: if price is higher than market, demand falls; if lower, demand surges
        // Loyalty program gives 20% price tolerance
        const loyaltyShield = hasLoyalty ? 0.8 : 1.0;
        const effectivePriceRatio = priceRatio > 1 ? 1 + (priceRatio - 1) * loyaltyShield : priceRatio;
        const elasticityFactor = Math.pow(1 / Math.max(0.2, effectivePriceRatio), item.elasticity);

        // Seasonal multiplier
        const seasonalFactor = item.seasonalMultiplier[nextSeason] || 1.0;

        // Salesperson upselling boost
        const salespersonBoost = 1 + salespersons * 0.08;

        // Expected customer interest for this product (proportion of shoppers)
        const productInterestShare = 0.45; // average 45% of shoppers consider this item
        let potentialBuyerCount = Math.round(actualCustomersServed * productInterestShare * elasticityFactor * seasonalFactor * salespersonBoost);

        // Actual sales capped by current stock
        const unitsSold = Math.max(0, Math.min(item.stock, potentialBuyerCount));
        const itemRevenue = unitsSold * item.sellingPrice;
        const itemCOGS = unitsSold * item.wholesalePrice;

        dailyRevenue += itemRevenue;
        dailyCOGS += itemCOGS;
        totalItemsSold += unitsSold;

        let remainingStock = item.stock - unitsSold;
        let newDaysRemainingFresh = item.daysRemainingFresh;

        // Perishable Spoilage Logic
        if (item.maxShelfLifeDays > 0 && remainingStock > 0) {
          // Freezer slows down spoilage
          const spoilageSpeed = hasFreezer ? 0.5 : 1.0;
          newDaysRemainingFresh -= spoilageSpeed;

          // Inventory manager cuts spoilage in half
          if (invManagers > 0 && Math.random() < 0.5) {
            newDaysRemainingFresh += 0.5;
          }

          if (newDaysRemainingFresh <= 0) {
            // Spoiled!
            const spoiledUnits = remainingStock;
            const spoilageCost = spoiledUnits * item.wholesalePrice;
            totalSpoilageLoss += spoilageCost;
            remainingStock = 0;
            newDaysRemainingFresh = item.maxShelfLifeDays;
          }
        }

        // Wholesale price daily fluctuation (+/- 8%)
        const wholesaleDrift = (Math.random() - 0.5) * 0.16;
        const tempMultiplier = prev.tempWholesaleRemainingDays > 0 ? prev.tempWholesaleMultiplier : 1.0;
        const newWholesale = Math.max(
          Math.round(item.baseWholesalePrice * 0.7),
          Math.round(item.baseWholesalePrice * (1 + wholesaleDrift) * tempMultiplier * (invManagers > 0 ? 0.94 : 1.0))
        );

        return {
          ...item,
          stock: remainingStock,
          daysRemainingFresh: Math.max(0, newDaysRemainingFresh),
          wholesalePrice: newWholesale,
          totalSold: item.totalSold + unitsSold,
          totalRevenue: item.totalRevenue + itemRevenue,
        };
      });

      // Daily Operating Expenses
      const rentExpense = stageInfo.rentPerDay;
      const salaryExpense = prev.staff.reduce((acc, s) => acc + s.count * s.dailySalary, 0);
      const baseElectricity = Math.round(150 + stageInfo.footfallMultiplier * 80);
      const electricityExpense = hasSolar ? Math.round(baseElectricity * 0.35) : baseElectricity;
      const marketingExpense = activeCampaign.dailyCost;

      // Loans processing
      let loanEmiExpense = 0;
      const updatedLoans: ActiveLoan[] = [];
      let loanRepaidCelebration = false;

      prev.activeLoans.forEach((loan) => {
        loanEmiExpense += loan.dailyEmi;
        const nextRemainingDays = loan.remainingDays - 1;
        const nextBalance = Math.max(0, loan.remainingBalance - loan.dailyEmi);

        if (nextRemainingDays <= 0 || nextBalance <= 0) {
          loanRepaidCelebration = true;
        } else {
          updatedLoans.push({
            ...loan,
            remainingDays: nextRemainingDays,
            remainingBalance: nextBalance,
          });
        }
      });

      // Municipal & GST Taxes: approx 3.5% of revenue
      const taxExpense = Math.round(dailyRevenue * 0.035);

      // Total daily expenses (cash outflow)
      const dailyExpenses = rentExpense + salaryExpense + electricityExpense + marketingExpense + loanEmiExpense + taxExpense;

      // Net Daily Profit (Revenue - COGS - Expenses - Spoilage)
      const dailyNetProfit = dailyRevenue - dailyCOGS - dailyExpenses - totalSpoilageLoss;

      // Cash flow: Cash gained = Revenue - dailyExpenses (COGS was spent during purchase)
      const nextCash = Math.round(prev.cash + dailyRevenue - dailyExpenses);

      // Savings interest: 4% annual = ~0.011% daily
      const dailyInterest = Math.round(prev.savings * 0.00011);
      const nextSavings = prev.savings + dailyInterest;

      // Reputation & Satisfaction Dynamics
      let repChange = activeCampaign.reputationGainDaily + marketers * 0.4;
      let satChange = 0;

      // If footfall overflowed capacity, customer satisfaction drops
      if (totalFootfall > maxServiceCapacity) {
        satChange -= 4;
      } else {
        satChange += 1;
      }

      // If prices are too high vs market, satisfaction drops
      const avgPriceRatio =
        updatedInventory.reduce((acc, item) => acc + item.sellingPrice / (item.baseWholesalePrice * 1.6), 0) /
        updatedInventory.length;
      if (avgPriceRatio > 1.25) {
        satChange -= 3;
      } else if (avgPriceRatio < 0.95) {
        satChange += 3;
      }

      if (salespersons > 0) {
        satChange += salespersons * 2;
      }

      const nextCustomerSatisfaction = Math.min(100, Math.max(10, prev.customerSatisfaction + satChange));
      const nextReputation = Math.min(100, Math.max(15, Math.round(prev.reputation + repChange + (satChange > 0 ? 1 : -1))));

      // Insolvency check
      let nextInsolvencyDays = prev.insolvencyDaysCount;
      let isGameOver = false;
      let gameOverReason: string | undefined = undefined;

      if (nextCash < -10000) {
        nextInsolvencyDays += 1;
        if (nextInsolvencyDays >= 3) {
          isGameOver = true;
          gameOverReason = 'Insolvency: Your cash reserve stayed below -₹10,000 for 3 consecutive days. The commercial court declared bankruptcy.';
          soundFx.playError();
        }
      } else {
        nextInsolvencyDays = 0;
      }

      // Temporary modifiers decrement
      const nextDemandDays = Math.max(0, prev.tempDemandRemainingDays - 1);
      const nextDemandMult = nextDemandDays > 0 ? prev.tempDemandMultiplier : 1.0;
      const nextWholesaleDays = Math.max(0, prev.tempWholesaleRemainingDays - 1);
      const nextWholesaleMult = nextWholesaleDays > 0 ? prev.tempWholesaleMultiplier : 1.0;

      // Calculate Ending Net Worth
      const endingNetWorth = Math.round(
        nextCash +
          nextSavings +
          updatedInventory.reduce((acc, item) => acc + item.stock * item.wholesalePrice, 0) +
          prev.upgrades.filter((u) => u.purchased).reduce((acc, u) => acc + u.cost * 0.75, 0) -
          updatedLoans.reduce((acc, loan) => acc + loan.remainingBalance, 0)
      );

      // Create Daily Report
      const dailyReport: DailyReport = {
        day: prev.day,
        revenue: dailyRevenue,
        cogs: dailyCOGS,
        rent: rentExpense,
        salaries: salaryExpense,
        electricity: electricityExpense,
        marketing: marketingExpense,
        loanEmi: loanEmiExpense,
        taxes: taxExpense,
        spoilageLoss: totalSpoilageLoss,
        netProfit: dailyNetProfit,
        cashEnd: nextCash,
        netWorthEnd: endingNetWorth,
        customersServed: actualCustomersServed,
        itemsSold: totalItemsSold,
      };

      const updatedDailyReports = [...prev.dailyReports, dailyReport];

      // Random Event Trigger check (approx 20% chance if no event active and after Day 2)
      let nextActiveEvent: RandomEvent | null = prev.activeEvent;
      if (!nextActiveEvent && nextDay > 2 && Math.random() < 0.22) {
        const randomEvent = RANDOM_EVENTS_POOL[Math.floor(Math.random() * RANDOM_EVENTS_POOL.length)];
        nextActiveEvent = randomEvent;
        soundFx.playAlert();
      }

      // Achievements Unlock Check
      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.unlocked) return ach;
        let shouldUnlock = false;

        if (ach.id === 'first_sale' && dailyNetProfit > 0) shouldUnlock = true;
        if (ach.id === 'customers_100' && prev.totalCustomersServed + actualCustomersServed >= 100) shouldUnlock = true;
        if (ach.id === 'debt_free' && loanRepaidCelebration) shouldUnlock = true;
        if (ach.id === 'chain_owner' && currentStage === 'chain') shouldUnlock = true;
        if (ach.id === 'millionaire' && endingNetWorth >= 1000000) shouldUnlock = true;
        if (ach.id === 'reputation_high' && nextCustomerSatisfaction >= 90) shouldUnlock = true;
        if (ach.id === 'zero_waste' && nextDay >= 15 && totalSpoilageLoss <= 500) shouldUnlock = true;

        if (shouldUnlock) {
          fireConfettiBurst({ count: 70, hasRupees: true });
          soundFx.playSuccess();
          return {
            ...ach,
            unlocked: true,
            unlockedDay: nextDay,
          };
        }
        return ach;
      });

      // Win Condition Check (Net Worth >= ₹10,00,000)
      let hasWon = prev.hasWon;
      if (endingNetWorth >= 1000000 && !prev.hasWon) {
        hasWon = true;
        fireConfettiBurst({ count: 120, hasRupees: true });
        soundFx.playSuccess();

        // Save run to local leaderboard
        try {
          const existingLeaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
          const grade = calculateGrade(nextDay, endingNetWorth, nextCustomerSatisfaction, updatedLoans.length === 0);
          const newEntry = {
            id: String(Date.now()),
            businessName: prev.businessName,
            businessType: prev.businessType,
            daysPlayed: nextDay,
            finalNetWorth: endingNetWorth,
            grade,
            date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
          const updated = [...existingLeaderboard, newEntry]
            .sort((a, b) => b.finalNetWorth - a.finalNetWorth)
            .slice(0, 5);
          localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }

      // Check Stage Upgrade
      const newStage = (() => {
        if (endingNetWorth >= 1000000) return 'corporation';
        if (endingNetWorth >= 400000) return 'chain';
        if (endingNetWorth >= 150000) return 'store';
        if (endingNetWorth >= 50000) return 'small_shop';
        return 'stall';
      })();

      if (newStage !== currentStage) {
        setStageUpgradedNotification({ from: currentStage, to: newStage });
        soundFx.playKaching();
        fireConfettiBurst({ count: 80, hasRupees: true });
      }

      // Check End-of-Month (every 30 days)
      if (nextDay % 30 === 1 && prev.day >= 30) {
        setShowMonthlySummary(true);
        setLastMonthlyReport(updatedDailyReports.slice(-30));
      }

      // Check contextual economics tip triggers
      const tipQueue = [...prev.activeTipQueue];
      if (dailyNetProfit > 0 && !tipQueue.some((t) => t.id === 'break_even')) {
        tipQueue.push(ECONOMICS_TIPS.break_even);
      }
      if (totalSpoilageLoss > 0 && !tipQueue.some((t) => t.id === 'inventory_holding')) {
        tipQueue.push(ECONOMICS_TIPS.inventory_holding);
      }

      if (tipQueue.length > 0 && !currentTip) {
        setCurrentTip(tipQueue[0]);
      }

      return {
        ...prev,
        day: nextDay,
        currentSeason: nextSeason,
        currentWeather: nextWeather,
        cash: nextCash,
        savings: nextSavings,
        reputation: nextReputation,
        customerSatisfaction: nextCustomerSatisfaction,
        activeLoans: updatedLoans,
        inventory: updatedInventory,
        dailyReports: updatedDailyReports,
        achievements: updatedAchievements,
        activeTipQueue: tipQueue.slice(1),
        activeEvent: nextActiveEvent,
        tempDemandMultiplier: nextDemandMult,
        tempDemandRemainingDays: nextDemandDays,
        tempWholesaleMultiplier: nextWholesaleMult,
        tempWholesaleRemainingDays: nextWholesaleDays,
        isGameOver,
        gameOverReason,
        hasWon,
        totalCustomersServed: prev.totalCustomersServed + actualCustomersServed,
        totalRevenueLifetime: prev.totalRevenueLifetime + dailyRevenue,
        totalProfitLifetime: prev.totalProfitLifetime + (dailyNetProfit > 0 ? dailyNetProfit : 0),
        insolvencyDaysCount: nextInsolvencyDays,
      };
    });
  }, [currentStage, currentTip]);

  // Handle Event Choice
  const resolveEvent = useCallback((choice: EventChoice) => {
    setGameState((prev) => {
      if (!prev || !prev.activeEvent) return prev;

      let nextCash = prev.cash + (choice.cashDelta || 0);
      let nextReputation = Math.min(100, Math.max(10, prev.reputation + (choice.reputationDelta || 0)));

      let nextDemandMult = prev.tempDemandMultiplier;
      let nextDemandDays = prev.tempDemandRemainingDays;
      if (choice.demandModifierDays) {
        nextDemandMult = choice.demandModifierDays.factor;
        nextDemandDays = choice.demandModifierDays.days;
      }

      let nextWholesaleMult = prev.tempWholesaleMultiplier;
      let nextWholesaleDays = prev.tempWholesaleRemainingDays;
      if (choice.priceModifierDays) {
        nextWholesaleMult = choice.priceModifierDays.factor;
        nextWholesaleDays = choice.priceModifierDays.days;
      }

      // Spoilage risk execution
      let updatedInventory = prev.inventory;
      if (choice.spoilageRiskPercent && choice.spoilageRiskPercent > 0) {
        updatedInventory = prev.inventory.map((item) => {
          if (item.maxShelfLifeDays > 0 && item.stock > 0) {
            const lostUnits = Math.ceil(item.stock * (choice.spoilageRiskPercent! / 100));
            return {
              ...item,
              stock: Math.max(0, item.stock - lostUnits),
            };
          }
          return item;
        });
      }

      soundFx.playClick();

      return {
        ...prev,
        cash: nextCash,
        reputation: nextReputation,
        tempDemandMultiplier: nextDemandMult,
        tempDemandRemainingDays: nextDemandDays,
        tempWholesaleMultiplier: nextWholesaleMult,
        tempWholesaleRemainingDays: nextWholesaleDays,
        inventory: updatedInventory,
        activeEvent: null,
      };
    });
  }, []);

  // Update product selling price
  const setProductPrice = useCallback((productId: string, newPrice: number) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        inventory: prev.inventory.map((item) =>
          item.id === productId ? { ...item, sellingPrice: Math.max(1, Math.round(newPrice)) } : item
        ),
      };
    });
  }, []);

  // Buy stock from wholesale market
  const buyStock = useCallback((productId: string, quantity: number, totalCost: number) => {
    setGameState((prev) => {
      if (!prev || prev.cash < totalCost) return prev;

      soundFx.playKaching();

      // Check achievement for bulk purchase >= 50
      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.id === 'bulk_buyer' && !ach.unlocked && quantity >= 50) {
          fireConfettiBurst({ count: 60, hasRupees: true });
          soundFx.playSuccess();
          return { ...ach, unlocked: true, unlockedDay: prev.day };
        }
        return ach;
      });

      return {
        ...prev,
        cash: prev.cash - totalCost,
        inventory: prev.inventory.map((item) => {
          if (item.id === productId) {
            return {
              ...item,
              stock: item.stock + quantity,
              daysRemainingFresh: item.maxShelfLifeDays, // new batch refreshes shelf life
            };
          }
          return item;
        }),
        achievements: updatedAchievements,
      };
    });
  }, []);

  // Hire or fire staff
  const updateStaff = useCallback((roleId: StaffRole['id'], delta: number) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const stageInfo = STAGES_CONFIG[currentStage];
      const totalStaff = prev.staff.reduce((acc, s) => acc + s.count, 0);

      if (delta > 0 && totalStaff >= stageInfo.maxStaff) {
        soundFx.playError();
        return prev;
      }

      soundFx.playClick();
      return {
        ...prev,
        staff: prev.staff.map((s) => {
          if (s.id === roleId) {
            const nextCount = Math.max(0, Math.min(s.maxCount, s.count + delta));
            return { ...s, count: nextCount };
          }
          return s;
        }),
      };
    });
  }, [currentStage]);

  // Purchase an upgrade
  const buyUpgrade = useCallback((upgradeId: string) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const upgrade = prev.upgrades.find((u) => u.id === upgradeId);
      if (!upgrade || upgrade.purchased || prev.cash < upgrade.cost) {
        soundFx.playError();
        return prev;
      }

      soundFx.playKaching();
      fireConfettiBurst({ count: 50, hasRupees: false });

      return {
        ...prev,
        cash: prev.cash - upgrade.cost,
        upgrades: prev.upgrades.map((u) => (u.id === upgradeId ? { ...u, purchased: true } : u)),
      };
    });
  }, []);

  // Select Marketing Campaign
  const setMarketingCampaign = useCallback((campaignId: MarketingCampaign['id']) => {
    setGameState((prev) => {
      if (!prev) return prev;
      soundFx.playClick();
      return {
        ...prev,
        marketingCampaign: campaignId,
      };
    });
  }, []);

  // Take a bank loan
  const takeLoan = useCallback((offer: LoanOffer) => {
    setGameState((prev) => {
      if (!prev) return prev;
      // Formula: total repay = principal * (1 + (rate% * days/365))
      const totalInterest = offer.principal * ((offer.annualInterestRate / 100) * (offer.durationDays / 365));
      const totalRepay = offer.principal + totalInterest;
      const dailyEmi = Math.round(totalRepay / offer.durationDays);

      const newLoan: ActiveLoan = {
        id: `loan_${Date.now()}`,
        name: offer.name,
        principal: offer.principal,
        annualInterestRate: offer.annualInterestRate,
        durationDays: offer.durationDays,
        remainingDays: offer.durationDays,
        dailyEmi,
        remainingBalance: Math.round(totalRepay),
      };

      soundFx.playKaching();

      // Trigger debt economics tip if not already shown
      const tipQueue = [...prev.activeTipQueue];
      if (!tipQueue.some((t) => t.id === 'leverage_debt')) {
        tipQueue.push(ECONOMICS_TIPS.leverage_debt);
      }

      return {
        ...prev,
        cash: prev.cash + offer.principal,
        activeLoans: [...prev.activeLoans, newLoan],
        activeTipQueue: tipQueue,
      };
    });
  }, []);

  // Deposit to savings
  const depositSavings = useCallback((amount: number) => {
    setGameState((prev) => {
      if (!prev || prev.cash < amount || amount <= 0) return prev;
      soundFx.playClick();
      return {
        ...prev,
        cash: prev.cash - amount,
        savings: prev.savings + amount,
      };
    });
  }, []);

  // Withdraw from savings
  const withdrawSavings = useCallback((amount: number) => {
    setGameState((prev) => {
      if (!prev || prev.savings < amount || amount <= 0) return prev;
      soundFx.playCoin();
      return {
        ...prev,
        cash: prev.cash + amount,
        savings: prev.savings - amount,
      };
    });
  }, []);

  // Complete a quiz module
  const completeQuiz = useCallback((lessonId: string, score: number, totalQuestions: number) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const isPerfect = score === totalQuestions;
      const rewardCash = score * 1000;
      const rewardRep = score * 2;

      if (isPerfect) {
        soundFx.playSuccess();
        fireConfettiBurst({ count: 60, hasRupees: true });
      } else {
        soundFx.playCoin();
      }

      const updatedCompleted = {
        ...prev.completedLessons,
        [lessonId]: Math.max(score, prev.completedLessons[lessonId] || 0),
      };

      // Check Economics Scholar achievement (5 perfect scores)
      const perfectCount = Object.values(updatedCompleted).filter((s) => s === 5).length;
      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.id === 'economics_scholar' && !ach.unlocked && perfectCount >= 5) {
          fireConfettiBurst({ count: 90, hasRupees: true });
          return { ...ach, unlocked: true, unlockedDay: prev.day };
        }
        return ach;
      });

      return {
        ...prev,
        cash: prev.cash + rewardCash,
        reputation: Math.min(100, prev.reputation + rewardRep),
        completedLessons: updatedCompleted,
        achievements: updatedAchievements,
      };
    });
  }, []);

  // Continue Playing in Endless Mode after victory
  const continueEndlessMode = useCallback(() => {
    setGameState((prev) => (prev ? { ...prev, isEndlessMode: true } : null));
  }, []);

  // Reset Game Data
  const resetGame = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setGameState(null);
    setIsPlaying(false);
  }, []);

  // Auto-play game loop
  useEffect(() => {
    if (isPlaying && gameState && !gameState.isGameOver && !gameState.activeEvent) {
      const intervalMs = gameSpeed === 4 ? 600 : gameSpeed === 2 ? 1200 : 2500;
      autoPlayTimerRef.current = setTimeout(() => {
        advanceDay();
      }, intervalMs);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isPlaying, gameSpeed, gameState, advanceDay]);

  return {
    gameState,
    isPlaying,
    setIsPlaying,
    gameSpeed,
    setGameSpeed,
    currentStage,
    currentNetWorth,
    currentTip,
    setCurrentTip,
    showMonthlySummary,
    setShowMonthlySummary,
    lastMonthlyReport,
    stageUpgradedNotification,
    setStageUpgradedNotification,
    startNewGame,
    advanceDay,
    resolveEvent,
    setProductPrice,
    buyStock,
    updateStaff,
    buyUpgrade,
    setMarketingCampaign,
    takeLoan,
    depositSavings,
    withdrawSavings,
    completeQuiz,
    continueEndlessMode,
    resetGame,
  };
}
