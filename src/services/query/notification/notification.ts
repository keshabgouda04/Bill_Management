import { useQuery, useInfiniteQuery, queryOptions } from '@tanstack/react-query';
import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  body?: string;
  type?: string;
  payload?: any;
  data?: any;
  is_read: boolean;
  read_at?: string | null;
  push_status?: 'SENT' | 'FAILED' | string;
  push_sent_at?: string | null;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

/**
 * Fetch In-App Notifications Inbox.
 * Uses GET /api/v1/notifications?limit=20&offset=0
 */
export const fetchNotifications = async (limit = 20, offset = 0): Promise<NotificationItem[]> => {
  const response: any = await api.get(API_URL.NOTIFICATIONS.LIST, {
    params: { limit, offset },
  });
  const list =
    response?.notifications ||
    response?.data?.notifications ||
    response?.data?.data ||
    response?.data ||
    response;
  return Array.isArray(list) ? list : [];
};

/**
 * TanStack Query options for fetching notifications.
 */
export const useNotificationsQueryOptions = (limit = 20, offset = 0) =>
  queryOptions({
    queryKey: ['notifications', limit, offset],
    queryFn: () => fetchNotifications(limit, offset),
    staleTime: 1000 * 60,
    refetchOnMount: 'always',
  });

/**
 * TanStack Query Hook to fetch in-app notifications.
 */
export const useGetNotifications = (limit = 20, offset = 0) => {
  return useQuery(useNotificationsQueryOptions(limit, offset));
};

/**
 * TanStack Infinite Query Hook for paginated inbox notification scrolling.
 */
export const useGetNotificationsInfinite = (limit = 20) => {
  return useInfiniteQuery<NotificationItem[]>({
    queryKey: ['notifications', 'infinite', limit],
    queryFn: ({ pageParam = 0 }) => fetchNotifications(limit, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    staleTime: 1000 * 60,
  });
};
