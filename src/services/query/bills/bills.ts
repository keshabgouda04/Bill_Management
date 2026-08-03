import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import { queryOptions, useQuery, useInfiniteQuery } from '@tanstack/react-query';

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED';
export type BillStatus = 'DRAFT' | 'PROCESSED' | 'FLAGGED';

type Nullable<T> = T | null;

export interface BillItem {
  id: string;
  bill_id: string;
  item_name: string;
  description: Nullable<string>;
  quantity: number;
  unit_price: number;
  tax_amount: number;
  total_price: number;
  serial_number: Nullable<string>;
  warranty_months: Nullable<number>;
  created_at: string;
  updated_at: string;
}

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
  warranty_until?: Nullable<string>;
  reminders?: Array<'30_DAYS' | '7_DAYS' | '1_DAY' | '1_HOUR'>;
  purchase_location?: Nullable<string>;
  bill_items?: BillItem[];
  category_id?: Nullable<string>;
  photo_url?: Nullable<string>;
  image_url?: Nullable<string>;
  receipt_url?: Nullable<string>;
  file_url?: Nullable<string>;
  category?: Nullable<{
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
  }>;
}

export interface BillDetail extends Bill {
  merchant_id: Nullable<string>;
  category_id: Nullable<string>;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  payment_method: string;
  warranty_until: Nullable<string>;
  purchase_location: Nullable<string>;
  notes: Nullable<string>;
  ocr_status: Nullable<string>;
  ai_status: Nullable<string>;
  confidence_score: Nullable<number>;
  deleted_at?: Nullable<string>;
  user_id?: string;
  photo_url?: Nullable<string>;
  image_url?: Nullable<string>;
  receipt_url?: Nullable<string>;
  file_url?: Nullable<string>;
  document_url?: Nullable<string>;
  attachment_url?: Nullable<string>;
  original_file_url?: Nullable<string>;
  bill_image_url?: Nullable<string>;
  bill_photo_url?: Nullable<string>;
  bill_items?: BillItem[];
}

export interface Stats {
  activeWarrantyCount: number;
  activeCategoryCount: number;
  totalAmountSum?: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BillsResponse {
  success: boolean;
  message: string;
  data: {
    bills: Bill[];
    stats?: Stats;
    pagination?: Pagination;
  };
}

export interface BillDetailResponse {
  success: boolean;
  message: string;
  data: {
    bill: BillDetail;
  };
}

export const fetchBills = async (page: number = 1, limit: number = 10): Promise<BillsResponse> => {
  return api.get<BillsResponse>(API_URL.BILLS.LIST, {
    params: { page, limit },
  });
};

export const fetchBillById = async (
  billId: string,
): Promise<BillDetailResponse> => {
  return api.get<BillDetailResponse>(`${API_URL.BILLS.DETAIL}/${billId}`);
};

export const useBillsQueryOptions = (page: number = 1, limit: number = 10) =>
  queryOptions({
    queryKey: ['bills', 'list', page, limit],
    queryFn: () => fetchBills(page, limit),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

export const useBillDetailsQueryOptions = (billId: string) =>
  queryOptions({
    queryKey: ['bills', billId],
    queryFn: () => fetchBillById(billId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    enabled: Boolean(billId),
  });

export const useGetBills = (page: number = 1, limit: number = 10) =>
  useQuery(useBillsQueryOptions(page, limit));

export const useGetBillsInfinite = (limit: number = 10) =>
  useInfiniteQuery<BillsResponse>({
    queryKey: ['bills', 'list', 'infinite', limit],
    queryFn: ({ pageParam = 1 }) => fetchBills(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage: BillsResponse) => {
      const pagination = lastPage.data?.pagination;
      if (pagination && pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2,
  });

export const useGetBillDetails = (billId: string) => useQuery(useBillDetailsQueryOptions(billId));
