'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  Box,
  Switch,
  InputAdornment,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { Ticket } from '@/types/ticket';
import { PaymentMethod } from '@/types/payment';
import { PaymentAmounts } from '@/types/paymentAmounts';
import { handleNumberInputKeyDown } from '@/utils/handleNumberInputKeyDown';
import { sanitizeAmount } from '@/utils/sanitizeAmount';
import { useTheme } from '@mui/material/styles';

const PaymentInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => {
  const theme = useTheme();

  return (
    <Box display="flex" alignItems="center" gap={2} flex={1}>
      <Typography width={80} fontSize={theme.typography.body1.fontSize}>
        {label}
      </Typography>

      <TextField
        type="number"
        placeholder="00.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleNumberInputKeyDown}
        sx={{
          width: 140,
          fontSize: theme.typography.body1.fontSize,
          '& input': {
            fontSize: theme.typography.body1.fontSize,
          },
        }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          },
        }}
      />
    </Box>
  );
};

const DEFAULT_AMOUNTS = {
  [PaymentMethod.Cash]: '',
  [PaymentMethod.Card]: '',
  [PaymentMethod.Treatwell]: '',
  [PaymentMethod.GiftCard]: '',
  [PaymentMethod.Others]: {
    label: '',
    amount: '',
  },
};

interface AddTicketModalProps {
  userId: string;
  sessionId: string;
  userName: string;
  userImage?: string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onCreate: (
    userId: string,
    sessionId: string,
    userName: string,
    ticketData: {
      payments: { method: string; amount: number }[];
      isBonus: boolean;
    }
  ) => void;
  ticketToEdit?: Ticket | null;
  onUpdate?: (
    userId: string,
    sessionId: string,
    ticketId: string,
    ticketData: {
      payments: { method: string; amount: number }[];
      isBonus: boolean;
    }
  ) => void;
}

