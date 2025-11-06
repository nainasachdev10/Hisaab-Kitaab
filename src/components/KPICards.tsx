import { Totals, AverageOdds } from '../types';
import { formatNumber } from '../utils/calculations';

interface KPICardsProps {
  totals: Totals;
  averageOdds: AverageOdds;
  teamAName: string;
  teamBName: string;
}

export default function KPICards({
  totals,
  averageOdds,
  teamAName,
  teamBName,
}: KPICardsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="card">
          <h3 className="m-0 mb-3 text-sm font-semibold text-muted uppercase tracking-wide">
            Total Exposure (All Customers)
          </h3>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div className="w-full sm:w-auto">
              <span className="pill-neg block sm:inline-block text-center sm:text-left">
                {teamAName}: {formatNumber(totals.totalA)}
              </span>
            </div>
            <div className="w-full sm:w-auto">
              <span className="pill-pos block sm:inline-block text-center sm:text-left">
                {teamBName}: {formatNumber(totals.totalB)}
              </span>
            </div>
          </div>
          <div className="opacity-70 text-xs">
            Numbers are simple sums of columns 2 and 3.
          </div>
        </div>
        <div className="card">
          <h3 className="m-0 mb-3 text-sm font-semibold text-muted uppercase tracking-wide">
            Your Share Totals
          </h3>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div className="w-full sm:w-auto">
              <span className="pill-neg block sm:inline-block text-center sm:text-left">
                {teamAName} Share: {formatNumber(totals.totalAShare)}
              </span>
            </div>
            <div className="w-full sm:w-auto">
              <span className="pill-pos block sm:inline-block text-center sm:text-left">
                {teamBName} Share: {formatNumber(totals.totalBShare)}
              </span>
            </div>
          </div>
          <div className="opacity-70 text-xs">
            Sums of columns 5 and 6.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="card">
          <h3 className="m-0 mb-3 text-sm font-semibold text-muted uppercase tracking-wide">
            Average Odds if {teamBName} wins
          </h3>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-ink">
            {formatNumber(averageOdds.oddsB)}
          </div>
          <div className="text-xs opacity-70 mt-2">
            Formula: 1 + (Your loss on {teamAName}) / (Your win on {teamBName})
            <br />
            <span className="opacity-60">Based on your share percentages</span>
          </div>
        </div>
        <div className="card">
          <h3 className="m-0 mb-3 text-sm font-semibold text-muted uppercase tracking-wide">
            Average Odds if {teamAName} wins
          </h3>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-ink">
            {formatNumber(averageOdds.oddsA)}
          </div>
          <div className="text-xs opacity-70 mt-2">
            Formula: 1 + (Your loss on {teamBName}) / (Your win on {teamAName})
            <br />
            <span className="opacity-60">Based on your share percentages</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-[#cccccc] mt-4 p-3 bg-[#2a2a2a] rounded-lg border border-[#333333]">
        <strong>Note:</strong> Average odds calculations use your share totals (columns 5 & 6), which factor in each entry's share percentage. 
        "Loss" uses the absolute of negative share totals; "Win" uses positive share totals.
        If a side has no positive share total yet, its average odds is shown as "—".
      </div>
    </>
  );
}
