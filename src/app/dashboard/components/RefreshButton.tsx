'use client';

import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslate } from '../../../locales/hooks/useTranslate';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RefreshButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
}

export default function RefreshButton({ onClick, isLoading }: RefreshButtonProps) {
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
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
      onClick={onClick}
    >
      {isLoading ? (
        <CircularProgress size={20} color="secondary" />
      ) : (
        <>
          <RefreshIcon fontSize="small" />
          {t('dashboard.navbar.refresh_button')}
        </>
      )}
    </Button>
  );
}
