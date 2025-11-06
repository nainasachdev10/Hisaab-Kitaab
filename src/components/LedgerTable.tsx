import { LedgerRow } from '../types';
import { formatNumber } from '../utils/calculations';
import { useAppStore } from '../store/appStore';
import { format } from 'date-fns';
import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface LedgerTableProps {
  rows: LedgerRow[];
  teamAName: string;
  teamBName: string;
}

export default function LedgerTable({ rows, teamAName, teamBName }: LedgerTableProps) {
  const updateLedgerEntry = useAppStore((state) => state.updateLedgerEntry);
  const deleteLedgerEntry = useAppStore((state) => state.deleteLedgerEntry);
  const customers = useAppStore((state) => state.customers);
  const [deleteConfirm, setDeleteConfirm] = useState<{ entryId: string; customerName: string } | null>(null);

  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <p className="text-sm opacity-75 mb-2 font-medium">
          No entries added yet
        </p>
        <p className="text-xs opacity-60">
          Click "+ Add Entry" to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full border-separate border-spacing-y-2 mt-4">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted py-3 px-4">
              Player / Customer
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider text-muted py-3 px-4 text-right">
              {teamAName} Exposure (±)
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider text-muted py-3 px-4 text-right">
              {teamBName} Exposure (±)
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider text-muted py-3 px-4 text-right">
              My Share %
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider text-muted py-3 px-4 text-right">
              My Share on {teamAName}
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider text-muted py-3 px-4 text-right">
              My Share on {teamBName}
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider text-muted py-3 px-4 text-right">
              Additional Notes
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider text-muted py-3 px-4 text-right">
              Updated
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider text-muted py-3 px-4 text-center w-20">
              Delete
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const share = row.sharePercent / 100;
            const shareA = row.exposureA * share;
            const shareB = row.exposureB * share;
            const customer = customers.find((c) => c.id === row.customerId);
            const createdAt = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
            const updatedAt = row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt);
            const isRecentlyUpdated = updatedAt.getTime() - createdAt.getTime() > 1000;

            return (
              <tr
                key={row.id}
                className="bg-[#2a2a2a] border border-line hover:bg-[#2f2f2f] transition-all duration-200 group"
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <td className="p-3 border-l border-t border-b border-line rounded-l-xl">
                  <div className="font-medium">{customer?.name || row.name}</div>
                  {customer?.email && (
                    <div className="text-xs opacity-60">{customer.email}</div>
                  )}
                </td>
                <td className="p-0 border-t border-b border-line">
                  <input
                    type="number"
                    step="1"
                    className="input-field input-number rounded-none border-0 border-r border-line focus:border-r focus:border-line"
                    placeholder="-9500"
                    value={row.exposureA || ''}
                    onChange={(e) =>
                      updateLedgerEntry(row.id, 'exposureA', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td className="p-0 border-t border-b border-line">
                  <input
                    type="number"
                    step="1"
                    className="input-field input-number rounded-none border-0 border-r border-line focus:border-r focus:border-line"
                    placeholder="10000"
                    value={row.exposureB || ''}
                    onChange={(e) =>
                      updateLedgerEntry(row.id, 'exposureB', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td className="p-0 border-t border-b border-line">
                  <input
                    type="number"
                    step="0.01"
                    className="input-field input-number rounded-none border-0 border-r border-line focus:border-r focus:border-line"
                    placeholder="20"
                    value={row.sharePercent || ''}
                    onChange={(e) =>
                      updateLedgerEntry(row.id, 'sharePercent', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td className="p-3 border-t border-b border-line text-right font-mono text-sm">
                  <span className={shareA < 0 ? 'text-red-400' : 'text-green-500'}>
                    {formatNumber(shareA)}
                  </span>
                </td>
                <td className="p-3 border-t border-b border-line text-right font-mono text-sm">
                  <span className={shareB < 0 ? 'text-red-400' : 'text-green-500'}>
                    {formatNumber(shareB)}
                  </span>
                </td>
                <td className="p-3 border-t border-b border-line text-xs opacity-75">
                  {customer?.notes || '-'}
                </td>
                <td className="p-3 border-t border-b border-line text-xs opacity-60 text-right">
                  <div title={`Created: ${format(createdAt, 'MMM dd, yyyy HH:mm')} | Updated: ${format(updatedAt, 'MMM dd, yyyy HH:mm')}`}>
                    {isRecentlyUpdated ? (
                      <div>
                        <div className="opacity-75">{format(updatedAt, 'MMM dd')}</div>
                        <div className="opacity-50 text-[10px]">{format(updatedAt, 'HH:mm')}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="opacity-75">{format(createdAt, 'MMM dd')}</div>
                        <div className="opacity-50 text-[10px]">{format(createdAt, 'HH:mm')}</div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3 border-r border-t border-b border-line rounded-r-xl text-center">
                  <button
                    className="btn btn-danger btn-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDeleteConfirm({ entryId: row.id, customerName: customer?.name || row.name });
                    }}
                    title="Delete row"
                    type="button"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {deleteConfirm && (
        <ConfirmationModal
          isOpen={true}
          type="danger"
          title="Delete Entry"
          message={`Are you sure you want to delete the entry for "${deleteConfirm.customerName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            deleteLedgerEntry(deleteConfirm.entryId);
            setDeleteConfirm(null);
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
