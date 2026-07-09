import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Custom Storage adapter to save Supabase sessions securely on the device
const SecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,//Whenever you need to save or read the session, use this adapter
    autoRefreshToken: true,//Automatically refreshed the token 
    persistSession: true,//Keep the user logged in even after the app closes
    detectSessionInUrl: false, // Prevents mobile deep linking conflicts
  },
});
