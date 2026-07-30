import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface MerchantDetailsCardProps {
  purchaseLocation: string;
  setPurchaseLocation: (val: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (val: string) => void;
  purchaseDate: string;
  setPurchaseDate: (val: string) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  billCategory: string;
  setBillCategory: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
}

const PAYMENT_METHODS = ['UPI', 'CARD', 'CASH', 'NET_BANKING'];
const CATEGORY_KEYS = [
  'd01eefad-a46d-44f2-92b5-7823b13cca97', // Groceries
  'f61ab785-1e81-4f14-a9b1-7d3acdfc0552', // Dining
  'aae8c96d-aefa-4b12-884d-3ce3ffcd7b22', // Utilities
  'b5ee8097-2d1c-4aa6-a2a3-66a45b2d391c', // Transportation
  '58969cd8-cdde-40d4-9fd9-d1251fc96e8e', // Entertainment
  '1d4d9114-d91b-462b-bf01-6ded3119fe8d', // Electronics
  '238c21e0-ab19-4cdc-a6bc-3d642b912eae', // Shopping
  '58bcb17c-a844-4163-a6ee-3f90dc0515ca', // Healthcare
  'ec065761-2805-4098-a1f9-cf6b6310e839', // Home & Furniture
  '5085268a-da58-40a1-abfb-71f577bd4713', // Others
];

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  'd01eefad-a46d-44f2-92b5-7823b13cca97': { label: 'Groceries', emoji: '🛒' },
  'f61ab785-1e81-4f14-a9b1-7d3acdfc0552': { label: 'Dining', emoji: '🍕' },
  'aae8c96d-aefa-4b12-884d-3ce3ffcd7b22': { label: 'Utilities', emoji: '🔌' },
  'b5ee8097-2d1c-4aa6-a2a3-66a45b2d391c': { label: 'Transportation', emoji: '🚗' },
  '58969cd8-cdde-40d4-9fd9-d1251fc96e8e': { label: 'Entertainment', emoji: '🍿' },
  '1d4d9114-d91b-462b-bf01-6ded3119fe8d': { label: 'Electronics', emoji: '📱' },
  '238c21e0-ab19-4cdc-a6bc-3d642b912eae': { label: 'Shopping', emoji: '🛍️' },
  '58bcb17c-a844-4163-a6ee-3f90dc0515ca': { label: 'Healthcare', emoji: '❤️' },
  'ec065761-2805-4098-a1f9-cf6b6310e839': { label: 'Home & Furniture', emoji: '🏠' },
  '5085268a-da58-40a1-abfb-71f577bd4713': { label: 'Others', emoji: '📦' },
};

const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getYesterday = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(23, 59, 59, 999);
  return d;
};

export default function MerchantDetailsCard({
  purchaseLocation,
  setPurchaseLocation,
  invoiceNumber,
  setInvoiceNumber,
  purchaseDate,
  setPurchaseDate,
  paymentMethod,
  setPaymentMethod,
  billCategory,
  setBillCategory,
  notes,
  setNotes,
}: MerchantDetailsCardProps) {
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>🏢 Merchant & General Details</Text>

      <Text style={styles.fieldLabel}>Merchant / Store Name *</Text>
      <TextInput
        style={styles.fieldInput}
        value={purchaseLocation}
        onChangeText={setPurchaseLocation}
        placeholder="e.g. Apple Store, Reliance Retail"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Invoice Number *</Text>
          <TextInput
            style={styles.fieldInput}
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            placeholder="e.g. INV-1002"
          />
        </View>

        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Purchase Date *</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowPurchaseDatePicker(true)}
          >
            <Text style={styles.dateSelectorText}>{purchaseDate}</Text>
            <Ionicons name="calendar-outline" size={18} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {/* DateTime Picker Purchase Date */}
      {showPurchaseDatePicker && (
        <DateTimePicker
          value={(() => {
            const parts = purchaseDate.split('/');
            if (parts.length === 3) {
              const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
              const maxD = getYesterday();
              return d > maxD ? maxD : d;
            }
            return getYesterday();
          })()}
          mode="date"
          display="default"
          maximumDate={getYesterday()}
          onChange={(event, selectedDate) => {
            setShowPurchaseDatePicker(false);
            if (selectedDate) {
              setPurchaseDate(formatDateToDDMMYYYY(selectedDate));
            }
          }}
        />
      )}

      {/* Payment Method Selector */}
      <Text style={styles.fieldLabel}>Payment Method</Text>
      <View style={styles.pickerWrapper}>
        {PAYMENT_METHODS.map((method) => {
          const isActive = paymentMethod === method;
          return (
            <TouchableOpacity
              key={method}
              style={[styles.methodChip, isActive && styles.methodChipActive]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={[styles.methodChipText, isActive && styles.methodChipTextActive]}>
                {method.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category Selector */}
      <Text style={styles.fieldLabel}>Expense Category</Text>
      <View style={styles.pickerWrapper}>
        {CATEGORY_KEYS.map((key) => {
          const meta = CATEGORY_LABELS[key];
          const isActive = billCategory === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.methodChip, isActive && styles.methodChipActive]}
              onPress={() => setBillCategory(key)}
            >
              <Text style={[styles.methodChipText, isActive && styles.methodChipTextActive]}>
                {meta.emoji} {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notes */}
      <Text style={styles.fieldLabel}>Notes / Memo</Text>
      <TextInput
        style={[styles.fieldInput, styles.fieldInputMulti]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add description or notes here..."
        multiline
        numberOfLines={3}
      />
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
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  fieldInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  fieldInputMulti: { height: 75, paddingTop: 10, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12, marginTop: 4 },
  col: { flex: 1 },
  dateSelector: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSelectorText: { fontSize: 14, color: '#1A1A1A' },
  pickerWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 4 },
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    backgroundColor: '#FAFAFA',
  },
  methodChipActive: { backgroundColor: '#EEF2FF', borderColor: '#4B65E4' },
  methodChipText: { fontSize: 12, color: '#666', fontWeight: '600' },
  methodChipTextActive: { color: '#4B65E4', fontWeight: '700' },
});
