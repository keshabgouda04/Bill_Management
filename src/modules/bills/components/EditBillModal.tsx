import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BillDetail, PaymentStatus, UpdateBillPayload, useUpdateBill } from '../api/billsApi';
import { CATEGORIES } from '../../upload/constants/categories';
import { CategorySelectorModal } from '../../upload/components/CategorySelectorModal';

interface EditBillModalProps {
  visible: boolean;
  bill?: BillDetail;
  onClose: () => void;
}

const PAYMENT_METHODS = ['UPI', 'CARD', 'CASH', 'NET_BANKING'];
const PAYMENT_STATUSES: PaymentStatus[] = ['PAID', 'UNPAID', 'PARTIAL', 'REFUNDED'];
const AMOUNT_TOLERANCE = 0.01;
const MAX_INVOICE_LENGTH = 80;
const MAX_LOCATION_LENGTH = 120;
const MAX_NOTES_LENGTH = 500;

const formatDateInput = (date?: string | null) => {
  if (!date) return '';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
};

const parseDateToISO = (dateStr: string): string | null => {
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);

  if (!day || month < 0 || month > 11 || !year) return null;

  const date = new Date(year, month, day, 12, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
};

const formatNumberInput = (value?: number | null) => {
  return typeof value === 'number' ? String(value) : '';
};

const parseNumberInput = (
  value: string,
  options?: { required?: boolean; greaterThanZero?: boolean },
) => {
  const trimmedValue = value.trim();

  if (!trimmedValue && !options?.required) {
    return 0;
  }

  if (!trimmedValue) {
    return null;
  }

  const parsed = Number(trimmedValue);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  if (options?.greaterThanZero && parsed <= 0) {
    return null;
  }

  return parsed;
};

