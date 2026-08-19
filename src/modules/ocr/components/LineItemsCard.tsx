import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { validateName, sanitizeQuantity, validateQuantity } from '../../../utils/validators';

const sanitizePrice = (text: string): string => {
  return text.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
};

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

interface LineItemsCardProps {
  products: ProductItem[];
  onRemoveProduct: (id: string) => void;
  onAddProduct: (item: { itemName: string; quantity: number; unitPrice: number; taxAmount: number }) => void;
}

export default function LineItemsCard({
  products,
  onRemoveProduct,
  onAddProduct,
}: LineItemsCardProps) {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductQty, setNewProductQty] = useState('1');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductTax, setNewProductTax] = useState('0');

  const handleAdd = () => {
    const nameErr = validateName(newProductName, 'Item name');
    if (nameErr) {
      Alert.alert('Validation Error', nameErr);
      return;
    }
    const qtyErr = validateQuantity(newProductQty);
    if (qtyErr) {
      Alert.alert('Validation Error', qtyErr);
      return;
    }
    const qty = parseInt(newProductQty, 10);
    const price = parseFloat(newProductPrice);
    if (isNaN(price) || price < 0) {
      Alert.alert('Invalid format', 'Please enter a valid unit price.');
      return;
    }

    onAddProduct({
      itemName: newProductName.trim(),
      quantity: qty,
      unitPrice: price,
      taxAmount: parseFloat(newProductTax) || 0,
    });

    setNewProductName('');
    setNewProductQty('1');
    setNewProductPrice('');
    setNewProductTax('0');
    setIsAddingProduct(false);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>📦 Bill Line Items (OCR Parsed)</Text>

      {products.length === 0 ? (
        <View style={styles.emptyProducts}>
          <Text style={styles.emptyProductsText}>No items added yet. Click "+ Add Line Item" below.</Text>
        </View>
      ) : (
        <View style={styles.productList}>
          {products.map((p) => (
            <View key={p.id} style={styles.productRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{p.itemName}</Text>
                <Text style={styles.productMeta}>
                  {p.quantity} x ₹{p.unitPrice.toLocaleString('en-IN')} (Tax: ₹{p.taxAmount})
                </Text>
              </View>
              <Text style={styles.productRowTotal}>
                ₹{((p.quantity * p.unitPrice) + p.taxAmount).toLocaleString('en-IN')}
              </Text>
              <TouchableOpacity
                style={styles.productRemoveBtn}
                onPress={() => onRemoveProduct(p.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add Product Inline Mode */}
      {isAddingProduct ? (
        <View style={styles.addProductBox}>
          <Text style={styles.addProductTitle}>Add New Item</Text>

          <Text style={styles.inlineLabel}>Item Name *</Text>
          <TextInput
            style={styles.inlineInput}
            value={newProductName}
            onChangeText={setNewProductName}
            placeholder="Product Name"
            maxLength={100}
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inlineLabel}>Qty *</Text>
              <TextInput
                style={styles.inlineInput}
                value={newProductQty}
                onChangeText={(text) => setNewProductQty(sanitizeQuantity(text))}
                keyboardType="number-pad"
                placeholder="1"
                maxLength={6}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.inlineLabel}>Price (₹) *</Text>
              <TextInput
                style={styles.inlineInput}
                value={newProductPrice}
                onChangeText={(text) => setNewProductPrice(sanitizePrice(text))}
                keyboardType="numeric"
                placeholder="0.00"
                maxLength={10}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.inlineLabel}>Tax (₹)</Text>
              <TextInput
                style={styles.inlineInput}
                value={newProductTax}
                onChangeText={(text) => setNewProductTax(sanitizePrice(text))}
                keyboardType="numeric"
                placeholder="0"
                maxLength={10}
              />
            </View>
          </View>

          <View style={[styles.row, { marginTop: 14 }]}>
            <TouchableOpacity
              style={[styles.btnSecondary, { flex: 1 }]}
              onPress={() => setIsAddingProduct(false)}
            >
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { flex: 1, height: 40 }]}
              onPress={handleAdd}
            >
              <Text style={styles.btnPrimaryText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addProductBtn}
          onPress={() => setIsAddingProduct(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#4B65E4" />
          <Text style={styles.addProductBtnText}>Add Line Item</Text>
        </TouchableOpacity>
      )}
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
  emptyProducts: { paddingVertical: 14, alignItems: 'center' },
  emptyProductsText: { fontSize: 13, color: '#888', fontStyle: 'italic' },
  productList: { borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 10, overflow: 'hidden', marginTop: 4 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  productName: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  productMeta: { fontSize: 11, color: '#777', marginTop: 2 },
  productRowTotal: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginRight: 10 },
  productRemoveBtn: { padding: 4 },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#4B65E4',
    backgroundColor: '#EEF2FF',
  },
  addProductBtnText: { fontSize: 13, fontWeight: '700', color: '#4B65E4' },
  addProductBox: {
    borderWidth: 1.5,
    borderColor: '#4B65E4',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#FAF9FF',
  },
  addProductTitle: { fontSize: 13, fontWeight: '700', color: '#4B65E4', marginBottom: 8 },
  inlineLabel: { fontSize: 11, fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 6 },
  inlineInput: {
    height: 38,
    borderWidth: 1,
    borderColor: '#D2D6DC',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#1A1A1A',
    backgroundColor: '#FFF',
  },
  row: { flexDirection: 'row', gap: 12, marginTop: 4 },
  col: { flex: 1 },
  btnPrimary: {
    backgroundColor: '#4B65E4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  btnSecondary: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D2D6DC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  btnSecondaryText: { color: '#4B5563', fontSize: 13, fontWeight: '600' },
});
