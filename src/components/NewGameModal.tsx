import React, { useState } from 'react';
import { BusinessTypeId, Difficulty } from '../types/game';
import { BUSINESS_CONFIGS } from '../data/gameData';
import { formatRupees } from '../utils/format';
import { Store, Shuffle, Sparkles, TrendingUp } from 'lucide-react';

interface NewGameModalProps {
  onStart: (name: string, type: BusinessTypeId, difficulty: Difficulty) => void;
  hasExistingSave?: boolean;
  onContinueExisting?: () => void;
}

const NAME_SUGGESTIONS = [
  'Chai & Bytes Co.',
  'Royal Bombay Bakery',
  'Rajdhani Supermart',
  'Bengaluru Tech Store',
  'Silk & Cotton Studio',
  'Nimbu Magic Refreshments',
  'Khana Khazana Grocers',
  'Urban Oven Patisserie',
  'Volt Electronics Hub',
  'Heritage Threads Boutique',
];

export const NewGameModal: React.FC<NewGameModalProps> = ({
  onStart,
  hasExistingSave,
  onContinueExisting,
}) => {
  const [name, setName] = useState<string>('Rajdhani Supermart');
  const [selectedType, setSelectedType] = useState<BusinessTypeId>('grocery');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');

  const randomizeName = () => {
    const random = NAME_SUGGESTIONS[Math.floor(Math.random() * NAME_SUGGESTIONS.length)];
    setName(random);
  };

  const businessTypes: BusinessTypeId[] = ['lemonade', 'grocery', 'bakery', 'electronics', 'clothing'];

  const difficulties: { id: Difficulty; name: string; cash: number; note: string }[] = [
    { id: 'easy', name: 'Easy', cash: 50000, note: 'Generous seed capital & higher consumer tolerance' },
    { id: 'normal', name: 'Normal', cash: 25000, note: 'Balanced starting capital and realistic margins' },
    { id: 'hard', name: 'Hard', cash: 10000, note: 'Tight bootstrap budget, unforgiving daily expenses' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl my-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mb-1">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Vyapaar Tycoon
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Build your enterprise from a roadside stall to a ₹10,00,000 national corporation while learning real-world economics.
          </p>
        </div>

        {/* Existing Save Banner if available */}
        {hasExistingSave && onContinueExisting && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-100 block">Existing Game Found!</span>
              <span className="text-emerald-700 dark:text-emerald-300">Resume your saved progress or start fresh below.</span>
            </div>
            <button
              onClick={onContinueExisting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              Resume Game
            </button>
          </div>
        )}

        {/* Business Name Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Enter Business Name</span>
            <button
              onClick={randomizeName}
              type="button"
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-xs cursor-pointer"
            >
              <Shuffle className="w-3 h-3" />
              <span>Suggest Name</span>
            </button>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bombay Bakery"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Business Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Choose Business Industry
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {businessTypes.map((typeKey) => {
              const config = BUSINESS_CONFIGS[typeKey];
              const isSelected = selectedType === typeKey;

              return (
                <div
                  key={typeKey}
                  onClick={() => setSelectedType(typeKey)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-white dark:bg-slate-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
                      {config.icon}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{config.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{config.tagline}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Starting Capital & Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((diff) => {
              const isSelected = selectedDifficulty === diff.id;
              return (
                <div
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`p-2.5 rounded-2xl border text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-white dark:bg-slate-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{diff.name}</span>
                  <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block my-0.5">
                    {formatRupees(diff.cash)}
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">{diff.note}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game CTA */}
        <button
          onClick={() => onStart(name, selectedType, selectedDifficulty)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Your Business</span>
        </button>
      </div>
    </div>
  );
};
