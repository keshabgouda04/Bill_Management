import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCreateFamily, useGetPendingInvitations, useAcceptInvitation, useRejectInvitation } from '../api/familyApi';
import PendingInvitationCard from '../components/PendingInvitationCard';

interface CreateFamilyScreenProps {
  onBack: () => void;
}

export default function CreateFamilyScreen({ onBack }: CreateFamilyScreenProps) {
  const [familyName, setFamilyName] = useState('');
  
  const createFamilyMutation = useCreateFamily();
  const acceptInviteMutation = useAcceptInvitation();
  const rejectInviteMutation = useRejectInvitation();
  
  const { data: rawPendingInvitations, isLoading: loadingInvites, isRefetching, refetch: refetchInvites } = useGetPendingInvitations();

  const rawData = rawPendingInvitations as any;
  const pendingInvitations = Array.isArray(rawData)
    ? rawData
    : rawData?.data?.invitations || rawData?.invitations || rawData?.data || [];

  console.log(pendingInvitations, "pendingInvitations");

  const handleCreate = () => {
    if (!familyName.trim()) {
      Alert.alert('Validation Error', 'Please enter a family name.');
      return;
    }
    
    createFamilyMutation.mutate(familyName, {
      onSuccess: () => {
        Alert.alert('Success', 'Family created successfully!');
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || 'Could not create family.';
        Alert.alert('Error', msg);
      }
    });
  };

  const handleAccept = (tokenOrId: string) => {
    acceptInviteMutation.mutate(tokenOrId, {
      onSuccess: () => Alert.alert('Success', 'You have joined the family!'),
      onError: (error: any) => {
        const msg = error?.response?.data?.message || error.message || 'Failed to accept invitation.';
        Alert.alert('Error', msg);
      }
    });
  };

  const handleReject = (tokenOrId: string) => {
    rejectInviteMutation.mutate(tokenOrId, {
      onSuccess: () => {
        Alert.alert('Declined', 'You have declined the invitation.');
        refetchInvites();
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || error.message || 'Failed to reject invitation.';
        Alert.alert('Error', msg);
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Share</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => refetchInvites()}>
          <Ionicons name="refresh" size={20} color="#4B65E4" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetchInvites} colors={['#4B65E4']} />
        }
      >
        {loadingInvites && !isRefetching ? (
          <ActivityIndicator size="large" color="#4B65E4" style={{ marginTop: 40 }} />
        ) : pendingInvitations && pendingInvitations.length > 0 ? (
          <View style={styles.invitesSection}>
            <Text style={styles.sectionHeader}>PENDING INVITATIONS ({pendingInvitations.length})</Text>
            {pendingInvitations.map((invite: any) => (
              <PendingInvitationCard
                key={invite.id || invite.token}
                invite={invite}
                onAccept={handleAccept}
                onReject={handleReject}
                isAccepting={acceptInviteMutation.isPending}
                isRejecting={rejectInviteMutation.isPending}
              />
            ))}
            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={20} color="#4B65E4" style={{ marginRight: 8 }} />
              <Text style={styles.noteText}>
                You must accept or decline pending invitation(s) before creating a new family workspace.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={40} color="#4B65E4" />
            </View>
            <Text style={styles.title}>Create Your Family</Text>
            <Text style={styles.subtitle}>
              Start a family workspace to manage, view, and share bills with your household members.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. The Smith Family"
              placeholderTextColor="#999"
              value={familyName}
              onChangeText={setFamilyName}
              maxLength={50}
            />

            <TouchableOpacity 
              style={[styles.createButton, createFamilyMutation.isPending && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={createFamilyMutation.isPending}
              activeOpacity={0.8}
            >
              {createFamilyMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.createButtonText}>Create Family</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#EAEAEA',
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F7FA',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  content: { flex: 1, padding: 20 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 24,
    alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  input: {
    width: '100%', height: 50, backgroundColor: '#F5F7FA',
    borderRadius: 10, paddingHorizontal: 16, fontSize: 16,
    color: '#1A1A1A', borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 20,
  },
  createButton: {
    width: '100%', height: 50, backgroundColor: '#4B65E4',
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  createButtonDisabled: { opacity: 0.7 },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  invitesSection: { marginTop: 10 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 1, marginBottom: 16 },
  emptyContainer: { padding: 20, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC' },
  emptyText: { color: '#999', fontSize: 14 },
  
  inviteCard: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: '#EAEAEA',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
  },
  logoBadge: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  headerTextCol: { flex: 1 },
  inviteFamilyName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  emailChip: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#F0F3FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  inviterEmailText: { fontSize: 13, fontWeight: '600', color: '#4B65E4' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#1A1A1A', fontWeight: '600' },
  roleBadge: {
    backgroundColor: '#F5F7FA', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4, borderWidth: 1, borderColor: '#EAEAEA',
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: '#4B65E4' },
  inviteActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  btnAction: { flex: 1, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnAccept: { backgroundColor: '#4B65E4' },
  btnReject: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FF4444' },
  btnAcceptText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  btnRejectText: { color: '#FF4444', fontWeight: '700', fontSize: 14 },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#3730A3',
    lineHeight: 18,
    fontWeight: '500',
  },
});
