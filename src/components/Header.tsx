import React, { useState } from 'react';
import { Play, Pause, FastForward, Volume2, VolumeX, Sun, Moon, HelpCircle, RotateCcw } from 'lucide-react';
import { GameState, BusinessStage } from '../types/game';
import { STAGES_CONFIG } from '../data/gameData';
import { formatRupees, getSeasonInfo } from '../utils/format';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  gameState: GameState;
  currentStage: BusinessStage;
  currentNetWorth: number;
  isPlaying: boolean;
  gameSpeed: number;
  isDarkMode: boolean;
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  onAdvanceDay: () => void;
  onToggleDarkMode: () => void;
  onOpenTutorial: () => void;
  onConfirmReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  currentStage,
  currentNetWorth,
  isPlaying,
  gameSpeed,
  isDarkMode,
  onTogglePlay,
  onSetSpeed,
  onAdvanceDay,
  onToggleDarkMode,
  onOpenTutorial,
  onConfirmReset,
}) => {
  const [muted, setMuted] = useState(soundFx.getMuted());
  const stageInfo = STAGES_CONFIG[currentStage];
  const seasonInfo = getSeasonInfo(gameState.currentSeason);

  const handleToggleSound = () => {
    const isNowMuted = soundFx.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      soundFx.playCoin();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Bar Zone: Brand & Controls */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl sm:text-2xl select-none" role="img" aria-label="tycoon">
            {stageInfo.icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                {gameState.businessName}
              </h1>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-medium hidden sm:inline">
                · {stageInfo.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-amber-600 dark:text-amber-400">Day {gameState.day}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">
                {seasonInfo.icon} {seasonInfo.name}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Time Controls: Play/Pause and Speeds */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause simulation' : 'Auto-run simulation'}
              aria-label={isPlaying ? 'Pause simulation' : 'Auto-run simulation'}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                isPlaying
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                const nextSpeed = gameSpeed === 1 ? 2 : gameSpeed === 2 ? 4 : 1;
                onSetSpeed(nextSpeed);
              }}
              title="Simulation speed (1x, 2x, 4x)"
              aria-label="Simulation speed"
              className="px-1.5 py-1 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {gameSpeed}x
            </button>
          </div>

          {/* Manual Next Day Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onAdvanceDay();
            }}
            disabled={isPlaying}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Next Day</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle theme"
            title="Toggle Light / Dark mode"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Tutorial / Help */}
          <button
            onClick={onOpenTutorial}
            aria-label="How to play guide"
            title="How to Play Tutorial"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Reset / New Game */}
          <button
            onClick={onConfirmReset}
            aria-label="Reset game"
            title="Start New Business"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial Bar (Sticky Mobile HUD) */}
      <div className="bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs overflow-x-auto gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Cash:</span>
            <span
              className={`font-mono font-bold ${
                gameState.cash < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {formatRupees(gameState.cash)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Net Worth:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatRupees(currentNetWorth)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              / ₹10L Goal
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Reputation:</span>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
              {gameState.reputation}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Satisfaction:</span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {gameState.customerSatisfaction}%
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
