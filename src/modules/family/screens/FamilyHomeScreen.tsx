import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetFamily } from '../api/familyApi';
import FamilyDashboardScreen from './FamilyDashboardScreen';
import CreateFamilyScreen from './CreateFamilyScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FamilyHomeScreen() {
  const navigation = useNavigation();
  const { data: family, isLoading, isError, refetch } = useGetFamily();

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4B65E4" />
        <Text style={styles.loadingText}>Loading Family Share...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Could not load Family data.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render Dashboard if they have a family, otherwise Create screen
  if (family) {
    return <FamilyDashboardScreen family={family} onBack={handleBack} />;
  }

  return <CreateFamilyScreen onBack={handleBack} />;
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 15,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#4B65E4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  backBtn: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 15,
  },
});
