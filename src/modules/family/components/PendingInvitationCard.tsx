import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PendingInvitationCardProps {
  invite: any;
  onAccept: (idOrToken: string) => void;
  onReject: (idOrToken: string) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export default function PendingInvitationCard({
  invite,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: PendingInvitationCardProps) {
  // Extract Family Name
  const familyName = invite.family_groups?.name || invite.family_name || invite.family?.name || 'Family Vault';

  // Extract Inviter Profile Email (person who invited)
  const inviterEmail = (
    invite.family_groups?.profiles?.email ||
    (typeof invite.invited_by === 'object' && invite.invited_by !== null ? invite.invited_by.email : '') ||
    (typeof invite.inviter === 'object' && invite.inviter !== null ? invite.inviter.email : '') ||
    invite.invited_by_email ||
    invite.inviter_email ||
    invite.sender_email ||
    invite.owner_email ||
    (typeof invite.invited_by === 'string' && invite.invited_by.includes('@') ? invite.invited_by : '') ||
    (typeof invite.inviter === 'string' && invite.inviter.includes('@') ? invite.inviter : '')
  );
  // Extract Inviter Avatar URL
  const inviterAvatarUrl = (
    invite.family_groups?.profiles?.avatar_url ||
    invite.family_groups?.profiles?.avatar ||
    invite.invited_by?.avatar_url ||
    invite.inviter?.avatar_url ||
    invite.avatar_url
  );

  // Extract Inviter Name
  const inviterName = (
    invite.family_groups?.profiles?.full_name ||
    invite.family_groups?.profiles?.name ||
    (typeof invite.invited_by === 'object' && invite.invited_by !== null ? invite.invited_by.full_name || invite.invited_by.name : '') ||
    (typeof invite.inviter === 'object' && invite.inviter !== null ? invite.inviter.full_name || invite.inviter.name : '') ||
    invite.invited_by_name ||
    invite.inviter_name ||
    invite.sender_name
  );

  const role = invite.role || 'MEMBER';
  const inviteIdOrToken = invite.id || invite.token;
  const displayEmail = inviterEmail || 'No email provided';

  return (
    <View style={styles.card}>
      {/* Top Header: Logo Avatar + Family Name + Inviter Email */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.logoBadge}>
          {inviterAvatarUrl ? (
            <Image source={{ uri: inviterAvatarUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="mail" size={22} color="#4B65E4" />
          )}
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.familyName}>{familyName}</Text>
          <View style={styles.emailChip}>
            <Ionicons name="mail-outline" size={13} color="#4B65E4" style={{ marginRight: 4 }} />
            <Text style={styles.inviterEmailText}>{displayEmail}</Text>
          </View>
        </View>
      </View>

      {/* Details Row: Sender & Role */}
      <View style={styles.detailsContainer}>
        {inviterName ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Invited by: </Text>
            <Text style={styles.detailValue}>{inviterName}</Text>
          </View>
        ) : null}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Assigned Role: </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{role}</Text>
          </View>
        </View>
      </View>

      {/* Actions: Accept / Decline */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.btnAction, styles.btnAccept, (isAccepting || isRejecting) && styles.btnDisabled]}
          onPress={() => onAccept(inviteIdOrToken)}
          disabled={isAccepting || isRejecting}
          activeOpacity={0.8}
        >
          {isAccepting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.btnAcceptText}>Accept</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnAction, styles.btnReject, (isAccepting || isRejecting) && styles.btnDisabled]}
          onPress={() => onReject(inviteIdOrToken)}
          disabled={isAccepting || isRejecting}
          activeOpacity={0.8}
        >
          {isRejecting ? (
            <ActivityIndicator size="small" color="#FF4444" />
          ) : (
            <Text style={styles.btnRejectText}>Decline</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  headerTextCol: {
    flex: 1,
  },
  familyName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  emailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inviterEmailText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B65E4',
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  roleBadge: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B65E4',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnAction: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAccept: {
    backgroundColor: '#4B65E4',
  },
  btnReject: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnAcceptText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  btnRejectText: {
    color: '#FF4444',
    fontWeight: '700',
    fontSize: 14,
  },
});
