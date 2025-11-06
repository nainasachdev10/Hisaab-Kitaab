import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { formatNumber } from '../utils/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsDashboard() {
  const matches = useAppStore((state) => state.matches);
  const settlements = useAppStore((state) => state.settlements);
  const ledgerEntries = useAppStore((state) => state.ledgerEntries);
  const customers = useAppStore((state) => state.customers);

  // Calculate overall statistics
  const totalMatches = matches.length;
  const settledMatches = matches.filter((m) => m.status === 'settled').length;
  const totalCustomers = customers.length;
  const totalEntries = ledgerEntries.length;

  const totalProfitLoss = useMemo(() => {
    return settlements.reduce((sum, s) => sum + s.netProfit, 0);
  }, [settlements]);

  // Match-wise profit/loss
  const matchProfitLoss = useMemo(() => {
    return matches
      .filter((m) => m.status === 'settled')
      .map((match) => {
        const settlement = settlements.find((s) => s.matchId === match.id);
        return {
          name: match.name.length > 20 ? match.name.substring(0, 20) + '...' : match.name,
          profit: settlement?.netProfit || 0,
        };
      });
  }, [matches, settlements]);

  // Customer exposure analysis
  const customerExposure = useMemo(() => {
    const exposureMap = new Map<string, { name: string; total: number }>();

    ledgerEntries.forEach((entry) => {
      const customer = customers.find((c) => c.id === entry.customerId);
      if (!customer) return;

      const share = entry.sharePercent / 100;
      const totalExposure = Math.abs(entry.exposureA * share) + Math.abs(entry.exposureB * share);

      const existing = exposureMap.get(entry.customerId);
      if (existing) {
        existing.total += totalExposure;
      } else {
        exposureMap.set(entry.customerId, {
          name: customer.name,
          total: totalExposure,
        });
      }
    });

    return Array.from(exposureMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [ledgerEntries, customers]);

  // Recent activity
  const recentSettlements = useMemo(() => {
    return settlements
      .map((s) => ({
        ...s,
        settledAt: s.settledAt instanceof Date ? s.settledAt : new Date(s.settledAt),
      }))
      .sort((a, b) => b.settledAt.getTime() - a.settledAt.getTime())
      .slice(0, 5);
  }, [settlements]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-muted mb-1">Total Matches</div>
          <div className="text-2xl font-bold">{totalMatches}</div>
          <div className="text-xs opacity-75 mt-1">
            {settledMatches} settled
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-muted mb-1">Total Customers</div>
          <div className="text-2xl font-bold">{totalCustomers}</div>
        </div>

        <div className="card">
          <div className="text-sm text-muted mb-1">Total Entries</div>
          <div className="text-2xl font-bold">{totalEntries}</div>
        </div>

        <div className={`card ${totalProfitLoss >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className="text-sm text-muted mb-1">Net Profit/Loss</div>
          <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-400'}`}>
            {formatNumber(totalProfitLoss)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit/Loss by Match */}
        {matchProfitLoss.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-muted mb-4 uppercase tracking-wide">
              Profit/Loss by Match
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={matchProfitLoss}>
                <CartesianGrid strokeDasharray="3 3" stroke="#223053" />
                <XAxis dataKey="name" stroke="#9fb2ff" fontSize={12} />
                <YAxis stroke="#9fb2ff" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12182a',
                    border: '1px solid #223053',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="profit" fill="#7cffb2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Customer Exposure */}
        {customerExposure.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-muted mb-4 uppercase tracking-wide">
              Top Customer Exposure
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerExposure} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#223053" />
                <XAxis type="number" stroke="#9fb2ff" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9fb2ff" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12182a',
                    border: '1px solid #223053',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="total" fill="#ffc857" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Settlements */}
      {recentSettlements.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-muted mb-4 uppercase tracking-wide">
            Recent Settlements
          </h3>
          <div className="space-y-2">
            {recentSettlements.map((settlement) => {
              const match = matches.find((m) => m.id === settlement.matchId);
              return (
                <div
                  key={settlement.id}
                  className="p-3 bg-[#2a2a2a] rounded-lg border border-line flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{match?.name || 'Unknown Match'}</div>
                    <div className="text-xs opacity-75">
                      Winner: {settlement.winningSide === 'A' ? match?.teamA : match?.teamB}
                    </div>
                  </div>
                  <div className={`font-bold ${settlement.netProfit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                    {formatNumber(settlement.netProfit)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

