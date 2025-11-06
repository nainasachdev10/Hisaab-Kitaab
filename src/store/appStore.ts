import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LedgerRow, Match, Customer, Settlement } from '../types';

interface AppStore {
  // State
  matches: Match[];
  customers: Customer[];
  ledgerEntries: LedgerRow[];
  settlements: Settlement[];
  currentMatchId: string | null;
  
  // Match Actions
  addMatch: (match: Omit<Match, 'id' | 'createdAt' | 'status'>) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  setCurrentMatch: (id: string) => void;
  settleMatch: (matchId: string, winningSide: 'A' | 'B') => void;
  
  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
  
  // Ledger Actions
  addLedgerEntry: (entry: Omit<LedgerRow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLedgerEntry: (id: string, field: keyof LedgerRow, value: string | number) => void;
  deleteLedgerEntry: (id: string) => void;
  getLedgerEntriesByMatch: (matchId: string) => LedgerRow[];
  getLedgerEntriesByCustomer: (customerId: string) => LedgerRow[];
  syncLedgerEntryNames: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial State
      matches: [],
      customers: [],
      ledgerEntries: [],
      settlements: [],
      currentMatchId: null,

      // Match Actions
      addMatch: (matchData) => {
        const newMatch: Match = {
          ...matchData,
          id: generateId(),
          status: 'upcoming',
          createdAt: new Date(),
        };
        set((state) => ({
          matches: [...state.matches, newMatch],
          currentMatchId: state.currentMatchId || newMatch.id,
        }));
      },

      updateMatch: (id, updates) => {
        set((state) => ({
          matches: state.matches.map((match) =>
            match.id === id ? { ...match, ...updates } : match
          ),
        }));
      },

      deleteMatch: (id) => {
        set((state) => {
          // Also delete all ledger entries and settlements associated with this match
          const updatedLedgerEntries = state.ledgerEntries.filter(
            (entry) => entry.matchId !== id
          );
          
          const updatedSettlements = state.settlements.filter(
            (settlement) => settlement.matchId !== id
          );
          
          return {
            matches: state.matches.filter((match) => match.id !== id),
            ledgerEntries: updatedLedgerEntries,
            settlements: updatedSettlements,
            currentMatchId: state.currentMatchId === id ? null : state.currentMatchId,
          };
        });
      },

      setCurrentMatch: (id) => {
        set({ currentMatchId: id });
      },

      settleMatch: (matchId, winningSide) => {
        const state = get();
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) return;

        const entries = state.getLedgerEntriesByMatch(matchId);
        let totalPayout = 0;

        entries.forEach((entry) => {
          const share = entry.sharePercent / 100;
          const exposure = winningSide === 'A' ? entry.exposureA : entry.exposureB;
          const payout = -exposure * share; // Negative exposure = payout
          totalPayout += payout;
        });

        const netProfit = totalPayout;

        const settlement: Settlement = {
          id: generateId(),
          matchId,
          winningSide,
          totalPayout,
          netProfit,
          settledAt: new Date(),
        };

        set((state) => ({
          settlements: [...state.settlements, settlement],
          matches: state.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  status: 'settled',
                  winningSide,
                  settledAt: new Date(),
                }
              : m
          ),
        }));
      },

      // Customer Actions
      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          ...customerData,
          id: generateId(),
          status: 'active',
          createdAt: new Date(),
        };
        set((state) => ({
          customers: [...state.customers, newCustomer],
        }));
      },

      updateCustomer: (id, updates) => {
        set((state) => {
          const updatedCustomers = state.customers.map((customer) =>
            customer.id === id ? { ...customer, ...updates } : customer
          );
          
          // If customer name changed, update all ledger entries
          let updatedLedgerEntries = state.ledgerEntries;
          if (updates.name) {
            const customer = updatedCustomers.find((c) => c.id === id);
            if (customer) {
              updatedLedgerEntries = state.ledgerEntries.map((entry) =>
                entry.customerId === id
                  ? { ...entry, name: customer.name }
                  : entry
              );
            }
          }
          
          return {
            customers: updatedCustomers,
            ledgerEntries: updatedLedgerEntries,
          };
        });
      },

      deleteCustomer: (id) => {
        set((state) => {
          // Also delete all ledger entries associated with this customer
          const updatedLedgerEntries = state.ledgerEntries.filter(
            (entry) => entry.customerId !== id
          );
          
          const updatedCustomers = state.customers.filter((customer) => customer.id !== id);
          
          return {
            customers: updatedCustomers,
            ledgerEntries: updatedLedgerEntries,
          };
        });
      },

      getCustomer: (id) => {
        return get().customers.find((c) => c.id === id);
      },

      // Ledger Actions
      addLedgerEntry: (entryData) => {
        const state = get();
        // Ensure name is synced with customer
        let entryName = entryData.name;
        if (entryData.customerId) {
          const customer = state.customers.find((c) => c.id === entryData.customerId);
          if (customer) {
            entryName = customer.name;
          }
        }
        
        const newEntry: LedgerRow = {
          ...entryData,
          name: entryName,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          ledgerEntries: [...state.ledgerEntries, newEntry],
        }));
      },

      updateLedgerEntry: (id, field, value) => {
        set((state) => ({
          ledgerEntries: state.ledgerEntries.map((entry) =>
            entry.id === id
              ? { ...entry, [field]: value, updatedAt: new Date() }
              : entry
          ),
        }));
      },

      deleteLedgerEntry: (id) => {
        set((state) => ({
          ledgerEntries: state.ledgerEntries.filter((entry) => entry.id !== id),
        }));
      },

      getLedgerEntriesByMatch: (matchId) => {
        return get().ledgerEntries.filter((entry) => entry.matchId === matchId);
      },

      getLedgerEntriesByCustomer: (customerId) => {
        return get().ledgerEntries.filter((entry) => entry.customerId === customerId);
      },

      // Ensure ledger entry name is synced with customer name
      syncLedgerEntryNames: () => {
        const state = get();
        const updatedEntries = state.ledgerEntries.map((entry) => {
          if (!entry.customerId) return entry;
          const customer = state.customers.find((c) => c.id === entry.customerId);
          if (customer && entry.name !== customer.name) {
            return { ...entry, name: customer.name };
          }
          return entry;
        });
        
        // Only update if there were changes
        const hasChanges = updatedEntries.some((entry, index) => 
          entry.name !== state.ledgerEntries[index]?.name
        );
        
        if (hasChanges) {
          set({ ledgerEntries: updatedEntries });
        }
      },
    }),
    {
      name: 'ledger-app-storage',
      version: 1,
      partialize: (state) => ({
        matches: state.matches,
        customers: state.customers,
        ledgerEntries: state.ledgerEntries,
        settlements: state.settlements,
        currentMatchId: state.currentMatchId,
      }),
      // Deserialize dates when loading from storage
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        
        // Convert date strings back to Date objects
        state.matches = state.matches.map((match: any) => ({
          ...match,
          createdAt: match.createdAt ? new Date(match.createdAt) : new Date(),
          startTime: match.startTime ? new Date(match.startTime) : undefined,
          settledAt: match.settledAt ? new Date(match.settledAt) : undefined,
        }));
        
        state.customers = state.customers.map((customer: any) => ({
          ...customer,
          createdAt: customer.createdAt ? new Date(customer.createdAt) : new Date(),
        }));
        
        state.ledgerEntries = state.ledgerEntries.map((entry: any) => ({
          ...entry,
          createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
          updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
        }));
        
        state.settlements = state.settlements.map((settlement: any) => ({
          ...settlement,
          settledAt: settlement.settledAt ? new Date(settlement.settledAt) : new Date(),
        }));
      },
    }
  )
);

