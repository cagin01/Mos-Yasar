import { useLanguageStore } from '@/src/store/useLanguageStore';
import { tr } from './tr';
import { en } from './en';

const translations = { tr, en };

export function useTranslation() {
  const { language, setLanguage } = useLanguageStore();
  return { t: translations[language], language, setLanguage };
}
