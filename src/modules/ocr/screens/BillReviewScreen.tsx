import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import OcrScannerOverlay from '../components/OcrScannerOverlay';
import { CATEGORIES, DEFAULT_CATEGORY_ID, getCategoryById, getCategoryByName } from '../../../constants/categories';
import { CategorySelectorModal } from '../../upload/components/CategorySelectorModal';
import { PaymentMethodSelector } from '../../upload/components/PaymentMethodSelector';
import { AttachmentSelector } from '../../upload/components/AttachmentSelector';
import { ProductList } from '../../upload/components/ProductList';
import { ProductEntryForm } from '../../upload/components/ProductEntryForm';
import type { Product } from '../../upload/hooks/useManualEntryForm';
import {
  parseDateToISO,
  parseDateTextToDate,
  formatDateToDDMMYYYY,
  sanitizePrice,
  validateName,
  validateInvoiceNumber,
  hasEmoji,
  validateQuantity,
  validateLiveField,
  updateFieldErrors,
  validateSerialNumber,
} from '../../upload/utils/uploadUtils';

import { useCreateManualBill } from '../../bills/api/billsApi';
import { useScanOcrDocument } from '../../../services/mutation/ocr/ocrMutation';
import type { AppStackParamList } from '../../../navigation/AppNavigator';

type Navigation = NativeStackNavigationProp<AppStackParamList, 'BillReview'>;
type BillReviewRoute = RouteProp<AppStackParamList, 'BillReview'>;

