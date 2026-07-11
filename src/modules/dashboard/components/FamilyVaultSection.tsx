import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SectionHeader } from '../../../components/common/SectionHeader';

export const FamilyVaultSection = () => (
  <>
    <SectionHeader title="Family Vault" />
    <View style={[styles.card, styles.familyVaultRow]}>
      <View style={styles.familyAvatars}>
        {['A', 'B', 'C', 'D'].map((letter, i) => (
          <View key={i} style={[styles.familyAvatar, { marginLeft: i > 0 ? -10 : 0, zIndex: 4 - i }]}>
            <Text style={styles.familyAvatarText}>{letter}</Text>
          </View>
        ))}
        <Text style={styles.familyMembersText}>4 Members</Text>
      </View>
      <View style={styles.familyShared}>
        <Text style={styles.familySharedCount}>35</Text>
        <Text style={styles.familySharedLabel}>Shared</Text>
      </View>
      <TouchableOpacity style={styles.familyBtn}>
        <Text style={styles.familyBtnText}>All →</Text>
      </TouchableOpacity>
    </View>
  </>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 6, elevation: 2,
  },
  familyVaultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  familyAvatars: { flexDirection: 'row', alignItems: 'center' },
  familyAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#4B65E4', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  familyAvatarText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  familyMembersText: { fontSize: 12, color: '#666', marginLeft: 8 },
  familyShared: { alignItems: 'center' },
  familySharedCount: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  familySharedLabel: { fontSize: 11, color: '#999' },
  familyBtn: {
    backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  familyBtnText: { fontSize: 13, fontWeight: '600', color: '#4B65E4' },
});
