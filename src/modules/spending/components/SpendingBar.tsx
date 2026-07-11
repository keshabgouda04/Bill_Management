import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SpendingBarProps {
  value: number;
  month: string;
  isActive: boolean;
}

export const SpendingBar = ({ value, month, isActive }: SpendingBarProps) => (
  <View style={styles.barWrapper}>
    <View style={[styles.bar, { height: value * 0.7, backgroundColor: isActive ? '#4B65E4' : '#D0D7FF' }]} />
    <Text style={[styles.barLabel, { color: isActive ? '#4B65E4' : '#999' }]}>{month}</Text>
  </View>
);

const styles = StyleSheet.create({
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 10, marginTop: 4 },
});
