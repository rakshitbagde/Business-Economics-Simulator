import React from 'react';
import { EconomicsTip } from '../types/game';
import { GraduationCap, Lightbulb, X, ArrowRight } from 'lucide-react';

interface EconomicsTipModalProps {
  tip: EconomicsTip;
  onClose: () => void;
}

export const EconomicsTipModal: React.FC<EconomicsTipModalProps> = ({ tip, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150">
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
              {tip.icon}
            </span>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                Economics in Action · {tip.concept}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {tip.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Card */}
        <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs font-medium text-emerald-900 dark:text-emerald-200">
          💡 {tip.summary}
        </div>

        {/* Plain Language Explanation */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>{tip.explanation}</p>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <p>
              <strong className="text-slate-700 dark:text-slate-200">Practical Example:</strong> {tip.example}
            </p>
            <p>
              <strong className="text-emerald-600 dark:text-emerald-400">Tycoon Application:</strong> {tip.gameplayApplication}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Understood! Back to Business</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
