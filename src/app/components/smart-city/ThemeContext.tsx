import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    // Backgrounds
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    bgOverlay: string;
    bgCard: string;
    bgCardHover: string;
    bgInput: string;
    bgButton: string;
    bgButtonHover: string;
    
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    
    // Borders
    borderPrimary: string;
    borderSecondary: string;
    borderAccent: string;
    
    // Accents (always DGE brand colors)
    accentPrimary: string;
    accentLight: string;
    accentDark: string;
    accentGrey: string;
    
    // Status
    statusSuccess: string;
    statusInfo: string;
    statusWarning: string;
    
    // Shadows
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// DGE Official Brand Colors from Brand Guidelines
const DGE_COLORS = {
  techBlue: '#215A9E',      // RGB(33, 90, 158) - Primary brand color
  lightBlue: '#7AA4C4',     // RGB(122, 164, 196) - Secondary brand color
  reliableBlue: '#063360',  // RGB(6, 51, 96) - Dark brand color
  grey: '#585860',          // RGB(88, 88, 96) - Neutral grey (adjusted from guidelines)
  white: '#FFFFFF',         // RGB(255, 255, 255)
  black: '#000000',         // RGB(0, 0, 0)
};

const lightTheme = {
  // Backgrounds - Light theme: white and very light greys
  bgPrimary: DGE_COLORS.white,
  bgSecondary: '#F8FAFC',        // Very light blue-grey
  bgTertiary: '#F1F5F9',         // Light blue-grey
  bgOverlay: 'rgba(255, 255, 255, 0.98)',
  bgCard: DGE_COLORS.white,
  bgCardHover: '#F8FAFC',
  bgInput: DGE_COLORS.white,
  bgButton: DGE_COLORS.techBlue,
  bgButtonHover: DGE_COLORS.reliableBlue,
  
  // Text - Dark text on light backgrounds
  textPrimary: DGE_COLORS.reliableBlue,    // Dark blue for primary text
  textSecondary: DGE_COLORS.grey,          // Grey for secondary text
  textMuted: '#94A3B8',                    // Lighter grey for muted text
  textInverse: DGE_COLORS.white,           // White text for buttons/dark surfaces
  
  // Borders - Subtle borders for light theme
  borderPrimary: '#E2E8F0',                // Very light grey border
  borderSecondary: '#CBD5E1',              // Light grey border
  borderAccent: DGE_COLORS.lightBlue,      // Light blue for accent borders
  
  // Accents - DGE brand colors (consistent across themes)
  accentPrimary: DGE_COLORS.techBlue,
  accentLight: DGE_COLORS.lightBlue,
  accentDark: DGE_COLORS.reliableBlue,
  accentGrey: DGE_COLORS.grey,
  
  // Status colors
  statusSuccess: '#10B981',
  statusInfo: DGE_COLORS.techBlue,
  statusWarning: '#F59E0B',
  
  // Shadows - Subtle shadows for light theme
  shadowSm: '0 1px 2px 0 rgba(6, 51, 96, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(6, 51, 96, 0.1), 0 2px 4px -1px rgba(6, 51, 96, 0.06)',
  shadowLg: '0 10px 15px -3px rgba(6, 51, 96, 0.1), 0 4px 6px -2px rgba(6, 51, 96, 0.05)',
};

const darkTheme = {
  // Backgrounds - Dark theme: deep blues based on reliable blue
  bgPrimary: '#0A1929',                    // Very dark blue-grey (based on reliable blue)
  bgSecondary: '#132F4C',                  // Dark blue-grey
  bgTertiary: '#1E4976',                   // Medium dark blue
  bgOverlay: 'rgba(6, 51, 96, 0.95)',      // Reliable blue with transparency
  bgCard: 'rgba(6, 51, 96, 0.6)',          // Reliable blue semi-transparent
  bgCardHover: 'rgba(30, 73, 118, 0.7)',   // Lighter blue on hover
  bgInput: 'rgba(6, 51, 96, 0.5)',         // Reliable blue for inputs
  bgButton: DGE_COLORS.techBlue,
  bgButtonHover: DGE_COLORS.lightBlue,
  
  // Text - Light text on dark backgrounds
  textPrimary: DGE_COLORS.white,                  // White for primary text
  textSecondary: 'rgba(255, 255, 255, 0.8)',      // Semi-transparent white
  textMuted: 'rgba(255, 255, 255, 0.5)',          // More transparent for muted
  textInverse: DGE_COLORS.reliableBlue,           // Dark blue for light surfaces
  
  // Borders - Subtle borders for dark theme
  borderPrimary: 'rgba(122, 164, 196, 0.2)',      // Light blue with low opacity
  borderSecondary: 'rgba(122, 164, 196, 0.3)',    // Light blue with slightly more opacity
  borderAccent: DGE_COLORS.lightBlue,             // Full light blue for accents
  
  // Accents - DGE brand colors (consistent across themes)
  accentPrimary: DGE_COLORS.techBlue,
  accentLight: DGE_COLORS.lightBlue,
  accentDark: DGE_COLORS.reliableBlue,
  accentGrey: DGE_COLORS.grey,
  
  // Status colors
  statusSuccess: '#10B981',
  statusInfo: DGE_COLORS.lightBlue,
  statusWarning: '#F59E0B',
  
  // Shadows - Stronger shadows for dark theme
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('dge-theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('dge-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
