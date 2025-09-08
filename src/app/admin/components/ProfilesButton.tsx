'use client';

import React from 'react';
import { Button } from '@mui/material';
import { useTranslate } from '../../../locales/hooks/useTranslate';
import { useTheme } from '@mui/material/styles';

interface ProfilesButtonProps {
  onClick?: () => void;
}

export default function ProfilesButton({ onClick }: ProfilesButtonProps) {
  const { t } = useTranslate();
  const theme = useTheme();

  return (
    <Button
      variant="contained"
      size="xlarge"
      sx={{
        backgroundColor: theme.custom.colors.darkPink,
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.primary.light,
        },
      }}
      onClick={onClick}
    >
      {t('admin.profiles_button')}
    </Button>
  );
}
