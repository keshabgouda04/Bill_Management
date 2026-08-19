import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useGetProfileDetails, useUploadAvatar } from '../api/profileApi';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useGetBillsInfinite } from '../../bills/api/billsApi';
import { supabase } from '../../../helper/supabase';
import { GoogleLogo, DIMENSIONS } from '../../../components/common';
import { InfoRow, SectionCard, StatChip, EditProfileModal } from '../components';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { data, isLoading, isError } = useGetProfileDetails();
  const profile = data?.profile;
  const [avatarError, setAvatarError] = useState(false);
  const uploadAvatarMutation = useUploadAvatar();

  const handleEditAvatar = async () => {
    Alert.alert(
      'Profile Photo',
      'Select a photo for your profile avatar.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Gallery', onPress: () => pickImage(false) },
      ]
    );
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery permission is required to choose photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (result.canceled) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      const lowerUri = uri.toLowerCase();
      const isAllowedFormat = lowerUri.endsWith('.jpg') ||
        lowerUri.endsWith('.jpeg') ||
        lowerUri.endsWith('.png') ||
        lowerUri.endsWith('.webp') ||
        lowerUri.endsWith('.heic');

      if (!isAllowedFormat) {
        Alert.alert('Invalid File', 'Only JPEG, PNG, WEBP, and HEIC image formats are supported.');
        return;
      }

      let fileSize = asset.fileSize;
      if (!fileSize) {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) {
          fileSize = info.size;
        }
      }

      if (fileSize && fileSize > 10 * 1024 * 1024) {
        Alert.alert('Invalid File', 'Image size exceeds the 10MB limit.');
        return;
      }

      const formData = new FormData();
      const ext = lowerUri.split('.').pop() || 'jpeg';
      const fileName = `avatar.${ext}`;
      const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      formData.append('avatar', {
        uri: uri,
        name: fileName,
        type: type,
      } as any);

      uploadAvatarMutation.mutate(formData, {
        onSuccess: () => {
          setAvatarError(false); // Reset error visibility state
          Alert.alert('Success', 'Profile avatar updated successfully!');
        },
        onError: (err: any) => {
          console.error('Avatar upload failed:', err);
          Alert.alert('Upload Failed', err.message || 'Could not upload avatar. Please try again.');
        },
      });
    } catch (e) {
      console.error('Error selecting image:', e);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  // ── Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);

  // ── Fetch dynamic stats
  const { data: billsData, isLoading: isBillsLoading } = useGetBillsInfinite(10);
  const bills = billsData?.pages.flatMap((page) => page.data?.bills || []) || [];
  const serverStats = billsData?.pages[0]?.data?.stats;
  const serverPagination = billsData?.pages[0]?.data?.pagination;

  // 1. Total Bills Count
  const totalBills = serverPagination?.total ?? bills.length;

  // 2. Active Warranties Count
  let localActiveWarrantiesCount = 0;
  const nowMs = Date.now();
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
        }
      }
    });
  });
  const activeWarrantiesCount = serverStats?.activeWarrantyCount ?? localActiveWarrantiesCount;

  // 3. Unique Categories Count
  const categoriesSet = new Set<string>();
  bills.forEach((b) => {
    if (b.category_id) {
      categoriesSet.add(b.category_id);
    }
  });
  const uniqueCategories = serverStats?.activeCategoryCount ?? (categoriesSet.size || 0);

  // Strip country code (+91) from phone number for display / pre-fill
  const stripCountryCode = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/^91/, '').trim();
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Format snake_case gender values to readable text
  const formatGender = (gender?: string | null) => {
    if (!gender) return null;
    return gender
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // ── Loading State ──
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.logoutBtn} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Debug: log raw data shape to Metro console
  // console.log('ProfileScreen data ===>', JSON.stringify(data, null, 2));
  // console.log('isLoading:', isLoading, '| isError:', isError, '| profile:', profile);

  // ── Error State — only show AFTER loading is complete ──
  if (!isLoading && (isError || !profile)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.logoutBtn} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
          <Text style={styles.errorText}>Could not load profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowEditModal(true)}>
            <Ionicons name="create-outline" size={20} color="#4B65E4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Edit Profile Modal ── */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Avatar + Name ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleEditAvatar}
            disabled={uploadAvatarMutation.isPending}
            activeOpacity={0.85}
          >
            {profile?.avatar_url && !avatarError ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}

            {uploadAvatarMutation.isPending ? (
              <View style={styles.avatarUploadLoader}>
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            ) : (
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.memberSince}>
            Member since {formatDate(profile?.created_at) || '—'}
          </Text>
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.statsRow}>
          <StatChip value={isBillsLoading ? '...' : String(totalBills)} label="Bills" />
          <View style={styles.statsDivider} />
          <StatChip value={isBillsLoading ? '...' : String(activeWarrantiesCount)} label="Warranties" />
          <View style={styles.statsDivider} />
          <StatChip value={isBillsLoading ? '...' : String(uniqueCategories)} label="Categories" />
        </View>

        {/* ── Contact Info ── */}
        <SectionCard title="Contact Information">
          <InfoRow icon="call-outline" label="Phone Number" value={stripCountryCode(profile?.phone) || '—'} />
          <InfoRow icon="mail-outline" label="Email Address" value={profile?.email} />
        </SectionCard>

        {/* ── Account Details ── */}
        <SectionCard title="Account Details">
          <InfoRow icon="person-outline" label="Full Name" value={profile?.full_name} />
          <InfoRow icon="transgender-outline" label="Gender" value={formatGender(profile?.gender)} />
          <InfoRow icon="earth-outline" label="Country" value={"India"} />
          <InfoRow icon="language-outline" label="Language" value={profile?.language} />
          {/* <InfoRow icon="time-outline" label="Timezone" value={profile?.timezone} /> */}
        </SectionCard>

        {/* ── Account Activity ── */}
        <SectionCard title="Activity">
          <InfoRow icon="log-in-outline" label="Last Login" value={formatDateTime(profile?.last_login)} />
          <InfoRow icon="calendar-outline" label="Joined On" value={formatDate(profile?.created_at)} />
        </SectionCard>

        {/* ── Auth Provider ── */}
        <SectionCard title="Sign-In Method">
          <View style={styles.providerRow}>
            {profile?.provider === 'google' ? (
              <GoogleLogo size={22} />
            ) : (
              <Ionicons name="phone-portrait-outline" size={22} color="#4B65E4" />
            )}
            <Text style={styles.providerText}>
              {profile?.provider === 'google' ? 'Google Account' : 'Phone Number (OTP)'}
            </Text>
          </View>
        </SectionCard>

        {/* ── Logout Button ── */}
        <TouchableOpacity style={styles.logoutFullBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#FF4444" />
          <Text style={styles.logoutFullBtnText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  scroll: { paddingHorizontal: DIMENSIONS.paddingHorizontal, paddingBottom: DIMENSIONS.paddingBottom },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F5F6FA', justifyContent: 'center', alignItems: 'center',
  },
  logoutBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center',
  },

  avatarSection: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, width: '100%' },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#4B65E4', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4B65E4', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  avatarImage: {
    width: 90, height: 90, borderRadius: 45,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4B65E4',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarUploadLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 4, textAlign: 'center' },
  memberSince: { fontSize: 12, color: '#999', textAlign: 'center' },

  // Stats
  statsRow: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16,
    padding: 16, marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  statsDivider: { width: 1, height: 36, backgroundColor: '#F0F0F0' },

  // Provider
  providerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8,
  },
  providerText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },

  // Logout Full Button
  logoutFullBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    height: 52, backgroundColor: '#FFF', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#FF4444', marginTop: 8,
  },
  logoutFullBtnText: { fontSize: 15, fontWeight: '700', color: '#FF4444' },

  // Loading / Error
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: '#999', fontWeight: '500' },
  errorText: { fontSize: 15, color: '#FF4444', fontWeight: '600', marginTop: 8 },

  // Header Actions
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
  },

});
