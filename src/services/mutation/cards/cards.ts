import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../helper/axiosConfig';
import { API_URL } from '../../../constants/apiEndpoints';
import {
  CreateVisitingCardPayload,
  UpdateVisitingCardPayload,
  VisitingCard,
} from '../../../modules/cards/types/cardTypes';

const isUUID = (id: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

export const useCreateVisitingCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateVisitingCardPayload): Promise<VisitingCard> => {
      try {
        console.log('[DEBUG Cards Mutation] Creating Visiting Card payload:', payload);
        const response = await api.post<any>(API_URL.VISITING_CARDS.CREATE, payload);
        console.log('[DEBUG Cards Mutation] Create Card API Response:', response?.data);
        return response.data?.data || response.data;
      } catch (error: any) {
        console.error('[DEBUG Cards Mutation ERROR] Create card error:', error?.response?.data || error?.message || error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('[DEBUG Cards Mutation SUCCESS] Invalidation triggered for created card:', data);
      queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
    },
  });
};

export const useUpdateVisitingCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateVisitingCardPayload;
    }): Promise<VisitingCard> => {
      try {
        console.log('[DEBUG Cards Mutation] Updating Visiting Card ID:', id, 'Payload:', payload);
        const response = await api.patch<any>(API_URL.VISITING_CARDS.UPDATE(id), payload);
        console.log('[DEBUG Cards Mutation] Update Card API Response:', response?.data);
        return response.data?.data || response.data;
      } catch (error: any) {
        console.error('[DEBUG Cards Mutation ERROR] Update card error:', error?.response?.data || error?.message || error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      console.log('[DEBUG Cards Mutation SUCCESS] Updated card ID:', variables.id);
      queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
      queryClient.invalidateQueries({ queryKey: ['visiting-card-detail', variables.id] });
    },
  });
};

export const useDeleteVisitingCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      try {
        console.log('[DEBUG Cards Mutation] Deleting Visiting Card ID:', id);
        if (isUUID(id)) {
          const response = await api.delete(API_URL.VISITING_CARDS.DELETE(id));
          console.log('[DEBUG Cards Mutation] Delete Card API Response:', response?.data);
        }
        return true;
      } catch (error: any) {
        console.error('[DEBUG Cards Mutation ERROR] Delete card error:', error?.response?.data || error?.message || error);
        throw error;
      }
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['visiting-cards'] });
      const previousCards = queryClient.getQueryData<VisitingCard[]>(['visiting-cards']);

      queryClient.setQueryData<VisitingCard[]>(['visiting-cards'], (oldCards) =>
        oldCards ? oldCards.filter((card) => card.id !== deletedId) : []
      );

      return { previousCards };
    },
    onError: (err, deletedId, context: any) => {
      if (context?.previousCards) {
        queryClient.setQueryData(['visiting-cards'], context.previousCards);
      }
    },
    onSettled: () => {
      console.log('[DEBUG Cards Mutation SUCCESS] Invalidation triggered post delete');
      queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
    },
  });
};

export const useUploadCardPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: { uri: string; name?: string; type?: string } }): Promise<VisitingCard> => {
      const formData = new FormData();
      formData.append('photo', {
        uri: file.uri,
        name: file.name || 'photo.jpg',
        type: file.type || 'image/jpeg',
      } as any);

      console.log('📤 [UPLOAD CARD PHOTO] Uploading photo for card ID:', id);
      const response = await api.post<any>(API_URL.VISITING_CARDS.UPLOAD_PHOTO(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data || response.data;
    },
    onSuccess: (_, variables) => {
      console.log('✅ [UPLOAD CARD PHOTO SUCCESS] Card ID:', variables.id);
      queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
      queryClient.invalidateQueries({ queryKey: ['visiting-card-detail', variables.id] });
    },
  });
};

export const useDeleteCardPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<VisitingCard> => {
      console.log('🗑️ [DELETE CARD PHOTO] Removing photo for card ID:', id);
      const response = await api.delete<any>(API_URL.VISITING_CARDS.DELETE_PHOTO(id));
      return response.data?.data || response.data;
    },
    onSuccess: (_, id) => {
      console.log('✅ [DELETE CARD PHOTO SUCCESS] Card ID:', id);
      queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
      queryClient.invalidateQueries({ queryKey: ['visiting-card-detail', id] });
    },
  });
};

export const useUploadCardLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: { uri: string; name?: string; type?: string } }): Promise<VisitingCard> => {
      const formData = new FormData();
      formData.append('logo', {
        uri: file.uri,
        name: file.name || 'logo.jpg',
        type: file.type || 'image/jpeg',
      } as any);

      console.log('📤 [UPLOAD CARD LOGO] Uploading logo for card ID:', id);
      const response = await api.post<any>(API_URL.VISITING_CARDS.UPLOAD_LOGO(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data || response.data;
    },
    onSuccess: (_, variables) => {
      console.log('✅ [UPLOAD CARD LOGO SUCCESS] Card ID:', variables.id);
      queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
      queryClient.invalidateQueries({ queryKey: ['visiting-card-detail', variables.id] });
    },
  });
};

export const useDeleteCardLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<VisitingCard> => {
      console.log('🗑️ [DELETE CARD LOGO] Removing logo for card ID:', id);
      const response = await api.delete<any>(API_URL.VISITING_CARDS.DELETE_LOGO(id));
      return response.data?.data || response.data;
    },
    onSuccess: (_, id) => {
      console.log('✅ [DELETE CARD LOGO SUCCESS] Card ID:', id);
      queryClient.invalidateQueries({ queryKey: ['visiting-cards'] });
      queryClient.invalidateQueries({ queryKey: ['visiting-card-detail', id] });
    },
  });
};
