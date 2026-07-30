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
  { id: 'd01eefad-a46d-44f2-92b5-7823b13cca97', label: 'Groceries', emoji: '🛒' },
  { id: 'f61ab785-1e81-4f14-a9b1-7d3acdfc0552', label: 'Dining', emoji: '🍽️' },
  { id: 'aae8c96d-aefa-4b12-884d-3ce3ffcd7b22', label: 'Utilities', emoji: '💡' },
  { id: 'b5ee8097-2d1c-4aa6-a2a3-66a45b2d391c', label: 'Transportation', emoji: '🚌' },
  { id: '58969cd8-cdde-40d4-9fd9-d1251fc96e8e', label: 'Entertainment', emoji: '🎬' },
  { id: '1d4d9114-d91b-462b-bf01-6ded3119fe8d', label: 'Electronics', emoji: '💻' },
  { id: '238c21e0-ab19-4cdc-a6bc-3d642b912eae', label: 'Shopping', emoji: '🛍️' },
  { id: '58bcb17c-a844-4163-a6ee-3f90dc0515ca', label: 'Healthcare', emoji: '🏥' },
  { id: '9f989148-682a-4355-865b-8ba71e2b43b8', label: 'Education', emoji: '🎓' },
  { id: 'c7f5250c-ac00-42f9-923f-bd79417f694b', label: 'Travel', emoji: '✈️' },
  { id: 'ec065761-2805-4098-a1f9-cf6b6310e839', label: 'Home & Furniture', emoji: '🛋️' },
  { id: '550adb82-0151-427a-a107-9141c594f799', label: 'Fashion', emoji: '👕' },
  { id: '2aafadc0-ff83-4297-ae2d-3b36eb655bdd', label: 'Insurance', emoji: '🛡️' },
  { id: 'cb8b0aa4-3c98-4246-92c9-df0c0c4fe0fb', label: 'Business', emoji: '💼' },
  { id: 'bdbd0c45-86b3-4e78-80ca-28973c6520cb', label: 'Subscription', emoji: '🔄' },
  { id: '66331699-fa7b-4d43-8d73-f338e4d6348e', label: 'Pet Care', emoji: '🐾' },
  { id: 'e6f3d226-bfba-4491-bd9e-52cf0541d399', label: 'Gifts', emoji: '🎁' },
  { id: '050aa61c-6cc6-4e6d-bb58-190370717b9e', label: 'Taxes', emoji: '💵' },
  { id: '5085268a-da58-40a1-abfb-71f577bd4713', label: 'Others', emoji: '📦' },
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
