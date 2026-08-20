import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const SANDBOX_HEIGHT = 240;

interface OcrScannerOverlayProps {
  fileName: string;
  fileUri: string;
  fileType: string;
  progress?: number;
  statusText?: string;
  extractedDetails?: {
    merchant?: string;
    date?: string;
    total?: string;
    category?: string;
  };
  onComplete?: () => void;
}

// 5 Live Processing Steps
const PROCESS_STEPS = [
  { id: 1, text: 'Preparing bill', minSec: 0, doneSec: 4 },
  { id: 2, text: 'Reading text', minSec: 4, doneSec: 10 },
  { id: 3, text: 'Identifying important details', minSec: 10, doneSec: 18 },
  { id: 4, text: 'Validating information', minSec: 18, doneSec: 26 },
  { id: 5, text: 'Almost ready', minSec: 26, doneSec: 35 },
];

// Engagement Did You Know Tips
const ENGAGEMENT_TIPS = [
  'Wallely can automatically identify the merchant, date and total.',
  'Save time by letting Wallely organize your bills automatically.',
  'You can add reminders for warranties, subscriptions and payments.',
  'Your scanned bill can be organized into categories automatically.',
];

// Floating Detected Labels on Bill Preview
const DETECTED_BADGES = [
  { id: 'merchant', label: 'Merchant ✓', triggerSec: 3, position: { top: 16, left: 14 } },
  { id: 'date', label: 'Date ✓', triggerSec: 8, position: { top: 48, right: 14 } },
  { id: 'items', label: 'Items ✓', triggerSec: 15, position: { top: 110, right: 14 } },
  { id: 'total', label: 'Total ✓', triggerSec: 22, position: { bottom: 20, left: 14 } },
];

