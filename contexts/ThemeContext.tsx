import React, { createContext, useState, useEffect } from 'react';
import { getAppConfig } from '../constants/config';
import {
  DEFAULT_THEME,
  type ThemeProviderProps,
  type ThemeContextValue,
} from '../types/theme';

export type { ThemeConfig } from '../types/theme';
export { DEFAULT_THEME } from '../types/theme';

export const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  loading: false,
  error: null,
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTheme = async () => {
      const { themeApiUrl } = getAppConfig();
      try {
        const response = await fetch(themeApiUrl);
        const data = await response.json();
        if (data.theme) {
          setTheme(data.theme);
        } else {
          setTheme(DEFAULT_THEME);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading theme:', err);
        setError('Error al cargar la configuración');
        setTheme(DEFAULT_THEME);
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
