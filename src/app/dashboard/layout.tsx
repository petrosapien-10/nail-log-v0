'use client';

import { NavbarProvider } from '../hooks/context/navbar-context';
import Navbar from '../components/Navbar';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import TabsBar from '../components/TabsBar';
import { DashboardAccessProvider } from '../hooks/context/DashboardAccessContext';
import PageTransition from '../components/PageTransition';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <NavbarProvider>
      <TabsBar />
      <DashboardAccessProvider>
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
      </DashboardAccessProvider>
    </NavbarProvider>
  );
}
