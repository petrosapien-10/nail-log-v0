'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import colors from '@/theme/colors';

import AddTicketModal from './AddTicketModal';
import { summarizeTicketPayments } from '@/utils/summarizeTicketPayments';
import { useTicketManager } from '@/app/hooks/useTicketManager';
import { useTranslate } from '@/locales/hooks/useTranslate';

import {
  useGetSessionTicketsQuery,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} from '@/app/store/publicApiSlice';

import { FirestoreTimestamp } from '@/types/firestore';
import { Ticket, TicketData } from '@/types/ticket';
import { HistoryActionType } from '@/types/history';

import { theme } from '@/theme/theme';

const TIME_FORMAT = 'HH:mm';
const KNOWN_METHODS = new Set(['cash', 'card', 'treatwell', 'giftcard']);

const formatDate = (timestamp: FirestoreTimestamp) => {
  if (!timestamp?.seconds) return '';
  return dayjs.unix(timestamp.seconds).format(TIME_FORMAT);
};

const renderOtherPayments = (ticket: Ticket) => {
  const otherPayments = ticket.payments.filter((p) => !KNOWN_METHODS.has(p.method.toLowerCase()));

  if (otherPayments.length === 0) {
    return <Typography variant="body2">0.00</Typography>;
  }

  return otherPayments.map((p, idx) => (
    <Box key={idx} display="flex" gap={0.25} alignItems="center">
      <Typography>{p.amount.toFixed(2)}</Typography>
      <Typography variant="caption" color="textSecondary" sx={{ whiteSpace: 'nowrap' }}>
        ({p.method.replace(/ /g, '\u00A0')})
      </Typography>
    </Box>
  ));
};

interface ViewTicketsModalProps {
  isReadOnly: boolean;

  open: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
  userImage?: string;
  sessionId: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  refetchSessions: () => void;
  logAction: (type: HistoryActionType, description: string, userId?: string) => void;
}

