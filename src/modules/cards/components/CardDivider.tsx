import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';

interface CardDividerProps {
  index: number;
  categoryName?: string;
  jobTitle?: string;
  companyName?: string;
}

const DIVIDER_THEMES = [
  {
    name: 'Work',
    icon: 'star' as const,
    color: '#6366F1',
    bgColor: '#EEF2FF',
    lineColor: '#C7D2FE',
    waveType: 'straight',
  },
  {
    name: 'Personal',
    icon: 'person' as const,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    lineColor: '#BFDBFE',
    waveType: 'sine',
  },
  {
    name: 'Creative',
    icon: 'leaf' as const,
    color: '#10B981',
    bgColor: '#ECFDF5',
    lineColor: '#A7F3D0',
    waveType: 'organic',
  },
  {
    name: 'Company',
    icon: 'business' as const,
    color: '#D97706',
    bgColor: '#FFFBEB',
    lineColor: '#FDE68A',
    waveType: 'step',
  },
];

// Dynamically resolves icon, theme color, and wave style based on card text keywords
const resolveDynamicTheme = (
  index: number,
  categoryName?: string,
  jobTitle?: string,
  companyName?: string
) => {
  const text = `${categoryName || ''} ${jobTitle || ''} ${companyName || ''}`.toLowerCase();

  if (/person|self|home|private|my|me\b/.test(text)) {
    return DIVIDER_THEMES[1]; // Personal Theme
  }
  if (/create|design|art|media|studio|ui|ux|free|brand|photo/.test(text)) {
    return DIVIDER_THEMES[2]; // Creative Theme
  }
  if (/comp|corp|inc|ltd|pvt|biz|bussiness|business|firm|enterprise/.test(text)) {
    return DIVIDER_THEMES[3]; // Company Theme
  }
  if (/work|job|dev|tech|code|eng|office|soft|backend|frontend/.test(text)) {
    return DIVIDER_THEMES[0]; // Work Theme
  }

  // Fallback to index-based cycling
  return DIVIDER_THEMES[index % DIVIDER_THEMES.length];
};

// Renders the decorative SVG line (wavy or straight)
const WaveLine: React.FC<{ lineColor: string; accentColor: string; waveType: string; isRight?: boolean }> = ({
  lineColor,
  accentColor,
  waveType,
  isRight = false,
}) => {
  if (waveType === 'sine') {
    return (
      <View style={styles.svgWrapper}>
        <Svg height="16" width="100%" viewBox="0 0 140 16" preserveAspectRatio="none">
          <Path
            d="M 0 8 Q 14 1, 28 8 T 56 8 T 84 8 T 112 8 T 140 8"
            fill="none"
            stroke={lineColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    );
  }

  if (waveType === 'organic') {
    return (
      <View style={styles.svgWrapper}>
        <Svg height="16" width="100%" viewBox="0 0 140 16" preserveAspectRatio="none">
          <Path
            d="M 0 8 Q 18 15, 36 8 T 72 8 T 108 8 T 140 8"
            fill="none"
            stroke={lineColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <Circle cx={isRight ? 30 : 110} cy="8" r="2.5" fill={accentColor} />
          <Circle cx={isRight ? 90 : 50} cy="8" r="1.8" fill={lineColor} />
        </Svg>
      </View>
    );
  }

  if (waveType === 'step') {
    return (
      <View style={styles.svgWrapper}>
        <Svg height="16" width="100%" viewBox="0 0 140 16" preserveAspectRatio="none">
          <Path
            d="M 0 8 C 15 2, 25 14, 40 8 C 55 2, 65 14, 80 8 C 95 2, 105 14, 120 8 L 140 8"
            fill="none"
            stroke={lineColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    );
  }

  // Default straight line
  return (
    <View style={styles.svgWrapper}>
      <Svg height="16" width="100%" viewBox="0 0 140 16" preserveAspectRatio="none">
        <Path d="M 0 8 L 140 8" fill="none" stroke={lineColor} strokeWidth="1.5" />
      </Svg>
    </View>
  );
};

export const CardDivider: React.FC<CardDividerProps> = ({
  index,
  categoryName,
  jobTitle,
  companyName,
}) => {
  const theme = resolveDynamicTheme(index, categoryName, jobTitle, companyName);
  const displayLabel = categoryName && categoryName.trim() !== '' ? categoryName : theme.name;

  return (
    <View style={styles.container}>
      {/* Left Decorative Line */}
      <WaveLine lineColor={theme.lineColor} accentColor={theme.color} waveType={theme.waveType} isRight={false} />

      {/* Center Group: Circle Icon Badge + Label Text */}
      <View style={styles.badgeGroup}>
        <View style={[styles.iconCircle, { backgroundColor: theme.bgColor, borderColor: theme.lineColor }]}>
          <Ionicons name={theme.icon} size={15} color={theme.color} />
        </View>
        <Text style={[styles.label, { color: theme.color }]}>{displayLabel}</Text>
      </View>

      {/* Right Decorative Line */}
      <WaveLine lineColor={theme.lineColor} accentColor={theme.color} waveType={theme.waveType} isRight={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 14,
  },
  svgWrapper: {
    flex: 1,
    height: 16,
    justifyContent: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginHorizontal: 10,
  },
  iconCircle: {
    width: 29,
    height: 29,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
