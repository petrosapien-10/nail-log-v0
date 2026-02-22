'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { UserWithSessions } from '@/types/user';
import { useTheme } from '@mui/material/styles';

import { useMemo, useState, useCallback } from 'react';

import AdminSortToggleIcon, { SortField, SortOrder } from './AdminSortToggleIcon';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { formatCurrency, formatNumber } from '@/utils/formatCurrency';

const sortableHeaders: {
  label: string;
  field: SortField;
}[] = [
  { label: 'Salary', field: 'totalSalary' },
  { label: 'Shared Bonus', field: 'sharedBonus' },
  { label: 'Daily Bonus', field: 'dailyBonus' },
  { label: 'Basic Salary', field: 'basicSalary' },
  { label: 'Hours', field: 'hours' },
];

interface AdminUsersTableProps {
  data: UserWithSessions[];
  onView?: (userId: string) => void;
  isLoading: boolean;
}

export default function AdminUsersTable({ data, onView, isLoading }: AdminUsersTableProps) {
  const theme = useTheme();
  const { t } = useTranslate();
  const [sortField, setSortField] = useState<SortField>('totalSalary');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSortChange = useCallback((field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  const rows = useMemo(() => {
    const baseRows = data.map((user) => {
      const { totalSalary, sharedBonus, dailyBonus, hours } = user.sessions.reduce(
        (acc, session) => {
          acc.totalSalary += session.totalSalary;
          acc.sharedBonus += session.ticketBonusIncome;
          acc.dailyBonus += session.dailyBonusIncome;
          acc.hours += session.hours || 0;
          return acc;
        },
        {
          totalSalary: 0,
          sharedBonus: 0,
          dailyBonus: 0,
          hours: 0,
        }
      );

      return {
        userId: user.id,
        name: user.name,
        image: user.image,
        totalSalary,
        sharedBonus,
        dailyBonus,
        basicSalary: user.basicSalaryRate,
        hours,
      };
    });

    return baseRows.sort((a, b) => {
      const fieldA = a[sortField] ?? 0;
      const fieldB = b[sortField] ?? 0;

      return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    });
  }, [data, sortField, sortOrder]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2">Employee</Typography>
                </Box>
              </TableCell>

              {sortableHeaders.map(({ label, field }) => (
                <TableCell key={field}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="body2">{label}</Typography>
                    <AdminSortToggleIcon
                      field={field}
                      active={sortField === field}
                      currentOrder={sortOrder}
                      onChange={handleSortChange}
                    />
                  </Box>
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {t('no_employee_data_available')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Avatar
                      src={row.image}
                      alt={row.name}
                      sx={{
                        width: 32,
                        height: 32,
                        display: 'inline-flex',
                        verticalAlign: 'middle',
                        justifyContent: 'center',
                        alignItems: 'center',
                        objectFit: 'cover',
                        bgcolor: theme.custom.colors.slate,
                      }}
                    />
                    <Typography variant="body2" sx={{ display: 'inline-block', ml: 1 }}>
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatCurrency(row.totalSalary)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatCurrency(row.sharedBonus)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatCurrency(row.dailyBonus)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(row.basicSalary)} / hour
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatNumber(row.hours)}</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      variant="contained"
                      size="xsmall"
                      onClick={() => onView?.(row.userId)}
                      sx={{
                        backgroundColor: theme.custom.colors.slateLight,
                        color: theme.custom.colors.slateDeep,
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: theme.custom.colors.grey,
                        },
                      }}
                    >
                      <Typography variant="body2">{t('details')}</Typography>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
