import React, { createContext, useState, useEffect, ReactNode } from 'react';

const THEME_API_URL = 'https://nest-trivia-api.onrender.com/api/config'; 

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

interface ThemeContextType {
  theme: ThemeConfig;
  loading: boolean;
  error: string | null;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  loading: false,
  error: null,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Cargar tema desde el backend usando THEME_API_URL de .env
        const response = await fetch(`${THEME_API_URL}`);
        const data = await response.json();
        if (data.theme) {
          setTheme(data.theme);
        } else {
          setTheme(DEFAULT_THEME); // Usa default si data.theme es null
        }
        setError(null);
      } catch (err) {
        console.error('Error loading theme:', err);
        setError('Error al cargar la configuración');
        setTheme(DEFAULT_THEME); // Fallback a valores por defecto
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading, error }}>
      {children}
    </ThemeContext.Provider>
  );
};
