import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateBill } from '../../bills/api/billsApi';

interface ManualEntryModalProps {
  visible: boolean;
  onClose: () => void;
}

const parseDateToISO = (dateStr: string): string | null => {
  if (!dateStr.trim()) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS Month is 0-indexed
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const date = new Date(year, month, day, 12, 0, 0);
      return date.toISOString();
    }
  }
  return null;
};

export const ManualEntryModal = ({ visible, onClose }: ManualEntryModalProps) => {
  // Required fields
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDate, setBillDate] = useState('');

  // Optional backend fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH' | 'NET_BANKING'>('UPI');
  const [billCategory, setBillCategory] = useState('Other');
  const [billNotes, setBillNotes] = useState('');
  
  // Warranty states
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyUntil, setWarrantyUntil] = useState('');

  const mutation = useCreateBill();

  const handleSubmit = () => {
    // 1. Validation
    if (!billName.trim() || !billAmount.trim() || !billDate.trim()) {
      Alert.alert('Required Fields', 'Please fill in Bill Name, Amount, and Date.');
      return;
    }

    const parsedAmount = parseFloat(billAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid total amount.');
      return;
    }

    const isoDate = parseDateToISO(billDate.trim());
    if (!isoDate) {
      Alert.alert('Invalid Date', 'Please enter a valid purchase date in DD/MM/YYYY format.');
      return;
    }

    // Optional numbers
    const parsedTax = taxAmount.trim() ? parseFloat(taxAmount) : undefined;
    if (parsedTax !== undefined && (isNaN(parsedTax) || parsedTax < 0)) {
      Alert.alert('Invalid Tax', 'Please enter a valid tax amount.');
      return;
    }

    const parsedDiscount = discountAmount.trim() ? parseFloat(discountAmount) : undefined;
    if (parsedDiscount !== undefined && (isNaN(parsedDiscount) || parsedDiscount < 0)) {
      Alert.alert('Invalid Discount', 'Please enter a valid discount amount.');
      return;
    }

    // Warranty parsing
    let isoWarrantyDate: string | undefined = undefined;
    if (hasWarranty) {
      if (!warrantyUntil.trim()) {
        Alert.alert('Warranty Field Required', 'Please enter a warranty expiration date.');
        return;
      }
      const parsedWarranty = parseDateToISO(warrantyUntil.trim());
      if (!parsedWarranty) {
        Alert.alert('Invalid Warranty Date', 'Please enter a valid warranty date in DD/MM/YYYY format.');
        return;
      }
      isoWarrantyDate = parsedWarranty;
    }

    // Optional subtotal calculation
    const taxVal = parsedTax || 0;
    const discountVal = parsedDiscount || 0;
    const calculatedSubtotal = parsedAmount - taxVal + discountVal;

    // 2. Build payload matching Create Bill API exactly
    const payload = {
      purchase_location: billName.trim(),
      total_amount: parsedAmount,
      purchase_date: isoDate,
      invoice_number: invoiceNumber.trim() || undefined,
      subtotal: calculatedSubtotal > 0 ? calculatedSubtotal : parsedAmount,
      tax_amount: parsedTax,
      discount_amount: parsedDiscount,
      payment_method: paymentMethod,
      currency: 'INR',
      payment_status: 'PAID',
      bill_status: 'DRAFT',
      warranty_until: isoWarrantyDate,
      notes: billNotes.trim() || undefined,
      category_id: null, // to be mapped by backend or linked later
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        Alert.alert('Success', `Bill "${billName}" added successfully!`);
        // Reset state
        setBillName('');
        setBillAmount('');
        setBillDate('');
        setInvoiceNumber('');
        setTaxAmount('');
        setDiscountAmount('');
        setPaymentMethod('UPI');
        setBillCategory('Other');
        setBillNotes('');
        setHasWarranty(false);
        setWarrantyUntil('');
        onClose();
      },
      onError: (err: any) => {
        Alert.alert('Upload Failed', err.message || 'Could not add bill. Please try again.');
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalSheet}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Bill Manually</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            {/* Required Fields Group */}
            <Text style={styles.sectionHeader}>Required Information</Text>

            <Text style={styles.fieldLabel}>Bill Name / Merchant *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Reliance Digital, Apple Store"
              placeholderTextColor="#BBB"
              value={billName}
              onChangeText={setBillName}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Total Amount (₹) *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. 15490"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  value={billAmount}
                  onChangeText={setBillAmount}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Purchase Date *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#BBB"
                  value={billDate}
                  onChangeText={setBillDate}
                />
              </View>
            </View>

            {/* Optional Fields Group */}
            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Additional Details (Optional)</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Invoice Number</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. INV-1002"
                  placeholderTextColor="#BBB"
                  value={invoiceNumber}
                  onChangeText={setInvoiceNumber}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Category</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Electronics, Food"
                  placeholderTextColor="#BBB"
                  value={billCategory}
                  onChangeText={setBillCategory}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Tax Amount (₹)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. 250"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  value={taxAmount}
                  onChangeText={setTaxAmount}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Discount (₹)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. 100"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  value={discountAmount}
                  onChangeText={setDiscountAmount}
                />
              </View>
            </View>

            {/* Payment Method Selector */}
            <Text style={styles.fieldLabel}>Payment Method</Text>
            <View style={styles.pickerWrapper}>
              {(['UPI', 'CARD', 'CASH', 'NET_BANKING'] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodChip,
                    paymentMethod === method && styles.methodChipActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.methodChipText,
                      paymentMethod === method && styles.methodChipTextActive,
                    ]}
                  >
                    {method.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Warranty Info Section */}
            <View style={styles.warrantyToggleRow}>
              <View>
                <Text style={styles.warrantyTitle}>Includes Warranty?</Text>
                <Text style={styles.warrantySubtitle}>Specify to track warranty expiry alert</Text>
              </View>
              <Switch
                value={hasWarranty}
                onValueChange={setHasWarranty}
                trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
                thumbColor={hasWarranty ? '#4B65E4' : '#F3F4F6'}
              />
            </View>

            {hasWarranty && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.fieldLabel}>Warranty Expiration Date *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#BBB"
                  value={warrantyUntil}
                  onChangeText={setWarrantyUntil}
                />
              </View>
            )}

            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMulti]}
              placeholder="Any additional details, descriptions or items..."
              placeholderTextColor="#BBB"
              multiline
              numberOfLines={3}
              value={billNotes}
              onChangeText={setBillNotes}
            />

            <TouchableOpacity
              style={[styles.submitBtn, mutation.isPending && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Add Bill</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 16, maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  modalClose: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F5F6FA', justifyContent: 'center', alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B65E4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  fieldInput: {
    height: 50, borderWidth: 1.5, borderColor: '#E8E8E8',
    borderRadius: 12, paddingHorizontal: 14, fontSize: 15,
    color: '#1A1A1A', backgroundColor: '#FAFAFA',
  },
  fieldInputMulti: { height: 90, paddingTop: 14, textAlignVertical: 'top' },
  
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  col: {
    flex: 1,
  },
  
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  methodChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E8E8E8', backgroundColor: '#FAFAFA',
  },
  methodChipActive: { backgroundColor: '#EEF2FF', borderColor: '#4B65E4' },
  methodChipText: { fontSize: 12, color: '#666', fontWeight: '600' },
  methodChipTextActive: { color: '#4B65E4', fontWeight: '700' },

  warrantyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  warrantyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  warrantySubtitle: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },

  submitBtn: {
    marginTop: 28, backgroundColor: '#4B65E4', borderRadius: 14,
    height: 54, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4B65E4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
