'use client';

import { NavbarProvider } from '../hooks/context/navbar-context';
import Navbar from '../components/Navbar';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import TabsBar from '../components/TabsBar';
import { DashboardAccessProvider } from '../hooks/context/DashboardAccessContext';
import PageTransition from '../components/PageTransition';

const BACKGROUND_IMAGE = 'url(/images/nail-log-background.png)';

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
            backgroundImage: BACKGROUND_IMAGE,
            backgroundRepeat: 'repeat-y',
            backgroundPosition: `center -${theme.spacing(20)}`,
            backgroundSize: '1026px auto',
            backgroundColor: theme.palette.background.default,
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
