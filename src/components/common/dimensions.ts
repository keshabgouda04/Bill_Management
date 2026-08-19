import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Common Screen Dimensions & Responsive Layout Utilities
 */
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const DIMENSIONS = {
  width,
  height,
  isSmallDevice: width < 375,
  paddingHorizontal: width * 0.04,
  paddingBottom: height * 0.12,
  bottomTabPadding: height * 0.12,
};

/**
 * Returns dynamic pixel height based on screen percentage (e.g. hp(12) = 12% of screen height).
 */
export function hp(percentage: number): number {
  return height * (percentage / 100);
}

/**
 * Returns dynamic pixel width based on screen percentage (e.g. wp(4) = 4% of screen width).
 */
export function wp(percentage: number): number {
  return width * (percentage / 100);
}
