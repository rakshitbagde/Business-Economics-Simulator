import React, { useState } from 'react';
import { GameState, BusinessStage } from '../types/game';
import { STAGES_CONFIG } from '../data/gameData';
import { formatRupees, formatPercent, getSeasonInfo } from '../utils/format';
import { DemandCurveGraph } from '../components/DemandCurveGraph';
import { TrendingUp, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Sparkles, Package } from 'lucide-react';

interface ShopViewProps {
  gameState: GameState;
  currentStage: BusinessStage;
  currentNetWorth: number;
  onSetProductPrice: (productId: string, price: number) => void;
  onNavigateToMarket: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  gameState,
  currentStage,
  currentNetWorth,
  onSetProductPrice,
  onNavigateToMarket,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(gameState.inventory[0]?.id || '');
  const [expandedCurveId, setExpandedCurveId] = useState<string | null>(null);

  const stageInfo = STAGES_CONFIG[currentStage];
  const seasonInfo = getSeasonInfo(gameState.currentSeason);

  // Storage calculation
  const totalStock = gameState.inventory.reduce((acc, item) => acc + item.stock, 0);
  const bonusStorage = gameState.upgrades
    .filter((u) => u.purchased && u.effect.storageBonus)
    .reduce((acc, u) => acc + (u.effect.storageBonus || 0), 0);
  const maxStorage = stageInfo.baseStorage + bonusStorage;
  const storagePercent = Math.min(100, Math.round((totalStock / maxStorage) * 100));

  // Stage Progress calculation
  const stages: BusinessStage[] = ['stall', 'small_shop', 'store', 'chain', 'corporation'];
  const nextStageIndex = stages.indexOf(currentStage) + 1;
  const nextStage = nextStageIndex < stages.length ? stages[nextStageIndex] : null;
  const nextStageTarget = nextStage ? STAGES_CONFIG[nextStage].minNetWorth : 1000000;
  const prevStageTarget = STAGES_CONFIG[currentStage].minNetWorth;
  const stageProgress = Math.min(
    100,
    Math.max(0, Math.round(((currentNetWorth - prevStageTarget) / (nextStageTarget - prevStageTarget)) * 100))
  );

  const selectedProduct = gameState.inventory.find((p) => p.id === selectedProductId) || gameState.inventory[0];

  return (
    <div className="space-y-4 pb-20">
      {/* Enterprise Growth Stage Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">{stageInfo.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{stageInfo.name}</h2>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Tier {stages.indexOf(currentStage) + 1}/5
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stageInfo.perks}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400">Daily Rent</span>
            <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {formatRupees(stageInfo.rentPerDay)}/d
            </p>
          </div>
        </div>

        {/* Growth Bar to Next Stage */}
        <div className="space-y-1 mt-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              Progress to {nextStage ? STAGES_CONFIG[nextStage].name : 'Max Tier'}
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
              {formatRupees(currentNetWorth)} / {formatRupees(nextStageTarget)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>

        {/* Season & Storage strip */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{seasonInfo.icon}</span>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Current Season</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {seasonInfo.name}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
            <div className="flex items-center gap-1.5 min-w-0">
              <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 truncate">Storage</span>
            </div>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0">
              {totalStock} / {maxStorage}u
            </span>
          </div>
        </div>
      </div>

      {/* Product Pricing & Shelf Management */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Product Pricing & Shelves</h3>
          <p className="text-xs text-slate-500">Tune prices to optimize margin vs customer elasticity.</p>
        </div>
        <button
          onClick={onNavigateToMarket}
          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Restock in Market
        </button>
      </div>

      {/* Product Cards List */}
      <div className="space-y-3">
        {gameState.inventory.map((item) => {
          const suggestedMarketPrice = Math.round(item.baseWholesalePrice * 1.6);
          const profitPerUnit = item.sellingPrice - item.wholesalePrice;
          const marginPercent = Math.round((profitPerUnit / item.sellingPrice) * 100);
          const isPerishable = item.maxShelfLifeDays > 0;
          const isSelected = selectedProductId === item.id;
          const isCurveExpanded = expandedCurveId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                isSelected
                  ? 'border-emerald-500/60 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              } p-4`}
              onClick={() => setSelectedProductId(item.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs mt-1 text-slate-500 dark:text-slate-400">
                      <span>
                        Stock: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.stock}</span> units
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Wholesale: <span className="font-mono">{formatRupees(item.wholesalePrice)}</span>
                      </span>
                    </div>

                    {/* Freshness / Perishable badge */}
                    {isPerishable && (
                      <div className="flex items-center gap-1.5 text-[11px] mt-1.5 font-medium">
                        {item.daysRemainingFresh <= 1 ? (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Spoils in {item.daysRemainingFresh} day! Lower price to clear!
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Fresh for {item.daysRemainingFresh} days
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selling Price & Margin Badge */}
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400">Selling Price</span>
                  <div className="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatRupees(item.sellingPrice)}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                      marginPercent >= 35
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        : marginPercent >= 15
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {marginPercent}% Margin (+{formatRupees(profitPerUnit)})
                  </span>
                </div>
              </div>

              {/* Price Controls Row */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 mr-1">Quick Adjust:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetProductPrice(item.id, Math.max(1, item.sellingPrice - 5));
                    }}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    -₹5
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetProductPrice(item.id, item.sellingPrice + 5);
                    }}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    +₹5
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetProductPrice(item.id, suggestedMarketPrice);
                    }}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Match Market ({formatRupees(suggestedMarketPrice)})
                  </button>
                </div>

                {/* Toggle Demand Curve Drawer */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCurveId(isCurveExpanded ? null : item.id);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Demand Curve</span>
                  {isCurveExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable Demand Elasticity Curve */}
              {isCurveExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <DemandCurveGraph
                    basePrice={item.baseWholesalePrice}
                    currentPrice={item.sellingPrice}
                    elasticity={item.elasticity}
                    marketFootfall={stageInfo.footfallMultiplier * 35}
                    interactive={true}
                    onPriceChange={(newPrice) => onSetProductPrice(item.id, newPrice)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
