import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import ConverterTool from './ConverterTool';
import CSVTool from './CSVTool';
import { ConverterData } from '../types';
import { useAlert } from '../contexts/AlertContext';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';

export default function ToolsPage() {
  const currentMatchId = useAppStore((state) => state.currentMatchId);
  const matches = useAppStore((state) => state.matches);
  const customers = useAppStore((state) => state.customers);
  const ledgerEntries = useAppStore((state) => state.ledgerEntries);
  const { showAlert } = useAlert();

  const currentMatch = matches.find((m) => m.id === currentMatchId);
  
  const filteredLedgerEntries = useMemo(() => {
    if (!currentMatchId) return [];
    return ledgerEntries.filter((entry) => entry.matchId === currentMatchId);
  }, [ledgerEntries, currentMatchId]);

  const handleAddFromConverter = (data: ConverterData) => {
    if (data.exposureA === null || data.exposureB === null) return;
    if (!currentMatchId) {
      showAlert('warning', 'No Match Selected', 'Please select a match first');
      return;
    }

    // Find or create customer
    let customer = customers.find((c) => c.name === data.name);
    if (!customer) {
      useAppStore.getState().addCustomer({ name: data.name });
      customer = useAppStore.getState().customers.find((c) => c.name === data.name);
    }

    if (!customer) return;

    useAppStore.getState().addLedgerEntry({
      customerId: customer.id,
      name: data.name,
      exposureA: data.exposureA,
      exposureB: data.exposureB,
      sharePercent: data.sharePercent,
      matchId: currentMatchId,
    });
    
    showAlert('success', 'Entry Added', 'Ledger entry has been added successfully.');
  };

  const handleCSVImport = (importedRows: Array<{ name: string; exposureA: number; exposureB: number; sharePercent: number }>) => {
    if (!currentMatchId) {
      showAlert('warning', 'No Match Selected', 'Please select a match first');
      return;
    }

    importedRows.forEach((row) => {
      let customer = customers.find((c) => c.name === row.name);
      if (!customer) {
        useAppStore.getState().addCustomer({ name: row.name });
        customer = useAppStore.getState().customers.find((c) => c.name === row.name);
      }
      if (customer) {
        useAppStore.getState().addLedgerEntry({
          customerId: customer.id,
          name: row.name,
          exposureA: row.exposureA,
          exposureB: row.exposureB,
          sharePercent: row.sharePercent,
          matchId: currentMatchId,
        });
      }
    });
    
    showAlert('success', 'Import Successful', `Successfully imported ${importedRows.length} row(s) from CSV.`);
  };

  if (!currentMatch) {
    return (
      <div className="panel text-center py-16">
        <HiOutlineCog6Tooth className="w-16 h-16 mx-auto mb-4 text-[#cccccc] opacity-40" />
        <p className="text-sm opacity-75 mb-4 font-medium">
          Please select or create a match to use the tools.
        </p>
        <p className="text-xs opacity-60 mb-4">
          The converter and CSV tools require an active match to function.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Match Info Banner */}
      <div className="panel">
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <HiOutlineCog6Tooth className="w-5 h-5" />
            Tools — Odds ➜ Exposure + CSV
          </h2>
          <div className="text-sm text-[#cccccc] opacity-75">
            Current Match: <span className="font-semibold text-white">{currentMatch.name}</span>
            {' • '}
            {currentMatch.teamA} vs {currentMatch.teamB}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="panel">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border-r border-[#333333] pr-6 lg:pr-6 last:border-r-0 last:pr-0">
            <ConverterTool
              teamAName={currentMatch.teamA}
              teamBName={currentMatch.teamB}
              onAddToLedger={handleAddFromConverter}
            />
          </div>
          <div>
            <CSVTool
              rows={filteredLedgerEntries}
              teamAName={currentMatch.teamA}
              teamBName={currentMatch.teamB}
              onImport={handleCSVImport}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
