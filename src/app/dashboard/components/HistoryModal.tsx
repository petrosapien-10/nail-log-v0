'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DateSelector from '../../admin/components/DateSelector';
import { useGetHistoryByDateQuery } from '@/app/store/publicApiSlice';
import { History } from '@/types/history';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { useTheme } from '@mui/material/styles';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { Dayjs } from 'dayjs';
const DISPLAY_FORMAT = 'DD/MM/YYYY';
const QUERY_FORMAT = 'YYYY-MM-DD';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HistoryModal({ open, onClose }: HistoryModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formattedDate = dayjs(selectedDate).format(QUERY_FORMAT);

  const theme = useTheme();
  const { t } = useTranslate();

  const { data: logs = [], isLoading, error } = useGetHistoryByDateQuery(formattedDate, {
    refetchOnMountOrArgChange: 30,
    refetchOnFocus: false,
  });

  const handleDateChange = useCallback((date: Dayjs) => {
    setSelectedDate(date.toDate());
  }, []);

  const formatCreatedAt = useCallback((createdAt: { seconds: number; nanoseconds: number }) => {
    if (!createdAt?.seconds) return t('dashboard.history_modal.invalid_date');

    const logTime = dayjs.unix(createdAt.seconds);
    const now = dayjs();
    const diffInMinutes = now.diff(logTime, 'minute');

    return diffInMinutes < 30 ? `${diffInMinutes} min` : logTime.format('HH:mm');
  }, [t]);

  const renderSortedLogs = useCallback((logs: History[]) => {
    return [...logs]
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
      .map((log) => (
        <Box key={log.id} my={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">
              {log.performedBy} {log.description}
            </Typography>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
              {formatCreatedAt(log.createdAt)}
            </Typography>
          </Box>
          <Divider />
        </Box>
      ));
  }, [theme.palette.text.primary, formatCreatedAt]);

  useEffect(() => {
    // RTK Query will automatically refetch when the modal opens due to query options
  }, [open, formattedDate]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ p: 0 }}>
        <Box pt={6} px={6} pb={2}>
          <Box display="flex" justifyContent="flex-end" mb={3}>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: theme.custom.colors.slateLight,
                border: `1px solid ${theme.custom.colors.darkGrey}`,
                '&:hover': {
                  backgroundColor: theme.custom.colors.grey,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography variant="h3">History</Typography>
            </Box>

            <DateSelector
              selectedDate={selectedDate}
              onChange={handleDateChange}
              label="Pick the date"
              format={DISPLAY_FORMAT}
              sx={{
                maxWidth: 205,
                height: 48,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  height: '48px',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.text.primary}`,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  paddingTop: 1,
                  paddingBottom: 0,
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            />
          </Box>
        </Box>
      </DialogTitle>

      <Box px={6} pt={2} pb={6} maxHeight="60vh" overflow="auto">
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error">{t('dashboard.history_modal.fail_to_load_message')}</Typography>
        ) : logs.length === 0 ? (
          <Typography>{t('dashboard.history_modal.no_logs_message')}</Typography>
        ) : (
          renderSortedLogs(logs)
        )}
      </Box>
    </Dialog>
  );
}
