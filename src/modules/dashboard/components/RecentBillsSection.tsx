import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/AppNavigator';
import { useGetBills } from '../../bills/api/billsApi';
import { formatAmount } from '../../bills/utils/billUtils';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const getEmojiIcon = (categoryName?: string | null, purchaseLocation?: string | null) => {
  const term = ((categoryName || '') + ' ' + (purchaseLocation || '')).toLowerCase();
  if (term.includes('phone') || term.includes('mobile') || term.includes('iphone')) return '📱';
  if (term.includes('headphone') || term.includes('sony') || term.includes('audio')) return '🎧';
  if (term.includes('monitor') || term.includes('dell') || term.includes('screen') || term.includes('display')) return '🖥️';
  if (term.includes('laptop') || term.includes('macbook') || term.includes('computer')) return '💻';
  if (term.includes('food') || term.includes('restaurant') || term.includes('cafe')) return '🍔';
  if (term.includes('clothing') || term.includes('myntra') || term.includes('shirt') || term.includes('wear')) return '👕';
  if (term.includes('electricity') || term.includes('power')) return '⚡';
  if (term.includes('internet') || term.includes('wifi')) return '🌐';
  return '📄';
};

const formatShortDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getWarrantyStatus = (warrantyUntilStr?: string | null, paymentStatus?: string | null) => {
  if (warrantyUntilStr) {
    const isFuture = new Date(warrantyUntilStr).getTime() > Date.now();
    if (isFuture) return 'Warranty active';
  }
  if (paymentStatus === 'PAID') return 'Paid';
  if (paymentStatus === 'UNPAID') return 'Unpaid';
  if (paymentStatus === 'PARTIAL') return 'Partial';
  if (paymentStatus === 'REFUNDED') return 'Refunded';
  return paymentStatus || 'Unpaid';
};

export const RecentBillsSection = () => {
  const navigation = useNavigation<Nav>();
  const { data, isLoading } = useGetBills();

  const bills = data?.data?.bills || [];
  const recentBills = bills.slice(0, 3); // Take top 3 recent bills

  return (
    <>
      <SectionHeader title="Recent Bills" onPress={() => navigation.navigate('ViewBills')} />
      <View style={styles.card}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4B65E4" />
          </View>
        ) : recentBills.length > 0 ? (
          recentBills.map((bill, index) => {
            const emoji = getEmojiIcon(null, bill.invoice_number);
            const titleName = bill.invoice_number || 'Bill';
            const datePart = formatShortDate(bill.purchase_date);
            const statusLabel = getWarrantyStatus(null, bill.payment_status);

            return (
              <View key={bill.id}>
                <TouchableOpacity
                  style={styles.billRow}
                  onPress={() => navigation.navigate('BillDetails', { billId: bill.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.billIconCircle}>
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billName} numberOfLines={1}>{titleName}</Text>
                    <Text style={styles.billDate} numberOfLines={1}>
                      {datePart}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.billAmount}>{formatAmount(bill.total_amount, bill.currency)}</Text>
                    <Text style={[
                      styles.billStatus,
                      { color: statusLabel === 'Paid' ? '#22C55E' : statusLabel === 'Warranty active' ? '#4B65E4' : '#EF4444' }
                    ]}>
                      {statusLabel}
                    </Text>
                  </View>
                </TouchableOpacity>
                {index < recentBills.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent bills found.</Text>
          </View>
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
  billRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  billIconCircle: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: '#F5F6FA',
    justifyContent: 'center', alignItems: 'center',
  },
  billName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  billDate: { fontSize: 12, color: '#999', marginTop: 2 },
  billAmount: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  billStatus: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 14 },
  loadingContainer: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#888',
  },
});
