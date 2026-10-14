import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { isRTL } from './catalogue';

import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import ur from './locales/ur.json';
import ar from './locales/ar.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  pa: { translation: pa },
  ur: { translation: ur },
  ar: { translation: ar },
  es: { translation: es },
};

const savedLang = localStorage.getItem('pizza_lang') || 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Update DOM direction for RTL languages
export const updateDocumentDirection = (langCode) => {
  const rtl = isRTL(langCode);
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  document.documentElement.lang = langCode;
};

// Initial run
updateDocumentDirection(savedLang);

i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
