import { formatNumber, calculateProfitLoss, calculateRiskMetrics, ProfitLoss, RiskMetrics, calculateTotals } from '../utils/calculations';
import { LedgerRow } from '../types';
import { HiOutlineCurrencyDollar, HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface ProfitLossCardProps {
  rows: LedgerRow[];
  teamAName: string;
  teamBName: string;
}

export default function ProfitLossCard({ rows, teamAName, teamBName }: ProfitLossCardProps) {
  const profitLoss: ProfitLoss = calculateProfitLoss(rows);
  const totals = calculateTotals(rows);
  const riskMetrics: RiskMetrics = calculateRiskMetrics(totals);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      {/* Real-time Profit/Loss */}
      <div className="card">
        <h3 className="m-0 mb-3 text-sm font-semibold text-muted uppercase tracking-wide flex items-center gap-2">
          <HiOutlineCurrencyDollar className="w-4 h-4" />
          Real-time Profit/Loss
        </h3>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm opacity-75">If {teamAName} wins:</span>
            <span className={`text-lg font-bold font-mono ${
              profitLoss.profitIfA >= 0 ? 'text-green-500' : 'text-red-400'
            }`}>
              {formatNumber(profitLoss.profitIfA)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm opacity-75">If {teamBName} wins:</span>
            <span className={`text-lg font-bold font-mono ${
              profitLoss.profitIfB >= 0 ? 'text-green-500' : 'text-red-400'
            }`}>
              {formatNumber(profitLoss.profitIfB)}
            </span>
          </div>
          <div className="pt-3 border-t border-line">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <span className="text-sm font-semibold">Max Loss:</span>
              <span className="text-xl font-bold font-mono text-red-400">
                {formatNumber(profitLoss.maxLoss)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm font-semibold">Max Profit:</span>
              <span className="text-xl font-bold font-mono text-green-500">
                {formatNumber(profitLoss.maxProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="card">
        <h3 className="m-0 mb-3 text-sm font-semibold text-muted uppercase tracking-wide flex items-center gap-2">
          <HiOutlineExclamationTriangle className="w-4 h-4" />
          Risk Metrics
        </h3>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm opacity-75">Total Exposure:</span>
            <span className={`text-lg font-bold font-mono ${
              riskMetrics.exposureLimitExceeded ? 'text-red-400' : 'text-ink'
            }`}>
              {formatNumber(riskMetrics.totalExposure)}
            </span>
          </div>
          {riskMetrics.exposureLimit && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm opacity-75">Exposure Limit:</span>
              <span className="text-sm font-mono">
                {formatNumber(riskMetrics.exposureLimit)}
                {riskMetrics.exposureLimitExceeded && (
                  <span className="ml-2 text-red-400 flex items-center gap-1">
                    <HiOutlineExclamationTriangle className="w-3 h-3" />
                    Exceeded
                  </span>
                )}
              </span>
            </div>
          )}
          {riskMetrics.riskRewardRatio !== null && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm opacity-75">Risk/Reward Ratio:</span>
              <span className="text-lg font-bold font-mono">
                {formatNumber(riskMetrics.riskRewardRatio)}:1
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-line">
            <div className="text-xs opacity-60 break-words">
              Break-even odds: A={formatNumber(profitLoss.breakEvenOddsA)} | B={formatNumber(profitLoss.breakEvenOddsB)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
