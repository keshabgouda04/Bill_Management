import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../modules/dashboard/DashboardScreen';
import ProfileSetupScreen from '../modules/auth/ProfileSetupScreen';
import { useGetProfileDetails } from '../services/query/profile/profile';

export type AppStackParamList = {
  ProfileSetup: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const { data, isLoading } = useGetProfileDetails();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B65E4" />
      </View>
    );
  }

  const profile = data?.profile;
  console.log(profile,"profile======>")
  const initialRoute = profile?.onboarding_completed ? 'Dashboard' : 'ProfileSetup';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
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
