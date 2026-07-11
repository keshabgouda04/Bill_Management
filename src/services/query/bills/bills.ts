import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import { queryOptions, useQuery } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED' | 'OVERDUE';
export type BillStatus = 'DRAFT' | 'PROCESSED' | 'FLAGGED';

export interface Bill {
  id: string;
  invoice_number: string;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  bill_status: BillStatus;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

interface BillsResponse {
  success: boolean;
  message: string;
  data: {
    bills: Bill[];
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const fetchBills = async (): Promise<BillsResponse> => {
  return api.get<BillsResponse>(API_URL.BILLS.LIST);
};

// ─── Query ────────────────────────────────────────────────────────────────────

export const useBillsQueryOptions = () =>
  queryOptions({
    queryKey: ['bills'],
    queryFn: fetchBills,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

export const useGetBills = () => useQuery(useBillsQueryOptions());
