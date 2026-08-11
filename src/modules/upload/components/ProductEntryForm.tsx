import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sanitizePrice } from '../utils/uploadUtils';

interface ProductEntryFormProps {
  productName: string;
  setProductName: (val: string) => void;
  productQty: string;
  setProductQty: (val: string) => void;
  productUnitPrice: string;
  setProductUnitPrice: (val: string) => void;
  productDescription: string;
  setProductDescription: (val: string) => void;
  productSerialNumber: string;
  setProductSerialNumber: (val: string) => void;
  productWarrantyMonths: string;
  setProductWarrantyMonths: (val: string) => void;
  productTax: string;
  setProductTax: (val: string) => void;
  showProductExtras: boolean;
  setShowProductExtras: (val: boolean) => void;
  onAddProduct: () => void;
  errors?: Record<string, string>;
}

export const ProductEntryForm = ({
  productName,
  setProductName,
  productQty,
  setProductQty,
  productUnitPrice,
  setProductUnitPrice,
  productDescription,
  setProductDescription,
  productSerialNumber,
  setProductSerialNumber,
  productWarrantyMonths,
  setProductWarrantyMonths,
  productTax,
  setProductTax,
  showProductExtras,
  setShowProductExtras,
  onAddProduct,
  errors,
}: ProductEntryFormProps) => {
  return (
    <>
      <Text style={styles.fieldLabel}>Product Name *</Text>
      <TextInput
        style={[styles.fieldInput, errors?.productName ? styles.inputError : null]}
        placeholder="e.g. iPhone Case"
        placeholderTextColor="#BBB"
        value={productName}
        onChangeText={setProductName}
      />
      {errors?.productName && <Text style={styles.errorText}>{errors.productName}</Text>}

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Quantity</Text>
          <TextInput
            style={[styles.fieldInput, errors?.productQty ? styles.inputError : null]}
            placeholder="1"
            placeholderTextColor="#BBB"
            keyboardType="numeric"
            value={productQty}
            onChangeText={setProductQty}
          />
          {errors?.productQty && <Text style={styles.errorText}>{errors.productQty}</Text>}
        </View>
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>Unit Price (₹) *</Text>
          <TextInput
            style={[styles.fieldInput, errors?.productUnitPrice ? styles.inputError : null]}
            placeholder="e.g. 499"
            placeholderTextColor="#BBB"
            keyboardType="numeric"
            value={productUnitPrice}
            onChangeText={(text) => setProductUnitPrice(sanitizePrice(text))}
          />
          {errors?.productUnitPrice && <Text style={styles.errorText}>{errors.productUnitPrice}</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={styles.productExtrasToggle}
        onPress={() => setShowProductExtras(!showProductExtras)}
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
                style={[styles.fieldInput, errors?.productWarrantyMonths ? styles.inputError : null]}
                placeholder="e.g. 12"
                placeholderTextColor="#BBB"
                keyboardType="numeric"
                value={productWarrantyMonths}
                onChangeText={setProductWarrantyMonths}
              />
              {errors?.productWarrantyMonths && <Text style={styles.errorText}>{errors.productWarrantyMonths}</Text>}
            </View>
          </View>

          <Text style={styles.fieldLabel}>Item Tax Amount (₹)</Text>
          <TextInput
            style={[styles.fieldInput, errors?.productTax ? styles.inputError : null]}
            placeholder="e.g. 25"
            placeholderTextColor="#BBB"
            keyboardType="numeric"
            value={productTax}
            onChangeText={(text) => setProductTax(sanitizePrice(text))}
          />
          {errors?.productTax && <Text style={styles.errorText}>{errors.productTax}</Text>}
        </>
      )}

      <TouchableOpacity style={styles.addProductBtn} onPress={onAddProduct} activeOpacity={0.85}>
        <Ionicons name="add-circle-outline" size={18} color="#4B65E4" />
        <Text style={styles.addProductBtnText}>Add Product</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
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
});
