'use client';

import { Tabs, Tab, Box, Container } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/context/AuthContext';
import AdminLoginModal from '../admin/components/AdminLoginModal';
import { Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import SnackbarMessage from './SnackBarMessage';
import { useTranslate } from '@/locales/hooks/useTranslate';

const getBaseTabStyle = (theme: Theme) => ({
  textTransform: 'none',
  px: 3,
  pt: 1.4,
  pb: 1,
  fontWeight: 400,
  fontSize: '20px',
  borderTopLeftRadius: '20px',
  borderTopRightRadius: '20px',
  border: `1px solid ${theme.custom.colors.backgroundPink}`,
  borderBottom: 'none',
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.primary,
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: theme.spacing(16),
  minWidth: theme.spacing(12.5),
  height: theme.spacing(6.75),
  minHeight: theme.spacing(6.75),
  maxHeight: theme.spacing(6.75),
  transition: 'all 0.2s ease',
  '&.Mui-selected': {
    backgroundColor: theme.custom.colors.backgroundPink,
    color: theme.palette.text.primary,
  },
});

export default function TabsBar() {
  const theme = useTheme();
  const { t } = useTranslate();

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');

  const baseTabStyle = getBaseTabStyle(theme);

  const pathname = usePathname();
  const router = useRouter();
  const [redirectToAdmin, setRedirectToAdmin] = useState(false);

  const { isAuthenticated, isAdmin, loading } = useAuthContext();

  const tabValue = pathname.startsWith('/admin') ? 1 : 0;
  const [loginOpen, setLoginOpen] = useState(false);

  const isValidAdmin = redirectToAdmin && isAuthenticated && isAdmin;

  useEffect(() => {
    if (isValidAdmin && !loading) {
      router.push('/admin');
      setRedirectToAdmin(false);
    }
  }, [isValidAdmin, redirectToAdmin, isAuthenticated, isAdmin, loading, router]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      router.push('/dashboard');
    } else if (newValue === 1) {
      if (!loading && isAuthenticated && isAdmin) {
        router.push('/admin');
      } else {
        setLoginOpen(true);
      }
    }
  };

  const homeSelected = tabValue === 0;
  const adminSelected = tabValue === 1;

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        width: '100%',
        maxWidth: '980px',
        px: { xs: 2, sm: 4 },
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: '100%',
          pt: 4,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleChange}
          sx={{
            minHeight: 'unset',
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTabs-flexContainer': {
              justifyContent: 'flex-end',
              gap: 0,
            },
          }}
        >
          <Tab
            label="Home"
            sx={{
              ...baseTabStyle,
              zIndex: homeSelected ? 2 : 1,
              marginRight: homeSelected ? '-10px' : 0,
            }}
          />
          <Tab
            label="Admin"
            sx={{
              ...baseTabStyle,
              zIndex: adminSelected ? 2 : 1,
              marginLeft: adminSelected ? '-10px' : 0,
            }}
          />
        </Tabs>
      </Box>
      <AdminLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setLoginOpen(false);
          setRedirectToAdmin(true);

          setSnackMessage(t('sign_in.success_message'));
          setSnackSeverity('success');
          setSnackOpen(true);
        }}
        onError={() => {
          setSnackMessage(t('sign_in.fail_message'));
          setSnackSeverity('error');
          setSnackOpen(true);
        }}
      />

      <SnackbarMessage
        open={snackOpen}
        message={snackMessage}
        severity={snackSeverity}
        onClose={() => setSnackOpen(false)}
      />
    </Container>
  );
}
