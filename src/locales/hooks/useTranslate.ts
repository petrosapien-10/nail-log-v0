'use client';

import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function useTranslate(ns?: string) {
  const { t, i18n } = useTranslation(ns);
  return { t, i18n };
}