export default function BillReviewScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<BillReviewRoute>();
  const { fileUri, fileName, fileType } = route.params;

  const createBillMutation = useCreateManualBill();
  const scanOcrMutation = useScanOcrDocument();

  // Linking documentId returned from POST /api/v1/ocr
  const [ocrDocumentId, setOcrDocumentId] = useState<string | null>(null);

  // OCR Loading & Error State
  const [isScanning, setIsScanning] = useState(true);
  const [scanningProgress, setScanningProgress] = useState(10);
  const [scanningStatus, setScanningStatus] = useState('📂 Uploading document to OCR server...');
  const [scanError, setScanError] = useState<string | null>(null);

  // Form Fields (matching normal bill upload UI)
  const [billName, setBillNameState] = useState('');
  const [invoiceNumber, setInvoiceNumberState] = useState('');

  const setBillName = (val: string) => {
    setBillNameState(val);
    const err = validateLiveField(val, { maxLength: 100, disallowEmoji: true, label: 'Store name' });
    setErrors((prev) => updateFieldErrors(prev, 'billName', err));
  };

  const setInvoiceNumber = (val: string) => {
    setInvoiceNumberState(val);
    const err = validateLiveField(val, { maxLength: 25, disallowEmoji: true, label: 'Invoice number' });
    setErrors((prev) => updateFieldErrors(prev, 'invoiceNumber', err));
  };
  const [billCategory, setBillCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [billDate, setBillDate] = useState(() => formatDateToDDMMYYYY(new Date()));

  // Date picker modal states
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showWarrantyPicker, setShowWarrantyPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductNameState] = useState('');

  const setProductName = (val: string) => {
    setProductNameState(val);
    const err = validateLiveField(val, { maxLength: 100, disallowEmoji: true, label: 'Product name' });
    setErrors((prev) => updateFieldErrors(prev, 'productName', err));
  };
  const [productDescription, setProductDescriptionState] = useState('');

  const setProductDescription = (val: string) => {
    setProductDescriptionState(val);
    const err = validateLiveField(val, { maxLength: 500, label: 'Description' });
    setErrors((prev) => updateFieldErrors(prev, 'productDescription', err));
  };
  const [productQty, setProductQty] = useState('1');
  const [productUnitPrice, setProductUnitPrice] = useState('');
  const [productTax, setProductTax] = useState('');
  const [productSerialNumber, setProductSerialNumberState] = useState('');

  const setProductSerialNumber = (val: string) => {
    setProductSerialNumberState(val);
    const err = validateLiveField(val, { maxLength: 50, disallowEmoji: true, requireAlphanumeric: true, disallowDot: true, label: 'Serial number' });
    setErrors((prev) => updateFieldErrors(prev, 'productSerialNumber', err));
  };
  const [productWarrantyMonths, setProductWarrantyMonths] = useState('');
  const [showProductExtras, setShowProductExtras] = useState(false);

  // Optional Fields
  const [taxAmount, setTaxAmount] = useState('0.00');
  const [discountAmount, setDiscountAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH' | 'NET_BANKING'>('UPI');
  const [billNotes, setBillNotesState] = useState('');

  const setBillNotes = (val: string) => {
    setBillNotesState(val);
    const err = validateLiveField(val, { maxLength: 500, label: 'Notes' });
    setErrors((prev) => updateFieldErrors(prev, 'billNotes', err));
  };

  // Warranty & Reminders
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyUntil, setWarrantyUntil] = useState('');
  const [selectedReminders, setSelectedReminders] = useState<Array<'30_DAYS' | '7_DAYS' | '1_DAY' | '1_HOUR'>>([]);

  // Attachment
  const [selectedFile, setSelectedFile] = useState<any>({
    uri: fileUri,
    name: fileName,
    mimeType: fileType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Product Calculations
  const productsTotal = useMemo(() => {
    return products.reduce((sum, p) => {
      const qty = parseFloat(p.quantity) || 0;
      const price = parseFloat(p.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  }, [products]);

  const calculatedTaxAmount = useMemo(() => {
    return products.reduce((sum, p) => {
      const tax = parseFloat(p.taxAmount) || 0;
      return sum + tax;
    }, 0).toFixed(2);
  }, [products]);

  useEffect(() => {
    setTaxAmount(calculatedTaxAmount);
  }, [calculatedTaxAmount]);

  useEffect(() => {
    const taxVal = parseFloat(calculatedTaxAmount) || 0;
    const discVal = parseFloat(discountAmount) || 0;
    const tot = productsTotal + taxVal - discVal;
    if (tot >= 0) {
      setBillAmount(tot.toFixed(2));
    }
  }, [productsTotal, calculatedTaxAmount, discountAmount]);

  // Execute real backend OCR scanning
  const runOcrScan = async () => {
    setIsScanning(true);
    setScanError(null);
    setScanningProgress(20);
    setScanningStatus('📂 Sending document to OCR server...');

    try {
      setScanningProgress(50);
      setScanningStatus('🔍 Extracting invoice data with AI...');

      const response = await scanOcrMutation.mutateAsync({
        uri: fileUri,
        fileName,
        fileType,
      });

      setScanningProgress(85);
      setScanningStatus('⚡ Processing structured fields...');

      const resData = (response as any)?.data || response;
      const documentId = resData?.documentId || resData?.document_id;
      const structured = resData?.structured || resData?.data?.structured || {};

      console.log('=== OCR SCAN RESULT ===');
      console.log('Raw Response:', JSON.stringify(response, null, 2));
      console.log('Document ID:', documentId);
      console.log('Structured Data:', JSON.stringify(structured, null, 2));
      console.log('=======================');

      if (documentId) {
        setOcrDocumentId(documentId);
      }

      // Pre-fill form fields
      const storeName = structured.purchase_location || structured.merchant_name;
      if (storeName) setBillName(storeName);
      if (structured.invoice_number) setInvoiceNumber(structured.invoice_number);
      if (structured.notes) setBillNotes(structured.notes);

      // Match category
      const rawCat = structured.category_id || structured.category;
      if (rawCat) {
        const found = getCategoryById(rawCat) || getCategoryByName(String(rawCat));
        setBillCategory(found?.id || DEFAULT_CATEGORY_ID);
      } else {
        setBillCategory(DEFAULT_CATEGORY_ID);
      }

      // Payment method
      if (structured.payment_method) {
        const pm = String(structured.payment_method).toUpperCase();
        if (['UPI', 'CARD', 'CASH', 'NET_BANKING'].includes(pm)) {
          setPaymentMethod(pm as any);
        }
      }

      // Purchase date
      if (structured.purchase_date) {
        const dateObj = new Date(structured.purchase_date);
        if (!isNaN(dateObj.getTime())) {
          setBillDate(formatDateToDDMMYYYY(dateObj));
        } else if (typeof structured.purchase_date === 'string') {
          setBillDate(structured.purchase_date);
        }
      }

      // Amounts
      if (typeof structured.total_amount === 'number' || typeof structured.total_amount === 'string') {
        setBillAmount(String(structured.total_amount));
      }
      if (typeof structured.discount_amount === 'number' || typeof structured.discount_amount === 'string') {
        setDiscountAmount(String(structured.discount_amount));
      }

      // Warranty
      if (structured.warranty_until) {
        const wDate = new Date(structured.warranty_until);
        if (!isNaN(wDate.getTime())) {
          setHasWarranty(true);
          setWarrantyUntil(formatDateToDDMMYYYY(wDate));
        }
      }

      // Line items / products
      if (Array.isArray(structured.bill_items) && structured.bill_items.length > 0) {
        const parsedProducts: Product[] = structured.bill_items.map((item: any, idx: number) => ({
          id: item.id || `${Date.now()}_${idx}`,
          itemName: item.item_name || item.name || `Item ${idx + 1}`,
          description: item.description || '',
          quantity: String(item.quantity || 1),
          unitPrice: String(item.unit_price || item.unitPrice || 0),
          taxAmount: String(item.tax_amount || item.taxAmount || 0),
          serialNumber: item.serial_number || item.serialNumber || '',
          warrantyMonths: String(item.warranty_months || item.warrantyMonths || ''),
        }));
        setProducts(parsedProducts);
      }

      setScanningProgress(100);
      setTimeout(() => {
        setIsScanning(false);
      }, 300);
    } catch (err: any) {
      console.warn('OCR Scanning backend failed, falling back:', err?.message || err);
      // Fallback pre-fill if OCR fails
      const lowerName = fileName.toLowerCase();
      if (lowerName.includes('apple') || lowerName.includes('iphone')) {
        setBillName('Apple Store');
        setInvoiceNumber('APL-INF-89028');
        setBillCategory(getCategoryByName('Electronics')?.id || DEFAULT_CATEGORY_ID);
        setPaymentMethod('CARD');
      } else {
        setBillName('');
        setInvoiceNumber('');
        setBillCategory(DEFAULT_CATEGORY_ID);
      }
      setScanError(err.response?.data?.message || err.message || 'OCR processing failed.');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    runOcrScan();
  }, [fileUri, fileName]);

  // Product addition
  const handleAddProduct = () => {
    const newErr: Record<string, string> = {};
    const productNameErr = validateName(productName, 'Product name');
    if (productNameErr) newErr.productName = productNameErr;
    const qtyErr = validateQuantity(productQty);
    if (qtyErr) newErr.productQty = qtyErr;
    if (!productUnitPrice.trim()) newErr.productUnitPrice = 'Unit price is required';
    const serialErr = validateSerialNumber(productSerialNumber, 50);
    if (serialErr) newErr.productSerialNumber = serialErr;

    if (Object.keys(newErr).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErr }));
      return;
    }

    const newProd: Product = {
      id: `${Date.now()}`,
      itemName: productName.trim(),
      description: productDescription.trim(),
      quantity: productQty.trim() || '1',
      unitPrice: productUnitPrice.trim(),
      taxAmount: productTax.trim() || '0',
      serialNumber: productSerialNumber.trim(),
      warrantyMonths: productWarrantyMonths.trim(),
    };

    setProducts((prev) => [...prev, newProd]);
    setProductName('');
    setProductDescription('');
    setProductQty('1');
    setProductUnitPrice('');
    setProductTax('');
    setProductSerialNumber('');
    setProductWarrantyMonths('');
    setShowProductExtras(false);
    setErrors({});
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: file.mimeType || 'application/pdf',
          size: file.size,
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to pick attachment.');
    }
  };

  const handleToggleReminder = (id: '30_DAYS' | '7_DAYS' | '1_DAY' | '1_HOUR') => {
    setSelectedReminders((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard this bill review? Any corrections will be lost.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  // Submit / Save Bill
  const handleSaveBill = () => {
    const errMap: Record<string, string> = {};
    const storeNameErr = validateName(billName, 'Store name', 100);
    if (storeNameErr) errMap.billName = storeNameErr;
    const invoiceErr = validateInvoiceNumber(invoiceNumber, 25);
    if (invoiceErr) errMap.invoiceNumber = invoiceErr;
    if (!billCategory) errMap.billCategory = 'Please select a category';
    if (!billDate.trim()) errMap.billDate = 'Purchase date is required';

    if (Object.keys(errMap).length > 0) {
      setErrors(errMap);
      return;
    }

    const isoPurchaseDate = parseDateToISO(billDate);
    if (!isoPurchaseDate) {
      setErrors({ billDate: 'Invalid date format (use DD/MM/YYYY)' });
      return;
    }

    let isoWarrantyDate: string | null = null;
    if (hasWarranty) {
      if (!warrantyUntil.trim()) {
        setErrors({ warrantyUntil: 'Warranty expiration date is required' });
        return;
      }
      isoWarrantyDate = parseDateToISO(warrantyUntil);
      if (!isoWarrantyDate) {
        setErrors({ warrantyUntil: 'Invalid date format (use DD/MM/YYYY)' });
        return;
      }
    }

    const numericTotal = parseFloat(billAmount) || productsTotal || 0;
    const numericTax = parseFloat(taxAmount) || 0;
    const numericDiscount = parseFloat(discountAmount) || 0;
    const numericSubtotal = productsTotal > 0
      ? productsTotal
      : Math.max(0, numericTotal - numericTax + numericDiscount);

    if (numericTotal <= 0) {
      Alert.alert('Validation Error', 'Total amount must be greater than 0.');
      return;
    }

    // Smart Validation: Supports both Format A (Gross Subtotal: Total = Subtotal + Tax - Discount)
    // and Format B (Net Taxable Subtotal: Total = Subtotal + Tax)
    const expectedGrossTotal = numericSubtotal + numericTax - numericDiscount;
    const expectedNetTotal = numericSubtotal + numericTax;

    const isGrossMatch = Math.abs(numericTotal - expectedGrossTotal) <= 0.05;
    const isNetMatch = Math.abs(numericTotal - expectedNetTotal) <= 0.05;

    if (!isGrossMatch && !isNetMatch) {
      Alert.alert(
        'Validation Error',
        `Total amount (₹${numericTotal.toFixed(2)}) does not match subtotal (₹${numericSubtotal.toFixed(2)}) and tax (₹${numericTax.toFixed(2)}).`
      );
      return;
    }

    const formData = new FormData();
    formData.append('purchase_location', billName.trim());
    formData.append('invoice_number', invoiceNumber.trim());
    formData.append('purchase_date', isoPurchaseDate);
    formData.append('total_amount', numericTotal.toString());
    formData.append('currency', 'INR');
    formData.append('payment_method', paymentMethod);
    formData.append('payment_status', 'PAID');
    formData.append('bill_status', 'DRAFT');
    formData.append('category_id', billCategory || '');

    if (productsTotal > 0) formData.append('subtotal', productsTotal.toString());
    if (parseFloat(taxAmount) > 0) formData.append('tax_amount', parseFloat(taxAmount).toString());
    if (parseFloat(discountAmount) > 0) formData.append('discount_amount', parseFloat(discountAmount).toString());
    if (billNotes.trim()) formData.append('notes', billNotes.trim());
    if (isoWarrantyDate) {
      formData.append('warranty_until', isoWarrantyDate);
      if (hasWarranty && selectedReminders.length > 0) {
        formData.append('reminders', JSON.stringify(selectedReminders));
      }
    }
    if (ocrDocumentId) formData.append('ocr_document_id', ocrDocumentId);

    if (products.length > 0) {
      const items = products.map((p) => {
        const item: any = {
          item_name: p.itemName,
          quantity: parseFloat(p.quantity) || 1,
          unit_price: parseFloat(p.unitPrice) || 0,
        };
        if (p.description) item.description = p.description;
        if (parseFloat(p.taxAmount) > 0) item.tax_amount = parseFloat(p.taxAmount);
        if (p.serialNumber) item.serial_number = p.serialNumber;
        if (parseFloat(p.warrantyMonths) > 0) item.warranty_months = parseFloat(p.warrantyMonths);
        return item;
      });
      formData.append('bill_items', JSON.stringify(items));
    }

    const fileToUpload = selectedFile || (fileUri ? { uri: fileUri, name: fileName || 'scanned_bill.jpg', mimeType: fileType || 'image/jpeg' } : null);
    if (fileToUpload && fileToUpload.uri) {
      formData.append('attachments', {
        uri: fileToUpload.uri,
        name: fileToUpload.name || fileToUpload.fileName || 'scanned_bill.jpg',
        type: fileToUpload.mimeType || fileToUpload.type || fileToUpload.fileType || 'image/jpeg',
      } as any);
    }

    createBillMutation.mutate(formData as any, {
      onSuccess: () => {
        Alert.alert('Success', 'Bill uploaded and saved successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Dashboard');
            },
          },
        ]);
      },
      onError: (err: any) => {
        Alert.alert('Error', err.message || 'Could not save bill. Please try again.');
      },
    });
  };

  if (isScanning) {
    return (
      <OcrScannerOverlay
        fileName={fileName}
        fileUri={fileUri}
        fileType={fileType}
        progress={scanningProgress}
        statusText={scanningStatus}
        extractedDetails={{
          merchant: billName,
          date: billDate,
          total: billAmount,
          category: CATEGORIES.find((c) => c.id === billCategory)?.name || 'General',
        }}
        onComplete={() => setIsScanning(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header matching normal bill upload screen */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Extracted Bill</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {scanError && (
            <View style={styles.scanErrorBanner}>
              <Ionicons name="warning-outline" size={20} color="#D97706" style={{ marginRight: 8 }} />
              <Text style={styles.scanErrorText}>
                Automatic extraction notice: {scanError}. Please review and complete fields below manually.
              </Text>
              <TouchableOpacity onPress={runOcrScan} style={styles.retryScanBtn}>
                <Ionicons name="refresh" size={14} color="#D97706" />
                <Text style={styles.retryScanText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

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
            maxLength={120}
          />
          {errors?.billName && <Text style={styles.errorText}>{errors.billName}</Text>}

          <Text style={styles.fieldLabel}>Invoice / Bill Number *</Text>
          <TextInput
            style={[styles.fieldInput, errors?.invoiceNumber ? styles.inputError : null]}
            placeholder="e.g. INV-1002"
            placeholderTextColor="#BBB"
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            maxLength={25}
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
                  const maxDate = new Date();
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
                maximumDate={new Date()}
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
                      maximumDate={new Date()}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setTempDate(selectedDate);
                      }}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Warranty Date Picker - Android */}
            {Platform.OS === 'android' && showWarrantyPicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowWarrantyPicker(false);
                  if (selectedDate && event.type !== 'dismissed') {
                    setWarrantyUntil(formatDateToDDMMYYYY(selectedDate));
                  }
                }}
              />
            )}

            {/* Warranty Date Picker - iOS Modal */}
            {Platform.OS === 'ios' && (
              <Modal
                visible={showWarrantyPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowWarrantyPicker(false)}
              >
                <View style={styles.iosModalOverlay}>
                  <View style={styles.iosModalContainer}>
                    <View style={styles.iosModalHeader}>
                      <TouchableOpacity onPress={() => setShowWarrantyPicker(false)}>
                        <Text style={styles.iosModalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setWarrantyUntil(formatDateToDDMMYYYY(tempDate));
                          setShowWarrantyPicker(false);
                        }}
                      >
                        <Text style={styles.iosModalConfirmText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      minimumDate={new Date()}
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

          {/* Additional Details (Optional) */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Additional Details (Optional)</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Tax Amount (₹) (Auto)</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: '#F3F4F6', color: '#6B7280' }]}
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

          {/* Warranty & Reminders */}
          <View style={{ marginTop: 14 }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}
              onPress={() => setHasWarranty(!hasWarranty)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={hasWarranty ? 'checkbox' : 'square-outline'}
                size={22}
                color={hasWarranty ? '#4B65E4' : '#888'}
              />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginLeft: 8 }}>
                Add Warranty Expiration
              </Text>
            </TouchableOpacity>

            {hasWarranty && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.fieldLabel}>Warranty Expiration Date</Text>
                <TouchableOpacity
                  style={[styles.dateSelector, errors?.warrantyUntil ? styles.inputError : null]}
                  onPress={() => {
                    let current = parseDateTextToDate(warrantyUntil);
                    if (!warrantyUntil) current = new Date();
                    setTempDate(current);
                    setShowWarrantyPicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateSelectorText, !warrantyUntil && styles.placeholderText]}>
                    {warrantyUntil || 'DD/MM/YYYY'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#888" />
                </TouchableOpacity>
                {errors?.warrantyUntil && <Text style={styles.errorText}>{errors.warrantyUntil}</Text>}

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Remind Me Before Expiry</Text>
                <View style={styles.reminderContainer}>
                  {[
                    { id: '30_DAYS', label: '30 Days Before' },
                    { id: '7_DAYS', label: '7 Days Before' },
                    { id: '1_DAY', label: '1 Day Before' },
                    { id: '1_HOUR', label: '1 Hour Before' },
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
                          size={16}
                          color={isSelected ? '#4B65E4' : '#666'}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.reminderPillText, isSelected && styles.reminderPillTextSelected]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Payment Method Selector */}
          <Text style={styles.fieldLabel}>Payment Method</Text>
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: billNotes.length >= 500 ? '#EF4444' : '#888', marginTop: 14, marginBottom: 6 }}>
              {billNotes.length}/500
            </Text>
          </View>
          <TextInput
            style={[styles.fieldInput, styles.fieldInputMulti, errors?.billNotes ? styles.inputError : null]}
            placeholder="Any additional details, descriptions or items..."
            placeholderTextColor="#BBB"
            multiline
            numberOfLines={3}
            value={billNotes}
            onChangeText={setBillNotes}
            maxLength={500}
          />
          {errors?.billNotes && <Text style={styles.errorText}>{errors.billNotes}</Text>}

          <AttachmentSelector
            selectedFile={selectedFile}
            onSelectAttachment={handleSelectAttachment}
            onClearAttachment={() => setSelectedFile(null)}
          />

          <TouchableOpacity
            style={[styles.submitBtn, createBillMutation.isPending && styles.submitBtnDisabled]}
            onPress={handleSaveBill}
            activeOpacity={0.85}
            disabled={createBillMutation.isPending}
          >
            {createBillMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Save & Categorize Bill</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selector Modal */}
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

  scanErrorBanner: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanErrorText: {
    color: '#92400E',
    fontSize: 12.5,
    flex: 1,
    lineHeight: 17,
  },
  retryScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    gap: 4,
  },
  retryScanText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },
});
