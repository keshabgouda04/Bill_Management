import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import type { BillDetail, BillStatus, PaymentStatus } from '../../query/bills/bills';

export interface UpdateBillPayload {
  invoice_number?: string;
  purchase_date?: string;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: PaymentStatus;
  bill_status?: BillStatus;
  warranty_until?: string | null;
  reminders?: Array<'30_DAYS' | '7_DAYS' | '1_DAY' | '1_HOUR'>;
  purchase_location?: string;
  notes?: string;
  category_id?: string | null;
  bill_items?: Array<{
    id?: string;
    item_name: string;
    description?: string | null;
    quantity: number;
    unit_price: number;
    tax_amount?: number;
    total_price?: number;
    serial_number?: string | null;
    warranty_months?: number | null;
  }>;
}

interface UpdateBillVariables {
  billId: string;
  data: UpdateBillPayload;
}

interface UpdateBillResponse {
  success: boolean;
  message: string;
  data: {
    bill: BillDetail;
  };
}

export const patchBill = async ({
  billId,
  data,
}: UpdateBillVariables): Promise<UpdateBillResponse> => {
  return api.patch<UpdateBillResponse>(`${API_URL.BILLS.DETAIL}/${billId}`, data);
};

export const useUpdateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchBill,
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bills', variables.billId] });
    },
  });
};
