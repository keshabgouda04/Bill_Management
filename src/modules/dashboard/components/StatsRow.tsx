import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useGetBillsInfinite } from '../../bills/api/billsApi';

export const StatsRow = () => {
  const { data, isLoading } = useGetBillsInfinite(10);
  const bills = data?.pages.flatMap((page) => page.data?.bills || []) || [];
 
  const serverStats = data?.pages[0]?.data?.stats;
  const serverPagination = data?.pages[0]?.data?.pagination;

  // 1. Total Bills (server pagination total or local fallback)
  const totalBills = serverPagination?.total ?? bills.length;
  const now = new Date();
  const thisMonthBills = bills.filter((b) => {
    const d = new Date(b.purchase_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthCount = thisMonthBills.length;

  // 2. Active Warranties & Expiring
  let localActiveWarrantiesCount = 0;
  let expiringSoonCount = 0;
  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  bills.forEach((bill) => {
    if (!bill.bill_items || !bill.purchase_date) return;
    bill.bill_items.forEach((item) => {
      if (typeof item.warranty_months === 'number' && item.warranty_months > 0) {
        const purchaseDate = new Date(bill.purchase_date);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + item.warranty_months);

        const diffTime = expiryDate.getTime() - nowMs;
        if (diffTime > 0) {
          localActiveWarrantiesCount++;
          if (diffTime <= thirtyDaysMs) {
            expiringSoonCount++;
          }
        }
      }
    });
  });
  const activeWarrantiesCount = serverStats?.activeWarrantyCount ?? localActiveWarrantiesCount;

  // 3. Categories
  const categoriesSet = new Set<string>();
  bills.forEach((b) => {
    if (b.category_id) {
      categoriesSet.add(b.category_id);
    }
  });
  const uniqueCategories = serverStats?.activeCategoryCount ?? (categoriesSet.size || 1);

  // 4. Storage (scanned receipts estimation)
  const scannedCount = bills.filter((b) => b.photo_url || b.image_url || b.receipt_url || b.file_url).length;
  const estimatedStorageMB = Math.max(0.1, scannedCount * 0.5).toFixed(1);

  const STATS = [
    { label: 'Total Bills', value: String(totalBills), sub: `${thisMonthCount} this month` },
    { label: 'Active Warranties', value: String(activeWarrantiesCount), sub: `${expiringSoonCount} expiring` },
    { label: 'Categories', value: String(uniqueCategories), sub: 'Organized' },
    { label: 'Storage', value: `${estimatedStorageMB} MB`, sub: 'of 5 GB used' },
  ];

  return (
    <View style={styles.statsRow}>
      {STATS.map((stat, i) => (
        <View key={i} style={styles.statCard}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#4B65E4" style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
          ) : (
            <Text style={styles.statValue}>{stat.value}</Text>
          )}
          <Text style={styles.statLabel}>{stat.label}</Text>
          <Text style={styles.statSub}>{stat.sub}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#FFF', borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 6, elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginTop: 4 },
  statSub: { fontSize: 10, color: '#999', marginTop: 2 },
});
