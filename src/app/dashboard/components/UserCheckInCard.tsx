'use client';

import React from 'react';
import { Card, Avatar, CardActionArea, Typography, Box } from '@mui/material';
import { User } from '@/types/user';

interface UserProfileCardProps {
  user: User;
  onClick?: () => void;
}

export default function UserCheckInCard({ user, onClick }: UserProfileCardProps) {
  return (
    <Card sx={{ borderRadius: 4, width: 160, height: 224 }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          p={2}
        >
          <Avatar src={user.image} sx={{ width: 128, height: 128 }}>
            {user.name?.charAt(0) || '?'}
          </Avatar>
          <Box mt={3}>
            <Typography variant="h4" textAlign="center">
              {user.name}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
