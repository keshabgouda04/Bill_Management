import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// ─── Animated Tab Item ───────────────────────────────────────────────────────

interface AnimatedTabItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

const AnimatedTabItem = ({ icon, label, isActive, onPress }: AnimatedTabItemProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.8,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 14,
    }).start();
    onPress?.();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.tabItem}>
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <Ionicons name={icon as any} size={22} color={isActive ? '#4B65E4' : '#999'} />
        <Text style={[styles.tabLabel, { color: isActive ? '#4B65E4' : '#999' }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

// ─── Animated Center Add Button ──────────────────────────────────────────────

const AnimatedAddButton = ({ onPress }: { onPress?: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 60,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 15,
      bounciness: 18,
    }).start();
    onPress?.();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.tabAddBtn, { transform: [{ scale }] }]}>
        <Ionicons name="add" size={28} color="#FFF" />
      </Animated.View>
    </Pressable>
  );
};

// ─── Main Bottom Tab Bar Component ───────────────────────────────────────────

const TAB_ITEMS = [
  { id: 'home', icon: 'home', iconInactive: 'home-outline', label: 'Home' },
  { id: 'bills', icon: 'document-text', iconInactive: 'document-text-outline', label: 'Bills' },
  { id: 'alerts', icon: 'notifications', iconInactive: 'notifications-outline', label: 'Alerts' },
  { id: 'profile', icon: 'person', iconInactive: 'person-outline', label: 'Profile' },
];

export const BottomTabBar = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tabId: string) => {
    if (tabId === 'profile') {
      navigation.navigate('Profile');
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TAB_ITEMS.slice(0, 2).map((tab) => (
        <AnimatedTabItem
          key={tab.id}
          icon={activeTab === tab.id ? tab.icon : tab.iconInactive}
          label={tab.label}
          isActive={activeTab === tab.id}
          onPress={() => handleTabPress(tab.id)}
        />
      ))}

      {/* Center animated Add button */}
      <AnimatedAddButton />

      {TAB_ITEMS.slice(2).map((tab) => (
        <AnimatedTabItem
          key={tab.id}
          icon={activeTab === tab.id ? tab.icon : tab.iconInactive}
          label={tab.label}
          isActive={activeTab === tab.id}
          onPress={() => handleTabPress(tab.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingHorizontal: 8, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 10,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, gap: 3 },
  tabLabel: { fontSize: 10, color: '#999', fontWeight: '500' },
  tabAddBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#4B65E4', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4B65E4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});
