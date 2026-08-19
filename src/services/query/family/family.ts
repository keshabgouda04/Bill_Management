import { useQuery } from '@tanstack/react-query';
import { api } from '../../../helper/axiosConfig';
import { API_URL } from '../../../constants/apiEndpoints';

export type FamilyRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type FamilyInviteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface FamilyDetails {
  id: string;
  name?: string;
  family_name?: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
  role?: FamilyRole;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: FamilyRole;
  status: FamilyInviteStatus | 'ACTIVE';
  joined_at: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface PendingInvitation {
  id: string;
  family_name?: string;
  invited_by?: string | { id?: string; full_name?: string; email?: string; name?: string };
  invited_by_email?: string;
  invited_by_name?: string;
  inviter_email?: string;
  inviter_name?: string;
  inviter?: {
    id?: string;
    full_name?: string;
    email?: string;
    name?: string;
  };
  email?: string;
  role: FamilyRole;
  status: FamilyInviteStatus;
}

// ── GET Family ──────────────────────────────────────────────────────────────
export const useGetFamily = () => {
  return useQuery({
    queryKey: ['family'],
    queryFn: async () => {
      try {
        const response: any = await api.get(API_URL.FAMILY.GET);
        
        // Handle { data: { family: {} } }, { family: {} }, or just the object itself
        const familyData = response?.data?.family || response?.data || response?.family || response;
        
        // A valid family MUST have an ID. If there's no ID, or it's an error object, treat as null.
        if (!familyData || !familyData.id) {
          return null;
        }
        
        return familyData;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },
    refetchOnMount: 'always',
  });
};

// ── GET Members ──────────────────────────────────────────────────────────────
export const useGetMembers = () => {
  return useQuery({
    queryKey: ['family', 'members'],
    queryFn: async () => {
      try {
        const response: any = await api.get(API_URL.FAMILY.MEMBERS);
        return response;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return { data: { members: [], owner: null } };
        }
        throw error;
      }
    },
    refetchOnMount: 'always',
  });
};

// ── GET Pending Invitations ──────────────────────────────────────────────────
export const useGetPendingInvitations = () => {
  return useQuery({
    queryKey: ['family', 'invitations'],
    queryFn: async () => {
      try {
        const response: any = await api.get(API_URL.FAMILY.INVITATIONS);
        const list = Array.isArray(response)
          ? response
          : response?.data?.invitations || response?.invitations || response?.data || response?.items || [];
        return Array.isArray(list) ? list : [];
      } catch (error: any) {
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    refetchOnMount: 'always',
  });
};



