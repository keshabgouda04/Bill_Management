import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../helper/axiosConfig';
import { API_URL } from '../../../constants/apiEndpoints';

export interface ShareBillPayload {
  billId: string;
  visibilityType: 'ALL' | 'SELECTIVE';
  sharedWithEmails?: string[];
}

export interface UpdateVisibilityPayload {
  visibilityType: 'ALL' | 'SELECTIVE';
  sharedWithEmails?: string[];
}

/**
 * Share a bill to the Family Vault.
 * Uses POST /api/v1/family/vault
 */
export const shareBillToVault = async (payload: ShareBillPayload) => {
  const response = await api.post(API_URL.FAMILY.VAULT, payload);
  return response.data;
};

/**
 * Update visibility permissions for a bill already in the vault.
 * Uses PATCH /api/v1/family/vault/:sharedBillId/visibility
 */
export const updateVaultBillVisibility = async (
  sharedBillId: string,
  payload: UpdateVisibilityPayload
) => {
  const response = await api.patch(API_URL.FAMILY.VAULT_VISIBILITY(sharedBillId), payload);
  return response.data;
};

/**
 * Remove a bill from the Family Vault (Unshare).
 * Uses DELETE /api/v1/family/vault/:sharedBillId
 */
export const removeBillFromVault = async (sharedBillId: string) => {
  const response = await api.delete(API_URL.FAMILY.VAULT_DETAIL(sharedBillId));
  return response.data;
};

// ── TanStack Query Mutation Hooks ────────────────────────────────────────────

/**
 * Hook to share a personal bill into the family vault.
 */
export const useShareBillToVault = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShareBillPayload) => shareBillToVault(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyVault'] });
    },
  });
};

/**
 * Hook to update visibility settings of a shared vault bill.
 */
export const useUpdateVaultBillVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sharedBillId,
      payload,
    }: {
      sharedBillId: string;
      payload: UpdateVisibilityPayload;
    }) => updateVaultBillVisibility(sharedBillId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyVault'] });
    },
  });
};

/**
 * Hook to unshare / remove a bill from the family vault.
 */
export const useRemoveBillFromVault = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sharedBillId: string) => removeBillFromVault(sharedBillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyVault'] });
    },
  });
};
