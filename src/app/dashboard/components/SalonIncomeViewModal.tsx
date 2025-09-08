'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { useTheme } from '@mui/material/styles';

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

const IncomeRow = ({
  label,
  value,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
}) => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
      <Typography fontWeight={bold ? 'bold' : 500} fontSize={highlight ? '1rem' : '0.875rem'}>
        {label}
      </Typography>
      <TextField
        value={value.toFixed(2)}
        sx={{ width: 120, borderRadius: 1 }}
        slotProps={{
          input: {
            readOnly: true,
            sx: {
              fontSize: highlight ? '1rem' : '0.875rem',
              fontWeight: bold ? 'bold' : 500,
              textAlign: 'right',
              backgroundColor: highlight
                ? theme.palette.secondary.dark
                : theme.palette.secondary.main,
            },
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          },
        }}
      />
    </Stack>
  );
};

export default function SalonIncomeViewModal({ open, onClose, data }: Props) {
  const { t } = useTranslate();
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{ '& .MuiDialog-paper': { width: '520px', height: '800px' } }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          px: 6,
          pt: 4,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            mr: 0.2,
            backgroundColor: theme.palette.secondary.dark,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogTitle
        variant="h3"
        fontWeight="bold"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 6,
          pt: 3,
        }}
      >
        {t('dashboard.stat_card.salon_income.modal_title')}
      </DialogTitle>

      <DialogContent sx={{ px: 6, py: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mt: 4, mb: 1 }}>
          {t('dashboard.stat_card.salon_income.payment_methods')}
        </Typography>

        <Stack spacing={2}>
          <IncomeRow label={t('dashboard.stat_card.salon_income.cash')} value={data.cash} />
          <IncomeRow label={t('dashboard.stat_card.salon_income.card')} value={data.card} />
          <IncomeRow
            label={t('dashboard.stat_card.salon_income.treatwell')}
            value={data.treatwell}
          />
          <IncomeRow
            label={t('dashboard.stat_card.salon_income.gift_card')}
            value={data.giftCard}
          />
          <IncomeRow label={t('dashboard.stat_card.salon_income.others')} value={data.others} />

          <Divider sx={{ my: 1 }} />

          <IncomeRow
            label={t('dashboard.stat_card.salon_income.total_income')}
            value={data.allTicketsValue}
            bold
            highlight
          />
          <IncomeRow
            label={t('dashboard.stat_card.salon_income.total_shared_bonus')}
            value={data.totalSharedBonus}
            bold
            highlight
          />
          <IncomeRow
            label={t('dashboard.stat_card.salon_income.total_daily_bonus')}
            value={data.totalDailyBonus}
            bold
            highlight
          />
          <IncomeRow
            label={t('dashboard.stat_card.salon_income.total_expenses')}
            value={data.totalExpenses}
            bold
            highlight
          />
          <IncomeRow
            label={t('dashboard.stat_card.salon_income.total_salon_income')}
            value={data.totalSalonIncome}
            bold
            highlight
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
