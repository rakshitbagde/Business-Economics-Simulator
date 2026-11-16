import React from 'react';
import { DailyReport, GameState } from '../types/game';
import { formatRupees } from '../utils/format';
import { Calendar, TrendingUp, CheckCircle, Award, ArrowRight } from 'lucide-react';

interface MonthlySummaryModalProps {
  reports: DailyReport[];
  gameState: GameState;
  onClose: () => void;
}

export const MonthlySummaryModal: React.FC<MonthlySummaryModalProps> = ({
  reports,
  gameState,
  onClose,
}) => {
  const monthNum = Math.floor(gameState.day / 30);
  const totalRev = reports.reduce((acc, r) => acc + r.revenue, 0);
  const totalProfit = reports.reduce((acc, r) => acc + r.netProfit, 0);
  const totalCustomers = reports.reduce((acc, r) => acc + r.customersServed, 0);
  const totalSpoilage = reports.reduce((acc, r) => acc + r.spoilageLoss, 0);

  // Dynamic lessons based on player's actual gameplay this month
  const lessons: { title: string; takeaway: string }[] = [];

  if (totalProfit > 0) {
    lessons.push({
      title: 'Operating Profitability & Cash Flow',
      takeaway: `Your business generated ${formatRupees(totalProfit)} in positive net profit this month. Consistently staying above the break-even volume creates the cash reserves necessary for capital upgrades.`,
    });
  } else {
    lessons.push({
      title: 'Fixed Cost Overhead & Operating Losses',
      takeaway: `Your expenses exceeded gross profits this month. Review your daily fixed costs (rent, wages) and adjust product prices or run marketing to boost unit sales volume past break-even.`,
    });
  }

  if (totalSpoilage > 1000) {
    lessons.push({
      title: 'Inventory Holding Costs & Spoilage Write-Offs',
      takeaway: `You lost ${formatRupees(totalSpoilage)} to expired perishables. Perishable items carry a holding penalty—align procurement closer to daily sales volume or install a commercial freezer!`,
    });
  } else {
    lessons.push({
      title: 'Supply Chain Discipline',
      takeaway: 'Excellent inventory rotation! Keeping stock lean and matching order quantities to demand minimized waste and protected working capital.',
    });
  }

  if (gameState.activeLoans.length > 0) {
    lessons.push({
      title: 'Financial Leverage & Debt Obligations',
      takeaway: 'Servicing active bank loans required daily EMI outflows. Debt can accelerate store growth, but requires disciplined daily cash buffers.',
    });
  } else {
    lessons.push({
      title: 'Debt-Free Organic Compounding',
      takeaway: 'Operating without debt eliminates mandatory EMI stress, allowing all retained earnings to reinvest into inventory and upgrades.',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <Calendar className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              30-Day Milestone Completed
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Month {monthNum} Tycoon Review
            </h3>
          </div>
        </div>

        {/* 4 Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">30-Day Revenue</span>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
              {formatRupees(totalRev)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Net Profit</span>
            <span className={`text-xs font-mono font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatRupees(totalProfit)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Patrons Served</span>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {totalCustomers}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Spoilage Loss</span>
            <span className="text-xs font-mono font-bold text-amber-600">
              {formatRupees(totalSpoilage)}
            </span>
          </div>
        </div>

        {/* Economic Lessons Section */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            What You Learned This Month:
          </h4>

          <div className="space-y-2">
            {lessons.map((lesson, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-xs space-y-0.5"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{lesson.title}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed">{lesson.takeaway}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Continue into Month {monthNum + 1}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
