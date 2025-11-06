import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const matchSchema = z.object({
  name: z.string().min(1, 'Match name is required'),
  teamA: z.string().min(1, 'Team A name is required'),
  teamB: z.string().min(1, 'Team B name is required'),
  startTime: z.date().optional(),
});

export const ledgerEntrySchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  exposureA: z.number(),
  exposureB: z.number(),
  sharePercent: z.number().min(0).max(100, 'Share must be between 0-100%'),
  matchId: z.string().min(1, 'Match is required'),
});

export const converterSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  stake: z.number().min(0.01, 'Stake must be greater than 0'),
  odds: z.number().min(1.01, 'Odds must be greater than 1'),
  side: z.enum(['A', 'B']),
  sharePercent: z.number().min(0).max(100),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type MatchFormData = z.infer<typeof matchSchema>;
export type LedgerEntryFormData = z.infer<typeof ledgerEntrySchema>;
export type ConverterFormData = z.infer<typeof converterSchema>;

