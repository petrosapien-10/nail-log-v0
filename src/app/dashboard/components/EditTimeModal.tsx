'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Typography,
  Box,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { TimeEditType } from '@/types/timeEdit';
import { useTheme } from '@mui/material/styles';

interface EditTimeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (newTime: string) => void;
  initialTime: string;
  type: TimeEditType;
  userName: string;
  userImage?: string;
}

export default function EditTimeModal({
  open,
  onClose,
  onSave,
  initialTime,
  type,
  userName,
  userImage,
}: EditTimeDialogProps) {
  const { t } = useTranslate();
  const theme = useTheme();
  const [value, setValue] = useState<Dayjs | null>(dayjs(initialTime, 'HH:mm'));

  useEffect(() => {
    setValue(dayjs(initialTime, 'HH:mm'));
  }, [initialTime]);

  const handleSave = () => {
    if (value) {
      onSave(value.format('HH:mm'));
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: theme.spacing(2),
            width: theme.spacing(66),
            height: theme.spacing(37),
          },
        },
      }}
    >
      <DialogTitle>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          sx={{
            mx: 2,
            mt: 4,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: theme.custom.colors.slateLight,
            border: `1px solid ${theme.custom.colors.darkGrey}`,
            height: 56,
          }}
        >
          <Typography variant="h3" color="text.primary" fontWeight="bold">
            {t('dashboard.user_card.edit_time_modal.title', { type: type })}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={userImage} sx={{ width: 40, height: 40 }} />
            <Typography variant="h4">{userName}</Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 5, mt: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box width="100%">
            <TimePicker
              ampm={false}
              value={value}
              onChange={(newVal) => setValue(newVal)}
              desktopModeMediaQuery="@media (min-width: 0px)"
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  size: 'medium',
                  sx: {
                    height: 56,
                    '& .MuiInputBase-root': {
                      height: 56,
                    },
                  },
                },
              }}
            />
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mb: 4 }}>
        <Box display="flex" gap={theme.spacing(3)}>
          <Button
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.secondary.light,
              },
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: theme.custom.colors.pink,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            }}
            onClick={handleSave}
            disabled={!value}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
