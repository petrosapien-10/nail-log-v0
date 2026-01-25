'use client';

import { Button } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useTheme } from '@mui/material/styles';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  const theme = useTheme();

  return (
    <Button
      onClick={onClick}
      variant="contained"
      size="xsmall"
      sx={{
        minWidth: 'auto',
        backgroundColor: theme.custom.colors.slateLight,
        color: theme.custom.colors.slateDeep,
        border: `1px solid ${theme.custom.colors.darkGrey}`,
        fontWeight: 500,
        '&:hover': {
          backgroundColor: theme.custom.colors.grey,
          borderColor: theme.custom.colors.slate,
        },
      }}
    >
      <ArrowBackIosNewIcon fontSize="small" />
    </Button>
  );
}
