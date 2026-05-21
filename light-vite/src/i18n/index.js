import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';

const rtlLanguages = ['ar'];

function setDocumentDirection(locale) {
  const direction = rtlLanguages.includes(locale) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', direction);
  document.documentElement.setAttribute('lang', locale);
}

const savedLocale = localStorage.getItem('locale') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ar: { translation: ar },
  },
  lng: savedLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

setDocumentDirection(savedLocale);

export function changeLocale(locale) {
  i18n.changeLanguage(locale);
  localStorage.setItem('locale', locale);
  setDocumentDirection(locale);
}

export function getCurrentLocale() {
  return i18n.language || savedLocale;
}

export function isRTL(locale) {
  return rtlLanguages.includes(locale || getCurrentLocale());
}

export default i18n;
