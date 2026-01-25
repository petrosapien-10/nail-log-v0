'use client';

import React, { memo } from 'react';
import { Avatar, Box, Button, Card, CircularProgress, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { UserWithSession } from '@/types/user';
import { TimeEditType } from '@/types/timeEdit';
import { useTranslate } from '../../../locales/hooks/useTranslate';
import StarIcon from '@mui/icons-material/Star';
import { useTheme } from '@mui/material/styles';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

const TIME_LABEL_MAP: Record<TimeEditType, string> = {
  [TimeEditType.CheckIn]: 'Check-in',
  [TimeEditType.CheckOut]: 'Check-out',
};

function DeleteButton({ onClick }: { onClick?: () => void }) {
  const theme = useTheme();
  return (
    <IconButton
      onClick={onClick}
      edge="end"
      aria-label="delete"
      sx={{
        width: 32,
        height: 32,
        borderRadius: '4px',
        backgroundColor: theme.custom.colors.slateLight,
        border: `1px solid ${theme.custom.colors.darkGrey}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        '&:hover': {
          backgroundColor: theme.custom.colors.grey,
          borderColor: theme.custom.colors.slate,
        },
      }}
    >
      <DeleteOutlinedIcon fontSize="medium" />
    </IconButton>
  );
}

function IncomeBox({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: number;
  highlighted?: boolean;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flexDirection: 'column',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: theme.spacing(16),
        height: theme.spacing(10),
        borderRadius: '8px',
        paddingTop: '4px',
        paddingRight: '4px',
        paddingLeft: '4px',
        gap: '4px',
        backgroundColor: theme.custom.colors.slateLight,
        border: highlighted 
          ? `2px solid ${theme.custom.colors.yellow}` 
          : `1px solid ${theme.custom.colors.darkGrey}`,
        boxShadow: highlighted ? '0 2px 8px rgba(249, 203, 35, 0.2)' : 'none',
      }}
    >
      <Typography
        sx={{ fontSize: theme.typography.h5.fontSize, color: theme.palette.text.primary }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: theme.typography.h3.fontSize,
          fontWeight: theme.typography.h3.fontWeight,
          color: value !== 0 ? theme.palette.text.primary : theme.palette.text.secondary,
        }}
      >
        € {value.toFixed(2).padStart?.(5, '0')}
      </Typography>
    </Box>
  );
}

function TimeBox({
  isReadOnly,
  label,
  time,
  originalTime,
  onEdit,
}: {
  label: TimeEditType;
  time: string;
  originalTime?: string;
  onEdit?: () => void;
  isReadOnly: boolean;
}) {
  const theme = useTheme();
  const isCheckIn = label === TimeEditType.CheckIn;

  const isEdited = !isCheckIn && originalTime !== undefined && time !== originalTime;
  const fontWeight = isCheckIn || isEdited ? 'bold' : 'normal';
  const color = isCheckIn || isEdited ? theme.palette.text.primary : theme.palette.text.secondary;

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      width={theme.spacing(16)}
      height={theme.spacing(10)}
      borderRadius={1}
      gap={1}
    >
      <Box width="100%" display="flex" justifyContent="center" alignItems="center">
        <Typography
          sx={{ fontSize: theme.typography.h5.fontSize, color: theme.palette.text.primary }}
        >
          {TIME_LABEL_MAP[label]}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
        <Typography sx={{ fontSize: theme.typography.h5.fontSize, fontWeight, color }}>
          {time}
        </Typography>
        {!isReadOnly && (
          <IconButton size="small" sx={{ padding: '2px' }} onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

interface Props {
  isToday: boolean;
  isReadOnly: boolean;
  data: UserWithSession;
  onAddTicket?: () => void;
  onViewTickets: () => void;
  onCheckOut?: () => void;
  isCheckingOut?: boolean;
  onEditTime?: (type: TimeEditType) => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onDeleteSession?: () => void;
}

const UserCard = ({
  isToday,
  isReadOnly,
  data,
  onAddTicket,
  onViewTickets,
  onCheckOut,
  isCheckingOut,
  onEditTime,
  isAdmin,
  isAuthenticated,
  onDeleteSession,
}: Props) => {
  const { session, ...user } = data;
  const { t } = useTranslate();
  const theme = useTheme();

  return (
    <Card
      sx={{
        py: 3,
        borderRadius: 4,
        width: '100%',
        maxWidth: theme.spacing(52),
        minHeight: theme.spacing(47),
        backgroundColor: theme.palette.common.white,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: `1px solid ${theme.custom.colors.darkGrey}`,
        mx: 'auto',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Avatar + Name + staricon + deleteicon*/}
      <Box display="flex" alignItems="center" justifyContent="space-between" px={6}>
        {/* Left side: avatar + name + star */}
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar src={user.image} sx={{ width: 64, height: 64 }} />

          <Typography variant="h2" fontWeight={400}>
            {user.name}
          </Typography>

          {session.dailyBonusIncome > 0 && <StarIcon fontSize="large" sx={{ color: '#F9CB23' }} />}
        </Box>

        {/* Right side: delete button */}
        {isAdmin && isAuthenticated && <DeleteButton onClick={onDeleteSession} />}
      </Box>

      {/* Income Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        minHeight="80px"
        p={1}
        gap={1}
      >
        <IncomeBox label={t('dashboard.user_card.basic_income')} value={session.basicIncome} />
        <IncomeBox label={t('dashboard.user_card.shard_bonus')} value={session.ticketBonusIncome} />
        <IncomeBox
          label={t('dashboard.user_card.daily_bonus')}
          value={session.dailyBonusIncome}
          highlighted={session.dailyBonusIncome > 0}
        />
      </Box>

      {/* Time Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        minHeight={theme.spacing(10)}
        pl={1}
        pr={1}
      >
        <TimeBox
          isReadOnly={isReadOnly}
          label={TimeEditType.CheckIn}
          time={session.checkIn}
          onEdit={() => onEditTime?.(TimeEditType.CheckIn)}
        />

        <TimeBox
          label={TimeEditType.CheckOut}
          time={session.checkOut || '00:00'}
          originalTime="00:00"
          onEdit={() => onEditTime?.(TimeEditType.CheckOut)}
          isReadOnly={isReadOnly}
        />
      </Box>

      {/* Buttons */}
      <Box display="flex" justifyContent="center" alignItems="center" gap="24px" flexWrap="wrap">
        <Button
          variant="contained"
          size="large"
          disabled={isReadOnly}
          sx={{
            minWidth: 96,
            maxWidth: 128,
            height: 40,
            maxHeight: 40,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            backgroundColor: theme.custom.colors.pink,
            color: theme.palette.text.primary,
          }}
          onClick={onAddTicket}
        >
          {t('dashboard.user_card.add_ticket_button')}
        </Button>

        <Button
          variant="contained"
          size="large"
          sx={{
            minWidth: 96,
            maxWidth: 128,
            height: 40,
            maxHeight: 40,
            fontSize: theme.typography.body1.fontSize,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            backgroundColor: theme.custom.colors.slateLight,
            color: theme.custom.colors.slateDeep,
            fontWeight: 500,
            '&:hover': {
              backgroundColor: theme.custom.colors.grey,
            },
          }}
          onClick={onViewTickets}
        >
          {t('dashboard.user_card.view_tickets_button')}
        </Button>

        <Button
          variant="contained"
          size="large"
          sx={{
            minWidth: 96,
            maxWidth: 128,
            height: 40,
            maxHeight: 40,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: theme.typography.body1.fontSize,
            backgroundColor: theme.custom.colors.mint,
            color: theme.palette.text.primary,
          }}
          onClick={onCheckOut}
          disabled={isCheckingOut || !isToday}
        >
          {isCheckingOut ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            t('dashboard.user_card.check_out_button')
          )}
        </Button>
      </Box>
    </Card>
  );
};

UserCard.displayName = 'UserCard';

export default memo(UserCard);
