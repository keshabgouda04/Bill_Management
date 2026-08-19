import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { VisitingCardProps } from '../types/cardProps';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 48, 340);
const CARD_HEIGHT = CARD_WIDTH * 0.58; // Standard business card ratio (~3.5" x 2")

interface CardFrontProps {
  data: VisitingCardProps;
  isExpanded: boolean;
}

export const CardFront: React.FC<CardFrontProps> = ({ data, isExpanded }) => {
  const getTheme = () => {
    switch (data.templateId) {
      case 1:
        // Cyber Onyx: Dark Obsidian Navy & Soft Sky Glow (matching screenshot 100%)
        return {
          gradient: ['#0D1527', '#17243B', '#09101E'],
          borderColor: 'rgba(56, 189, 248, 0.25)',
          glowColor: 'rgba(13, 21, 39, 0.4)',
          textColor: '#FFFFFF',
          subTextColor: '#8A99AD',
          accentColor: '#38BDF8',
          chipColor: '#CBD5E1',
          btnBg: '#FFFFFF',
          btnText: '#0D1527',
        };
      case 2:
        // Royal Gold: Gold Foil & Velvet Glass
        return {
          gradient: ['#1E1629', '#2E1D38', '#140E1B'],
          borderColor: 'rgba(247, 208, 112, 0.4)',
          glowColor: 'rgba(247, 208, 112, 0.25)',
          textColor: '#FFFFFF',
          subTextColor: '#FDE68A',
          accentColor: '#F7D070',
          chipColor: '#F7D070',
          btnBg: '#FFFFFF',
          btnText: '#1E1629',
        };
      case 3:
        // Sapphire Exec: Royal Navy & Platinum Accent
        return {
          gradient: ['#0A192F', '#1E3A8A', '#091322'],
          borderColor: 'rgba(56, 189, 248, 0.4)',
          glowColor: 'rgba(56, 189, 248, 0.25)',
          textColor: '#FFFFFF',
          subTextColor: '#93C5FD',
          accentColor: '#38BDF8',
          chipColor: '#93C5FD',
          btnBg: '#FFFFFF',
          btnText: '#0A192F',
        };
      case 4:
        // Emerald Luxe: Emerald Green & Gold Frame
        return {
          gradient: ['#042F2E', '#064E3B', '#022120'],
          borderColor: 'rgba(52, 211, 153, 0.4)',
          glowColor: 'rgba(52, 211, 153, 0.25)',
          textColor: '#FFFFFF',
          subTextColor: '#A7F3D0',
          accentColor: '#34D399',
          chipColor: '#34D399',
          btnBg: '#FFFFFF',
          btnText: '#042F2E',
        };
      case 5:
      default:
        // Titanium Steel: Brushed Metal & Chrome
        return {
          gradient: ['#1F2937', '#374151', '#111827'],
          borderColor: 'rgba(156, 163, 175, 0.4)',
          glowColor: 'rgba(156, 163, 175, 0.25)',
          textColor: '#FFFFFF',
          subTextColor: '#E5E7EB',
          accentColor: '#9CA3AF',
          chipColor: '#E5E7EB',
          btnBg: '#FFFFFF',
          btnText: '#1F2937',
        };
    }
  };

  const theme = getTheme();

  return (
    <View style={[styles.cardBox, { borderColor: theme.borderColor, shadowColor: theme.glowColor }]}>
      <LinearGradient
        colors={theme.gradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Top Header Row: Company Logo & Brand Name */}
        <View style={styles.topRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="briefcase-outline" size={16} color={theme.accentColor} />
            <Text style={[styles.companyText, { color: theme.textColor }]}>
              {data.company || 'Vrrc'}
            </Text>
          </View>
        </View>

        {/* Middle Section: Metallic Chip Icon + Designation/Code Text */}
        <View style={styles.chipRow}>
          <View style={[styles.chipBox, { borderColor: theme.chipColor }]}>
            <Ionicons name="hardware-chip-outline" size={20} color={theme.chipColor} />
          </View>
          <Text style={[styles.cardNumberText, { color: theme.subTextColor }]}>
            {data.designation ? data.designation.toUpperCase() : 'G. F FCFFC'}
          </Text>
        </View>

        {/* Bottom Section: Name + Phone Number (Matching Screenshot) & Action Button */}
        <View style={styles.bottomRow}>
          <View style={styles.nameBlock}>
            <Text style={[styles.nameText, { color: theme.textColor }]} numberOfLines={1}>
              {data.name ? data.name.toUpperCase() : 'KESHAB GOUDA'}
            </Text>
            <Text style={[styles.phoneSubText, { color: theme.subTextColor }]} numberOfLines={1}>
              {data.phone || '7608826206'}
            </Text>
          </View>

          {/* CRED-style White Action Button */}
          <View style={[styles.actionBtn, { backgroundColor: theme.btnBg }]}>
            <Text style={[styles.actionBtnText, { color: theme.btnText }]}>
              {isExpanded ? 'Close' : 'View'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBox: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  chipBox: {
    width: 38,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardNumberText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  nameBlock: {
    flex: 1,
    marginRight: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  phoneSubText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
