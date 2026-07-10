import AsyncStorage from '@react-native-async-storage/async-storage';
import { createExternalStore } from './createExternalStore';

export type Language = 'tr' | 'en';

const STORAGE_KEY = '@mos/language';

interface LanguageState {
  language: Language;
}

const store = createExternalStore<LanguageState>({ language: 'tr' });

AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
  if (saved === 'tr' || saved === 'en') {
    store.setState({ language: saved });
  }
});

export const languageStore = {
  getState: store.getState,
  setLanguage(language: Language) {
    store.setState({ language });
    AsyncStorage.setItem(STORAGE_KEY, language);
  },
};

export function useLanguageStore() {
  const state = store.useStore();
  return { ...state, setLanguage: languageStore.setLanguage };
}
