import React, { useState, useEffect } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { Header } from './components/Header';
import { BottomNav, NavTabId } from './components/BottomNav';
import { ShopView } from './views/ShopView';
import { MarketView } from './views/MarketView';
import { StaffUpgradesView } from './views/StaffUpgradesView';
import { FinanceView } from './views/FinanceView';
import { LearnView } from './views/LearnView';
import { NewGameModal } from './components/NewGameModal';
import { TutorialModal } from './components/TutorialModal';
import { EventModal } from './components/EventModal';
import { EconomicsTipModal } from './components/EconomicsTipModal';
import { MonthlySummaryModal } from './components/MonthlySummaryModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { StageUpgradeModal } from './components/StageUpgradeModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('shop');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vyapaar_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showNewGameModal, setShowNewGameModal] = useState<boolean>(false);

  const {
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
  } = useGameEngine();

  // Sync dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vyapaar_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vyapaar_theme', 'light');
    }
  }, [isDarkMode]);

  // Check first-time tutorial launch
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('vyapaar_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('vyapaar_tutorial_seen', 'true');
    }
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleStartNewGame = (name: string, type: any, difficulty: any) => {
    startNewGame(name, type, difficulty);
    setShowNewGameModal(false);
  };

  const handleConfirmReset = () => {
    if (window.confirm('Start a new business venture? Your current save will be replaced.')) {
      setShowNewGameModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* If no game exists or user requested new game, show New Game Modal */}
      {(!gameState || showNewGameModal) && (
        <NewGameModal
          onStart={handleStartNewGame}
          hasExistingSave={!!gameState}
          onContinueExisting={() => setShowNewGameModal(false)}
        />
      )}

      {/* Main Game Interface */}
      {gameState && (
        <>
          {/* Header & Sticky Financial HUD */}
          <Header
            gameState={gameState}
            currentStage={currentStage}
            currentNetWorth={currentNetWorth}
            isPlaying={isPlaying}
            gameSpeed={gameSpeed}
            isDarkMode={isDarkMode}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onSetSpeed={setGameSpeed}
            onAdvanceDay={advanceDay}
            onToggleDarkMode={handleToggleDarkMode}
            onOpenTutorial={() => setShowTutorial(true)}
            onConfirmReset={handleConfirmReset}
          />

          {/* Central Workspace Container */}
          <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5">
            {activeTab === 'shop' && (
              <ShopView
                gameState={gameState}
                currentStage={currentStage}
                currentNetWorth={currentNetWorth}
                onSetProductPrice={setProductPrice}
                onNavigateToMarket={() => setActiveTab('market')}
              />
            )}

            {activeTab === 'market' && (
              <MarketView
                gameState={gameState}
                currentStage={currentStage}
                onBuyStock={buyStock}
                onNavigateToStaff={() => setActiveTab('staff')}
              />
            )}

            {activeTab === 'staff' && (
              <StaffUpgradesView
                gameState={gameState}
                currentStage={currentStage}
                onUpdateStaff={updateStaff}
                onBuyUpgrade={buyUpgrade}
                onSetMarketing={setMarketingCampaign}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceView
                gameState={gameState}
                currentStage={currentStage}
                currentNetWorth={currentNetWorth}
                onTakeLoan={takeLoan}
                onDepositSavings={depositSavings}
                onWithdrawSavings={withdrawSavings}
              />
            )}

            {activeTab === 'learn' && (
              <LearnView
                gameState={gameState}
                onCompleteQuiz={completeQuiz}
              />
            )}
          </main>

          {/* Fixed Mobile Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasPendingLoans={gameState.activeLoans.length > 0}
            hasUnreadTips={gameState.activeTipQueue.length > 0}
          />

          {/* Interactive Modals */}
          {/* 1. Tutorial Modal */}
          {showTutorial && (
            <TutorialModal onClose={() => setShowTutorial(false)} />
          )}

          {/* 2. Random Event Modal */}
          {gameState.activeEvent && (
            <EventModal
              event={gameState.activeEvent}
              onResolve={resolveEvent}
            />
          )}

          {/* 3. Economics In Action Tip Modal */}
          {currentTip && !gameState.activeEvent && (
            <EconomicsTipModal
              tip={currentTip}
              onClose={() => setCurrentTip(null)}
            />
          )}

          {/* 4. End-of-Month Review Modal */}
          {showMonthlySummary && (
            <MonthlySummaryModal
              reports={lastMonthlyReport}
              gameState={gameState}
              onClose={() => setShowMonthlySummary(false)}
            />
          )}

          {/* 5. Business Stage Advancement Modal */}
          {stageUpgradedNotification && (
            <StageUpgradeModal
              fromStage={stageUpgradedNotification.from}
              toStage={stageUpgradedNotification.to}
              onClose={() => setStageUpgradedNotification(null)}
            />
          )}

          {/* 6. Game Over (Insolvency) Modal */}
          {gameState.isGameOver && (
            <GameOverModal
              gameState={gameState}
              onRestart={resetGame}
            />
          )}

          {/* 7. Victory Modal (Reached ₹10,00,000) */}
          {gameState.hasWon && !gameState.isEndlessMode && (
            <VictoryModal
              gameState={gameState}
              currentNetWorth={currentNetWorth}
              onContinueEndless={continueEndlessMode}
              onNewGame={resetGame}
            />
          )}
        </>
      )}
    </div>
  );
}
