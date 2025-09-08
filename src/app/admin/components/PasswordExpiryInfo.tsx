import { Typography, Box, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import LockIcon from '@mui/icons-material/Lock';
import { useTranslate } from '@/locales/hooks/useTranslate';

dayjs.extend(relativeTime);

const DATE_TIME_FORMAT = 'DD MMM YYYY, HH:mm';

type DashboardSession = {
  success: boolean;
  version: string;
  updatedAt: number;
  expiresAt: number;
  createdAt: { seconds: number; nanoseconds: number };
};

type PasswordExpiryInfoProps = {
  data: DashboardSession;
  isRefreshing?: boolean;
  onRefetch: () => void;
};

export default function PasswordExpiryInfo({ data, isRefreshing }: PasswordExpiryInfoProps) {
  const { t } = useTranslate();

  if (!data?.expiresAt) return null;

  const now = dayjs();
  const expiresAt = dayjs(data.expiresAt);
  const isExpired = now.isAfter(expiresAt);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <LockIcon sx={{ fontSize: 14, mb: 0.4 }} />
      <Typography variant="body1" fontWeight={700} color={isExpired ? 'error' : 'textPrimary'}>
        {isExpired
          ? t('admin.password_set_new_message')
          : `${t('admin.password_expires_message')} ${expiresAt.diff(now, 'hour') < 24 ? expiresAt.fromNow() : expiresAt.format(DATE_TIME_FORMAT)}`}
      </Typography>
      {isRefreshing && <CircularProgress size={14} sx={{ ml: 1 }} />}
    </Box>
  );
}
