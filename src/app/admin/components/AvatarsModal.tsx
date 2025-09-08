'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Avatar } from '@mui/material';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { useTheme } from '@mui/material/styles';

interface Avatar {
  id: string;
  url: string;
}

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  avatars: Avatar[];
}

export default function AvatarsModal({ isOpen, onClose, onSelect, avatars }: AvatarModalProps) {
  const { t } = useTranslate();
  const theme = useTheme();

  const handleSelectAvatar = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: theme.palette.primary.light,
            borderRadius: theme.spacing(2),
            width: theme.spacing(120),
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          paddingLeft: theme.spacing(6),
          paddingRight: theme.spacing(6),
          paddingTop: theme.spacing(4.5),
          paddingBottom: theme.spacing(2),
        }}
      >
        <Typography variant="h3" component="span">
          {t('profiles.avatars_modal.title')}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          paddingTop: theme.spacing(4.5),
          paddingRight: theme.spacing(6),
          paddingBottom: theme.spacing(6),
          paddingLeft: theme.spacing(6),
        }}
      >
        {avatars.length === 0 ? (
          <Typography textAlign="center" mt={2}>
            {t('profiles.avatars_modal.no_avatars_message')}
          </Typography>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns={`repeat(5, ${theme.spacing(20)})`}
            gap={theme.spacing(2)}
          >
            {avatars.map((avatar) => (
              <Box
                key={avatar.id}
                width={theme.spacing(20)}
                height={theme.spacing(21)}
                borderRadius={theme.spacing(2)}
                bgcolor={theme.palette.background.paper}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                  border: `2px solid transparent`,
                  '&:hover': {
                    borderColor: theme.custom.colors.pink,
                  },
                }}
                onClick={() => handleSelectAvatar(avatar.url)}
              >
                <Avatar
                  src={avatar.url}
                  alt="Avatar"
                  sx={{
                    width: theme.spacing(16),
                    height: theme.spacing(16),
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
