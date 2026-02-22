'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuthContext } from '@/app/hooks/context/AuthContext';
import { Button, Container, useTheme } from '@mui/material';
import { useNavbarContext } from '../hooks/context/NavbarContext';
import { useGetExpensesByRangeQuery, useGetSessionsQuery } from '../store/secureApiSlice';
import AdminUsersTable from './components/AdminUsersTable';
import AdminUserViewModal from './components/AdminUserViewModal';
import StatCard from '../dashboard/components/StatCard';
import { summarizeTicketPayments } from '@/utils/summarizeTicketPayments';
import SalonIncomeViewModal from '../dashboard/components/SalonIncomeViewModal';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { useGetDashboardSessionQuery } from '../store/publicApiSlice';

export default function AdminPage() {
  const theme = useTheme();
  const { isAuthenticated, isAdmin, loading: adminLoading } = useAuthContext();
  const { selectedRangeString, setRefetchMap } = useNavbarContext();
  const router = useRouter();
  const { t } = useTranslate();

  useEffect(() => {
    if (!adminLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, adminLoading, router]);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const {
    data: usersAndSessions = [],
    isFetching: isFetchingSessions,
    refetch: refetchSessions,
  } = useGetSessionsQuery(
    {
      start: selectedRangeString.start,
      end: selectedRangeString.end,
      timeZone,
    },
    {
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: 45,
      refetchOnFocus: false,
    }
  );

  const {
    data: expenses = [],
    isFetching: isFetchingExpenses,
    refetch: refetchExpenses,
  } = useGetExpensesByRangeQuery(
    {
      start: selectedRangeString.start,
      end: selectedRangeString.end,
    },
    {
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: 45,
      refetchOnFocus: false,
    }
  );

  const { isFetching: isFetchingDashboardLoginSession, refetch: refetchDashboardLoginSession } =
    useGetDashboardSessionQuery(undefined, {
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: 60,
      refetchOnFocus: false,
    });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUser = usersAndSessions.find((u) => u.id === selectedUserId);
  const [showSalonIncomeModal, setShowSalonIncomeModal] = useState(false);

  const allTickets = useMemo(() => {
    return usersAndSessions.flatMap((user) =>
      user.sessions.flatMap((session) => session.tickets || [])
    );
  }, [usersAndSessions]);

  const summary = useMemo(() => summarizeTicketPayments(allTickets), [allTickets]);

  const allTicketsValue = useMemo(() => {
    const { paymentTotals } = summary;
    return Object.values(paymentTotals).reduce((sum, val) => sum + (val || 0), 0);
  }, [summary]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + (item.amount || 0), 0),
    [expenses]
  );

  const { totalSalary, totalSharedBonus, totalDailyBonus } = useMemo(() => {
    let totalSalary = 0;
    let totalSharedBonus = 0;
    let totalDailyBonus = 0;

    usersAndSessions.forEach((user) => {
      user.sessions.forEach((session) => {
        totalSalary += session.totalSalary || 0;
        totalSharedBonus += session.ticketBonusIncome || 0;
        totalDailyBonus += session.dailyBonusIncome || 0;
      });
    });

    return { totalSalary, totalSharedBonus, totalDailyBonus };
  }, [usersAndSessions]);

  const totalSalonIncome = useMemo(() => {
    return allTicketsValue - totalSharedBonus - totalDailyBonus - totalExpenses;
  }, [allTicketsValue, totalSharedBonus, totalDailyBonus, totalExpenses]);

  const profit = useMemo(() => {
    return totalSalonIncome - totalSalary;
  }, [totalSalonIncome, totalSalary]);

  const salonIncomeData = useMemo(() => {
    const { paymentTotals } = summary;
    return {
      cash: paymentTotals.cash,
      card: paymentTotals.card,
      treatwell: paymentTotals.treatwell,
      giftCard: paymentTotals.giftCard,
      others: paymentTotals.others,
      allTicketsValue,
      totalSharedBonus,
      totalDailyBonus,
      totalExpenses,
      totalSalonIncome,
    };
  }, [
    summary,
    allTicketsValue,
    totalSharedBonus,
    totalDailyBonus,
    totalExpenses,
    totalSalonIncome,
  ]);

  const adminStatCards = useMemo(
    () => [
      {
        title: t('net_income'),
        value: totalSalonIncome,
        buttonLabel: t('details'),
        onClick: () => setShowSalonIncomeModal(true),
      },
      {
        title: t('profit'),
        value: profit,
      },
      {
        title: t('salary'),
        value: totalSalary,
      },
      {
        title: t('shared_bonus'),
        value: totalSharedBonus,
      },
      {
        title: t('daily_bonus'),
        value: totalDailyBonus,
      },
    ],
    [
      t,
      totalSalonIncome,
      profit,
      totalSalary,
      totalSharedBonus,
      totalDailyBonus,
      setShowSalonIncomeModal,
    ]
  );

  const handleCloseUserModal = useCallback(() => setSelectedUserId(null), []);
  const handleCloseSalonIncomeModal = useCallback(() => setShowSalonIncomeModal(false), []);

  useEffect(() => {
    setRefetchMap((prev) => ({
      ...prev,
      sessions: {
        ...prev.sessions,
        isFetching: isFetchingSessions,
        fetcher: refetchSessions,
      },
      expenses: {
        ...prev.expenses,
        isFetching: isFetchingExpenses,
        fetcher: refetchExpenses,
      },
      dashboardLoginSession: {
        ...prev.dashboardLoginSession,
        isFetching: isFetchingDashboardLoginSession,
        fetcher: refetchDashboardLoginSession,
      },
    }));
  }, [
    isFetchingSessions,
    isFetchingExpenses,
    isFetchingDashboardLoginSession,
    refetchSessions,
    refetchExpenses,
    refetchDashboardLoginSession,
    setRefetchMap,
  ]);

  return (
    <>
      {selectedUser && (
        <AdminUserViewModal
          user={selectedUser}
          dateRange={selectedRangeString}
          onClose={handleCloseUserModal}
        />
      )}
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: theme.spacing(122.5),
          mx: 'auto',
          px: { xs: theme.spacing(2), sm: theme.spacing(4) },
          py: 2,
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {adminStatCards.map(({ title, value, buttonLabel, onClick }) => (
          <StatCard
            key={title}
            title={title}
            value={value}
            isFetching={isFetchingExpenses}
            maxWidth={theme.spacing(21)}
            action={
              buttonLabel && onClick ? (
                <Button
                  variant="contained"
                  size="xsmall"
                  sx={{
                    backgroundColor: theme.custom.colors.slateLight,
                    color: theme.custom.colors.slateDeep,
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: theme.custom.colors.grey,
                    },
                  }}
                  onClick={onClick}
                >
                  {buttonLabel}
                </Button>
              ) : undefined
            }
          />
        ))}
      </Container>

      <Container
        disableGutters
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: theme.spacing(122.5),
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          py: 2,
        }}
      >
        <AdminUsersTable
          data={usersAndSessions}
          onView={setSelectedUserId}
          isLoading={isFetchingSessions}
        />

        <SalonIncomeViewModal
          open={showSalonIncomeModal}
          onClose={handleCloseSalonIncomeModal}
          data={salonIncomeData}
        />
      </Container>
    </>
  );
}
