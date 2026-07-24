import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../navigation/AppNavigator';
import { useGetBillsInfinite, Bill, PaymentStatus } from '../api/billsApi';
import { useSearchBillsInfinite } from '../../search';
import { useDebounce } from '../../../hooks/useDebounce';
import { BillCard } from '../components/BillCard';

type FilterType = 'ALL' | 'UPCOMING' | 'PAID' | 'OVERDUE';

export default function ViewBillsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    data: allBillsData,
    isLoading: isAllBillsLoading,
    isError,
    refetch,
    fetchNextPage: fetchNextPageAll,
    hasNextPage: hasNextPageAll,
    isFetchingNextPage: isFetchingNextPageAll,
  } = useGetBillsInfinite(10);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  let apiStatus: string | undefined = undefined;
  if (selectedFilter === 'UPCOMING') apiStatus = 'PARTIAL';
  else if (selectedFilter === 'PAID') apiStatus = 'PAID';
  else if (selectedFilter === 'OVERDUE') apiStatus = 'UNPAID';

  const {
    data: searchData,
    isLoading: isSearchLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchBillsInfinite(
    debouncedSearchQuery,
    undefined,
    apiStatus,
    2
  );
  const { width, height } = Dimensions.get('window');

  const isQueryActive = searchQuery.trim().length > 0;

  // Use API search results if searchQuery is active, otherwise paginated allBills list
  const bills = useMemo(() => {
    if (isQueryActive) {
      return searchData?.pages.flatMap((page) => page.data?.bills || []) || [];
    }
    return allBillsData?.pages.flatMap((page) => page.data?.bills || []) || [];
  }, [isQueryActive, searchData, allBillsData]);

  // Filter bills based on selected tab and search query fallback
  const filteredBills = useMemo(() => {
    let list: Bill[] = [];

    if (!isQueryActive) {
      switch (selectedFilter) {
        case 'UPCOMING':
          list = bills.filter((b: Bill) => b.payment_status === 'PARTIAL');
          break;
        case 'PAID':
          list = bills.filter((b: Bill) => b.payment_status === 'PAID');
          break;
        case 'OVERDUE':
          list = bills.filter((b: Bill) => b.payment_status === 'UNPAID');
          break;
        case 'ALL':
        default:
          list = bills;
          break;
      }
    } else {
      list = bills;
    }

    // this function locally searched if the api does not return data
    if (isQueryActive && !searchData) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b: Bill) =>
        (b.invoice_number && b.invoice_number.toLowerCase().includes(q)) ||
        (b.purchase_location && b.purchase_location.toLowerCase().includes(q))
      );
    }

    return list;
  }, [bills, selectedFilter, searchQuery, searchData, isQueryActive]);

  // Calculations for summary strip
  const serverPaginationTotal = allBillsData?.pages[0]?.data?.pagination?.total;
  const serverStats = allBillsData?.pages[0]?.data?.stats;

  const totalBillsCount = (!isQueryActive && selectedFilter === 'ALL' && typeof serverPaginationTotal === 'number')
    ? serverPaginationTotal
    : filteredBills.length;

  const totalAmount = useMemo(() => {
    if (!isQueryActive && selectedFilter === 'ALL' && serverStats && typeof serverStats.totalAmountSum === 'number') {
      return serverStats.totalAmountSum;
    }
    return filteredBills.reduce((sum, b) => sum + b.total_amount, 0);
  }, [filteredBills, isQueryActive, selectedFilter, serverStats]);

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleSearch = () => {
    if (isSearchVisible) {
      setSearchQuery('');
    }
    setIsSearchVisible(!isSearchVisible);
  };

  const getFilterStyle = (filter: FilterType) => {
    return selectedFilter === filter ? styles.activeTab : styles.inactiveTab;
  };

  const getFilterTextStyle = (filter: FilterType) => {
    return selectedFilter === filter ? styles.activeTabText : styles.inactiveTabText;
  };

  if (isAllBillsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Fetching your bills...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color="#FF4444" />
          <Text style={styles.errorText}>Failed to load bills.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Bills</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerIcon, isSearchVisible && styles.headerIconActive]}
            onPress={toggleSearch}
          >
            <Ionicons
              name={isSearchVisible ? "close-outline" : "search-outline"}
              size={22}
              color={isSearchVisible ? "#0052CC" : "#1A1A1A"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="options-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Collapsible Search Input Bar */}
      {isSearchVisible && (
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by merchant or invoice number..."
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['ALL', 'UPCOMING', 'PAID', 'OVERDUE'] as FilterType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, getFilterStyle(tab)]}
            onPress={() => setSelectedFilter(tab)}
          >
            <Text style={[styles.tabText, getFilterTextStyle(tab)]}>
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bills List */}
      {isQueryActive && isSearchLoading ? (
        <View style={styles.bodyLoadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BillCard
              bill={item}
              onPress={() => navigation.navigate('BillDetails', { billId: item.id })}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.round(height * 0.27) }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>
                {searchQuery.trim() ? 'No results found' : 'No bills here yet'}
              </Text>
              <Text style={[styles.emptyText, { fontSize: 13, marginTop: 6 }]}>
                {searchQuery.trim()
                  ? `No bills match your search "${searchQuery}"`
                  : 'Upload a bill or select a different category to view details.'}
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

      {/* Summary Box */}
      {!isKeyboardVisible && (
        <View style={[styles.summaryBox, { bottom: Math.max(Math.round(height * 0.16)) }]}>
          <View style={styles.summaryItem}>
          <Ionicons name="document-text-outline" size={20} color="#0052CC" style={styles.summaryIcon} />
          <View>
            <Text style={styles.summaryLabel}>Total Bills</Text>
            <Text style={styles.summaryValue}>{totalBillsCount}</Text>
          </View>
        </View>
        <View style={styles.summaryItem}>
          <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValueAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
    padding: 4,
    borderRadius: 8,
  },
  headerIconActive: {
    backgroundColor: '#E0E8FF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0052CC',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#0052CC',
  },
  inactiveTab: {
    backgroundColor: '#F0F2F5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  inactiveTabText: {
    color: '#666666',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 100, // extra padding for absolute elements or bottom tabs
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FF4444',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0052CC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  summaryBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    marginRight: 10,
    backgroundColor: '#E0E8FF',
    padding: 8,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  summaryValueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0052CC',
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
});

