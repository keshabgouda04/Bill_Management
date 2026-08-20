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

import { CATEGORIES } from '../../../constants/categories';

const PAYMENT_METHODS = ['UPI', 'CARD', 'CASH', 'NET_BANKING'];

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
              const maxD = new Date();
              return d > maxD ? maxD : d;
            }
            return new Date();
          })()}
          mode="date"
          display="default"
          maximumDate={new Date()}
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
        {CATEGORIES.map((cat) => {
          const isActive = billCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.methodChip, isActive && styles.methodChipActive]}
              onPress={() => setBillCategory(cat.id)}
            >
              <Text style={[styles.methodChipText, isActive && styles.methodChipTextActive]}>
                {cat.emoji} {cat.name}
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
