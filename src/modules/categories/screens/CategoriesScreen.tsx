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
import { CategoryCard, BillItem } from '../components/CategoryCard';
import { CategoryFilterTabs } from '../components/CategoryFilterTabs';
import { BottomTabBar } from '../../../navigation/components/BottomTabBar';
import { useGetBills } from '../../bills/api/billsApi';



const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  all: { label: 'All', emoji: '📋' },
  electronics: { label: 'Electronics', emoji: '📱' },
  vehicle: { label: 'Vehicle', emoji: '🚗' },
  furniture: { label: 'Furniture', emoji: '🛋️' },
  home: { label: 'Home', emoji: '🏠' },
  shopping: { label: 'Shopping', emoji: '🛍️' },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { data, isLoading } = useGetBills();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery] = useState('');

  const bills = data?.data?.bills || [];

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

  // Extract unique categories dynamically from API bills
  const dynamicTabs = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(mappedBills.map(b => b.category).filter(Boolean))
    );
    const tabs = uniqueCategories.map(cat => {
      const key = cat.toLowerCase();
      const meta = CATEGORY_META[key];
      return {
        id: cat,
        label: meta ? meta.label : cat.charAt(0).toUpperCase() + cat.slice(1),
        emoji: meta ? meta.emoji : '📦',
      };
    });
    return [
      { id: 'all', label: CATEGORY_META.all.label, emoji: CATEGORY_META.all.emoji },
      ...tabs
    ];
  }, [mappedBills]);

  const filteredBills = useMemo(() => {
    let list = selectedTab === 'all'
      ? mappedBills
      : mappedBills.filter(b => b.category.toLowerCase() === selectedTab.toLowerCase());

    if (searchQuery.trim()) {
      list = list.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.store.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [selectedTab, searchQuery, mappedBills]);

  if (isLoading) {
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

      {/* ── Header (Matching Mockup exactly) ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>Browse your bills by category</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="search-outline" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="options-outline" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filter Tabs ── */}
      <CategoryFilterTabs
        selected={selectedTab}
        onSelect={setSelectedTab}
        tabs={dynamicTabs}
      />

      {/* ── Bills List ── */}
      <FlatList
        style={{ flex: 1}}
        
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
            <Text style={styles.emptySubtitle}>Try selecting a different category</Text>
          </View>
        }
      />

      {/* ── Bottom Tab Bar ── */}
      <BottomTabBar />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FD' },

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

  // List
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  emptySubtitle: { fontSize: 13, color: '#999' },
});
