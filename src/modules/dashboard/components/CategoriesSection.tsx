import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SectionHeader } from '../../../components/common/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/AppNavigator';
import { useGetBills, useGetBillsInfinite } from '../../bills/api/billsApi';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  groceries: { emoji: '🛒', color: '#ECFDF5' }, // light green
  dining: { emoji: '🍕', color: '#FFF7ED' }, // light orange
  utilities: { emoji: '🔌', color: '#EFF6FF' }, // light blue
  transportation: { emoji: '🚗', color: '#FAF5FF' }, // light purple
  entertainment: { emoji: '🍿', color: '#FEF2F2' }, // light red
  electronics: { emoji: '📱', color: '#EEF2FF' }, // light indigo
  shopping: { emoji: '🛍️', color: '#FFF7ED' }, // light orange
  healthcare: { emoji: '❤️', color: '#FDF2F8' }, // light pink
  education: { emoji: '🎓', color: '#F0FDFA' }, // light teal
  travel: { emoji: '✈️', color: '#ECFEFF' }, // light cyan
  'home & furniture': { emoji: '🏠', color: '#FEF3C7' }, // light amber
  fashion: { emoji: '👕', color: '#FCE7F3' }, // light rose
  insurance: { emoji: '🛡️', color: '#F3F4F6' }, // light gray
  business: { emoji: '💼', color: '#EEF2FF' }, // light indigo
  subscription: { emoji: '🔁', color: '#F5F3FF' }, // light violet
  'pet care': { emoji: '🐾', color: '#F1F8E9' }, // light lime
  gifts: { emoji: '🎁', color: '#FFF5F5' }, // light red
  taxes: { emoji: '📝', color: '#ECEFF1' }, // light blue-gray
  others: { emoji: '📦', color: '#F9FAFB' }, // light gray
};

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
      const key = name.toLowerCase();
      const meta = CATEGORY_META[key] || CATEGORY_META.others;
      return {
        id: name,
        label: name,
        emoji: meta.emoji,
        amount: sum,
        color: meta.color,
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
