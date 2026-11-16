import React from 'react';
import { BusinessStage } from '../types/game';
import { STAGES_CONFIG } from '../data/gameData';
import { formatRupees } from '../utils/format';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface StageUpgradeModalProps {
  fromStage: BusinessStage;
  toStage: BusinessStage;
  onClose: () => void;
}

export const StageUpgradeModal: React.FC<StageUpgradeModalProps> = ({
  fromStage,
  toStage,
  onClose,
}) => {
  const toInfo = STAGES_CONFIG[toStage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border-2 border-emerald-500 bg-white dark:bg-slate-900 p-6 shadow-2xl text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-4xl mb-1">
          {toInfo.icon}
        </div>

        <div>
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Business Stage Unlocked!
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            {toInfo.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Your enterprise has expanded to a whole new scale of operations!
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-left text-xs space-y-2 border border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-slate-100">Unlocked Advantages:</h4>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Base Customer Traffic: <strong>{toInfo.footfallMultiplier}x</strong> Footfall</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Warehouse Capacity: <strong>{toInfo.baseStorage}</strong> storage units</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Team Allowance: Hire up to <strong>{toInfo.maxStaff}</strong> staff members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Daily Rent: <strong>{formatRupees(toInfo.rentPerDay)}/day</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Claim Expansion</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
