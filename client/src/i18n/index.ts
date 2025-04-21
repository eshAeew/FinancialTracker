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
    debug: true, // Enable debug mode to help troubleshoot
  });

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  console.log(`Language changed to: ${lng}`);
  document.documentElement.lang = lng;
  // Also store in localStorage for persistence
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;

// Function to change language programmatically
export const changeLanguage = (locale: string) => {
  console.log(`Changing language to: ${locale}`);
  
  // Force reload translations if needed
  if (!i18n.hasResourceBundle(locale, 'translation')) {
    console.log(`Loading missing translation bundle for: ${locale}`);
    
    // If the specific locale doesn't have translations, try loading just the language part
    const languagePart = locale.split('-')[0];
    const availableLocales = Object.keys(resources);
    const matchingLocale = availableLocales.find(l => l.startsWith(languagePart));
    
    if (matchingLocale) {
      console.log(`Using fallback locale: ${matchingLocale}`);
      return i18n.changeLanguage(matchingLocale);
    }
  }
  
  return i18n.changeLanguage(locale);
};