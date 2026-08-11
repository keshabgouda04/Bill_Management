import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { navigationRef } from './navigation/navigationRef';
import InAppNotificationBanner from './components/common/InAppNotificationBanner';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
        <InAppNotificationBanner />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
