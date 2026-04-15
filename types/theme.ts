import type { ReactNode } from 'react';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  wrongColor: string;
  textDark: string;
  textLight: string;
  logoSource: any;
  timerIconSource: any;
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#6D449B',
  secondaryColor: '#FFCC00',
  accentColor: '#4CAF50',
  successColor: '#4CAF50',
  wrongColor: '#F44336',
  textDark: '#1F2937',
  textLight: '#FFFFFF',
  logoSource: require('../assets/logo.png'),
  timerIconSource: require('../assets/timer.png'),
};

export interface ThemeContextValue {
  theme: ThemeConfig;
  loading: boolean;
  error: string | null;
}

export interface ThemeProviderProps {
  children: ReactNode;
}
