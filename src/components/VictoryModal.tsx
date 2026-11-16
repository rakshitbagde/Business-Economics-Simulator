import React from 'react';
import { GameState } from '../types/game';
import { formatRupees, calculateGrade } from '../utils/format';
import { Trophy, Award, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  gameState: GameState;
  currentNetWorth: number;
  onContinueEndless: () => void;
  onNewGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameState,
  currentNetWorth,
  onContinueEndless,
  onNewGame,
}) => {
  const isDebtFree = gameState.activeLoans.length === 0;
  const grade = calculateGrade(gameState.day, currentNetWorth, gameState.customerSatisfaction, isDebtFree);

  // Score calculation: (Net Worth / 1000) * (Satisfaction / 100) * (100 / Days)
  const score = Math.round(
    (currentNetWorth / 1000) * (gameState.customerSatisfaction / 100) * (80 / Math.max(1, gameState.day))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-lg rounded-3xl border-2 border-emerald-500 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
        {/* Trophy icon */}
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mb-1">
          <Trophy className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            The ₹10 Lakh Goal Achieved!
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Enterprise Corporation Titan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Congratulations! You built <strong className="text-slate-800 dark:text-slate-200">{gameState.businessName}</strong> from a roadside stall into a commercial powerhouse!
          </p>
        </div>

        {/* Grade & Score Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-around">
          <div>
            <span className="text-xs text-slate-500 block">Tycoon Grade</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {grade}
            </span>
          </div>

          <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-700" />

          <div>
            <span className="text-xs text-slate-500 block">Performance Score</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {score} pts
            </span>
          </div>

          <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-700" />

          <div>
            <span className="text-xs text-slate-500 block">Days Taken</span>
            <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {gameState.day} Days
            </span>
          </div>
        </div>

        {/* Executive Summary Report */}
        <div className="grid grid-cols-2 gap-2 text-xs text-left">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Final Net Worth</span>
            <span className="font-mono font-bold text-emerald-600 text-sm">{formatRupees(currentNetWorth)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Customer Satisfaction</span>
            <span className="font-mono font-bold text-blue-600 text-sm">{gameState.customerSatisfaction}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Customers Served</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{gameState.totalCustomersServed}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Debt Status</span>
            <span className={`font-mono font-bold text-sm ${isDebtFree ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isDebtFree ? '100% Debt Free' : `${gameState.activeLoans.length} Loans Active`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={onContinueEndless}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Continue in Endless Sandbox</span>
          </button>

          <button
            onClick={onNewGame}
            className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
