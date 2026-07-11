import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateBillPayload {
  merchant_id?: string | null;
  category_id?: string | null;
  invoice_number?: string;
  purchase_date?: string; // ISO String
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
  bill_status?: string;
  warranty_until?: string; // ISO String
  purchase_location?: string;
  notes?: string;
}

interface CreateBillResponse {
  success: boolean;
  message: string;
  data: {
    bill: any;
  };
}

export const postCreateBill = async (data: CreateBillPayload): Promise<CreateBillResponse> => {
  return api.post<CreateBillResponse>(API_URL.BILLS.CREATE, data);
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCreateBill,
    onSuccess: () => {
      // Invalidate and refetch the bills lists
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
};
