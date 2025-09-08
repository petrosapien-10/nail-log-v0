'use client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import TranslationProvider from 'src/locales/components/TranslationProvider';
import { theme } from '../theme/theme';
import StoreProvider from './store/StoreProvider';
import { AuthProvider } from './hooks/context/AuthContext';

// ----------------------------------------------------------------------
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <TranslationProvider>
            <AppRouterCacheProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>{children}</AuthProvider>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </TranslationProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
