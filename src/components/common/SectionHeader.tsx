import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface SectionHeaderProps {
  title: string;
  onPress?: () => void;
}

export const SectionHeader = ({ title, onPress }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onPress && (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.viewAll}>View All</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, marginBottom: 10, paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  viewAll: { fontSize: 13, fontWeight: '600', color: '#4B65E4' },
});
