import React, { useState, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCreateBill } from '../../bills/api/billsApi';

interface ManualEntryModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Product {
  id: string;
  itemName: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxAmount: string;
  serialNumber: string;
  warrantyMonths: string;
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

const parseDateTextToDate = (dateStr: string): Date => {
  if (!dateStr.trim()) return new Date();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return new Date();
};

const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const CATEGORIES = [
  { id: '3334f0da-b7ce-4c9d-bc26-d0ae0374fed1', name: 'Groceries' },
  { id: '6644910b-b733-47b7-85f9-48d0ca6fc86a', name: 'Dining' },
  { id: 'ba621ad1-a786-44c6-ae6e-13f53380a75c', name: 'Utilities' },
  { id: 'ef84449d-36e0-4df3-892f-aff668c051c9', name: 'Transportation' },
  { id: '04546ff9-bb72-4786-825d-85583aa58f49', name: 'Entertainment' },
  { id: 'efd8855d-a6c5-45ce-9c11-8025c6cb8c89', name: 'Electronics' },
  { id: '83043609-6e75-4d93-82b9-c439deec42d2', name: 'Shopping' },
  { id: '60018b6c-0aef-4f3b-ad68-6a9035676df2', name: 'Healthcare' },
  { id: 'a1cb7d86-f8bb-4e43-a747-e551f4efcf74', name: 'Education' },
  { id: 'e71537dc-c15c-4875-8b50-b2b7c5378be5', name: 'Travel' },
  { id: '0fb1ddb0-d3a3-44d6-8602-363edbc78959', name: 'Home & Furniture' },
  { id: '64a265f6-617f-4643-a753-0aac2f3df3e9', name: 'Fashion' },
  { id: '3aa49dcc-74ee-448e-8425-cecef36265d7', name: 'Insurance' },
  { id: 'aea62965-dc00-4418-8290-3bdc33f1fd1e', name: 'Business' },
  { id: 'e017f7ac-9932-44cb-bceb-b01fe171fa62', name: 'Subscription' },
  { id: 'f27c6346-1d5e-4da4-945a-a70b99c431f0', name: 'Pet Care' },
  { id: 'ae01487b-2a6e-4438-b018-7fb6005dfbde', name: 'Gifts' },
  { id: '64f833b5-6566-4e49-939d-98bd63b845fb', name: 'Taxes' },
  { id: 'b9bfcee8-6d48-4e17-9c07-b76fc4660e40', name: 'Others' },
];

export const ManualEntryModal = ({ visible, onClose }: ManualEntryModalProps) => {
  // Required fields
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDate, setBillDate] = useState('');

  // Date picker visibility states
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showWarrantyPicker, setShowWarrantyPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Optional backend fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH' | 'NET_BANKING'>('UPI');
  const [billCategory, setBillCategory] = useState('b9bfcee8-6d48-4e17-9c07-b76fc4660e40'); // default to Others UUID
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [billNotes, setBillNotes] = useState('');

