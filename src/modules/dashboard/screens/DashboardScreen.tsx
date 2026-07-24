import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../navigation/AppNavigator';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useGetProfileDetails } from '../../../services/query/profile/profile';
import { supabase } from '../../../helper/supabase';
import { SearchBar } from '../../../components/common/SearchBar';
import {
  ActionCenterSection,
  QuickActions,
  StatsRow,
  RecentActivitySection,
  SpendingGraphSection,
  CategoriesSection,
  FamilyVaultSection,
  RecentBillsSection,
  UploadBanner,
} from '../components';

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { data } = useGetProfileDetails();
  const profile = data?.profile;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  // ── Upload PDF (File Picker) ────────────────────────────────────────────────
  const handleUploadBill = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        navigation.navigate('BillReview', {
          fileUri: file.uri,
          fileName: file.name || 'uploaded_bill.pdf',
          fileType: file.mimeType || 'application/pdf',
        });
      }
    } catch {
      Alert.alert('Error', 'Could not open file picker.');
    }
  };

  // ── Scan Bill (Camera) ──────────────────────────────────────────────────────
  const handleScanBill = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to scan bills.');
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        navigation.navigate('BillReview', {
          fileUri: file.uri,
          fileName: file.fileName || 'scanned_bill.jpg',
          fileType: file.mimeType || 'image/jpeg',
        });
      }
    } catch {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  // const handleLogout = () => {
  //   Alert.alert(
  //     'Log Out',
  //     'Are you sure you want to log out?',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       { text: 'Log Out', style: 'destructive', onPress: async () => await supabase.auth.signOut() },
  //     ]
  //   );
  // };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.profileCircle}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.profileText}>{profile?.full_name?.slice(0,1).toUpperCase()}</Text>
            )}
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.nameText}>{firstName}</Text>
              <Ionicons name="checkmark-circle" size={16} color="#4B65E4" />
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Notifications', 'No new alerts.')}
          >
            <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Global Search Trigger ── */}
        <SearchBar
          placeholder="Search invoice #, store, category..."
          onPress={() => navigation.navigate('Search')}
        />

        <ActionCenterSection />
        <UploadBanner onPress={handleUploadBill} />
        <QuickActions
          onScan={handleScanBill}
          onUpload={handleUploadBill}
          onManualEntry={() => navigation.navigate('ManualEntry')}
        />
        <StatsRow />
        <RecentBillsSection />
        <CategoriesSection />
        <RecentActivitySection />
        <SpendingGraphSection />
        <FamilyVaultSection />

        {/* Bottom padding for tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  profileCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#4B65E4',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4B65E4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  greetingText: { fontSize: 13, color: '#999', fontWeight: '500' },
  nameText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F6FA',
    justifyContent: 'center', alignItems: 'center',
  },
  iconButtonLogout: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF0F0',
    justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
});
