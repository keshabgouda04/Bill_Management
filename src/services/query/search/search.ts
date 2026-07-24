import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import { queryOptions, useQuery, infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import type { BillsResponse } from '../bills/bills';

export const searchBills = async (
  query: string,
  category?: string,
  payment_status?: string,
  page: number = 1,
  limit: number = 10
): Promise<BillsResponse> => {
  return api.get<BillsResponse>(API_URL.BILLS.SEARCH, {
    params: {
      q: query,
      category: category || undefined,
      payment_status: payment_status || undefined,
      page,
      limit,
    },
  });
};

// Standard query
export const useSearchBillsQueryOptions = (
  query: string,
  category?: string,
  payment_status?: string,
  page?: number,
  limit?: number
) =>
  queryOptions({
    queryKey: ['bills', 'search', query, category, payment_status, page, limit],
    queryFn: () => searchBills(query, category, payment_status, page, limit),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    enabled: Boolean(query && query.trim().length > 0),
  });

export const useSearchBills = (
  query: string,
  category?: string,
  payment_status?: string,
  page?: number,
  limit?: number
) =>
  useQuery(useSearchBillsQueryOptions(query, category, payment_status, page, limit));

// Infinite query
export const useSearchBillsInfiniteQueryOptions = (
  query: string,
  category?: string,
  payment_status?: string,
  limit: number = 10
) =>
  infiniteQueryOptions({
    queryKey: ['bills', 'search', 'infinite', query, category, payment_status, limit],
    queryFn: ({ pageParam }) => searchBills(query, category, payment_status, pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const pagination = (lastPage as any)?.data?.pagination;
      if (pagination) {
        return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
      }
      const billsCount = lastPage.data?.bills?.length || 0;
      return billsCount === limit ? lastPageParam + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
    enabled: Boolean(query && query.trim().length > 0),
  });

export const useSearchBillsInfinite = (
  query: string,
  category?: string,
  payment_status?: string,
  limit: number = 10
) =>
  useInfiniteQuery(useSearchBillsInfiniteQueryOptions(query, category, payment_status, limit));
