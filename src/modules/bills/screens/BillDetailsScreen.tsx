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

type Navigation = NativeStackNavigationProp<AppStackParamList, 'BillDetails'>;
type BillDetailsRoute = RouteProp<AppStackParamList, 'BillDetails'>;

export default function BillDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<BillDetailsRoute>();
  const { width, height } = Dimensions.get('window');
  const { billId } = route.params;

  const { data, isLoading, isError, refetch } = useGetBillDetails(billId);
  const deleteBillMutation = useDeleteBill();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const bill = data?.data.bill;
  console.log("Bilsss======>", bill)
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
      // Sanitize the filename to prevent local filesystem write errors
      const cleanFileName = fileName.replace(/\s+/g, '_');
      const localUri = FileSystem.cacheDirectory + cleanFileName;

      // Download directly from R2 securely in background
      const downloadRes = await FileSystem.downloadAsync(downloadUrl, localUri);
      
      setDownloadingId(null);

      // On Android, use StorageAccessFramework to prompt a folder picker ("Save As" dialog)
      if (Platform.OS === 'android') {
        const mime = cleanFileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        
        // Request directory permission (user chooses where to save it)
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert('Save Cancelled', 'Permission was not granted to save the file.');
          return;
        }

        // Create the file in the selected directory
        const fileUri = await StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          cleanFileName,
          mime
        );

        // Read downloaded cache file as base64 and write it to SAF file
        const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert('Success', `Attachment saved successfully to your folder.`);
      } else {
        // On iOS, Sharing.shareAsync is the standard way to save to Files app
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

  // Delete entire bill
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
      <View style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Fetching bill details...</Text>
        </View>
      </View>
    );
  }

  if (isError || !bill) {
    return (
      <View style={styles.safeArea}>
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
    <View style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.round(height * 0.06) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.billIcon}>
            <Ionicons name="receipt-outline" size={24} color="#0052CC" />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.billTitle} numberOfLines={2}>{bill.invoice_number}</Text>
            <Text style={styles.billSubtitle} numberOfLines={1}>{bill.purchase_location || 'Bill purchase'}</Text>
            <Text style={styles.billMeta} numberOfLines={1}>{bill.payment_method}</Text>
          </View>
          <View style={styles.amountBlock}>
            <Text style={styles.amount}>{formatAmount(bill.total_amount, bill.currency)}</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
              </View>
              {bill.bill_status ? (
                <View style={[styles.statusBadge, { backgroundColor: BILL_STATUS[bill.bill_status]?.bg ?? '#F3F4F6', marginTop: 4 }]}>
                  <Text style={[styles.statusText, { color: BILL_STATUS[bill.bill_status]?.text ?? '#6B7280' }]}>
                    {BILL_STATUS[bill.bill_status]?.label ?? bill.bill_status}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {bill.warranty_until ? (
          <View style={styles.warrantyCard}>
            <View style={styles.warrantyItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#0052CC" />
              <View>
                <Text style={styles.warrantyTitle}>Warranty Active</Text>
                <Text style={styles.warrantySubtitle}>Expires {formatDate(bill.warranty_until)}</Text>
              </View>
            </View>
            {warrantyDays !== null ? (
              <View style={styles.daysPill}>
                <Text style={styles.daysValue}>{warrantyDays}</Text>
                <Text style={styles.daysLabel}>Days Left</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Bill Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Bill Information</Text>
            <TouchableOpacity style={styles.sectionEditBtn} onPress={() => setIsEditModalVisible(true)}>
              <Text style={styles.sectionEditText}>Edit Bill</Text>
            </TouchableOpacity>
          </View>
          <InfoRow label="Bill Date" value={formatDate(bill.purchase_date)} />
          <InfoRow label="Category" value={bill.category?.name || 'Electronics'} />
          <InfoRow label="Payment Method" value={bill.payment_method} />
          <InfoRow label="Bill Status" value={bill.bill_status} />
          <InfoRow label="Bill Number" value={bill.invoice_number} />
          <InfoRow label="Added On" value={formatDate(bill.created_at)} />
          <InfoRow label="Last Updated" value={formatDate(bill.updated_at)} />
          <InfoRow label="Source" value={bill.ocr_status || bill.ai_status || 'Manual'} />
          <InfoRow label="Subtotal" value={formatAmount(bill.subtotal, bill.currency)} />
          <InfoRow label="Tax" value={formatAmount(bill.tax_amount, bill.currency)} />
          <InfoRow label="Discount" value={formatAmount(bill.discount_amount, bill.currency)} />
          {bill.notes ? <InfoRow label="Notes" value={bill.notes} /> : null}
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Products</Text>
          </View>

          {bill.bill_items && bill.bill_items.length > 0 ? (
            bill.bill_items.map((item, index) => {
              const hasItemTax = typeof item.tax_amount === 'number' && item.tax_amount > 0;
              const hasWarrantyMonths = typeof item.warranty_months === 'number' && item.warranty_months > 0;

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
                    ) : (
                      <View style={styles.productWarrantyRow}>
                        <Text style={styles.productNoWarrantyText}>No Warranty</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.productEmptyState}>
              <Ionicons name="cube-outline" size={28} color="#D1D5DB" />
              <Text style={styles.productEmptyText}>No products recorded yet</Text>
              <Text style={styles.productEmptyHint}>Add products to track warranty reminders</Text>
            </View>
          )}
        </View>

        {/* Attachments Section */}
        {bill.attachments && bill.attachments.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Attachments</Text>
              <Text style={styles.sectionSubtitle}>({bill.attachments.length} file{bill.attachments.length > 1 ? 's' : ''})</Text>
            </View>

            {bill.attachments.map((att: any) => {
              const isPdf = att.file_name.toLowerCase().endsWith('.pdf');
              const isDownloading = downloadingId === att.id;

              return (
                <View key={att.id} style={styles.attachmentItemRow}>
                  <Ionicons
                    name={isPdf ? 'document-text' : 'image'}
                    size={24}
                    color="#0052CC"
                  />
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {att.file_name}
                    </Text>
                    <Text style={styles.attachmentMeta}>
                      {att.file_size ? `${(att.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'} • {isPdf ? 'PDF Document' : 'Image Scan'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.downloadIconBtn}
                    onPress={() => handleDownloadAttachment(att.id, att.file_name)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#0052CC" />
                    ) : (
                      <Ionicons name="download-outline" size={20} color="#0052CC" />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <Ionicons name="download-outline" size={20} color="#0052CC" />
            <Text style={styles.actionText}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#0052CC" />
            <Text style={styles.actionText}>Share Bill</Text>
          </TouchableOpacity>
        </View>

        {photoUri ? (
          <View style={styles.photoSection}>
            <View style={styles.photoLabel}>
              <Ionicons name="image-outline" size={14} color="#FFFFFF" />
              <Text style={styles.photoLabelText}>Original Scan</Text>
            </View>
            <Image source={{ uri: photoUri }} style={styles.receiptImage} resizeMode="contain" />
          </View>
        ) : null}

        <TouchableOpacity style={styles.dangerDeleteBtn} onPress={handleDeleteBill}>
          <Ionicons name="trash" size={16} color="#FFFFFF" />
          <Text style={styles.dangerDeleteText}>Delete Entire Bill</Text>
        </TouchableOpacity>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  attachmentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  attachmentMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  downloadIconBtn: {
    padding: 8,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F4FF',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAFB',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  editButton: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052CC',
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    shadowColor: '#7C6BBD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  billIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  billSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#6B7280',
  },
  billMeta: {
    marginTop: 2,
    fontSize: 10,
    color: '#9CA3AF',
  },
  amountBlock: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0052CC',
  },
  statusBadge: {
    marginTop: 5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  warrantyCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EAF1FF',
  },
  warrantyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warrantyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052CC',
  },
  warrantySubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: '#6B7280',
  },
  daysPill: {
    alignItems: 'center',
  },
  daysValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0052CC',
  },
  daysLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  section: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '900',
    color: '#0052CC',
    textTransform: 'uppercase',
  },
  badgesRow: {
    alignItems: 'flex-end',
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  photoSection: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
    minHeight: 260,
    overflow: 'hidden',
  },
  photoLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    backgroundColor: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  receiptImage: {
    width: '100%',
    height: 320,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  dangerDeleteBtn: {
    marginTop: 24,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  dangerDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionEditBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#EAF1FF',
  },
  sectionEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
  },

  // ── Product cards ────────────────────────────────────────────────────────
  productItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 10,
  },
  productItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F7',
  },
  productIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0052CC',
  },
  productDesc: {
    marginTop: 2,
    fontSize: 11,
    color: '#6B7280',
  },
  productWarrantyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  productWarrantyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  productNoWarrantyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  productEmptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  productEmptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  productEmptyHint: {
    fontSize: 11,
    color: '#C4C4C4',
  },
  addProductBtn: {
    marginTop: 10,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
  },
  addProductBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B65E4',
  },
  productActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  productActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B65E4',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 12,
    marginBottom: 18,
    fontSize: 14,
    color: '#EF4444',
  },
  retryButton: {
    borderRadius: 8,
    backgroundColor: '#0052CC',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
