'use client';

import { useEffect } from 'react';

import i18next from 'i18next';

import { I18nextProvider as Provider } from 'react-i18next';

import type { LanguageValue } from './config-locales';

import 'src/locales/i18n';

type Props = {
  lang?: LanguageValue;
  children: React.ReactNode;
};

export function I18nProvider({ lang, children }: Props) {
  useEffect(() => {
    if (lang) {
      i18next.changeLanguage(lang);
    }
  }, [lang]);

  return <Provider i18n={i18next}>{children}</Provider>;
}
