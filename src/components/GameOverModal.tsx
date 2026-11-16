import React from 'react';
import { GameState } from '../types/game';
import { formatRupees } from '../utils/format';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  gameState: GameState;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ gameState, onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border-2 border-rose-500/60 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mb-1">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Insolvency Declared (Game Over)
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-rose-50/50 dark:bg-rose-950/20 p-3.5 rounded-2xl border border-rose-100 dark:border-rose-900/40">
          {gameState.gameOverReason ||
            'Your cash reserves were depleted past negative boundaries for multiple consecutive days. Outstanding creditor claims forced business liquidation.'}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono py-2">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] text-slate-400 block font-sans">Days Survived</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{gameState.day} Days</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] text-slate-400 block font-sans">Customers Served</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{gameState.totalCustomersServed}</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl text-left space-y-1">
          <span className="font-bold text-slate-700 dark:text-slate-200 block">💡 Economic Takeaway:</span>
          <p>
            Operating leverage is a double-edged sword. When daily sales dip below your break-even threshold, fixed costs (rent, wages, EMIs) quickly compound into irreversible cash deficits. Next run, build a larger savings buffer and adjust prices to stimulate demand!
          </p>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Business Venture</span>
        </button>
      </div>
    </div>
  );
};
