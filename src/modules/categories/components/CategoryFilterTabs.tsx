import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export interface FilterTab {
  id: string;
  label: string;
  emoji: string;
}

const DEFAULT_TABS: FilterTab[] = [
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
  tabs?: FilterTab[];
}

export const CategoryFilterTabs = ({ selected, onSelect, tabs = DEFAULT_TABS }: CategoryFilterTabsProps) => (
  <ScrollView
  horizontal
  style={{
    height: 60,
    flexGrow: 0,
  }}
  contentContainerStyle={styles.container}
>
    {tabs.map(tab => {
      const isActive = selected === tab.id;
      return (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
          onPress={() => onSelect(tab.id)}
          activeOpacity={0.75}
        >
          <Text style={styles.emoji}>{tab.emoji}</Text>
          <Text 
            numberOfLines={1}
            style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({

  container: {
    paddingLeft: 20,
    paddingRight: 12, // 12 + 8 marginRight of last tab = 20px padding at the right end of the ScrollView
    flexDirection: 'row',
  alignItems: 'flex-start',
  paddingVertical: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8, // Safe standard margin instead of flex gap which has spacing bugs on Android
    gap: 6, // Spacing between emoji and text label
  },
  tabActive: {
    backgroundColor: '#4B65E4',
    borderColor: '#4B65E4',
  },
  tabInactive: {
    backgroundColor: '#FFF',
    borderColor: '#E8E8E8',
  },
  emoji: { fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600' },
  labelActive: { color: '#FFF' },
  labelInactive: { color: '#666' },
});