export default function ViewTicketsModal({
  isReadOnly,
  open,
  onClose,
  userName,
  userId,
  userImage,
  sessionId,
  onSuccess,
  onError,
  refetchSessions,
  logAction,
}: ViewTicketsModalProps) {
  const { t } = useTranslate();

  const {
    data: tickets = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetSessionTicketsQuery({ userId, sessionId }, { skip: !open });

  const { paymentTotals, incomeMap, ticketPaymentMaps } = useMemo(
    () => summarizeTicketPayments(tickets),
    [tickets]
  );

  const { isTicketModalOpen, openTicketModal, closeTicketModal, handleCreateTicket, isCreating } =
    useTicketManager({ refetch });

  const [updateTicket] = useUpdateTicketMutation();
  const [deleteTicket] = useDeleteTicketMutation();

  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => a.createdAt.seconds - b.createdAt.seconds),
    [tickets]
  );

  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, ticketId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicketId(ticketId);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedTicketId(null);
  }, []);

  const handleCreate = async (
    userId: string,
    sessionId: string,
    userName: string,
    ticketData: TicketData
  ) => {
    const result = await handleCreateTicket(userId, sessionId, ticketData);
    if (result.success) {
      await Promise.all([refetch(), refetchSessions()]);
      onSuccess(t('dashboard.alert.add_ticket_success', { name: userName }));

      const ticketNumber = sortedTickets.length + 1;
      logAction(
        HistoryActionType.AddTicket,
        `Added ticket #${ticketNumber} for ${userName}`,
        userId
      );
    } else {
      onError(t('dashboard.alert.add_ticket_fail', { name: userName }));
    }
  };

  const handleUpdate = async (
    userId: string,
    sessionId: string,
    ticketId: string,
    ticketData: TicketData
  ) => {
    setIsUpdating(true);
    try {
      await updateTicket({ userId, sessionId, ticketId, data: ticketData }).unwrap();
      await Promise.all([refetch(), refetchSessions()]);
      onSuccess(t('dashboard.alert.edit_ticket_success', { name: userName }));

      const editedIndex = sortedTickets.findIndex((ticket) => ticket.id === ticketId);

      const ticketNumber = editedIndex + 1;

      logAction(
        HistoryActionType.EditTicket,
        `Edited ticket #${ticketNumber} for ${userName}`,
        userId
      );

      closeTicketModal();
      setTicketToEdit(null);
    } catch {
      onError(t('dashboard.alert.edit_ticket_fail', { name: userName }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!selectedTicketId) return;
    const ticketIndex = sortedTickets.findIndex((t) => t.id === selectedTicketId);

    const ticketNumber = ticketIndex >= 0 ? ticketIndex + 1 : 'unknown';

    setIsDeleting(true);
    handleMenuClose();
    try {
      await deleteTicket({ userId, sessionId, ticketId: selectedTicketId }).unwrap();
      onSuccess(t('dashboard.alert.delete_ticket_success', { name: userName }));
      await Promise.all([refetch(), refetchSessions()]);

      logAction(
        HistoryActionType.DeleteTicket,
        `Deleted ticket #${ticketNumber} for ${userName}`,
        userId
      );
    } catch {
      onError(t('dashboard.alert.delete_ticket_fail', { name: userName }));
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedTicketId,
    deleteTicket,
    userId,
    sessionId,
    onSuccess,
    onError,
    t,
    refetch,
    refetchSessions,
    handleMenuClose,
    userName,
    sortedTickets,
    logAction,
  ]);

  const handleEdit = useCallback(() => {
    if (!selectedTicketId) return;
    const ticket = tickets.find((t) => t.id === selectedTicketId);
    if (ticket) {
      setTicketToEdit(ticket);
      openTicketModal();
    }
    handleMenuClose();
  }, [selectedTicketId, tickets, openTicketModal, handleMenuClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <AddTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          closeTicketModal();
          setTicketToEdit(null);
        }}
        userId={userId}
        sessionId={sessionId}
        userName={userName}
        userImage={userImage}
        isLoading={isCreating || isUpdating}
        ticketToEdit={ticketToEdit}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
      <DialogTitle
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          px: 2,
          py: 3,
          m: 2,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Button
            disabled={isReadOnly}
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: theme.custom.colors.pink,
              color: theme.palette.text.primary,
              whiteSpace: 'nowrap',
            }}
            onClick={openTicketModal}
          >
            {t('dashboard.user_card.add_ticket_button')}
          </Button>

          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: theme.palette.secondary.dark,
            }}
          >
            <Avatar src={userImage} sx={{ width: 40, height: 40 }} />
            <Typography variant="h4">{userName}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {isDeleting && (
              <>
                <CircularProgress size={20} />
                <Typography variant="body2" color="textSecondary">
                  {t('dashboard.user_card.view_tickets_modal.deleting')}
                </Typography>
              </>
            )}
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: theme.palette.secondary.dark,
                '&:hover': {
                  backgroundColor: theme.palette.grey[300],
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {isLoading || isFetching ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error">Failed to load tickets.</Typography>
        ) : tickets.length === 0 ? (
          <Typography textAlign="center" color="textSecondary" py={4}>
            {t('dashboard.user_card.view_tickets_modal.empty_table_message')}
          </Typography>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Table
                size="medium"
                sx={{
                  border: `0.5px solid ${theme.palette.secondary.dark}`,
                  '& th, & td': {
                    padding: '4px 16px',
                  },
                }}
              >
                <TableHead
                  sx={{
                    backgroundColor: theme.palette.secondary.dark,
                    '& th': {
                      height: 40,
                      padding: '4px 16px',
                      verticalAlign: 'middle',
                    },
                  }}
                >
                  <TableRow>
                    <TableCell rowSpan={2} sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.view_tickets_modal.ticket')} #
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.view_tickets_modal.create_time')}
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.basic_income')} (€)
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.view_tickets_modal.bonus_income')} (€)
                    </TableCell>
                    <TableCell colSpan={5} align="center" sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.view_tickets_modal.payment_type')} (€)
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.view_tickets_modal.actions')}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.add_ticket_modal.cash')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.add_ticket_modal.card')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.add_ticket_modal.treatwell')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.add_ticket_modal.gift_card')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.user_card.add_ticket_modal.others')}
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedTickets.map((ticket, index) => {
                    const paymentMap = ticketPaymentMaps[ticket.id];
                    const basicIncome = ticket.isBonus ? 0 : ticket.totalAmount;
                    const bonusIncome = ticket.isBonus ? ticket.bonusAmount : 0;

                    return (
                      <TableRow
                        key={ticket.id}
                        sx={{
                          backgroundColor: ticket.isBonus ? colors.tablePink : 'inherit',
                          height: 72,
                        }}
                      >
                        <TableCell>{`#${index + 1}`}</TableCell>
                        <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                        <TableCell>{basicIncome.toFixed(2)}</TableCell>
                        <TableCell>{bonusIncome.toFixed(2)}</TableCell>
                        <TableCell>{paymentMap.cash.toFixed(2)}</TableCell>
                        <TableCell>{paymentMap.card.toFixed(2)}</TableCell>
                        <TableCell>{paymentMap.treatwell.toFixed(2)}</TableCell>
                        <TableCell>{paymentMap.giftCard.toFixed(2)}</TableCell>
                        <TableCell sx={{ minWidth: 80 }}>
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {renderOtherPayments(ticket)}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => {
                              if (!isReadOnly) handleMenuOpen(e, ticket.id);
                            }}
                            disabled={isReadOnly}
                          >
                            <MoreHorizIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  <TableRow
                    sx={{
                      backgroundColor: theme.palette.secondary.dark,
                      fontWeight: 'bold',
                      height: 60,
                      '& td': {
                        padding: '4px 16px',
                        verticalAlign: 'middle',
                      },
                    }}
                  >
                    <TableCell colSpan={2} />
                    <TableCell>
                      <strong>{incomeMap.basicIncome.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{incomeMap.ticketBonusIncome.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{paymentTotals.cash.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{paymentTotals.card.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{paymentTotals.treatwell.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{paymentTotals.giftCard.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{paymentTotals.others.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <MenuItem onClick={handleEdit}>
                <EditIcon sx={{ marginRight: 1 }} />
                {t('dashboard.user_card.view_tickets_modal.edit_button')}
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon sx={{ marginRight: 1, color: 'error.main' }} />
                {t('dashboard.user_card.view_tickets_modal.delete_button')}
              </MenuItem>
            </Menu>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
