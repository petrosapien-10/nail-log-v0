import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import HomeIcon from '@mui/icons-material/Home';
import { useTheme } from '@mui/material/styles';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { User } from '@/types/user';

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function formatFieldValue(value: string | undefined | null): string {
  return value && value.trim() !== '' ? value : '--';
}

function InfoField({ icon, value }: { icon: React.ReactNode; value: string }) {
  const theme = useTheme();
  return (
    <Box display="flex" alignItems="center" gap={1}>
      {icon}
      <Box
        sx={{
          borderRadius: 2,
          px: 1,
          pt: 1,
          flex: 1,
          textAlign: 'left',
          minHeight: theme.spacing(5),
          backgroundColor: theme.custom.colors.slateLight,
        }}
      >
        <Typography>{value}</Typography>
      </Box>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography>{label}</Typography>
      <Box
        sx={{
          borderRadius: 2,
          px: 1,
          py: 1,
          maxWidth: theme.spacing(15),
          minWidth: theme.spacing(8.75),
          minHeight: theme.spacing(5),
          textAlign: 'left',
          backgroundColor: theme.custom.colors.slateLight,
        }}
      >
        <Typography>{value}</Typography>
      </Box>
    </Box>
  );
}

interface ProfileCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function ProfileCard({ user, onEdit, onDelete }: ProfileCardProps) {
  const theme = useTheme();
  const { t } = useTranslate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(user);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(user);
    handleMenuClose();
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        maxWidth: theme.spacing(37),
        width: '100%',
        backgroundColor: theme.palette.common.white,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={user.image} sx={{ width: 40, height: 40 }} />
          <Typography variant="h4">{user.name}</Typography>
        </Box>
        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreHorizIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('edit')} />
          </MenuItem>

          <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <DeleteOutlineIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
            </ListItemIcon>
            <ListItemText primary={t('delete')} />
          </MenuItem>
        </Menu>
      </Box>

      <Box display="flex" flexDirection="column" gap={1}>
        <InfoField icon={<PhoneIcon fontSize="small" />} value={formatFieldValue(user.phone)} />
        <InfoField
          icon={<CakeIcon fontSize="small" />}
          value={formatFieldValue(formatDate(user.dob))}
        />
        <InfoField icon={<HomeIcon fontSize="small" />} value={formatFieldValue(user.address)} />
      </Box>

      <Box display="flex" flexDirection="column" gap={1}>
        <InfoRow
          label={t('basic_salary_per_hour')}
          value={`€ ${user.basicSalaryRate.toFixed(2)}`}
        />
        <InfoRow
          label={t('shared_bonus_rate_2')}
          value={`${(user.ticketBonusRate * 100).toFixed(2)} %`}
        />
        <InfoRow
          label={t('limit_to_earn_a_daily_bonus_2')}
          value={`€ ${user.dailyBonusMinThreshold}`}
        />
      </Box>
    </Card>
  );
}
