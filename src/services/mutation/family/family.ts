import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../helper/axiosConfig';
import { API_URL } from '../../../constants/apiEndpoints';
import { FamilyRole } from '../../query/family/family';

// ── Create Family ────────────────────────────────────────────────────────────
export const useCreateFamily = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (family_name: string) => {
      const response = await api.post(API_URL.FAMILY.CREATE, { name: family_name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
    },
  });
};

// ── Delete Family ────────────────────────────────────────────────────────────
export const useDeleteFamily = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete(API_URL.FAMILY.DELETE);
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['family'], null);
      queryClient.setQueryData(['family', 'members'], null);
      queryClient.removeQueries({ queryKey: ['family'] });
    },
  });
};

// ── Invite Member ────────────────────────────────────────────────────────────
export const useInviteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; role: FamilyRole }) => {
      const response = await api.post(API_URL.FAMILY.INVITE, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
    },
  });
};

// ── Accept Invitation ────────────────────────────────────────────────────────
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await api.post(API_URL.FAMILY.ACCEPT_INVITE(memberId));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
      queryClient.invalidateQueries({ queryKey: ['family', 'invitations'] });
    },
  });
};

// ── Reject Invitation ────────────────────────────────────────────────────────
export const useRejectInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await api.post(API_URL.FAMILY.REJECT_INVITE(memberId));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'invitations'] });
    },
  });
};

// ── Cancel Invitation (Owner) ────────────────────────────────────────────────
export const useCancelInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await api.delete(API_URL.FAMILY.CANCEL_INVITE(invitationId));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
    },
  });
};

// ── Change Role ──────────────────────────────────────────────────────────────
export const useChangeRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: FamilyRole }) => {
      const response = await api.patch(API_URL.FAMILY.CHANGE_ROLE(memberId), { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
    },
  });
};

// ── Remove Member ────────────────────────────────────────────────────────────
export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await api.delete(API_URL.FAMILY.REMOVE_MEMBER(memberId));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
    },
  });
};
