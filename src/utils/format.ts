/**
 * Number and currency formatting utilities tailored for Indian Rupee (INR) representation.
 */

export function formatRupees(amount: number, compact: boolean = false): string {
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);

  if (compact) {
    if (abs >= 10000000) {
      return `${isNegative ? '-' : ''}₹${(abs / 10000000).toFixed(2)}Cr`;
    }
    if (abs >= 100000) {
      return `${isNegative ? '-' : ''}₹${(abs / 100000).toFixed(2)}L`;
    }
    if (abs >= 1000) {
      return `${isNegative ? '-' : ''}₹${(abs / 1000).toFixed(1)}k`;
    }
  }

  // Indian numbering system format (e.g., ₹10,00,000)
  try {
    const formatter = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    });
    return `${isNegative ? '-' : ''}₹${formatter.format(abs)}`;
  } catch {
    return `${isNegative ? '-' : ''}₹${abs.toLocaleString()}`;
  }
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getSeasonInfo(season: 'summer' | 'monsoon' | 'festive' | 'winter'): { name: string; icon: string; perk: string } {
  switch (season) {
    case 'summer':
      return { name: 'Summer Heat', icon: '☀️', perk: 'Cold drinks, ice treats, light apparel in high demand (+80%)' };
    case 'monsoon':
      return { name: 'Monsoon Rains', icon: '🌧️', perk: 'Hot chai, comfort food & quick deliveries surge (+40%)' };
    case 'festive':
      return { name: 'Festive Season', icon: '🪔', perk: 'Diwali/Eid rush: sweets, ethnic wear, gift electronics surge (+100%)' };
    case 'winter':
      return { name: 'Winter Chill', icon: '❄️', perk: 'Warm bakery goods, hot brews, jackets & outerwear surge (+70%)' };
  }
}

export function calculateGrade(days: number, finalNetWorth: number, customerSatisfaction: number, debtFree: boolean): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (finalNetWorth < 500000) return 'F';
  if (days <= 35 && customerSatisfaction >= 85 && debtFree) return 'A+';
  if (days <= 50 && customerSatisfaction >= 75) return 'A';
  if (days <= 75) return 'B';
  if (days <= 100) return 'C';
  return 'D';
}
