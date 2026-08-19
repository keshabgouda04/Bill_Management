import { useQuery } from '@tanstack/react-query';
import { api } from '../../../helper/axiosConfig';
import { API_URL } from '../../../constants/apiEndpoints';
import { VisitingCard } from '../../../modules/cards/types/cardTypes';

export const INITIAL_MOCK_CARDS: VisitingCard[] = [];

export interface GetVisitingCardsResponse {
  success?: boolean;
  message?: string;
  data: {
    cards: VisitingCard[];
    total: number;
  };
}

export const useGetVisitingCards = (params?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: ['visiting-cards', params],
    queryFn: async (): Promise<VisitingCard[]> => {
      try {
        console.log('[DEBUG Cards Query] Fetching visiting cards from API:', API_URL.VISITING_CARDS.LIST, 'Params:', params);
        const response: any = await api.get(
          API_URL.VISITING_CARDS.LIST,
          { params }
        );

        console.log('[DEBUG Cards Query] API Raw Response:', response);

        let cardsList: VisitingCard[] = [];
        const body = response?.data !== undefined ? response.data : response;

        if (Array.isArray(body)) {
          cardsList = body;
        } else if (body && typeof body === 'object') {
          const resData = body.data;
          if (Array.isArray(resData)) {
            cardsList = resData;
          } else if (resData && Array.isArray(resData.cards)) {
            cardsList = resData.cards;
          } else if (Array.isArray(body.cards)) {
            cardsList = body.cards;
          }
        }

        console.log('[DEBUG Cards Query] Successfully extracted cards count:', cardsList.length, cardsList);
        return cardsList;
      } catch (error: any) {
        console.error('[DEBUG Cards Query ERROR] Error fetching visiting cards:', error?.response?.data || error?.message || error);
        return INITIAL_MOCK_CARDS;
      }
    },
  });
};

export const useGetVisitingCardDetail = (id?: string) => {
  return useQuery({
    queryKey: ['visiting-card-detail', id],
    queryFn: async (): Promise<VisitingCard | null> => {
      if (!id) return null;
      try {
        const response = await api.get<any>(API_URL.VISITING_CARDS.DETAIL(id));
        return response.data?.data || response.data;
      } catch (error) {
        const localCard = INITIAL_MOCK_CARDS.find((c) => c.id === id);
        if (localCard) return localCard;
        throw error;
      }
    },
    enabled: !!id,
  });
};
