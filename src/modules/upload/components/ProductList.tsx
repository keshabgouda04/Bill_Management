import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../hooks/useManualEntryForm';

interface ProductListProps {
  products: Product[];
  onRemoveProduct: (id: string) => void;
  productsTotal: number;
}

export const ProductList = ({
  products,
  onRemoveProduct,
  productsTotal,
}: ProductListProps) => {
  if (products.length === 0) return null;

  return (
    <View style={styles.productList}>
      {products.map((p) => (
        <View key={p.id} style={styles.productRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{p.itemName}</Text>
            <Text style={styles.productMeta}>
              {p.quantity} × ₹{p.unitPrice} = ₹{(parseFloat(p.quantity) * parseFloat(p.unitPrice)).toFixed(2)}
            </Text>
            {!!p.description && <Text style={styles.productMeta}>{p.description}</Text>}
            {(!!p.serialNumber || !!p.warrantyMonths || !!p.taxAmount) && (
              <Text style={styles.productMeta}>
                {[
                  p.serialNumber ? `S/N: ${p.serialNumber}` : null,
                  p.warrantyMonths ? `Warranty: ${p.warrantyMonths} mo` : null,
                  p.taxAmount ? `Tax: ₹${p.taxAmount}` : null,
                  p.taxAmount ? `Item Total: ₹${(parseFloat(p.quantity) * parseFloat(p.unitPrice) + parseFloat(p.taxAmount)).toFixed(2)}` : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => onRemoveProduct(p.id)}
            style={styles.productRemoveBtn}
          >
            <Ionicons name="trash-outline" size={18} color="#E14B4B" />
          </TouchableOpacity>
        </View>
      ))}
      <View style={styles.productTotalRow}>
        <Text style={styles.productTotalLabel}>Products Total</Text>
        <Text style={styles.productTotalValue}>
          ₹{(productsTotal + products.reduce((sum, p) => sum + (parseFloat(p.taxAmount) || 0), 0)).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
