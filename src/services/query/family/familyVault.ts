import { useQuery } from '@tanstack/react-query';
import { api } from '../../../helper/axiosConfig';
import { API_URL } from '../../../constants/apiEndpoints';

export interface SharedVaultBill {
  id: string; // ID of the shared bill record in vault
  bill_id: string;
  family_id: string;
  shared_by: string;
  visibility_type: 'ALL' | 'SELECTIVE';
  created_at: string;
  updated_at?: string;
  bills?: {
    id: string;
    total_amount?: number;
    amount?: number;
    merchant_name?: string;
    merchant_id?: string;
    bill_date?: string;
    due_date?: string;
    payment_status?: string;
    category?: string;
    file_url?: string;
    notes?: string;
    user_id?: string;
    [key: string]: any;
  };
  shared_by_user?: {
    id?: string;
    full_name?: string;
    email?: string;
  };
  shared_with_emails?: string[];
}

/**
 * Fetch all shared bills in the Family Vault accessible to the user.
 * Uses GET /api/v1/family/vault
 */
export const fetchVaultBills = async (): Promise<SharedVaultBill[]> => {
  const response: any = await api.get(API_URL.FAMILY.VAULT);
  const list =
    response?.bills ||
    response?.data?.bills ||
    response?.data?.data ||
    response?.data ||
    response;
  return Array.isArray(list) ? list : [];
};

/**
 * Fetch specific shared bill details from the Family Vault.
 * Uses GET /api/v1/family/vault/:sharedBillId
 */
export const fetchVaultBillDetail = async (sharedBillId: string): Promise<SharedVaultBill | null> => {
  const response: any = await api.get(API_URL.FAMILY.VAULT_DETAIL(sharedBillId));
  return response?.sharedBill || response?.data?.sharedBill || response?.data || response;
};

/**
 * TanStack Query Hook to fetch shared family vault bills list.
 */
export const useGetVaultBills = () => {
  return useQuery({
    queryKey: ['familyVault'],
    queryFn: () => fetchVaultBills(),
    staleTime: 1000 * 60,
    refetchOnMount: 'always',
  });
};

/**
 * TanStack Query Hook to fetch a single shared family vault bill.
 */
export const useGetVaultBillDetail = (sharedBillId: string) => {
  return useQuery({
    queryKey: ['familyVault', sharedBillId],
    queryFn: () => fetchVaultBillDetail(sharedBillId),
    enabled: Boolean(sharedBillId),
    staleTime: 1000 * 60,
  });
};
