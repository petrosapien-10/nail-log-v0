'use client';

import {
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Typography,
  IconButton,
  Box,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { UserWithSessions } from '@/types/user';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { useMemo } from 'react';

const DATE_FORMAT = 'DD.MM.YYYY';

interface AdminUserViewModalProps {
  user: UserWithSessions;
  dateRange: { start: string; end: string };
  onClose: () => void;
}

export default function AdminUserViewModal({ user, dateRange, onClose }: AdminUserViewModalProps) {
  const theme = useTheme();
  const { t } = useTranslate();
  const totalHours = useMemo(() => {
    return user.sessions.reduce((sum, s) => sum + (s.hours || 0), 0);
  }, [user.sessions]);

  const totalSalary = useMemo(() => {
    return user.sessions.reduce((sum, s) => sum + s.totalSalary, 0);
  }, [user.sessions]);

  const totalValues = ['', '', '', totalHours.toFixed(2), `€ ${totalSalary.toFixed(2)}`];

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      aria-label="Close"
      slotProps={{
        paper: {
          sx: {
            width: theme.spacing(99),
            maxHeight: theme.spacing(90),
            borderRadius: '16px',
            p: theme.spacing(6),
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(3),
            boxSizing: 'border-box',
          },
        },
      }}
    >
      <Box display="flex" justifyContent="flex-end">
        <IconButton
          onClick={onClose}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '4px',
            backgroundColor: theme.palette.secondary.dark,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Box display="flex" alignItems="center">
          <Avatar src={user.image} sx={{ mr: 2 }} />
          <Typography>{user.name}</Typography>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderRadius={2}
          sx={{
            width: theme.spacing(26.5),
            height: theme.spacing(6),
            background: theme.palette.secondary.dark,
          }}
        >
          <Typography variant="h5">
            {dayjs(dateRange.start).format(DATE_FORMAT)} -{' '}
            {dayjs(dateRange.end).format(DATE_FORMAT)}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: 0, pt: 0, overflowX: 'auto' }}>
        <Table
          sx={{
            border: `1px solid ${theme.palette.secondary.main}`,
            borderCollapse: 'separate',
            borderRadius: 1,
            minWidth: '100%',
          }}
        >
          <TableHead sx={{ backgroundColor: theme.palette.secondary.dark }}>
            <TableRow>
              {[
                t('admin.view_modal.date'),
                t('admin.view_modal.check_in_time'),
                t('admin.view_modal.check_out_time'),
                t('admin.view_modal.working_hour'),
                t('admin.view_modal.salary'),
              ].map((text) => (
                <TableCell key={text}>
                  <Typography variant="body2">{text}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {user.sessions.map((session) => {
              const sessionValues = [
                session.date?.seconds ? dayjs.unix(session.date.seconds).format(DATE_FORMAT) : '-',
                session.checkIn || '-',
                session.checkOut || '-',
                typeof session.hours === 'number' ? session.hours.toFixed(2) : '-',
                `€ ${(session.totalSalary ?? 0).toFixed(2)}`,
              ];



              return (
                <TableRow key={session.id}>
                  {sessionValues.map((value, i) => (
                    <TableCell key={i}>{value}</TableCell>
                  ))}
                </TableRow>
              );
            })}

            <TableRow>
              {totalValues.map((value, i) => (
                <TableCell key={i} sx={i >= 3 ? { fontWeight: 'bold' } : {}}>
                  {value}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