export default function AddTicketModal({
  userId,
  sessionId,
  userName,
  userImage,
  isOpen,
  onClose,
  onCreate,
  isLoading,
  ticketToEdit,
  onUpdate,
}: AddTicketModalProps) {
  const { t } = useTranslate();
  const theme = useTheme();

  const [isBonus, setIsBonus] = useState(false);
  const [amounts, setAmounts] = useState(DEFAULT_AMOUNTS);

  useEffect(() => {
    if (ticketToEdit) {
      const initialAmounts: PaymentAmounts = {
        [PaymentMethod.Cash]: '',
        [PaymentMethod.Card]: '',
        [PaymentMethod.Treatwell]: '',
        [PaymentMethod.GiftCard]: '',
        [PaymentMethod.Others]: {
          label: '',
          amount: '',
        },
      };

      ticketToEdit.payments.forEach((payment) => {
        const method = payment.method.toLowerCase();
        const value = payment.amount.toString();
        switch (method) {
          case PaymentMethod.Cash:
            initialAmounts[PaymentMethod.Cash] = value;
            break;
          case PaymentMethod.Card:
            initialAmounts[PaymentMethod.Card] = value;
            break;
          case PaymentMethod.Treatwell:
            initialAmounts[PaymentMethod.Treatwell] = value;
            break;
          case PaymentMethod.GiftCard:
            initialAmounts[PaymentMethod.GiftCard] = value;
            break;
          default:
            initialAmounts[PaymentMethod.Others] = { label: payment.method, amount: value };
        }
      });

      setAmounts(initialAmounts);
      setIsBonus(ticketToEdit.isBonus);
    } else {
      setAmounts(DEFAULT_AMOUNTS);
      setIsBonus(false);
    }
  }, [ticketToEdit]);

  const handleAmountChange = (key: Exclude<PaymentMethod, PaymentMethod.Others>, value: string) => {
    const sanitized = sanitizeAmount(value);
    setAmounts((prev) => ({ ...prev, [key]: sanitized }));
  };

  const handleClose = () => {
    setAmounts(DEFAULT_AMOUNTS);
    setIsBonus(false);
    onClose();
  };

  const handleSave = async () => {
    const rawPayments: { method: string; amount: number }[] = [
      { method: PaymentMethod.Cash, amount: parseFloat(amounts[PaymentMethod.Cash]) || 0 },
      { method: PaymentMethod.Card, amount: parseFloat(amounts[PaymentMethod.Card]) || 0 },
      {
        method: PaymentMethod.Treatwell,
        amount: parseFloat(amounts[PaymentMethod.Treatwell]) || 0,
      },
      { method: PaymentMethod.GiftCard, amount: parseFloat(amounts[PaymentMethod.GiftCard]) || 0 },
    ];

    if (amounts.others.amount && amounts.others.label.trim()) {
      rawPayments.push({
        method: amounts.others.label.trim(),
        amount: parseFloat(amounts.others.amount) || 0,
      });
    }

    const payments = rawPayments.filter((p) => p.amount > 0);

    if (ticketToEdit && onUpdate) {
      await onUpdate(userId, sessionId, ticketToEdit.id, { payments, isBonus });
    } else {
      await onCreate(userId, sessionId, userName, { payments, isBonus });
    }

    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={false}
      sx={{ '& .MuiDialog-paper': { width: theme.spacing(75), minWidth: theme.spacing(75) } }}
    >
      <DialogTitle sx={{ py: 2, mt: 4 }}>
        <Box
          width={520}
          height={56}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          bgcolor={theme.palette.secondary.dark}
          p={1}
          borderRadius={2}
          mx="auto"
        >
          <Typography variant="h3">
            {ticketToEdit
              ? t('dashboard.user_card.edit_ticket_modal.title')
              : t('dashboard.user_card.add_ticket_modal.title')}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={userImage} sx={{ width: 40, height: 40 }} />
            <Typography fontSize={theme.typography.h4.fontSize}>{userName}</Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 0, pt: 3, pb: 2 }}>
        <Box width={504} mx="auto">
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Typography variant="h5" fontWeight={theme.typography.fontWeightBold}>
              {t('dashboard.user_card.add_ticket_modal.sub_title')}
            </Typography>
          </Box>

          <Box display="flex" gap={4} mb={2}>
            <PaymentInput
              label={t('dashboard.user_card.add_ticket_modal.cash')}
              value={amounts[PaymentMethod.Cash]}
              onChange={(val) => handleAmountChange(PaymentMethod.Cash, val)}
            />
            <PaymentInput
              label={t('dashboard.user_card.add_ticket_modal.card')}
              value={amounts[PaymentMethod.Card]}
              onChange={(val) => handleAmountChange(PaymentMethod.Card, val)}
            />
          </Box>

          <Box display="flex" gap={4} mb={2}>
            <PaymentInput
              label={t('dashboard.user_card.add_ticket_modal.treatwell')}
              value={amounts[PaymentMethod.Treatwell]}
              onChange={(val) => handleAmountChange(PaymentMethod.Treatwell, val)}
            />
            <PaymentInput
              label={t('dashboard.user_card.add_ticket_modal.gift_card')}
              value={amounts[PaymentMethod.GiftCard]}
              onChange={(val) => handleAmountChange(PaymentMethod.GiftCard, val)}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={2.8} flex={1} mb={2}>
            <Typography width={80} variant="body1">
              {t('dashboard.user_card.add_ticket_modal.others')}
            </Typography>

            <TextField
              type="text"
              placeholder="e.g. MobilePay"
              value={amounts.others.label}
              onChange={(e) =>
                setAmounts((prev) => ({
                  ...prev,
                  others: { ...prev.others, label: e.target.value },
                }))
              }
              sx={{
                width: 270,
                fontSize: theme.typography.body1.fontSize,
                '& input': {
                  fontSize: theme.typography.body1.fontSize,
                },
              }}
            />

            <TextField
              type="number"
              placeholder="00.00"
              value={amounts.others.amount}
              onChange={(e) =>
                setAmounts((prev) => ({
                  ...prev,
                  others: { ...prev.others, amount: sanitizeAmount(e.target.value) },
                }))
              }
              onKeyDown={handleNumberInputKeyDown}
              sx={{
                width: 154,
                fontSize: theme.typography.body1.fontSize,
                '& input': {
                  fontSize: theme.typography.body1.fontSize,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                },
              }}
            />
          </Box>

          <Box mt={3} display="flex" alignItems="center" gap={2}>
            <Typography variant="h5" fontWeight="bold">
              {t('dashboard.user_card.add_ticket_modal.bonus_button')}
            </Typography>

            <Switch
              checked={isBonus}
              onChange={(e) => setIsBonus(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.custom.colors.pink,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.custom.colors.pink,
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-start', px: 0, pb: 5 }}>
        <Box width={504} display="flex" gap={2} mx="auto">
          <Button
            onClick={handleClose}
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
              border: `0.5px solid ${theme.palette.text.primary}`,
              '&:hover': {
                backgroundColor: theme.palette.secondary.light,
              },
              fontSize: theme.typography.body1.fontSize,
            }}
          >
            {t('dashboard.user_card.add_ticket_modal.cancel_button')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: theme.custom.colors.pink,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
              fontSize: theme.typography.body1.fontSize,
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('dashboard.user_card.add_ticket_modal.save_button')
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
