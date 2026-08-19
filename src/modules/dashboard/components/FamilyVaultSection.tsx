import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { useGetFamily, useGetMembers } from '../../family/api/familyApi';

interface FamilyVaultSectionProps {
  onPress?: () => void;
}

export const FamilyVaultSection = ({ onPress }: FamilyVaultSectionProps) => {
  const { data: family, isLoading: loadingFamily } = useGetFamily();
  const { data: membersData } = useGetMembers();

  const familyName = family?.name || family?.family_name || 'Family Vault';

  const membersList = Array.isArray(membersData)
    ? membersData
    : membersData?.data?.members || membersData?.members || membersData?.data || [];

  const owner = membersData?.data?.owner || membersData?.owner;

  // Build list of display members (owner + members)
  const displayMembers: any[] = [];
  if (owner) {
    displayMembers.push({
      id: owner.id,
      name: owner.full_name || owner.email || 'Owner',
      avatar: owner.avatar_url,
    });
  }
  membersList.forEach((m: any) => {
    const prof = m.profiles || {};
    if (m.user_id !== family?.owner_id) {
      displayMembers.push({
        id: m.id || m.user_id,
        name: prof.full_name || prof.email || 'Member',
        avatar: prof.avatar_url,
      });
    }
  });

  const totalMembers = displayMembers.length || (family ? 1 : 0);

  return (
    <>
      <SectionHeader title={familyName} />
      <View style={[styles.card, styles.familyVaultRow]}>
        {loadingFamily ? (
          <ActivityIndicator color="#4B65E4" style={{ padding: 8 }} />
        ) : !family ? (
          <View style={styles.noFamilyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.noFamilyTitle}>No Family Workspace</Text>
              <Text style={styles.noFamilySub}>Create or join a family to share bills</Text>
            </View>
            <TouchableOpacity style={styles.familyBtn} onPress={onPress}>
              <Text style={styles.familyBtnText}>Create +</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.familyAvatars}>
              {displayMembers.slice(0, 4).map((m, i) => (
                <View key={m.id || i} style={[styles.familyAvatar, { marginLeft: i > 0 ? -10 : 0, zIndex: 4 - i }]}>
                  {m.avatar ? (
                    <Image source={{ uri: m.avatar }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.familyAvatarText}>
                      {(m.name || 'M').charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
              ))}
              <Text style={styles.familyMembersText}>
                {totalMembers} {totalMembers === 1 ? 'Member' : 'Members'}
              </Text>
            </View>

            <TouchableOpacity style={styles.familyBtn} onPress={onPress}>
              <Text style={styles.familyBtnText}>View →</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 6, elevation: 2,
  },
  familyVaultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noFamilyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  noFamilyTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  noFamilySub: { fontSize: 12, color: '#888', marginTop: 2 },
  familyAvatars: { flexDirection: 'row', alignItems: 'center' },
  familyAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#4B65E4', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF', overflow: 'hidden',
  },
  avatarImg: { width: 32, height: 32, borderRadius: 16 },
  familyAvatarText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  familyMembersText: { fontSize: 13, fontWeight: '600', color: '#666', marginLeft: 10 },
  familyBtn: {
    backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  familyBtnText: { fontSize: 13, fontWeight: '600', color: '#4B65E4' },
});
