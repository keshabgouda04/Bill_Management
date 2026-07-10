import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export interface FilterTab {
  id: string;
  label: string;
  emoji: string;
}

const TABS: FilterTab[] = [
  { id: 'all', label: 'All', emoji: '📋' },
  { id: 'electronics', label: 'Electronics', emoji: '⚡' },
  { id: 'vehicle', label: 'Vehicle', emoji: '🚗' },
  { id: 'furniture', label: 'Furniture', emoji: '🛋️' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
];

interface CategoryFilterTabsProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryFilterTabs = ({ selected, onSelect }: CategoryFilterTabsProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    {TABS.map(tab => {
      const isActive = selected === tab.id;
      return (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, isActive && styles.tabActive]}
          onPress={() => onSelect(tab.id)}
          activeOpacity={0.75}
        >
          <Text style={styles.emoji}>{tab.emoji}</Text>
          <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4B65E4',
  },
  emoji: { fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#666' },
  labelActive: { color: '#4B65E4' },
});
