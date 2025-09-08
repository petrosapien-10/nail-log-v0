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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslate } from '../../../locales/hooks/useTranslate';
import {
  useCreateDashboardPasswordMutation,
  useExtendDashboardSessionMutation,
} from '@/app/store/secureApiSlice';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
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
        setSnackbarMessage(t('admin.snackbar.create_password_success'));
        setSnackbarSeverity('success');
        handleClosePasswordModal();
        onRefetchExpiryInfo?.();
      }
    } catch {
      setSnackbarMessage(t('admin.snackbar.create_password_error'));
      setSnackbarSeverity('error');
    }
  };

  const handleExtendSession = async () => {
    try {
      const res = await extendSession().unwrap();

      if (res.success) {
        setSnackbarMessage(t('admin.snackbar.extend_password_success'));
        setSnackbarSeverity('success');
        onRefetchExpiryInfo?.();
      }
    } catch {
      setSnackbarMessage(t('admin.snackbar.extend_password_error'));
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
        size="xlarge"
        onClick={handleMenuClick}
        sx={{
          backgroundColor: theme.custom.colors.darkPink,
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          },
          display: 'flex',
          alignItems: 'center',
          gap: 0.2,
        }}
      >
        {t('admin.password_button')}
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
          {t('admin.extend_password')}
        </MenuItem>
        <MenuItem onClick={handleOpenPasswordModal}>{t('admin.create_password')}</MenuItem>
      </Menu>

      <Dialog open={passwordModalOpen} onClose={handleClosePasswordModal}>
        <DialogTitle>
          <Typography variant="h3" sx={{ pt: 2 }}>
            {t('admin.create_password')}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('admin.password_label')}
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 4 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleClosePasswordModal}
            disabled={isLoading}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
            }}
          >
            {t('admin.cancel_button')}
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmNewPassword}
            disabled={isLoading || !password.trim()}
            sx={{
              backgroundColor: theme.custom.colors.pink,
              color: theme.palette.text.primary,
            }}
          >
            {isLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t('admin.save_password_button')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={extendModalOpen} onClose={() => setExtendModalOpen(false)}>
        <DialogTitle>
          <Typography variant="h3" component="span" sx={{ pt: 2 }}>
            {t('admin.extend_password')}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="h4" sx={{ marginTop: 2 }}>
            {t('admin.password_expiration_text')}{' '}
            <strong>
              <strong>{dayjs().add(7, 'day').format('DD MMM YYYY, HH:mm')}</strong>
            </strong>
          </Typography>

          <Typography
            sx={{
              color: theme.palette.text.secondary,
              marginTop: 1,
            }}
          >
            {' '}
            {t('admin.warning_text')}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 4 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setExtendModalOpen(false)}
            disabled={isExtending}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
            }}
          >
            {t('admin.cancel_button')}
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
            }}
          >
            {isExtending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t('admin.confirm_extend_password_button')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
