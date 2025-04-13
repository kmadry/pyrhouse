import { useCallback } from 'react';

export const TOKEN_KEY = 'token';
export const THEME_MODE_KEY = 'themeMode';

export const useStorage = () => {
  const getItem = useCallback((key: string) => {
    if (key === TOKEN_KEY) {
      return localStorage.getItem(key);
    }
    return sessionStorage.getItem(key);
  }, []);

  const setItem = useCallback((key: string, value: string) => {
    if (key === TOKEN_KEY) {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
  }, []);

  const removeItem = useCallback((key: string) => {
    if (key === TOKEN_KEY) {
      localStorage.removeItem(key);
    } else {
      sessionStorage.removeItem(key);
    }
  }, []);

  const getToken = useCallback(() => {
    return getItem(TOKEN_KEY);
  }, [getItem]);

  const setToken = useCallback((token: string) => {
    setItem(TOKEN_KEY, token);
  }, [setItem]);

  const removeToken = useCallback(() => {
    removeItem(TOKEN_KEY);
  }, [removeItem]);

  const getThemeMode = useCallback(() => {
    return getItem(THEME_MODE_KEY);
  }, [getItem]);

  const setThemeMode = useCallback((mode: string) => {
    setItem(THEME_MODE_KEY, mode);
  }, [setItem]);

  return {
    getItem,
    setItem,
    removeItem,
    getToken,
    setToken,
    removeToken,
    getThemeMode,
    setThemeMode,
  };
}; 