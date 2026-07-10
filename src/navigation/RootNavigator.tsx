import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../helper/supabase';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useQueryClient } from '@tanstack/react-query';
import { SplashScreen } from '../modules/auth';

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Keep splash screen visible for 2 seconds
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 4000);

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
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  if (loading || splashVisible) {
    return <SplashScreen />;
  }

  // Switch stacks based on the session state
  return session ? <AppNavigator /> : <AuthNavigator />;
}
