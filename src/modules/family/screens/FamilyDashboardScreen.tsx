import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FamilyDetails } from '../api/familyApi';
import { useFamilyDashboard } from '../hooks/useFamilyDashboard';
import InviteMemberModal from '../components/InviteMemberModal';
import UpdateRoleModal from '../components/UpdateRoleModal';
import FamilyMemberRow from '../components/FamilyMemberRow';
import PendingInvitationCard from '../components/PendingInvitationCard';

interface FamilyDashboardScreenProps {
  family: FamilyDetails;
  onBack: () => void;
}

export default function FamilyDashboardScreen({ family, onBack }: FamilyDashboardScreenProps) {
  const { state, actions } = useFamilyDashboard(family);
  const {
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
  } = state;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{family?.name || family?.family_name || 'Family Workspace'}</Text>
          <Text style={styles.headerSubtitle}>Family Workspace</Text>
        </View>
        {isOwner ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => actions.setInviteModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={20} color="#4B65E4" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Main Body */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4B65E4" />
          <Text style={styles.loadingText}>Fetching members list...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline" size={50} color="#BBB" />
          <Text style={styles.errorText}>Could not load family members.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => actions.refetch()} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Family Card */}
          {(() => {
            const totalCount = (ownerMember ? 1 : 0) + activeMembers.length;
            const displayName = family?.name || family?.family_name || 'Family Workspace';
            return (
              <View style={styles.infoCard}>
                <Ionicons name="people" size={32} color="#4B65E4" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoTitle}>{displayName}</Text>
                  <Text style={styles.infoMembersCount}>
                    {totalCount} {totalCount === 1 ? 'Member' : 'Members'} in workspace
                  </Text>
                </View>
              </View>
            );
          })()}

          {/* Owner Section */}
          <Text style={styles.sectionHeader}>WORKSPACE OWNER</Text>
          {ownerMember ? (
            <FamilyMemberRow
              member={ownerMember}
              isOwnerRow={true}
              isMe={ownerMember.user_id === currentUserId}
              isOwner={isOwner}
              onUpdateRole={actions.handleUpdateRole}
              onRemove={actions.handleRemove}
              onAccept={actions.handleAccept}
              onReject={actions.handleReject}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Owner details unavailable.</Text>
            </View>
          )}

          {/* Active Members Section */}
          <Text style={styles.sectionHeader}>ACTIVE MEMBERS</Text>
          {activeMembers.length > 0 ? (
            activeMembers.map((m: any) => (
              <FamilyMemberRow
                key={m.id}
                member={m}
                isMe={m.user_id === currentUserId}
                isOwner={isOwner}
                onUpdateRole={actions.handleUpdateRole}
                onRemove={actions.handleRemove}
                onAccept={actions.handleAccept}
                onReject={actions.handleReject}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active members in this family yet.</Text>
            </View>
          )}

          {/* Pending Outgoing Invitations Section */}
          {pendingInvites.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>OUTGOING INVITATIONS</Text>
              {pendingInvites.map((m: any) => (
                <FamilyMemberRow
                  key={m.id}
                  member={m}
                  isMe={m.user_id === currentUserId}
                  isOwner={isOwner}
                  onUpdateRole={actions.handleUpdateRole}
                  onRemove={actions.handleRemove}
                  onAccept={actions.handleAccept}
                  onReject={actions.handleReject}
                />
              ))}
            </>
          )}

          {/* Incoming Invitations from other families */}
          {incomingInvitations && incomingInvitations.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>INCOMING INVITATIONS ({incomingInvitations.length})</Text>
              {incomingInvitations.map((invite: any) => (
                <PendingInvitationCard
                  key={invite.id || invite.token}
                  invite={invite}
                  onAccept={actions.handleAccept}
                  onReject={actions.handleReject}
                />
              ))}
            </>
          )}

          {/* Rejected Section */}
          {rejectedMembers.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>DECLINED INVITATIONS</Text>
              {rejectedMembers.map((m: any) => (
                <FamilyMemberRow
                  key={m.id}
                  member={m}
                  isMe={m.user_id === currentUserId}
                  isOwner={isOwner}
                  onUpdateRole={actions.handleUpdateRole}
                  onRemove={actions.handleRemove}
                  onAccept={actions.handleAccept}
                  onReject={actions.handleReject}
                />
              ))}
            </>
          )}

          {isOwner && (
            <TouchableOpacity 
              style={[styles.deleteFamilyBtn, state.isDeleting && styles.deleteFamilyBtnDisabled]} 
              onPress={actions.handleDeleteFamily}
              disabled={state.isDeleting}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteFamilyBtnText}>
                {state.isDeleting ? 'Deleting...' : 'Delete Family'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Invite Modal Overlay */}
      <InviteMemberModal
        visible={inviteModalVisible}
        onClose={() => {
          actions.setInviteModalVisible(false);
          actions.refetch();
        }}
      />

      {/* Update Role Modal Overlay */}
      {selectedMember && (
        <UpdateRoleModal
          visible={updateRoleModalVisible}
          onClose={() => {
            actions.setUpdateRoleModalVisible(false);
            actions.setSelectedMember(null);
            actions.refetch();
          }}
          memberId={selectedMember.id}
          memberName={selectedMember.name}
          currentRole={selectedMember.role}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4B65E4',
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  infoIcon: {
    marginRight: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  infoMembersCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#999',
    fontSize: 13,
  },
  deleteFamilyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FFD6D6',
    gap: 8,
  },
  deleteFamilyBtnDisabled: { opacity: 0.6 },
  deleteFamilyBtnText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
  },
  incomingInviteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  incomingInviteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  incomingInviteSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  incomingAcceptBtn: {
    backgroundColor: '#4B65E4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  incomingAcceptText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  incomingRejectBtn: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  incomingRejectText: {
    color: '#FF4444',
    fontWeight: '700',
    fontSize: 13,
  },
});
