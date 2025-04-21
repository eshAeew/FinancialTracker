import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enUS from './locales/en-US.json';
import enGB from './locales/en-GB.json';
import frFR from './locales/fr-FR.json';
import deDE from './locales/de-DE.json';
import esES from './locales/es-ES.json';
import itIT from './locales/it-IT.json';
import jaJP from './locales/ja-JP.json';
import zhCN from './locales/zh-CN.json';
import hiIN from './locales/hi-IN.json';

const resources = {
  'en-US': { translation: enUS },
  'en-GB': { translation: enGB },
  'fr-FR': { translation: frFR },
  'de-DE': { translation: deDE },
  'es-ES': { translation: esES },
  'it-IT': { translation: itIT },
  'ja-JP': { translation: jaJP },
  'zh-CN': { translation: zhCN },
  'hi-IN': { translation: hiIN },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;

// Function to change language programmatically
export const changeLanguage = (locale: string) => {
  return i18n.changeLanguage(locale);
};