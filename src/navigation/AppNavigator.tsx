import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import { ProfileSetupScreen, SplashScreen } from '../modules/auth';
import { useGetProfileDetails } from '../services/query/profile/profile';
import { BillDetailsScreen } from '../modules/bills';
import { SearchScreen } from '../modules/search';
import { BillReviewScreen } from '../modules/ocr';
import { ManualEntryScreen } from '../modules/upload';
import FamilyHomeScreen from '../modules/family/screens/FamilyHomeScreen';
import { initializeFCMNotificationService } from '../services/messagingService';

export type AppStackParamList = {
  ProfileSetup: undefined;
  MainTabs: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Cards: undefined;
  Categories: undefined;
  ViewBills: undefined;
  Search?: { initialQuery?: string };
  BillDetails: { billId: string; sharedBillId?: string };
  BillReview: {
    fileUri: string;
    fileName: string;
    fileType: string;
  };
  ManualEntry: undefined;
  FamilyHome: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const { data, isLoading, isError, refetch } = useGetProfileDetails();

  const profile = data?.profile;

  useEffect(() => {
    if (profile?.onboarding_completed) {
      let cleanup: (() => void) | undefined;
      initializeFCMNotificationService().then((unsub) => {
        cleanup = unsub;
      });
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [profile?.onboarding_completed]);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (isError) {
    return (
      <LinearGradient
        colors={['#243B6E', '#1C2B52', '#162547']}
        locations={[0, 0.45, 1]}
        style={styles.errorContainer}
      >
        <StatusBar style="light" />
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color="#FF6B6B" />
          </View>
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorText}>
            The server could not be reached. Please check your internet connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  console.log(profile, 'profile======>');
  const initialRoute = profile?.onboarding_completed ? 'MainTabs' : 'ProfileSetup';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Dashboard" component={BottomTabNavigator} />
      <Stack.Screen name="ViewBills" component={BottomTabNavigator} />
      <Stack.Screen name="Categories" component={BottomTabNavigator} />
      <Stack.Screen name="Profile" component={BottomTabNavigator} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
      <Stack.Screen name="BillReview" component={BillReviewScreen} />
      <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
      <Stack.Screen name="FamilyHome" component={FamilyHomeScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  errorIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  retryButton: {
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
