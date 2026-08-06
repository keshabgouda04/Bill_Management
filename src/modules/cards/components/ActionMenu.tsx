import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Share,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { VisitingCardProps } from '../types/cardProps';
import { MoreActionsModal } from './MoreActionsModal';

interface ActionMenuProps {
  data: VisitingCardProps;
  visible: boolean;
  onClose?: () => void;
  onShowQR?: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ data, visible, onShowQR }) => {
  const [moreModalVisible, setMoreModalVisible] = useState(false);

  const itemAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (visible) {
      itemAnims.forEach((anim) => anim.setValue(0));
      const animations = itemAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 25,
          useNativeDriver: true,
        })
      );
      Animated.stagger(40, animations).start();
    } else {
      itemAnims.forEach((anim) => anim.setValue(0));
      setMoreModalVisible(false);
    }
  }, [visible]);

  if (!visible) return null;

  const handleCall = () => {
    if (!data.phone) return Alert.alert('Notice', 'No phone number available');
    Linking.openURL(`tel:${data.phone}`).catch(() => Alert.alert('Error', 'Cannot open dialer'));
  };

  const handleEmail = () => {
    if (!data.email) return Alert.alert('Notice', 'No email available');
    Linking.openURL(`mailto:${data.email}`).catch(() => Alert.alert('Error', 'Cannot open mail client'));
  };

  const handleWebsite = () => {
    if (!data.website) return Alert.alert('Notice', 'No website available');
    const formatted = data.website.startsWith('http') ? data.website : `https://${data.website}`;
    Linking.openURL(formatted).catch(() => Alert.alert('Error', 'Cannot open URL'));
  };

  const handleWhatsApp = () => {
    if (!data.phone) return Alert.alert('Notice', 'No phone number available');
    const cleanNum = data.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${cleanNum}`).catch(() =>
      Alert.alert('Error', 'WhatsApp is not installed')
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Contact Card:\n${data.name}\n${data.designation} at ${data.company}\nPhone: ${data.phone}\nEmail: ${data.email}`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  const handleMoreActions = () => {
    setMoreModalVisible(true);
  };

  // Column 1 (Left - 3 items)
  const col1 = [
    { index: 0, id: 'call', labelLine1: 'call', labelLine2: 'now', iconType: 'ion', icon: 'checkmark-circle-outline', action: handleCall },
    { index: 1, id: 'email', labelLine1: 'send', labelLine2: 'email', iconType: 'ion', icon: 'document-text-outline', action: handleEmail },
    { index: 2, id: 'website', labelLine1: 'visit', labelLine2: 'website', iconType: 'ion', icon: 'globe-outline', action: handleWebsite },
  ];

  // Column 2 (Right - 3 items with 6th item as "more actions")
  const col2 = [
    { index: 3, id: 'whatsapp', labelLine1: 'chat', labelLine2: 'whatsapp', iconType: 'fa5', icon: 'whatsapp', action: handleWhatsApp },
    { index: 4, id: 'share', labelLine1: 'share', labelLine2: 'card', iconType: 'ion', icon: 'share-outline', action: handleShare },
    { index: 5, id: 'more', labelLine1: 'more', labelLine2: 'actions', iconType: 'mci', icon: 'dots-grid', action: handleMoreActions },
  ];

  const renderItem = (item: typeof col1[0]) => {
    const anim = itemAnims[item.index] || new Animated.Value(1);
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });
    const opacity = anim;

    return (
      <Animated.View key={item.id} style={[styles.itemWrapper, { opacity, transform: [{ scale }] }]}>
        <TouchableOpacity style={styles.circleButton} activeOpacity={0.7} onPress={item.action}>
          {item.iconType === 'fa5' ? (
            <FontAwesome5 name={item.icon} size={20} color="#475569" />
          ) : item.iconType === 'mci' ? (
            <MaterialCommunityIcons name={item.icon as any} size={22} color="#475569" />
          ) : (
            <Ionicons name={item.icon as any} size={22} color="#475569" />
          )}
        </TouchableOpacity>
        <Text style={styles.labelLine}>{item.labelLine1}</Text>
        <Text style={styles.labelLine}>{item.labelLine2}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.menuContainer}>
      <View style={styles.columnsRow}>
        {/* Left Column */}
        <View style={styles.column}>{col1.map(renderItem)}</View>

        {/* Right Column */}
        <View style={styles.column}>{col2.map(renderItem)}</View>
      </View>

      {/* Premium Bottom Action Sheet Modal for More Actions */}
      <MoreActionsModal
        visible={moreModalVisible}
        data={data}
        onClose={() => setMoreModalVisible(false)}
        onShowQR={onShowQR}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    right: 4,
    width: 185,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 20,
  },
  columnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  column: {
    width: 86,
    alignItems: 'center',
    gap: 14,
  },
  itemWrapper: {
    alignItems: 'center',
    width: 86,
  },
  circleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  labelLine: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 12,
  },
});
