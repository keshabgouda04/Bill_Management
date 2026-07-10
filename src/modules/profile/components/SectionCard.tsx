import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export const SectionCard = ({ title, children }: SectionCardProps) => {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  sectionCardTitle: {
    fontSize: 13, fontWeight: '700', color: '#999',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12,
  },
});
