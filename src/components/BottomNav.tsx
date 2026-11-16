import React from 'react';
import { Store, ShoppingCart, Users, PieChart, GraduationCap } from 'lucide-react';

export type NavTabId = 'shop' | 'market' | 'staff' | 'finance' | 'learn';

interface BottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  hasPendingLoans?: boolean;
  hasUnreadTips?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  hasPendingLoans,
  hasUnreadTips,
}) => {
  const tabs = [
    { id: 'shop' as NavTabId, label: 'Shop', icon: Store },
    { id: 'market' as NavTabId, label: 'Market', icon: ShoppingCart },
    { id: 'staff' as NavTabId, label: 'Staff & Tech', icon: Users },
    { id: 'finance' as NavTabId, label: 'Finance', icon: PieChart, alert: hasPendingLoans },
    { id: 'learn' as NavTabId, label: 'Learn', icon: GraduationCap, alert: hasUnreadTips },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.alert && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-full px-1">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
