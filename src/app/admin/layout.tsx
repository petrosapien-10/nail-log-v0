'use client';

import { ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import { NavbarProvider } from '../hooks/context/navbar-context';
import TabsBar from '../components/TabsBar';
import Navbar from '../components/Navbar';
import { Box } from '@mui/material';

const BACKGROUND_IMAGE = 'url(/images/nail-log-background.png)';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <NavbarProvider>
      <TabsBar />
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
        <section>
          <main>{children}</main>
        </section>
      </Box>
    </NavbarProvider>
  );
}
