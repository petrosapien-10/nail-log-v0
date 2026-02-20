'use client';

import { I18nProvider } from 'src/locales/I18nProvider';

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
