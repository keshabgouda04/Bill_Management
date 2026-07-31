import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FamilyMember, FamilyRole } from '../api/familyApi';

interface FamilyMemberRowProps {
  member: FamilyMember;
  isOwnerRow?: boolean;
  isMe: boolean;
  isOwner: boolean;
  onUpdateRole: (member: FamilyMember) => void;
  onRemove: (member: FamilyMember) => void;
  onAccept: (memberId: string) => void;
  onReject: (memberId: string) => void;
}

export default function FamilyMemberRow({
  member,
  isOwnerRow = false,
  isMe,
  isOwner,
  onUpdateRole,
  onRemove,
  onAccept,
  onReject,
}: FamilyMemberRowProps) {
  const name = member.profiles?.full_name || 'Unknown User';
  const email = member.profiles?.email || 'No email';
  const avatar = member.profiles?.avatar_url;

  const getRoleColor = (role: FamilyRole) => {
    if (role === 'ADMIN') return { bg: '#EEF2FF', text: '#4B65E4' };
    if (role === 'MEMBER') return { bg: '#ECFDF5', text: '#10B981' };
    return { bg: '#F3F4F6', text: '#4B5563' }; // VIEWER
  };

  const displayStatus = member.status || 'ACTIVE';

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return { bg: '#DEF7EC', text: '#03543F' };
    if (status === 'PENDING') return { bg: '#FEF08A', text: '#713F12' };
    return { bg: '#FDE8E8', text: '#9B1C1C' }; // REJECTED
  };

  const roleStyle = getRoleColor(member.role);
  const statusStyle = getStatusColor(displayStatus);

  return (
    <View style={styles.memberCard}>
      {/* User Avatar */}
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.memberInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.memberName} numberOfLines={1}>
            {name} {isMe ? '(You)' : ''}
          </Text>
          {isOwnerRow && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Owner</Text>
            </View>
          )}
        </View>
        <Text style={styles.memberEmail} numberOfLines={1}>
          {email}
        </Text>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: roleStyle.bg }]}>
            <Text style={[styles.badgeText, { color: roleStyle.text }]}>{member.role}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{displayStatus}</Text>
          </View>
        </View>
      </View>

      {/* Row Actions */}
      <View style={styles.actionsColumn}>
        {isOwner && !isOwnerRow && (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => onUpdateRole(member)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color="#4B65E4" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionIconBtn, { marginLeft: 8 }]}
              onPress={() => onRemove(member)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>
        )}

        {isMe && member.status === 'PENDING' && (
          <View style={styles.pendingActions}>
            <TouchableOpacity
              style={[styles.btnAction, styles.btnAccept]}
              onPress={() => onAccept(member.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnActionText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAction, styles.btnReject]}
              onPress={() => onReject(member.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnActionText, { color: '#FF4444' }]}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4B65E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    maxWidth: 150,
  },
  memberEmail: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ownerBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    borderWidth: 0.5,
    borderColor: '#4B65E4',
  },
  ownerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B65E4',
  },
  actionsColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAccept: {
    backgroundColor: '#4B65E4',
  },
  btnReject: {
    backgroundColor: '#FFF0F0',
    borderWidth: 0.5,
    borderColor: '#FF4444',
  },
  btnActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
