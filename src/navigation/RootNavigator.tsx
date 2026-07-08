import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../helper/supabase';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useQueryClient } from '@tanstack/react-query';

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Get initial session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial Session:", session);
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes dynamically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth Event:", _event);

      if (_event === 'SIGNED_OUT') {
        // Completely wipe the React Query cache so the next user doesn't see old data
        queryClient.clear();
      }

      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B65E4" />
      </View>
    );
  }

  // Switch stacks based on the session state
  return session ? <AppNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
