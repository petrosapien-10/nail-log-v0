'use client';

import { ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import { NavbarProvider } from '../hooks/context/navbar-context';
import TabsBar from '../components/TabsBar';
import Navbar from '../components/Navbar';
import { Box } from '@mui/material';
import PageTransition from '../components/PageTransition';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <NavbarProvider>
      <TabsBar />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, #f1f5f9 50%, #e2e8f0 100%)`,
        }}
      >
        <Navbar />
        <PageTransition>
          <section>
            <main>{children}</main>
          </section>
        </PageTransition>
      </Box>
    </NavbarProvider>
  );
}
