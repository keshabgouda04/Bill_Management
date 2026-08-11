import type { BillStatus, PaymentStatus } from '../api/billsApi';

export type StatusStyle = { label: string; bg: string; text: string };

export const PAYMENT_STATUS: Record<string, StatusStyle> = {
  PAID: { label: 'Paid', bg: '#ECFDF5', text: '#059669' },
  UNPAID: { label: 'Unpaid', bg: '#FFF1F2', text: '#DC2626' },
  PARTIAL: { label: 'Partial', bg: '#FFF7ED', text: '#D97706' },
  REFUNDED: { label: 'Refunded', bg: '#EEF2FF', text: '#4F46E5' },
};

export const BILL_STATUS: Record<string, StatusStyle> = {
  DRAFT: { label: 'Draft', bg: '#F3F4F6', text: '#6B7280' },
  PROCESSED: { label: 'Processed', bg: '#ECFDF5', text: '#059669' },
  FLAGGED: { label: 'Flagged', bg: '#FFF1F2', text: '#DC2626' },
};
