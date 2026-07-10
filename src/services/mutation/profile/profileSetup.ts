import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UpdateProfilePayload {
  full_name?: string;
  avatar_url?: string;
  country?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  gender?: string;
  phone?: string;
  email?: string;
}

export const patchProfileDetails = async (data: UpdateProfilePayload) => {
  const response = await api.patch(API_URL.USER.PROFILE, data);
  return response.data;
};

export const useUpdateProfileDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchProfileDetails,
    onSuccess: () => {
      // Invalidate and refetch the profile after a successful update
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
