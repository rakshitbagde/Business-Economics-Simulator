import React, { useState } from 'react';
import { GameState, BusinessStage, LoanOffer } from '../types/game';
import { LOAN_OFFERS } from '../data/gameData';
import { formatRupees } from '../utils/format';
import { NetWorthLineChart, RevenueExpensesBarChart } from '../components/Charts';
import { Wallet, PiggyBank, Landmark, TrendingUp, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface FinanceViewProps {
  gameState: GameState;
  currentStage: BusinessStage;
  currentNetWorth: number;
  onTakeLoan: (offer: LoanOffer) => void;
  onDepositSavings: (amount: number) => void;
  onWithdrawSavings: (amount: number) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  gameState,
  currentStage,
  currentNetWorth,
  onTakeLoan,
  onDepositSavings,
  onWithdrawSavings,
}) => {
  const [savingsAmount, setSavingsAmount] = useState<number>(5000);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'all'>('daily');

  const latestReport = gameState.dailyReports[gameState.dailyReports.length - 1];

  // Aggregated reports calculation
  const reportsSlice =
    reportPeriod === 'daily'
      ? gameState.dailyReports.slice(-1)
      : reportPeriod === 'weekly'
      ? gameState.dailyReports.slice(-7)
      : gameState.dailyReports;

  const aggRevenue = reportsSlice.reduce((acc, r) => acc + r.revenue, 0);
  const aggCOGS = reportsSlice.reduce((acc, r) => acc + r.cogs, 0);
  const aggRent = reportsSlice.reduce((acc, r) => acc + r.rent, 0);
  const aggSalaries = reportsSlice.reduce((acc, r) => acc + r.salaries, 0);
  const aggElectricity = reportsSlice.reduce((acc, r) => acc + r.electricity, 0);
  const aggMarketing = reportsSlice.reduce((acc, r) => acc + r.marketing, 0);
  const aggLoanEmi = reportsSlice.reduce((acc, r) => acc + r.loanEmi, 0);
  const aggTaxes = reportsSlice.reduce((acc, r) => acc + r.taxes, 0);
  const aggSpoilage = reportsSlice.reduce((acc, r) => acc + r.spoilageLoss, 0);

  const aggTotalExpenses = aggRent + aggSalaries + aggElectricity + aggMarketing + aggLoanEmi + aggTaxes;
  const aggNetProfit = aggRevenue - aggCOGS - aggTotalExpenses - aggSpoilage;

  return (
    <div className="space-y-4 pb-20">
      {/* Financial Health Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] text-slate-400 block font-medium">Liquid Cash</span>
          <span
            className={`text-lg font-mono font-extrabold ${
              gameState.cash < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {formatRupees(gameState.cash)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Operating Reserve</span>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] text-slate-400 block font-medium">Bank Savings</span>
          <span className="text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400">
            {formatRupees(gameState.savings)}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">+4.0% p.a. yield</span>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] text-slate-400 block font-medium">Total Net Worth</span>
          <span className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatRupees(currentNetWorth)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Assets - Liabilities</span>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] text-slate-400 block font-medium">Active Debt</span>
          <span className="text-lg font-mono font-extrabold text-amber-600 dark:text-amber-400">
            {formatRupees(gameState.activeLoans.reduce((acc, l) => acc + l.remainingBalance, 0))}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {gameState.activeLoans.length} Loans Active
          </span>
        </div>
      </div>

      {/* Insolvency Warning if cash is dangerously negative */}
      {gameState.cash < 0 && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900 dark:text-rose-100">Insolvency Hazard Warning</h4>
            <p className="mt-0.5">
              Your business has negative cash ({formatRupees(gameState.cash)}). If liquid cash stays below -₹10,000 for 3 consecutive days, the commercial court will force liquidation and game over. Take a loan or withdraw savings immediately!
            </p>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Net Worth & Cash Trajectory</h3>
          <p className="text-xs text-slate-500">Historical trend across the last 30 business days.</p>
        </div>
        <NetWorthLineChart data={gameState.dailyReports} />

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Revenue vs. Expenses</h3>
          <p className="text-xs text-slate-500 mb-3">Daily side-by-side comparison across recent operations.</p>
          <RevenueExpensesBarChart data={gameState.dailyReports} />
        </div>
      </div>

      {/* Profit & Loss Statement */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Profit & Loss Statement</h3>
            <p className="text-xs text-slate-500">Breakdown of earnings, fixed expenses, and margins.</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setReportPeriod('daily')}
              className={`px-2 py-1 rounded-md font-medium cursor-pointer ${
                reportPeriod === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setReportPeriod('weekly')}
              className={`px-2 py-1 rounded-md font-medium cursor-pointer ${
                reportPeriod === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setReportPeriod('all')}
              className={`px-2 py-1 rounded-md font-medium cursor-pointer ${
                reportPeriod === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-2 flex justify-between font-semibold text-slate-900 dark:text-slate-100">
            <span>Gross Sales Revenue</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">+{formatRupees(aggRevenue)}</span>
          </div>

          <div className="py-1.5 flex justify-between text-slate-500 pl-3">
            <span>Cost of Goods Sold (COGS)</span>
            <span className="font-mono">-{formatRupees(aggCOGS)}</span>
          </div>

          <div className="py-1.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
            <span>Gross Operating Margin</span>
            <span className="font-mono">{formatRupees(aggRevenue - aggCOGS)}</span>
          </div>

          <div className="py-2 space-y-1 pl-3 text-slate-500">
            <div className="flex justify-between">
              <span>Premises Rent</span>
              <span className="font-mono">-{formatRupees(aggRent)}</span>
            </div>
            <div className="flex justify-between">
              <span>Employee Wages</span>
              <span className="font-mono">-{formatRupees(aggSalaries)}</span>
            </div>
            <div className="flex justify-between">
              <span>Electricity & Utilities</span>
              <span className="font-mono">-{formatRupees(aggElectricity)}</span>
            </div>
            <div className="flex justify-between">
              <span>Marketing Campaigns</span>
              <span className="font-mono">-{formatRupees(aggMarketing)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bank Loan EMIs</span>
              <span className="font-mono">-{formatRupees(aggLoanEmi)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (GST & Municipal)</span>
              <span className="font-mono">-{formatRupees(aggTaxes)}</span>
            </div>
            {aggSpoilage > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>Perishable Spoilage Loss</span>
                <span className="font-mono">-{formatRupees(aggSpoilage)}</span>
              </div>
            )}
          </div>

          <div className="pt-2.5 flex justify-between text-sm font-bold">
            <span className="text-slate-900 dark:text-slate-100">Net Bottom-Line Profit</span>
            <span
              className={`font-mono ${
                aggNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {aggNetProfit >= 0 ? `+${formatRupees(aggNetProfit)}` : formatRupees(aggNetProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* High-Yield Bank Savings */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <PiggyBank className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">High-Yield Business Savings</h3>
            <p className="text-xs text-slate-500">
              Earn 4.0% annualized risk-free interest on idle capital. Withdraw anytime.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Current Savings Balance</span>
            <span className="text-base font-mono font-bold text-blue-600 dark:text-blue-400">
              {formatRupees(gameState.savings)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Accrues Daily</span>
            <span className="font-mono text-emerald-600 font-semibold">~₹{Math.max(1, Math.round(gameState.savings * 0.00011))}/day</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="500"
            step="1000"
            value={savingsAmount}
            onChange={(e) => setSavingsAmount(Math.max(0, Number(e.target.value)))}
            className="w-32 px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          />

          <button
            onClick={() => onDepositSavings(savingsAmount)}
            disabled={gameState.cash < savingsAmount || savingsAmount <= 0}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            Deposit Cash
          </button>

          <button
            onClick={() => onWithdrawSavings(savingsAmount)}
            disabled={gameState.savings < savingsAmount || savingsAmount <= 0}
            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            Withdraw Cash
          </button>
        </div>
      </div>

      {/* Commercial Bank Loans */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
            <Landmark className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Commercial Credit & Bank Loans</h3>
            <p className="text-xs text-slate-500">
              Inject growth capital to fund bulk stock or store expansion. Repaid in daily EMIs.
            </p>
          </div>
        </div>

        {/* Active Loans */}
        {gameState.activeLoans.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Credit Facilities</span>
            {gameState.activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{loan.name}</h4>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                    <span>Daily EMI: <strong className="font-mono text-rose-600">{formatRupees(loan.dailyEmi)}/d</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>{loan.remainingDays} days remaining</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Remaining Balance</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatRupees(loan.remainingBalance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loan Offers */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Available Loan Offers</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {LOAN_OFFERS.map((offer) => {
              const isEligible = currentNetWorth >= offer.minNetWorth;
              const hasThisLoan = gameState.activeLoans.some((l) => l.name === offer.name);

              return (
                <div
                  key={offer.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    hasThisLoan
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70'
                      : isEligible
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{offer.name}</h4>
                    <span className="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block mt-1">
                      {formatRupees(offer.principal)}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">{offer.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-2 space-y-0.5">
                      <div>Rate: {offer.annualInterestRate}% p.a.</div>
                      <div>Tenure: {offer.durationDays} Days</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {hasThisLoan ? (
                      <span className="text-[11px] text-amber-600 font-semibold block text-center">Active Loan</span>
                    ) : isEligible ? (
                      <button
                        onClick={() => onTakeLoan(offer)}
                        className="w-full py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Accept Loan
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 block text-center">
                        Requires {formatRupees(offer.minNetWorth)} Net Worth
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