export default function EditBillModal({ visible, bill, onClose }: EditBillModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [billCategory, setBillCategory] = useState('');
  const [warrantyUntil, setWarrantyUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedReminders, setSelectedReminders] = useState<Array<'30_DAYS' | '7_DAYS' | '1_DAY' | '1_HOUR'>>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleToggleReminder = (type: '30_DAYS' | '7_DAYS' | '1_DAY' | '1_HOUR') => {
    setSelectedReminders((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const mutation = useUpdateBill();

  const hasProducts = Boolean(bill?.bill_items && bill.bill_items.length > 0);
  const productsTotal = bill?.bill_items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
  const productsTaxTotal = bill?.bill_items?.reduce((sum, item) => sum + (item.tax_amount || 0), 0) || 0;

  useEffect(() => {
    if (!visible || !bill) return;

    setInvoiceNumber(bill.invoice_number || '');
    setPurchaseLocation(bill.purchase_location || '');
    setPurchaseDate(formatDateInput(bill.purchase_date));
    setCurrency(bill.currency || 'INR');
    setPaymentMethod(bill.payment_method || 'UPI');
    setPaymentStatus(bill.payment_status || 'PAID');
    setWarrantyUntil(formatDateInput(bill.warranty_until));
    setSelectedReminders(bill.reminders || []);
    setNotes(bill.notes || '');
    setBillCategory(bill.category_id || '');

    if (hasProducts) {
      setSubtotal(formatNumberInput(productsTotal));
      setTaxAmount(formatNumberInput(productsTaxTotal));
      const initialDiscount = bill.discount_amount || 0;
      setDiscountAmount(formatNumberInput(initialDiscount));
      setTotalAmount(formatNumberInput(productsTotal + productsTaxTotal - initialDiscount));
    } else {
      setSubtotal(formatNumberInput(bill.subtotal));
      setTaxAmount(formatNumberInput(bill.tax_amount));
      setDiscountAmount(formatNumberInput(bill.discount_amount));
      setTotalAmount(formatNumberInput(bill.total_amount));
    }
  }, [bill, visible]);

  const handleDiscountChange = (text: string) => {
    setDiscountAmount(text);
    if (hasProducts) {
      const disc = parseFloat(text) || 0;
      setTotalAmount(formatNumberInput(productsTotal + productsTaxTotal - disc));
    }
  };

  const handleSave = () => {
    if (!bill) return;

    const trimmedInvoiceNumber = invoiceNumber.trim();
    const trimmedPurchaseLocation = purchaseLocation.trim();
    const trimmedPurchaseDate = purchaseDate.trim();
    const trimmedCurrency = currency.trim().toUpperCase();
    const trimmedWarrantyUntil = warrantyUntil.trim();
    const trimmedNotes = notes.trim();
    const trimmedCategory = billCategory.trim();

    if (!trimmedPurchaseLocation) {
      Alert.alert('Required Field', 'Please enter merchant or store name.');
      return;
    }

    if (trimmedPurchaseLocation.length > MAX_LOCATION_LENGTH) {
      Alert.alert('Invalid Merchant', `Merchant or store name can be up to ${MAX_LOCATION_LENGTH} characters.`);
      return;
    }

    if (!trimmedInvoiceNumber) {
      Alert.alert('Required Field', 'Please enter invoice number.');
      return;
    }

    if (trimmedInvoiceNumber.length > MAX_INVOICE_LENGTH) {
      Alert.alert('Invalid Invoice Number', `Invoice number can be up to ${MAX_INVOICE_LENGTH} characters.`);
      return;
    }

    if (!trimmedPurchaseDate) {
      Alert.alert('Required Field', 'Please enter purchase date.');
      return;
    }

    const parsedPurchaseDate = parseDateToISO(trimmedPurchaseDate);
    if (!parsedPurchaseDate) {
      Alert.alert('Invalid Date', 'Please enter purchase date in DD/MM/YYYY format.');
      return;
    }

    if (!/^[A-Z]{3}$/.test(trimmedCurrency)) {
      Alert.alert('Invalid Currency', 'Currency must be a 3-letter code such as INR.');
      return;
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      Alert.alert('Invalid Payment Method', 'Please select a valid payment method.');
      return;
    }

    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      Alert.alert('Invalid Payment Status', 'Please select a valid payment status.');
      return;
    }

    if (trimmedNotes.length > MAX_NOTES_LENGTH) {
      Alert.alert('Invalid Notes', `Notes can be up to ${MAX_NOTES_LENGTH} characters.`);
      return;
    }

    const parsedSubtotal = parseNumberInput(subtotal, { required: true });
    const parsedTax = parseNumberInput(taxAmount);
    const parsedDiscount = parseNumberInput(discountAmount);
    const parsedTotal = parseNumberInput(totalAmount, { required: true, greaterThanZero: true });

    if (parsedSubtotal === null) {
      Alert.alert('Invalid Amount', 'Please enter a valid subtotal.');
      return;
    }

    if (parsedTax === null) {
      Alert.alert('Invalid Amount', 'Please enter a valid tax amount.');
      return;
    }

    if (parsedDiscount === null) {
      Alert.alert('Invalid Amount', 'Please enter a valid discount amount.');
      return;
    }

    if (parsedTotal === null) {
      Alert.alert('Invalid Amount', 'Total amount must be greater than zero.');
      return;
    }

    const calculatedTotal = parsedSubtotal + parsedTax - parsedDiscount;

    if (calculatedTotal < 0) {
      Alert.alert('Invalid Amounts', 'Discount cannot be greater than subtotal plus tax.');
      return;
    }

    if (Math.abs(calculatedTotal - parsedTotal) > AMOUNT_TOLERANCE) {
      Alert.alert('Invalid Total', 'Total amount should match subtotal plus tax minus discount.');
      return;
    }

    const parsedWarrantyDate = trimmedWarrantyUntil ? parseDateToISO(trimmedWarrantyUntil) : null;
    if (trimmedWarrantyUntil && !parsedWarrantyDate) {
      Alert.alert('Invalid Date', 'Please enter warranty date in DD/MM/YYYY format.');
      return;
    }

    if (parsedWarrantyDate && new Date(parsedWarrantyDate).getTime() < new Date(parsedPurchaseDate).getTime()) {
      Alert.alert('Invalid Warranty', 'Warranty date cannot be before purchase date.');
      return;
    }

    const payload: UpdateBillPayload = {};

    const addTextChange = (key: keyof UpdateBillPayload, nextValue: string, previousValue?: string | null) => {
      const next = nextValue.trim();
      const previous = previousValue || '';
      if (next !== previous) {
        payload[key] = next as never;
      }
    };

    const addNumberChange = (key: keyof UpdateBillPayload, nextValue: number, previousValue?: number | null) => {
      if (nextValue !== (previousValue || 0)) {
        payload[key] = nextValue as never;
      }
    };

    addTextChange('invoice_number', trimmedInvoiceNumber, bill.invoice_number);
    addTextChange('purchase_location', trimmedPurchaseLocation, bill.purchase_location);
    addTextChange('currency', trimmedCurrency, bill.currency);
    addTextChange('payment_method', paymentMethod, bill.payment_method);
    addTextChange('notes', trimmedNotes, bill.notes);

    if (trimmedCategory !== (bill.category_id || 'Other')) {
      payload.category_id = trimmedCategory || null;
    }

    if (paymentStatus !== bill.payment_status) {
      payload.payment_status = paymentStatus;
    }

    addNumberChange('subtotal', parsedSubtotal, bill.subtotal);
    addNumberChange('tax_amount', parsedTax, bill.tax_amount);
    addNumberChange('discount_amount', parsedDiscount, bill.discount_amount);
    addNumberChange('total_amount', parsedTotal, bill.total_amount);

    if (trimmedPurchaseDate !== formatDateInput(bill.purchase_date)) {
      payload.purchase_date = parsedPurchaseDate;
    }

    if (trimmedWarrantyUntil !== formatDateInput(bill.warranty_until)) {
      if (!trimmedWarrantyUntil) {
        payload.warranty_until = null;
      } else if (parsedWarrantyDate) {
        payload.warranty_until = parsedWarrantyDate;
      }
    }

    payload.reminders = selectedReminders;

    if (Object.keys(payload).length === 0) {
      Alert.alert('No Changes', 'Please update at least one field before saving.');
      return;
    }

    mutation.mutate(
      { billId: bill.id, data: payload },
      {
        onSuccess: () => {
          onClose();
          Alert.alert('Success', 'Bill updated successfully.');
        },
        onError: (error: any) => {
          Alert.alert('Update Failed', error.message || 'Could not update bill.');
        },
      },
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.dismissOverlay} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalSheet}
        >
          <View style={styles.grabHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Bill</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.sectionHeader}>Bill Details</Text>

            <Text style={styles.fieldLabel}>Merchant / Store *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Myntra"
              placeholderTextColor="#BBB"
              value={purchaseLocation}
              onChangeText={setPurchaseLocation}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Invoice Number *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. INV-1001"
                  placeholderTextColor="#BBB"
                  value={invoiceNumber}
                  onChangeText={setInvoiceNumber}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Purchase Date</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: '#EAEAEA', color: '#666' }]}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#BBB"
                  value={purchaseDate}
                  editable={false}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity
              style={[styles.fieldInput, { justifyContent: 'center' }]}
              onPress={() => setShowCategoryModal(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: billCategory ? '#1A1A1A' : '#BBB', fontSize: 15 }}>
                  {billCategory ? CATEGORIES.find((c) => c.id === billCategory)?.name : 'Select Category'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#888" />
              </View>
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Warranty Expiry Date</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#BBB"
              value={warrantyUntil}
              onChangeText={setWarrantyUntil}
            />

            <Text style={styles.fieldLabel}>Remind Me Before Expiry</Text>
            <View style={styles.reminderContainer}>
              {[
                { id: '30_DAYS', label: '30 Days' },
                { id: '7_DAYS', label: '7 Days' },
                { id: '1_DAY', label: '1 Day' },
                { id: '1_HOUR', label: '1 Hour' },
              ].map((item) => {
                const isSelected = selectedReminders.includes(item.id as any);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.reminderPill, isSelected && styles.reminderPillSelected]}
                    onPress={() => handleToggleReminder(item.id as any)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'notifications-outline'}
                      size={14}
                      color={isSelected ? '#4B65E4' : '#666'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.reminderPillText, isSelected && styles.reminderPillTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionHeader}>Payment</Text>

            <Text style={styles.fieldLabel}>Payment Method</Text>
            <View style={styles.chipWrap}>
              {PAYMENT_METHODS.map((method) => (
                <View
                  key={method}
                  style={[styles.chip, paymentMethod === method && styles.chipActive, { opacity: 0.8 }]}
                >
                  <Text style={[styles.chipText, paymentMethod === method && styles.chipTextActive, { color: paymentMethod === method ? '#4B65E4' : '#999' }]}>
                    {method.replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Payment Status</Text>
            <View style={styles.chipWrap}>
              {PAYMENT_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.chip, paymentStatus === status && styles.chipActive]}
                  onPress={() => setPaymentStatus(status)}
                >
                  <Text style={[styles.chipText, paymentStatus === status && styles.chipTextActive]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionHeader}>Amounts (Read-only)</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Subtotal</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: '#EAEAEA', color: '#666' }]}
                  keyboardType="numeric"
                  value={subtotal}
                  editable={false}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Tax Amount (₹)</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: '#EAEAEA', color: '#666' }]}
                  keyboardType="numeric"
                  value={taxAmount}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Discount Amount (₹)</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: '#EAEAEA', color: '#666' }]}
                  keyboardType="numeric"
                  value={discountAmount}
                  editable={false}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Total Amount (₹)</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: '#EAEAEA', color: '#666' }]}
                  keyboardType="numeric"
                  value={totalAmount}
                  editable={false}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMulti]}
              placeholder="Add notes"
              placeholderTextColor="#BBB"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity
              style={[styles.saveBtn, mutation.isPending && styles.saveBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Category Dropdown Modal */}
      <CategorySelectorModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        selectedCategoryId={billCategory}
        onSelectCategory={setBillCategory}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: '92%',
  },
  grabHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B65E4',
    textTransform: 'uppercase',
    marginTop: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 14,
  },
  fieldInput: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  fieldInputMulti: {
    height: 90,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  col: {
    flex: 1,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    backgroundColor: '#FAFAFA',
  },
  chipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4B65E4',
  },
  chipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#4B65E4',
    fontWeight: '800',
  },
  saveBtn: {
    marginTop: 28,
    backgroundColor: '#4B65E4',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4B65E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  reminderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  reminderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reminderPillSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4B65E4',
  },
  reminderPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  reminderPillTextSelected: {
    color: '#4B65E4',
    fontWeight: '600',
  },
});

