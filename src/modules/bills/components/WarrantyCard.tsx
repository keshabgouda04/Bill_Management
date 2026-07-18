import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface WarrantyCardProps {
  hasWarranty: boolean;
  setHasWarranty: (val: boolean) => void;
  warrantyUntil: string;
  setWarrantyUntil: (val: string) => void;
}

const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function WarrantyCard({
  hasWarranty,
  setHasWarranty,
  warrantyUntil,
  setWarrantyUntil,
}: WarrantyCardProps) {
  const [showWarrantyDatePicker, setShowWarrantyDatePicker] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.warrantyToggleRow}>
        <View>
          <Text style={styles.warrantyTitle}>🛡️ Track Warranty</Text>
          <Text style={styles.warrantySubtitle}>Enable to track product warranty expiration</Text>
        </View>
        <Switch
          value={hasWarranty}
          onValueChange={setHasWarranty}
          thumbColor={hasWarranty ? '#4B65E4' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#C7D2FE' }}
        />
      </View>

      {hasWarranty && (
        <View style={{ marginTop: 14 }}>
          <Text style={styles.fieldLabel}>Warranty Expiration Date *</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowWarrantyDatePicker(true)}
          >
            <Text style={styles.dateSelectorText}>{warrantyUntil || 'Select Expiration Date'}</Text>
            <Ionicons name="calendar-outline" size={18} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      {/* DateTime Picker Warranty Date */}
      {showWarrantyDatePicker && (
        <DateTimePicker
          value={(() => {
            if (warrantyUntil) {
              const parts = warrantyUntil.split('/');
              if (parts.length === 3) {
                return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
              }
            }
            return new Date();
          })()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowWarrantyDatePicker(false);
            if (selectedDate) {
              setWarrantyUntil(formatDateToDDMMYYYY(selectedDate));
            }
          }}
        />
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
  warrantyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  warrantyTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  warrantySubtitle: { fontSize: 11, color: '#777', marginTop: 2 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  dateSelector: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSelectorText: { fontSize: 14, color: '#1A1A1A' },
});