export default function OcrScannerOverlay({
  fileName,
  fileUri,
  fileType,
  progress = 0,
  statusText,
  extractedDetails,
  onComplete,
}: OcrScannerOverlayProps) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentTipIdx, setCurrentTipIdx] = useState(0);
  const [isCompletedState, setIsCompletedState] = useState(false);

  // Animations
  const scanAnim = useRef(new Animated.Value(0)).current;
  const aiPulseAnim = useRef(new Animated.Value(1)).current;
  const tipFadeAnim = useRef(new Animated.Value(1)).current;
  const activeDotPulse = useRef(new Animated.Value(1)).current;

  // Track elapsed real time every 500ms
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 0.5);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Handle completion state when progress reaches 100
  useEffect(() => {
    if (progress >= 100) {
      setIsCompletedState(true);
    }
  }, [progress]);

  // Laser Beam scanning animation loop
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scanAnim]);

  // AI Header Badge pulsing animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(aiPulseAnim, {
          toValue: 1.12,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(aiPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [aiPulseAnim]);

  // Active step dot pulsing animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(activeDotPulse, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(activeDotPulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [activeDotPulse]);

  // Rotating tips every 6 seconds with smooth fade
  useEffect(() => {
    const tipTimer = setInterval(() => {
      Animated.sequence([
        Animated.timing(tipFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(tipFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentTipIdx((prev) => (prev + 1) % ENGAGEMENT_TIPS.length);
    }, 6000);

    return () => clearInterval(tipTimer);
  }, [tipFadeAnim]);

  // Laser position interpolation
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SANDBOX_HEIGHT - 6],
  });

  // Dynamic Status Message based on elapsed time
  const getDynamicStatusMessage = () => {
    if (statusText && statusText.length > 0 && !statusText.includes('Scanning')) {
      return statusText;
    }
    if (elapsedSec < 4) return 'Preparing your bill…';
    if (elapsedSec < 10) return 'Reading information…';
    if (elapsedSec < 18) return 'Identifying important details…';
    if (elapsedSec < 26) return 'Finding merchant, date and total…';
    if (elapsedSec < 34) return 'Checking extracted information…';
    return 'Almost ready…';
  };

  // Render Completion State View
  if (isCompletedState) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.completionCard}>
          <View style={styles.completionHeaderIcon}>
            <Ionicons name="sparkles" size={32} color="#6366F1" />
          </View>

          <Text style={styles.completionTitle}>Your bill is ready ✨</Text>
          <Text style={styles.completionSubtitle}>
            Wallely has successfully scanned and organized your bill.
          </Text>

          {/* Extracted Details Summary Card */}
          <View style={styles.summaryCardGroup}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelRow}>
                <Ionicons name="storefront-outline" size={16} color="#64748B" />
                <Text style={styles.summaryLabel}>Merchant</Text>
              </View>
              <Text style={styles.summaryVal}>
                {extractedDetails?.merchant || 'Detected Merchant'}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelRow}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={styles.summaryLabel}>Date</Text>
              </View>
              <Text style={styles.summaryVal}>
                {extractedDetails?.date || 'Today'}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelRow}>
                <Ionicons name="cash-outline" size={16} color="#64748B" />
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <Text style={styles.summaryValHighlight}>
                {extractedDetails?.total ? `$${extractedDetails.total}` : 'Extracted'}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelRow}>
                <Ionicons name="pricetag-outline" size={16} color="#64748B" />
                <Text style={styles.summaryLabel}>Category</Text>
              </View>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>
                  {extractedDetails?.category || 'General'}
                </Text>
              </View>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.viewDetailsBtn}
            activeOpacity={0.85}
            onPress={onComplete}
          >
            <Text style={styles.viewDetailsBtnText}>View Bill Details</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HEADER SECTION */}
        <View style={styles.headerSection}>
          {/* <Animated.View style={[styles.aiIndicatorBadge, { transform: [{ scale: aiPulseAnim }] }]}>
            <Ionicons name="sparkles" size={14} color="#6366F1" />
            <Text style={styles.aiIndicatorText}>Wallely AI Scan</Text>
          </Animated.View> */}

          <Text style={styles.headerTitle}>Understanding your bill</Text>
          <Text style={styles.headerSubtitle}>
            Wallely is extracting and organizing the important details.
          </Text>
        </View>

        {/* 2. BILL PREVIEW SECTION (Center Stage) */}
        <View style={styles.previewCardStage}>
          <View style={styles.laserSandbox}>
            {fileType.includes('image') ? (
              <Image source={{ uri: fileUri }} style={styles.laserImg} resizeMode="contain" />
            ) : (
              <View style={styles.pdfMockPreview}>
                <Ionicons name="document-text" size={70} color="#E14B4B" />
                <Text style={styles.pdfMockText}>PDF DOCUMENT</Text>
              </View>
            )}

            {/* Floating Detected Badge Labels */}
            {DETECTED_BADGES.map((badge) => {
              const isDetected = elapsedSec >= badge.triggerSec;
              if (!isDetected) return null;

              return (
                <View key={badge.id} style={[styles.detectedBadge, badge.position as any]}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={styles.detectedBadgeText}>{badge.label}</Text>
                </View>
              );
            })}

            {/* Animated Laser Beam */}
            <Animated.View
              style={[
                styles.laserLineContainer,
                {
                  transform: [{ translateY }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(99, 102, 241, 0)',
                  'rgba(99, 102, 241, 0.9)',
                  '#818CF8',
                  'rgba(99, 102, 241, 0.9)',
                  'rgba(99, 102, 241, 0)',
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.laserBeam}
              />
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.22)', 'transparent']}
                style={styles.laserGlowTrail}
              />
            </Animated.View>
          </View>
        </View>

        {/* 3. DYNAMIC STATUS MESSAGE */}
        <View style={styles.statusBox}>
          <Text style={styles.statusMessageText}>{getDynamicStatusMessage()}</Text>
        </View>

        {/* 4. LIVE PROCESSING STEPS */}
        <View style={styles.stepsSequenceCard}>
          {PROCESS_STEPS.map((stepItem) => {
            const isDone = elapsedSec >= stepItem.doneSec;
            const isActive = elapsedSec >= stepItem.minSec && elapsedSec < stepItem.doneSec;

            return (
              <View key={stepItem.id} style={styles.stepRow}>
                {/* Left Step State Icon */}
                <View style={styles.stepIconCol}>
                  {isDone ? (
                    <View style={styles.stepIconDone}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  ) : isActive ? (
                    <Animated.View
                      style={[styles.stepIconActive, { transform: [{ scale: activeDotPulse }] }]}
                    />
                  ) : (
                    <View style={styles.stepIconUpcoming} />
                  )}
                </View>

                {/* Step Text Label */}
                <Text
                  style={[
                    styles.stepText,
                    isDone && styles.stepTextDone,
                    isActive && styles.stepTextActive,
                  ]}
                >
                  {stepItem.text}
                </Text>
              </View>
            );
          })}
        </View>

        {/* 5. ENGAGEMENT CARD (Wallely Tip Carousel) */}
        <View style={styles.engagementCard}>
          <View style={styles.tipHeaderRow}>
            <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
            <Text style={styles.tipHeaderTitle}>Wallely Tip</Text>
          </View>
          <Animated.Text style={[styles.tipBodyText, { opacity: tipFadeAnim }]}>
            “{ENGAGEMENT_TIPS[currentTipIdx]}”
          </Animated.Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    alignItems: 'center',
  },

  /* 1. Header Section */
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  aiIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 10,
  },
  aiIndicatorText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 18,
  },

  /* 2. Bill Preview Stage */
  previewCardStage: {
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  laserSandbox: {
    width: width * 0.76,
    height: SANDBOX_HEIGHT,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  laserImg: {
    width: '100%',
    height: '100%',
  },
  pdfMockPreview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfMockText: {
    color: '#E14B4B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 1,
  },

  /* Floating Detected Badge Labels */
  detectedBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    zIndex: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  detectedBadgeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Laser Beam Styles */
  laserLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 24,
    zIndex: 10,
  },
  laserBeam: {
    height: 2.5,
    width: '100%',
  },
  laserGlowTrail: {
    height: 20,
    width: '100%',
  },

  /* 3. Status Message Box */
  statusBox: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusMessageText: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* 4. Live Processing Steps */
  stepsSequenceCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIconCol: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
  },
  stepIconUpcoming: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  stepText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  stepTextDone: {
    color: '#94A3B8',
  },
  stepTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },

  /* 5. Engagement Card */
  engagementCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tipHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.3,
  },
  tipBodyText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },

  /* 6. Completion State Styles */
  completionCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completionHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
  },
  completionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  summaryCardGroup: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 28,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  summaryValHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34D399',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 6,
  },
  categoryPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  viewDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
