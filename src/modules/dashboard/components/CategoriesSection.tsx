import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/AppNavigator';
import { useGetBills, useGetBillsInfinite } from '../../bills/api/billsApi';
import { getCategoryByName } from '../../../constants/categories';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export const CategoriesSection = () => {
  const navigation = useNavigation<Nav>();
  const { data } = useGetBillsInfinite(10);

  const bills = data?.pages.flatMap((page) => page.data?.bills || []) || [];

  // Group bills by category name and sum their total amount dynamically
  const topCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    
    bills.forEach(bill => {
      const categoryName = bill.category?.name || 'Others';
      totals[categoryName] = (totals[categoryName] || 0) + bill.total_amount;
    });

    const list = Object.entries(totals).map(([name, sum]) => {
      const cat = getCategoryByName(name);
      return {
        id: cat?.id || name,
        label: cat?.name || name,
        emoji: cat?.emoji || '📦',
        amount: sum,
        color: cat?.color || '#F9FAFB',
      };
    });

    // Sort by spending amount descending
    list.sort((a, b) => b.amount - a.amount);

    // Fallbacks to pad dashboard with 3 cards if user has fewer than 3 category entries
    const defaults = [
      { id: 'home', label: 'Home & Furniture', emoji: '🏠', amount: 0, color: '#FEF3C7' },
      { id: 'shopping', label: 'Shopping', emoji: '🛍️', amount: 0, color: '#FFF7ED' },
      { id: 'utilities', label: 'Utilities', emoji: '🔌', amount: 0, color: '#EFF6FF' },
    ];

    const result = [...list];
    for (const def of defaults) {
      if (result.length >= 3) break;
      // Check if the current default category already exists in the result array (case-insensitive).
      // If it doesn't exist, add it to ensure we have up to 3 categories.
      if (!result.some(item => item.label.toLowerCase() === def.label.toLowerCase())) {
        result.push(def); 
      }
    }

    return result.slice(0, 3);
  }, [bills]);

  return (
    <>
      <SectionHeader title="Categories" onPress={() => navigation.navigate('Categories')} />
      <View style={styles.categoriesRow}>
        {topCategories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryCard, { backgroundColor: cat.color }]}
            onPress={() => navigation.navigate('Categories')}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
            <Text style={styles.categoryAmount} numberOfLines={1}>
              ₹{cat.amount.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.categoryLabel} numberOfLines={1}>
              {cat.label}
            </Text>
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
    minWidth: 0, // allow flex shrinking
  },
  categoryAmount: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  categoryLabel: { fontSize: 11, color: '#666', textAlign: 'center' },
});
