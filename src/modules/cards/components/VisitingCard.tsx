import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VisitingCardProps } from '../types/cardProps';
import { CardFront } from './CardFront';
import { ActionMenu } from './ActionMenu';

const { width } = Dimensions.get('window');

interface Props extends VisitingCardProps {
  onShowQR?: () => void;
}

export const VisitingCard: React.FC<Props> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mutable ref to avoid stale closure
  const isExpandedRef = useRef(false);
  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  // Animated progress value (0 = closed/centered, 1 = opened/swiped left)
  const progress = useRef(new Animated.Value(0)).current;

  const animateToState = (toExpanded: boolean) => {
    setIsExpanded(toExpanded);
    isExpandedRef.current = toExpanded;
    Animated.spring(progress, {
      toValue: toExpanded ? 1 : 0,
      friction: 7,
      tension: 25,
      useNativeDriver: false,
    }).start();
  };

  const toggleOpen = () => {
    animateToState(!isExpandedRef.current);
  };

  const closeMenu = () => {
    if (isExpandedRef.current) {
      animateToState(false);
    }
  };

  // Full Interactive Swipe-Left & Drag Gesture Handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        progress.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const baseValue = isExpandedRef.current ? 1 : 0;
        const delta = -gestureState.dx / (width * 0.42);
        let newProgress = baseValue + delta;
        if (newProgress < 0) newProgress = 0;
        if (newProgress > 1) newProgress = 1;
        progress.setValue(newProgress);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
          animateToState(!isExpandedRef.current);
          return;
        }

        if (gestureState.dx < -30 || gestureState.vx < -0.3) {
          animateToState(true);
        } else if (gestureState.dx > 30 || gestureState.vx > 0.3) {
          animateToState(false);
        } else {
          // @ts-ignore
          const currentVal = progress._value || 0;
          animateToState(currentVal > 0.4);
        }
      },
      onPanResponderTerminate: () => {
        animateToState(isExpandedRef.current);
      },
    })
  ).current;

  // 3D Perspective Transformations
  const rotateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-18deg'],
  });

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.80],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width * 0.42],
  });

  const pillOpacity = progress.interpolate({
    inputRange: [0, 0.3],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      {/* Backdrop to close menu when tapping outside */}
      {isExpanded && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      {/* Main Interactive Stage */}
      <View style={styles.stage}>
        {/* LEFT SIDE: 3D Card */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateX },
                { perspective: 1000 },
                { rotateY },
                { scale },
              ],
            },
          ]}
        >
          <CardFront data={props} isExpanded={isExpanded} />
        </Animated.View>

        {/* RIGHT SIDE: 2-Column (6 Items) Action Menu */}
        <ActionMenu
          data={props}
          visible={isExpanded}
          onClose={closeMenu}
          onShowQR={props.onShowQR}
        />
      </View>

      {/* CRED-style Action Pill Button */}
      <Animated.View style={[styles.actionPillWrapper, { opacity: pillOpacity }]} pointerEvents={isExpanded ? 'none' : 'auto'}>
        <TouchableOpacity style={styles.actionPill} activeOpacity={0.8} onPress={toggleOpen}>
          <View style={styles.pillIconCircle}>
            <Ionicons name="sparkles-outline" size={13} color="#4B65E4" />
          </View>
          <Text style={styles.pillText}>Quick Actions</Text>
          <Ionicons name="chevron-forward" size={12} color="#64748B" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 40,
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
  actionPillWrapper: {
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
    zIndex: 5,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillIconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
