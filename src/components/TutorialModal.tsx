import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Store, ShoppingCart, Users, PieChart, GraduationCap } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      title: 'Welcome to Vyapaar Tycoon!',
      badge: 'Core Objective',
      icon: Store,
      content:
        'You start as a humble roadside stall with initial seed capital. Your mission is to scale your business into a ₹10,00,000 National Corporation through smart pricing, supply management, and financial discipline.',
      tip: 'Tip: Monitor time in days. Advance days manually or toggle auto-play with 1x, 2x, or 4x speed.',
    },
    {
      title: 'Buy Stock in the Wholesale Market',
      badge: 'Economies of Scale',
      icon: ShoppingCart,
      content:
        'Visit the Market tab to purchase wholesale stock. Wholesale prices fluctuate daily (+/- 8%). The more units you order at once, the bigger your bulk discount (up to 15% off for 100+ units!).',
      tip: 'Watch out for perishable items! Expired goods spoil and become pure financial loss.',
    },
    {
      title: 'Master Price Elasticity of Demand',
      badge: 'Shop & Pricing',
      icon: GraduationCap,
      content:
        'In the Shop tab, set your own selling price for every product. Raising prices boosts margin per unit, but reduces sales volume based on customer price elasticity. Look at the live Demand Curve to find the optimal revenue point!',
      tip: 'Seasonal events like summer heatwaves or festive melas surge demand for specific products.',
    },
    {
      title: 'Manage Cash Flow & Grow',
      badge: 'Finance & Team',
      icon: PieChart,
      content:
        'Every day you pay fixed rent, electricity, marketing, and staff salaries. Hire cashiers to handle crowds and inventory managers to cut spoilage. Take bank loans for capital expansion, or save excess cash for 4% daily interest.',
      tip: 'Avoid insolvency! If your liquid cash stays below -₹10,000 for 3 days, your business goes bankrupt.',
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {current.badge} · Step {step + 1} of {steps.length}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 shrink-0">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{current.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {current.content}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 font-medium">
          💡 {current.tip}
        </div>

        {/* Step indicator and buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer flex items-center gap-1"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Start Trading!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
