import React from 'react';
import { formatRupees } from '../utils/format';

interface DemandCurveProps {
  basePrice: number;
  currentPrice: number;
  elasticity: number;
  marketFootfall?: number;
  interactive?: boolean;
  onPriceChange?: (newPrice: number) => void;
  height?: number;
}

export const DemandCurveGraph: React.FC<DemandCurveProps> = ({
  basePrice,
  currentPrice,
  elasticity,
  marketFootfall = 50,
  interactive = false,
  onPriceChange,
  height = 190,
}) => {
  const width = 420;
  const padding = { top: 24, right: 20, bottom: 32, left: 45 };

  const marketPrice = Math.round(basePrice * 1.6);
  const minPrice = Math.max(1, Math.round(basePrice * 0.8));
  const maxPrice = Math.round(basePrice * 3.0);

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate 25 sample points along the curve
  const points: { price: number; demand: number; revenue: number }[] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const p = minPrice + (i / steps) * (maxPrice - minPrice);
    const priceRatio = p / marketPrice;
    const elasticityFactor = Math.pow(1 / Math.max(0.2, priceRatio), elasticity);
    const q = Math.max(1, Math.round(marketFootfall * 0.5 * elasticityFactor));
    points.push({ price: p, demand: q, revenue: p * q });
  }

  const maxDemand = Math.max(...points.map((pt) => pt.demand), 10);
  const currentPriceRatio = currentPrice / marketPrice;
  const currentElasticityFactor = Math.pow(1 / Math.max(0.2, currentPriceRatio), elasticity);
  const currentDemand = Math.max(1, Math.round(marketFootfall * 0.5 * currentElasticityFactor));
  const currentRevenue = currentPrice * currentDemand;

  // Find optimal price for max revenue
  const bestPoint = points.reduce((best, cur) => (cur.revenue > best.revenue ? cur : best), points[0]);

  const getX = (price: number) => padding.left + ((price - minPrice) / (maxPrice - minPrice)) * chartWidth;
  const getY = (demand: number) => padding.top + chartHeight - (demand / maxDemand) * chartHeight;

  const curvePoints = points.map((pt) => `${getX(pt.price)},${getY(pt.demand)}`).join(' L ');
  const curvePath = `M ${curvePoints}`;

  const currentX = getX(currentPrice);
  const currentY = getY(currentDemand);

  return (
    <div className="w-full">
      {/* Header telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-600 dark:text-slate-400">
            Current Price: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{formatRupees(currentPrice)}</span>
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            Est. Daily Sales: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{currentDemand} units</span>
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Est. Rev: <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{formatRupees(currentRevenue)}</span>
        </div>
      </div>

      <div className="relative w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2 select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
          />

          {/* Y Axis labels */}
          <text
            x={padding.left - 6}
            y={padding.top + 4}
            className="text-[9px] fill-slate-400 font-mono text-right"
            textAnchor="end"
          >
            {maxDemand}u
          </text>
          <text
            x={padding.left - 6}
            y={padding.top + chartHeight + 3}
            className="text-[9px] fill-slate-400 font-mono text-right"
            textAnchor="end"
          >
            0u
          </text>

          {/* X Axis labels */}
          <text
            x={padding.left}
            y={height - 8}
            className="text-[9px] fill-slate-400 font-mono"
            textAnchor="start"
          >
            {formatRupees(minPrice)}
          </text>
          <text
            x={width - padding.right}
            y={height - 8}
            className="text-[9px] fill-slate-400 font-mono text-right"
            textAnchor="end"
          >
            {formatRupees(maxPrice)}
          </text>

          {/* Optimal price guide line */}
          <line
            x1={getX(bestPoint.price)}
            y1={padding.top}
            x2={getX(bestPoint.price)}
            y2={padding.top + chartHeight}
            stroke="#10B981"
            strokeDasharray="3 3"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <text
            x={getX(bestPoint.price)}
            y={padding.top - 6}
            className="text-[9px] fill-emerald-600 dark:fill-emerald-400 font-medium font-mono"
            textAnchor="middle"
          >
            Max Rev ({formatRupees(bestPoint.price)})
          </text>

          {/* Demand curve line */}
          <path d={curvePath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

          {/* Current Position Crosshairs */}
          <line
            x1={padding.left}
            y1={currentY}
            x2={currentX}
            y2={currentY}
            stroke="#F59E0B"
            strokeDasharray="2 2"
            strokeWidth="1.2"
          />
          <line
            x1={currentX}
            y1={currentY}
            x2={currentX}
            y2={padding.top + chartHeight}
            stroke="#F59E0B"
            strokeDasharray="2 2"
            strokeWidth="1.2"
          />

          {/* Current Position Point */}
          <circle cx={currentX} cy={currentY} r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
        </svg>

        {interactive && onPriceChange && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Adjust Price Slider</span>
              <button
                onClick={() => onPriceChange(bestPoint.price)}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Set to Optimal ({formatRupees(bestPoint.price)})
              </button>
            </div>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={currentPrice}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
        <span>Elasticity: {elasticity > 1 ? 'High (Elastic - price sensitive)' : 'Low (Inelastic - essential)'}</span>
        <span>Law of Demand: Price ↑ Volume ↓</span>
      </div>
    </div>
  );
};
