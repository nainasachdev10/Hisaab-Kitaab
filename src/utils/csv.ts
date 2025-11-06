import { LedgerRow } from '../types';
import { round2 } from './calculations';

export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQ = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === ',') {
        out.push(cur);
        cur = '';
      } else if (ch === '"') {
        inQ = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

export function toNumber(v: string | null | undefined): string {
  if (v == null) return '';
  const s = String(v).replace(/,/g, '').trim();
  const n = parseFloat(s);
  return isFinite(n) ? String(n) : '';
}

export function exportToCsv(
  rows: LedgerRow[],
  teamAName: string,
  teamBName: string,
  getCustomerName?: (id: string) => string
): string {
  const header = [
    'Player',
    `${teamAName} Exposure`,
    `${teamBName} Exposure`,
    'Share %',
    `My Share on ${teamAName}`,
    `My Share on ${teamBName}`,
  ];

  const csvRows = [header];

  rows.forEach((row) => {
    const share = row.sharePercent / 100;
    const aShare = row.exposureA * share;
    const bShare = row.exposureB * share;
    const customerName = getCustomerName ? getCustomerName(row.customerId) : row.name;
    
    csvRows.push([
      customerName,
      String(row.exposureA),
      String(row.exposureB),
      String(row.sharePercent),
      String(round2(aShare)),
      String(round2(bShare)),
    ]);
  });

  return csvRows
    .map((r) =>
      r
        .map((x) => {
          const s = String(x);
          return s.includes(',') ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    )
    .join('\n');
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function exportToExcel(
  rows: LedgerRow[],
  teamAName: string,
  teamBName: string,
  getCustomerName?: (id: string) => string
): string {
  // Excel-compatible CSV with UTF-8 BOM
  const BOM = '\uFEFF';
  const csv = exportToCsv(rows, teamAName, teamBName, getCustomerName);
  return BOM + csv;
}

export function downloadExcel(
  rows: LedgerRow[],
  teamAName: string,
  teamBName: string,
  filename: string,
  getCustomerName?: (id: string) => string
): void {
  const excelContent = exportToExcel(rows, teamAName, teamBName, getCustomerName);
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.xls') ? filename : filename.replace('.csv', '.xls');
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function parseCsvFile(text: string): Array<{ name: string; a: string; b: string; share: string }> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];

  const rows: Array<{ name: string; a: string; b: string; share: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (!cols || cols.length < 4) continue;
    rows.push({
      name: cols[0] || '',
      a: cols[1] || '0',
      b: cols[2] || '0',
      share: cols[3] || '0',
    });
  }

  return rows;
}

