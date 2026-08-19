
//this component is not used anywhere 


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
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BillItem } from '../api/billsApi';
import { validateName } from '../../upload/utils/uploadUtils';

const sanitizePrice = (text: string): string => {
  return text.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
};

interface EditProductModalProps {
  visible: boolean;
  onClose: () => void;
  product: BillItem | null; // null means adding a new product
  onSave: (data: {
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxAmount: number;
    serialNumber: string;
    warrantyMonths: number | null;
  }) => void;
  isPending: boolean;
}

export default function EditProductModal({
  visible,
  onClose,
  product,
  onSave,
  isPending,
}: EditProductModalProps) {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productQty, setProductQty] = useState('1');
  const [productUnitPrice, setProductUnitPrice] = useState('');
  const [productTax, setProductTax] = useState('');
  const [productSerialNumber, setProductSerialNumber] = useState('');
  const [productWarrantyMonths, setProductWarrantyMonths] = useState('');
  const [showProductExtras, setShowProductExtras] = useState(false);

  useEffect(() => {
    if (visible) {
      setProductName(product?.item_name || '');
      setProductDescription(product?.description || '');
      setProductQty(product ? String(product.quantity) : '1');
      setProductUnitPrice(product ? String(product.unit_price) : '');
      setProductTax(product?.tax_amount ? String(product.tax_amount) : '');
      setProductSerialNumber(product?.serial_number || '');
      setProductWarrantyMonths(product?.warranty_months ? String(product.warranty_months) : '');
      setShowProductExtras(
        Boolean(product?.description || product?.serial_number || product?.warranty_months || product?.tax_amount)
      );
    }
  }, [visible, product]);

  const handleSave = () => {
    const productNameErr = validateName(productName, 'Product name');
    if (productNameErr) {
      Alert.alert('Invalid Product Name', productNameErr);
      return;
    }

    const parsedPrice = parseFloat(productUnitPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid unit price.');
      return;
    }

    const parsedQty = parseFloat(productQty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    const parsedTax = productTax.trim() ? parseFloat(productTax) : 0;
    if (isNaN(parsedTax) || parsedTax < 0) {
      Alert.alert('Invalid Tax', 'Please enter a valid tax amount.');
      return;
    }

    const parsedWarrantyMonths = productWarrantyMonths.trim()
      ? parseInt(productWarrantyMonths, 10)
      : null;
    if (parsedWarrantyMonths !== null && (isNaN(parsedWarrantyMonths) || parsedWarrantyMonths < 0)) {
      Alert.alert('Invalid Warranty', 'Please enter a valid number of warranty months.');
      return;
    }

    onSave({
      itemName: productName.trim(),
      description: productDescription.trim(),
      quantity: parsedQty,
      unitPrice: parsedPrice,
      taxAmount: parsedTax,
      serialNumber: productSerialNumber.trim(),
      warrantyMonths: parsedWarrantyMonths,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalSheet}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {product ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContainer}>
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
                  onChangeText={(text) => setProductUnitPrice(sanitizePrice(text))}
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
                  onChangeText={(text) => setProductTax(sanitizePrice(text))}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, isPending && styles.saveBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {product ? 'Save Changes' : 'Add Product'}
                </Text>
              )}
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  modalScrollContainer: {
    paddingBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 14,
  },
  fieldInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  col: {
    flex: 1,
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
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
