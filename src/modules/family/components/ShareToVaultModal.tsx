import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetBills } from '../../../services/query/bills/bills';
import { useGetMembers } from '../../../services/query/family/family';
import { useGetVaultBills } from '../../../services/query/family/familyVault';
import { useShareBillToVault } from '../../../services/mutation/family/familyVaultMutation';

interface ShareToVaultModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ShareToVaultModal({ visible, onClose }: ShareToVaultModalProps) {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [visibilityType, setVisibilityType] = useState<'ALL' | 'SELECTIVE'>('ALL');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const { data: personalBills = [], isLoading: isLoadingBills } = useGetBills();
  const { data: membersData } = useGetMembers();
  const { data: vaultBills = [] } = useGetVaultBills();
  const shareMutation = useShareBillToVault();

  // Safely parse personal bills array
  const rawBills =
    (personalBills as any)?.data?.bills ||
    (personalBills as any)?.bills ||
    (personalBills as any)?.data ||
    personalBills;
  const billsList: any[] = Array.isArray(rawBills) ? rawBills : [];

  // Extract active family member emails
  const activeMembers = Array.isArray(membersData?.data?.members || membersData?.members)
    ? membersData?.data?.members || membersData?.members
    : [];

  const memberEmails = activeMembers
    .map((m: any) => m.profiles?.email || m.email)
    .filter(Boolean);

  // Set of bill IDs that are already shared in the family vault
  const sharedBillIds = new Set((vaultBills || []).map((vb: any) => vb.bill_id));

  const toggleEmail = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter((e) => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleShare = () => {
    if (!selectedBillId) {
      Alert.alert('Select a Bill', 'Please select a bill to share with the family vault.');
      return;
    }

    if (visibilityType === 'SELECTIVE' && selectedEmails.length === 0) {
      Alert.alert(
        'Select Recipients',
        'Please select at least one family member to share this bill with.'
      );
      return;
    }

    shareMutation.mutate(
      {
        billId: selectedBillId,
        visibilityType,
        sharedWithEmails: visibilityType === 'SELECTIVE' ? selectedEmails : [],
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Bill successfully shared to family vault!');
          resetAndClose();
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || err.message || 'Failed to share bill.';
          Alert.alert('Error Sharing Bill', msg);
        },
      }
    );
  };

  const resetAndClose = () => {
    setSelectedBillId(null);
    setVisibilityType('ALL');
    setSelectedEmails([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetAndClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="folder-open" size={20} color="#4B65E4" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Share Bill to Vault</Text>
              <Text style={styles.headerSubtitle}>Select a personal bill to share with family</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={resetAndClose}>
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Section 1: Choose Visibility Type */}
          <Text style={styles.sectionTitle}>1. Visibility Mode</Text>
          <View style={styles.visibilityOptionRow}>
            <TouchableOpacity
              style={[
                styles.visibilityCard,
                visibilityType === 'ALL' && styles.visibilityCardSelected,
              ]}
              onPress={() => setVisibilityType('ALL')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="globe-outline"
                size={22}
                color={visibilityType === 'ALL' ? '#4B65E4' : '#64748B'}
              />
              <Text
                style={[
                  styles.visibilityCardTitle,
                  visibilityType === 'ALL' && styles.visibilityCardTitleSelected,
                ]}
              >
                All Members
              </Text>
              <Text style={styles.visibilityCardDesc}>
                Everyone in the family vault can view this bill, including future members.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityCard,
                visibilityType === 'SELECTIVE' && styles.visibilityCardSelected,
              ]}
              onPress={() => setVisibilityType('SELECTIVE')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={visibilityType === 'SELECTIVE' ? '#4B65E4' : '#64748B'}
              />
              <Text
                style={[
                  styles.visibilityCardTitle,
                  visibilityType === 'SELECTIVE' && styles.visibilityCardTitleSelected,
                ]}
              >
                Selective Members
              </Text>
              <Text style={styles.visibilityCardDesc}>
                Only specific selected members and the Family Owner can view this bill.
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section 2: Selective Email Recipients Pickers */}
          {visibilityType === 'SELECTIVE' && (
            <View style={styles.recipientsContainer}>
              <Text style={styles.sectionTitle}>Select Recipients</Text>
              {memberEmails.length === 0 ? (
                <Text style={styles.emptyText}>No active family members found.</Text>
              ) : (
                memberEmails.map((email: string) => {
                  const isChecked = selectedEmails.includes(email);
                  return (
                    <TouchableOpacity
                      key={email}
                      style={styles.recipientRow}
                      onPress={() => toggleEmail(email)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isChecked ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={isChecked ? '#4B65E4' : '#94A3B8'}
                      />
                      <Text style={styles.recipientEmail}>{email}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* Section 3: Select Personal Bill to Share */}
          <Text style={styles.sectionTitle}>2. Choose Personal Bill</Text>
          {isLoadingBills ? (
            <ActivityIndicator size="small" color="#4B65E4" style={{ marginVertical: 20 }} />
          ) : billsList.length === 0 ? (
            <View style={styles.emptyBillsBox}>
              <Text style={styles.emptyText}>You haven't uploaded any personal bills yet.</Text>
            </View>
          ) : (
            <FlatList
              data={billsList}
              keyExtractor={(item: any) => item.id}
              style={styles.billsList}
              renderItem={({ item }) => {
                const isShared = sharedBillIds.has(item.id);
                const isSelected = selectedBillId === item.id;

                return (
                  <TouchableOpacity
                    style={[
                      styles.billCard,
                      isSelected && styles.billCardSelected,
                      isShared && styles.billCardDisabled,
                    ]}
                    disabled={isShared}
                    onPress={() => setSelectedBillId(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.billCardLeft}>
                      <Ionicons
                        name={isShared ? 'checkmark-circle' : isSelected ? 'disc' : 'radio-button-off'}
                        size={20}
                        color={isShared ? '#10B981' : isSelected ? '#4B65E4' : '#94A3B8'}
                      />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.billTitle}>
                          {item.merchant_name || item.merchant?.name || item.title || item.invoice_number || 'Bill'}
                        </Text>
                        <Text style={styles.billSubtitle}>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : item.category || 'General'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.billAmount}>
                        ₹{item.total_amount || item.amount || 0}
                      </Text>
                      {isShared && <Text style={styles.alreadySharedTag}>Already Shared</Text>}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* Footer Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, shareMutation.isPending && styles.submitBtnDisabled]}
            disabled={shareMutation.isPending}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            {shareMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Share to Family Vault</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    marginTop: 6,
  },
  visibilityOptionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  visibilityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  visibilityCardSelected: {
    borderColor: '#4B65E4',
    backgroundColor: '#F4F6FF',
  },
  visibilityCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 6,
    marginBottom: 4,
  },
  visibilityCardTitleSelected: {
    fontWeight: '700',
    color: '#4B65E4',
  },
  visibilityCardDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  recipientsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recipientEmail: {
    fontSize: 13,
    color: '#334155',
    marginLeft: 8,
  },
  emptyBillsBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  billsList: {
    flex: 1,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  billCardSelected: {
    borderColor: '#4B65E4',
    backgroundColor: '#F4F6FF',
  },
  billCardDisabled: {
    backgroundColor: '#F8FAFC',
    opacity: 0.6,
  },
  billCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  billSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  alreadySharedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#4B65E4',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
