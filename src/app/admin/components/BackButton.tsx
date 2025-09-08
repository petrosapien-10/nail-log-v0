'use client';

import { Button, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useTheme } from '@mui/material/styles';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export default function BackButton({ onClick, label = 'Back' }: BackButtonProps) {
  const theme = useTheme();

  return (
    <Button
      onClick={onClick}
      disableRipple
      sx={{
        height: 56,
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightMedium,
        textTransform: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        boxShadow: 'none',
        outline: 'none',
        '&:focus': {
          outline: 'none',
          boxShadow: 'none',
        },
        '&:hover': {
          boxShadow: 'none',
        },
      }}
    >
      <ArrowBackIosNewIcon fontSize="small" />
      <Typography variant="h3" fontWeight={400}>
        {label}
      </Typography>
    </Button>
  );
}
