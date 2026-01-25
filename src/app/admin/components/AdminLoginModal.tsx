'use client';

import {
  Dialog,
  Button,
  IconButton,
  DialogContent,
  Box,
  Typography,
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTheme } from '@mui/material/styles';
import { useTranslate } from '@/locales/hooks/useTranslate';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export default function AdminLoginModal({
  open,
  onClose,
  onSuccess,
  onError,
}: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const { t } = useTranslate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      onSuccess();
    } catch {
      setError(t('sign_in.error_message'));
      onError();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          p: 2,
          width: 416,
          backgroundColor: '#fff',
          position: 'relative',
        },
      }}
    >
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} position="relative" alignItems="center">
          <IconButton
            onClick={onClose}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              marginLeft: '280px',
              backgroundColor: theme.custom.colors.slateLight,
              '&:hover': {
                backgroundColor: theme.custom.colors.grey,
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <FormControl
            variant="outlined"
            sx={{
              width: '320px',
              height: '48px',
              '& .MuiOutlinedInput-root': {
                height: '100%',
              },
            }}
          >
            <InputLabel htmlFor="email">{t('sign_in.email')}</InputLabel>
            <OutlinedInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label={t('sign_in.email')}
              endAdornment={
                email && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setEmail('')} edge="end" aria-label="clear email">
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }
              sx={{
                fontSize: theme.typography.body1.fontSize,
                '& input': {
                  padding: '16.5px 14px',
                },
              }}
            />
          </FormControl>

          <FormControl
            variant="outlined"
            sx={{
              width: '320px',
              height: '48px',
              '& .MuiOutlinedInput-root': {
                height: '100%',
              },
            }}
          >
            <InputLabel htmlFor="password">{t('sign_in.password')}</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label={t('sign_in.password')}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              sx={{
                fontSize: theme.typography.body1.fontSize,
                '& input': {
                  padding: '14px 16px',
                },
              }}
            />
          </FormControl>

          {error && (
            <Typography color="error" variant="body1" mt={-2}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mt: -1 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleLogin}
          sx={{
            width: 92,
            height: 40,
            backgroundColor: theme.custom.colors.darkPink,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
            },
            mt: 2,
            mb: 2,
            fontSize: theme.typography.body1.fontSize,
          }}
        >
          {t('sign_in.sign_in_button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
