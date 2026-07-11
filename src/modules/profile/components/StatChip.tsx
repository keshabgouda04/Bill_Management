import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatChipProps {
  value: string;
  label: string;
}

export const StatChip = ({ value, label }: StatChipProps) => {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statChipValue}>{value}</Text>
      <Text style={styles.statChipLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statChip: { flex: 1, alignItems: 'center' },
  statChipValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  statChipLabel: { fontSize: 11, color: '#999', marginTop: 2 },
});
