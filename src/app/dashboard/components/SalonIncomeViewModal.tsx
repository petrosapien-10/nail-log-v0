'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { alpha, useTheme } from '@mui/material/styles';

interface Props {
  open: boolean;
  onClose: () => void;
  data: {
    cash: number;
    card: number;
    treatwell: number;
    giftCard: number;
    others: number;
    allTicketsValue: number;
    totalSharedBonus: number;
    totalDailyBonus: number;
    totalExpenses: number;
    totalSalonIncome: number;
  };
}

const SalonIncomeViewModal = React.memo(({ open, onClose, data }: Props) => {
  const { t } = useTranslate();
  const theme = useTheme();

  const paymentTotal = data.cash + data.card + data.treatwell + data.giftCard + data.others || 0;

  const paymentMethods = [
    {
      key: 'cash',
      label: t('cash'),
      value: data.cash,
      color: theme.palette.success.main,
    },
    {
      key: 'card',
      label: t('card'),
      value: data.card,
      color: theme.custom.colors.cardAccent,
    },
    {
      key: 'treatwell',
      label: t('treatwell'),
      value: data.treatwell,
      color: theme.palette.info.main,
    },
    {
      key: 'giftCard',
      label: t('gift_cards'),
      value: data.giftCard,
      color: theme.palette.warning.main,
    },
    {
      key: 'others',
      label: t('others'),
      value: data.others,
      color: theme.palette.primary.main,
    },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const PaymentCard = ({
    label,
    value,
    percent,
    color,
  }: {
    label: string;
    value: number;
    percent: number;
    color: string;
  }) => (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: theme.custom.surfaces.payment.borderColor,
        background: `linear-gradient(120deg, ${alpha(color, theme.custom.surfaces.payment.bgStartOpacity)} 0%, ${alpha(
          theme.custom.colors.slateLight,
          theme.custom.surfaces.payment.bgEndOpacity
        )} 100%)`,
      }}
    >
      <CardContent sx={{ py: 1.75, px: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={600} color={theme.palette.text.secondary}>
              {label}
            </Typography>
            <Chip
              size="small"
              label={`${percent.toFixed(1)}%`}
              sx={{
                backgroundColor: alpha(color, theme.custom.surfaces.payment.chipBgOpacity),
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            />
          </Stack>
          <Typography variant="h6" fontWeight={700} color={theme.palette.text.primary}>
            € {formatCurrency(value)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  const BalanceCard = () => (
    <Card
      variant="outlined"
      sx={{
        backgroundColor: theme.custom.surfaces.balance.backgroundColor,
        borderColor: alpha(theme.palette.text.primary, theme.custom.surfaces.balance.borderOpacity),
      }}
    >
      <CardContent sx={{ py: 2, px: 2.25 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={700} color={theme.palette.text.secondary}>
              {t('total_takings')}
            </Typography>
            <Typography variant="h6" fontWeight={800} color={theme.palette.text.primary}>
              € {formatCurrency(data.allTicketsValue)}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={0.75}>
            {[
              {
                label: t('shared_bonus'),
                value: data.totalSharedBonus,
              },
              {
                label: t('daily_bonus'),
                value: data.totalDailyBonus,
              },
              {
                label: t('expenses'),
                value: data.totalExpenses,
              },
            ].map((row) => (
              <Stack
                key={row.label}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ color: theme.palette.text.secondary }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {row.label}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  − € {formatCurrency(row.value)}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {(() => {
            const netColor =
              data.totalSalonIncome >= 0 ? theme.palette.success.main : theme.palette.error.main;
            return (
              <Box
                sx={{
                  borderRadius: 1.5,
                  background: `linear-gradient(135deg, ${alpha(
                    netColor,
                    theme.custom.surfaces.balance.netBgStartOpacity
                  )} 0%, ${alpha(
                    theme.custom.colors.slateLight,
                    theme.custom.surfaces.balance.netBgEndOpacity
                  )} 100%)`,
                  border: `1px solid ${alpha(netColor, theme.custom.surfaces.balance.netBorderOpacity)}`,
                  px: 1.75,
                  py: 1.1,
                  mt: 0.5,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={900} color={netColor}>
                    {t('net_income')}
                  </Typography>
                  <Chip
                    size="medium"
                    label={`€ ${formatCurrency(data.totalSalonIncome)}`}
                    sx={{
                      backgroundColor: alpha(
                        netColor,
                        theme.custom.surfaces.balance.netChipBgOpacity
                      ),
                      color: netColor,
                      fontWeight: 800,
                      px: 0.5,
                    }}
                  />
                </Stack>
              </Box>
            );
          })()}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          width: { xs: '90vw', sm: 520 },
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        variant="h3"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          pt: 3,
          pb: 1,
        }}
      >
        {t('income_overview')}
        <IconButton onClick={onClose} aria-label="Close" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4 }}>
        <Stack spacing={3}>
          <Stack spacing={1.5}>
            <Typography variant="overline" color={theme.palette.text.secondary} fontWeight={700}>
              {t('payment_breakdown')}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },
                gap: 1.5,
              }}
            >
              {paymentMethods.map((method) => {
                const percent = paymentTotal ? (method.value / paymentTotal) * 100 : 0;

                return (
                  <PaymentCard
                    key={method.key}
                    label={method.label}
                    value={method.value}
                    percent={percent}
                    color={method.color}
                  />
                );
              })}
            </Box>
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack spacing={1.5}>
            <Typography variant="overline" color={theme.palette.text.secondary} fontWeight={700}>
              {t('income_summary')}
            </Typography>
            <BalanceCard />
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
});

SalonIncomeViewModal.displayName = 'SalonIncomeViewModal';

export default SalonIncomeViewModal;
