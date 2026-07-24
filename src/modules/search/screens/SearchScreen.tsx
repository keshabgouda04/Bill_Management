import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../navigation/AppNavigator';
import { useDebounce } from '../../../hooks/useDebounce';
import { useSearchBillsInfinite, Bill } from '../api/searchApi';
import { BillCard } from '../../bills/components/BillCard';

type FilterType = 'ALL' | 'PAID' | 'UNPAID' | 'PARTIAL';

const RECENT_SEARCHES = ['INV300', 'Electronics', 'Amazon', 'Grocery', 'Electricity'];

export default function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Search'>>();

  const initialQuery = route.params?.initialQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(searchQuery, 400);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

  const {
    data: searchData,
    isLoading: isSearchLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchBillsInfinite(
    debouncedQuery,
    undefined,
    selectedFilter !== 'ALL' ? selectedFilter : undefined,
    2
  );

  const isQueryActive = searchQuery.trim().length > 0;
  const isDebouncing = searchQuery !== debouncedQuery && isQueryActive;
  const isSearching = isSearchLoading || isDebouncing;

  // Use server search results directly when searching
  const filteredBills = useMemo(() => {
    return searchData?.pages.flatMap((page) => page.data?.bills || []) || [];
  }, [searchData]);

  const handleSelectRecentSearch = (tag: string) => {
    setSearchQuery(tag);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Search Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search invoice #, store, items..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#4B65E4" style={{ marginRight: 6 }} />
          ) : isQueryActive ? (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Filter Tabs ── */}
      <View style={styles.filterBar}>
        {(['ALL', 'PAID', 'UNPAID', 'PARTIAL'] as FilterType[]).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter === 'ALL' ? 'All Results' : filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Body Content ── */}
      {!isQueryActive ? (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.sectionTitle}>Popular & Recent Searches</Text>
          <View style={styles.tagWrap}>
            {RECENT_SEARCHES.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.suggestionTag}
                onPress={() => handleSelectRecentSearch(tag)}
                activeOpacity={0.7}
              >
                <Ionicons name="trending-up-outline" size={14} color="#4B65E4" style={{ marginRight: 6 }} />
                <Text style={styles.suggestionTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={22} color="#4B65E4" />
            <Text style={styles.tipText}>
              Search by invoice number (e.g. <Text style={{ fontWeight: '700' }}>INV300</Text>), store name, or product category to quickly find your bills.
            </Text>
          </View>
        </View>
      ) : isSearchLoading ? (
        <View style={styles.bodyLoadingContainer}>
          <ActivityIndicator size="large" color="#4B65E4" />
          <Text style={styles.bodyLoadingText}>Searching bills...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsCountHeader}>
              <Text style={styles.resultsCountText}>
                {isSearching
                  ? 'Searching database...'
                  : `Found ${filteredBills.length} bill${filteredBills.length === 1 ? '' : 's'}`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <BillCard
              bill={item}
              onPress={() => navigation.navigate('BillDetails', { billId: item.id })}
            />
          )}
          ListEmptyComponent={
            !isSearching ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#CCC" />
                <Text style={styles.emptyTitle}>No matching bills found</Text>
                <Text style={styles.emptySubtitle}>
                  We couldn't find any bills matching "{searchQuery}". Try checking for typos or search by merchant name.
                </Text>
              </View>
            ) : null
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#4B65E4" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
  },
  filterChipActive: {
    backgroundColor: '#4B65E4',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  suggestionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  suggestionTagText: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  resultsCountHeader: {
    paddingVertical: 12,
  },
  resultsCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
