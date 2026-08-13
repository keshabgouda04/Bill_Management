import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
  PanResponder,
  TouchableWithoutFeedback,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VisitingCardProps } from '../types/cardProps';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { ActionMenu } from './ActionMenu';

const { width } = Dimensions.get('window');

interface Props extends VisitingCardProps {
  onShowQR?: () => void;
}

type CardMode = 'front' | 'menu' | 'back';

export const VisitingCard: React.FC<Props> = (props) => {
  const [cardMode, setCardMode] = useState<CardMode>('front');
  const [isFlipped, setIsFlipped] = useState(false);

  // Mutable ref to track mode in gestures
  const modeRef = useRef<CardMode>('front');
  useEffect(() => {
    modeRef.current = cardMode;
  }, [cardMode]);

  // Animated values:
  // sideAnim: 0 = centered, 1 = swiped left for side menu
  // flipAnim: 0 = front face (0deg), 1 = back face (180deg), 2 = back to front (360deg)
  const sideAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  // One-time intro slide to menu mode on initial load (first card only)
  const hasPeekedRef = useRef(false);
  useEffect(() => {
    if (props.autoIntroPeek && !hasPeekedRef.current) {
      hasPeekedRef.current = true;
      const timer = setTimeout(() => {
        if (modeRef.current === 'front') {
          animateToMode('menu');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [props.autoIntroPeek]);

  // Track flip value to toggle front/back display mid-rotation
  useEffect(() => {
    const listenerId = flipAnim.addListener(({ value }) => {
      const normalized = Math.abs(value % 2);
      if (normalized >= 0.5 && normalized < 1.5) {
        setIsFlipped(true);
      } else {
        setIsFlipped(false);
      }
    });
    return () => {
      flipAnim.removeListener(listenerId);
    };
  }, []);

  const animateToMode = (targetMode: CardMode) => {
    setCardMode(targetMode);
    modeRef.current = targetMode;

    if (targetMode === 'front') {
      // Return to resting front face
      Animated.parallel([
        Animated.spring(sideAnim, {
          toValue: 0,
          friction: 8,
          tension: 25,
          useNativeDriver: false,
        }),
        Animated.timing(flipAnim, {
          // @ts-ignore
          toValue: (flipAnim._value || 0) > 0.5 ? 2 : 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Reset flipAnim to 0 after completing 360deg rotation
        // @ts-ignore
        if ((flipAnim._value || 0) >= 1.8) {
          flipAnim.setValue(0);
        }
      });
    } else if (targetMode === 'menu') {
      // Slide left to reveal side action menu
      Animated.parallel([
        Animated.spring(sideAnim, {
          toValue: 1,
          friction: 7,
          tension: 25,
          useNativeDriver: false,
        }),
        Animated.spring(flipAnim, {
          toValue: 0,
          friction: 8,
          tension: 25,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (targetMode === 'back') {
      // Glide to center & flip 180° to back face
      Animated.parallel([
        Animated.spring(sideAnim, {
          toValue: 0,
          friction: 8,
          tension: 25,
          useNativeDriver: false,
        }),
        Animated.spring(flipAnim, {
          toValue: 1,
          friction: 7,
          tension: 20,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handleCardPress = () => {
    if (modeRef.current === 'front') {
      animateToMode('menu');
    } else if (modeRef.current === 'menu') {
      animateToMode('back');
    } else {
      animateToMode('front');
    }
  };

  const closeMenu = () => {
    if (modeRef.current !== 'front') {
      animateToMode('front');
    }
  };

  const handleQuickCall = (e: any) => {
    e.stopPropagation();
    if (!props.phone) return Alert.alert('Notice', 'No phone number provided');
    Linking.openURL(`tel:${props.phone}`).catch(() => Alert.alert('Error', 'Cannot open dialer'));
  };

  const handleQuickEmail = (e: any) => {
    e.stopPropagation();
    if (!props.email) return Alert.alert('Notice', 'No email address provided');
    Linking.openURL(`mailto:${props.email}`).catch(() => Alert.alert('Error', 'Cannot open mail client'));
  };

  const handleQuickQR = (e: any) => {
    e.stopPropagation();
    if (props.onShowQR) props.onShowQR();
  };

  // PanResponder Gesture Handler for Swipe & Tap
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        sideAnim.stopAnimation();
        flipAnim.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (modeRef.current === 'back') return;

        const baseValue = modeRef.current === 'menu' ? 1 : 0;
        const delta = -gestureState.dx / (width * 0.42);
        let newProgress = baseValue + delta;
        if (newProgress < 0) newProgress = 0;
        if (newProgress > 1) newProgress = 1;
        sideAnim.setValue(newProgress);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Tap gesture detection
        if (Math.abs(gestureState.dx) < 8 && Math.abs(gestureState.dy) < 8) {
          handleCardPress();
          return;
        }

        if (modeRef.current === 'back') {
          animateToMode('front');
          return;
        }

        if (gestureState.dx < -30 || gestureState.vx < -0.3) {
          animateToMode('menu');
        } else if (gestureState.dx > 30 || gestureState.vx > 0.3) {
          animateToMode('front');
        } else {
          // @ts-ignore
          const currentVal = sideAnim._value || 0;
          animateToMode(currentVal > 0.4 ? 'menu' : 'front');
        }
      },
      onPanResponderTerminate: () => {
        animateToMode(modeRef.current);
      },
    })
  ).current;

  // 3D Perspective Transformations: Vertical Flip (rotateX) & Vertical Arc (translateY from Y to -Y)
  const rotateY = sideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-18deg'],
  });

  const rotateX = flipAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0deg', '-180deg', '-360deg'],
  });

  const translateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [0, -35, 0, 35, 0],
  });

  const scale = Animated.add(
    sideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.80],
    }),
    flipAnim.interpolate({
      inputRange: [0, 0.5, 1, 1.5, 2],
      outputRange: [0, 0.08, 0, 0.08, 0],
    })
  );

  const translateX = sideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width * 0.42],
  });

  const pillOpacity = sideAnim.interpolate({
    inputRange: [0, 0.3],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      {/* Backdrop to close menu when tapping outside */}
      {cardMode !== 'front' && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      {/* Main Interactive Stage */}
      <View style={styles.stage}>
        {/* 3D Card Stage */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateX },
                { translateY },
                { perspective: 1000 },
                { rotateY },
                { rotateX },
                { scale },
              ],
            },
          ]}
        >
          {isFlipped ? (
            <View style={styles.backWrapper}>
              <CardBack data={props} onShowQR={props.onShowQR} />
            </View>
          ) : (
            <CardFront data={props} isExpanded={cardMode === 'menu'} />
          )}
        </Animated.View>

        {/* RIGHT SIDE: 2-Column Action Menu */}
        <ActionMenu
          data={props}
          visible={cardMode === 'menu'}
          onClose={closeMenu}
          onShowQR={props.onShowQR}
          onFlipCard={() => animateToMode('back')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 0,
    alignItems: 'center',
    position: 'relative',
  },
  backdrop: {
    position: 'absolute',
    top: -100,
    bottom: -100,
    left: -100,
    right: -100,
    zIndex: 1,
  },
  stage: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    zIndex: 2,
    position: 'relative',
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  backWrapper: {
    transform: [{ scaleY: -1 }],
  },
  actionDockWrapper: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    zIndex: 5,
    width: width * 0.26,
  },
  actionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    gap: 8,
  },
  dockTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingLeft: 2,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  dockTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
  },
  dockDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
  },
  dockIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dockIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockTriggerBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  dockTriggerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dockTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
