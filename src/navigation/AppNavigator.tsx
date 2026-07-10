import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../modules/dashboard';
import { ProfileSetupScreen, SplashScreen } from '../modules/auth';
import { ProfileScreen } from '../modules/profile';
import { CategoriesScreen } from '../modules/categories';
import { useGetProfileDetails } from '../services/query/profile/profile';
import { ViewBillsScreen } from '../modules/bills';

export type AppStackParamList = {
  ProfileSetup: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Categories: undefined;
  ViewBills: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const { data, isLoading } = useGetProfileDetails();

  if (isLoading) {
    return <SplashScreen />;
  }

  const profile = data?.profile;
  console.log(profile, "profile======>")
  const initialRoute = profile?.onboarding_completed ? 'Dashboard' : 'ProfileSetup';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="ViewBills" component={ViewBillsScreen} />
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
});
