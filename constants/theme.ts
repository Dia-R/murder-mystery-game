/**
 * A collection of colors and typography for a dark academic aesthetic.
 * Inspired by aged parchment, antique leather, and the somber tones 
 * of ancient libraries. Perfect for applications that revel in the 
 * pursuit of arcane knowledge and timeless elegance.
 */

import { Platform } from 'react-native';

// Primary accents reminiscent of oxidized brass, dark mahogany, and dried ink
const tintColorLight = '#8B7355'; // Aged brass
const tintColorDark = '#C9A66B';  // Weathered gold leaf

export const Colors = {
  light: {
    text: '#2C1810',           // Deep sepia, like antique ink
    background: '#F5EFE0',     // Faded parchment
    tint: tintColorLight,
    icon: '#5D4037',          // Burnt umber
    tabIconDefault: '#7D6E63', // Weathered stone
    tabIconSelected: tintColorLight,
    tertiary: '#D4B483',       // Antique leather highlight
    border: '#B8A38D',        // Aged paper edge
  },
  dark: {
    text: '#E8E0D8',          // Ivory manuscript text
    background: '#0C0A08',    // Near-black, like aged ebony
    tint: tintColorDark,
    icon: '#9C8C7C',          // Stone statue patina
    tabIconDefault: '#6B5D4E', // Old oak wood
    tabIconSelected: tintColorDark,
    tertiary: '#3A2C1F',      // Dark mahogany
    border: '#2A2118',        // Ancient leather binding
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Georgia',          // Classic serif for academic tone
    serif: 'Palatino',        // Traditional academic serif
    rounded: 'ui-serif',      // Keep some system fallbacks
    mono: 'Courier New',      // Typewriter aesthetic
  },
  default: {
    sans: 'serif',            // Default to serif where possible
    serif: 'serif',
    rounded: 'serif',
    mono: 'monospace',
  },
  web: {
    sans: "'Crimson Text', 'Times New Roman', Times, serif", // Scholarly serif stack
    serif: "'Garamond', 'Baskerville', 'Libre Baskerville', serif", // Classic academic fonts
    rounded: "'IM Fell English', 'Cardo', 'Cormorant Garamond', serif", // Old-style academic
    mono: "'Courier Prime', 'Source Code Pro', 'IBM Plex Mono', monospace", // Typewriter-inspired
  },
});