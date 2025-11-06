export interface LedgerRow {
  id: string;
  name: string;
  customerId: string; // Link to customer
  exposureA: number;
  exposureB: number;
  sharePercent: number;
  matchId: string; // Link to match
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  name: string;
  teamA: string;
  teamB: string;
  status: 'upcoming' | 'live' | 'completed' | 'settled';
  startTime?: Date;
  winningSide?: 'A' | 'B';
  settledAt?: Date;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  creditLimit?: number;
  status: 'active' | 'suspended' | 'inactive';
  notes?: string;
  createdAt: Date;
}

export interface Totals {
  totalA: number;
  totalB: number;
  totalAShare: number;
  totalBShare: number;
}

export interface AverageOdds {
  oddsA: number | null;
  oddsB: number | null;
}

export interface ConverterData {
  name: string;
  stake: number;
  odds: number;
  side: 'A' | 'B';
  sharePercent: number;
  exposureA: number | null;
  exposureB: number | null;
}

export interface Settlement {
  id: string;
  matchId: string;
  winningSide: 'A' | 'B';
  totalPayout: number;
  netProfit: number;
  settledAt: Date;
}

export interface ProfitLoss {
  matchId: string;
  matchName: string;
  profit: number;
  loss: number;
  netProfit: number;
  settledAt?: Date;
}
