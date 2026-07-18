import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '../helper/supabase';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get initial session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial Session:', session);
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth Event:', _event);

      if (_event === 'SIGNED_OUT') {
        // Clear React Query cache on logout
        queryClient.clear();
      }

      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Wait only until Supabase session is determined
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show App or Auth based on session
  return session ? <AppNavigator /> : <AuthNavigator />;
}
