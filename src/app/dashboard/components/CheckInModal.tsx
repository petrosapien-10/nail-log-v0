'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';

import { User } from '@/types/user';
import { Session } from '@/types/session';
import { useCreateSessionMutation } from '@/app/store/publicApiSlice';
import ConfirmModal from '@/app/components/ConfirmModal';

import UserCheckInCard from './UserCheckInCard';
import { useTranslate } from 'src/locales/hooks/useTranslate';
import { useTheme } from '@mui/material/styles';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  selectedDateString: string;
  onCheckIn: (user: User, session: Session) => void;
  onError: (message: string) => void;
}

dayjs.extend(utc);
dayjs.extend(timezone);

export default function CheckInModal({
  isOpen,
  onClose,
  users,
  selectedDateString,
  onCheckIn,
  onError,
}: CheckInModalProps) {
  const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();
  const { t } = useTranslate();
  const theme = useTheme();

  const [confirmUser, setConfirmingUser] = useState<User | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSelectUser = (user: User) => {
    setConfirmingUser(user);
  };

  const handleConfirmCheckIn = async () => {
    if (!confirmUser) return;

    try {
      setIsConfirming(true);
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await createSession({
        userId: confirmUser.id,
        data: {
          date: selectedDateString,
          timeZone,
        },
      }).unwrap();

      onCheckIn(confirmUser, res);
      onClose();
      setConfirmingUser(null);
    } catch (error) {
      onError((error as Error).message || 'Failed to check in!');
    } finally {
      setIsConfirming(false);
    }
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
            width: 'fit-content',
            maxWidth: '100%',
          },
        },
      }}
    >
      {!isCreating && (
        <DialogTitle variant="h3" mt={2} ml={3}>
          {t('dashboard.add_user_modal.choose_your_profile_message')}
        </DialogTitle>
      )}

      <DialogContent>
        {isCreating ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={40} sx={{ color: theme.palette.text.primary }} />
          </Box>
        ) : users.length === 0 ? (
          <Typography textAlign="center" mt={2}>
            {t('dashboard.add_user_modal.all_profiles_are_checked_in_message')}
          </Typography>
        ) : (
          <Box
            display="grid"
            gap={2}
            justifyContent="center"
            p={2}
            sx={{
              gridTemplateColumns: `repeat(2, ${theme.spacing(20)})`,

              '@media (min-width: 768px) and (max-width: 1023px)': {
                gridTemplateColumns: `repeat(4, ${theme.spacing(20)})`,
              },

              '@media (min-width: 1024px)': {
                gridTemplateColumns: `repeat(5, ${theme.spacing(20)})`,
              },
            }}
          >
            {users.map((user) => (
              <UserCheckInCard key={user.id} user={user} onClick={() => handleSelectUser(user)} />
            ))}
          </Box>
        )}
      </DialogContent>
      <ConfirmModal
        open={!!confirmUser}
        onClose={() => setConfirmingUser(null)}
        onConfirm={handleConfirmCheckIn}
        description={
          confirmUser
            ? t('dashboard.check_in_comfirm_modal.check_in_confirm', {
                name: confirmUser.name,
              })
            : ''
        }
        confirmText={t('dashboard.check_in_comfirm_modal.confirm')}
        cancelText={t('dashboard.check_in_comfirm_modal.cancel')}
        isLoading={isConfirming}
      />
    </Dialog>
  );
}
