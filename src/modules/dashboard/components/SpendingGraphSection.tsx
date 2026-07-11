import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { SpendingBar } from '../../spending/components/SpendingBar';

const SPENDING_DATA = [60, 85, 45, 90, 70, 55, 80];
const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

export const SpendingGraphSection = () => (
  <>
    <SectionHeader title="Spending" />
    <View style={styles.card}>
      <Text style={styles.spendingTotal}>
        ₹2,200 <Text style={styles.spendingMonth}>this month</Text>
      </Text>
      <View style={styles.barsContainer}>
        {SPENDING_DATA.map((val, i) => (
          <SpendingBar key={i} value={val} month={MONTHS[i]} isActive={i === 5} />
        ))}
      </View>
    </View>
  </>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 6, elevation: 2,
  },
  spendingTotal: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 16 },
  spendingMonth: { fontSize: 14, fontWeight: '400', color: '#999' },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 8 },
});
