import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

import en from './langs/en/common.json';

import vi from './langs/vi/common.json';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  defaultNS: 'common',
  resources: {
    en: { common: en },
    vi: { common: vi },
  },
});
