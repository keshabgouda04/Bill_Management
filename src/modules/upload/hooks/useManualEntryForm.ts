import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { useCreateManualBill } from '../api/uploadApi';
import {
  parseDateToISO,
  parseDateTextToDate,
  formatDateToDDMMYYYY,
  sanitizePrice,
  validateName,
  validateInvoiceNumber,
  checkCharLimit,
  hasEmoji,
  validateQuantity,
  validateLiveField,
  updateFieldErrors,
  validateSerialNumber,
} from '../utils/uploadUtils';

export interface Product {
  id: string;
  itemName: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxAmount: string;
  serialNumber: string;
  warrantyMonths: string;
}

export const useManualEntryForm = (onClose: () => void) => {
  const navigation = useNavigation<any>();
  const mutation = useCreateManualBill();

  // Required fields
  const [billName, setBillNameState] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setBillName = (val: string) => {
    setBillNameState(val);
    const err = validateLiveField(val, { maxLength: 100, disallowEmoji: true, label: 'Store name' });
    setErrors((prev) => updateFieldErrors(prev, 'billName', err));
  };

  // Date picker visibility states
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showWarrantyPicker, setShowWarrantyPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Optional backend fields
  const [invoiceNumber, setInvoiceNumberState] = useState('');

  const setInvoiceNumber = (val: string) => {
    setInvoiceNumberState(val);
    const err = validateLiveField(val, { maxLength: 25, disallowEmoji: true, label: 'Invoice number' });
    setErrors((prev) => updateFieldErrors(prev, 'invoiceNumber', err));
  };
  const [taxAmount, setTaxAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH' | 'NET_BANKING'>('UPI');
  const [billCategory, setBillCategory] = useState(''); // no default category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [billNotes, setBillNotesState] = useState('');

  const setBillNotes = (val: string) => {
    setBillNotesState(val);
    const err = validateLiveField(val, { maxLength: 500, label: 'Notes' });
    setErrors((prev) => updateFieldErrors(prev, 'billNotes', err));
  };

  // Warranty & Reminders state
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyUntil, setWarrantyUntil] = useState('');
  const [selectedReminders, setSelectedReminders] = useState<Array<'30_DAYS' | '7_DAYS' | '1_DAY' | '1_HOUR'>>([]);

  const handleToggleReminder = (type: '30_DAYS' | '7_DAYS' | '1_DAY' | '1_HOUR') => {
    setSelectedReminders((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Products (bill_items) state
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
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  // Sync products tax changes
  useEffect(() => {
    if (products.length > 0) {
      const productsTaxTotal = products.reduce((sum, p) => {
        const taxVal = parseFloat(p.taxAmount) || 0;
        return sum + taxVal;
      }, 0);
      setTaxAmount(productsTaxTotal > 0 ? String(productsTaxTotal) : '0');
    }
  }, [products]);

  const productsTotal = products.reduce((sum, p) => {
    const qty = parseFloat(p.quantity) || 0;
    const price = parseFloat(p.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  // Auto-calculate Total Amount
  useEffect(() => {
    const subtotal = productsTotal || 0;
    const tax = parseFloat(taxAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    
    const calculatedTotal = subtotal + tax - discount;
    if (calculatedTotal >= 0) {
      setBillAmount(String(calculatedTotal));
    } else {
      setBillAmount('0');
    }
  }, [productsTotal, taxAmount, discountAmount]);

  const handleSelectAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Validate file size limit: 10MB
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('Invalid File', 'File size exceeds the 10MB limit.');
        return;
      }

      // Validate allowed file types: PDF and images
      const mime = file.mimeType || '';
      const isPdf = mime === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = mime.startsWith('image/') ||
                      file.name.toLowerCase().endsWith('.jpg') ||
                      file.name.toLowerCase().endsWith('.jpeg') ||
                      file.name.toLowerCase().endsWith('.png');

      if (!isPdf && !isImage) {
        Alert.alert('Invalid File', 'Only PDF files and images are allowed.');
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name,
        type: mime || (isPdf ? 'application/pdf' : 'image/jpeg'),
        size: file.size,
      });
    } catch (err) {
      console.error('Error selecting file:', err);
      Alert.alert('Error', 'Failed to pick attachment.');
    }
  };

  const handleAddProduct = () => {
    const newErrors: Record<string, string> = {};

    const productNameError = validateName(productName, 'Product name');
    if (productNameError) {
      newErrors.productName = productNameError;
    }

    const parsedPrice = parseFloat(productUnitPrice);
    if (!productUnitPrice.trim() || isNaN(parsedPrice) || parsedPrice < 0) {
      newErrors.productUnitPrice = 'Please enter a valid unit price.';
    }

    const qtyError = validateQuantity(productQty);
    if (qtyError) {
      newErrors.productQty = qtyError;
    }

    const parsedTax = productTax.trim() ? parseFloat(productTax) : undefined;
    if (parsedTax !== undefined && (isNaN(parsedTax) || parsedTax < 0 || parsedTax >= parsedPrice)) {
      newErrors.productTax = 'Tax amount must be less than the unit price.';
    }

    const parsedWarrantyMonths = productWarrantyMonths.trim()
      ? parseInt(productWarrantyMonths, 10)
      : undefined;
    if (parsedWarrantyMonths !== undefined && (isNaN(parsedWarrantyMonths) || parsedWarrantyMonths < 0)) {
      newErrors.productWarrantyMonths = 'Please enter a valid number of warranty months.';
    }

    const serialError = validateSerialNumber(productSerialNumber, 50);
    if (serialError) {
      newErrors.productSerialNumber = serialError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    // Clear product errors on success
    setErrors(prev => {
      const { productName, productUnitPrice, productQty, productTax, productWarrantyMonths, productDescription, productSerialNumber, ...rest } = prev;
      return rest;
    });

    const parsedQty = parseInt(productQty.trim(), 10) || 1;

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

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    // 1. Validation
    if (productName.trim()) {
      newErrors.form = 'You have unsaved product info. Please tap "Add Product" first.';
    }

    const storeNameError = validateName(billName, 'Store name', 100);
    if (storeNameError) newErrors.billName = storeNameError;
    const invoiceError = validateInvoiceNumber(invoiceNumber, 25);
    if (invoiceError) newErrors.invoiceNumber = invoiceError;
    if (!billDate.trim()) newErrors.billDate = 'Please select a Purchase Date.';
    if (!billCategory) newErrors.billCategory = 'Please select a category.';

    const parsedAmount = parseFloat(billAmount);

    let isoDate = '';
    if (billDate.trim()) {
      isoDate = parseDateToISO(billDate.trim()) || '';
      if (!isoDate) {
        newErrors.billDate = 'Please enter a valid date in DD/MM/YYYY format.';
      }
    }

    // At least one product item is required
    if (products.length === 0) {
      newErrors.products = 'At least one product item must be added.';
    }

    // Optional numbers
    const parsedTax = taxAmount.trim() ? parseFloat(taxAmount) : undefined;
    if (parsedTax !== undefined && (isNaN(parsedTax) || parsedTax < 0)) {
      newErrors.taxAmount = 'Please enter a valid tax amount.';
    }

    const parsedDiscount = discountAmount.trim() ? parseFloat(discountAmount) : undefined;
    if (parsedDiscount !== undefined) {
      if (isNaN(parsedDiscount) || parsedDiscount < 0) {
        newErrors.discountAmount = 'Please enter a valid discount amount.';
      } else {
        const currentTax = parsedTax || 0;
        if (parsedDiscount >= productsTotal + currentTax) {
          newErrors.discountAmount = 'Discount must be less than the total price (Subtotal + Tax).';
        }
      }
    }

    // Warranty parsing
    let isoWarrantyDate: string | undefined = undefined;
    if (hasWarranty) {
      if (!warrantyUntil.trim()) {
        newErrors.warrantyUntil = 'Please enter a warranty expiration date.';
      } else {
        const parsedWarranty = parseDateToISO(warrantyUntil.trim());
        if (!parsedWarranty) {
          newErrors.warrantyUntil = 'Please enter a valid date in DD/MM/YYYY format.';
        } else {
          isoWarrantyDate = parsedWarranty;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear all errors on successful validation
    setErrors({});

    // Optional subtotal calculation
    const taxVal = parsedTax || 0;
    const discountVal = parsedDiscount || 0;
    const calculatedSubtotal = parsedAmount - taxVal + discountVal;

    const handleSuccess = (response: any) => {
      const createdBill = response?.data?.bill;
      Alert.alert('Success', `Bill "${billName}" added successfully!`);

      // Reset state
      setBillName('');
      setBillAmount('');
      setBillDate('');
      setInvoiceNumber('');
      setTaxAmount('');
      setDiscountAmount('');
      setPaymentMethod('UPI');
      setBillCategory('');
      setBillNotes('');
      setHasWarranty(false);
      setWarrantyUntil('');
      setSelectedReminders(['7_DAYS', '1_DAY']);
      setProducts([]);
      setProductName('');
      setProductDescription('');
      setProductQty('1');
      setProductUnitPrice('');
      setProductTax('');
      setProductSerialNumber('');
      setProductWarrantyMonths('');
      setShowProductExtras(false);
      setSelectedFile(null);
      onClose();

      // Navigate immediately to BillDetails with the new ID
      if (createdBill && createdBill.id) {
        navigation.navigate('BillDetails', { billId: createdBill.id });
      }
    };

    const handleError = (err: any) => {
      Alert.alert('Save Failed', err.message || 'Could not add bill. Please try again.');
    };

    // Build FormData matching manual bill creation exactly
    const formData = new FormData();
    formData.append('purchase_location', billName.trim());
    formData.append('total_amount', parsedAmount.toString());
    formData.append('purchase_date', isoDate);
    formData.append('invoice_number', invoiceNumber.trim());
    formData.append('subtotal', (calculatedSubtotal > 0 ? calculatedSubtotal : parsedAmount).toString());

    if (parsedTax !== undefined) {
      formData.append('tax_amount', parsedTax.toString());
    }
    if (parsedDiscount !== undefined) {
      formData.append('discount_amount', parsedDiscount.toString());
    }

    formData.append('payment_method', paymentMethod);
    formData.append('currency', 'INR');
    formData.append('payment_status', 'PAID');
    formData.append('bill_status', 'DRAFT');

    if (isoWarrantyDate) {
      formData.append('warranty_until', isoWarrantyDate);
      if (selectedReminders.length > 0) {
        formData.append('reminders', JSON.stringify(selectedReminders));
      }
    }
    if (billNotes.trim()) {
      formData.append('notes', billNotes.trim());
    }
    formData.append('category_id', billCategory || '');

    const items = products.map((p) => ({
      item_name: p.itemName,
      description: p.description || undefined,
      quantity: parseFloat(p.quantity) || 0,
      unit_price: parseFloat(p.unitPrice) || 0,
      tax_amount: p.taxAmount.trim() ? parseFloat(p.taxAmount) : undefined,
      serial_number: p.serialNumber.trim() || undefined,
      warranty_months: p.warrantyMonths.trim() ? parseInt(p.warrantyMonths, 10) : undefined,
    }));
    formData.append('bill_items', JSON.stringify(items));

    if (selectedFile) {
      formData.append('attachments', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type,
      } as any);
    }

    mutation.mutate(formData, {
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  return {
    billName,
    setBillName,
    billAmount,
    setBillAmount,
    billDate,
    setBillDate,
    showPurchasePicker,
    setShowPurchasePicker,
    showWarrantyPicker,
    setShowWarrantyPicker,
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
    hasWarranty,
    setHasWarranty,
    warrantyUntil,
    setWarrantyUntil,
    selectedReminders,
    setSelectedReminders,
    handleToggleReminder,
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
    setSelectedFile,
    productsTotal,
    handleSelectAttachment,
    handleAddProduct,
    handleRemoveProduct,
    handleSubmit,
    isPending: mutation.isPending,
    errors,
    setErrors,
  };
};
