# Quick Implementation Guide

## Immediate Next Steps

### Step 1: Add Data Persistence (Quick Win)

#### Option A: LocalStorage (Temporary Solution)
```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

#### Option B: IndexedDB (Better for Large Data)
```typescript
// Use Dexie.js library
npm install dexie

// src/db/indexedDB.ts
import Dexie from 'dexie';

export interface LedgerEntry {
  id?: string;
  name: string;
  exposureA: number;
  exposureB: number;
  sharePercent: number;
  matchId?: string;
  createdAt: Date;
}

class LedgerDB extends Dexie {
  entries!: Dexie.Table<LedgerEntry, string>;

  constructor() {
    super('LedgerDB');
    this.version(1).stores({
      entries: 'id, name, matchId, createdAt'
    });
  }
}

export const db = new LedgerDB();
```

---

### Step 2: Add State Management

```bash
npm install zustand
```

```typescript
// src/store/ledgerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LedgerRow } from '../types';

interface LedgerStore {
  rows: LedgerRow[];
  matches: Array<{ id: string; name: string; teamA: string; teamB: string }>;
  currentMatchId: string | null;
  addRow: (row: LedgerRow) => void;
  updateRow: (id: string, field: keyof LedgerRow, value: string | number) => void;
  deleteRow: (id: string) => void;
  setRows: (rows: LedgerRow[]) => void;
  addMatch: (match: { name: string; teamA: string; teamB: string }) => void;
  setCurrentMatch: (id: string) => void;
}

export const useLedgerStore = create<LedgerStore>()(
  persist(
    (set) => ({
      rows: [],
      matches: [],
      currentMatchId: null,
      addRow: (row) => set((state) => ({ rows: [...state.rows, row] })),
      updateRow: (id, field, value) =>
        set((state) => ({
          rows: state.rows.map((row) =>
            row.id === id ? { ...row, [field]: value } : row
          ),
        })),
      deleteRow: (id) =>
        set((state) => ({ rows: state.rows.filter((row) => row.id !== id) })),
      setRows: (rows) => set({ rows }),
      addMatch: (match) =>
        set((state) => ({
          matches: [...state.matches, { ...match, id: `match-${Date.now()}` }],
        })),
      setCurrentMatch: (id) => set({ currentMatchId: id }),
    }),
    {
      name: 'ledger-storage',
    }
  )
);
```

---

### Step 3: Add Form Validation

```bash
npm install zod react-hook-form @hookform/resolvers
```

```typescript
// src/schemas/ledgerSchema.ts
import { z } from 'zod';

export const ledgerRowSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  exposureA: z.number(),
  exposureB: z.number(),
  sharePercent: z.number().min(0).max(100, 'Share must be between 0-100%'),
});

export const matchSchema = z.object({
  name: z.string().min(1, 'Match name is required'),
  teamA: z.string().min(1, 'Team A name is required'),
  teamB: z.string().min(1, 'Team B name is required'),
});
```

---

### Step 4: Add Error Handling

```typescript
// src/utils/errorHandler.ts
export class LedgerError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'LedgerError';
  }
}

export function handleError(error: unknown): string {
  if (error instanceof LedgerError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
```

---

### Step 5: Add Loading States

```typescript
// src/hooks/useAsync.ts
import { useState, useCallback } from 'react';

export function useAsync<T, E = Error>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err as E);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
}
```

---

## Quick Backend Setup (Next.js API Routes)

### 1. Install Dependencies

```bash
npm install next@latest react@latest react-dom@latest
npm install @supabase/supabase-js
npm install zod
npm install bcryptjs jsonwebtoken
npm install @types/bcryptjs @types/jsonwebtoken
```

### 2. Setup Supabase

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 3. Create API Route

```typescript
// pages/api/ledger/index.ts (or app/api/ledger/route.ts in App Router)
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('ledger_entries')
      .insert(req.body)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
```

---

## Priority Action Items

### This Week:
1. ✅ Add localStorage persistence (prevent data loss)
2. ✅ Add Zustand for state management
3. ✅ Add form validation with Zod
4. ✅ Add error boundaries
5. ✅ Add loading states

### Next Week:
1. Setup Supabase account
2. Create database schema
3. Implement authentication
4. Create API routes
5. Connect frontend to backend

### Week 3:
1. Add real-time updates
2. Add match management
3. Add customer management
4. Add settlement system

---

## Testing Checklist

- [ ] Unit tests for calculations
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Performance testing
- [ ] Security testing
- [ ] Cross-browser testing

---

## Security Checklist

- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Authentication required
- [ ] Authorization checks
- [ ] Audit logging
- [ ] Data encryption
- [ ] Secure password storage

