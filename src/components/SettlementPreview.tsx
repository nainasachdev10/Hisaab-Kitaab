import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { calculateProfitLoss } from '../utils/calculations';
import { formatNumber } from '../utils/calculations';
import { Match } from '../types';
import { useAlert } from '../contexts/AlertContext';
import { HiOutlineXMark } from 'react-icons/hi2';

interface SettlementPreviewProps {
  match: Match;
  onClose: () => void;
  onConfirm: (winningSide: 'A' | 'B') => void;
}

export default function SettlementPreview({ match, onClose, onConfirm }: SettlementPreviewProps) {
  const ledgerEntries = useAppStore((state) => state.getLedgerEntriesByMatch(match.id));
  const [selectedSide, setSelectedSide] = useState<'A' | 'B' | null>(null);
  const { showAlert } = useAlert();

  const profitLoss = calculateProfitLoss(ledgerEntries);
  
  const previewProfit = selectedSide === 'A' 
    ? profitLoss.profitIfA 
    : selectedSide === 'B' 
    ? profitLoss.profitIfB 
    : null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 modal-overlay" onClick={onClose}>
      <div
        className="panel max-w-2xl w-full animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Settlement Preview</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm px-2"
            title="Close"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#2a2a2a] rounded-lg border border-line">
            <h3 className="font-semibold mb-2">{match.name}</h3>
            <div className="text-sm opacity-75">
              {match.teamA} vs {match.teamB}
            </div>
            <div className="text-xs opacity-60 mt-1">
              {ledgerEntries.length} entries
            </div>
          </div>

          {/* Current P&L */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <div className="text-xs opacity-75 mb-1">If {match.teamA} wins:</div>
              <div className={`text-2xl font-bold font-mono ${
                profitLoss.profitIfA >= 0 ? 'text-green-500' : 'text-red-400'
              }`}>
                {formatNumber(profitLoss.profitIfA)}
              </div>
            </div>
            <div className="card">
              <div className="text-xs opacity-75 mb-1">If {match.teamB} wins:</div>
              <div className={`text-2xl font-bold font-mono ${
                profitLoss.profitIfB >= 0 ? 'text-green-500' : 'text-red-400'
              }`}>
                {formatNumber(profitLoss.profitIfB)}
              </div>
            </div>
          </div>

          {/* Select winning side */}
          <div>
            <div className="label">Select Winning Team</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedSide('A')}
                className={`btn ${
                  selectedSide === 'A' ? 'btn-add' : 'btn-ghost'
                }`}
              >
                {match.teamA} (A)
              </button>
              <button
                onClick={() => setSelectedSide('B')}
                className={`btn ${
                  selectedSide === 'B' ? 'btn-add' : 'btn-ghost'
                }`}
              >
                {match.teamB} (B)
              </button>
            </div>
          </div>

          {/* Preview settlement */}
          {selectedSide && previewProfit !== null && (
            <div className="p-4 bg-[#2a2a2a] rounded-lg border border-accent">
              <div className="text-sm font-semibold mb-2">Settlement Preview:</div>
              <div className="flex justify-between items-center">
                <span className="opacity-75">
                  Net Profit/Loss if {selectedSide === 'A' ? match.teamA : match.teamB} wins:
                </span>
                <span className={`text-2xl font-bold font-mono ${
                  previewProfit >= 0 ? 'text-green-500' : 'text-red-400'
                }`}>
                  {formatNumber(previewProfit)}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                if (selectedSide) {
                  onConfirm(selectedSide);
                } else {
                  showAlert('warning', 'Selection Required', 'Please select a winning team');
                }
              }}
              className="btn btn-add flex-1"
              disabled={!selectedSide}
            >
              Confirm Settlement
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
