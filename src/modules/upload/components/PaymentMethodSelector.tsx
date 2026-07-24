import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

export type PaymentMethod = 'UPI' | 'CARD' | 'CASH' | 'NET_BANKING';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector = ({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) => {
  const methods: PaymentMethod[] = ['UPI', 'CARD', 'CASH', 'NET_BANKING'];

  return (
    <View style={styles.pickerWrapper}>
      {methods.map((method) => (
        <TouchableOpacity
          key={method}
          style={[
            styles.methodChip,
            selectedMethod === method && styles.methodChipActive,
          ]}
          onPress={() => onSelectMethod(method)}
        >
          <Text
            style={[
              styles.methodChipText,
              selectedMethod === method && styles.methodChipTextActive,
            ]}
          >
            {method.replace('_', ' ')}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
