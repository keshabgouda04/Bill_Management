import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { VisitingCardProps } from '../types/cardProps';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 48, 340);
const CARD_HEIGHT = CARD_WIDTH * 0.58; // Standard business card ratio (~3.5" x 2")

interface CardBackProps {
  data: VisitingCardProps;
  onShowQR?: () => void;
}

export const CardBack: React.FC<CardBackProps> = ({ data, onShowQR }) => {
  const [socialExpanded, setSocialExpanded] = React.useState(false);

  const getTheme = () => {
    switch (data.templateId) {
      case 1:
        // Cyber Onyx
        return {
          gradient: ['#0D1527', '#17243B', '#09101E'],
          borderColor: 'rgba(56, 189, 248, 0.35)',
          glowColor: 'rgba(13, 21, 39, 0.4)',
          textColor: '#FFFFFF',
          subTextColor: '#8A99AD',
          accentColor: '#38BDF8',
          chipColor: '#CBD5E1',
          glassBg: 'rgba(13, 21, 39, 0.5)',
          glassBorder: 'rgba(56, 189, 248, 0.2)',
        };
      case 2:
        // Royal Gold
        return {
          gradient: ['#1E1629', '#2E1D38', '#140E1B'],
          borderColor: 'rgba(247, 208, 112, 0.45)',
          glowColor: 'rgba(247, 208, 112, 0.25)',
          textColor: '#FFFFFF',
          subTextColor: '#FDE68A',
          accentColor: '#F7D070',
          chipColor: '#F7D070',
          glassBg: 'rgba(30, 22, 41, 0.5)',
          glassBorder: 'rgba(247, 208, 112, 0.25)',
        };
      case 3:
        // Sapphire Exec
        return {
          gradient: ['#0A192F', '#1E3A8A', '#091322'],
          borderColor: 'rgba(56, 189, 248, 0.45)',
          glowColor: 'rgba(56, 189, 248, 0.25)',
          textColor: '#FFFFFF',
          subTextColor: '#93C5FD',
          accentColor: '#38BDF8',
          chipColor: '#93C5FD',
          glassBg: 'rgba(10, 25, 47, 0.5)',
          glassBorder: 'rgba(56, 189, 248, 0.25)',
        };
      case 4:
        // Emerald Luxe
        return {
          gradient: ['#042F2E', '#064E3B', '#022120'],
          borderColor: 'rgba(52, 211, 153, 0.45)',
          glowColor: 'rgba(52, 211, 153, 0.25)',
          textColor: '#FFFFFF',
          subTextColor: '#A7F3D0',
          accentColor: '#34D399',
          chipColor: '#34D399',
          glassBg: 'rgba(4, 47, 46, 0.5)',
          glassBorder: 'rgba(52, 211, 153, 0.25)',
        };
      case 5:
      default:
        // Titanium Steel
        return {
          gradient: ['#1F2937', '#374151', '#111827'],
          borderColor: 'rgba(156, 163, 175, 0.45)',
          glowColor: 'rgba(156, 163, 175, 0.25)',
          textColor: '#FFFFFF',
          subTextColor: '#E5E7EB',
          accentColor: '#9CA3AF',
          chipColor: '#E5E7EB',
          glassBg: 'rgba(31, 41, 55, 0.5)',
          glassBorder: 'rgba(156, 163, 175, 0.25)',
        };
    }
  };

  const theme = getTheme();

  const openUrl = (url?: string) => {
    if (!url) return;
    const formatted = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    Linking.openURL(formatted).catch(() => Alert.alert('Error', `Cannot open link: ${url}`));
  };

  const parseSocialLinks = (raw: any): Record<string, string> => {
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return raw;
  };

  const links = parseSocialLinks(data.socialLinks);

  const socialItems = [
    { key: 'linkedin', name: 'LinkedIn', icon: 'logo-linkedin', url: links?.linkedin, color: '#0A66C2' },
    { key: 'twitter', name: 'Twitter', icon: 'logo-twitter', url: links?.twitter, color: '#1DA1F2' },
    { key: 'github', name: 'GitHub', icon: 'logo-github', url: links?.github, color: '#FFFFFF' },
    { key: 'instagram', name: 'Instagram', icon: 'logo-instagram', url: links?.instagram, color: '#E1306C' },
    { key: 'facebook', name: 'Facebook', icon: 'logo-facebook', url: links?.facebook, color: '#1877F2' },
    { key: 'website', name: 'Web', icon: 'globe-outline', url: data.website || links?.website, color: theme.accentColor },
  ].filter((s) => Boolean(s.url && typeof s.url === 'string' && s.url.trim() !== ''));

  const visibleSocials = socialExpanded ? socialItems : socialItems.slice(0, 3);
  const hasMoreSocials = socialItems.length > 3;

  return (
    <View style={[styles.cardBox, { borderColor: theme.borderColor, shadowColor: theme.glowColor }]}>
      <LinearGradient
        colors={theme.gradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Top Header Row: Company Logo Badge & Metallic Chip Icon */}
        <View style={styles.topRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="briefcase-outline" size={14} color={theme.accentColor} />
            <Text style={[styles.companyBadgeText, { color: theme.textColor }]}>
              {data.company || 'BUSINESS'}
            </Text>
          </View>

          <View style={[styles.chipBox, { borderColor: theme.chipColor }]}>
            <Ionicons name="hardware-chip-outline" size={16} color={theme.chipColor} />
          </View>
        </View>

        {/* Middle Section: Redesigned Frosted Glass Information Panel */}
        <View style={[styles.frostedGlassPanel, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder }]}>
          {/* Cardholder Details */}
          <View style={styles.headerInfo}>
            <Text style={[styles.nameText, { color: theme.textColor }]} numberOfLines={1}>
              {data.name ? data.name.toUpperCase() : 'KESHAB GOUDA'}
            </Text>
            <Text style={[styles.designationText, { color: theme.subTextColor }]} numberOfLines={1}>
              {data.designation ? data.designation.toUpperCase() : 'PROFESSIONAL'}
            </Text>
          </View>

          {/* Social Links Row: First 3 Logos + Right Arrow to Expand All */}
          {socialItems.length > 0 && (
            <View style={styles.socialRow}>
              {visibleSocials.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.rawSocialIconBtn}
                  activeOpacity={0.6}
                  onPress={(e) => {
                    e.stopPropagation();
                    openUrl(item.url);
                  }}
                >
                  <Ionicons name={item.icon as any} size={11} color={item.color} />
                </TouchableOpacity>
              ))}

              {hasMoreSocials && (
                <TouchableOpacity
                  style={styles.expandArrowBtn}
                  activeOpacity={0.7}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSocialExpanded(!socialExpanded);
                  }}
                >
                  <Ionicons
                    name={socialExpanded ? 'chevron-back' : 'chevron-forward'}
                    size={12}
                    color={theme.accentColor}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Executive Icon-Only Action Buttons Toolbar */}
        <View style={styles.actionBar}>
          {onShowQR && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                onShowQR();
              }}
              style={[
                styles.actionIconBtn,
                {
                  backgroundColor: theme.glassBg,
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Ionicons name="qr-code-outline" size={15} color={theme.accentColor} />
            </TouchableOpacity>
          )}

          {data.onEdit && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                data.onEdit?.();
              }}
              style={[
                styles.actionIconBtn,
                {
                  backgroundColor: theme.glassBg,
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Ionicons name="pencil-outline" size={15} color={theme.accentColor} />
            </TouchableOpacity>
          )}

          {data.onDelete && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                data.onDelete?.();
              }}
              style={[
                styles.actionIconBtn,
                {
                  backgroundColor: theme.glassBg,
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Ionicons name="trash-outline" size={15} color={theme.accentColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Rotation Hint */}
        <View style={styles.bottomFlipHint}>
          <Ionicons name="sync-outline" size={10} color={theme.accentColor} />
          <Text style={[styles.flipHintText, { color: theme.subTextColor }]}>TAP CARD TO ROTATE FRONT ↺</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chipBox: {
    width: 32,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  frostedGlassPanel: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'space-around',
  },
  headerInfo: {
    marginBottom: 6,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  designationText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  rawSocialIconBtn: {
    padding: 2,
  },
  expandArrowBtn: {
    padding: 2,
    marginLeft: 2,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 4,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomFlipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 1,
  },
  flipHintText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
