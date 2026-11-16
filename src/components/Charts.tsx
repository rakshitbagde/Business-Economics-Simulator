import React, { useState } from 'react';
import { DailyReport } from '../types/game';
import { formatRupees } from '../utils/format';

interface LineChartProps {
  data: DailyReport[];
  height?: number;
}

export const NetWorthLineChart: React.FC<LineChartProps> = ({ data, height = 180 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        No financial history recorded yet. Advance a day to begin charting.
      </div>
    );
  }

  // Use last 30 days
  const slice = data.slice(-30);
  const padding = { top: 20, right: 16, bottom: 28, left: 45 };
  const width = 480;

  const netWorths = slice.map((d) => d.netWorthEnd);
  const cashes = slice.map((d) => d.cashEnd);
  const maxVal = Math.max(...netWorths, ...cashes, 10000);
  const minVal = Math.min(...netWorths, ...cashes, 0);
  const range = maxVal - minVal || 1;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (idx: number) => padding.left + (idx / Math.max(1, slice.length - 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minVal) / range) * chartHeight;

  // Generate SVG path for Net Worth
  const netWorthPoints = slice.map((d, i) => `${getX(i)},${getY(d.netWorthEnd)}`).join(' L ');
  const netWorthPath = `M ${netWorthPoints}`;
  const netWorthArea = `M ${getX(0)},${getY(0)} L ${netWorthPoints} L ${getX(slice.length - 1)},${getY(0)} Z`;

  // Generate SVG path for Cash
  const cashPoints = slice.map((d, i) => `${getX(i)},${getY(d.cashEnd)}`).join(' L ');
  const cashPath = `M ${cashPoints}`;

  const hoveredData = hoverIndex !== null ? slice[hoverIndex] : slice[slice.length - 1];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            Net Worth: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupees(hoveredData?.netWorthEnd ?? 0)}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
            Cash: <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{formatRupees(hoveredData?.cashEnd ?? 0)}</span>
          </span>
        </div>
        <span className="text-slate-400">Day {hoveredData?.day ?? 1}</span>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={getY(maxVal)}
            x2={width - padding.right}
            y2={getY(maxVal)}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={getY((maxVal + minVal) / 2)}
            x2={width - padding.right}
            y2={getY((maxVal + minVal) / 2)}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={getY(0)}
            x2={width - padding.right}
            y2={getY(0)}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
          />

          {/* Y Axis text */}
          <text
            x={padding.left - 6}
            y={getY(maxVal) + 4}
            className="text-[9px] fill-slate-400 font-mono text-right"
            textAnchor="end"
          >
            {formatRupees(maxVal, true)}
          </text>
          <text
            x={padding.left - 6}
            y={getY(0) + 3}
            className="text-[9px] fill-slate-400 font-mono text-right"
            textAnchor="end"
          >
            ₹0
          </text>

          {/* Area under Net worth */}
          <path d={netWorthArea} fill="url(#netWorthGrad)" />

          {/* Net worth line */}
          <path d={netWorthPath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

          {/* Cash line */}
          <path d={cashPath} fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 3" />

          {/* Data point indicators */}
          {slice.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.netWorthEnd)}
              r={hoverIndex === i ? 5 : 2}
              fill="#10B981"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onTouchStart={() => setHoverIndex(i)}
            />
          ))}

          {/* Transparent touch targets across X columns */}
          {slice.map((_, i) => {
            const colWidth = chartWidth / slice.length;
            return (
              <rect
                key={i}
                x={getX(i) - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onTouchStart={() => setHoverIndex(i)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export const RevenueExpensesBarChart: React.FC<LineChartProps> = ({ data, height = 180 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        No daily revenue recorded yet. Advance a day to begin charting.
      </div>
    );
  }

  const slice = data.slice(-14); // last 14 days
  const padding = { top: 20, right: 16, bottom: 28, left: 45 };
  const width = 480;

  const maxVal = Math.max(
    ...slice.map((d) => Math.max(d.revenue, d.rent + d.salaries + d.electricity + d.marketing + d.loanEmi + d.taxes + d.cogs)),
    1000
  );

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barGroupWidth = chartWidth / slice.length;
  const singleBarWidth = Math.max(3, barGroupWidth * 0.36);

  const getY = (val: number) => padding.top + chartHeight - (val / maxVal) * chartHeight;

  const hoveredData = hoverIndex !== null ? slice[hoverIndex] : slice[slice.length - 1];
  const hoveredExpenses = hoveredData
    ? hoveredData.rent + hoveredData.salaries + hoveredData.electricity + hoveredData.marketing + hoveredData.loanEmi + hoveredData.taxes + hoveredData.cogs
    : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            Revenue: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupees(hoveredData?.revenue ?? 0)}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            Expenses: <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{formatRupees(hoveredExpenses)}</span>
          </span>
        </div>
        <span className="text-slate-400">Day {hoveredData?.day ?? 1}</span>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="none"
        >
          {/* Top grid line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="4 4"
          />
          {/* Baseline */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
          />

          {/* Y Axis text */}
          <text
            x={padding.left - 6}
            y={padding.top + 4}
            className="text-[9px] fill-slate-400 font-mono text-right"
            textAnchor="end"
          >
            {formatRupees(maxVal, true)}
          </text>
          <text
            x={padding.left - 6}
            y={padding.top + chartHeight + 3}
            className="text-[9px] fill-slate-400 font-mono text-right"
            textAnchor="end"
          >
            ₹0
          </text>

          {/* Bars */}
          {slice.map((d, i) => {
            const groupX = padding.left + i * barGroupWidth;
            const revHeight = (d.revenue / maxVal) * chartHeight;
            const expenses = d.rent + d.salaries + d.electricity + d.marketing + d.loanEmi + d.taxes + d.cogs;
            const expHeight = (expenses / maxVal) * chartHeight;

            const isSelected = hoverIndex === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                onTouchStart={() => setHoverIndex(i)}
                className="cursor-pointer"
              >
                {/* Column highlight */}
                {isSelected && (
                  <rect
                    x={groupX}
                    y={padding.top}
                    width={barGroupWidth}
                    height={chartHeight}
                    fill="currentColor"
                    className="text-slate-100 dark:text-slate-800/60"
                  />
                )}

                {/* Revenue bar (green) */}
                <rect
                  x={groupX + barGroupWidth * 0.1}
                  y={getY(d.revenue)}
                  width={singleBarWidth}
                  height={Math.max(1, revHeight)}
                  rx="2"
                  fill="#10B981"
                  opacity={isSelected ? 1 : 0.85}
                />

                {/* Expense bar (rose) */}
                <rect
                  x={groupX + barGroupWidth * 0.1 + singleBarWidth + 2}
                  y={getY(expenses)}
                  width={singleBarWidth}
                  height={Math.max(1, expHeight)}
                  rx="2"
                  fill="#F43F5E"
                  opacity={isSelected ? 1 : 0.85}
                />

                {/* Day label */}
                <text
                  x={groupX + barGroupWidth / 2}
                  y={height - 8}
                  className="text-[8px] fill-slate-400 font-mono"
                  textAnchor="middle"
                >
                  D{d.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
