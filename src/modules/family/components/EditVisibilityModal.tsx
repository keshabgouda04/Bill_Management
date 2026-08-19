import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetMembers } from '../../../services/query/family/family';
import { SharedVaultBill } from '../../../services/query/family/familyVault';
import { useUpdateVaultBillVisibility } from '../../../services/mutation/family/familyVaultMutation';
import { useGetProfileDetails } from '../../../services/query/profile/profile';

interface EditVisibilityModalProps {
  visible: boolean;
  sharedBill: SharedVaultBill | null;
  onClose: () => void;
}

export default function EditVisibilityModal({
  visible,
  sharedBill,
  onClose,
}: EditVisibilityModalProps) {
  const [visibilityType, setVisibilityType] = useState<'ALL' | 'SELECTIVE'>('ALL');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const { data: membersData } = useGetMembers();
  const { data: profileData } = useGetProfileDetails();
  const updateMutation = useUpdateVaultBillVisibility();

  const currentUserEmail = (profileData?.profile?.email || (profileData as any)?.email || '').toLowerCase().trim();

  const activeMembers = Array.isArray(membersData?.data?.members || membersData?.members)
    ? membersData?.data?.members || membersData?.members
    : [];

  const memberEmails: string[] = activeMembers
    .map((m: any) => m.profiles?.email || m.email)
    .filter(Boolean);

  // Exclude current user's email from UI selection list
  const displayMemberEmails = memberEmails.filter(
    (email: string) => !currentUserEmail || email.toLowerCase().trim() !== currentUserEmail
  );

  useEffect(() => {
    if (sharedBill) {
      setVisibilityType(sharedBill.visibility_type || 'ALL');
      const initialEmails = (sharedBill.shared_with_emails || []).filter(
        (e: string) => !currentUserEmail || e.toLowerCase().trim() !== currentUserEmail
      );
      setSelectedEmails(initialEmails);
    }
  }, [sharedBill, currentUserEmail]);

  const toggleEmail = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter((e) => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleSave = () => {
    if (!sharedBill) return;

    if (visibilityType === 'SELECTIVE' && displayMemberEmails.length > 0 && selectedEmails.length === 0) {
      Alert.alert(
        'Select Recipients',
        'Please select at least one family member to share this bill with.'
      );
      return;
    }

    // Auto-include current user's email behind the scenes if selective visibility is used
    const finalSharedEmails =
      visibilityType === 'SELECTIVE'
        ? Array.from(
            new Set([
              ...selectedEmails,
              ...(currentUserEmail ? [currentUserEmail] : []),
            ])
          )
        : [];

    updateMutation.mutate(
      {
        sharedBillId: sharedBill.id,
        payload: {
          visibilityType,
          sharedWithEmails: finalSharedEmails,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Bill visibility permissions updated!');
          onClose();
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || err.message || 'Failed to update visibility.';
          Alert.alert('Error', msg);
        },
      }
    );
  };

  if (!sharedBill) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="eye-outline" size={20} color="#4B65E4" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Edit Visibility</Text>
              <Text style={styles.headerSubtitle}>
                {sharedBill.bills?.merchant_name || 'Shared Bill'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Section 1: Choose Visibility Type */}
          <Text style={styles.sectionTitle}>Visibility Scope</Text>
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
                Visible to everyone in the family vault.
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
                Visible only to selected members and Owner.
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section 2: Email Selection */}
          {visibilityType === 'SELECTIVE' && (
            <View style={styles.recipientsContainer}>
              <Text style={styles.sectionTitle}>Select Recipients</Text>
              {displayMemberEmails.length === 0 ? (
                <Text style={styles.emptyText}>No other active members found.</Text>
              ) : (
                displayMemberEmails.map((email: string) => {
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, updateMutation.isPending && styles.submitBtnDisabled]}
            disabled={updateMutation.isPending}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Save Changes</Text>
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
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitBtn: {
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
