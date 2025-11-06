import { useRef } from 'react';
import { LedgerRow } from '../types';
import { exportToCsv, downloadCsv, downloadExcel, parseCsvFile, toNumber } from '../utils/csv';
import { useAppStore } from '../store/appStore';
import { useAlert } from '../contexts/AlertContext';
import { HiOutlineArrowDownTray, HiOutlineTableCells } from 'react-icons/hi2';

interface CSVToolProps {
  rows: LedgerRow[];
  teamAName: string;
  teamBName: string;
  onImport: (rows: Array<{ name: string; exposureA: number; exposureB: number; sharePercent: number }>) => void;
}

export default function CSVTool({ rows, teamAName, teamBName, onImport }: CSVToolProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getCustomer = useAppStore((state) => state.getCustomer);
  const { showAlert } = useAlert();

  const handleExport = () => {
    const csv = exportToCsv(
      rows,
      teamAName,
      teamBName,
      (id) => getCustomer(id)?.name || 'Unknown'
    );
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadCsv(csv, `bhole_ledger_${stamp}.csv`);
    showAlert('success', 'Export Successful', 'CSV file has been downloaded successfully.');
  };

  const handleExportExcel = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadExcel(
      rows,
      teamAName,
      teamBName,
      `bhole_ledger_${stamp}.xls`,
      (id) => getCustomer(id)?.name || 'Unknown'
    );
    showAlert('success', 'Export Successful', 'Excel file has been downloaded successfully.');
  };

  const handleImport = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      showAlert('warning', 'No File Selected', 'Please choose a CSV file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const csvRows = parseCsvFile(text);
        
        if (csvRows.length === 0) {
          showAlert('warning', 'No Data Found', 'No data rows found in the CSV file.');
          return;
        }

        const importedRows = csvRows.map((row) => ({
          name: row.name || '',
          exposureA: parseFloat(toNumber(row.a)) || 0,
          exposureB: parseFloat(toNumber(row.b)) || 0,
          sharePercent: parseFloat(toNumber(row.share)) || 0,
        }));

        onImport(importedRows);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        showAlert('success', 'Import Successful', `Successfully imported ${importedRows.length} row(s).`);
      } catch (err) {
        showAlert('error', 'Import Failed', err instanceof Error ? err.message : 'An error occurred while importing the file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="opacity-90 m-0 mb-4 text-sm font-semibold">CSV Import / Export</h3>
      <div className="space-y-4">
        <div>
          <div className="label">Export current ledger</div>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn flex items-center gap-2 justify-center" onClick={handleExport}>
              <HiOutlineArrowDownTray className="w-4 h-4" />
              CSV
            </button>
            <button className="btn btn-add flex items-center gap-2 justify-center" onClick={handleExportExcel}>
              <HiOutlineTableCells className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="csv-file-input" className="label">
            Import CSV (Player, {teamAName}, {teamBName}, Share%)
          </label>
          <div className="flex gap-2">
            <input
              id="csv-file-input"
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="input-field flex-1"
            />
            <button className="btn" onClick={handleImport}>
              📤 Import
            </button>
          </div>
        </div>
      </div>
      <div className="opacity-75 text-xs pt-2 border-t border-line">
        Header expected: <strong>Player</strong>, <strong>&lt;{teamAName}&gt; Exposure</strong>, <strong>&lt;{teamBName}&gt; Exposure</strong>, <strong>Share %</strong>
      </div>
    </div>
  );
}
