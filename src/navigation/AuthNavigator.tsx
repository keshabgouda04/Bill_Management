import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, OTPScreen } from '../modules/auth';

// Define our stack param list for TypeScript
export type AuthStackParamList = {
  Login: undefined;
  OTP: { phoneNumber: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // We hide the header because the design doesn't have a top nav bar
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
    </Stack.Navigator>
  );
}
