import { useState } from 'react';
import { Alert } from 'react-native';
import { useGetProfileDetails } from '../../../services/query/profile/profile';
import { 
  useGetMembers, 
  useGetPendingInvitations,
  useAcceptInvitation, 
  useRejectInvitation, 
  useRemoveMember,
  useDeleteFamily,
  FamilyDetails,
  FamilyMember,
  FamilyRole
} from '../api/familyApi';

export function useFamilyDashboard(family: FamilyDetails) {
  const { data: profileData } = useGetProfileDetails();
  const currentUserId = profileData?.profile?.id;
  const isOwner = currentUserId === family.owner_id;

  // React Query Fetch Members
  const { data: membersData, isLoading, isError, refetch } = useGetMembers();
  const members = Array.isArray(membersData) 
    ? membersData 
    : membersData?.data?.members || membersData?.members || membersData?.data || [];
  const owner = membersData?.data?.owner || membersData?.owner;

  // React Query Incoming Invitations for current logged-in user
  const { data: rawIncomingInvitations, refetch: refetchIncoming } = useGetPendingInvitations();
  const rawIncoming = rawIncomingInvitations as any;
  const incomingInvitations = Array.isArray(rawIncoming)
    ? rawIncoming
    : rawIncoming?.data?.invitations || rawIncoming?.invitations || rawIncoming?.data || [];

  // Mutations
  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();
  const removeMemberMutation = useRemoveMember();

  // Modal / Selection State
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [updateRoleModalVisible, setUpdateRoleModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
    role: FamilyRole;
  } | null>(null);

  // Group members by status/roles (default status to ACTIVE if missing in backend data)
  const activeMembers = members.filter((m: FamilyMember) => (!m.status || m.status === 'ACTIVE') && m.user_id !== family.owner_id);
  const pendingInvites = members.filter((m: FamilyMember) => m.status === 'PENDING');
  const rejectedMembers = members.filter((m: FamilyMember) => m.status === 'REJECTED');

  const ownerMember: FamilyMember | undefined = owner ? {
    id: 'owner',
    family_id: family.id,
    user_id: owner.id,
    role: 'ADMIN',
    status: 'ACTIVE',
    joined_at: family.created_at,
    created_at: family.created_at,
    updated_at: family.created_at,
    profiles: {
      id: owner.id,
      full_name: owner.full_name,
      email: owner.email,
      avatar_url: owner.avatar_url,
    }
  } : undefined;

  // Handlers
  const handleAccept = (memberId: string) => {
    Alert.alert('Accept Invitation', 'Do you want to join this family workspace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          acceptMutation.mutate(memberId, {
            onError: (error: any) => {
              const errMsg = error?.response?.data?.message || error.message || 'Failed to accept invitation.';
              Alert.alert('Error', errMsg);
            },
            onSuccess: (data: any) => {
              if (data.success) {
                Alert.alert('Joined!', 'You have successfully joined the family.');
                refetch();
              } else {
                Alert.alert('Error', data.message || 'Could not accept invitation.');
              }
            },
          });
        },
      },
    ]);
  };

  const handleReject = (memberId: string) => {
    Alert.alert('Reject Invitation', 'Are you sure you want to decline this invitation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          rejectMutation.mutate(memberId, {
            onError: (error: any) => {
              const errMsg = error?.response?.data?.message || error.message || 'Failed to reject invitation.';
              Alert.alert('Error', errMsg);
            },
            onSuccess: (data: any) => {
              if (data.success) {
                Alert.alert('Declined', 'Invitation declined successfully.');
                refetch();
              } else {
                Alert.alert('Error', data.message || 'Could not decline invitation.');
              }
            },
          });
        },
      },
    ]);
  };

  const handleRemove = (member: FamilyMember) => {
    const memberName = member.profiles?.full_name || 'Member';
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from this family group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeMemberMutation.mutate(member.id, {
              onError: (error: any) => {
                const errMsg = error?.response?.data?.message || error.message || 'Failed to remove member.';
                Alert.alert('Error', errMsg);
              },
              onSuccess: (data: any) => {
                if (data.success) {
                  Alert.alert('Removed', `${memberName} has been removed.`);
                  refetch();
                } else {
                  Alert.alert('Error', data.message || 'Could not remove member.');
                }
              },
            });
          },
        },
      ]
    );
  };

  const handleUpdateRole = (member: FamilyMember) => {
    const memberName = member.profiles?.full_name || 'Member';
    setSelectedMember({
      id: member.id,
      name: memberName,
      role: member.role,
    });
    setUpdateRoleModalVisible(true);
  };

  const deleteMutation = useDeleteFamily();

  const handleDeleteFamily = () => {
    Alert.alert(
      'Delete Family',
      'Are you sure you want to delete this family? This action cannot be undone and will permanently remove all members.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(undefined, {
              onSuccess: () => {
                Alert.alert('Success', 'Family deleted successfully.');
              },
              onError: (error: any) => {
                const msg = error?.response?.data?.message || 'Failed to delete family.';
                Alert.alert('Error', msg);
              }
            });
          }
        }
      ]
    );
  };

  return {
    state: {
      currentUserId,
      isOwner,
      members,
      activeMembers,
      pendingInvites,
      rejectedMembers,
      incomingInvitations,
      ownerMember,
      isLoading,
      isError,
      inviteModalVisible,
      updateRoleModalVisible,
      selectedMember,
      isDeleting: deleteMutation.isPending,
    },
    actions: {
      refetch: () => {
        refetch();
        refetchIncoming();
      },
      setInviteModalVisible,
      setUpdateRoleModalVisible,
      setSelectedMember,
      handleAccept,
      handleReject,
      handleRemove,
      handleUpdateRole,
      handleDeleteFamily,
    }
  };
}
