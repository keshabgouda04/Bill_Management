import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bill, PaymentStatus } from '../api/billsApi';

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  PAID:     { label: 'Paid',     bg: '#ECFDF5', text: '#10B981', dot: '#10B981' },
  PENDING:  { label: 'Pending',  bg: '#FFF7ED', text: '#F59E0B', dot: '#F59E0B' },
  OVERDUE:  { label: 'Overdue',  bg: '#FFF1F2', text: '#EF4444', dot: '#EF4444' },
  REFUNDED: { label: 'Refunded', bg: '#F0F0FF', text: '#6366F1', dot: '#6366F1' },
};

const CATEGORY_ICON: Record<string, { icon: string; bg: string; color: string }> = {
  default:     { icon: 'receipt-outline',   bg: '#EEF2FF', color: '#4B65E4' },
  electricity: { icon: 'flash-outline',     bg: '#FFF7ED', color: '#F59E0B' },
  internet:    { icon: 'wifi-outline',      bg: '#EFF6FF', color: '#3B82F6' },
  water:       { icon: 'water-outline',     bg: '#F0FDF4', color: '#10B981' },
  mobile:      { icon: 'phone-portrait-outline', bg: '#FFF1F2', color: '#EF4444' },
  gas:         { icon: 'flame-outline',     bg: '#FFF7ED', color: '#F97316' },
};

function getIconConfig(invoiceNumber: string) {
  const lower = invoiceNumber.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICON)) {
    if (lower.includes(key)) return CATEGORY_ICON[key];
  }
  return CATEGORY_ICON.default;
}

function formatAmount(amount: number, currency: string) {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

interface BillCardProps {
  bill: Bill;
  onPress?: () => void;
}

export const BillCard = ({ bill, onPress }: BillCardProps) => {
  const statusCfg = STATUS_CONFIG[bill.payment_status] ?? STATUS_CONFIG.PENDING;
  const iconCfg = getIconConfig(bill.invoice_number);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: iconCfg.bg }]}>
        <Ionicons name={iconCfg.icon as any} size={22} color={iconCfg.color} />
      </View>

      {/* Middle info */}
      <View style={styles.info}>
        <Text style={styles.invoiceNumber} numberOfLines={1}>{bill.invoice_number}</Text>
        <Text style={styles.date}>{formatDate(bill.purchase_date)}</Text>
        <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
          <View style={[styles.dot, { backgroundColor: statusCfg.dot }]} />
          <Text style={[styles.badgeText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
        </View>
      </View>

      {/* Amount + Arrow */}
      <View style={styles.right}>
        <Text style={styles.amount}>{formatAmount(bill.total_amount, bill.currency)}</Text>
        <Ionicons name="chevron-forward" size={16} color="#CCC" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  invoiceNumber: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  date: { fontSize: 11, color: '#BDBDBD', marginBottom: 6 },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
});
