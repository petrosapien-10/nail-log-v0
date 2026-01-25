'use client';

import React from 'react';
import { Button } from '@mui/material';
import { useTranslate } from '../../../locales/hooks/useTranslate';
import { useTheme } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';

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
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
      onClick={onClick}
    >
      <PeopleIcon fontSize="small" />
      {t('admin.profiles_button')}
    </Button>
  );
}
