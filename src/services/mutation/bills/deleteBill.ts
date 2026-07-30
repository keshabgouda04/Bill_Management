import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeleteBillResponse {
  success: boolean;
  message: string;
}

export const deleteBillById = async (billId: string): Promise<DeleteBillResponse> => {
  return api.delete<DeleteBillResponse>(`${API_URL.BILLS.DETAIL}/${billId}`);
};

export const useDeleteBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBillById,
    onSuccess: (_data, billId) => {
      // Remove the deleted bill's detail from cache so it doesn't trigger a 404 refetch
      queryClient.removeQueries({ queryKey: ['bills', billId] });
      // Invalidate all bill lists (infinite, filtered, etc.) so they refresh without the deleted bill
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
};
