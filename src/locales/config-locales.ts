export const fallbackLng = 'en';

export const defaultNS = 'common';

// ----------------------------------------------------------------------

export function i18nOptions(lng?: string) {
  return {
    lng,
    fallbackLng,
    defaultNS,
    ns: [defaultNS],
    interpolation: {
      escapeValue: false,
    },
  };
}

export type LanguageValue = 'en' | 'vi';
