import React from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

import { useManualEntryForm } from '../hooks/useManualEntryForm';
import { CATEGORIES } from '../constants/categories';
import {
  parseDateTextToDate,
  getYesterday,
  formatDateToDDMMYYYY,
  sanitizePrice,
} from '../utils/uploadUtils';

import { CategorySelectorModal } from '../components/CategorySelectorModal';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';
import { AttachmentSelector } from '../components/AttachmentSelector';
import { ProductList } from '../components/ProductList';
import { ProductEntryForm } from '../components/ProductEntryForm';

export default function ManualEntryScreen() {
  const navigation = useNavigation<any>();

  // Pass navigation.goBack as the onClose handler to pop the screen upon completion
  const {
    billName,
    setBillName,
    billAmount,
    setBillAmount,
    billDate,
    setBillDate,
    showPurchasePicker,
    setShowPurchasePicker,
    tempDate,
    setTempDate,
    invoiceNumber,
    setInvoiceNumber,
    taxAmount,
    setTaxAmount,
    discountAmount,
    setDiscountAmount,
    paymentMethod,
    setPaymentMethod,
    billCategory,
    setBillCategory,
    showCategoryModal,
    setShowCategoryModal,
    billNotes,
    setBillNotes,
    products,
    productName,
    setProductName,
    productDescription,
    setProductDescription,
    productQty,
    setProductQty,
    productUnitPrice,
    setProductUnitPrice,
    productTax,
    setProductTax,
    productSerialNumber,
    setProductSerialNumber,
    productWarrantyMonths,
    setProductWarrantyMonths,
    showProductExtras,
    setShowProductExtras,
    selectedFile,
    productsTotal,
    handleSelectAttachment,
    handleAddProduct,
    handleRemoveProduct,
    handleSubmit,
    isPending,
    setSelectedFile,
    errors,
  } = useManualEntryForm(() => navigation.goBack());

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Bill Manually</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {/* Required Fields Group */}
          <Text style={styles.sectionHeader}>Required Information</Text>

          {errors?.form && (
            <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 13 }}>{errors.form}</Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>Bill Name / Merchant *</Text>
          <TextInput
            style={[styles.fieldInput, errors?.billName ? styles.inputError : null]}
            placeholder="e.g. Reliance Digital, Apple Store"
            placeholderTextColor="#BBB"
            value={billName}
            onChangeText={setBillName}
          />
          {errors?.billName && <Text style={styles.errorText}>{errors.billName}</Text>}

          <Text style={styles.fieldLabel}>Invoice / Bill Number *</Text>
          <TextInput
            style={[styles.fieldInput, errors?.invoiceNumber ? styles.inputError : null]}
            placeholder="e.g. INV-1002"
            placeholderTextColor="#BBB"
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
          />
          {errors?.invoiceNumber && <Text style={styles.errorText}>{errors.invoiceNumber}</Text>}

          <Text style={styles.fieldLabel}>Category *</Text>
          <TouchableOpacity
            style={[styles.dateSelector, errors?.billCategory ? styles.inputError : null]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.dateSelectorText, !billCategory && styles.placeholderText]}>
              {billCategory ? CATEGORIES.find((c) => c.id === billCategory)?.name : 'Select Category'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#888" />
          </TouchableOpacity>
          {errors?.billCategory && <Text style={styles.errorText}>{errors.billCategory}</Text>}

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Total Amount (₹) *</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: '#F3F4F6', color: '#6B7280' }]}
                placeholder="Total Amount"
                placeholderTextColor="#BBB"
                value={billAmount}
                editable={false}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Purchase Date *</Text>
              <TouchableOpacity
                style={[styles.dateSelector, errors?.billDate ? styles.inputError : null]}
                onPress={() => {
                  let current = parseDateTextToDate(billDate);
                  const maxDate = getYesterday();
                  if (!billDate || current > maxDate) {
                    current = maxDate;
                  }
                  setTempDate(current);
                  setShowPurchasePicker(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateSelectorText, !billDate && styles.placeholderText]}>
                  {billDate || 'DD/MM/YYYY'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#888" />
              </TouchableOpacity>
              {errors?.billDate && <Text style={styles.errorText}>{errors.billDate}</Text>}
            </View>

            {/* Purchase Date Picker - Android */}
            {Platform.OS === 'android' && showPurchasePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                maximumDate={getYesterday()}
                onChange={(event, selectedDate) => {
                  setShowPurchasePicker(false);
                  if (selectedDate && event.type !== 'dismissed') {
                    setBillDate(formatDateToDDMMYYYY(selectedDate));
                  }
                }}
              />
            )}

            {/* Purchase Date Picker - iOS Modal */}
            {Platform.OS === 'ios' && (
              <Modal
                visible={showPurchasePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPurchasePicker(false)}
              >
                <View style={styles.iosModalOverlay}>
                  <View style={styles.iosModalContainer}>
                    <View style={styles.iosModalHeader}>
                      <TouchableOpacity onPress={() => setShowPurchasePicker(false)}>
                        <Text style={styles.iosModalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setBillDate(formatDateToDDMMYYYY(tempDate));
                          setShowPurchasePicker(false);
                        }}
                      >
                        <Text style={styles.iosModalConfirmText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      maximumDate={getYesterday()}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setTempDate(selectedDate);
                      }}
                    />
                  </View>
                </View>
              </Modal>
            )}
          </View>

          {/* Products Section */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Products</Text>
          {errors?.products && (
            <Text style={[styles.errorText, { marginBottom: 10, marginTop: -5 }]}>{errors.products}</Text>
          )}

          <ProductList
            products={products}
            onRemoveProduct={handleRemoveProduct}
            productsTotal={productsTotal}
          />

          <ProductEntryForm
            productName={productName}
            setProductName={setProductName}
            productQty={productQty}
            setProductQty={setProductQty}
            productUnitPrice={productUnitPrice}
            setProductUnitPrice={setProductUnitPrice}
            productDescription={productDescription}
            setProductDescription={setProductDescription}
            productSerialNumber={productSerialNumber}
            setProductSerialNumber={setProductSerialNumber}
            productWarrantyMonths={productWarrantyMonths}
            setProductWarrantyMonths={setProductWarrantyMonths}
            productTax={productTax}
            setProductTax={setProductTax}
            showProductExtras={showProductExtras}
            setShowProductExtras={setShowProductExtras}
            onAddProduct={handleAddProduct}
            errors={errors}
          />

          {/* Optional Fields Group */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Additional Details (Optional)</Text>



          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>
                Tax Amount (₹) (Auto)
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  { backgroundColor: '#F3F4F6', color: '#6B7280' }
                ]}
                placeholder="Total Tax"
                placeholderTextColor="#BBB"
                value={taxAmount}
                editable={false}
              />
              {errors?.taxAmount && <Text style={styles.errorText}>{errors.taxAmount}</Text>}
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Discount (₹)</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  (discountAmount.trim() !== '' && parseFloat(discountAmount) >= productsTotal + (parseFloat(taxAmount) || 0)) || errors?.discountAmount
                    ? { borderColor: '#EF4444', borderWidth: 1 }
                    : null
                ]}
                placeholder="e.g. 100"
                placeholderTextColor="#BBB"
                keyboardType="numeric"
                value={discountAmount}
                onChangeText={(text) => setDiscountAmount(sanitizePrice(text))}
              />
              {((discountAmount.trim() !== '' && parseFloat(discountAmount) >= productsTotal + (parseFloat(taxAmount) || 0)) || errors?.discountAmount) && (
                <Text style={styles.errorText}>
                  {errors?.discountAmount || 'Must be less than total'}
                </Text>
              )}
            </View>
          </View>

          {/* Payment Method Selector */}
          <Text style={styles.fieldLabel}>Payment Method</Text>
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />

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

          <AttachmentSelector
            selectedFile={selectedFile}
            onSelectAttachment={handleSelectAttachment}
            onClearAttachment={() => setSelectedFile(null)}
          />

          <TouchableOpacity
            style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Add Bill</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Dropdown Modal */}
      <CategorySelectorModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        selectedCategoryId={billCategory}
        onSelectCategory={setBillCategory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
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
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
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

  dateSelector: {
    height: 50, borderWidth: 1.5, borderColor: '#E8E8E8',
    borderRadius: 12, paddingHorizontal: 14, fontSize: 15,
    backgroundColor: '#FAFAFA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dateSelectorText: { fontSize: 15, color: '#1A1A1A' },
  placeholderText: { color: '#BBB' },

  iosModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  iosModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  iosModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iosModalCancelText: {
    color: '#E14B4B',
    fontSize: 16,
    fontWeight: '600',
  },
  iosModalConfirmText: {
    color: '#4B65E4',
    fontSize: 16,
    fontWeight: '600',
  },
});
