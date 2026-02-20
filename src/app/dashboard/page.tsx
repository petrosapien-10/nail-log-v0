'use client';

import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Button, CircularProgress, Container, MenuItem, Select, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import AddTicketModal from './components/AddTicketModal';
import CheckInModal from './components/CheckInModal';
import StatCard from './components/StatCard';
import UserCard from './components/UserCard';
import ViewTicketsModal from './components/ViewTicketsModal';
import SnackbarMessage from '../components/SnackBarMessage';
import EditTimeModal from './components/EditTimeModal';
import ExpensesModal from './components/ExpensesModal';

import { RefetchMap, useNavbarContext } from '../hooks/context/navbar-context';
import { useTranslate } from 'src/locales/hooks/useTranslate';
import { useTicketManager } from '../hooks/useTicketManager';
import LogoutStatusHandler from '@/app/components/LogoutStatusHandler';

import {
  useGetAllUsersQuery,
  useGetExpensesByDateQuery,
  useGetSessionsByDateQuery,
  useUpdateSessionTimeMutation,
  useCreateHistoryMutation,
} from '@/app/store/publicApiSlice';

import { HistoryActionType } from '@/types/history';
import { User } from '@/types/user';
import { TimeEditType } from '@/types/timeEdit';
import { UserWithSession } from '@/types/user';
import { summarizeTicketPayments } from '@/utils/summarizeTicketPayments';
import SalonIncomeViewModal from './components/SalonIncomeViewModal';
import HistoryModal from './components/HistoryModal';
import { SortOption, SortOptionLabels } from '@/types/sortOptions';
import dayjs from 'dayjs';
import { useAuthContext } from '../hooks/context/AuthContext';
import { useDeleteSessionMutation } from '../store/secureApiSlice';
import ConfirmModal from '../components/ConfirmModal';

const DEFAULT_CHECKOUT_TIME = '00:00';

