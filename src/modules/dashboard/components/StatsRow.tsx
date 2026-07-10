import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const STATS = [
  { label: 'Total Bills', value: '124', sub: 'This month' },
  { label: 'Active Warranties', value: '12', sub: '2 expiring' },
  { label: 'Categories', value: '8', sub: 'Organized' },
  { label: 'Storage', value: '3.5 GB', sub: 'of 5 GB used' },
];

export const StatsRow = () => (
  <View style={styles.statsRow}>
    {STATS.map((stat, i) => (
      <View key={i} style={styles.statCard}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
        <Text style={styles.statSub}>{stat.sub}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#FFF', borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 6, elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginTop: 4 },
  statSub: { fontSize: 10, color: '#999', marginTop: 2 },
});
