import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InfoRowProps {
  icon: string;
  label: string;
  value?: string | null;
}

export const InfoRow = ({ icon, label, value }: InfoRowProps) => {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconCircle}>
        <Ionicons name={icon as any} size={18} color="#4B65E4" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  infoIconCircle: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#999', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '600', marginTop: 1 },
});
