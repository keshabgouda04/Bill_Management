import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../navigation/AppNavigator';
import { CategoryCard, BillItem } from '../components/CategoryCard';
import { CategoryFilterTabs, FilterTab } from '../components/CategoryFilterTabs';
import { useGetBills, useGetBillsInfinite } from '../../bills/api/billsApi';
import { useSearchBillsInfinite } from '../../search';
import { useDebounce } from '../../../hooks/useDebounce';

const CATEGORIES: FilterTab[] = [
  { id: 'all', label: 'All', emoji: '📋' },
  { id: '3334f0da-b7ce-4c9d-bc26-d0ae0374fed1', label: 'Groceries', emoji: '🛒' },
  { id: '6644910b-b733-47b7-85f9-48d0ca6fc86a', label: 'Dining', emoji: '🍽️' },
  { id: 'ba621ad1-a786-44c6-ae6e-13f53380a75c', label: 'Utilities', emoji: '💡' },
  { id: 'ef84449d-36e0-4df3-892f-aff668c051c9', label: 'Transportation', emoji: '🚌' },
  { id: '04546ff9-bb72-4786-825d-85583aa58f49', label: 'Entertainment', emoji: '🎬' },
  { id: 'efd8855d-a6c5-45ce-9c11-8025c6cb8c89', label: 'Electronics', emoji: '💻' },
  { id: '83043609-6e75-4d93-82b9-c439deec42d2', label: 'Shopping', emoji: '🛍️' },
  { id: '60018b6c-0aef-4f3b-ad68-6a9035676df2', label: 'Healthcare', emoji: '🏥' },
  { id: 'a1cb7d86-f8bb-4e43-a747-e551f4efcf74', label: 'Education', emoji: '🎓' },
  { id: 'e71537dc-c15c-4875-8b50-b2b7c5378be5', label: 'Travel', emoji: '✈️' },
  { id: '0fb1ddb0-d3a3-44d6-8602-363edbc78959', label: 'Home & Furniture', emoji: '🛋️' },
  { id: '64a265f6-617f-4643-a753-0aac2f3df3e9', label: 'Fashion', emoji: '👕' },
  { id: '3aa49dcc-74ee-448e-8425-cecef36265d7', label: 'Insurance', emoji: '🛡️' },
  { id: 'aea62965-dc00-4418-8290-3bdc33f1fd1e', label: 'Business', emoji: '💼' },
  { id: 'e017f7ac-9932-44cb-bceb-b01fe171fa62', label: 'Subscription', emoji: '🔄' },
  { id: 'f27c6346-1d5e-4da4-945a-a70b99c431f0', label: 'Pet Care', emoji: '🐾' },
  { id: 'ae01487b-2a6e-4438-b018-7fb6005dfbde', label: 'Gifts', emoji: '🎁' },
  { id: '64f833b5-6566-4e49-939d-98bd63b845fb', label: 'Taxes', emoji: '💵' },
  { id: 'b9bfcee8-6d48-4e17-9c07-b76fc4660e40', label: 'Others', emoji: '📦' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    data: allBillsData,
    isLoading: isAllBillsLoading,
    fetchNextPage: fetchNextPageAll,
    hasNextPage: hasNextPageAll,
    isFetchingNextPage: isFetchingNextPageAll,
  } = useGetBillsInfinite(10);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const {
    data: searchData,
    isLoading: isSearchLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useSearchBillsInfinite(
    debouncedSearchQuery,
    selectedTab.toLowerCase() !== 'all' ? selectedTab : undefined,
    undefined,
    2
  );

  const isQueryActive = searchQuery.trim().length > 0;

  const bills = useMemo(() => {
    if (isQueryActive) {
      return searchData?.pages.flatMap((page) => page.data?.bills || []) || [];
    }
    return allBillsData?.pages.flatMap((page) => page.data?.bills || []) || [];
  }, [isQueryActive, searchData, allBillsData]);

  // Map backend Bill type to frontend BillItem type
  const mappedBills = useMemo(() => {
    return bills.map((b): BillItem => {
      const symbol = b.currency === 'INR' ? '₹' : b.currency === 'USD' ? '$' : b.currency;
      const formattedAmount = `${symbol}${b.total_amount.toLocaleString('en-IN')}`;

      let formattedDate = 'N/A';
      if (b.purchase_date) {
        try {
          formattedDate = new Date(b.purchase_date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        } catch {
          formattedDate = b.purchase_date;
        }
      }

      let status: 'Warranty active' | 'Expired' | 'No warranty' = 'No warranty';
      if (b.warranty_until) {
        try {
          const now = new Date();
          const warrantyDate = new Date(b.warranty_until);
          status = warrantyDate > now ? 'Warranty active' : 'Expired';
        } catch {
          status = 'No warranty';
        }
      }

      return {
        id: b.id,
        name: b.invoice_number || 'Unnamed Bill',
        store: b.purchase_location || 'Other Store',
        amount: formattedAmount,
        date: formattedDate,
        status: status,
        category: b.category?.name || 'Other',
      };
    });
  }, [bills]);

  const filteredBills = useMemo(() => {
    let list = mappedBills;
    if (!isQueryActive && selectedTab.toLowerCase() !== 'all') {
      list = mappedBills.filter(b => {
        const billCat = b.category.toLowerCase().trim();
        const tabCat = selectedTab.toLowerCase().trim();
        return billCat === tabCat || 
               (tabCat === 'others' && billCat === 'other') ||
               (tabCat === 'other' && billCat === 'others');
      });
    }

    if (isQueryActive && !searchData) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        b =>
          b.name.toLowerCase().includes(q) ||
          b.store.toLowerCase().includes(q)
      );
    }
    return list;
  }, [mappedBills, selectedTab, isQueryActive, searchData, searchQuery]);

  const toggleSearch = () => {
    if (isSearchVisible) {
      setSearchQuery('');
    }
    setIsSearchVisible(!isSearchVisible);
  };

  if (isAllBillsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4B65E4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>Browse your bills by category</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerIcon, isSearchVisible && styles.headerIconActive]}
            onPress={toggleSearch}
          >
            <Ionicons
              name={isSearchVisible ? "close-outline" : "search-outline"}
              size={20}
              color={isSearchVisible ? "#4B65E4" : "#1A1A1A"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="options-outline" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Collapsible Search Input Bar ── */}
      {isSearchVisible && (
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bills by store or invoice number..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Filter Tabs ── */}
      <CategoryFilterTabs
        selected={selectedTab}
        onSelect={setSelectedTab}
        tabs={CATEGORIES}
      />

      {/* ── Bills List ── */}
      {isQueryActive && isSearchLoading ? (
        <View style={styles.bodyLoadingContainer}>
          <ActivityIndicator size="large" color="#4B65E4" />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={filteredBills}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CategoryCard
              item={item}
              onPress={() => {
                navigation.navigate('BillDetails', { billId: item.id });
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📂</Text>
              <Text style={styles.emptyTitle}>No bills found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim() ? `No results matching "${searchQuery}"` : 'Try selecting a different category'}
              </Text>
            </View>
          }
          onEndReached={() => {
            if (isQueryActive) {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            } else {
              if (hasNextPageAll && !isFetchingNextPageAll) {
                fetchNextPageAll();
              }
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            (isQueryActive ? isFetchingNextPage : isFetchingNextPageAll) ? (
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FD' },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 13, color: '#999', marginTop: 2 },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconActive: {
    backgroundColor: '#EEF2FF',
  },

  // Collapsible Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4B65E4',
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },

  // List
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  emptySubtitle: { fontSize: 13, color: '#999' },
  bodyLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
