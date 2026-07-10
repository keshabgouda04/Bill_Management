import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { CategoryCard, BillItem } from '../components/CategoryCard';
import { CategoryFilterTabs } from '../components/CategoryFilterTabs';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_BILLS: BillItem[] = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    store: 'Apple Store',
    amount: '₹1,45,000',
    date: '14 Nov 2024',
    status: 'Warranty active',
    category: 'electronics',
  },
  {
    id: '2',
    name: 'iPhone 16 Pro',
    store: 'Apple Store',
    amount: '₹1,29,900',
    date: '02 Oct 2024',
    status: 'Warranty active',
    category: 'electronics',
  },
  {
    id: '3',
    name: 'Samsung Smart TV 55"',
    store: 'Croma',
    amount: '₹62,400',
    date: '21 Jun 2024',
    status: 'Warranty active',
    category: 'electronics',
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5',
    store: 'Sony Center',
    amount: '₹29,990',
    date: '7 Aug 2023',
    status: 'Expired',
    category: 'electronics',
  },
  {
    id: '5',
    name: 'Honda Activa 6G',
    store: 'Honda Dealership',
    amount: '₹74,000',
    date: '15 Mar 2023',
    status: 'Warranty active',
    category: 'vehicle',
  },
  {
    id: '6',
    name: 'Car Service Record',
    store: 'AutoCare Garage',
    amount: '₹8,500',
    date: '22 Jan 2024',
    status: 'No warranty',
    category: 'vehicle',
  },
  {
    id: '7',
    name: '3-Seater Sofa',
    store: 'Pepperfry',
    amount: '₹32,000',
    date: '10 Feb 2024',
    status: 'Warranty active',
    category: 'furniture',
  },
  {
    id: '8',
    name: 'King-Size Bed Frame',
    store: 'Urban Ladder',
    amount: '₹45,000',
    date: '18 Apr 2024',
    status: 'Warranty active',
    category: 'furniture',
  },
  {
    id: '9',
    name: 'Water Purifier',
    store: 'Kent RO',
    amount: '₹14,000',
    date: '01 Sep 2023',
    status: 'Expired',
    category: 'home',
  },
  {
    id: '10',
    name: 'Air Conditioner 1.5T',
    store: 'Voltas',
    amount: '₹38,500',
    date: '30 May 2024',
    status: 'Warranty active',
    category: 'home',
  },
  {
    id: '11',
    name: 'Nike Air Max 270',
    store: 'Myntra',
    amount: '₹8,995',
    date: '05 Dec 2023',
    status: 'No warranty',
    category: 'shopping',
  },
  {
    id: '12',
    name: 'Ray-Ban Wayfarer',
    store: 'Lenskart',
    amount: '₹7,490',
    date: '11 Nov 2023',
    status: 'Expired',
    category: 'shopping',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery] = useState('');

  const filteredBills = useMemo(() => {
    let list = selectedTab === 'all'
      ? MOCK_BILLS
      : MOCK_BILLS.filter(b => b.category === selectedTab);

    if (searchQuery.trim()) {
      list = list.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.store.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [selectedTab, searchQuery]);

  const totalAmount = filteredBills.reduce((acc, b) => {
    const num = parseFloat(b.amount.replace(/[^0-9.]/g, ''));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>Browse your bills by category</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search-outline" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* ── Filter Tabs ── */}
      <CategoryFilterTabs selected={selectedTab} onSelect={setSelectedTab} />

      {/* ── Summary Strip ── */}
      <View style={styles.summaryStrip}>
        <Text style={styles.summaryCount}>
          <Text style={styles.summaryCountBold}>{filteredBills.length}</Text> items
        </Text>
        <Text style={styles.summaryTotal}>
          Total: <Text style={styles.summaryTotalBold}>₹{totalAmount.toLocaleString('en-IN')}</Text>
        </Text>
      </View>

      {/* ── Bills List ── */}
      <FlatList
        data={filteredBills}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CategoryCard item={item} onPress={() => { }} />
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
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 11, color: '#999', marginTop: 1 },
  searchBtn: {
    marginLeft: 'auto',
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center', alignItems: 'center',
  },

  // Summary strip
  summaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryCount: { fontSize: 13, color: '#666' },
  summaryCountBold: { fontWeight: '700', color: '#1A1A1A' },
  summaryTotal: { fontSize: 13, color: '#666' },
  summaryTotalBold: { fontWeight: '700', color: '#4B65E4' },

  // List
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  emptySubtitle: { fontSize: 13, color: '#999' },
});
