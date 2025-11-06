import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import CustomerForm from './CustomerForm';
import ConfirmationModal from './ConfirmationModal';
import { Customer } from '../types';
import { formatNumber } from '../utils/calculations';

export default function CustomerManager() {
  const customers = useAppStore((state) => state.customers);
  const ledgerEntries = useAppStore((state) => state.ledgerEntries);
  const matches = useAppStore((state) => state.matches);
  const settlements = useAppStore((state) => state.settlements);
  const deleteCustomer = useAppStore((state) => state.deleteCustomer);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ customerId: string; customerName: string } | null>(null);
  const hasOpenedFromQuickActionRef = useRef(false);
  const wasCanceledRef = useRef(false);

  // Listen for quick action events
  useEffect(() => {
    // Reset canceled flag when component mounts (new navigation)
    wasCanceledRef.current = false;
    
    const handleQuickAction = (e: CustomEvent<string>) => {
      if (e.detail === 'new-customer' && !hasOpenedFromQuickActionRef.current && !wasCanceledRef.current) {
        setEditingCustomer(undefined);
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
      if (lastAction === 'new-customer' && !hasOpenedFromQuickActionRef.current && !wasCanceledRef.current) {
        setEditingCustomer(undefined);
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
      if ((window as any).__lastQuickAction === 'new-customer') {
        delete (window as any).__lastQuickAction;
        delete (window as any).__lastQuickActionTime;
      }
    };
  }, []);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(undefined);
    hasOpenedFromQuickActionRef.current = false;
    wasCanceledRef.current = true;
    // Mark as processed and clear all stored data when form is closed
    (window as any).__quickActionProcessed = true;
    delete (window as any).__lastQuickAction;
    delete (window as any).__lastQuickActionTime;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'suspended':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleDelete = (e: React.MouseEvent, customerId: string, customerName: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteConfirm({ customerId, customerName });
  };

  const handleEdit = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    e.preventDefault();
    
    setEditingCustomer(customer);
    setShowForm(true);
  };

  // Calculate customer statistics and balance
  const customerStats = useMemo(() => {
    const statsMap = new Map<string, {
      totalEntries: number;
      totalExposureA: number;
      totalExposureB: number;
      totalShareA: number;
      totalShareB: number;
      balance: number; // Running balance
      matches: string[];
    }>();

    ledgerEntries.forEach((entry) => {
      if (!entry.customerId) return;
      
      const share = entry.sharePercent / 100;
      const shareA = entry.exposureA * share;
      const shareB = entry.exposureB * share;
      
      const existing = statsMap.get(entry.customerId);
      if (existing) {
        existing.totalEntries++;
        existing.totalExposureA += entry.exposureA;
        existing.totalExposureB += entry.exposureB;
        existing.totalShareA += shareA;
        existing.totalShareB += shareB;
        if (entry.matchId && !existing.matches.includes(entry.matchId)) {
          existing.matches.push(entry.matchId);
        }
      } else {
        statsMap.set(entry.customerId, {
          totalEntries: 1,
          totalExposureA: entry.exposureA,
          totalExposureB: entry.exposureB,
          totalShareA: shareA,
          totalShareB: shareB,
          balance: 0, // Will be calculated from settlements
          matches: entry.matchId ? [entry.matchId] : [],
        });
      }
    });

    // Calculate balances from settlements
    settlements.forEach((settlement) => {
      const matchEntries = ledgerEntries.filter(e => e.matchId === settlement.matchId);
      matchEntries.forEach((entry) => {
        if (!entry.customerId) return;
        const stats = statsMap.get(entry.customerId);
        if (stats) {
          const share = entry.sharePercent / 100;
          const exposure = settlement.winningSide === 'A' ? entry.exposureA : entry.exposureB;
          const payout = -exposure * share; // Negative exposure = payout
          stats.balance += payout;
        }
      });
    });

    return statsMap;
  }, [ledgerEntries, settlements]);

  // Filter customers by search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    
    const query = searchQuery.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  return (
    <>
      <div className="panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Customer Management</h2>
          <button
            onClick={() => {
              setEditingCustomer(undefined);
              setShowForm(true);
              wasCanceledRef.current = false; // Reset canceled flag when manually opening
              hasOpenedFromQuickActionRef.current = false; // Reset opened flag
            }}
            className="btn btn-add btn-sm"
          >
            ➕ New Customer
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {searchQuery ? '🔍' : '👥'}
            </div>
            <p className="text-sm opacity-75 mb-2 font-medium">
              {searchQuery ? 'No customers found' : 'No customers added yet'}
            </p>
            <p className="text-xs opacity-60 mb-4">
              {searchQuery ? 'Try a different search term' : 'Add your first customer to get started'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCustomers.map((customer) => {
              const stats = customerStats.get(customer.id);
              
              return (
                <div
                  key={customer.id}
                  className="p-4 rounded-lg border border-line bg-[#2a2a2a] hover:border-[#3a3a3a] transition-all relative"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-2">
                      <h3 className="font-semibold">{customer.name}</h3>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs border mt-1 ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {customer.status}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0 items-center relative z-10">
                      <button
                        onClick={(e) => handleEdit(e, customer)}
                        className="btn btn-ghost btn-sm px-2 py-1.5 min-w-[36px] h-8 flex items-center justify-center"
                        title="Edit customer"
                        type="button"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, customer.id, customer.name)}
                        className="btn btn-danger btn-sm px-2 py-1.5 min-w-[36px] h-8 flex items-center justify-center relative z-20"
                        title="Delete customer"
                        type="button"
                        style={{ 
                          position: 'relative',
                          zIndex: 20,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs opacity-75 space-y-1 mb-2">
                    {customer.email && <div>📧 {customer.email}</div>}
                    {customer.phone && <div>📞 {customer.phone}</div>}
                    {customer.creditLimit && (
                      <div>💳 Limit: {formatNumber(customer.creditLimit)}</div>
                    )}
                    {customer.notes && (
                      <div className="mt-2 opacity-60">📝 {customer.notes}</div>
                    )}
                  </div>

                  {/* Customer Balance */}
                  {stats && stats.balance !== 0 && (
                    <div className="mt-2 pt-2 border-t border-line">
                      <div className="text-xs font-semibold text-muted mb-1">💰 Balance</div>
                      <div className={`text-lg font-bold font-mono ${
                        stats.balance >= 0 ? 'text-green-500' : 'text-red-400'
                      }`}>
                        {formatNumber(stats.balance)}
                      </div>
                    </div>
                  )}

                  {/* Customer Statistics */}
                  {stats && stats.totalEntries > 0 && (
                    <div className="mt-3 pt-3 border-t border-line">
                      <div className="text-xs font-semibold text-muted mb-2">📊 Statistics</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="opacity-60">Entries:</span>{' '}
                          <span className="font-semibold">{stats.totalEntries}</span>
                        </div>
                        <div>
                          <span className="opacity-60">Matches:</span>{' '}
                          <span className="font-semibold">{stats.matches.length}</span>
                        </div>
                        <div>
                          <span className="opacity-60">Total Share A:</span>{' '}
                          <span className={`font-mono font-semibold ${
                            stats.totalShareA < 0 ? 'text-red-400' : 'text-green-500'
                          }`}>
                            {formatNumber(stats.totalShareA)}
                          </span>
                        </div>
                        <div>
                          <span className="opacity-60">Total Share B:</span>{' '}
                          <span className={`font-mono font-semibold ${
                            stats.totalShareB < 0 ? 'text-red-400' : 'text-green-500'
                          }`}>
                            {formatNumber(stats.totalShareB)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Show linked matches */}
                      {stats.matches.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-line/50">
                          <div className="text-xs opacity-60 mb-1">Linked Matches:</div>
                          <div className="flex flex-wrap gap-1">
                            {stats.matches.slice(0, 3).map((matchId) => {
                              const match = matches.find((m) => m.id === matchId);
                              return match ? (
                                <span
                                  key={matchId}
                                  className="px-2 py-0.5 bg-[#2a2a2a] border border-line rounded text-xs"
                                >
                                  {match.name.length > 15 ? match.name.substring(0, 15) + '...' : match.name}
                                </span>
                              ) : null;
                            })}
                            {stats.matches.length > 3 && (
                              <span className="px-2 py-0.5 bg-[#2a2a2a] border border-line rounded text-xs opacity-60">
                                +{stats.matches.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(!stats || stats.totalEntries === 0) && (
                    <div className="mt-2 pt-2 border-t border-line/50 text-xs opacity-60">
                      No ledger entries yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={handleCloseForm}
        />
      )}

      {deleteConfirm && (
        <ConfirmationModal
          isOpen={true}
          type="danger"
          title="Delete Customer"
          message={`Are you sure you want to delete "${deleteConfirm.customerName}"? This action cannot be undone and will also delete all associated ledger entries.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            deleteCustomer(deleteConfirm.customerId);
            setDeleteConfirm(null);
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </>
  );
}
