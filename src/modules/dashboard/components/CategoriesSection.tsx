import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const CATEGORIES = [
  { id: '1', emoji: '🏠', label: 'Home', amount: '₹1,20,000', color: '#EEF2FF' },
  { id: '2', emoji: '🛍️', label: 'Shopping', amount: '₹19,200', color: '#FFF7ED' },
  { id: '3', emoji: '🚗', label: 'Auto', amount: '₹12,100', color: '#F0FDF4' },
];

export const CategoriesSection = () => {
  const navigation = useNavigation<Nav>();

  return (
    <>
      <SectionHeader title="Categories" onPress={() => navigation.navigate('Categories')} />
      <View style={styles.categoriesRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryCard, { backgroundColor: cat.color }]}
            onPress={() => navigation.navigate('Categories')}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
            <Text style={styles.categoryAmount}>{cat.amount}</Text>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  categoriesRow: { flexDirection: 'row', gap: 10 },
  categoryCard: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4,
  },
  categoryAmount: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  categoryLabel: { fontSize: 11, color: '#666', textAlign: 'center' },
});
