import React, { useState } from 'react';
import { GameState, BusinessStage, StaffRole, Upgrade, MarketingCampaign } from '../types/game';
import { STAGES_CONFIG, MARKETING_CAMPAIGNS } from '../data/gameData';
import { formatRupees } from '../utils/format';
import { Users, Sparkles, Megaphone, Check, Lock, Plus, Minus, ArrowUpRight } from 'lucide-react';

interface StaffUpgradesViewProps {
  gameState: GameState;
  currentStage: BusinessStage;
  onUpdateStaff: (roleId: StaffRole['id'], delta: number) => void;
  onBuyUpgrade: (upgradeId: string) => void;
  onSetMarketing: (campaignId: MarketingCampaign['id']) => void;
}

export const StaffUpgradesView: React.FC<StaffUpgradesViewProps> = ({
  gameState,
  currentStage,
  onUpdateStaff,
  onBuyUpgrade,
  onSetMarketing,
}) => {
  const [subTab, setSubTab] = useState<'staff' | 'upgrades' | 'marketing'>('staff');

  const stageInfo = STAGES_CONFIG[currentStage];
  const totalHiredStaff = gameState.staff.reduce((acc, s) => acc + s.count, 0);
  const totalSalaries = gameState.staff.reduce((acc, s) => acc + s.count * s.dailySalary, 0);

  const stageOrder: BusinessStage[] = ['stall', 'small_shop', 'store', 'chain', 'corporation'];
  const currentStageRank = stageOrder.indexOf(currentStage);

  return (
    <div className="space-y-4 pb-20">
      {/* Subtab Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          onClick={() => setSubTab('staff')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'staff'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Team ({totalHiredStaff}/{stageInfo.maxStaff})</span>
        </button>

        <button
          onClick={() => setSubTab('upgrades')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'upgrades'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Upgrades</span>
        </button>

        <button
          onClick={() => setSubTab('marketing')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'marketing'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Marketing</span>
        </button>
      </div>

      {/* SUBTAB 1: STAFF MANAGEMENT */}
      {subTab === 'staff' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Team Headcount & Payroll</h3>
                <p className="text-xs text-slate-500">
                  Staff increase productivity and customer satisfaction, but add fixed daily wages.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Daily Payroll</span>
                <span className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
                  {formatRupees(totalSalaries)}/day
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
              <span>Hired: {totalHiredStaff} of {stageInfo.maxStaff} allowed for {stageInfo.name}</span>
              {totalHiredStaff >= stageInfo.maxStaff && (
                <span className="text-amber-600 font-medium">Stage headcount limit reached!</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {gameState.staff.map((role) => {
              const canHireMore = totalHiredStaff < stageInfo.maxStaff && role.count < role.maxCount;

              return (
                <div
                  key={role.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
                        {role.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{role.name}</h4>
                          <span className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400">
                            {formatRupees(role.dailySalary)}/day
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                          ★ {role.productivityBonus}
                        </p>
                      </div>
                    </div>

                    {/* Hire / Fire Counter Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onUpdateStaff(role.id, -1)}
                        disabled={role.count === 0}
                        aria-label={`Fire 1 ${role.name}`}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-6 text-center font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        {role.count}
                      </span>

                      <button
                        onClick={() => onUpdateStaff(role.id, 1)}
                        disabled={!canHireMore}
                        aria-label={`Hire 1 ${role.name}`}
                        className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: FACILITY UPGRADES */}
      {subTab === 'upgrades' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Business Capital Investments</h3>
            <p className="text-xs text-slate-500">
              One-time capital expenditures that permanently boost efficiency, storage, or customer appeal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gameState.upgrades.map((upgrade) => {
              const upgradeStageRank = stageOrder.indexOf(upgrade.minStage);
              const isStageLocked = upgradeStageRank > currentStageRank;
              const canAfford = gameState.cash >= upgrade.cost;

              return (
                <div
                  key={upgrade.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    upgrade.purchased
                      ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : isStageLocked
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{upgrade.icon}</span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatRupees(upgrade.cost)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{upgrade.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{upgrade.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {upgrade.purchased ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-4 h-4" />
                        <span>Installed & Active</span>
                      </div>
                    ) : isStageLocked ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Requires {STAGES_CONFIG[upgrade.minStage].name}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onBuyUpgrade(upgrade.id)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 active:scale-95'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? `Purchase for ${formatRupees(upgrade.cost)}` : 'Insufficient Cash'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MARKETING CAMPAIGNS */}
      {subTab === 'marketing' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Customer Acquisition & Ads</h3>
            <p className="text-xs text-slate-500">
              Active campaigns drive extra footfall and reputation, but bill your account daily.
            </p>
          </div>

          <div className="space-y-3">
            {MARKETING_CAMPAIGNS.map((campaign) => {
              const isActive = gameState.marketingCampaign === campaign.id;

              return (
                <div
                  key={campaign.id}
                  onClick={() => onSetMarketing(campaign.id)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{campaign.name}</h4>
                        {isActive && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>
                          Footfall Boost: <strong className="text-emerald-600 font-mono">+{Math.round(campaign.footfallBoost * 100)}%</strong>
                        </span>
                        {campaign.reputationGainDaily > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Reputation: +{campaign.reputationGainDaily}/day</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 block">Daily Cost</span>
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                        {campaign.dailyCost === 0 ? 'Free' : `${formatRupees(campaign.dailyCost)}/day`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