export default function Page() {
  const theme = useTheme();
  const { t } = useTranslate();

  const {
    selectedDate,
    selectedDateString,
    isUserModalOpen,
    closeUserModal,
    isHistoryModalOpen,
    closeHistoryModal,
    setRefetchMap,
  } = useNavbarContext();

  const { isAdmin, isAuthenticated } = useAuthContext();
  const isToday = dayjs().isSame(dayjs(selectedDate), 'day');
  const isReadOnly = !isToday && !isAdmin && !isAuthenticated;

  const [createHistory] = useCreateHistoryMutation();

  const { data: users = [] } = useGetAllUsersQuery();

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const {
    data: checkedInUsers = [],
    isFetching: isFetchingSessions,
    refetch: refetchSessions,
  } = useGetSessionsByDateQuery(
    { date: selectedDateString, timeZone },
    {
      refetchOnMountOrArgChange: 30, // Only refetch if data is older than 30 seconds
      refetchOnFocus: false, // Don't refetch when window regains focus
    }
  );

  const availableUsers = useMemo(() => {
    return users.filter(
      (user) => !user.isDeleted && !checkedInUsers.some((entry) => entry.id === user.id)
    );
  }, [users, checkedInUsers]);

  const {
    data: expenses = [],
    refetch: refetchExpenses,
    isFetching: isFetchingExpenses,
  } = useGetExpensesByDateQuery(selectedDateString, {
    refetchOnMountOrArgChange: 30,
    refetchOnFocus: false,
  });
  const [updateSessionTime] = useUpdateSessionTimeMutation();

  const [deleteSession, { isLoading: isDeleting }] = useDeleteSessionMutation();

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [deletingSessionInfo, setDeletingSessionInfo] = useState<{
    userId: string;
    sessionId: string;
    userName: string;
  } | null>(null);

  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Basic);

  const { isTicketModalOpen, openTicketModal, closeTicketModal, handleCreateTicket, isCreating } =
    useTicketManager();

  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedUserForTicket, setSelectedUserForTicket] = useState<{
    userId: string;
    sessionId: string;
    userName: string;
    userImage?: string;
  } | null>(null);
  const [viewingTicketsInfo, setViewingTicketsInfo] = useState<{
    userId: string;
    sessionId: string;
    userName: string;
    userImage?: string;
  } | null>(null);
  const [editingTimeInfo, setEditingTimeInfo] = useState<{
    userId: string;
    sessionId: string;
    currentTime: string;
    type: TimeEditType;
    userName: string;
    userImage?: string;
  } | null>(null);

  const logAction = useCallback(
    async (actionType: HistoryActionType, description: string, userId?: string) => {
      try {
        await createHistory({ actionType, description, userId }).unwrap();
      } catch {
        setErrorMessage(t('faild_to_add_history'));
      }
    },
    [createHistory, t]
  );

  const handleUserCheckIn = useCallback(
    (user: User) => {
      setSuccessMessage(t('name_checked_in_successfully', { name: user.name }));
      logAction(HistoryActionType.CheckIn, `Checked in ${user.name}`, user.id);
    },
    [t, logAction]
  );
  const handleUserCheckOut = useCallback(
    async (userId: string, sessionId: string, userName: string) => {
      try {
        setCheckingOutId(sessionId);
        const checkOutTime = new Date().toTimeString().slice(0, 5);

        await updateSessionTime({
          userId,
          sessionId,
          data: { checkOut: checkOutTime },
        }).unwrap();

        setSuccessMessage(t('name_checked_out_successfully', { name: userName }));
        logAction(HistoryActionType.CheckOut, `Checked out ${userName}`, userId);
      } catch (error) {
        const errorMessage =
          error?.data?.message === 'INVALID_TIME_RANGE'
            ? t('check_out_time_cannot_be_earlier_than_check_in_time')
            : t('failed_to_check_out_for_name', { name: userName });

        setErrorMessage(errorMessage);
      } finally {
        setCheckingOutId(null);
      }
    },
    [updateSessionTime, t, logAction]
  );
  const handleViewTickets = useCallback(
    (userId: string, sessionId: string, userName: string, userImage?: string) => {
      setViewingTicketsInfo({ userId, sessionId, userName, userImage });
    },
    []
  );
  const handleEditTime = useCallback(
    (
      userId: string,
      sessionId: string,
      type: TimeEditType,
      currentTime: string,
      userName: string,
      userImage?: string
    ) => {
      setEditingTimeInfo({
        userId,
        sessionId,
        currentTime,
        type,
        userName,
        userImage,
      });
    },
    []
  );
  const handleSaveEditedTime = useCallback(
    async (newTime: string) => {
      if (!editingTimeInfo) return;
      const { userId, sessionId, type, userName } = editingTimeInfo;

      try {
        await updateSessionTime({
          userId,
          sessionId,
          data: {
            [type === TimeEditType.CheckIn ? 'checkIn' : 'checkOut']: newTime,
          },
        }).unwrap();

        setSuccessMessage(
          t(
            type === 'check-in'
              ? 'check_in_time_edited_for_name_successfully'
              : 'check_out_time_edited_for_name_successfully',
            { name: userName }
          )
        );
        logAction(
          type === 'check-in' ? HistoryActionType.EditCheckIn : HistoryActionType.EditCheckOut,
          `Edited ${type} time for ${userName}`,
          userId
        );
      } catch (error) {
        const errorMessage =
          error?.data?.message === 'INVALID_TIME_RANGE'
            ? t('check_out_time_cannot_be_earlier_than_check_in_time')
            : t(
                type === 'check-in'
                  ? 'failed_to_edit_check_in_time_for_name'
                  : 'failed_to_edit_check_out_time_for_name',
                { name: userName }
              );

        setErrorMessage(errorMessage);
      } finally {
        setEditingTimeInfo(null);
      }
    },
    [editingTimeInfo, updateSessionTime, t, logAction]
  );

  //Calculation
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + (isNaN(expense.amount) ? 0 : expense.amount), 0);
  }, [expenses]);

  const allTickets = checkedInUsers.flatMap((entry) => entry.session.tickets ?? []);
  const { paymentTotals, incomeMap } = useMemo(() => {
    return summarizeTicketPayments(allTickets);
  }, [allTickets]);

  const calculateTotalDailyBonus = (checkedInUsers: UserWithSession[]) => {
    return checkedInUsers.reduce((sum, user) => sum + (user.session.dailyBonusIncome ?? 0), 0);
  };
  const totalSharedBonus = incomeMap.ticketBonusIncome;

  const totalBasicIncome = incomeMap.basicIncome;

  const totalDailyBonus = calculateTotalDailyBonus(checkedInUsers);
  const totalBonus = totalSharedBonus + totalDailyBonus;

  const incomeModalData = useMemo(() => {
    const allTicketsValue = Object.values(paymentTotals).reduce((sum, val) => sum + val, 0);

    return {
      cash: paymentTotals.cash ?? 0,
      card: paymentTotals.card ?? 0,
      treatwell: paymentTotals.treatwell ?? 0,
      giftCard: paymentTotals.giftCard ?? 0,
      others: paymentTotals.others ?? 0,
      allTicketsValue,
      totalSharedBonus,
      totalDailyBonus,
      totalExpenses,
      totalSalonIncome: allTicketsValue - totalSharedBonus - totalDailyBonus - totalExpenses,
    };
  }, [paymentTotals, totalSharedBonus, totalDailyBonus, totalExpenses]);

  const sortedUsers = useMemo(() => {
    const copy = [...checkedInUsers];
    switch (sortOption) {
      case SortOption.Shared:
        return copy.sort(
          (a, b) => (b.session.ticketBonusIncome ?? 0) - (a.session.ticketBonusIncome ?? 0)
        );
      case SortOption.Daily:
        return copy.sort(
          (a, b) => (b.session.dailyBonusIncome ?? 0) - (a.session.dailyBonusIncome ?? 0)
        );
      case SortOption.Basic:
      default:
        return copy.sort((a, b) => (b.session.basicIncome ?? 0) - (a.session.basicIncome ?? 0));
    }
  }, [checkedInUsers, sortOption]);

  const confirmDeleteSession = useCallback(async () => {
    if (!deletingSessionInfo) return;

    const { userId, sessionId, userName } = deletingSessionInfo;

    try {
      await deleteSession({ userId, sessionId }).unwrap();
      setSuccessMessage(t('session_deleted_successfully_for_name', { name: userName }));
      logAction(HistoryActionType.DeleteSession, `Deleted session for ${userName}`, userId);
    } catch {
      setErrorMessage(t('failed_to_delete_session_for_name', { name: userName }));
    } finally {
      setIsConfirmModalOpen(false);
      setDeletingSessionInfo(null);
    }
  }, [deletingSessionInfo, deleteSession, t, logAction]);

  useEffect(() => {
    setRefetchMap((prev: RefetchMap) => ({
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
    }));
  }, [isFetchingSessions, isFetchingExpenses, refetchSessions, refetchExpenses, setRefetchMap]);

  const statCards = useMemo(
    () => [
      {
        title: t('net_income'),
        value: Number(incomeModalData.totalSalonIncome.toFixed(2)),
        buttonLabel: t('details'),
        onClick: () => setIsIncomeModalOpen(true),
      },
      {
        title: t('ticket_revenue'),
        value: totalBasicIncome,
      },
      {
        title: t('staff_bonus'),
        value: Number(totalBonus.toFixed(2)),
      },
      {
        title: t('expenses'),
        value: Number(totalExpenses.toFixed(2)),
        buttonLabel: t('add'),
        onClick: () => setIsExpensesModalOpen(true),
      },
    ],
    [t, incomeModalData.totalSalonIncome, totalBasicIncome, totalBonus, totalExpenses]
  );

  return (
    <>
      <Suspense fallback={null}>
        <LogoutStatusHandler
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
        />
      </Suspense>
      <HistoryModal open={isHistoryModalOpen} onClose={closeHistoryModal} />
      <SalonIncomeViewModal
        open={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        data={incomeModalData}
      />
      <ExpensesModal
        isReadOnly={isReadOnly}
        open={isExpensesModalOpen}
        onClose={() => setIsExpensesModalOpen(false)}
        selectedDate={selectedDate}
        onSuccess={(msg) => setSuccessMessage(msg)}
        onError={(msg) => setErrorMessage(msg)}
        totalExpenses={totalExpenses}
        logAction={logAction}
      />

      <CheckInModal
        isOpen={isUserModalOpen}
        onClose={closeUserModal}
        users={availableUsers}
        selectedDateString={selectedDateString}
        onCheckIn={handleUserCheckIn}
        onError={(msg) => setErrorMessage(msg)}
      />

      {selectedUserForTicket && (
        <AddTicketModal
          {...selectedUserForTicket}
          isOpen={isTicketModalOpen}
          isLoading={isCreating}
          onClose={() => {
            closeTicketModal();
            setSelectedUserForTicket(null);
          }}
          onCreate={async (userId, sessionId, userName, ticketData) => {
            const result = await handleCreateTicket(userId, sessionId, ticketData);
            if (result.success) {
              setSuccessMessage(t('ticket_created_for_name_successfully', { name: userName }));
              logAction(HistoryActionType.AddTicket, `Added ticket for ${userName}`, userId);
            } else {
              setErrorMessage(t('failed_to_add_ticket_for_name', { name: userName }));
            }
          }}
        />
      )}
      {editingTimeInfo && (
        <EditTimeModal
          open
          onClose={() => setEditingTimeInfo(null)}
          onSave={handleSaveEditedTime}
          initialTime={editingTimeInfo.currentTime}
          type={editingTimeInfo.type}
          userName={editingTimeInfo.userName}
          userImage={editingTimeInfo.userImage}
        />
      )}
      {viewingTicketsInfo && (
        <ViewTicketsModal
          isReadOnly={isReadOnly}
          open
          onClose={() => setViewingTicketsInfo(null)}
          {...viewingTicketsInfo}
          onSuccess={(msg) => setSuccessMessage(msg)}
          onError={(msg) => setErrorMessage(msg)}
          refetchSessions={refetchSessions}
          logAction={logAction}
        />
      )}

      <SnackbarMessage
        open={!!successMessage}
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
        severity="success"
      />
      <SnackbarMessage
        open={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
        severity="error"
      />

      <ConfirmModal
        open={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
        }}
        onConfirm={confirmDeleteSession}
        description={
          deletingSessionInfo
            ? t('are_you_sure_you_want_to_delete_name_s_session', {
                name: deletingSessionInfo.userName,
              })
            : ''
        }
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isLoading={isDeleting}
      />

      <Container
        disableGutters
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: theme.spacing(122.5),
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          py: 2,
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {statCards.map(({ title, value, buttonLabel, onClick }, index) => (
          <StatCard
            key={title + index}
            title={title}
            value={value}
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
          margin: '0 auto',
          px: { xs: 2, sm: 4 },
          pb: 2,
          pt: 2,
        }}
      >
        <Box
          pb={4}
          sx={{
            backgroundColor: theme.custom.colors.slateLight,
            borderRadius: 2,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: 'column', sm: 'row' }}
            px={3}
            pt={2}
            mb={2}
            sx={{}}
          >
            <Typography variant="h3" component="label" htmlFor="sort-select" fontWeight={700}>
              {t('team_and_income')}
            </Typography>

            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{
                backgroundColor: theme.palette.common.white,
                borderRadius: '8px',
                px: 1,
                py: 1,
                mr: 0.3,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <Typography variant="h5" component="label">
                {t('sort_by')}
              </Typography>

              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
                disableUnderline
                variant="standard"
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  backgroundColor: 'transparent',
                  '& .MuiSelect-select': {
                    padding: '4px 24px 4px 2px',
                  },
                  fontSize: theme.typography.h5.fontSize,
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root.Mui-selected': {
                        backgroundColor: theme.custom.colors.grey,
                        '&:hover': {
                          backgroundColor: theme.custom.colors.slate,
                        },
                      },
                    },
                  },
                }}
              >
                {Object.entries(SortOptionLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          <Box
            display={isFetchingSessions ? 'flex' : 'grid'}
            gridTemplateColumns={
              isFetchingSessions
                ? undefined
                : {
                    xs: '1fr',
                    sm: '1fr',
                    md: `repeat(2, ${theme.spacing(52)})`,
                  }
            }
            gap={4}
            sx={{
              mx: 'auto',
              py: 1,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 100,
              overflowX: 'hidden',
            }}
          >
            {isFetchingSessions ? (
              <CircularProgress size={40} />
            ) : (
              sortedUsers.map((user) => (
                <Box key={user.session.id} display="flex" justifyContent="center">
                  <UserCard
                    key={user.session.id}
                    data={user}
                    isCheckingOut={checkingOutId === user.session.id}
                    isToday={isToday}
                    isReadOnly={isReadOnly}
                    isAdmin={isAdmin}
                    isAuthenticated={isAuthenticated}
                    onCheckOut={() => handleUserCheckOut(user.id, user.session.id, user.name)}
                    onAddTicket={() => {
                      setSelectedUserForTicket({
                        userId: user.id,
                        sessionId: user.session.id,
                        userName: user.name,
                        userImage: user.image,
                      });
                      openTicketModal();
                    }}
                    onViewTickets={() =>
                      handleViewTickets(user.id, user.session.id, user.name, user.image)
                    }
                    onEditTime={(type) => {
                      const currentTime =
                        type === TimeEditType.CheckIn
                          ? user.session.checkIn
                          : user.session.checkOut || DEFAULT_CHECKOUT_TIME;

                      handleEditTime(
                        user.id,
                        user.session.id,
                        type,
                        currentTime,
                        user.name,
                        user.image
                      );
                    }}
                    onDeleteSession={() => {
                      setDeletingSessionInfo({
                        userId: user.id,
                        sessionId: user.session.id,
                        userName: user.name,
                      });
                      setIsConfirmModalOpen(true);
                    }}
                  />
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
}
