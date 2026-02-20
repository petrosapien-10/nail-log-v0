'use client';

import { useTranslation } from 'react-i18next';

import { Button, Stack } from '@mui/material';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleSwitch = (lang: 'en' | 'vi') => {
    i18n.changeLanguage(lang);
  };

  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" onClick={() => handleSwitch('en')}>
        English
      </Button>
      <Button variant="contained" onClick={() => handleSwitch('vi')}>
        Vietnamese
      </Button>
    </Stack>
  );
}
