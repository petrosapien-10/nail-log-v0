'use client';

import React, { useState } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Menu,
  MenuItem,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslate } from '../../../locales/hooks/useTranslate';
import {
  useCreateDashboardPasswordMutation,
  useExtendDashboardSessionMutation,
} from '@/app/store/secureApiSlice';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import SnackbarMessage from '@/app/components/SnackBarMessage';
import dayjs from 'dayjs';

type PasswordMenuProps = {
  onRefetchExpiryInfo?: () => void;
};

export default function PasswordMenu({ onRefetchExpiryInfo }: PasswordMenuProps) {
  const { t } = useTranslate();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [extendModalOpen, setExtendModalOpen] = useState(false);

  const [createPassword, { isLoading }] = useCreateDashboardPasswordMutation();
  const [extendSession, { isLoading: isExtending }] = useExtendDashboardSessionMutation();

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenExtendModal = () => {
    setExtendModalOpen(true);
    handleMenuClose();
  };

  const handleOpenPasswordModal = () => {
    setPasswordModalOpen(true);
    handleMenuClose();
  };

  const handleClosePasswordModal = () => {
    if (!isLoading) {
      setPassword('');
      setPasswordModalOpen(false);
    }
  };
  const handleConfirmNewPassword = async () => {
    if (!password.trim()) return;

    try {
      const res = await createPassword({ password }).unwrap();

      if (res.success) {
        setSnackbarMessage(t('new_password_created_successfully'));
        setSnackbarSeverity('success');
        handleClosePasswordModal();
        onRefetchExpiryInfo?.();
      }
    } catch {
      setSnackbarMessage(t('failed_to_create_new_password_please_try_again'));
      setSnackbarSeverity('error');
    }
  };

  const handleExtendSession = async () => {
    try {
      const res = await extendSession().unwrap();

      if (res.success) {
        setSnackbarMessage(t('password_session_extended_successfully'));
        setSnackbarSeverity('success');
        onRefetchExpiryInfo?.();
      }
    } catch {
      setSnackbarMessage(t('failed_to_extend_password_session_please_try_again'));
      setSnackbarSeverity('error');
    }

    handleMenuClose();
  };

  return (
    <>
      {snackbarMessage && (
        <SnackbarMessage
          open={!!snackbarMessage}
          message={snackbarMessage}
          onClose={() => setSnackbarMessage(null)}
          severity={snackbarSeverity}
        />
      )}

      <Button
        variant="contained"
        size="xxxlarge"
        onClick={handleMenuClick}
        sx={{
          backgroundColor: theme.custom.colors.darkPink,
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          },
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          whiteSpace: 'nowrap',
        }}
      >
        <LockIcon fontSize="small" />
        {t('password')}
        <MoreHorizIcon fontSize="small" />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleOpenExtendModal} disabled={isExtending}>
          {t('renew')}
        </MenuItem>
        <MenuItem onClick={handleOpenPasswordModal}>{t('set_password')}</MenuItem>
      </Menu>

      <Dialog open={passwordModalOpen} onClose={handleClosePasswordModal}>
        <DialogTitle
          variant="h3"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {t('set_password')}
          <IconButton aria-label="Close" size="small" onClick={handleClosePasswordModal}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('password')}
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 4, px: 4 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleClosePasswordModal}
            disabled={isLoading}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.secondary.light,
              },
            }}
          >
            {t('cancel')}
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmNewPassword}
            disabled={isLoading || !password.trim()}
            sx={{
              backgroundColor: theme.custom.colors.pink,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            }}
          >
            {isLoading ? <CircularProgress size={18} color="inherit" /> : t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={extendModalOpen} onClose={() => setExtendModalOpen(false)}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h3" component="span">
            {t('renew_dashboard_password_access')}
          </Typography>
          <IconButton aria-label="Close" size="small" onClick={() => setExtendModalOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="h5">
            {t('password_will_expire_at')}{' '}
            <strong>{dayjs().add(7, 'day').format('DD MMM YYYY, HH:mm')}</strong>
          </Typography>

          <Typography
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            {' '}
            {t('renewing_will_make_it_valid_for_the_next_7_days_from_now')}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setExtendModalOpen(false)}
            disabled={isExtending}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.secondary.light,
              },
            }}
          >
            {t('cancel')}
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={async () => {
              await handleExtendSession();
              setExtendModalOpen(false);
            }}
            disabled={isExtending}
            sx={{
              backgroundColor: theme.custom.colors.pink,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            }}
          >
            {isExtending ? <CircularProgress size={18} color="inherit" /> : t('extend')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
