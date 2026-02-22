'use client';
import { memo } from 'react';
import { Card, CardContent, Typography, Box, useTheme, CircularProgress } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  action?: ReactNode;
  maxWidth?: string;
  isFetching?: boolean;
}

const StatCard = ({ title, value, action, maxWidth, isFetching }: StatCardProps) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        width: maxWidth || theme.spacing(26.625),
        height: theme.spacing(16.5),
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Title */}
        <Typography textAlign="center" sx={{ fontSize: theme.typography.h5.fontSize }}>
          {title}
        </Typography>
        <Box textAlign="center">
          {isFetching ? (
            <CircularProgress size={36} />
          ) : (
            <Typography
              sx={{
                fontSize: theme.typography.h1.fontSize,
                fontWeight: 700,
                color: value !== 0 ? theme.palette.text.primary : theme.palette.text.secondary,
              }}
            >
              € {value.toFixed(2)}
            </Typography>
          )}
        </Box>
        <Box textAlign="center" sx={{ height: 32 }} pt={0.4}>
          {action || <Box sx={{ height: 32 }} />}
        </Box>
      </CardContent>
    </Card>
  );
};

StatCard.displayName = 'StatCard';

export default memo(StatCard);
