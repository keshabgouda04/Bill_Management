import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import aesjs from 'aes-js';

const ENCRYPTION_KEY_NAME = 'supabase.auth.aes.key';

class LargeSecureStore {
  private async getEncryptionKey(): Promise<Uint8Array> {
    let keyStr = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    if (!keyStr) {
      // Generate a new 256-bit key (32 bytes)
      const newKey = Crypto.getRandomBytes(32);
      // Store it in hex format
      keyStr = aesjs.utils.hex.fromBytes(newKey);
      await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, keyStr);
    }
    return aesjs.utils.hex.toBytes(keyStr);
  }

  async getItem(key: string): Promise<string | null> {
    const encryptedDataStr = await AsyncStorage.getItem(key);
    if (!encryptedDataStr) return null;

    try {
      const encryptionKey = await this.getEncryptionKey();
      const encryptedBytes = aesjs.utils.hex.toBytes(encryptedDataStr);
      // Using CTR mode. Counter starts at 5 for uniqueness (as per common aes-js examples)
      const aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(5));
      const decryptedBytes = aesCtr.decrypt(encryptedBytes);
      return aesjs.utils.utf8.fromBytes(decryptedBytes);
    } catch (e) {
      console.error('Error decrypting Supabase session', e);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const encryptionKey = await this.getEncryptionKey();
      const textBytes = aesjs.utils.utf8.toBytes(value);
      const aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(5));
      const encryptedBytes = aesCtr.encrypt(textBytes);
      const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
      await AsyncStorage.setItem(key, encryptedHex);
    } catch (e) {
      console.error('Error encrypting Supabase session', e);
    }
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new LargeSecureStore(), // Saves encrypted session in AsyncStorage using a SecureStore key
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
