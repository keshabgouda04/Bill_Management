import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AvatarUploadResponse {
  success: boolean;
  message: string;
  data: {
    profile: any;
  };
}

export const postUploadAvatar = async (formData: FormData): Promise<AvatarUploadResponse> => {
  return api.post<AvatarUploadResponse>(`${API_URL.USER.PROFILE}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUploadAvatar,
    onSuccess: (response) => {
      const updatedProfile = response?.data?.profile;
      if (updatedProfile) {
        queryClient.setQueryData(['profile'], {
          profile: updatedProfile,
        });
      }
    },
  });
};
