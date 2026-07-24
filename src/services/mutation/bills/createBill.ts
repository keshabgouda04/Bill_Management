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
  warranty_until?: string | null; // ISO String
  purchase_location?: string;
  notes?: string;
  bill_items?: Array<{
    item_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    tax_amount?: number;
    serial_number?: string;
    warranty_months?: number;
  }>;
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

export const postCreateManualBill = async (formData: FormData): Promise<CreateBillResponse> => {
  return api.post<CreateBillResponse>(API_URL.BILLS.CREATE_MANUAL, formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
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

export const useCreateManualBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCreateManualBill,
    onSuccess: (response) => {
      const createdBill = response?.data?.bill;
      if (createdBill && createdBill.id) {
        queryClient.setQueryData(['bills', createdBill.id], {
          success: true,
          message: 'Bill fetched successfully',
          data: {
            bill: createdBill,
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
};
