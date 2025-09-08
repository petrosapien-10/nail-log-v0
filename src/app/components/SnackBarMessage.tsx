'use client';

import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const AUTO_HIDE_DURATION: number = 3000;
interface SnackbarMessageProps {
  open: boolean;
  message: string | null;
  onClose: () => void;
  severity?: 'success' | 'error' | 'info' | 'warning';
  autoHideDuration?: number;
}

export default function SnackbarMessage({
  open,
  message,
  onClose,
  severity,
}: SnackbarMessageProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={AUTO_HIDE_DURATION}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
