import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../modules/dashboard/DashboardScreen';
import ProfileSetupScreen from '../modules/auth/ProfileSetupScreen';

export type AppStackParamList = {
  ProfileSetup: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileSetup"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}
