'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  IconButton,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { sanitizeAmount } from '@/utils/sanitizeAmount';
import { useTranslate } from '@/locales/hooks/useTranslate';
import { UserPayload } from '@/types/user';
import { useGetAllAvatarsQuery, useUpdateAvatarStatusMutation } from '@/app/store/secureApiSlice';
import AvatarsModal from './AvatarsModal';
import { ModalMode } from '@/types/modalMode';

const DATE_FORMAT = 'YYYY-MM-DD';
type Avatar = {
  id: string;
  url: string;
};

type FormData = {
  id?: string;
  name: string;
  phone: string;
  dob: string;
  address: string;
  basicSalaryRate: string;
  ticketBonusRate: string;
  dailyBonusMinThreshold: string;
  image: string;
};

type FieldComponent = ComponentType<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string;
}>;

function PersonalInfoField({
  label,
  value,
  onChange,
  disabled,
  errorMessage,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string;
}) {
  const theme = useTheme();
  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!errorMessage}
      helperText={errorMessage}
      fullWidth
      slotProps={{
        inputLabel: { shrink: true },
        input: {
          readOnly: disabled,
        },
      }}
      sx={{ minWidth: theme.spacing(25), maxWidth: theme.spacing(31.5) }}
    />
  );
}

function MoneyField({
  label,
  value,
  onChange,
  disabled,
  errorMessage,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string;
}) {
  const theme = useTheme();
  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(sanitizeAmount(e.target.value))}
      placeholder="00.00"
      type="number"
      error={!!errorMessage}
      helperText={errorMessage}
      fullWidth
      sx={{ minWidth: theme.spacing(25), maxWidth: theme.spacing(31.5) }}
      slotProps={{
        input: {
          readOnly: disabled,
          startAdornment: (
            <InputAdornment
              position="start"
              sx={{ color: theme.palette.text.primary, marginRight: '-8px' }}
            >
              €
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

function DobField({
  value,
  onChange,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={(date) => onChange(date ? date.format(DATE_FORMAT) : '')}
        disableOpenPicker={disabled}
        slotProps={{
          textField: {
            fullWidth: true,
            InputLabelProps: { shrink: true },
            inputProps: { readOnly: disabled },
            sx: { minWidth: theme.spacing(25), maxWidth: theme.spacing(31.5) },
          },
        }}
      />
    </LocalizationProvider>
  );
}

function BonusField({
  value,
  onChange,
  label,
  disabled,
  errorMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  errorMessage?: string;
}) {
  const theme = useTheme();
  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(sanitizeAmount(e.target.value))}
      placeholder="00"
      type="number"
      error={!!errorMessage}
      helperText={errorMessage}
      fullWidth
      sx={{ minWidth: theme.spacing(25), maxWidth: theme.spacing(31.5) }}
      slotProps={{
        inputLabel: { shrink: true },
        input: {
          readOnly: disabled,
          endAdornment: (
            <InputAdornment position="start" sx={{ color: theme.palette.text.secondary }}>
              %
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: UserPayload) => Promise<void>;
  isLoading: boolean;
  initialData?: UserPayload | null;
  mode: ModalMode;
}

export default function AddUserModal({
  open,
  onClose,
  onSave,
  isLoading,
  mode,
  initialData,
}: AddUserModalProps) {
  const theme = useTheme();
  const { t } = useTranslate();
  const { data: avatars = [], refetch: refetchAvatars } = useGetAllAvatarsQuery();
  const [updateAvatarStatus] = useUpdateAvatarStatusMutation();

  const getInitialFormData = (initialData?: UserPayload | null): FormData => ({
    id: initialData?.id,
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    dob: initialData?.dob || '',
    address: initialData?.address || '',
    basicSalaryRate: initialData?.basicSalaryRate?.toString() || '',
    ticketBonusRate: initialData?.ticketBonusRate?.toString() || '',
    dailyBonusMinThreshold: initialData?.dailyBonusMinThreshold?.toString() || '',
    image: initialData?.image || '',
  });

  const validateForm = useCallback(
    (data: FormData) => {
      const errors: Record<string, string> = {};

      if (!data.name.trim()) {
        errors.name = t('name_is_required');
      }

      if (!data.basicSalaryRate.trim()) {
        errors.basicSalaryRate = t('basic_salary_is_required');
      }

      if (!data.ticketBonusRate.trim()) {
        errors.ticketBonusRate = t('shared_bonus_rate_is_required');
      }

      if (!data.dailyBonusMinThreshold.trim()) {
        errors.dailyBonusMinThreshold = t('daily_bonus_threshold_is_required');
      }

      setFormErrors(errors);
      return errors;
    },
    [t]
  );

  useEffect(() => {
    if (!initialData) return;

    const initial = getInitialFormData(initialData);
    setFormData(initial);
    validateForm(initial);
  }, [initialData, mode, validateForm]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    dob: '',
    address: '',
    basicSalaryRate: '',
    ticketBonusRate: '',
    dailyBonusMinThreshold: '',
    image: '',
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleChange = <K extends keyof FormData>(field: K, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    validateForm(updatedData);
  };

  const handleSelectAvatar = (url: string) => {
    handleChange('image', url);
    setIsAvatarModalOpen(false);
  };

  const handleSave = async () => {
    if (!onSave) return;

    await onSave(formData);

    const selectedAvatar = avatars.find((avatar) => avatar.url === formData.image);
    if (selectedAvatar?.id) {
      await updateAvatarStatus({ avatarId: selectedAvatar.id, isTaken: true });
    }

    await refetchAvatars();
    resetFormData();
    onClose();
  };

  const handleClose = () => {
    resetFormData();
    onClose();
  };

  const isFormValid = () => {
    const hasRequiredFields =
      formData.name.trim() !== '' &&
      formData.basicSalaryRate.trim() !== '' &&
      formData.ticketBonusRate.trim() !== '' &&
      formData.dailyBonusMinThreshold.trim() !== '';

    const hasNoErrors = Object.keys(formErrors).length === 0;

    return hasRequiredFields && hasNoErrors;
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      phone: '',
      dob: '',
      address: '',
      basicSalaryRate: '',
      ticketBonusRate: '',
      dailyBonusMinThreshold: '',
      image: '',
    });
  };

  const fields: {
    component: FieldComponent;
    label: string;
    field: keyof FormData;
  }[] = [
    { component: PersonalInfoField, label: t('full_name'), field: 'name' },
    { component: PersonalInfoField, label: t('phone_number'), field: 'phone' },
    { component: DobField, label: t('date_of_birth'), field: 'dob' },
    { component: PersonalInfoField, label: t('address'), field: 'address' },
    { component: MoneyField, label: t('basic_salary_per_hour'), field: 'basicSalaryRate' },
    { component: BonusField, label: t('shared_bonus_rate'), field: 'ticketBonusRate' },
    {
      component: MoneyField,
      label: t('limit_to_earn_a_daily_bonus'),
      field: 'dailyBonusMinThreshold',
    },
  ];

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          pt: theme.spacing(4.5),
          pb: 1,
        }}
      >
        <Typography variant="h3" component="span" margin={1}>
          {mode === ModalMode.Add && t('add_employee')}
          {mode === ModalMode.Edit && t('edit_employee')}
          {mode === ModalMode.View && t('view_employee')}
        </Typography>
        <IconButton onClick={handleClose} aria-label="Close" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={1}>
          <Avatar
            src={formData.image || undefined}
            sx={{ width: 80, height: 80, bgcolor: theme.palette.secondary.main }}
          />

          {(mode === ModalMode.Add || mode === ModalMode.Edit) && (
            <Box display="flex" justifyContent="center" gap={2} mb={4} flexWrap="wrap">
              <Button
                variant="contained"
                size="xxxlarge"
                startIcon={<AddPhotoAlternateIcon fontSize="small" />}
                onClick={() => setIsAvatarModalOpen(true)}
                sx={{
                  backgroundColor: theme.custom.colors.pink,
                  color: theme.palette.text.primary,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('select_avatar')}
              </Button>

              <Button
                variant="contained"
                size="xxxlarge"
                startIcon={<DeleteOutlineIcon fontSize="small" />}
                onClick={() => handleChange('image', '')}
                disabled={!formData.image}
                sx={{
                  backgroundColor: theme.palette.secondary.light,
                  color: theme.palette.text.primary,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('remove_avatar')}
              </Button>
            </Box>
          )}

          <Box display="flex" flexWrap="wrap" gap={2} px={2} justifyContent="flex-start">
            {fields.map(({ component: Component, label, field }) => (
              <Component
                key={field}
                label={label}
                value={formData[field] || ''}
                onChange={(value: string) => handleChange(field, value)}
                disabled={mode === ModalMode.View}
                errorMessage={formErrors[field]}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, paddingBottom: theme.spacing(4.5) }}>
        <Button
          onClick={handleClose}
          variant="contained"
          size="medium"
          disabled={isLoading}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.secondary.light,
            },
          }}
        >
          {mode === ModalMode.View ? t('close') : t('cancel')}
        </Button>

        {mode !== ModalMode.View && (
          <Button
            onClick={handleSave}
            variant="contained"
            size="medium"
            disabled={!isFormValid() || isLoading}
            sx={{
              backgroundColor: theme.custom.colors.pink,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : t('save')}
          </Button>
        )}
      </DialogActions>
      <AvatarsModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleSelectAvatar}
        avatars={avatars}
      />
    </Dialog>
  );
}
