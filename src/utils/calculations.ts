import { LedgerRow, Totals, AverageOdds } from '../types';

export function formatNumber(n: number | null): string {
  if (n === null || Number.isNaN(n) || !isFinite(n)) return '—';
  return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(n);
}

export function parseValue(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const x = parseFloat(String(value));
  return Number.isFinite(x) ? x : 0;
}

export function calculateTotals(rows: LedgerRow[]): Totals {
  let totalA = 0;
  let totalB = 0;
  let totalAShare = 0;
  let totalBShare = 0;

  rows.forEach((row) => {
    const share = row.sharePercent / 100;
    totalA += row.exposureA;
    totalB += row.exposureB;
    totalAShare += row.exposureA * share;
    totalBShare += row.exposureB * share;
  });

  return { totalA, totalB, totalAShare, totalBShare };
}

export function calculateAverageOdds(totals: Totals): AverageOdds {
  // Use share totals instead of raw totals, since shares vary per entry
  const lossOnA = Math.max(0, -totals.totalAShare);
  const winOnB = Math.max(0, totals.totalBShare);
  const lossOnB = Math.max(0, -totals.totalBShare);
  const winOnA = Math.max(0, totals.totalAShare);

  const oddsB = winOnB > 0 ? 1 + lossOnA / winOnB : null;
  const oddsA = winOnA > 0 ? 1 + lossOnB / winOnA : null;

  return { oddsA, oddsB };
}

export function calculateExposureFromOdds(
  stake: number,
  odds: number,
  side: 'A' | 'B'
): { exposureA: number; exposureB: number } {
  const profit = stake * Math.max(0, odds - 1);
  
  if (side === 'A') {
    return { exposureA: -profit, exposureB: stake };
  } else {
    return { exposureA: stake, exposureB: -profit };
  }
}

export interface ProfitLoss {
  profitIfA: number;
  profitIfB: number;
  maxLoss: number;
  maxProfit: number;
  breakEvenOddsA: number | null;
  breakEvenOddsB: number | null;
}

export interface RiskMetrics {
  totalExposure: number;
  maxLoss: number;
  maxProfit: number;
  riskRewardRatio: number | null;
  exposureLimit?: number;
  exposureLimitExceeded: boolean;
}

export function calculateProfitLoss(rows: LedgerRow[]): ProfitLoss {
  let profitIfA = 0;
  let profitIfB = 0;

  rows.forEach((row) => {
    const share = row.sharePercent / 100;
    // If Team A wins, we get exposureA (negative = loss, positive = win)
    profitIfA += row.exposureA * share;
    // If Team B wins, we get exposureB
    profitIfB += row.exposureB * share;
  });

  const maxLoss = Math.min(profitIfA, profitIfB);
  const maxProfit = Math.max(profitIfA, profitIfB);

  // Calculate break-even odds
  const lossOnA = Math.max(0, -profitIfA);
  const winOnB = Math.max(0, profitIfB);
  const lossOnB = Math.max(0, -profitIfB);
  const winOnA = Math.max(0, profitIfA);

  const breakEvenOddsB = winOnB > 0 ? 1 + lossOnA / winOnB : null;
  const breakEvenOddsA = winOnA > 0 ? 1 + lossOnB / winOnA : null;

  return {
    profitIfA,
    profitIfB,
    maxLoss,
    maxProfit,
    breakEvenOddsA,
    breakEvenOddsB,
  };
}

export function calculateRiskMetrics(totals: Totals, exposureLimit?: number): RiskMetrics {
  // Total exposure is the sum of absolute values of your share exposures
  const totalExposure = Math.abs(totals.totalAShare) + Math.abs(totals.totalBShare);
  
  // Max loss is the worst-case scenario (minimum of the two outcomes)
  const maxLoss = Math.min(totals.totalAShare, totals.totalBShare);
  
  // Max profit is the best-case scenario (maximum of the two outcomes)
  const maxProfit = Math.max(totals.totalAShare, totals.totalBShare);
  
  // Risk/Reward Ratio = Max Profit / Max Loss (absolute values)
  // This shows how much you can win for every unit you risk losing
  const riskRewardRatio = maxLoss !== 0 ? Math.abs(maxProfit / maxLoss) : null;
  
  const exposureLimitExceeded = exposureLimit ? totalExposure > exposureLimit : false;

  return {
    totalExposure,
    maxLoss,
    maxProfit,
    riskRewardRatio,
    exposureLimit,
    exposureLimitExceeded,
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

