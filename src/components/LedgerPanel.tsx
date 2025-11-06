import { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { calculateTotals, calculateAverageOdds } from '../utils/calculations';
import LedgerTable from './LedgerTable';
import KPICards from './KPICards';
import ProfitLossCard from './ProfitLossCard';
import EntryForm from './EntryForm';
import { HiOutlineTrophy, HiOutlinePlus } from 'react-icons/hi2';
import { useAlert } from '../contexts/AlertContext';

interface LedgerPanelProps {
  onNavigateToMatches?: () => void;
}

export default function LedgerPanel({ onNavigateToMatches }: LedgerPanelProps) {
  const currentMatchId = useAppStore((state) => state.currentMatchId);
  const matches = useAppStore((state) => state.matches);
  const ledgerEntries = useAppStore((state) => state.ledgerEntries);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const { showAlert } = useAlert();

  const currentMatch = matches.find((m) => m.id === currentMatchId);
  const filteredLedgerEntries = useMemo(() => {
    if (!currentMatchId) return [];
    return ledgerEntries.filter((entry) => entry.matchId === currentMatchId);
  }, [ledgerEntries, currentMatchId]);

  const totals = useMemo(() => calculateTotals(filteredLedgerEntries), [filteredLedgerEntries]);
  const averageOdds = useMemo(() => calculateAverageOdds(totals), [totals]);

  const handleAddRow = () => {
    if (!currentMatchId) {
      showAlert('warning', 'No Match Selected', 'Please select a match first');
      return;
    }
    setShowEntryForm(true);
  };

  if (!currentMatch) {
    return (
      <div className="panel text-center py-16">
        <HiOutlineTrophy className="w-16 h-16 mx-auto mb-4 text-[#cccccc] opacity-40" />
        <p className="text-sm opacity-75 mb-4 font-medium">
          Please select or create a match to start tracking ledger entries.
        </p>
        <button
          onClick={() => {
            if (onNavigateToMatches) {
              onNavigateToMatches();
            }
          }}
          className="btn btn-add"
        >
          Go to Matches
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Featured Match Banner */}
      {currentMatch && (
        <div className="mb-6 rounded-xl overflow-hidden border border-[#333333] bg-gradient-to-r from-[#1a3a5a] to-[#2a5a7a] relative">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="text-xs text-white/75 mb-2 uppercase tracking-wide">Current Match</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{currentMatch.name}</h2>
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="px-2 sm:px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm flex-1 sm:flex-none">
                  <div className="text-xs text-white/75 mb-1">Team A</div>
                  <div className="font-bold text-white text-sm sm:text-base">{currentMatch.teamA}</div>
                </div>
                <div className="text-white/50 font-bold text-sm sm:text-base">VS</div>
                <div className="px-2 sm:px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm flex-1 sm:flex-none">
                  <div className="text-xs text-white/75 mb-1">Team B</div>
                  <div className="font-bold text-white text-sm sm:text-base">{currentMatch.teamB}</div>
                </div>
              </div>
              <div className="text-xs text-white/75">
                {filteredLedgerEntries.length} ledger entries • Status: {currentMatch.status}
              </div>
            </div>
            <button className="btn btn-add w-full sm:w-auto ml-0 sm:ml-4 flex items-center gap-2 justify-center" onClick={handleAddRow}>
              <HiOutlinePlus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        </div>
      )}

      <div className="panel mb-6">
        <LedgerTable
          rows={filteredLedgerEntries}
          teamAName={currentMatch.teamA}
          teamBName={currentMatch.teamB}
        />

        <KPICards
          totals={totals}
          averageOdds={averageOdds}
          teamAName={currentMatch.teamA}
          teamBName={currentMatch.teamB}
        />

        <ProfitLossCard
          rows={filteredLedgerEntries}
          teamAName={currentMatch.teamA}
          teamBName={currentMatch.teamB}
        />
      </div>

      {showEntryForm && (
        <EntryForm
          teamAName={currentMatch.teamA}
          teamBName={currentMatch.teamB}
          matchId={currentMatchId!}
          onClose={() => setShowEntryForm(false)}
        />
      )}
    </>
  );
}
