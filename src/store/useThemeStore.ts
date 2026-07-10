import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { createExternalStore } from './createExternalStore';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = '@mos/theme_mode';

interface ThemeState {
  mode: ThemeMode;
}

function getSystemMode(): ThemeMode {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

const store = createExternalStore<ThemeState>({
  mode: getSystemMode(),
});

AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
  if (saved === 'light' || saved === 'dark') {
    store.setState({ mode: saved });
  }
});

export const themeStore = {
  getState: store.getState,
  setMode(mode: ThemeMode) {
    store.setState({ mode });
    AsyncStorage.setItem(STORAGE_KEY, mode);
  },
};

export function useThemeStore() {
  const state = store.useStore();
  return { ...state, setMode: themeStore.setMode };
}
