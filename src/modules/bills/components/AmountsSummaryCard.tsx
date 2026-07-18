import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AmountsSummaryCardProps {
  subtotal: number;
  taxAmount: number;
  discountAmount: string;
  setDiscountAmount: (val: string) => void;
  calculatedTotalAmount: number;
  isTotalOverwritten: boolean;
  setIsTotalOverwritten: (val: boolean) => void;
  manualTotalAmount: string;
  setManualTotalAmount: (val: string) => void;
}

export default function AmountsSummaryCard({
  subtotal,
  taxAmount,
  discountAmount,
  setDiscountAmount,
  calculatedTotalAmount,
  isTotalOverwritten,
  setIsTotalOverwritten,
  manualTotalAmount,
  setManualTotalAmount,
}: AmountsSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>💰 Amounts Summary</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Taxes</Text>
        <Text style={styles.summaryValue}>₹{taxAmount.toLocaleString('en-IN')}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Discount Amount (₹)</Text>
        <TextInput
          style={styles.discountInput}
          value={discountAmount}
          onChangeText={setDiscountAmount}
          keyboardType="numeric"
          placeholder="0"
        />
      </View>

      <View style={styles.divider} />

      {/* Final Total (Editable toggle) */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Grand Total Amount *</Text>
        {isTotalOverwritten ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.totalInput}
              value={manualTotalAmount}
              onChangeText={setManualTotalAmount}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setIsTotalOverwritten(false);
                setManualTotalAmount('');
              }}
              style={styles.resetBtn}
            >
              <Ionicons name="refresh-circle" size={24} color="#4B65E4" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.totalValue}>₹{calculatedTotalAmount.toLocaleString('en-IN')}</Text>
            <TouchableOpacity
              onPress={() => {
                setIsTotalOverwritten(true);
                setManualTotalAmount(String(calculatedTotalAmount));
              }}
              style={styles.editTotalBtn}
            >
              <Ionicons name="create-outline" size={16} color="#4B65E4" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {isTotalOverwritten && (
        <Text style={styles.overwriteTip}>
          Custom total set. Tap refresh icon to sync back with calculated list items sum.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  cardHeader: { fontSize: 14, fontWeight: '700', color: '#4B65E4', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  summaryLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  summaryValue: { fontSize: 13, color: '#1A1A1A', fontWeight: '600' },
  discountInput: {
    width: 80,
    height: 30,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 6,
    textAlign: 'right',
    paddingHorizontal: 8,
    fontSize: 13,
    backgroundColor: '#FAFAFA',
  },
  divider: { height: 1, backgroundColor: '#EBEBEB', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#4B65E4' },
  currencyPrefix: { fontSize: 16, fontWeight: '700', color: '#4B65E4' },
  totalInput: {
    width: 100,
    height: 36,
    borderWidth: 1.5,
    borderColor: '#4B65E4',
    borderRadius: 8,
    textAlign: 'right',
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#4B65E4',
    backgroundColor: '#FFF',
  },
  editTotalBtn: { padding: 4 },
  resetBtn: { padding: 4 },
  overwriteTip: { fontSize: 10, color: '#E17009', marginTop: 6, fontStyle: 'italic' },
});
