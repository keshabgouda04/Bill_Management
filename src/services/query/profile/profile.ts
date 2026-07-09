import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import { queryOptions, useQuery } from '@tanstack/react-query';

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string;
  country: string | null;
  currency: string | null;
  language: string | null;
  timezone: string | null;
  gender: string | null;
  onboarding_completed: boolean;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: UserProfile;
  };
}

export const fetchProfileDetails = async () => {
  const response = await api.get<ProfileResponse>(API_URL.USER.PROFILE);
  return response.data;
};

export const useProfileDetailsQueryOptions = () => {
  return queryOptions({
    queryKey: ['profile'],
    queryFn: () => fetchProfileDetails(),
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });
};

export const useGetProfileDetails = () => {
  return useQuery(useProfileDetailsQueryOptions());
};


