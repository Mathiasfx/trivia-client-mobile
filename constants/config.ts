import Constants from 'expo-constants';

type AppExtra = {
  socketUrl?: string;
  themeApiUrl?: string;
  apiTimeout?: number;
  maxReconnectionAttempts?: number;
};

const DEFAULT_SOCKET_URL = 'https://nest-trivia-api.onrender.com/rooms';
const DEFAULT_THEME_API_URL = 'https://nest-trivia-api.onrender.com/api/config';
const DEFAULT_API_TIMEOUT = 15000;
const DEFAULT_MAX_RECONNECTION_ATTEMPTS = 10;

function readExtra(): AppExtra {
  return (Constants.expoConfig?.extra ?? {}) as AppExtra;
}

export function getAppConfig() {
  const extra = readExtra();
  return {
    socketUrl: extra.socketUrl ?? DEFAULT_SOCKET_URL,
    themeApiUrl: extra.themeApiUrl ?? DEFAULT_THEME_API_URL,
    apiTimeout: extra.apiTimeout ?? DEFAULT_API_TIMEOUT,
    maxReconnectionAttempts:
      extra.maxReconnectionAttempts ?? DEFAULT_MAX_RECONNECTION_ATTEMPTS,
  };
}
