import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/AppNavigator';
import {
  useGetVaultBills,
  SharedVaultBill,
} from '../../../services/query/family/familyVault';
import { useRemoveBillFromVault } from '../../../services/mutation/family/familyVaultMutation';

type Navigation = NativeStackNavigationProp<AppStackParamList>;

interface FamilyVaultSectionProps {
  currentUserId?: string;
  isOwner: boolean;
  isAdmin: boolean;
  onOpenShareModal: () => void;
  onOpenEditVisibilityModal: (bill: SharedVaultBill) => void;
}

export default function FamilyVaultSection({
  currentUserId,
  isOwner,
  isAdmin,
  onOpenShareModal,
  onOpenEditVisibilityModal,
}: FamilyVaultSectionProps) {
  const navigation = useNavigation<Navigation>();
  const [filterTab, setFilterTab] = useState<'ALL' | 'PUBLIC' | 'SELECTIVE'>('ALL');
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  const { data: vaultBills = [], isLoading, isRefetching, refetch } = useGetVaultBills();
  const removeMutation = useRemoveBillFromVault();

  const handleCardPress = (item: SharedVaultBill) => {
    const targetBillId = item.bill_id || item.bills?.id;
    if (targetBillId) {
      navigation.navigate('BillDetails', {
        billId: targetBillId,
        sharedBillId: item.id,
      });
    } else {
      Alert.alert('Error', 'Bill details unavailable.');
    }
  };

  const canShare = isOwner || isAdmin;

  const handleRemove = (item: SharedVaultBill) => {
    if (deletingIds[item.id]) return;

    Alert.alert(
      'Remove from Vault',
      'Are you sure you want to stop sharing this bill in the family vault?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setDeletingIds((prev) => ({ ...prev, [item.id]: true }));
            removeMutation.mutate(item.id, {
              onError: (err: any) => {
                setDeletingIds((prev) => ({ ...prev, [item.id]: false }));
                const msg = err.response?.data?.message || err.message || 'Failed to remove bill.';
                Alert.alert('Error', msg);
              },
            });
          },
        },
      ]
    );
  };

  const filteredBills = vaultBills.filter((bill) => {
    if (filterTab === 'PUBLIC') return bill.visibility_type === 'ALL';
    if (filterTab === 'SELECTIVE') return bill.visibility_type === 'SELECTIVE';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Section Title & Action Button */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionHeaderTitle}>SHARED FAMILY HUB</Text>
          <Text style={styles.sectionHeaderSub}>
            {vaultBills.length} bill(s) shared in family
          </Text>
        </View>

        {canShare && (
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={onOpenShareModal}
            activeOpacity={0.8}
          >
            <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.shareBtnText}>+ Share Bill</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      {vaultBills.length > 0 && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, filterTab === 'ALL' && styles.tabItemActive]}
            onPress={() => setFilterTab('ALL')}
          >
            <Text style={[styles.tabText, filterTab === 'ALL' && styles.tabTextActive]}>
              All ({vaultBills.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, filterTab === 'PUBLIC' && styles.tabItemActive]}
            onPress={() => setFilterTab('PUBLIC')}
          >
            <Text style={[styles.tabText, filterTab === 'PUBLIC' && styles.tabTextActive]}>
              Workspace Wide
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, filterTab === 'SELECTIVE' && styles.tabItemActive]}
            onPress={() => setFilterTab('SELECTIVE')}
          >
            <Text style={[styles.tabText, filterTab === 'SELECTIVE' && styles.tabTextActive]}>
              Selective
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {isLoading && !isRefetching ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#4B65E4" />
          <Text style={styles.loadingText}>Fetching family vault...</Text>
        </View>
      ) : filteredBills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={38} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Vault Bills Found</Text>
          <Text style={styles.emptySubtitle}>
            {canShare
              ? 'Tap "+ Share Bill" above to share a personal bill into the family vault.'
              : 'Shared family bills will appear here once an Owner or Admin shares them.'}
          </Text>
        </View>
      ) : (
        <View style={styles.billsList}>
          {filteredBills.map((item) => {
            const billData: any = item.bills || {};
            const isUploader = item.shared_by === currentUserId;
            const canRemove = isOwner || isUploader;
            const canEditVisibility = isUploader;
            const isDeleting = Boolean(deletingIds[item.id]);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.billCard}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item)}
              >
                <View style={styles.cardTopRow}>
                  {/* Category / Icon */}
                  <View style={styles.iconCircle}>
                    <Ionicons name="receipt-outline" size={20} color="#4B65E4" />
                  </View>

                  {/* Main Info */}
                  <View style={styles.billMainInfo}>
                    <Text style={styles.merchantName} numberOfLines={1}>
                      {billData.merchant_name || 'Family Bill'}
                    </Text>
                    <Text style={styles.billMeta}>
                      {billData.category || 'Expense'} •{' '}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : 'Shared'}
                    </Text>
                  </View>

                  {/* Amount */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.billAmount}>
                      ₹{billData.total_amount || billData.amount || 0}
                    </Text>
                  </View>
                </View>

                {/* Card Bottom Row: Badges & Actions */}
                <View style={styles.cardBottomRow}>
                  <View style={styles.badgeRow}>
                    {item.visibility_type === 'ALL' ? (
                      <View style={styles.badgeAll}>
                        <Ionicons name="globe-outline" size={12} color="#4B65E4" style={{ marginRight: 3 }} />
                        <Text style={styles.badgeAllText}>All Members</Text>
                      </View>
                    ) : (
                      <View style={styles.badgeSelective}>
                        <Ionicons name="lock-closed-outline" size={12} color="#7C3AED" style={{ marginRight: 3 }} />
                        <Text style={styles.badgeSelectiveText}>Selective</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionButtonsRow}>
                    {canEditVisibility && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onOpenEditVisibilityModal(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="eye-outline" size={16} color="#4B65E4" />
                      </TouchableOpacity>
                    )}

                    {canRemove && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.removeBtn, isDeleting && { opacity: 0.5 }]}
                        disabled={isDeleting}
                        onPress={() => handleRemove(item)}
                        activeOpacity={0.7}
                      >
                        {isDeleting ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B65E4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  tabItem: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  tabItemActive: {
    backgroundColor: '#4B65E4',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
  billsList: {
    gap: 10,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billMainInfo: {
    flex: 1,
    paddingRight: 8,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  billMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B65E4',
  },
  badgeSelective: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSelectiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    backgroundColor: '#FEF2F2',
  },
});