  // Warranty states
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyUntil, setWarrantyUntil] = useState('');

  // Products (bill_items) state
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productQty, setProductQty] = useState('1');
  const [productUnitPrice, setProductUnitPrice] = useState('');
  const [productTax, setProductTax] = useState('');
  const [productSerialNumber, setProductSerialNumber] = useState('');
  const [productWarrantyMonths, setProductWarrantyMonths] = useState('');
  const [showProductExtras, setShowProductExtras] = useState(false);

  const mutation = useCreateBill();

  useEffect(() => {
    if (products.length > 0) {
      const productsTaxTotal = products.reduce((sum, p) => {
        const taxVal = parseFloat(p.taxAmount) || 0;
        return sum + taxVal;
      }, 0);
      setTaxAmount(productsTaxTotal > 0 ? String(productsTaxTotal) : '0');
    }
  }, [products]);

  const handleAddProduct = () => {
    if (!productName.trim()) {
      Alert.alert('Product Name Required', 'Please enter a product name.');
      return;
    }

    const parsedPrice = parseFloat(productUnitPrice);
    if (!productUnitPrice.trim() || isNaN(parsedPrice) || parsedPrice < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid unit price.');
      return;
    }

    const parsedQty = productQty.trim() ? parseFloat(productQty) : 1;
    if (isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    const parsedTax = productTax.trim() ? parseFloat(productTax) : undefined;
    if (parsedTax !== undefined && (isNaN(parsedTax) || parsedTax < 0)) {
      Alert.alert('Invalid Tax', 'Please enter a valid tax amount for this item.');
      return;
    }

    const parsedWarrantyMonths = productWarrantyMonths.trim()
      ? parseInt(productWarrantyMonths, 10)
      : undefined;
    if (parsedWarrantyMonths !== undefined && (isNaN(parsedWarrantyMonths) || parsedWarrantyMonths < 0)) {
      Alert.alert('Invalid Warranty', 'Please enter a valid number of warranty months.');
      return;
    }

    const newProduct: Product = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      itemName: productName.trim(),
      description: productDescription.trim(),
      quantity: String(parsedQty),
      unitPrice: String(parsedPrice),
      taxAmount: parsedTax !== undefined ? String(parsedTax) : '',
      serialNumber: productSerialNumber.trim(),
      warrantyMonths: parsedWarrantyMonths !== undefined ? String(parsedWarrantyMonths) : '',
    };

    setProducts((prev) => [...prev, newProduct]);
    setProductName('');
    setProductDescription('');
    setProductQty('1');
    setProductUnitPrice('');
    setProductTax('');
    setProductSerialNumber('');
    setProductWarrantyMonths('');
    setShowProductExtras(false);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const productsTotal = products.reduce((sum, p) => {
    const qty = parseFloat(p.quantity) || 0;
    const price = parseFloat(p.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = () => {
    // 1. Validation
    if (productName.trim()) {
      Alert.alert(
        'Unsaved Product Info',
        'You have entered product details but have not tapped "Add Product". Please either save the product to the list first or clear the fields.'
      );
      return;
    }

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
      category_id: billCategory,
      bill_items: products.length
        ? products.map((p) => ({
            item_name: p.itemName,
            description: p.description || undefined,
            quantity: parseFloat(p.quantity) || 0,
            unit_price: parseFloat(p.unitPrice) || 0,
            tax_amount: p.taxAmount.trim() ? parseFloat(p.taxAmount) : undefined,
            serial_number: p.serialNumber.trim() || undefined,
            warranty_months: p.warrantyMonths.trim() ? parseInt(p.warrantyMonths, 10) : undefined,
          }))
        : undefined,
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
        setBillCategory('b9bfcee8-6d48-4e17-9c07-b76fc4660e40');
        setBillNotes('');
        setHasWarranty(false);
        setWarrantyUntil('');
        setProducts([]);
        setProductName('');
        setProductDescription('');
        setProductQty('1');
        setProductUnitPrice('');
        setProductTax('');
        setProductSerialNumber('');
        setProductWarrantyMonths('');
        setShowProductExtras(false);
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
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => {
                    const current = parseDateTextToDate(billDate);
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
              </View>

              {/* Purchase Date Picker - Android */}
              {Platform.OS === 'android' && showPurchasePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="default"
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

            {products.length > 0 && (
              <View style={styles.productList}>
                {products.map((p) => (
                  <View key={p.id} style={styles.productRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{p.itemName}</Text>
                      <Text style={styles.productMeta}>
                        {p.quantity} × ₹{p.unitPrice} = ₹
                        {(parseFloat(p.quantity) * parseFloat(p.unitPrice)).toFixed(2)}
                      </Text>
                      {!!p.description && <Text style={styles.productMeta}>{p.description}</Text>}
                      {(!!p.serialNumber || !!p.warrantyMonths || !!p.taxAmount) && (
                        <Text style={styles.productMeta}>
                          {[
                            p.serialNumber ? `S/N: ${p.serialNumber}` : null,
                            p.warrantyMonths ? `Warranty: ${p.warrantyMonths} mo` : null,
                            p.taxAmount ? `Tax: ₹${p.taxAmount}` : null,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveProduct(p.id)}
                      style={styles.productRemoveBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color="#E14B4B" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.productTotalRow}>
                  <Text style={styles.productTotalLabel}>Products Total</Text>
                  <Text style={styles.productTotalValue}>₹{productsTotal.toFixed(2)}</Text>
                </View>
              </View>
            )}

            <Text style={styles.fieldLabel}>Product Name *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. iPhone Case"
              placeholderTextColor="#BBB"
              value={productName}
              onChangeText={setProductName}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Quantity</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="1"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  value={productQty}
                  onChangeText={setProductQty}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Unit Price (₹) *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. 499"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  value={productUnitPrice}
                  onChangeText={setProductUnitPrice}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.productExtrasToggle}
              onPress={() => setShowProductExtras((prev) => !prev)}
            >
              <Ionicons
                name={showProductExtras ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#4B65E4"
              />
              <Text style={styles.productExtrasToggleText}>
                {showProductExtras ? 'Hide' : 'Add'} description, serial number, warranty & tax
              </Text>
            </TouchableOpacity>

            {showProductExtras && (
              <>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Blue, 128GB variant"
                  placeholderTextColor="#BBB"
                  value={productDescription}
                  onChangeText={setProductDescription}
                />

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.fieldLabel}>Serial Number</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g. SN123456"
                      placeholderTextColor="#BBB"
                      value={productSerialNumber}
                      onChangeText={setProductSerialNumber}
                    />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.fieldLabel}>Warranty (months)</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g. 12"
                      placeholderTextColor="#BBB"
                      keyboardType="numeric"
                      value={productWarrantyMonths}
                      onChangeText={setProductWarrantyMonths}
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Item Tax Amount (₹)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. 25"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  value={productTax}
                  onChangeText={setProductTax}
                />
              </>
            )}

            <TouchableOpacity style={styles.addProductBtn} onPress={handleAddProduct} activeOpacity={0.85}>
              <Ionicons name="add-circle-outline" size={18} color="#4B65E4" />
              <Text style={styles.addProductBtnText}>Add Product</Text>
            </TouchableOpacity>

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
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text style={styles.dateSelectorText}>
                    {CATEGORIES.find((c) => c.id === billCategory)?.name || 'Others'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#888" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>
                  Tax Amount (₹){products.length > 0 ? ' (Auto)' : ''}
                </Text>
                <TextInput
                  style={[
                    styles.fieldInput,
                    products.length > 0 && { backgroundColor: '#EAEAEA', color: '#666' }
                  ]}
                  placeholder="e.g. 250"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  value={taxAmount}
                  onChangeText={setTaxAmount}
                  editable={products.length === 0}
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
            {/* <View style={styles.warrantyToggleRow}>
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
            </View> */}

            {/* {hasWarranty && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.fieldLabel}>Warranty Expiration Date *</Text>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => {
                    const current = parseDateTextToDate(warrantyUntil);
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
              </View>
            )} */}

            {/* Warranty Date Picker - Android */}
            {/* {Platform.OS === 'android' && showWarrantyPicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowWarrantyPicker(false);
                  if (selectedDate && event.type !== 'dismissed') {
                    setWarrantyUntil(formatDateToDDMMYYYY(selectedDate));
                  }
                }}
              />
            )} */}

            {/* Warranty Date Picker - iOS Modal */}
            {/* {Platform.OS === 'ios' && (
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
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setTempDate(selectedDate);
                      }}
                    />
                  </View>
                </View>
              </Modal>
            )} */}

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

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.iosModalOverlay}>
          <View style={[styles.iosModalContainer, { maxHeight: '65%' }]}>
            <View style={styles.iosModalHeader}>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.iosModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Category</Text>
              <View style={{ width: 60 }} />
            </View>
            <ScrollView contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}>
              {CATEGORIES.map((cat) => {
                const isSelected = billCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categorySelectItem,
                      isSelected && styles.categorySelectItemActive,
                    ]}
                    onPress={() => {
                      setBillCategory(cat.id);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categorySelectText,
                        isSelected && styles.categorySelectTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color="#4B65E4" style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  // Products
  productList: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  productMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  productRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#EEF2FF',
  },
  productTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B65E4',
  },
  productTotalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B65E4',
  },
  productExtrasToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  productExtrasToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B65E4',
  },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4B65E4',
    backgroundColor: '#EEF2FF',
  },
  addProductBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B65E4',
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
  categorySelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  categorySelectItemActive: {
    borderColor: '#4B65E4',
    backgroundColor: '#EEF2FF',
  },
  categorySelectText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
  },
  categorySelectTextActive: {
    fontWeight: '700',
    color: '#4B65E4',
  },
});