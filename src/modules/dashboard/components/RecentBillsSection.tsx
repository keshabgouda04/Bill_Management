import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionHeader } from '../../../components/common/SectionHeader';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const RECENT_BILLS = [
  { id: '1', icon: '🎧', name: 'Sony Headphones', date: 'Amazon • Oct 14', amount: '₹15,490', status: 'Warranty active' },
  { id: '2', icon: '🖥️', name: 'Dell Monitor', date: 'Flipkart • Oct 12', amount: '₹1,200', status: 'Paid' },
];

export const RecentBillsSection = () => {
  const navigation = useNavigation<Nav>();

  return (
    <>
      <SectionHeader title="Recent Bills" onPress={() => navigation.navigate('ViewBills')} />
      <View style={styles.card}>
        {RECENT_BILLS.map((bill, index) => (
          <View key={bill.id}>
            <View style={styles.billRow}>
              <View style={styles.billIconCircle}>
                <Text style={{ fontSize: 20 }}>{bill.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.billName}>{bill.name}</Text>
                <Text style={styles.billDate}>{bill.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.billAmount}>{bill.amount}</Text>
                <Text style={[styles.billStatus, { color: bill.status === 'Paid' ? '#22C55E' : '#4B65E4' }]}>
                  {bill.status}
                </Text>
              </View>
            </View>
            {index < RECENT_BILLS.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 6, elevation: 2,
  },
  billRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  billIconCircle: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: '#F5F6FA',
    justifyContent: 'center', alignItems: 'center',
  },
  billName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  billDate: { fontSize: 12, color: '#999', marginTop: 2 },
  billAmount: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  billStatus: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 14 },
});
