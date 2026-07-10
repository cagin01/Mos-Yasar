import AsyncStorage from '@react-native-async-storage/async-storage';
import { createExternalStore } from './createExternalStore';

export type FontSizePreference = 'S' | 'M' | 'L';

const STORAGE_KEY = '@mos/font_size';

interface FontSizeState {
  preference: FontSizePreference;
}

const store = createExternalStore<FontSizeState>({ preference: 'M' });

AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
  if (saved === 'S' || saved === 'M' || saved === 'L') {
    store.setState({ preference: saved });
  }
});

export const fontSizeStore = {
  getState: store.getState,
  setPreference(preference: FontSizePreference) {
    store.setState({ preference });
    AsyncStorage.setItem(STORAGE_KEY, preference);
  },
};

export function useFontSizeStore() {
  const state = store.useStore();
  return { ...state, setPreference: fontSizeStore.setPreference };
}
