import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '../../helper/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>BillVault</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Ionicons name="checkmark-circle-outline" size={80} color="#34C759" style={styles.icon} />
          <Text style={styles.title}>You are Logged In!</Text>
          <Text style={styles.subtitle}>Welcome to your Bill Management Dashboard</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B65E4',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
