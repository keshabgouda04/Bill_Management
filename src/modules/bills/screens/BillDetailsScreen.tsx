import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../../../navigation/AppNavigator';
import { BillDetail, useGetBillDetails, useDeleteBill } from '../api/billsApi';
import { BILL_STATUS, PAYMENT_STATUS } from '../constants/billStatus';
import { formatAmount, formatDate, getPhotoUri, getWarrantyDays } from '../utils/billUtils';
import * as FileSystem from 'expo-file-system/legacy';
import { StorageAccessFramework } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getAttachmentDownloadUrl } from '../../../services/attachmentService';
import InfoRow from '../components/InfoRow';
import EditBillModal from '../components/EditBillModal';
import { useGetVaultBillDetail } from '../../../services/query/family/familyVault';
import { useGetProfileDetails } from '../../../services/query/profile/profile';

type Navigation = NativeStackNavigationProp<AppStackParamList, 'BillDetails'>;
type BillDetailsRoute = RouteProp<AppStackParamList, 'BillDetails'>;

export default function BillDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<BillDetailsRoute>();
  const { width, height } = Dimensions.get('window');
  const { billId, sharedBillId } = route.params;

  const { data: profileData } = useGetProfileDetails();
  const currentUserId = profileData?.profile?.id || (profileData as any)?.id;

  const {
    data: personalData,
    isLoading: isLoadingPersonal,
    isError: isErrorPersonal,
    refetch: refetchPersonal,
  } = useGetBillDetails(billId);

  const {
    data: vaultData,
    isLoading: isLoadingVault,
    refetch: refetchVault,
  } = useGetVaultBillDetail(sharedBillId || (isErrorPersonal ? billId : ''));

  const deleteBillMutation = useDeleteBill();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const bill =
    personalData?.data?.bill ||
    vaultData?.bills ||
    (vaultData as any)?.sharedBill?.bills ||
    (vaultData as any)?.data?.sharedBill?.bills ||
    (vaultData as any)?.data?.bills;
  console.log("billlsssssss====>", bill)
  const billOwnerId =
    bill?.user_id ||
    (vaultData as any)?.shared_by ||
    (vaultData as any)?.sharedBill?.shared_by ||
    (vaultData as any)?.data?.sharedBill?.shared_by;

  const isBillOwner =
    Boolean(!sharedBillId && (!billOwnerId || (currentUserId && billOwnerId === currentUserId))) ||
    Boolean(currentUserId && billOwnerId && currentUserId === billOwnerId);

  const isLoading = !bill && (isLoadingPersonal || (isErrorPersonal && isLoadingVault));
  const isError = !bill && !isLoadingPersonal && (!isErrorPersonal || (!isLoadingVault && !vaultData));

  const refetch = () => {
    refetchPersonal();
    refetchVault();
  };
  const photoUri = useMemo(() => (bill ? getPhotoUri(bill) : null), [bill]);

  const handleDownloadAttachment = async (attachmentId: string, fileName: string) => {
    if (downloadingId) return;

    try {
      setDownloadingId(attachmentId);

      const res = await getAttachmentDownloadUrl(attachmentId);
      if (!res.success || !res.data.download_url) {
        Alert.alert('Download Error', 'Could not retrieve download link.');
        setDownloadingId(null);
        return;
      }

      const downloadUrl = res.data.download_url;
      const cleanFileName = fileName.replace(/\s+/g, '_');
      const localUri = FileSystem.cacheDirectory + cleanFileName;

      const downloadRes = await FileSystem.downloadAsync(downloadUrl, localUri);

      setDownloadingId(null);

      if (Platform.OS === 'android') {
        const mime = cleanFileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert('Save Cancelled', 'Permission was not granted to save the file.');
          return;
        }

        const fileUri = await StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          cleanFileName,
          mime
        );

        const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert('Success', `Attachment saved successfully to your folder.`);
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          Alert.alert('Download Complete', `File saved to cache as ${cleanFileName}.`);
        }
      }
    } catch (error: any) {
      setDownloadingId(null);
      console.error('Failed to download attachment:', error);
      Alert.alert('Download Error', error.message || 'Failed to download attachment.');
    }
  };
  const warrantyDays = useMemo(() => getWarrantyDays(bill?.warranty_until), [bill?.warranty_until]);

  const handleShare = async () => {
    if (!bill) return;
    await Share.share({
      message: `${bill.invoice_number} - ${formatAmount(bill.total_amount, bill.currency)} paid via ${bill.payment_method}`,
    });
  };

  const handleDownload = () => {
    if (bill && bill.attachments && bill.attachments.length > 0) {
      const att = bill.attachments[0];
      handleDownloadAttachment(att.id, att.file_name);
      return;
    }

    if (!photoUri) {
      Alert.alert('No file available', 'This bill does not have an attached photo or document.');
      return;
    }

    Alert.alert('File available', 'Open the receipt image from the bill preview below.');
  };

  const handleDeleteBill = () => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this entire bill? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBillMutation.mutate(billId, {
              onSuccess: () => {
                Alert.alert('Success', 'Bill deleted successfully.');
                navigation.goBack();
              },
              onError: (err: any) => {
                Alert.alert('Error', err.message || 'Could not delete bill.');
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4B65E4" />
          <Text style={styles.loadingText}>Fetching bill details...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load bill details.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const status = PAYMENT_STATUS[bill.payment_status] ?? PAYMENT_STATUS.UNPAID;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* The Blue Header */}
      <View style={styles.blueHeader}>
        {/* Top Row: Back & Edit */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {isBillOwner && (
            <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.headerEditBtn}>
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
              <Text style={styles.headerEditText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Price & Invoice */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerAmount}>{formatAmount(bill.total_amount, bill.currency)}</Text>
          <Text style={styles.headerInvoice}>{bill.invoice_number}</Text>
          <View style={styles.headerDateBadge}>
            <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
            <Text style={styles.headerDate}>{formatDate(bill.purchase_date)}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ zIndex: 10, elevation: 10 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.round(height * 0.06), paddingTop: 35 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Buttons (Overlapping) */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionCardBtn} onPress={handleDownload}>
            <Ionicons name="download-outline" size={20} color="#4B65E4" />
            <Text style={styles.actionCardText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCardBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#4B65E4" />
            <Text style={styles.actionCardText}>Share Bill</Text>
          </TouchableOpacity>
        </View>

        {/* Bill Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>BILL INFORMATION</Text>
            {isBillOwner && (
              <TouchableOpacity onPress={() => setIsEditModalVisible(true)}>
                <Text style={styles.editDetailsText}>Edit Details</Text>
              </TouchableOpacity>
            )}
          </View>

          <InfoRow label="Purchase Date" value={formatDate(bill.purchase_date)} />
          <InfoRow label="Category" value={bill.category?.name || 'Others'} />
          <InfoRow label="Payment Method" value={bill.payment_method} />
          <InfoRow label="Invoice Number" value={bill.invoice_number} />
          <InfoRow label="Source" value={bill.ocr_status || bill.ai_status || 'Manual'} />
          <InfoRow label="Added On" value={formatDate(bill.created_at)} />
          {bill.notes ? <InfoRow label="Notes" value={bill.notes} /> : null}
        </View>

        {/* Financial Breakdown Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>FINANCIAL BREAKDOWN</Text>
          </View>

          <InfoRow label="Subtotal" value={formatAmount(bill.subtotal, bill.currency)} />
          <InfoRow label="Tax" value={formatAmount(bill.tax_amount, bill.currency)} />
          <InfoRow label="Discount" value={formatAmount(bill.discount_amount, bill.currency)} />

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatAmount(bill.total_amount, bill.currency)}</Text>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
            </View>
            {/* {bill.bill_status ? (
              <View style={[styles.statusBadge, { backgroundColor: BILL_STATUS[bill.bill_status]?.bg ?? '#F3F4F6' }]}>
                <Text style={[styles.statusText, { color: BILL_STATUS[bill.bill_status]?.text ?? '#6B7280' }]}>
                  {BILL_STATUS[bill.bill_status]?.label ?? bill.bill_status}
                </Text>
              </View>
            ) : null} */}
          </View>
        </View>

        {bill.warranty_until ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>WARRANTY & REMINDERS</Text>
            </View>
            <View style={styles.warrantyItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.warrantyTitle}>Active Warranty</Text>
                <Text style={styles.warrantySubtitle}>Expires {formatDate(bill.warranty_until)}</Text>
              </View>
              {warrantyDays !== null ? (
                <View style={styles.daysPill}>
                  <Text style={styles.daysValue}>{warrantyDays}</Text>
                  <Text style={styles.daysLabel}>Days Left</Text>
                </View>
              ) : null}
            </View>

            {bill.reminders && bill.reminders.length > 0 ? (
              <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 8, letterSpacing: 0.5 }}>
                  SCHEDULED REMINDERS
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {bill.reminders.map((r: string) => {
                    const labelMap: Record<string, string> = {
                      '30_DAYS': '30 Days Before',
                      '7_DAYS': '7 Days Before',
                      '1_DAY': '1 Day Before',
                      '1_HOUR': '1 Hour Before',
                    };
                    return (
                      <View key={r} style={styles.reminderBadge}>
                        <Ionicons name="notifications-outline" size={13} color="#4B65E4" style={{ marginRight: 4 }} />
                        <Text style={styles.reminderBadgeText}>{labelMap[r] || r}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Products Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>PRODUCTS</Text>
          </View>

          {bill.bill_items && bill.bill_items.length > 0 ? (
            bill.bill_items.map((item: any, index: number) => {
              const itemTaxNum = typeof item.tax_amount === 'number' ? item.tax_amount : parseFloat(item.tax_amount || 0);
              const hasItemTax = !isNaN(itemTaxNum) && itemTaxNum > 0;
              const warrantyMonthsNum = typeof item.warranty_months === 'number' ? item.warranty_months : parseInt(item.warranty_months || 0, 10);
              const hasWarrantyMonths = !isNaN(warrantyMonthsNum) && warrantyMonthsNum > 0;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.productItem,
                    index < (bill.bill_items?.length ?? 0) - 1 && styles.productItemBorder,
                  ]}
                >
                  <View style={styles.productIconWrap}>
                    <Ionicons name="cube-outline" size={18} color="#4B65E4" />
                  </View>
                  <View style={styles.productBody}>
                    <View style={styles.productTopRow}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.item_name}
                      </Text>
                      <Text style={styles.productPrice}>
                        {formatAmount(item.total_price || (item.quantity * item.unit_price), bill.currency)}
                      </Text>
                    </View>

                    <Text style={styles.productDesc}>
                      Qty: {item.quantity} × {formatAmount(item.unit_price, bill.currency)}
                    </Text>

                    {!!item.description && (
                      <Text style={[styles.productDesc, { color: '#888', fontStyle: 'italic', marginTop: 1 }]}>
                        {item.description}
                      </Text>
                    )}

                    {hasItemTax && (
                      <Text style={[styles.productDesc, { color: '#6B7280', marginTop: 2 }]}>
                        Tax: {formatAmount(item.tax_amount || 0, bill.currency)}
                      </Text>
                    )}

                    {hasWarrantyMonths ? (
                      <View style={styles.productWarrantyRow}>
                        <Text style={styles.productWarrantyText}>🛡️ {item.warranty_months} months warranty</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.productEmptyState}>
              <Ionicons name="cube-outline" size={28} color="#D1D5DB" />
              <Text style={styles.productEmptyText}>No products recorded yet</Text>
            </View>
          )}
        </View>

        {/* Attachments Section */}
        {bill.attachments && bill.attachments.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>ATTACHMENTS</Text>
            </View>

            {bill.attachments.map((att: any) => {
              const isPdf = att.file_name.toLowerCase().endsWith('.pdf');
              const isDownloading = downloadingId === att.id;

              return (
                <View key={att.id} style={styles.attachmentItemRow}>
                  <Ionicons
                    name={isPdf ? 'document-text' : 'image'}
                    size={24}
                    color="#4B65E4"
                  />
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {att.file_name}
                    </Text>
                    <Text style={styles.attachmentMeta}>
                      {att.file_size ? `${(att.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'} • {isPdf ? 'PDF' : 'Image'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.downloadIconBtn}
                    onPress={() => handleDownloadAttachment(att.id, att.file_name)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#4B65E4" />
                    ) : (
                      <Ionicons name="download-outline" size={20} color="#4B65E4" />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : null}

        {photoUri ? (
          <View style={styles.photoCard}>
            <Image source={{ uri: photoUri }} style={styles.receiptImage} resizeMode="cover" />
          </View>
        ) : null}

        {isBillOwner && (
          <TouchableOpacity style={styles.dangerDeleteBtn} onPress={handleDeleteBill}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={styles.dangerDeleteText}>Delete Entire Bill</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <EditBillModal
        visible={isEditModalVisible}
        bill={bill}
        onClose={() => setIsEditModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  blueHeader: {
    backgroundColor: '#4B65E4',
    paddingTop: 36, // Adjusted for status bar
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerEditText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerCenter: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headerAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerInvoice: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  headerDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -24, // Overlap the blue header
    marginBottom: 20,
    paddingHorizontal: 4,
    zIndex: 10,
    elevation: 10,
  },
  actionCardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#4B65E4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B65E4',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  warrantyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warrantyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  warrantySubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  daysPill: {
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669',
  },
  daysLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 12,
  },
  productItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  productBody: {
    flex: 1,
    minWidth: 0,
  },
  productTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  productDesc: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  productWarrantyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  productWarrantyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  productEmptyState: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  productEmptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  attachmentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  attachmentMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  downloadIconBtn: {
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  photoCard: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  receiptImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#F3F4F6',
  },
  dangerDeleteBtn: {
    marginTop: 24,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerDeleteText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  retryButton: {
    borderRadius: 12,
    backgroundColor: '#4B65E4',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  reminderBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
  },
});
