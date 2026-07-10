import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useGetProfileDetails } from '../api/profileApi';
import { supabase } from '../../../helper/supabase';
import { InfoRow, SectionCard, StatChip, EditProfileModal } from '../components';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { data, isLoading, isError } = useGetProfileDetails();
  const profile = data?.profile;
  const [avatarError, setAvatarError] = useState(false);

  // ── Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);

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
          <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4B65E4" />
            <Text style={styles.verifiedText}>Verified Account</Text>
          </View>
          <Text style={styles.memberSince}>
            Member since {formatDate(profile?.created_at) || '—'}
          </Text>
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.statsRow}>
          <StatChip value="124" label="Bills" />
          <View style={styles.statsDivider} />
          <StatChip value="12" label="Warranties" />
          <View style={styles.statsDivider} />
          <StatChip value="8" label="Categories" />
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
          <InfoRow icon="time-outline" label="Timezone" value={profile?.timezone} />
        </SectionCard>

        {/* ── Account Activity ── */}
        <SectionCard title="Activity">
          <InfoRow icon="log-in-outline" label="Last Login" value={formatDateTime(profile?.last_login)} />
          <InfoRow icon="calendar-outline" label="Joined On" value={formatDate(profile?.created_at)} />
        </SectionCard>

        {/* ── Auth Provider ── */}
        <SectionCard title="Sign-In Method">
          <View style={styles.providerRow}>
            <Ionicons
              name={profile?.provider === 'google' ? 'logo-google' : 'phone-portrait-outline'}
              size={22}
              color={profile?.provider === 'google' ? '#DB4437' : '#4B65E4'}
            />
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },

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

  // Avatar section
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#4B65E4', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#4B65E4', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  avatarImage: {
    width: 90, height: 90, borderRadius: 45, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  verifiedText: { fontSize: 13, color: '#4B65E4', fontWeight: '600' },
  memberSince: { fontSize: 12, color: '#999' },

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
