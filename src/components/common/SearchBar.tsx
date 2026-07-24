import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SearchBarProps {
  placeholder?: string;
  onPress?: () => void;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search bills, items, categories...',
  onPress,
  onFilterPress,
}) => (
  <TouchableOpacity
    style={styles.searchBar}
    activeOpacity={onPress ? 0.9 : 1}
    onPress={onPress}
  >
    <Ionicons name="search" size={20} color="#999" />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#999"
      style={styles.searchInput}
      editable={!onPress}
      pointerEvents={onPress ? 'none' : 'auto'}
    />
    <TouchableOpacity
      style={styles.filterButton}
      onPress={onFilterPress}
      activeOpacity={0.7}
    >
      <Ionicons name="options-outline" size={20} color="#4B65E4" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
