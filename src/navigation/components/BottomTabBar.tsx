import React, { useRef } from 'react';
import { StyleSheet, Text, View, Animated, Pressable, Keyboard, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';


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
        <Ionicons name="scan-outline" size={26} color="#FFF" />
      </Animated.View>
    </Pressable>
  );
};

// ─── Main Bottom Tab Bar Component ───────────────────────────────────────────

const TAB_CONFIG = [
  { name: 'Dashboard', id: 'home', icon: 'home', iconInactive: 'home-outline', label: 'Home' },
  { name: 'ViewBills', id: 'bills', icon: 'document-text', iconInactive: 'document-text-outline', label: 'Bills' },
  { name: 'Cards', id: 'cards', icon: 'card', iconInactive: 'card-outline', label: 'Cards' },
  { name: 'Profile', id: 'profile', icon: 'person', iconInactive: 'person-outline', label: 'Profile' },
];

export const BottomTabBar = (props: Partial<BottomTabBarProps> & { onAddPress?: () => void }) => {
  const insets = useSafeAreaInsets();
  const { state, navigation, onAddPress } = props;
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  const currentRouteName = state?.routes[state.index]?.name || 'Dashboard';

  const handleTabPress = (routeName: string) => {
    if (routeName === 'Cards' || routeName === 'Alerts') {
      // Visiting card page is not ready yet - do not navigate to any page
      return;
    }
    if (navigation && routeName) {
      navigation.navigate(routeName);
    }
  };

  const handleAddPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to scan bills.');
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        if (navigation) {
          navigation.navigate('BillReview', {
            fileUri: file.uri,
            fileName: file.fileName || 'scanned_bill.jpg',
            fileType: file.mimeType || 'image/jpeg',
          });
        }
      }
    } catch (error) {
      console.error('Camera open error:', error);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TAB_CONFIG.slice(0, 2).map((tab) => {
        const isActive = currentRouteName === tab.name;
        return (
          <AnimatedTabItem
            key={tab.id}
            icon={isActive ? tab.icon : tab.iconInactive}
            label={tab.label}
            isActive={isActive}
            onPress={() => handleTabPress(tab.name)}
          />
        );
      })}

      {/* Center animated Add button */}
      <AnimatedAddButton onPress={handleAddPress} />

      {TAB_CONFIG.slice(2).map((tab) => {
        const isActive = currentRouteName === tab.name;
        return (
          <AnimatedTabItem
            key={tab.id}
            icon={isActive ? tab.icon : tab.iconInactive}
            label={tab.label}
            isActive={isActive}
            onPress={() => handleTabPress(tab.name)}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  tabAddBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4B65E4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4B65E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
