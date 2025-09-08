'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Divider,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { theme } from '@/theme/theme';

interface BonusRowProps {
  label: string;
  value: number;
  boldLabel?: boolean;
  highlight?: boolean;
}

function BonusRow({ label, value, boldLabel = false, highlight }: BonusRowProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
      <Typography fontWeight={boldLabel ? 'bold' : 500}>{label}</Typography>
      <TextField
        value={value.toFixed(2)}
        sx={{ width: 120, borderRadius: 1 }}
        slotProps={{
          input: {
            readOnly: true,
            sx: {
              fontWeight: boldLabel ? 'bold' : 500,
              textAlign: 'right',
              backgroundColor: highlight
                ? theme.palette.secondary.dark
                : theme.palette.secondary.main,
              color: theme.palette.text.primary,
            },
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          },
        }}
      />
    </Stack>
  );
}

interface ViewBonusModalProps {
  open: boolean;
  onClose: () => void;
  totalSharedBonus: number;
  totalDailyBonus: number;
  totalBonus: number;
}

export default function ViewBonusModal({
  open,
  onClose,
  totalSharedBonus,
  totalDailyBonus,
  totalBonus,
}: ViewBonusModalProps) {
  const { t } = useTranslate();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          px: 2,
          pt: 4,
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            mr: 2,
            width: 40,
            height: 40,
            borderRadius: 2,
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
          px: 4,
          pt: 4,
        }}
      >
        {t('dashboard.stat_card.total_bonus.view_modal_title')}
      </DialogTitle>

      <DialogContent sx={{ p: 4, mb: 4 }}>
        <Stack spacing={2} sx={{ pt: 3 }}>
          <BonusRow
            label={t('dashboard.stat_card.total_bonus.shared_bonus')}
            value={totalSharedBonus}
          />
          <BonusRow
            label={t('dashboard.stat_card.total_bonus.daily_bonus')}
            value={totalDailyBonus}
          />
          <Divider sx={{ my: 1 }} />
          <BonusRow
            label={t('dashboard.stat_card.total_bonus.total_bonus')}
            value={totalBonus}
            boldLabel
            highlight
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
