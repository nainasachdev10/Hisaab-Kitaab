import { useAppStore } from '../store/appStore';
import { format } from 'date-fns';
import MatchForm from './MatchForm';
import SettlementPreview from './SettlementPreview';
import ConfirmationModal from './ConfirmationModal';
import { useState, useMemo, useEffect, useRef } from 'react';

export default function MatchSelector() {
  const matches = useAppStore((state) => state.matches);
  const currentMatchId = useAppStore((state) => state.currentMatchId);
  const setCurrentMatch = useAppStore((state) => state.setCurrentMatch);
  const deleteMatch = useAppStore((state) => state.deleteMatch);
  const getLedgerEntriesByMatch = useAppStore((state) => state.getLedgerEntriesByMatch);
  const settleMatch = useAppStore((state) => state.settleMatch);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settlementPreview, setSettlementPreview] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ matchId: string; matchName: string } | null>(null);
  const hasOpenedFromQuickActionRef = useRef(false);
  const wasCanceledRef = useRef(false);

  // Listen for quick action events
  useEffect(() => {
    // Reset canceled flag when component mounts (new navigation)
    wasCanceledRef.current = false;
    
    const handleQuickAction = (e: CustomEvent<string>) => {
      if (e.detail === 'new-match' && !hasOpenedFromQuickActionRef.current && !wasCanceledRef.current) {
        setShowForm(true);
        hasOpenedFromQuickActionRef.current = true;
        // Mark as processed to prevent delayed events from reopening
        (window as any).__quickActionProcessed = true;
        // Clear the stored action immediately
        delete (window as any).__lastQuickAction;
        delete (window as any).__lastQuickActionTime;
      }
    };
    window.addEventListener('quick-action', handleQuickAction as EventListener);
    
    // Also check if we should open form on mount (in case event was fired before mount)
    const checkOpenForm = () => {
      const lastAction = (window as any).__lastQuickAction;
      if (lastAction === 'new-match' && !hasOpenedFromQuickActionRef.current && !wasCanceledRef.current) {
        setShowForm(true);
        hasOpenedFromQuickActionRef.current = true;
        // Mark as processed
        (window as any).__quickActionProcessed = true;
        delete (window as any).__lastQuickAction;
        delete (window as any).__lastQuickActionTime;
      }
    };
    
    // Small delay to ensure component is fully mounted
    const timeoutId = setTimeout(checkOpenForm, 50);
    
    return () => {
      window.removeEventListener('quick-action', handleQuickAction as EventListener);
      clearTimeout(timeoutId);
      // Clear the stored action when component unmounts
      if ((window as any).__lastQuickAction === 'new-match') {
        delete (window as any).__lastQuickAction;
        delete (window as any).__lastQuickActionTime;
      }
    };
  }, []);

  const handleCloseForm = () => {
    setShowForm(false);
    hasOpenedFromQuickActionRef.current = false;
    wasCanceledRef.current = true;
    // Mark as processed and clear all stored data when form is closed
    (window as any).__quickActionProcessed = true;
    delete (window as any).__lastQuickAction;
    delete (window as any).__lastQuickActionTime;
  };

  const currentMatch = matches.find((m) => m.id === currentMatchId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'live':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Filter matches by search query
  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    
    const query = searchQuery.toLowerCase();
    return matches.filter(match => 
      match.name.toLowerCase().includes(query) ||
      match.teamA.toLowerCase().includes(query) ||
      match.teamB.toLowerCase().includes(query)
    );
  }, [matches, searchQuery]);

  return (
    <>
      <div className="panel mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Match Management</h2>
          <button
            onClick={() => {
              setShowForm(true);
              wasCanceledRef.current = false; // Reset canceled flag when manually opening
              hasOpenedFromQuickActionRef.current = false; // Reset opened flag
            }}
            className="btn btn-add btn-sm"
          >
            ➕ New Match
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Search matches by name or teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredMatches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {searchQuery ? '🔍' : '🏆'}
            </div>
            <p className="text-sm opacity-75 mb-2 font-medium">
              {searchQuery ? 'No matches found' : 'No matches created yet'}
            </p>
            <p className="text-xs opacity-60 mb-4">
              {searchQuery ? 'Try a different search term' : 'Create your first match to get started'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn btn-ghost btn-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match) => {
              const entryCount = getLedgerEntriesByMatch(match.id).length;
              return (
                <div
                  key={match.id}
                  className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                    match.id === currentMatchId
                      ? 'bg-[#2a2a2a] border-[#4a90e2] shadow-lg shadow-[#4a90e2]/20'
                      : 'bg-[#2a2a2a] border-[#333333] hover:border-[#4a90e2]/50'
                  }`}
                  onClick={() => setCurrentMatch(match.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-white text-lg">{match.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs border font-medium ${getStatusColor(
                            match.status
                          )}`}
                        >
                          {match.status === 'upcoming' && '⏳'}
                          {match.status === 'live' && '🔴'}
                          {match.status === 'completed' && '✅'}
                          {match.status === 'settled' && '💰'}
                          {' '}
                          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 text-center p-2 bg-[#1a1a1a] rounded-lg border border-[#333333]">
                          <div className="text-xs text-[#cccccc] opacity-75 mb-1">Team A</div>
                          <div className="font-semibold text-white">{match.teamA}</div>
                        </div>
                        <div className="text-[#cccccc] opacity-50 font-bold">VS</div>
                        <div className="flex-1 text-center p-2 bg-[#1a1a1a] rounded-lg border border-[#333333]">
                          <div className="text-xs text-[#cccccc] opacity-75 mb-1">Team B</div>
                          <div className="font-semibold text-white">{match.teamB}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#cccccc] opacity-75">
                        <span>📊 {entryCount} entries</span>
                        {match.settledAt && (
                          <span>💰 Settled {format(match.settledAt, 'MMM dd')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[#333333]">
                    {match.status === 'completed' && !match.settledAt && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSettlementPreview(match.id);
                        }}
                        className="btn btn-add btn-sm flex-1"
                        title="Settle match"
                      >
                        ✓ Settle
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ matchId: match.id, matchName: match.name });
                      }}
                      className="btn btn-danger btn-sm px-3"
                      title="Delete match"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentMatch && (
          <div className="mt-4 p-3 bg-[#2a2a2a] rounded-lg border border-line">
            <div className="text-xs opacity-75 mb-1">Current Match:</div>
            <div className="font-semibold">{currentMatch.name}</div>
            <div className="text-sm opacity-75">
              {currentMatch.teamA} vs {currentMatch.teamB}
            </div>
          </div>
        )}
      </div>

      {showForm && <MatchForm onClose={handleCloseForm} />}
      
      {settlementPreview && (() => {
        const match = matches.find(m => m.id === settlementPreview);
        if (!match) {
          setSettlementPreview(null);
          return null;
        }
        return (
          <SettlementPreview
            match={match}
            onClose={() => setSettlementPreview(null)}
            onConfirm={(side) => {
              if (settlementPreview) {
                settleMatch(settlementPreview, side);
                setSettlementPreview(null);
              }
            }}
          />
        );
      })()}

      {deleteConfirm && (
        <ConfirmationModal
          isOpen={true}
          type="danger"
          title="Delete Match"
          message={`Are you sure you want to delete "${deleteConfirm.matchName}"? This action cannot be undone and will also delete all associated ledger entries.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            deleteMatch(deleteConfirm.matchId);
            setDeleteConfirm(null);
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </>
  );
}
