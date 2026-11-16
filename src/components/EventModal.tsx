import React from 'react';
import { RandomEvent, EventChoice } from '../types/game';
import { formatRupees } from '../utils/format';
import { AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

interface EventModalProps {
  event: RandomEvent;
  onResolve: (choice: EventChoice) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onResolve }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border-2 border-amber-500/60 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-3xl p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 shrink-0">
            {event.icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {event.tag}
              </span>
              <span className="text-[10px] text-slate-400">· {event.economicConcept}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl leading-relaxed">
          {event.description}
        </p>

        {/* Choices */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Select Your Management Decision:
          </span>
          {event.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => onResolve(choice)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-all group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {choice.text}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              {/* Consequence hints */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1.5">
                {choice.cashDelta !== undefined && (
                  <span className={choice.cashDelta >= 0 ? 'text-emerald-600 font-mono font-semibold' : 'text-rose-600 font-mono font-semibold'}>
                    {choice.cashDelta >= 0 ? `+${formatRupees(choice.cashDelta)}` : formatRupees(choice.cashDelta)}
                  </span>
                )}
                {choice.reputationDelta !== undefined && (
                  <span className={choice.reputationDelta >= 0 ? 'text-blue-600 font-semibold' : 'text-rose-600 font-semibold'}>
                    {choice.reputationDelta >= 0 ? `+${choice.reputationDelta}% Rep` : `${choice.reputationDelta}% Rep`}
                  </span>
                )}
                {choice.demandModifierDays && (
                  <span className="text-emerald-600 font-medium">
                    {Math.round((choice.demandModifierDays.factor - 1) * 100)}% Demand for {choice.demandModifierDays.days}d
                  </span>
                )}
                {choice.spoilageRiskPercent && (
                  <span className="text-rose-600 font-medium">
                    Risk {choice.spoilageRiskPercent}% Perishable Spoilage
                  </span>
                )}
                <span className="text-slate-400">· {choice.economicConcept}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
