'use client';

import React from 'react';
import { Button } from '@mui/material';

import { useTranslate } from '../../../locales/hooks/useTranslate';

import { useTheme } from '@mui/material/styles';

interface CheckInButtonProps {
  onClick?: () => void;
  isReadOnly: boolean;
}

export default function CheckInButton({ onClick, isReadOnly }: CheckInButtonProps) {
  const { t } = useTranslate();

  const theme = useTheme();

  return (
    <Button
      disabled={isReadOnly}
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
      {t('dashboard.navbar.check_in_button')}
    </Button>
  );
}
