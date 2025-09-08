'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/app/hooks/context/AuthContext';
import ConfirmModal from '@/app/components/ConfirmModal';

export default function AdminSignOutButton() {
  const { t } = useTranslate();
  const theme = useTheme();
  const router = useRouter();
  const { clearAuth } = useAuthContext();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut(auth);
      clearAuth();
      router.push('/dashboard?logout=success');
    } catch {
      router.push('/dashboard?logout=error');
    } finally {
      setIsSigningOut(false);
      setOpenConfirm(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        size="xlarge"
        onClick={() => setOpenConfirm(true)}
        disabled={isSigningOut}
        sx={{
          backgroundColor: theme.custom.colors.darkPink,
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          },
        }}
      >
        {t('admin.sign_out_button')}
      </Button>

      <ConfirmModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleSignOut}
        description={t('sign_out.confirm_message')}
        confirmText={t('sign_out.confirm_button')}
        cancelText={t('sign_out.cancel_button')}
        isLoading={isSigningOut}
      />
    </>
  );
}
