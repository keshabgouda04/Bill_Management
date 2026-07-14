import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../navigation/AppNavigator';
import { useGetBills, Bill, PaymentStatus } from '../api/billsApi';
import { BillCard } from '../components/BillCard';

type FilterType = 'ALL' | 'UPCOMING' | 'PAID' | 'OVERDUE';

export default function ViewBillsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { data, isLoading, isError, refetch } = useGetBills();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

  const bills = data?.data?.bills || [];
  

  // Filter bills based on selected tab
  const filteredBills = useMemo(() => {
    switch (selectedFilter) {
      case 'UPCOMING':
        return bills.filter((b) => b.payment_status === 'PARTIAL');
      case 'PAID':
        return bills.filter((b) => b.payment_status === 'PAID');
      case 'OVERDUE':
        return bills.filter((b) => b.payment_status === 'UNPAID');
      case 'ALL':
      default:
        return bills;
    }
  }, [bills, selectedFilter]);

  // Calculations for summary strip
  const totalBillsCount = filteredBills.length;
  const totalAmount = useMemo(() => {
    return filteredBills.reduce((sum, b) => sum + b.total_amount, 0);
  }, [filteredBills]);

  const handleBack = () => {
    navigation.goBack();
  };

  const getFilterStyle = (filter: FilterType) => {
    return selectedFilter === filter ? styles.activeTab : styles.inactiveTab;
  };

  const getFilterTextStyle = (filter: FilterType) => {
    return selectedFilter === filter ? styles.activeTabText : styles.inactiveTabText;
  };

  if (isLoading) {
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
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="search-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="options-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

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
      <FlatList
        data={filteredBills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BillCard
            bill={item}
            onPress={() => navigation.navigate('BillDetails', { billId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No bills found under {selectedFilter.toLowerCase()}</Text>
          </View>
        }
      />

      {/* Summary Box */}
      <View style={styles.summaryBox}>
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
          <Ionicons name="chevron-forward" size={20} color="#0052CC" />
        </View>
      </View>
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
});

