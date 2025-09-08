'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TextField, Button, Typography, CircularProgress, Box, Paper } from '@mui/material';
import {
  useValidateDashboardPasswordMutation,
  useGetDashboardSessionQuery,
} from '@/app/store/publicApiSlice';

import { useNavbarContext } from '@/app/hooks/context/navbar-context';
import status from 'http-status';
import { useTheme } from '@mui/material/styles';
import { useTranslate } from '@/locales/hooks/useTranslate';

const DASHBOARD_LOG_IN_SESSION_CHECKING_TIME = 60 * 60 * 1000; //1 hour

const clearDashboardAccess = () => {
  localStorage.removeItem('dashboardAccessSession');
};

interface DashboardAccessContextProps {
  hasDashboardAccess: boolean;
  refetchDashboardLoginSession: () => void;
}

const DashboardAccessContext = createContext<DashboardAccessContextProps>({
  hasDashboardAccess: false,
  refetchDashboardLoginSession: () => {},
});

export const useDashboardAccess = () => useContext(DashboardAccessContext);

export const DashboardAccessProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const { t } = useTranslate();

  const [password, setPassword] = useState('');
  const [hasDashboardAccess, setHasDashboardAccess] = useState(false);
  const [error, setError] = useState('');
  const [validatePassword, { isLoading }] = useValidateDashboardPasswordMutation();

  const [isManualLogin, setIsManualLogin] = useState(false);

  const { setRefetchMap } = useNavbarContext();

  const sessionRaw =
    typeof window !== 'undefined' ? localStorage.getItem('dashboardAccessSession') : null;

  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  const {
    data: sessionData,
    isSuccess,
    refetch: refetchDashboardLoginSession,
    isFetching: isFetchingDashboardSession,
  } = useGetDashboardSessionQuery(undefined, {
    skip: !session,
    pollingInterval: DASHBOARD_LOG_IN_SESSION_CHECKING_TIME,
  });

  useEffect(() => {
    setRefetchMap((prev) => ({
      ...prev,
      dashboardSession: {
        ...prev.dashboardLoginSession,
        isFetching: isFetchingDashboardSession,
        fetcher: refetchDashboardLoginSession,
      },
    }));
  }, [isFetchingDashboardSession, refetchDashboardLoginSession, setRefetchMap]);

  useEffect(() => {
    if (isManualLogin || !session || !isSuccess || !sessionData?.success) return;

    const { version: storedVersion } = session;
    const { version: serverVersion, expiresAt } = sessionData;

    const now = Date.now();
    const isVersionMismatch = storedVersion !== serverVersion;
    const isExpired = now > expiresAt;

    if (isVersionMismatch || isExpired) {
      clearDashboardAccess();
      setHasDashboardAccess(false);
      setPassword('');
      return;
    }

    setHasDashboardAccess(true);

    const timeLeft = expiresAt - now;
    const timeoutId = setTimeout(() => {
      clearDashboardAccess();
      setHasDashboardAccess(false);
      setPassword('');
    }, timeLeft);

    return () => clearTimeout(timeoutId);
  }, [session, sessionData, isSuccess, isManualLogin]);

  const handleLogin = async () => {
    if (!password.trim()) return;

    setIsManualLogin(true);
    setError('');

    try {
      const response = await validatePassword({ password }).unwrap();

      if (response.success) {
        localStorage.setItem(
          'dashboardAccessSession',
          JSON.stringify({
            version: response.version,
            grantedAt: Date.now(),
          })
        );

        await refetchDashboardLoginSession();

        setHasDashboardAccess(true);
        setPassword('');
      }
    } catch (error) {
      switch (true) {
        case error?.status === status.UNAUTHORIZED:
          setError(t('dashboard.login.error.unauthorized'));
          clearDashboardAccess();
          setHasDashboardAccess(false);
          break;

        case error?.status === status.BAD_REQUEST:
          setError(t('dashboard.login.error.bad_request'));
          break;

        case error?.status === status.NOT_FOUND:
          setError(t('dashboard.login.error.not_found'));
          break;

        default:
          setError(t('dashboard.login.error.default'));
          break;
      }
    } finally {
      setIsManualLogin(false);
    }
  };

  return (
    <DashboardAccessContext.Provider
      value={{
        hasDashboardAccess,
        refetchDashboardLoginSession,
      }}
    >
      {hasDashboardAccess ? (
        children
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
            <Typography variant="h3" mb={2}>
              {t('dashboard.login.title')}
            </Typography>
            <TextField
              label={t('dashboard.login.password_label')}
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
              margin="dense"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
            />
            {error && (
              <Typography color="error" variant="body2" mt={1}>
                {error}
              </Typography>
            )}
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                onClick={handleLogin}
                disabled={isLoading || !password.trim()}
                size="large"
                sx={{
                  backgroundColor: theme.custom.colors.pink,
                  color: theme.palette.text.primary,
                  '&.Mui-disabled': {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} /> : t('dashboard.login.login_button')}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </DashboardAccessContext.Provider>
  );
};
