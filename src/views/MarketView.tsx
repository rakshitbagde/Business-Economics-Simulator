import React, { useState } from 'react';
import { GameState, BusinessStage } from '../types/game';
import { STAGES_CONFIG } from '../data/gameData';
import { formatRupees } from '../utils/format';
import { ShoppingCart, Package, Info, CheckCircle2, TrendingDown, ArrowUpRight } from 'lucide-react';

interface MarketViewProps {
  gameState: GameState;
  currentStage: BusinessStage;
  onBuyStock: (productId: string, quantity: number, totalCost: number) => void;
  onNavigateToStaff: () => void;
}

export const MarketView: React.FC<MarketViewProps> = ({
  gameState,
  currentStage,
  onBuyStock,
  onNavigateToStaff,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(gameState.inventory[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(20);

  const stageInfo = STAGES_CONFIG[currentStage];
  const totalStock = gameState.inventory.reduce((acc, item) => acc + item.stock, 0);
  const bonusStorage = gameState.upgrades
    .filter((u) => u.purchased && u.effect.storageBonus)
    .reduce((acc, u) => acc + (u.effect.storageBonus || 0), 0);
  const maxStorage = stageInfo.baseStorage + bonusStorage;
  const remainingStorage = Math.max(0, maxStorage - totalStock);

  const selectedProduct = gameState.inventory.find((p) => p.id === selectedProductId) || gameState.inventory[0];

  // Bulk Discount calculation
  // 1-19: 0%, 20-49: 5%, 50-99: 10%, 100+: 15%
  const getDiscountPercent = (qty: number): number => {
    if (qty >= 100) return 15;
    if (qty >= 50) return 10;
    if (qty >= 20) return 5;
    return 0;
  };

  const discountPercent = getDiscountPercent(quantity);
  const unitWholesale = selectedProduct ? selectedProduct.wholesalePrice : 0;
  const discountedUnitCost = Math.round(unitWholesale * (1 - discountPercent / 100));
  const totalCost = discountedUnitCost * quantity;
  const savings = Math.round(unitWholesale * quantity - totalCost);

  const canAfford = gameState.cash >= totalCost;
  const canFit = quantity <= remainingStorage;

  // Max affordable within storage
  const maxPossible = Math.min(
    remainingStorage,
    discountedUnitCost > 0 ? Math.floor(gameState.cash / discountedUnitCost) : 0
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Storage and Cash Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Package className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Wholesale Supplier Market</h2>
              <p className="text-xs text-slate-500">Procure inventory in bulk to unlock supplier discounts.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Remaining Space</span>
              <span className={`font-bold ${remainingStorage === 0 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                {remainingStorage} units
              </span>
            </div>
            <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cash Available</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatRupees(gameState.cash)}
              </span>
            </div>
          </div>
        </div>

        {/* Storage full alert */}
        {remainingStorage < 15 && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs flex items-center justify-between gap-2">
            <span className="text-amber-800 dark:text-amber-200 flex items-center gap-1.5 font-medium">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              Warehouse space running tight ({totalStock}/{maxStorage}u used).
            </span>
            <button
              onClick={onNavigateToStaff}
              className="text-amber-700 dark:text-amber-300 font-semibold underline shrink-0 hover:text-amber-900"
            >
              Upgrade Shelves →
            </button>
          </div>
        )}
      </div>

      {/* Bulk Discount Tiers Explainer */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Volume Discount Tiers (Economies of Scale)
          </h3>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active Today</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className={`p-2 rounded-xl border ${quantity < 20 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold' : 'border-slate-100 dark:border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 block">1 - 19 units</span>
            <span className="text-slate-700 dark:text-slate-300">Base Price</span>
          </div>
          <div className={`p-2 rounded-xl border ${quantity >= 20 && quantity < 50 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold' : 'border-slate-100 dark:border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 block">20 - 49 units</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">5% OFF</span>
          </div>
          <div className={`p-2 rounded-xl border ${quantity >= 50 && quantity < 100 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold' : 'border-slate-100 dark:border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 block">50 - 99 units</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">10% OFF</span>
          </div>
          <div className={`p-2 rounded-xl border ${quantity >= 100 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold' : 'border-slate-100 dark:border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 block">100+ units</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">15% OFF</span>
          </div>
        </div>
      </div>

      {/* Select Product to Procure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {gameState.inventory.map((item) => {
          const isSelected = selectedProductId === item.id;
          const wholesaleShift = Math.round(((item.wholesalePrice - item.baseWholesalePrice) / item.baseWholesalePrice) * 100);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedProductId(item.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800">{item.icon}</span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                    <span className="text-xs text-slate-400">Current Stock: {item.stock} units</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block">Wholesale</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatRupees(item.wholesalePrice)}
                  </span>
                  {wholesaleShift !== 0 && (
                    <span className={`text-[10px] font-mono block ${wholesaleShift < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {wholesaleShift < 0 ? `${wholesaleShift}%` : `+${wholesaleShift}%`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Order Builder Box */}
      {selectedProduct && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs text-slate-400">Selected Product</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{selectedProduct.icon}</span> {selectedProduct.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Unit Cost After Discount</span>
              <p className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatRupees(discountedUnitCost)}
                {discountPercent > 0 && (
                  <span className="text-xs line-through text-slate-400 ml-1">
                    {formatRupees(unitWholesale)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span>Order Quantity: <strong className="font-mono text-sm text-slate-900 dark:text-slate-100">{quantity}</strong> units</span>
              <span>Available Space: {remainingStorage} units</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 20, 50, 100].map((qty) => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    quantity === qty
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-2 pt-1 text-xs">
              <button
                onClick={() => setQuantity(Math.max(1, maxPossible))}
                disabled={maxPossible <= 0}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs disabled:opacity-40"
              >
                Fit Max Possible ({maxPossible} units)
              </button>
              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={remainingStorage}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-14 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 py-0.5"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Cost Summary Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Gross Wholesale Subtotal</span>
              <span className="font-mono">{formatRupees(unitWholesale * quantity)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Bulk Tier Discount ({discountPercent}%)</span>
                <span className="font-mono">-{formatRupees(savings)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-1.5 border-t border-slate-200 dark:border-slate-700">
              <span>Total Procurement Cost</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatRupees(totalCost)}</span>
            </div>
          </div>

          {/* Order Action Button */}
          <button
            onClick={() => onBuyStock(selectedProduct.id, quantity, totalCost)}
            disabled={!canAfford || !canFit || quantity <= 0}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              !canAfford
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : !canFit
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {!canAfford
              ? `Insufficient Cash (Need ${formatRupees(totalCost - gameState.cash)} more)`
              : !canFit
              ? `Exceeds Storage Space (Only ${remainingStorage}u left)`
              : `Confirm Purchase of ${quantity} units for ${formatRupees(totalCost)}`}
          </button>
        </div>
      )}
    </div>
  );
};
