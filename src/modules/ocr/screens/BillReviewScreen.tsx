import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import OcrScannerOverlay from '../components/OcrScannerOverlay';
import FileAttachmentBanner from '../components/FileAttachmentBanner';
import MerchantDetailsCard from '../components/MerchantDetailsCard';
import WarrantyCard from '../components/WarrantyCard';
import LineItemsCard from '../components/LineItemsCard';
import AmountsSummaryCard from '../components/AmountsSummaryCard';

import { useCreateBill } from '../../bills/api/billsApi';
import type { AppStackParamList } from '../../../navigation/AppNavigator';

type Navigation = NativeStackNavigationProp<AppStackParamList, 'BillReview'>;
type BillReviewRoute = RouteProp<AppStackParamList, 'BillReview'>;

interface ProductItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  serialNumber?: string;
  warrantyMonths?: number;
}

const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDateToISO = (dateStr: string): string | null => {
  if (!dateStr.trim()) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const date = new Date(year, month, day, 12, 0, 0);
      return date.toISOString();
    }
  }
  return null;
};

export default function BillReviewScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<BillReviewRoute>();
  const { fileUri, fileName, fileType } = route.params;

  const createBillMutation = useCreateBill();

  // OCR Simulator Loading State
  const [isScanning, setIsScanning] = useState(true);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [scanningStatus, setScanningStatus] = useState('📂 Loading document source...');

  // General Bill States
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => {
    return formatDateToDDMMYYYY(new Date());
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [billCategory, setBillCategory] = useState('5085268a-da58-40a1-abfb-71f577bd4713'); // default to Others UUID
  const [notes, setNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [manualTotalAmount, setManualTotalAmount] = useState('');
  const [isTotalOverwritten, setIsTotalOverwritten] = useState(false);

  // Warranty
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyUntil, setWarrantyUntil] = useState('');

  // Items / Products
  const [products, setProducts] = useState<ProductItem[]>([]);

  // Run simulated OCR scanning on mount
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanningProgress(progress);

      if (progress === 30) {
        setScanningStatus('🔍 Running OCR text extraction...');
      } else if (progress === 60) {
        setScanningStatus('🤖 Categorizing items & matching prices...');
      } else if (progress === 90) {
        setScanningStatus('⚡ Finalizing bill data schema...');
      } else if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          // Pre-fill parsed fields dynamically based on filename
          const lowerName = fileName.toLowerCase();
          if (lowerName.includes('apple') || lowerName.includes('iphone') || lowerName.includes('macbook')) {
            setPurchaseLocation('Apple Store');
            setInvoiceNumber('APL-INF-89028');
            setBillCategory('efd8855d-a6c5-45ce-9c11-8025c6cb8c89'); // Electronics UUID
            setPaymentMethod('CARD');
            setProducts([
              {
                id: '1',
                itemName: 'iPhone 15 Case - Navy Blue',
                description: 'Silicone Case with MagSafe',
                quantity: 1,
                unitPrice: 4900,
                taxAmount: 882,
              },
              {
                id: '2',
                itemName: 'USB-C Woven Charge Cable (1m)',
                description: '60W power delivery cable',
                quantity: 1,
                unitPrice: 1900,
                taxAmount: 342,
              }
            ]);
            setHasWarranty(true);
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            setWarrantyUntil(formatDateToDDMMYYYY(nextYear));
          } else if (lowerName.includes('electric') || lowerName.includes('power') || lowerName.includes('utility') || lowerName.includes('water')) {
            setPurchaseLocation('Power Grid Corp');
            setInvoiceNumber('EL-294719-2026');
            setBillCategory('ba621ad1-a786-44c6-ae6e-13f53380a75c'); // Utilities UUID
            setPaymentMethod('NET_BANKING');
            setProducts([
              { 
                id: '1',
                itemName: 'Electricity Charge (July 2026)',
                description: 'Domestic electricity bill usage',
                quantity: 1,
                unitPrice: 3950,
                taxAmount: 250,
              }
            ]);
          } else {
            // Default Smart Mock
            setPurchaseLocation('Reliance Retail');
            setInvoiceNumber('REL-889312');
            setBillCategory('83043609-6e75-4d93-82b9-c439deec42d2'); // Shopping UUID
            setPaymentMethod('UPI');
            setProducts([
              {
                id: '1',
                itemName: 'Organic Almonds 500g',
                description: 'Premium raw California almonds',
                quantity: 2,
                unitPrice: 450,
                taxAmount: 45,
              },
              {
                id: '2',
                itemName: 'Fresh Strawberries Pack',
                description: 'Local farm fresh berries',
                quantity: 1,
                unitPrice: 250,
                taxAmount: 12,
              },
              {
                id: '3',
                itemName: 'Natural Yogurt 1kg',
                description: 'Probiotic high protein yogurt',
                quantity: 1,
                unitPrice: 150,
                taxAmount: 0,
              }
            ]);
          }
          setIsScanning(false);
        }, 300);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [fileName]);

  // Calculations
  const subtotal = useMemo(() => {
    return products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  }, [products]);

  const taxAmount = useMemo(() => {
    return products.reduce((sum, p) => sum + p.taxAmount, 0);
  }, [products]);

  const calculatedTotalAmount = useMemo(() => {
    const disc = parseFloat(discountAmount) || 0;
    return subtotal + taxAmount - disc;
  }, [subtotal, taxAmount, discountAmount]);

  const finalTotalAmount = isTotalOverwritten ? parseFloat(manualTotalAmount) || 0 : calculatedTotalAmount;

  // Add Item to list
  const handleAddProduct = (item: { itemName: string; quantity: number; unitPrice: number; taxAmount: number }) => {
    const newItem: ProductItem = {
      id: `${Date.now()}`,
      itemName: item.itemName,
      description: '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxAmount: item.taxAmount,
    };
    setProducts((prev) => [...prev, newItem]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Submit / Save
  const handleSaveBill = () => {
    if (!purchaseLocation.trim()) {
      Alert.alert('Required Info', 'Please enter merchant / store name.');
      return;
    }

    if (!invoiceNumber.trim()) {
      Alert.alert('Required Info', 'Please enter invoice number.');
      return;
    }

    const isoPurchaseDate = parseDateToISO(purchaseDate);
    if (!isoPurchaseDate) {
      Alert.alert('Invalid Date', 'Please enter purchase date in DD/MM/YYYY format.');
      return;
    }

    let isoWarrantyDate: string | null = null;
    if (hasWarranty) {
      if (!warrantyUntil.trim()) {
        Alert.alert('Required Info', 'Please specify the warranty expiration date.');
        return;
      }
      isoWarrantyDate = parseDateToISO(warrantyUntil);
      if (!isoWarrantyDate) {
        Alert.alert('Invalid Date', 'Please enter warranty expiration date in DD/MM/YYYY format.');
        return;
      }
    }

    const payload = {
      purchase_location: purchaseLocation.trim(),
      invoice_number: invoiceNumber.trim(),
      purchase_date: isoPurchaseDate,
      subtotal: subtotal || finalTotalAmount,
      tax_amount: taxAmount || undefined,
      discount_amount: parseFloat(discountAmount) || undefined,
      total_amount: finalTotalAmount,
      currency: 'INR',
      payment_method: paymentMethod,
      payment_status: 'PAID',
      bill_status: 'DRAFT',
      category_id: billCategory,
      notes: notes.trim() || undefined,
      warranty_until: isoWarrantyDate,
      receipt_url: fileUri,
      bill_items: products.length
        ? products.map((p) => ({
            item_name: p.itemName,
            quantity: p.quantity,
            unit_price: p.unitPrice,
            tax_amount: p.taxAmount || undefined,
          }))
        : undefined,
    };

    createBillMutation.mutate(payload as any, {
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

  if (isScanning) {
    return (
      <OcrScannerOverlay
        fileName={fileName}
        fileUri={fileUri}
        fileType={fileType}
        progress={scanningProgress}
        statusText={scanningStatus}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleCancel}>
          <Ionicons name="close-circle-outline" size={26} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Extracted Bill</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Document Attachment Banner */}
        <FileAttachmentBanner
          fileName={fileName}
          fileUri={fileUri}
          fileType={fileType}
        />

        {/* General Form Fields Card */}
        <MerchantDetailsCard
          purchaseLocation={purchaseLocation}
          setPurchaseLocation={setPurchaseLocation}
          invoiceNumber={invoiceNumber}
          setInvoiceNumber={setInvoiceNumber}
          purchaseDate={purchaseDate}
          setPurchaseDate={setPurchaseDate}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          billCategory={billCategory}
          setBillCategory={setBillCategory}
          notes={notes}
          setNotes={setNotes}
        />

        {/* Warranty Settings Card */}
        <WarrantyCard
          hasWarranty={hasWarranty}
          setHasWarranty={setHasWarranty}
          warrantyUntil={warrantyUntil}
          setWarrantyUntil={setWarrantyUntil}
        />

        {/* Line Items Card */}
        <LineItemsCard
          products={products}
          onRemoveProduct={handleRemoveProduct}
          onAddProduct={handleAddProduct}
        />

        {/* Totals Summary Card */}
        <AmountsSummaryCard
          subtotal={subtotal}
          taxAmount={taxAmount}
          discountAmount={discountAmount}
          setDiscountAmount={setDiscountAmount}
          calculatedTotalAmount={calculatedTotalAmount}
          isTotalOverwritten={isTotalOverwritten}
          setIsTotalOverwritten={setIsTotalOverwritten}
          manualTotalAmount={manualTotalAmount}
          setManualTotalAmount={setManualTotalAmount}
        />

        {/* Save and Discard CTA */}
        <View style={styles.actionBlock}>
          <TouchableOpacity
            style={[styles.saveBtn, createBillMutation.isPending && styles.saveBtnDisabled]}
            onPress={handleSaveBill}
            disabled={createBillMutation.isPending}
          >
            {createBillMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save and Categorize Bill</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Discard Bill</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  actionBlock: { gap: 12, marginTop: 12 },
  saveBtn: {
    backgroundColor: '#4B65E4',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4B65E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: { backgroundColor: '#A5B4FC' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cancelBtnText: { color: '#FF4444', fontSize: 14, fontWeight: '700' },
});
